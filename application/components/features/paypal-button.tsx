"use client";

import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { createClient } from '@/lib/supabase/client';

interface PayPalPaymentButtonProps {
     amount: string;
     orderId: string;
     onSuccess: () => void;
}

export function PayPalPaymentButton({ amount, orderId, onSuccess }: PayPalPaymentButtonProps) {
     const supabase = createClient();

     // Configuración de PayPal Sandbox con credenciales del usuario
     const initialOptions = {
          clientId: "ASnBkn_GjnLjxVByY7C75333lyRQlZ8iOSLsHfPgSS7QfuXI2V-uPE0DYYFED5olmz7FfCyh3xsYvGgU",
          currency: "USD",
          intent: "capture",
     };

     return (
          <div className="w-full relative z-0">
               <PayPalScriptProvider options={initialOptions}>
                    <PayPalButtons
                         style={{ layout: "vertical", shape: "rect", label: "pay" }}
                         createOrder={(data, actions) => {
                              return actions.order.create({
                                   intent: "CAPTURE",
                                   purchase_units: [
                                        {
                                             reference_id: orderId,
                                             amount: {
                                                  currency_code: "USD",
                                                  value: amount,
                                             },
                                             description: `Order ${orderId}`,
                                        },
                                   ],
                              });
                         }}
                         onApprove={async (data, actions) => {
                              if (!actions.order) return;
                              
                              try {
                                   const details = await actions.order.capture();
                                   const payerName = details.payer?.name?.given_name;
                                   
                                   // Actualizar orden en Supabase tras el éxito
                                   const { error } = await supabase
                                        .from('exchange_orders')
                                        .update({ 
                                             status: 'VERIFYING',
                                             // Guardamos el ID de transacción de PayPal como prueba
                                             payment_proof_url: `PAYPAL_SANDBOX_TX_${details.id}` 
                                        })
                                        .eq('ticket_id', orderId);

                                   if (error) throw error;
                                   
                                   console.log(`Transaction completed by ${payerName}`);
                                   onSuccess();
                              } catch (error) {
                                   console.error("Error capturing order:", error);
                                   alert("hubo un error al procesar el pago. Por favor contacta a soporte.");
                              }
                         }}
                         onError={(err) => {
                              console.error("PayPal Error:", err);
                              alert("Error con PayPal. Intenta nuevamente.");
                         }}
                    />
               </PayPalScriptProvider>
          </div>
     );
}
