'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { TopStatsCards } from '@/components/dashboard/TopStatsCards';
import { FeatureCards } from '@/components/dashboard/FeatureCards';
import { GenderStatsChart } from '@/components/dashboard/GenderStatsChart';
import { AttendanceQuickMark } from '@/components/attendance/AttendanceQuickMark';
import { useMembers } from '@/hooks/useMembers';
import { seedData } from '@/data/seed';
import { getTodayVisitorsCount } from '@/lib/utils/dailyVisitors';

export default function DashboardPage() {
  const { members, loading: membersLoading, refresh: refreshMembers } = useMembers();
  const [todayVisitors, setTodayVisitors] = useState(0);
  const hasSeeded = useRef(false);

  // Function to update today's visitors count
  const updateTodayVisitors = useCallback(() => {
    // Force recalculation with fresh data (no caching)
    const count = getTodayVisitorsCount();
    setTodayVisitors(count);
  }, []);

  useEffect(() => {
    // Seed data on first load if localStorage is empty (only once)
    if (!hasSeeded.current) {
      try {
        seedData();
        hasSeeded.current = true;
        // Refresh after a short delay to ensure seed data is saved
        setTimeout(() => {
          refreshMembers();
          // Force update attendance count after members refresh
          setTimeout(() => {
            updateTodayVisitors();
          }, 200);
        }, 100);
      } catch (error) {
        console.error('Failed to seed data:', error);
      }
    } else {
      // If already seeded, just update the count on mount
      updateTodayVisitors();
    }
  }, [refreshMembers, updateTodayVisitors]);

  // Update visitors count on mount and when members array changes
  useEffect(() => {
    // Force update on mount and when members change
    updateTodayVisitors();
  }, [members.length, updateTodayVisitors]);

  // Force update when page becomes visible (handles tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateTodayVisitors();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [updateTodayVisitors]);

  // Listen for storage changes (when attendance is marked)
  useEffect(() => {
    const handleAttendanceChange = () => {
      // Small delay to ensure storage is updated
      setTimeout(() => {
        updateTodayVisitors();
      }, 50);
    };

    const handleMemberChange = () => {
      // When members are added, deleted, or modified, recalculate attendance count
      // Small delay to ensure storage is updated
      setTimeout(() => {
        updateTodayVisitors();
      }, 50);
    };

    // Listen for custom events
    window.addEventListener('attendanceUpdated', handleAttendanceChange);
    window.addEventListener('membersUpdated', handleMemberChange);
    
    // Also check periodically (every 1 second) for real-time updates
    // Reduced interval for faster updates
    const interval = setInterval(() => {
      updateTodayVisitors();
    }, 1000);

    return () => {
      window.removeEventListener('attendanceUpdated', handleAttendanceChange);
      window.removeEventListener('membersUpdated', handleMemberChange);
      clearInterval(interval);
    };
  }, [updateTodayVisitors]);

  if (membersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }
  // Calculate unpaid members: isPaid === false OR dueAmount > 0
  const unpaidMembers = members.filter(m => {
    const isPaid = m.feePaid === true;
    const dueAmount = isPaid ? 0 : (m.feeAmount || 0);
    return !isPaid || dueAmount > 0;
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Overview of your gym membership management</p>
      </div>


      {/* Top Stats Cards */}
      <TopStatsCards 
        members={members} 
        todayVisitors={todayVisitors}
        unpaidMembers={unpaidMembers}
      />

      {/* Feature Cards */}
      <FeatureCards />

      {/* Attendance Quick Mark */}
      <AttendanceQuickMark />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Center Chart */}
        <div className="space-y-6">
          <GenderStatsChart />
        </div>
      </div>
    </div>
  );
}
