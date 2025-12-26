"use client";

import React from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalServiceButtonProps {
     amount: string;
     description: string;
     ticketId?: string; // For tracking order updates
     onSuccess?: (details: any) => void;
     style?: {
          color?: "gold" | "blue" | "silver" | "white" | "black";
          layout?: "horizontal" | "vertical";
     };
}

export function PayPalServiceButton({ amount, description, ticketId, onSuccess, style = { color: 'black' } }: PayPalServiceButtonProps) {
     return (
          <div className="w-full relative z-0 mt-4">
               <PayPalButtons
                    style={{
                         layout: style.layout || "horizontal",
                         height: 48,
                         tagline: false,
                         shape: "rect",
                         color: style.color
                    }}
                    createOrder={(data, actions) => {
                         return actions.order.create({
                              intent: "CAPTURE",
                              purchase_units: [
                                   {
                                        description: description,
                                        amount: {
                                             currency_code: "USD",
                                             value: amount,
                                        },
                                   },
                              ],
                         });
                    }}
                    onApprove={async (data, actions) => {
                         if (actions.order) {
                              try {
                                   const details = await actions.order.capture();
                                   console.log('[PayPal] Payment captured:', details.id);

                                   // 1. Update order status and proof (if ticketId provided)
                                   const orderTicket = ticketId || description;
                                   if (orderTicket) {
                                        try {
                                             const proofUrl = 'PAYPAL_AUTO_' + details.id;
                                             console.log('[PayPal] Updating order:', orderTicket, proofUrl);

                                             const updateRes = await fetch('/api/orders/upload-proof', {
                                                  method: 'POST',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({
                                                       ticketId: orderTicket,
                                                       proofUrl: proofUrl
                                                  })
                                             });

                                             if (!updateRes.ok) {
                                                  console.error('[PayPal] Upload proof failed:', await updateRes.text());
                                             } else {
                                                  console.log('[PayPal] Order updated successfully');
                                             }
                                        } catch (updateErr) {
                                             console.error('[PayPal] Update error:', updateErr);
                                        }
                                   }

                                   // 2. Execute parent onSuccess (optional extra logic)
                                   if (onSuccess) await onSuccess(details);

                                   // 3. Send Email Notification
                                   try {
                                        await fetch('/api/notify-payment', {
                                             method: 'POST',
                                             headers: { 'Content-Type': 'application/json' },
                                             body: JSON.stringify({
                                                  orderId: details.id,
                                                  email: details.payer?.email_address,
                                                  amount: amount,
                                                  ticketId: orderTicket || 'N/A',
                                                  concept: description
                                             })
                                        });
                                   } catch (notifyError) {
                                        console.error('Notification Failed:', notifyError);
                                   }

                              } catch (error) {
                                   console.error("PayPal Capture Error:", error);
                              }
                         }
                    }}
                    onError={(err) => {
                         console.error(err);
                         alert("Error en el pago con PayPal.");
                    }}
               />
          </div>
     );
}

