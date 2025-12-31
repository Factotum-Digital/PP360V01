import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { calculateOrderMetrics } from "@/lib/rate-calculator";
import { generateTicketId } from "@/lib/utils/order-utils";

// Tipos
interface PaymentData {
     user_id: string;
     id_number: string;
     email: string;
     whatsapp_primary: string;
     pago_movil_phone?: string | null;
     account_number?: string | null;
     paypal_email?: string | null;
     bank_name: string;
     full_name?: string;
     account_holder?: string | null;
     pago_movil_cedula?: string | null;
     pago_movil_bank?: string | null;
}

interface OrderData {
     user_id: string;
     amount_sent: number;
     currency_sent: string;
     amount_received: number;
     currency_received: string;
     exchange_rate: number;
     status: string;
     paypal_email: string;
     bank_name: string;
     phone_pago_movil?: string;
     id_number: string;
     whatsapp: string;
     is_guest: boolean;
     destination_data: Record<string, unknown>;
     ticket_id: string;
}

// Función auxiliar para extraer el campo duplicado del error
function extractDuplicateField(errorMessage: string): string {
     const fieldMap: Record<string, string> = {
          'unique_id_number': 'Cédula/Pasaporte',
          'unique_email': 'Correo electrónico',
          'unique_whatsapp': 'WhatsApp',
          'unique_pago_movil': 'Teléfono Pago Móvil',
          'unique_account_number': 'Cuenta bancaria',
     };

     for (const [key, label] of Object.entries(fieldMap)) {
          if (errorMessage.includes(key)) return label;
     }
     return 'dato';
}

// Función auxiliar para sanitizar datos
function sanitizePaymentData(data: Partial<PaymentData>): Partial<PaymentData> {
     // Función para normalizar teléfonos venezolanos
     // +584123530231, +5804123530231, 04123530231, 4123530231 → 4123530231
     const normalizePhone = (phone?: string | null): string | null => {
          if (!phone) return null;

          // Eliminar todo excepto números
          let digits = phone.replace(/\D/g, '');

          // Si empieza con código de país 58, quitarlo
          if (digits.startsWith('58')) {
               digits = digits.substring(2);
          }

          // Si empieza con 0, quitarlo (número venezolano con 0 inicial)
          if (digits.startsWith('0')) {
               digits = digits.substring(1);
          }

          // Retornar los 10 dígitos finales
          return digits.slice(-10);
     };

     return {
          ...data,
          id_number: data.id_number?.trim().toUpperCase(),
          email: data.email?.trim().toLowerCase(),
          whatsapp_primary: normalizePhone(data.whatsapp_primary) || undefined,
          pago_movil_phone: normalizePhone(data.pago_movil_phone) || undefined,
          account_number: data.account_number?.replace(/\D/g, '') || undefined,
          paypal_email: data.paypal_email?.trim().toLowerCase() || undefined,
     };
}

export async function POST(request: NextRequest) {
     try {
          const supabase = await createClient();

          // PASO 1: Verificar autenticación
          const { data: { user }, error: authError } = await supabase.auth.getUser();

          if (authError || !user) {
               return NextResponse.json(
                    { error: 'No autorizado. Inicia sesión primero.' },
                    { status: 401 }
               );
          }

          // PASO 2: Parsear y validar request body
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
               accountHolder
          } = body;

          if (!amount || !emailPaypal || !bank || !idNumber || !whatsapp) {
               return NextResponse.json(
                    { error: 'Datos incompletos en la solicitud' },
                    { status: 400 }
               );
          }

          // PASO 3: Verificar si el usuario ya tiene perfil de pago
          const { data: existingProfile } = await supabase
               .from('user_payment_data')
               .select('*')
               .eq('user_id', user.id)
               .maybeSingle();

          // Sanitizar datos recibidos
          const sanitizedData = sanitizePaymentData({
               user_id: user.id,
               id_number: idNumber,
               email: user.email, // Use Auth Email for identity, not PayPal email
               whatsapp_primary: whatsapp,
               pago_movil_phone: paymentMethod === 'pago_movil' ? phone : null,
               account_number: paymentMethod === 'transferencia' ? accountNumber : null,
               paypal_email: emailPaypal,
               bank_name: bank,
               account_holder: paymentMethod === 'transferencia' ? accountHolder : null,
          });

          // PASO 4A: Si NO tiene perfil -> PRIMERO validar e insertar datos
          if (!existingProfile) {
               console.log('[CREATE ORDER] Usuario sin perfil. Validando datos nuevos...');

               const { data: newProfile, error: insertError } = await supabase
                    .from('user_payment_data')
                    .insert(sanitizedData)
                    .select()
                    .single();

               // CRÍTICO: Capturar violaciones de UNIQUE ANTES de crear orden
               if (insertError) {
                    console.error('[CREATE ORDER] Error al insertar perfil:', insertError);

                    // Error de duplicado (código PostgreSQL 23505)
                    if (insertError.code === '23505') {
                         const field = extractDuplicateField(insertError.message);
                         return NextResponse.json({
                              error: `El ${field} ya está registrado por otro usuario. Por favor verifica tus datos.`,
                              code: 'DUPLICATE_DATA',
                              field: field
                         }, { status: 400 });
                    }

                    // Error de formato (código PostgreSQL 23514 - CHECK violation)
                    if (insertError.code === '23514') {
                         return NextResponse.json({
                              error: 'Uno o más campos tienen formato inválido. Verifica cédula, email, teléfono y cuenta bancaria.',
                              code: 'INVALID_FORMAT'
                         }, { status: 400 });
                    }

                    // Otros errores de base de datos
                    return NextResponse.json({
                         error: 'Error al guardar tus datos de pago. Intenta nuevamente.',
                         code: 'DATABASE_ERROR'
                    }, { status: 500 });
               }

               console.log('[CREATE ORDER] Perfil creado exitosamente:', newProfile.id);
          }
          // PASO 4B: Si tiene perfil -> Validar coherencia de datos críticos
          else {
               console.log('[CREATE ORDER] Usuario con perfil existente. Validando coherencia...');

               // Validar que datos críticos coincidan (prevenir suplantación)
               const mismatches = [];

               const normalize = (s: string) => s?.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

               if (existingProfile.id_number && normalize(idNumber) !== normalize(existingProfile.id_number)) {
                    mismatches.push('Cédula/Pasaporte');
               }
               if (existingProfile.email && sanitizedData.email !== existingProfile.email?.toLowerCase()) {
                    mismatches.push('Correo electrónico');
               }

               // Validar cuenta bancaria solo si el método de pago es transferencia
               if (paymentMethod === 'transferencia' && existingProfile.account_number) {
                    const normalizeAcc = (s: string) => s?.replace(/\D/g, '');
                    if (normalizeAcc(accountNumber) !== normalizeAcc(existingProfile.account_number)) {
                         mismatches.push('Cuenta bancaria');
                    }
               }

               // Validar teléfono pago móvil solo si el método de pago es pago_movil
               if (paymentMethod === 'pago_movil' && existingProfile.pago_movil_phone) {
                    const normalizePhone = (s: string) => s?.replace(/\D/g, '');
                    const payloadPhone = normalizePhone(phone).slice(-10);
                    const profilePhone = normalizePhone(existingProfile.pago_movil_phone).slice(-10);

                    if (payloadPhone !== profilePhone) {
                         mismatches.push('Teléfono Pago Móvil');
                    }
               }

               if (mismatches.length > 0) {
                    return NextResponse.json({
                         error: `Los siguientes datos no coinciden con tu perfil registrado: ${mismatches.join(', ')}`,
                         code: 'DATA_MISMATCH',
                         fields: mismatches
                    }, { status: 400 });
               }
          }

          // PASO 5: Recálculos de Seguridad (Monto, Tasa)
          const ratesRes = await fetch(`${request.nextUrl.origin}/api/rates`);
          const ratesData = await ratesRes.json();
          const parallelRate = ratesData.baseRate || ratesData.paralelo || 0;
          const amountNum = parseFloat(amount);

          const { vesAmount, effectiveRate } = calculateOrderMetrics(amountNum, parallelRate);

          if (amountNum < 5) {
               return NextResponse.json({ error: "El monto mínimo es $5 USD" }, { status: 400 });
          }

          // PASO 6: SOLO si pasamos todas las validaciones -> Crear la orden
          console.log('[CREATE ORDER] Validaciones exitosas. Creando orden...');

          const ticketId = generateTicketId();

          // Preparar datos de destino
          const destinationData = {
               payment_method: paymentMethod,
               ...(paymentMethod === 'transferencia' && {
                    account_number: accountNumber,
                    account_holder: accountHolder,
               }),
          };

          const orderPayload: OrderData = {
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
               phone_pago_movil: phone,
               id_number: idNumber,
               whatsapp: whatsapp,
               is_guest: false,
               destination_data: destinationData,
          };

          const { data: order, error: orderError } = await supabase
               .from('exchange_orders')
               .insert(orderPayload)
               .select()
               .single();

          if (orderError) {
               console.error('[CREATE ORDER] Error al crear orden:', orderError);
               return NextResponse.json({
                    error: 'Error al crear la orden. Intenta nuevamente.',
                    code: 'ORDER_CREATION_FAILED'
               }, { status: 500 });
          }

          // PASO 7: Éxito - Devolver orden creada
          console.log('[CREATE ORDER] Orden creada exitosamente:', order.order_id);

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
          }, { status: 201 });

     } catch (error: unknown) {
          console.error('[CREATE ORDER] Error inesperado:', error);
          return NextResponse.json({
               error: 'Error del servidor. Por favor intenta más tarde.',
               code: 'INTERNAL_ERROR'
          }, { status: 500 });
     }
}
