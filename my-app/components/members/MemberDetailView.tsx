'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status/StatusBadge';
import { ExpiryWarning } from '@/components/status/ExpiryWarning';
import { MemberWithStatus } from '@/lib/types/member';
import { format, differenceInDays } from 'date-fns';
import { FeeType, FeeStatus } from '@/lib/types/fee';
import { Snowflake, Unlock } from 'lucide-react';

interface MemberDetailViewProps {
  member: MemberWithStatus;
  onStatusChange?: () => void;
}

export function MemberDetailView({ member, onStatusChange }: MemberDetailViewProps) {
  const daysRemaining = differenceInDays(member.expiryDate, new Date());
  const feeTypeLabel = 
    member.feeType === FeeType.WITH_AC ? 'With AC' :
    member.feeType === FeeType.WITHOUT_AC ? 'Without AC' :
    member.feeType === FeeType.ONE_DAY ? 'One Day Payment' :
    'N/A';
  const paymentStatus = member.feePaid ? 'Paid' : 'Unpaid';
  const memberStatus = (member as any).status || '';
  const isFrozen = memberStatus === 'Freeze' || member.feeStatus === FeeStatus.FREEZE;

  const handleFreeze = async () => {
    const { freezeMember } = await import('@/lib/storage/memberStorage');
    const result = freezeMember(member.id);
    if (result && onStatusChange) {
      onStatusChange();
    }
  };

  const handleUnfreeze = async () => {
    const { unfreezeMember } = await import('@/lib/storage/memberStorage');
    const result = unfreezeMember(member.id);
    if (result && onStatusChange) {
      onStatusChange();
    }
  };

  return (
    <div className="space-y-6">
      <ExpiryWarning expiryDate={member.expiryDate} status={member.status} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Member Information</CardTitle>
            <div className="flex items-center gap-2">
              <StatusBadge status={member.status} />
              {isFrozen ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUnfreeze}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Unlock className="mr-1 h-3 w-3" />
                  Unfreeze
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleFreeze}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <Snowflake className="mr-1 h-3 w-3" />
                  Freeze
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Name</p>
              <p className="text-base font-medium text-slate-900">{member.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Email</p>
              <p className="text-base font-medium text-slate-900">{member.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Phone</p>
              <p className="text-base font-medium text-slate-900">{member.phone}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Member ID</p>
              <p className="text-base font-medium text-slate-900">#{member.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Membership Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Fee Type</p>
              <Badge variant="outline" className="text-base font-medium">
                {feeTypeLabel}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Fee Amount</p>
              <p className="text-base font-medium text-slate-900">₹{member.feeAmount}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Payment Status</p>
              <Badge variant={member.feePaid ? 'success' : 'destructive'}>
                {paymentStatus}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Fee Status</p>
              <Badge variant="outline">{member.feeStatus}</Badge>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Fee Paid Date</p>
              <p className="text-base font-medium text-slate-900">
                {format(member.feePaidDate, 'MMM dd, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Expiry Date</p>
              <p className="text-base font-medium text-slate-900">
                {format(member.expiryDate, 'MMM dd, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Days Remaining</p>
              <p className={`text-base font-medium ${daysRemaining < 0 ? 'text-red-600' : daysRemaining <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                {daysRemaining < 0 ? `Expired ${Math.abs(daysRemaining)} days ago` : `${daysRemaining} days`}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Created</p>
              <p className="text-base font-medium text-slate-900">
                {format(member.createdAt, 'MMM dd, yyyy')}
              </p>
            </div>
            {isFrozen && (member as any).frozenDate && (
              <div>
                <p className="text-sm text-slate-500 mb-1">Frozen Date</p>
                <p className="text-base font-medium text-blue-600">
                  {format(new Date((member as any).frozenDate), 'MMM dd, yyyy')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

