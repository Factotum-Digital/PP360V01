import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
     const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

     console.log('Supabase Config:', {
          hasUrl: !!supabaseUrl,
          url: supabaseUrl,
          hasKey: !!supabaseAnonKey,
          keyLength: supabaseAnonKey?.length || 0,
          keyStart: supabaseAnonKey?.substring(0, 30) + '...',
          keyEnd: '...' + supabaseAnonKey?.substring(supabaseAnonKey.length - 20),
     });

     if (!supabaseUrl || !supabaseAnonKey) {
          console.error('Missing Supabase environment variables');
     }

     return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
