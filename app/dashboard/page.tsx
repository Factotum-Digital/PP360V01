import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardContent } from '@/components/dashboard/dashboard-content';

// Fetch the current pay rate from DolarAPI (parallel - 15%)
async function getCurrentPayRate(): Promise<number> {
     try {
          const res = await fetch('https://ve.dolarapi.com/v1/dolares/paralelo', {
               next: { revalidate: 300 }, // Cache for 5 minutes
          });
          if (!res.ok) throw new Error('API Error');
          const data = await res.json();
          const paraleloRate = data.promedio;
          // Apply 15% discount
          return paraleloRate * 0.85;
     } catch {
          return 50; // Fallback rate
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

     // Fetch current pay rate from API (paralelo - 15%)
     const currentRate = await getCurrentPayRate();

     return (
          <DashboardContent
               user={user}
               orders={orders || []}
               currentRate={currentRate}
          />
     );
}
