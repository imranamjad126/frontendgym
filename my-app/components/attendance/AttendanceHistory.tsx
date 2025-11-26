'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AttendanceRecord } from '@/lib/types/attendance';
import { format } from 'date-fns';

interface AttendanceHistoryProps {
  records: AttendanceRecord[];
}

export function AttendanceHistory({ records }: AttendanceHistoryProps) {
  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-8">No attendance records found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{format(record.date, 'MMM dd, yyyy')}</TableCell>
                <TableCell>{format(record.checkInTime, 'hh:mm a')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}









