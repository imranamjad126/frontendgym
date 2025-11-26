'use client';

import { Suspense } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Calendar,
  UserCheck,
  Wallet,
  UserX,
  Snowflake,
  UserMinus,
  UsersRound,
  Trash2,
  FileText,
  Building2,
  Shield
} from 'lucide-react';
import { Navigation } from './Navigation';
import { Logo } from './Logo';
import { useAuth } from '@/lib/contexts/AuthContext';

function NavigationItems() {
  const { user } = useAuth();

  return (
    <nav className="space-y-2">
      {user?.role === 'ADMIN' && (
        <>
          <Navigation 
            href="/admin" 
            label="Admin Dashboard" 
            icon={Shield} 
            iconColor="text-purple-600" 
            iconHoverColor="hover:text-purple-700" 
          />
          <Navigation 
            href="/admin/gyms" 
            label="Gyms" 
            icon={Building2} 
            iconColor="text-indigo-600" 
            iconHoverColor="hover:text-indigo-700" 
          />
          <Navigation 
            href="/admin/staff" 
            label="Staff" 
            icon={Users} 
            iconColor="text-blue-600" 
            iconHoverColor="hover:text-blue-700" 
          />
        </>
      )}
      
      {(user?.role === 'STAFF' || user?.role === 'ADMIN') && (
        <>
          <Navigation 
            href={user?.role === 'ADMIN' ? '/' : '/staff'} 
            label="Dashboard" 
            icon={LayoutDashboard} 
            iconColor="text-blue-600" 
            iconHoverColor="hover:text-blue-700" 
          />
          <Navigation 
            href="/staff/attendance" 
            label="Daily Visitors" 
            icon={Calendar} 
            iconColor="text-purple-600" 
            iconHoverColor="hover:text-purple-700" 
          />
          <Navigation 
            href="/staff/members?filter=unpaid" 
            label="Unpaid Members" 
            icon={Wallet} 
            iconColor="text-red-600" 
            iconHoverColor="hover:text-red-700" 
          />
          <Navigation 
            href="/staff/members/new" 
            label="Add Member" 
            icon={UserPlus} 
            iconColor="text-teal-600" 
            iconHoverColor="hover:text-teal-700" 
          />
          <Navigation 
            href="/staff/members?filter=active" 
            label="Active Members" 
            icon={UserCheck} 
            iconColor="text-green-600" 
            iconHoverColor="hover:text-green-700" 
          />
          <Navigation 
            href="/staff/balance" 
            label="Balance" 
            icon={Wallet} 
            iconColor="text-emerald-600" 
            iconHoverColor="hover:text-emerald-700" 
          />
          <Navigation 
            href="/staff/members" 
            label="All Members" 
            icon={UsersRound} 
            iconColor="text-indigo-600" 
            iconHoverColor="hover:text-indigo-700" 
          />
        </>
      )}
    </nav>
  );
}

export function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <Logo className="h-10 w-10" variant="auto" />
          <h1 className="text-xl font-bold text-slate-900 hidden lg:block">Gym Manager</h1>
        </div>
        <Suspense fallback={<div className="space-y-2"><div className="h-12 bg-slate-100 rounded-xl animate-pulse" /></div>}>
          <NavigationItems />
        </Suspense>
      </div>
    </div>
  );
}
