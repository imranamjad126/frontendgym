'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getExpensesBreakdown, ExpensesBreakdown } from '@/lib/utils/expenses';
import { Wind, Users, Calendar, DollarSign } from 'lucide-react';

interface ExpensesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExpensesModal({ open, onOpenChange }: ExpensesModalProps) {
  const [breakdown, setBreakdown] = useState<ExpensesBreakdown>({
    acMembers: 0,
    nonAcMembers: 0,
    oneDayPayments: 0,
    total: 0,
  });

  const updateBreakdown = () => {
    const data = getExpensesBreakdown();
    setBreakdown(data);
  };

  useEffect(() => {
    if (open) {
      updateBreakdown();
    }
  }, [open]);

  // Listen for payment changes
  useEffect(() => {
    const handlePaymentChange = () => {
      setTimeout(() => {
        updateBreakdown();
      }, 50);
    };

    const handleMemberChange = () => {
      setTimeout(() => {
        updateBreakdown();
      }, 50);
    };

    window.addEventListener('membersUpdated', handleMemberChange);
    window.addEventListener('paymentsUpdated', handlePaymentChange);
    
    // Poll for updates
    const interval = setInterval(() => {
      if (open) {
        updateBreakdown();
      }
    }, 1000);

    return () => {
      window.removeEventListener('membersUpdated', handleMemberChange);
      window.removeEventListener('paymentsUpdated', handlePaymentChange);
      clearInterval(interval);
    };
  }, [open]);

  const categories = [
    {
      label: 'AC Members',
      value: breakdown.acMembers,
      icon: Wind,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      description: 'Payments from members with AC facility',
    },
    {
      label: 'Non-AC Members',
      value: breakdown.nonAcMembers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Payments from members without AC facility',
    },
    {
      label: 'One Day Payment',
      value: breakdown.oneDayPayments,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'One-time or daily payments',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Expenses Breakdown</DialogTitle>
          <DialogClose onClose={() => onOpenChange(false)} />
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            {/* Total Expenses Card */}
            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  ₹{breakdown.total.toLocaleString()}
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Sum of all expense categories
                </p>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card key={category.label} className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-600">
                        {category.label}
                      </CardTitle>
                      <div className={`${category.bgColor} ${category.color} p-2 rounded-lg`}>
                        <Icon className="h-4 w-4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900">
                        ₹{category.value.toLocaleString()}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Summary */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">AC Members:</span>
                <span className="font-semibold text-slate-900">₹{breakdown.acMembers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-slate-600">Non-AC Members:</span>
                <span className="font-semibold text-slate-900">₹{breakdown.nonAcMembers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-slate-600">One Day Payment:</span>
                <span className="font-semibold text-slate-900">₹{breakdown.oneDayPayments.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-base font-semibold mt-4 pt-4 border-t border-slate-200">
                <span className="text-slate-900">Total Expenses:</span>
                <span className="text-orange-600">₹{breakdown.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

