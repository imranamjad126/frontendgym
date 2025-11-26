'use client';

import { useState, useEffect } from 'react';
import { Member } from '@/lib/types/member';
import { FeeType, FEE_AMOUNTS } from '@/lib/types/fee';
import { format } from 'date-fns';
import { Printer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MembershipSlipProps {
  member: Member;
  onClose?: () => void;
  showActions?: boolean;
}

export function MembershipSlip({ member, onClose, showActions = true }: MembershipSlipProps) {
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    setCurrentDate(format(new Date(), 'dd MMM yyyy'));
  }, []);

  const feeTypeLabel = 
    member.feeType === FeeType.WITH_AC ? 'With AC' :
    member.feeType === FeeType.WITHOUT_AC ? 'Without AC' :
    member.feeType === FeeType.ONE_DAY ? 'One Day Payment' :
    'N/A';

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Safe date formatting with fallback
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'N/A';
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return 'N/A';
      return format(dateObj, 'dd MMM yyyy');
    } catch {
      return 'N/A';
    }
  };

  const paymentDate = formatDate(member.feePaidDate);
  const expiryDate = formatDate(member.expiryDate);

  return (
    <div className="space-y-4" id="membership-slip">
      {/* Actions Bar - Hidden when printing */}
      {showActions && (
        <div className="flex items-center justify-end gap-2 no-print">
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print Slip
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="outline" size="sm">
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          )}
        </div>
      )}

      {/* Membership Slip - Printable */}
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8 border-b-2 border-slate-900 pb-4">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">GYM MANAGER</h1>
            <p className="text-sm text-slate-600">Membership Receipt</p>
          </div>

          {/* Receipt Details */}
          <div className="space-y-6">
            {/* Receipt Number & Date */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500">Receipt No:</p>
                <p className="text-base font-semibold text-slate-900">#{member.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Date:</p>
                <p className="text-base font-semibold text-slate-900">
                  {currentDate || 'Loading...'}
                </p>
              </div>
            </div>

            {/* Member Information */}
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Member Name</p>
                <p className="text-lg font-semibold text-slate-900">{member.name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Member ID</p>
                  <p className="text-base font-medium text-slate-900">#{member.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Phone</p>
                  <p className="text-base font-medium text-slate-900">{member.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Email</p>
                  <p className="text-base font-medium text-slate-900">{member.email}</p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Payment Details</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Fee Type:</span>
                  <span className="text-sm font-medium text-slate-900">{feeTypeLabel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Amount Paid:</span>
                  <span className="text-base font-semibold text-slate-900">
                    ₹{(() => {
                      const amount = member.feeAmount || FEE_AMOUNTS[member.feeType] || 0;
                      return typeof amount === 'number' ? amount.toLocaleString() : '0';
                    })()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Payment Date:</span>
                  <span className="text-sm font-medium text-slate-900">
                    {paymentDate}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Expiry Date:</span>
                  <span className="text-sm font-medium text-slate-900">
                    {expiryDate}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Payment Status:</span>
                  <span className={`text-sm font-semibold ${member.feePaid ? 'text-green-600' : 'text-red-600'}`}>
                    {member.feePaid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-slate-900 pt-4 mt-8">
              <div className="text-center space-y-2">
                <p className="text-xs text-slate-500">
                  This is a computer-generated receipt. No signature required.
                </p>
                <p className="text-xs text-slate-500">
                  Thank you for choosing Gym Manager!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

