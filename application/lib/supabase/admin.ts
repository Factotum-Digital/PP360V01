
import { createClient } from '@supabase/supabase-js';

// HARDCODED CREDENTIALS (RESCUED)
// Estas credenciales permiten acceso total de administración.
// Se usan para generar Magic Links manualmente y bypassear el SMTP de fallo.

const SUPABASE_URL = 'https://gbqlvpceruyiburzlpjo.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdicWx2cGNlcnV5aWJ1cnpscGpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ5NTUyNiwiZXhwIjoyMDgyMDcxNTI2fQ.GNRZnYDz9xVVuSE_EoVJtr7ox8ZZWVaS0zB2iIzHTYY';

export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
     auth: {
          autoRefreshToken: false,
          persistSession: false
     }
});
