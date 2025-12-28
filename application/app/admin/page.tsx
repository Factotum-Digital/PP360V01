import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin-config';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { fetchExchangeRates } from '@/lib/services/dolar-api';
import { getReferenceRate } from '@/lib/rate-calculator';
import { SITE_CONFIG } from '@/config/site';

export default async function AdminPage() {
     const supabase = await createClient();

     const {
          data: { user },
     } = await supabase.auth.getUser();

     if (!user || !isAdmin(user.email)) {
          redirect('/');
     }

     // Fetch ALL orders (from all users)
     const { data: orders } = await supabase
          .from('exchange_orders')
          .select('*')
          .order('created_at', { ascending: false });

     // Fetch current exchange rate from API
     let currentRate = 50;
     let paraleloRate = 0;
     try {
          const rates = await fetchExchangeRates();
          paraleloRate = rates.paralelo || SITE_CONFIG.fallbackRates.paralelo;
          currentRate = getReferenceRate(paraleloRate);
     } catch {
          paraleloRate = SITE_CONFIG.fallbackRates.paralelo;
          currentRate = getReferenceRate(paraleloRate);
     }

     // Calculate stats (case-insensitive status comparison)
     const stats = {
          total: orders?.length || 0,
          guests: orders?.filter(o => o.is_guest === true).length || 0,
          registered: orders?.filter(o => o.is_guest !== true && o.user_id !== null).length || 0,
          pending: orders?.filter(o => o.status?.toUpperCase() === 'PENDING').length || 0,
          verifying: orders?.filter(o => o.status?.toUpperCase() === 'VERIFYING').length || 0,
          completed: orders?.filter(o => o.status?.toUpperCase() === 'COMPLETED').length || 0,
          cancelled: orders?.filter(o => o.status?.toUpperCase() === 'CANCELLED').length || 0,
          totalUSD: orders?.reduce((sum, o) => sum + Number(o.amount_sent), 0) || 0,
          totalVES: orders?.reduce((sum, o) => sum + Number(o.amount_received), 0) || 0,
     };

     return (
          <AdminDashboard
               user={user}
               orders={orders || []}
               stats={stats}
               currentRate={currentRate}
               paraleloRate={paraleloRate}
          />
     );
}
