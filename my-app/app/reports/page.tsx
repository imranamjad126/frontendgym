'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useMembers } from '@/hooks/useMembers';
import { seedData } from '@/data/seed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Download, Calendar } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { getPaymentsByDateRange } from '@/lib/storage/paymentStorage';
import { getActiveAttendanceCount, getMonthlyAttendanceData, getNewMembersCount } from '@/lib/utils/attendanceReports';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

type ReportType = 'daily' | 'monthly';

export default function ReportsPage() {
  const { members, loading, refresh } = useMembers();
  const hasSeeded = useRef(false);
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render when data changes

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

  // Listen for member and attendance changes to force refresh
  useEffect(() => {
    const handleMemberChange = () => {
      setRefreshKey(prev => prev + 1);
      refresh();
    };

    const handleAttendanceChange = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('membersUpdated', handleMemberChange);
    window.addEventListener('attendanceUpdated', handleAttendanceChange);

    return () => {
      window.removeEventListener('membersUpdated', handleMemberChange);
      window.removeEventListener('attendanceUpdated', handleAttendanceChange);
    };
  }, [refresh]);

  // Calculate daily report data (only active members)
  const getDailyReport = () => {
    const date = new Date(selectedDate);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    // Get attendance count for the selected date (only active members)
    const attendanceCount = getActiveAttendanceCount(date);

    // Get new members created on the selected date (only active members)
    const newMembersToday = getNewMembersCount(dayStart, dayEnd);

    // Get payments from payment history for the selected date
    const paymentsToday = getPaymentsByDateRange(dayStart, dayEnd);
    const totalRevenue = paymentsToday.reduce((sum, p) => sum + p.amount, 0);

    return {
      date: format(date, 'MMM dd, yyyy'),
      attendance: attendanceCount,
      newMembers: newMembersToday,
      payments: paymentsToday.length,
      revenue: totalRevenue,
      paymentDetails: paymentsToday,
    };
  };

  // Calculate monthly report data (only active members, all days of month)
  const getMonthlyReport = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));

    // Get monthly attendance data (all days of month, only active members)
    const monthlyAttendanceData = getMonthlyAttendanceData(year, month);
    
    // Calculate total attendance for the month (sum of all days)
    const totalAttendance = monthlyAttendanceData.reduce((sum, day) => sum + day.attendance, 0);

    // Get new members created in the selected month (only active members)
    const newMembersThisMonth = getNewMembersCount(monthStart, monthEnd);

    // Get payments from payment history for the selected month
    const paymentsThisMonth = getPaymentsByDateRange(monthStart, monthEnd);
    const totalRevenue = paymentsThisMonth.reduce((sum, p) => sum + p.amount, 0);

    // Build chart data with revenue per day
    const revenueByDate = new Map<string, number>();
    paymentsThisMonth.forEach(payment => {
      const dateKey = format(new Date(payment.paymentDate), 'yyyy-MM-dd');
      const currentRevenue = revenueByDate.get(dateKey) || 0;
      revenueByDate.set(dateKey, currentRevenue + payment.amount);
    });

    // Combine attendance and revenue data for chart
    const chartData = monthlyAttendanceData.map(dayData => {
      const dateKey = format(new Date(year, month - 1, dayData.day), 'yyyy-MM-dd');
      const revenue = revenueByDate.get(dateKey) || 0;
      
      return {
        date: dayData.date,
        day: dayData.day,
        attendance: dayData.attendance,
        revenue: revenue,
      };
    });

    return {
      month: format(monthStart, 'MMMM yyyy'),
      attendance: totalAttendance,
      newMembers: newMembersThisMonth,
      payments: paymentsThisMonth.length,
      revenue: totalRevenue,
      chartData,
      paymentDetails: paymentsThisMonth,
    };
  };

  // Recalculate reports when data changes (refreshKey forces recalculation)
  // useMemo ensures reports are recalculated when members, dates, or refreshKey changes
  const dailyReport = useMemo(() => getDailyReport(), [selectedDate, refreshKey, members.length]);
  const monthlyReport = useMemo(() => getMonthlyReport(), [selectedMonth, refreshKey, members.length]);

  const handleExport = () => {
    if (reportType === 'daily') {
      const data = `Daily Report - ${dailyReport.date}\n\nAttendance: ${dailyReport.attendance}\nNew Members: ${dailyReport.newMembers}\nPayments: ${dailyReport.payments}\nRevenue: ₹${dailyReport.revenue}`;
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daily-report-${format(new Date(), 'yyyy-MM-dd')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const data = `Monthly Report - ${monthlyReport.month}\n\nAttendance: ${monthlyReport.attendance}\nNew Members: ${monthlyReport.newMembers}\nPayments: ${monthlyReport.payments}\nRevenue: ₹${monthlyReport.revenue}`;
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monthly-report-${format(new Date(), 'yyyy-MM-dd')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Reports</h1>
          <p className="text-slate-600">View daily and monthly gym reports</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Report Type Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Button
              variant={reportType === 'daily' ? 'default' : 'outline'}
              onClick={() => setReportType('daily')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Daily Report
            </Button>
            <Button
              variant={reportType === 'monthly' ? 'default' : 'outline'}
              onClick={() => setReportType('monthly')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Monthly Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Date/Month Selector */}
      <Card>
        <CardContent className="pt-6">
          {reportType === 'daily' ? (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Select Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="max-w-xs"
              />
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Select Month</label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="max-w-xs"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Content */}
      {reportType === 'daily' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600">Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{dailyReport.attendance}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600">New Members</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{dailyReport.newMembers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600">Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{dailyReport.payments}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">₹{dailyReport.revenue.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600">Total Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">{monthlyReport.attendance}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600">New Members</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">{monthlyReport.newMembers}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600">Total Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">{monthlyReport.payments}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">₹{monthlyReport.revenue.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Chart - Shows all days of month with active members' attendance */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Attendance Summary</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Daily attendance over {monthlyReport.month} (Active Members Only)</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyReport.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#64748b"
                    style={{ fontSize: '11px' }}
                    label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'Attendance (Active Members)') {
                        return [value, 'Active Members'];
                      }
                      return [`₹${value.toLocaleString()}`, 'Revenue'];
                    }}
                    labelFormatter={(label) => `${monthlyReport.month} - Day ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="attendance" fill="#3b82f6" name="Attendance (Active Members)" />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

