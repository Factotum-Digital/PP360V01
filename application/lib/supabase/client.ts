import { createBrowserClient } from '@supabase/ssr';

// HARDCODED: Vercel env var is truncated, using direct values
const SUPABASE_URL = 'https://gbqlvpceruyiburzlpjo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdicWx2cGNlcnV5aWJ1cnpscGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTU1MjYsImV4cCI6MjA4MjA3MTUyNn0.vKBbg26kZB9yabmhQFbd96xpkwrv1DOnSoyT1OCrxEk';

export function createClient() {
     return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

