'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { Member } from '@/lib/types/member';
import { getAllPayments } from '@/lib/storage/paymentStorage';

interface TotalBalanceCardProps {
  members: Member[];
}

export function TotalBalanceCard({ members }: TotalBalanceCardProps) {
  // Get all payments from payment history (real data only)
  const allPayments = getAllPayments();
  
  // Current Members Fees - sum of all payments in payment history
  const currentMembersFees = allPayments.reduce((sum, p) => sum + p.amount, 0);
  
  // Historical Data - if manager has provided historical data, it would be in payment history
  // For now, we only show current members fees (no dummy data)
  const historicalData = 0; // Only show if manager provides historical data
  
  // Total Lifetime Balance - sum of current + historical (as provided by manager)
  const totalLifetimeBalance = currentMembersFees + historicalData;
  
  // Grand Total - same as total lifetime balance (current + historical)
  const grandTotal = totalLifetimeBalance;

  return (
    <Card className="shadow-md bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">Total Lifetime Balance</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Sum of all fees ever collected</p>
          </div>
          <div className="bg-slate-100 text-slate-600 p-4 rounded-xl">
            <Wallet className="h-8 w-8" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-500 mb-2">Current Members Fees</p>
            <p className="text-3xl font-bold text-slate-900">₹{currentMembersFees.toLocaleString()}</p>
          </div>
          {historicalData > 0 && (
            <div className="border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-500 mb-2">Historical Data</p>
              <p className="text-lg font-medium text-slate-600">₹{historicalData.toLocaleString()}</p>
            </div>
          )}
          <div className="border-t border-slate-200 pt-4">
            <p className="text-sm font-medium text-slate-600 mb-2">Grand Total</p>
            <p className="text-4xl font-bold text-slate-900">₹{grandTotal.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}




