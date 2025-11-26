'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';

export function DateTimeWidget() {
  // Initialize with null to avoid hydration mismatch, then set in useEffect
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time on client side only
    setCurrentTime(new Date());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Show placeholder during SSR and initial client render
  if (!currentTime) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Date & Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-3xl font-bold text-slate-900">--:--:-- --</div>
            <div className="text-lg font-medium text-slate-700">Loading...</div>
            <div className="text-sm text-slate-500">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const timeString = format(currentTime, 'h:mm:ss a');
  const dayString = format(currentTime, 'EEEE');
  const dateString = format(currentTime, 'MMMM do, yyyy');

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Date & Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-3xl font-bold text-slate-900">{timeString}</div>
          <div className="text-lg font-medium text-slate-700">{dayString}</div>
          <div className="text-sm text-slate-500">{dateString}</div>
        </div>
      </CardContent>
    </Card>
  );
}




