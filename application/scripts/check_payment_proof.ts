
import { createClient } from '@supabase/supabase-js';

// Hardcoded creds for immediate check (same as used previously)
const SUPABASE_URL = 'https://gbqlvpceruyiburzlpjo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdicWx2cGNlcnV5aWJ1cnpscGpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ5NTUyNiwiZXhwIjoyMDgyMDcxNTI2fQ.GNRZnYDz9xVVuSE_EoVJtr7ox8ZZWVaS0zB2iIzHTYY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkLastOrder() {
     console.log("Checking last order...");

     const { data: orders, error } = await supabase
          .from('exchange_orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

     if (error) {
          console.error('Error fetching orders:', error);
          return;
     }

     if (!orders || orders.length === 0) {
          console.log('No orders found.');
          return;
     }

     const order = orders[0];
     console.log('--- Order Details ---');
     console.log(`ID: ${order.order_id}`);
     console.log(`Ticket: ${order.ticket_id}`);
     console.log(`Status: ${order.status}`);
     console.log(`Proof URL: ${order.payment_proof_url}`);
     console.log(`Created: ${new Date(order.created_at).toLocaleString()}`);

     if (order.payment_proof_url && order.payment_proof_url.startsWith('PAYPAL_AUTO_')) {
          console.log('✅ PAYMENT PROOF IS CORRECT (PAYPAL_AUTO format)');
     } else if (!order.payment_proof_url) {
          console.log('❌ NO PAYMENT PROOF SAVED');
     } else {
          console.log('⚠️ PAYMENT PROOF is valid but not PAYPAL_AUTO format (Normal for manual uploads)');
     }
}

checkLastOrder();
