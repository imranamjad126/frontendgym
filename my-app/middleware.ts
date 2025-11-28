import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that should never be blocked
  const publicRoutes = ["/login", "/auth", "/forgot-password"];

  // Check if pathname starts with any public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );

  // Always allow Next.js internal routes, static files, and public routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public/") ||
    isPublicRoute
  ) {
    // If logged-in user tries to access /login, redirect to role-based dashboard
    if (pathname === "/login" || pathname.startsWith("/login")) {
      // Initialize Supabase client to check session
      let response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      });

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
              request.cookies.set({ name, value, ...options });
              response = NextResponse.next({
                request: { headers: request.headers },
              });
              response.cookies.set({ name, value, ...options });
            },
            remove(name: string, options: any) {
              request.cookies.set({ name, value: '', ...options });
              response = NextResponse.next({
                request: { headers: request.headers },
              });
              response.cookies.set({ name, value: '', ...options });
            },
          },
        }
      );

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Fetch user role and email from users table
        const { data: userData } = await supabase
          .from('users')
          .select('role, email')
          .eq('id', session.user.id)
          .single();

        const userRole = userData?.role;
        const userEmail = userData?.email;
        const isSuperAdmin = userEmail === 'fitnesswithimran1@gmail.com';

        // Redirect based on role
        let redirectUrl = '/dashboard';
        if (isSuperAdmin) redirectUrl = '/admin';
        else if (userRole === 'OWNER') redirectUrl = '/owner';
        else if (userRole === 'STAFF') redirectUrl = '/staff';

        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    }

    return NextResponse.next();
  }

  // Quick check: Look for any Supabase auth cookie (pattern: sb-*-auth-token*)
  const hasSupabaseCookie = Array.from(request.cookies.getAll()).some(
    cookie => cookie.name.includes("sb-") && cookie.name.includes("auth-token")
  );

  // If no Supabase cookies at all, redirect to login (quick optimization)
  if (!hasSupabaseCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Initialize Supabase client for session verification
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Verify session using Supabase (this properly handles all cookie patterns)
  const { data: { session } } = await supabase.auth.getSession();

  // If no valid session, redirect to login
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
