'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, FileText, CreditCard } from 'lucide-react';
import { getTotalExpenses } from '@/lib/utils/expenses';
import { ExpensesModal } from './ExpensesModal';

export function FeatureCards() {
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [isExpensesModalOpen, setIsExpensesModalOpen] = useState(false);

  const updateExpenses = () => {
    const total = getTotalExpenses();
    setTotalExpenses(total);
  };

  useEffect(() => {
    updateExpenses();
  }, []);

  // Listen for member and payment changes
  useEffect(() => {
    const handleMemberChange = () => {
      setTimeout(() => {
        updateExpenses();
      }, 50);
    };

    const handlePaymentChange = () => {
      setTimeout(() => {
        updateExpenses();
      }, 50);
    };

    window.addEventListener('membersUpdated', handleMemberChange);
    window.addEventListener('paymentsUpdated', handlePaymentChange);
    
    // Poll for updates
    const interval = setInterval(() => {
      updateExpenses();
    }, 1000);

    return () => {
      window.removeEventListener('membersUpdated', handleMemberChange);
      window.removeEventListener('paymentsUpdated', handlePaymentChange);
      clearInterval(interval);
    };
  }, []);

  const features = [
    {
      label: 'Expense',
      value: `₹${totalExpenses.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      href: null as string | null,
      onClick: () => setIsExpensesModalOpen(true),
    },
    {
      label: 'Reports',
      value: 'View',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/reports',
      onClick: undefined,
    },
    {
      label: 'Outstanding Dues',
      value: 'View',
      icon: CreditCard,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      href: '/members?filter=unpaid',
      onClick: undefined,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          const cardContent = (
            <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {feature.label}
                </CardTitle>
                <div className={`${feature.bgColor} ${feature.color} p-2 rounded-lg`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{feature.value}</div>
              </CardContent>
            </Card>
          );
          
          return (
            <div key={feature.label}>
              {feature.href ? (
                <Link href={feature.href} className="block">
                  {cardContent}
                </Link>
              ) : (
                <div 
                  className="block cursor-pointer"
                  onClick={feature.onClick || undefined}
                >
                  {cardContent}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Expenses Modal */}
      <ExpensesModal 
        open={isExpensesModalOpen} 
        onOpenChange={setIsExpensesModalOpen} 
      />
    </>
  );
}


