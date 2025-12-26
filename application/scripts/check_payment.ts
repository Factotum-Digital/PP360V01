
import { createClient } from '@supabase/supabase-js';

// Hardcoded for verification purposes (fetched from .env.local)
const supabaseUrl = 'https://gbqlvpceruyiburzlpjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdicWx2cGNlcnV5aWJ1cnpscGpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ5NTUyNiwiZXhwIjoyMDgyMDcxNTI2fQ.GNRZnYDz9xVVuSE_EoVJtr7ox8ZZWVaS0zB2iIzHTYY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestOrder() {
     console.log('Checking latest order...');
     const { data, error } = await supabase
          .from('exchange_orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

     if (error) {
          console.error('Error fetching order:', error);
          return;
     }

     console.log('------------------------------------------------');
     console.log('LATEST ORDER FOUND:');
     console.log(`ID: ${data.order_id}`);
     console.log(`Ticket: ${data.ticket_id}`);
     console.log(`Amount: $${data.amount_sent}`);
     console.log(`Status: ${data.status}`);
     console.log(`Proof URL: ${data.payment_proof_url}`);
     console.log('------------------------------------------------');

     if (data.status === 'VERIFYING' && data.payment_proof_url?.startsWith('PAYPAL_AUTO_')) {
          console.log('✅ SUCCESS: PayPal Integration verified. Order is auto-verifying.');
     } else {
          console.log('❌ PENDING: Order not yet updated. Check PayPal flow.');
     }
}

checkLatestOrder();
