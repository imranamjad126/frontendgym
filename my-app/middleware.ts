import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
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
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Public routes (accessible without login) - MUST be checked FIRST
  const publicRoutes = [
    '/login',
    '/setup-admin',
    '/test-auth',
    '/verify-setup',
    '/auto-fix',
    '/admin/auto-fix'
  ];
  
  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => {
    return pathname === route || pathname.startsWith(route + '/');
  });
  
  // Also allow Next.js internal routes and API routes
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/api/') ||
      isPublicRoute) {
    if (session && pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return response;
  }

  // Protected routes - require authentication
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Fetch user role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const userRole = userData?.role;

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Staff routes
  if (pathname.startsWith('/staff')) {
    if (userRole !== 'STAFF' && userRole !== 'ADMIN') {
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

