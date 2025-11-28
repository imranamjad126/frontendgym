'use client';

import { useAuth } from '@/lib/contexts/AuthContext';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-slate-600">
          Welcome to your dashboard, {user?.email}!
        </p>
        <p className="text-slate-500 mt-2">
          Role: {user?.role}
        </p>
      </div>
    </div>
  );
}


