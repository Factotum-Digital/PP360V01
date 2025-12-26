"use client";

import React from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalServiceButtonProps {
     amount: string;
     description: string;
     onSuccess?: (details: any) => void;
     style?: {
          color?: "gold" | "blue" | "silver" | "white" | "black";
          layout?: "horizontal" | "vertical";
     };
}

export function PayPalServiceButton({ amount, description, onSuccess, style = { color: 'black' } }: PayPalServiceButtonProps) {
     return (
          <div className="w-full relative z-0 mt-4">
               <PayPalButtons
                    style={{
                         layout: "horizontal",
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
                                   // 1. Execute parent onSuccess logic (DB Update)
                                   if (onSuccess) await onSuccess(details);

                                   // 2. Send Email Notification
                                   try {
                                        await fetch('/api/notify-payment', {
                                             method: 'POST',
                                             headers: { 'Content-Type': 'application/json' },
                                             body: JSON.stringify({
                                                  orderId: details.id,
                                                  email: details.payer?.email_address,
                                                  amount: amount,
                                                  ticketId: description || 'N/A', // Using description field for simplicity or pass specific prop
                                                  concept: description
                                             })
                                        });
                                   } catch (notifyError) {
                                        console.error('Notification Failed:', notifyError);
                                        // Non-blocking error
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
