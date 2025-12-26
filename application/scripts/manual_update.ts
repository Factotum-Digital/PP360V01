
import { createClient } from '@supabase/supabase-js';

// Hardcoded for verification purposes (fetched from .env.local)
const supabaseUrl = 'https://gbqlvpceruyiburzlpjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdicWx2cGNlcnV5aWJ1cnpscGpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ5NTUyNiwiZXhwIjoyMDgyMDcxNTI2fQ.GNRZnYDz9xVVuSE_EoVJtr7ox8ZZWVaS0zB2iIzHTYY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateLatestOrder() {
     console.log('Fetching latest order to update...');
     const { data: order, error: fetchError } = await supabase
          .from('exchange_orders')
          .select('*')
          .eq('status', 'PENDING') // Only update if pending
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

     if (fetchError || !order) {
          console.error('Error fetching order or no pending order found:', fetchError);
          return;
     }

     console.log(`Found Order: ${order.order_id} (Ticket: ${order.ticket_id})`);

     const { error: updateError } = await supabase
          .from('exchange_orders')
          .update({
               status: 'VERIFYING',
               payment_proof_url: 'PAYPAL_MANUAL_VERIFY_' + Date.now()
          })
          .eq('order_id', order.order_id);

     if (updateError) {
          console.error('Failed to update:', updateError);
     } else {
          console.log(`✅ Order ${order.ticket_id} manually updated to VERIFYING.`);
     }
}

updateLatestOrder();
