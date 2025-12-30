import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { calculateOrderMetrics } from "@/lib/rate-calculator";
import { generateTicketId } from "@/lib/utils/order-utils";

export async function POST(request: NextRequest) {
     try {
          const body = await request.json();

          const {
               usdAmount,
               email,
               bank,
               idNumber,
               phone,
               whatsapp
          } = body;

          // Recalcular monto y tasa en el servidor para seguridad (No confiar en el cliente)
          const ratesRes = await fetch(`${request.nextUrl.origin}/api/rates`);
          const ratesData = await ratesRes.json();
          const parallelRate = ratesData.baseRate || ratesData.paralelo || 0;

          // Cálculo unificado usando la utilidad centralizada (Tasa Fija)
          const { vesAmount, effectiveRate } = calculateOrderMetrics(usdAmount, parallelRate);

          // Validaciones del servidor
          if (!email || !idNumber || !phone || !whatsapp) {
               return NextResponse.json(
                    { error: "Todos los campos son obligatorios" },
                    { status: 400 }
               );
          }

          if (usdAmount < 5) {
               return NextResponse.json(
                    { error: "El monto mínimo es $5 USD" },
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

          // Validar formato de cédula (ya viene formateada V-XXXXXXXX desde el frontend)
          const idRegex = /^[VEJP]-\d{6,8}$/i;
          if (!idRegex.test(idNumber.replace(/\./g, ''))) {
               return NextResponse.json(
                    { error: "Formato de cédula no válido" },
                    { status: 400 }
               );
          }

          // Validar formato de teléfono - más flexible
          // Quitar todo excepto dígitos, luego quitar prefijos internacionales
          const phoneDigits = phone.replace(/[^0-9]/g, '');
          // Si empieza con 58 (Venezuela), quitarlo
          const phoneClean = phoneDigits.replace(/^58/, '').replace(/^0+/, '');
          if (phoneClean.length < 9) {
               return NextResponse.json(
                    { error: "Teléfono inválido" },
                    { status: 400 }
               );
          }

          // Generar ticket ID
          const ticketId = generateTicketId();

          // Crear cliente Supabase
          const supabase = await createClient();

          // Insertar orden en la base de datos
          const { data: order, error } = await supabase
               .from("exchange_orders")
               .insert({
                    ticket_id: ticketId,
                    user_id: null, // Guest order - sin usuario registrado
                    paypal_email: email,
                    amount_sent: usdAmount,
                    amount_received: vesAmount,
                    exchange_rate: effectiveRate,
                    currency_sent: 'USD_PAYPAL',
                    currency_received: 'VES',
                    bank_name: bank,
                    id_number: idNumber,
                    phone_pago_movil: phone,
                    whatsapp: whatsapp,
                    status: "PENDING",
                    is_guest: true,
                    destination_data: {
                         payment_method: 'pago_movil'
                    },
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
                    id: order.order_id,
                    ticketId: ticketId,
                    status: "PENDING"
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
