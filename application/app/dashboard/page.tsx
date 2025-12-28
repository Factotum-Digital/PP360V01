import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardContent } from '@/components/dashboard/dashboard-content';

import { SITE_CONFIG } from '@/config/site';

async function getRatesData(): Promise<{ payRate: number; paraleloRate: number }> {
     try {
          const res = await fetch('https://ve.dolarapi.com/v1/dolares/paralelo', {
               next: { revalidate: 300 }, // Cache for 5 minutes
          });
          if (!res.ok) throw new Error('API Error');
          const data = await res.json();
          const paraleloRate = data.promedio;

          // Apply total discount from config
          const discount = SITE_CONFIG.fees.service + SITE_CONFIG.fees.paypal.percentage;
          const payRate = paraleloRate * (1 - discount);

          return { payRate, paraleloRate };
     } catch {
          return {
               payRate: SITE_CONFIG.fallbackRates.oficial * (1 - (SITE_CONFIG.fees.service + SITE_CONFIG.fees.paypal.percentage)),
               paraleloRate: SITE_CONFIG.fallbackRates.paralelo
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
