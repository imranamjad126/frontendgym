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
  FileText
} from 'lucide-react';
import { Navigation } from './Navigation';
import { Logo } from './Logo';

function NavigationItems() {
  return (
    <nav className="space-y-2">
          <Navigation 
            href="/" 
            label="Dashboard" 
            icon={LayoutDashboard} 
            iconColor="text-blue-600" 
            iconHoverColor="hover:text-blue-700" 
          />
          <Navigation 
            href="/attendance" 
            label="Daily Visitors" 
            icon={Calendar} 
            iconColor="text-purple-600" 
            iconHoverColor="hover:text-purple-700" 
          />
          <Navigation 
            href="/members?filter=unpaid" 
            label="Unpaid Members" 
            icon={Wallet} 
            iconColor="text-red-600" 
            iconHoverColor="hover:text-red-700" 
          />
          <Navigation 
            href="/members/new" 
            label="Add Member" 
            icon={UserPlus} 
            iconColor="text-teal-600" 
            iconHoverColor="hover:text-teal-700" 
          />
          <Navigation 
            href="/members?filter=active" 
            label="Active Members" 
            icon={UserCheck} 
            iconColor="text-green-600" 
            iconHoverColor="hover:text-green-700" 
          />
          <Navigation 
            href="/balance" 
            label="Balance" 
            icon={Wallet} 
            iconColor="text-emerald-600" 
            iconHoverColor="hover:text-emerald-700" 
          />
          <Navigation 
            href="/reports" 
            label="Reports" 
            icon={FileText} 
            iconColor="text-blue-500" 
            iconHoverColor="hover:text-blue-600" 
          />
          <Navigation 
            href="/members?filter=inactive" 
            label="InActive Members" 
            icon={UserX} 
            iconColor="text-gray-500" 
            iconHoverColor="hover:text-gray-600" 
          />
          <Navigation 
            href="/members?filter=freeze" 
            label="Freeze Members" 
            icon={Snowflake} 
            iconColor="text-sky-600" 
            iconHoverColor="hover:text-sky-700" 
          />
          <Navigation 
            href="/members?filter=dormant" 
            label="Dormant Members" 
            icon={UserMinus} 
            iconColor="text-amber-600" 
            iconHoverColor="hover:text-amber-700" 
          />
          <Navigation 
            href="/members" 
            label="Total Members" 
            icon={UsersRound} 
            iconColor="text-indigo-600" 
            iconHoverColor="hover:text-indigo-700" 
          />
          <Navigation 
            href="/members?filter=deleted" 
            label="Bin" 
            icon={Trash2} 
            iconColor="text-red-700" 
            iconHoverColor="hover:text-red-800" 
          />
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
