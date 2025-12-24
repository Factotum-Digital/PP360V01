import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-config';

// HARDCODED: Vercel env var is truncated, using direct values
const SUPABASE_URL = 'https://gbqlvpceruyiburzlpjo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdicWx2cGNlcnV5aWJ1cnpscGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTU1MjYsImV4cCI6MjA4MjA3MTUyNn0.vKBbg26kZB9yabmhQFbd96xpkwrv1DOnSoyT1OCrxEk';

export async function updateSession(request: NextRequest) {
     let supabaseResponse = NextResponse.next({
          request,
     });

     const supabase = createServerClient(
          SUPABASE_URL,
          SUPABASE_ANON_KEY,
          {
               cookies: {
                    getAll() {
                         return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                         cookiesToSet.forEach(({ name, value }) =>
                              request.cookies.set(name, value)
                         );
                         supabaseResponse = NextResponse.next({
                              request,
                         });
                         cookiesToSet.forEach(({ name, value, options }) =>
                              supabaseResponse.cookies.set(name, value, options)
                         );
                    },
               },
          }
     );

     const {
          data: { user },
     } = await supabase.auth.getUser();

     // Protected routes - require authentication
     if (
          !user &&
          (request.nextUrl.pathname.startsWith('/dashboard') ||
               request.nextUrl.pathname.startsWith('/admin'))
     ) {
          const url = request.nextUrl.clone();
          url.pathname = '/login';
          return NextResponse.redirect(url);
     }

     // Admin routes - require admin role
     if (request.nextUrl.pathname.startsWith('/admin')) {
          if (!user || !isAdmin(user.email)) {
               // Not an admin, redirect to home
               const url = request.nextUrl.clone();
               url.pathname = '/';
               return NextResponse.redirect(url);
          }
     }

     return supabaseResponse;
}
