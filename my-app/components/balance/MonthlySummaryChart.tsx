'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getPaymentsByDateRange } from '@/lib/storage/paymentStorage';
import { format, subDays } from 'date-fns';

export function MonthlySummaryChart() {
  // Get real payment data for last 30 days
  const chartData = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const thirtyDaysAgo = subDays(today, 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Get all payments in the last 30 days
    const payments = getPaymentsByDateRange(thirtyDaysAgo, today);

    // Group payments by date
    const dailyData: Record<string, number> = {};
    
    payments.forEach(payment => {
      const paymentDate = new Date(payment.paymentDate);
      paymentDate.setHours(0, 0, 0, 0);
      const dateKey = format(paymentDate, 'yyyy-MM-dd');
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = 0;
      }
      dailyData[dateKey] += payment.amount;
    });

    // Create array for last 30 days, including days with no payments
    const data: Array<{ day: number; date: string; amount: number }> = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      date.setHours(0, 0, 0, 0);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      data.push({
        day: date.getDate(),
        date: format(date, 'MMM dd'),
        amount: dailyData[dateKey] || 0, // Use 0 if no payments for that day
      });
    }
    
    return data;
  }, []);


  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Monthly Summary</CardTitle>
        <p className="text-sm text-slate-500 mt-1">Daily fee collection over the last 30 days</p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#1e3a8a" 
                strokeWidth={2}
                dot={{ fill: '#1e3a8a', r: 4 }}
                name="Amount Collected"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}




