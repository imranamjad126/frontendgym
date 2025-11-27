'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function Header() {
  const { user, logout, loading, session } = useAuth();
  
  // Don't redirect, just show header
  if (loading) {
    return (
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
        <h2 className="text-lg font-semibold text-slate-900">Gym Membership Management</h2>
        <div className="text-sm text-slate-500">Loading...</div>
      </header>
    );
  }
  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time on client side only
    setCurrentDateTime(new Date());
    
    // Update every second
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format: "5:02:26 PM Monday November 24th, 2025"
  const timeString = currentDateTime 
    ? format(currentDateTime, 'h:mm:ss a')
    : 'Loading...';
  const dateString = currentDateTime 
    ? format(currentDateTime, 'EEEE MMMM do, yyyy')
    : '';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold text-slate-900">Gym Membership Management</h2>
      <div className="flex items-center gap-4">
        {user && (
          <div className="text-sm text-slate-600">
            <span className="font-medium">{user.email}</span>
            <span className="mx-2">•</span>
            <span className="text-slate-500">{user.role}</span>
          </div>
        )}
        <div className="text-sm text-slate-600 font-medium">
          <span className="font-bold">{timeString}</span> {dateString}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}




