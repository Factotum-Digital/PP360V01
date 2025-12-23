"use server";

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Generar ticket ID único
function generateTicketId(): string {
     const prefix = "P360";
     const random = Math.floor(1000 + Math.random() * 9000);
     return `${prefix}-${random}`;
}

export async function POST(request: NextRequest) {
     try {
          const body = await request.json();

          const {
               usdAmount,
               vesAmount,
               rate,
               email,
               bank,
               idNumber,
               phone,
               whatsapp
          } = body;

          // Validaciones del servidor
          if (!email || !idNumber || !phone || !whatsapp) {
               return NextResponse.json(
                    { error: "Todos los campos son obligatorios" },
                    { status: 400 }
               );
          }

          if (usdAmount < 10) {
               return NextResponse.json(
                    { error: "El monto mínimo es $10 USD" },
                    { status: 400 }
               );
          }

          // Validar formato de email
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
               return NextResponse.json(
                    { error: "Email no válido" },
                    { status: 400 }
               );
          }

          // Validar formato de teléfono venezolano
          const phoneRegex = /^04\d{9}$/;
          if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
               return NextResponse.json(
                    { error: "Formato de teléfono no válido (04XX1234567)" },
                    { status: 400 }
               );
          }

          // Generar ticket ID
          const ticketId = generateTicketId();

          // Crear cliente Supabase
          const supabase = await createClient();

          // Insertar orden en la base de datos
          const { data: order, error } = await supabase
               .from("orders")
               .insert({
                    ticket_id: ticketId,
                    user_id: null, // Guest order - sin usuario registrado
                    paypal_email: email,
                    usd_amount: usdAmount,
                    ves_amount: vesAmount,
                    exchange_rate: rate,
                    bank_name: bank,
                    id_number: idNumber,
                    phone_pago_movil: phone,
                    whatsapp: whatsapp,
                    status: "pending",
                    is_guest: true,
                    created_at: new Date().toISOString()
               })
               .select()
               .single();

          if (error) {
               console.error("Error creating order:", error);
               return NextResponse.json(
                    { error: "Error al crear la orden. Intente nuevamente." },
                    { status: 500 }
               );
          }

          // Información de pago para mostrar al usuario
          const paymentInfo = {
               ticketId: ticketId,
               paypalDestination: "pagos@pp360ve.com", // Correo PayPal de destino
               usdAmount: usdAmount,
               vesAmount: vesAmount,
               instructions: [
                    `1. Envía $${usdAmount.toFixed(2)} USD a: pagos@pp360ve.com`,
                    `2. En la nota del pago coloca: ${ticketId}`,
                    `3. Envía captura del pago por WhatsApp`,
                    `4. Recibirás Bs. ${vesAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 })} en tu cuenta`
               ]
          };

          return NextResponse.json({
               success: true,
               order: {
                    id: order.id,
                    ticketId: ticketId,
                    status: "pending"
               },
               paymentInfo
          });

     } catch (error) {
          console.error("Guest order error:", error);
          return NextResponse.json(
               { error: "Error interno del servidor" },
               { status: 500 }
          );
     }
}
