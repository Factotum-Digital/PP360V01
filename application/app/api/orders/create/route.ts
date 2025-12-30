import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { calculateOrderMetrics } from "@/lib/rate-calculator";
import { generateTicketId } from "@/lib/utils/order-utils";

export async function POST(request: NextRequest) {
     try {
          const supabase = await createClient();
          const {
               data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
               return NextResponse.json(
                    { error: "No autorizado. Debe iniciar sesión." },
                    { status: 401 }
               );
          }

          const body = await request.json();
          const {
               amount,
               emailPaypal,
               bank,
               idNumber,
               phone,
               whatsapp,
               paymentMethod,
               accountNumber,
               accountHolder,
          } = body;

          // 1. Obtener datos PRE-VERIFICADOS del perfil del usuario
          const { data: profile } = await supabase
               .from("user_payment_data")
               .select("*")
               .eq("user_id", user.id)
               .single();

          // 2. VALIDACIÓN DE SEGURIDAD (CRÍTICO)
          // Si el usuario tiene datos registrados, el payload DEBE coincidir
          if (profile) {
               // Validar Cédula/RIF
               if (profile.id_number) {
                    // Normalizar para comparación (quitar espacios, guiones, mayúsculas)
                    const normalize = (s: string) => s?.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                    if (normalize(idNumber) !== normalize(profile.id_number)) {
                         console.error(`Security Alert: User ${user.id} tried to modify locked ID. Expected ${profile.id_number}, got ${idNumber}`);
                         return NextResponse.json(
                              { error: "Error de validación: La cédula no coincide con su perfil verificado." },
                              { status: 400 }
                         );
                    }
               }

               // Validar Teléfono Pago Móvil
               if (paymentMethod === 'pago_movil' && profile.pago_movil_phone) {
                    const normalizePhone = (s: string) => s?.replace(/\D/g, ""); // Solo números
                    // Comparamos los últimos 10 dígitos para evitar problemas con +58/0
                    const payloadPhone = normalizePhone(phone).slice(-10);
                    const profilePhone = normalizePhone(profile.pago_movil_phone).slice(-10);

                    if (payloadPhone !== profilePhone) {
                         console.error(`Security Alert: User ${user.id} tried to modify locked Phone. Expected end with ${profilePhone}, got ${payloadPhone}`);
                         return NextResponse.json(
                              { error: "Error de validación: El teléfono de pago móvil no coincide con su perfil verificado." },
                              { status: 400 }
                         );
                    }
               }

               // Validar Cuenta Bancaria (si aplica)
               if (paymentMethod === 'transferencia' && profile.account_number) {
                    const normalizeAcc = (s: string) => s?.replace(/\D/g, "");
                    if (normalizeAcc(accountNumber) !== normalizeAcc(profile.account_number)) {
                         return NextResponse.json(
                              { error: "Error de validación: El número de cuenta no coincide con su perfil verificado." },
                              { status: 400 }
                         );
                    }
               }
          }

          // 3. Recálculos de Seguridad (Monto, Tasa)
          const ratesRes = await fetch(`${request.nextUrl.origin}/api/rates`);
          const ratesData = await ratesRes.json();
          const parallelRate = ratesData.baseRate || ratesData.paralelo || 0;
          const amountNum = parseFloat(amount);

          const { vesAmount, effectiveRate } = calculateOrderMetrics(amountNum, parallelRate);

          if (amountNum < 5) {
               return NextResponse.json({ error: "El monto mínimo es $5 USD" }, { status: 400 });
          }

          // 4. Crear la Orden
          const ticketId = generateTicketId();

          // Preparar datos de destino
          const destinationData = {
               payment_method: paymentMethod,
               ...(paymentMethod === 'transferencia' && {
                    account_number: accountNumber,
                    account_holder: accountHolder,
               }),
          };

          const { data: order, error } = await supabase.from('exchange_orders').insert({
               user_id: user.id,
               ticket_id: ticketId,
               amount_sent: amountNum,
               currency_sent: 'USD_PAYPAL',
               amount_received: vesAmount,
               currency_received: 'VES',
               exchange_rate: effectiveRate,
               status: 'PENDING',
               paypal_email: emailPaypal,
               bank_name: bank,
               phone_pago_movil: phone, // Guardamos el enviado (ya validado si existía perfil)
               id_number: idNumber,     // Guardamos el enviado (ya validado si existía perfil)
               whatsapp: whatsapp,
               is_guest: false,
               destination_data: destinationData,
          }).select().single();

          if (error) {
               console.error("Database error:", error);
               return NextResponse.json({ error: "Error al crear la orden: " + error.message }, { status: 500 });
          }

          // 5. Actualizar Datos (Solo si NO existían previamente y pasaron validación básica)
          // Nota: La política es que si ya existen NO se actualizan aquí, se usa el endpoint de perfil.
          // Pero si el usuario es nuevo y no tenía perfil, guardamos estos como iniciales.
          if (!profile) {
               await supabase.from('user_payment_data').upsert({
                    user_id: user.id,
                    bank_name: bank,
                    id_number: idNumber,
                    phone_pago_movil: paymentMethod === 'pago_movil' ? phone : null,
                    account_number: paymentMethod === 'transferencia' ? accountNumber : null,
                    account_holder: paymentMethod === 'transferencia' ? accountHolder : null,
                    // No sobreescribimos email/whatsapp si ya existen en otro lado, pero aquí asumimos upsert seguro
               }, { onConflict: 'user_id' });
          }

          return NextResponse.json({
               success: true,
               ticketId: ticketId,
               vesAmount: vesAmount,
               instructions: [
                    `1. Envía $${amountNum.toFixed(2)} USD a: pagos@pp360ve.com`,
                    `2. En la nota del pago coloca: ${ticketId}`,
                    `3. Envía captura del pago por WhatsApp`,
                    `4. Recibirás Bs. ${vesAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 })} en tu cuenta`
               ]
          });

     } catch (err: any) {
          console.error("API Error:", err);
          return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
     }
}
