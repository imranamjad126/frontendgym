'use client';

import { usePathname } from 'next/navigation';
import { Layout } from './Layout';
import { useAuth } from '@/lib/contexts/AuthContext';

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

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading } = useAuth();
  
  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => {
    if (pathname === route) return true;
    if (pathname.startsWith(route + '/')) return true;
    return false;
  });

  // Public routes: render without Layout
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Protected routes: show loading state, then Layout
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return <Layout>{children}</Layout>;
}

