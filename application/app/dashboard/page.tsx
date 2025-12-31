import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardContent } from '@/components/dashboard/dashboard-content';

import { getReferenceRate } from '@/lib/rate-calculator';
import { SITE_CONFIG } from '@/config/site';
import { fetchExchangeRates } from '@/lib/services/dolar-api';

async function getRatesData(): Promise<{ payRate: number; paraleloRate: number }> {
     try {
          const rates = await fetchExchangeRates();
          const paraleloRate = rates.paralelo || SITE_CONFIG.fallbackRates.paralelo;
          const payRate = getReferenceRate(paraleloRate);

          return { payRate, paraleloRate };
     } catch {
          const paraleloRate = SITE_CONFIG.fallbackRates.paralelo;
          return {
               payRate: getReferenceRate(paraleloRate),
               paraleloRate: paraleloRate
          };
     }
}

export default async function DashboardPage() {
     const supabase = await createClient();

     const {
          data: { user },
     } = await supabase.auth.getUser();

     if (!user) {
          redirect('/login');
     }

     // [AUTO-LINK] Vincular órdenes de guest al usuario registrado por ID
     // Esto ocurre en cada carga del dashboard para capturar nuevas órdenes
     try {
          // 1. Obtener el perfil del usuario para su ID (cédula)
          const { data: profile } = await supabase
               .from('user_payment_data')
               .select('id_number')
               .eq('user_id', user.id)
               .single();

          if (profile?.id_number) {
               // 2. Normalizar el ID para comparación
               const normalizedId = profile.id_number.replace(/[.\s-]/g, '').toUpperCase();

               // 3. Buscar órdenes de guest con el mismo id_number (usando LIKE para flexibilidad)
               const { data: guestOrders } = await supabase
                    .from('exchange_orders')
                    .select('order_id, id_number')
                    .eq('is_guest', true)
                    .is('user_id', null);

               if (guestOrders && guestOrders.length > 0) {
                    // 4. Filtrar las que tienen el mismo ID (normalizado)
                    const matchingOrders = guestOrders.filter(order => {
                         const orderIdNormalized = order.id_number?.replace(/[.\s-]/g, '').toUpperCase() || '';
                         return orderIdNormalized === normalizedId;
                    });

                    if (matchingOrders.length > 0) {
                         const orderIds = matchingOrders.map(o => o.order_id);

                         // 5. Vincular las órdenes al usuario actual
                         await supabase
                              .from('exchange_orders')
                              .update({ user_id: user.id, is_guest: false })
                              .in('order_id', orderIds);

                         console.log(`[AUTO-LINK] ✅ ${matchingOrders.length} orden(es) de guest vinculada(s) al usuario ${user.email}`);
                    }
               }
          }
     } catch (err) {
          console.log('[AUTO-LINK] Error al vincular órdenes de guest:', err);
     }

     // Fetch user's orders (now includes any newly linked orders)
     const { data: orders } = await supabase
          .from('exchange_orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

     // Fetch rates data
     const { payRate, paraleloRate } = await getRatesData();

     return (
          <DashboardContent
               user={user}
               orders={orders || []}
               currentRate={payRate}
               paraleloRate={paraleloRate}
          />
     );
}
