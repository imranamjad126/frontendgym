'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { format } from 'date-fns';

// Mobile DateTime component
function MobileDateTime() {
  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDateTime(new Date());
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
    <div className="text-xs text-slate-600 font-medium">
      <span className="font-bold">{timeString}</span> {dateString}
    </div>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-50 h-screen transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile header with menu button */}
        <div className="lg:hidden bg-white border-b border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-slate-900">Gym Manager</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
          <MobileDateTime />
        </div>

        {/* Desktop header */}
        <div className="hidden lg:block">
          <Header />
        </div>

        <main className="p-4 lg:p-6 flex-1">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

