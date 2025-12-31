import { createAnonClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { calculateOrderMetrics } from "@/lib/rate-calculator";
import { generateTicketId } from "@/lib/utils/order-utils";
import { RateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
     try {
          // 1. Rate Limiting Check (Security)
          // Usar IP o un identificador de sesión. En Next.js local/edge, 'x-forwarded-for' es común.
          const ip = request.headers.get("x-forwarded-for") || "unknown-ip";

          if (!RateLimit.check(ip)) {
               console.warn(`[RATE LIMIT] IP bloequeada temporalmente: ${ip}`);
               return NextResponse.json(
                    { error: "Demasiados intentos. Por favor espera un momento." },
                    { status: 429 }
               );
          }

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

          // Validar formato de cédula - Más flexible
          // Acepta: V-12345678, V12345678, V-12.345.678, v12672672, etc.
          // Extraer solo la letra y los dígitos
          const idClean = idNumber.replace(/[.\s-]/g, '').toUpperCase();
          const idMatch = idClean.match(/^([VEJP])(\d{6,9})$/);
          if (!idMatch) {
               console.log(`[VALIDATION] ID failed: ${idNumber} -> cleaned: ${idClean}`);
               return NextResponse.json(
                    { error: "Formato de cédula no válido. Use: V12345678" },
                    { status: 400 }
               );
          }

          // Validar formato de teléfono - Muy flexible
          // Acepta: +584223500230, +5804223500230, 04223500230, 4223500230, 04121234567
          // Quitar todo excepto dígitos
          const phoneDigits = phone.replace(/[^0-9]/g, '');
          // Quitar prefijo de país 58 si existe (al inicio)
          let phoneClean = phoneDigits;
          if (phoneClean.startsWith('58')) {
               phoneClean = phoneClean.substring(2);
          }
          // Quitar ceros iniciales
          phoneClean = phoneClean.replace(/^0+/, '');

          // Un número venezolano válido tiene al menos 10 dígitos (4XX-XXXXXXX)
          if (phoneClean.length < 10) {
               console.log(`[VALIDATION] Phone failed: ${phone} -> digits: ${phoneDigits} -> clean: ${phoneClean}`);
               return NextResponse.json(
                    { error: "Teléfono inválido. Ingrese 10 dígitos (ej: 4121234567)" },
                    { status: 400 }
               );
          }

          // Generar ticket ID
          const ticketId = generateTicketId();

          // Crear cliente Supabase anónimo (para guest orders)
          const supabase = createAnonClient();

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
               console.error("Error creating guest order:", error);
               console.error("Error details:", JSON.stringify(error, null, 2));
               return NextResponse.json(
                    { error: `Error al crear la orden: ${error.message || 'Intente nuevamente.'}` },
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
