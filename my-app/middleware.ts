import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const { pathname } = request.nextUrl;

  // Public routes (no auth needed)
  const publicRoutes = [
    '/login',
    '/auth', // Matches /auth/* and /auth
  ];

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => {
    if (pathname === route) return true;
    if (pathname.startsWith(route + '/')) return true;
    return false;
  });

  // Allow Next.js internal routes + API + public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    isPublicRoute
  ) {
    // If logged in and trying to access login page, redirect based on role
    if (pathname === '/login' || pathname.startsWith('/login')) {
      // Initialize Supabase client for cookie handling
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
        const { data: userData } = await supabase
          .from('users')
          .select('role, email')
          .eq('id', session.user.id)
          .single();

        const userRole = userData?.role;
        const userEmail = userData?.email;
        const isSuperAdmin = userEmail === 'fitnesswithimran1@gmail.com';

        let redirectUrl = '/';
        if (isSuperAdmin) redirectUrl = '/admin';
        else if (userRole === 'OWNER') redirectUrl = '/owner';
        else if (userRole === 'STAFF') redirectUrl = '/staff';

        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    }
    return response;
  }

  // Initialize Supabase server client with proper cookie handling
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

  // Get session (this reads cookies properly)
  const { data: { session } } = await supabase.auth.getSession();

  // Protected routes: /admin*, /owner*, /staff*, /dashboard*
  const isProtectedRoute = 
    pathname.startsWith('/admin') ||
    pathname.startsWith('/owner') ||
    pathname.startsWith('/staff') ||
    pathname.startsWith('/dashboard');

  // BLOCK UNAUTHENTICATED USERS from protected routes
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If no session and not a protected route, allow access (root, etc.)
  if (!session) {
    return response;
  }

  // Fetch role and email for RBAC (only if session exists)
  const { data: userData } = await supabase
    .from('users')
    .select('role, email')
    .eq('id', session.user.id)
    .single();

  const userRole = userData?.role;
  const userEmail = userData?.email;

  // Super Admin routes (special email check)
  const isSuperAdmin = userEmail === 'fitnesswithimran1@gmail.com';
  
  // Protect /admin* routes - Super Admin only
  if (pathname.startsWith('/admin')) {
    if (!isSuperAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Protect /owner* routes - Owner only
  if (pathname.startsWith('/owner')) {
    if (userRole !== 'OWNER') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Protect /staff* routes - Staff and Owner can access
  if (pathname.startsWith('/staff')) {
    if (userRole !== 'STAFF' && userRole !== 'OWNER') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Protect /dashboard* routes - All authenticated users can access
  if (pathname.startsWith('/dashboard')) {
    // All authenticated users (OWNER, STAFF, Super Admin) can access
    // No additional role check needed
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
