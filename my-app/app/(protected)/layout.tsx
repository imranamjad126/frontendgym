'use client';

import { Layout } from '@/components/layout/Layout';

// This layout wraps all protected routes with the main Layout component
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}

