import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// HARDCODED: Vercel env var is truncated, using direct values
const SUPABASE_URL = 'https://gbqlvpceruyiburzlpjo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdicWx2cGNlcnV5aWJ1cnpscGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTU1MjYsImV4cCI6MjA4MjA3MTUyNn0.vKBbg26kZB9yabmhQFbd96xpkwrv1DOnSoyT1OCrxEk';

export async function createClient() {
     const cookieStore = await cookies();

     return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY,
          {
               cookies: {
                    getAll() {
                         return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                         try {
                              cookiesToSet.forEach(({ name, value, options }) =>
                                   cookieStore.set(name, value, options)
                              );
                         } catch {
                              // The `setAll` method was called from a Server Component.
                              // This can be ignored if you have middleware refreshing sessions.
                         }
                    },
               },
          }
     );
}
