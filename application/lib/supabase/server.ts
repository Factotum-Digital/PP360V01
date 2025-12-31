import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

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

// Anonymous client for guest operations (no cookie auth)
export function createAnonClient() {
     return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
