import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin-config';
import { EarningsPanel } from '@/components/admin/earnings-panel';
import { fetchExchangeRates } from '@/lib/services/dolar-api';
import { getReferenceRate } from '@/lib/rate-calculator';

export const dynamic = 'force-dynamic';

export default async function EarningsPage() {
     const supabase = await createClient();

     const { data: { user } } = await supabase.auth.getUser();

     if (!user) {
          redirect('/login');
     }

     // Check if user is admin using the centralized config
     if (!isAdmin(user.email)) {
          redirect('/dashboard');
     }

     // 1. Fetch real orders
     const { data: orders } = await supabase
          .from('exchange_orders')
          .select('*')
          .order('created_at', { ascending: false });

     // 2. Fetch campaigns
     const { data: campaigns } = await supabase
          .from('campaigns')
          .select('*')
          .order('created_at', { ascending: false });

     // 3. Fetch disputes
     const { data: disputes } = await supabase
          .from('disputes')
          .select('*')
          .order('created_at', { ascending: false });

     // 4. Fetch exchange rates (Direct Service Call)
     let rates = { value: 0, previous: 0, timestamp: '', oficial: 0, paralelo: 0, payRate: 0 };
     try {
          const rawRates = await fetchExchangeRates();
          const payRate = getReferenceRate(rawRates.paralelo);

          rates = {
               value: payRate,
               previous: rawRates.oficial,
               timestamp: new Date().toISOString(),
               oficial: rawRates.oficial,
               paralelo: rawRates.paralelo,
               payRate: payRate
          };
     } catch (e) {
          console.error("Failed to fetch rates:", e);
     }

     // 5. Fetch User Payment Data (Profile Info)
     const { data: userPaymentData } = await supabase
          .from('user_payment_data')
          .select('*');

     // 6. Calculate Server-Side Stats
     const validOrders = orders || [];
     const completedOrders = validOrders.filter(o => o.status === 'COMPLETED');
     const totalGross = completedOrders.reduce((sum, o) => sum + Number(o.amount_sent), 0);
     const totalNet = totalGross * 0.12; // 12% service fee

     const stats = {
          totalGross,
          totalNet,
          orderCount: validOrders.length,
          completedCount: completedOrders.length,
          pendingCount: validOrders.filter(o => o.status === 'PENDING' || o.status === 'VERIFYING').length,
     };

     return (
          <main className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
               <EarningsPanel
                    orders={validOrders}
                    campaigns={campaigns || []}
                    disputes={disputes || []}
                    rates={rates}
                    userPaymentData={userPaymentData || []}
                    stats={stats}
               />
          </main>
     );
}
