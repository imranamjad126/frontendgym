'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export function Header() {
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
      <div className="text-sm text-slate-600 font-medium">
        <span className="font-bold">{timeString}</span> {dateString}
      </div>
    </header>
  );
}




