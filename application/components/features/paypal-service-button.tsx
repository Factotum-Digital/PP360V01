"use client";

import React from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalServiceButtonProps {
     amount: string;
     description: string;
     onSuccess?: (details: any) => void;
     style?: {
          color?: "gold" | "blue" | "silver" | "white" | "black";
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
                         if (!actions.order) return;
                         const details = await actions.order.capture();
                         alert(`Pago Exitoso por ${details.payer?.name?.given_name}! (ID: ${details.id})`);
                         if (onSuccess) onSuccess(details);
                    }}
                    onError={(err) => {
                         console.error(err);
                         alert("Error en el pago con PayPal.");
                    }}
               />
          </div>
     );
}
