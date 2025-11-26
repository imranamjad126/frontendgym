'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { Member } from '@/lib/types/member';
import { subDays } from 'date-fns';
import { getPaymentsByDateRange } from '@/lib/storage/paymentStorage';

interface OldDataSummaryProps {
  members: Member[];
}

export function OldDataSummary({ members }: OldDataSummaryProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);
  
  const yesterday = subDays(today, 1);
  yesterday.setHours(0, 0, 0, 0);
  const yesterdayEnd = new Date(yesterday);
  yesterdayEnd.setHours(23, 59, 59, 999);
  
  const sevenDaysAgo = subDays(today, 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  
  const thirtyDaysAgo = subDays(today, 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  // Yesterday's Fees - from payment history
  const yesterdayFees = getPaymentsByDateRange(yesterday, yesterdayEnd)
    .reduce((sum, p) => sum + p.amount, 0);

  // Last 7 Days Fees (including today) - from payment history
  const last7DaysFees = getPaymentsByDateRange(sevenDaysAgo, todayEnd)
    .reduce((sum, p) => sum + p.amount, 0);

  // Last 30 Days Fees (including today) - from payment history
  const last30DaysFees = getPaymentsByDateRange(thirtyDaysAgo, todayEnd)
    .reduce((sum, p) => sum + p.amount, 0);

  const summaries = [
    {
      label: "Yesterday's Fees",
      value: `₹${yesterdayFees.toLocaleString()}`,
      icon: Calendar,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
    },
    {
      label: 'Last 7 Days Fees',
      value: `₹${last7DaysFees.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Last 30 Days Fees',
      value: `₹${last30DaysFees.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-4">
      {summaries.map((summary) => {
        const Icon = summary.icon;
        return (
          <Card key={summary.label} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {summary.label}
              </CardTitle>
              <div className={`${summary.bgColor} ${summary.color} p-2 rounded-lg`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{summary.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

