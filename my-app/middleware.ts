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
