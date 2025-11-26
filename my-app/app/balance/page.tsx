'use client';

import { useEffect, useRef } from 'react';
import { useMembers } from '@/hooks/useMembers';
import { seedData } from '@/data/seed';
import { TodaysSummaryCards } from '@/components/balance/TodaysSummaryCards';
import { FeeBreakdownTable } from '@/components/balance/FeeBreakdownTable';
import { OldDataSummary } from '@/components/balance/OldDataSummary';
import { MonthlySummaryChart } from '@/components/balance/MonthlySummaryChart';
import { TotalBalanceCard } from '@/components/balance/TotalBalanceCard';

export default function BalancePage() {
  const { members, loading, refresh } = useMembers();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Loading balance data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Fees Dashboard</h1>
        <p className="text-slate-600">Financial overview and fee collection tracking</p>
      </div>

      {/* Today's Summary Cards */}
      <TodaysSummaryCards members={members} />

      {/* Fee Breakdown Table */}
      <FeeBreakdownTable members={members} />

      {/* Old Data Summary & Monthly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <OldDataSummary members={members} />
        </div>
        <div className="lg:col-span-2">
          <MonthlySummaryChart />
        </div>
      </div>

      {/* Total Balance Card */}
      <TotalBalanceCard members={members} />
    </div>
  );
}




