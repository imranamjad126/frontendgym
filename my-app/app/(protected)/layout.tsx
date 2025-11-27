'use client';

import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/lib/contexts/AuthContext';

// This layout wraps all protected routes with the main Layout component
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  // Prevent rendering protected routes until session is ready
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return <Layout>{children}</Layout>;
}


