'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UsersRound, Calendar, Wallet } from 'lucide-react';
import { MemberWithStatus } from '@/lib/types/member';

interface TopStatsCardsProps {
  members: MemberWithStatus[];
  todayVisitors?: number;
  unpaidMembers?: number;
}

export function TopStatsCards({ members, todayVisitors = 0, unpaidMembers = 0 }: TopStatsCardsProps) {
  const paidMembers = members.filter(m => m.feePaid === true).length;
  const totalMembers = members.length;

  const stats = [
    {
      label: 'Paid Members',
      value: paidMembers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Members',
      value: totalMembers,
      icon: UsersRound,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
    },
    {
      label: "Today's Visitors",
      value: todayVisitors,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Unpaid Members',
      value: unpaidMembers,
      icon: Wallet,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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


