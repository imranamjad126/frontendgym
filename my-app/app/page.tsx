'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        // Super admin check (you) - OWNER role with specific email
        if (user.email === 'fitnesswithimran1@gmail.com') {
          router.push('/admin');
        } else if (user.role === 'OWNER') {
          router.push('/owner');
        } else if (user.role === 'STAFF') {
          router.push('/staff');
        } else {
          // Unknown role, redirect to login
          console.warn('Unknown user role:', user.role);
          router.push('/login');
        }
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-slate-500">Redirecting...</p>
    </div>
  );
}
