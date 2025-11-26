'use client';

import { useEffect, useRef } from 'react';
import { ClockInInterface } from '@/components/attendance/ClockInInterface';
import { seedData } from '@/data/seed';
import { useMembers } from '@/hooks/useMembers';

export default function AttendancePage() {
  const { refresh } = useMembers();
  const hasSeeded = useRef(false);

  useEffect(() => {
    if (!hasSeeded.current) {
      try {
        seedData();
        hasSeeded.current = true;
        setTimeout(() => {
          refresh();
        }, 100);
      } catch (error) {
        console.error('Failed to seed data:', error);
      }
    }
  }, [refresh]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Attendance</h1>
        <p className="text-slate-600">Check in members for gym attendance</p>
      </div>

      <div className="max-w-4xl">
        <ClockInInterface />
      </div>
    </div>
  );
}

