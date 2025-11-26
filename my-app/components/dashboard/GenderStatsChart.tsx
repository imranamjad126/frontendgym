'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getAllMembers } from '@/lib/storage/memberStorage';
import { FeeStatus } from '@/lib/types/fee';

const COLORS = {
  boys: '#3b82f6', // Blue
  girls: '#a855f7', // Purple
};

/**
 * Calculate gender stats based on actual member gender
 * Shows real-time data of active members by gender
 */
function calculateGenderStats() {
  const allMembers = getAllMembers();
  
  // Count members by gender (only active members)
  let maleCount = 0;
  let femaleCount = 0;

  allMembers.forEach(member => {
    // Only count active members (not deleted, not frozen, paid, active status)
    if (
      !member.deletedAt &&
      member.status !== 'Freeze' &&
      member.feeStatus !== FeeStatus.FREEZE &&
      member.feePaid === true &&
      member.feeStatus === FeeStatus.ACTIVE
    ) {
      if (member.gender === 'Male') {
        maleCount++;
      } else if (member.gender === 'Female') {
        femaleCount++;
      }
    }
  });

  const total = maleCount + femaleCount;

  // Calculate percentages
  const malePercent = total > 0 ? Math.round((maleCount / total) * 100) : 0;
  const femalePercent = total > 0 ? Math.round((femaleCount / total) * 100) : 0;

  return {
    male: {
      count: maleCount,
      percent: malePercent,
    },
    female: {
      count: femaleCount,
      percent: femalePercent,
    },
    total,
  };
}

export function GenderStatsChart() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Recalculate stats when refreshKey changes
  const stats = useMemo(() => calculateGenderStats(), [refreshKey]);

  // Listen for attendance updates to refresh stats
  useEffect(() => {
    const handleAttendanceUpdate = () => {
      setRefreshKey(prev => prev + 1);
    };

    const handleMemberUpdate = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('attendanceUpdated', handleAttendanceUpdate);
    window.addEventListener('membersUpdated', handleMemberUpdate);

    // Also refresh periodically (every 2 seconds) for real-time updates
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 2000);

    return () => {
      window.removeEventListener('attendanceUpdated', handleAttendanceUpdate);
      window.removeEventListener('membersUpdated', handleMemberUpdate);
      clearInterval(interval);
    };
  }, []);

  const data = [
    { 
      name: 'Male', 
      value: stats.male.count,
      percent: stats.male.percent,
      color: COLORS.boys 
    },
    { 
      name: 'Female', 
      value: stats.female.count,
      percent: stats.female.percent,
      color: COLORS.girls 
    },
  ].filter(item => item.value > 0); // Only show genders with members

  // If no activity, show placeholder
  if (stats.total === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">GYM GENDER STATS</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Active Members by Gender</p>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <p className="text-lg font-medium">No active members</p>
              <p className="text-sm mt-1">Gender stats will appear here once members are added</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">GYM GENDER STATS</CardTitle>
        <p className="text-sm text-slate-500 mt-1">Active Members by Gender</p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string, props: any) => {
                  return [`${value} members (${props.payload.percent}%)`, name];
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-slate-600">
              Male: {stats.male.count} ({stats.male.percent}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span className="text-slate-600">
              Female: {stats.female.count} ({stats.female.percent}%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

