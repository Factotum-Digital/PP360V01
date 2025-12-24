import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
     const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

     console.log('Supabase Config:', {
          hasUrl: !!supabaseUrl,
          url: supabaseUrl,
          hasKey: !!supabaseAnonKey,
     });

     if (!supabaseUrl || !supabaseAnonKey) {
          console.error('Missing Supabase environment variables');
     }

     return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
