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

     // Fetch user's orders
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
