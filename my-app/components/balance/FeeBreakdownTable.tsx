'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Member } from '@/lib/types/member';
import { FeeType } from '@/lib/types/fee';
import { format } from 'date-fns';
import { getAllPayments } from '@/lib/storage/paymentStorage';

interface FeeBreakdownTableProps {
  members: Member[];
}

export function FeeBreakdownTable({ members }: FeeBreakdownTableProps) {
  // Get all payments from payment history (real data only)
  const allPayments = getAllPayments();
  
  // Map payment records to display format
  const feeRecords = allPayments
    .map(payment => ({
      name: payment.memberName,
      feeType: payment.feeType === FeeType.WITH_AC ? 'With AC' : 'Without AC',
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      status: 'Paid' as const,
    }))
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Fee Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {feeRecords.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No fee records found</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member Name</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeRecords.map((record, index) => (
                  <TableRow key={index} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{record.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.feeType}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">₹{record.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-slate-600">
                      {format(new Date(record.paymentDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={record.status === 'Paid' ? 'success' : 'warning'}>
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}




