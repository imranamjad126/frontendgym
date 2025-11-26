'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, DollarSign, Wind, TrendingUp } from 'lucide-react';
import { Member } from '@/lib/types/member';
import { FeeType } from '@/lib/types/fee';
import { isSameDay } from 'date-fns';
import { getPaymentsByDateRange, getAllPayments } from '@/lib/storage/paymentStorage';
import { getAllMembers } from '@/lib/storage/memberStorage';

interface TodaysSummaryCardsProps {
  members: Member[];
}

export function TodaysSummaryCards({ members }: TodaysSummaryCardsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  // Get payments for today from payment history
  const paymentsToday = getPaymentsByDateRange(today, todayEnd);

  // New Members Today - check ALL members including deleted ones
  const allMembersIncludingDeleted = getAllMembers(true);
  const newMembersToday = allMembersIncludingDeleted.filter(m => {
    const createdDate = new Date(m.createdAt);
    createdDate.setHours(0, 0, 0, 0);
    return isSameDay(createdDate, today);
  }).length;

  // Fees Collected Today (Without AC) - from payment history
  const feesWithoutACToday = paymentsToday
    .filter(p => p.feeType === FeeType.WITHOUT_AC)
    .reduce((sum, p) => sum + p.amount, 0);

  // Fees Collected Today (With AC) - from payment history
  const feesWithACToday = paymentsToday
    .filter(p => p.feeType === FeeType.WITH_AC)
    .reduce((sum, p) => sum + p.amount, 0);

  // Fees Collected Today (One Day) - from payment history
  const feesOneDayToday = paymentsToday
    .filter(p => p.feeType === FeeType.ONE_DAY)
    .reduce((sum, p) => sum + p.amount, 0);

  // Total Fees Collected Today (includes all: Without AC, With AC, and One Day)
  const totalFeesToday = paymentsToday.reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    {
      label: 'New Members Today',
      value: newMembersToday,
      icon: UserPlus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Fees Collected (Without AC)',
      value: `₹${feesWithoutACToday.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Fees Collected (With AC)',
      value: `₹${feesWithACToday.toLocaleString()}`,
      icon: Wind,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      label: 'Fees Collected (One Day)',
      value: `₹${feesOneDayToday.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Total Fees Collected Today',
      value: `₹${totalFeesToday.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.label}
              </CardTitle>
              <div className={`${stat.bgColor} ${stat.color} p-2 rounded-lg`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}




