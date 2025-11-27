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
    '/login-diagnostic',
    '/setup-admin',
    '/test-auth',
    '/verify-setup',
    '/auto-fix',
    '/admin/auto-fix',
    '/auto-fix-complete'
  ];

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
    // If logged in and trying to access login page, redirect to home
    if (pathname === '/login' || pathname === '/setup-admin') {
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
        // Fetch role to redirect appropriately
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        const userRole = userData?.role;
        if (userRole === 'ADMIN') {
          return NextResponse.redirect(new URL('/admin', request.url));
        } else if (userRole === 'STAFF') {
          return NextResponse.redirect(new URL('/staff', request.url));
        }
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    return response;
  }

  // Initialize Supabase server session
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

  // BLOCK UNAUTHENTICATED USERS from ALL protected content
  // This includes / (root) which is NOT in publicRoutes
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Fetch role and email for RBAC
  const { data: userData } = await supabase
    .from('users')
    .select('role, email')
    .eq('id', session.user.id)
    .single();

  const userRole = userData?.role;
  const userEmail = userData?.email;

  // Super Admin routes (special email check - you are the super admin)
  // Super admin can access /admin routes to create gyms and owners
  const isSuperAdmin = userEmail === 'fitnesswithimran1@gmail.com';
  
  if (pathname.startsWith('/admin') && pathname !== '/admin/auto-fix') {
    if (!isSuperAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Owner-only routes
  if (pathname.startsWith('/owner')) {
    if (userRole !== 'OWNER') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Staff-only routes (staff can access, owners can also access)
  if (pathname.startsWith('/staff')) {
    if (userRole !== 'STAFF' && userRole !== 'OWNER') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
