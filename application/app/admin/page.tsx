import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin-config';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { fetchExchangeRates } from '@/lib/services/dolar-api';
import { getReferenceRate } from '@/lib/rate-calculator';
import { SITE_CONFIG } from '@/config/site';

export default async function AdminPage(props: {
     searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
     const searchParams = await props.searchParams;
     const supabase = await createClient();

     const {
          data: { user },
     } = await supabase.auth.getUser();

     if (!user || !isAdmin(user.email)) {
          redirect('/');
     }

     // Fetch ALL orders (needed for global stats)
     // Optimization TODO: In the future, fetch only stats count + paginated data
     const { data: allOrders } = await supabase
          .from('exchange_orders')
          .select('*')
          .order('created_at', { ascending: false });

     const orders = allOrders || [];

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

     // Calculate stats (Global stats over ALL orders)
     const stats = {
          total: orders.length,
          guests: orders.filter(o => o.is_guest === true).length,
          registered: orders.filter(o => o.is_guest !== true && o.user_id !== null).length,
          pending: orders.filter(o => o.status?.toUpperCase() === 'PENDING').length,
          verifying: orders.filter(o => o.status?.toUpperCase() === 'VERIFYING').length,
          completed: orders.filter(o => o.status?.toUpperCase() === 'COMPLETED').length,
          cancelled: orders.filter(o => o.status?.toUpperCase() === 'CANCELLED').length,
          totalUSD: orders.reduce((sum, o) => sum + Number(o.amount_sent), 0),
          totalVES: orders.reduce((sum, o) => sum + Number(o.amount_received), 0),
     };

     // Server-Side Filtering & Pagination
     const currentPage = Number(searchParams?.page) || 1;
     const currentFilter = (searchParams?.filter as string)?.toUpperCase() || 'ALL';
     const isArchived = searchParams?.archived === 'true';
     const itemsPerPage = 20;

     let filteredOrders = orders.filter(order => {
          // 1. Filter by Archived
          if (isArchived && !order.is_archived) return false;
          if (!isArchived && order.is_archived) return false;

          // 2. Filter by Status/Type
          if (currentFilter === 'ALL') return true;

          if (isArchived) {
               // In archived view, we filter by specific statuses if selected
               return order.status === currentFilter;
          } else {
               // Normal view filters
               if (currentFilter === 'GUESTS') return order.is_guest === true;
               if (currentFilter === 'REGISTERED') return order.is_guest !== true && order.user_id !== null;

               // Match status directly
               return order.status?.toUpperCase() === currentFilter;
          }
     });

     // Pagination Logic
     const totalItems = filteredOrders.length;
     const totalPages = Math.ceil(totalItems / itemsPerPage);
     const paginatedOrders = filteredOrders.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
     );

     return (
          <AdminDashboard
               user={user}
               orders={paginatedOrders}
               stats={stats}
               currentRate={currentRate}
               paraleloRate={paraleloRate}
               page={currentPage}
               totalPages={totalPages}
               currentFilter={currentFilter}
               isArchived={isArchived}
          />
     );
}
