'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status/StatusBadge';
import { InactiveStatusBadge } from '@/components/status/InactiveStatusBadge';
import { MemberWithStatus } from '@/lib/types/member';
import { FeeType } from '@/lib/types/fee';
import { format } from 'date-fns';
import { CheckCircle2, Snowflake, Unlock, Trash2, RefreshCw, X, UserMinus, UserPlus } from 'lucide-react';
import { FeeStatus } from '@/lib/types/fee';
import { getInactiveReasons, calculateDueAmount } from '@/lib/utils/filterMembers';
import { calculateMembershipStatus } from '@/lib/utils/status';
import { MembershipStatus } from '@/lib/types/status';

interface MemberCardProps {
  member: MemberWithStatus;
  showMarkAsPaid?: boolean;
  onMarkAsPaid?: (memberId: number) => void;
  showFreezeActions?: boolean;
  showUnfreezeActions?: boolean;
  onFreeze?: (memberId: number) => void;
  onUnfreeze?: (memberId: number) => void;
  showDormantActions?: boolean;
  showActivateActions?: boolean;
  onMarkDormant?: (memberId: number) => void;
  onActivate?: (memberId: number) => void;
  showDeleteActions?: boolean;
  showRestoreActions?: boolean;
  onDelete?: (memberId: number) => void;
  onRestore?: (memberId: number) => void;
  onPermanentDelete?: (memberId: number) => void;
  showInactiveStatus?: boolean; // Show inactive reason badges
  showUnpaidDetails?: boolean; // Show Amount Due and Status for unpaid members
}

export function MemberCard({ 
  member, 
  showMarkAsPaid = false, 
  onMarkAsPaid,
  showFreezeActions = false,
  showUnfreezeActions = false,
  onFreeze,
  onUnfreeze,
  showDormantActions = false,
  showActivateActions = false,
  onMarkDormant,
  onActivate,
  showDeleteActions = false,
  showRestoreActions = false,
  onDelete,
  onRestore,
  onPermanentDelete,
  showInactiveStatus = false,
  showUnpaidDetails = false
}: MemberCardProps) {
  const feeType = member.feeType || FeeType.WITHOUT_AC;
  const planType = feeType === FeeType.WITH_AC ? 'AC' : 'Non-AC';
  const feeAmount = member.feeAmount || (feeType === FeeType.WITH_AC ? 3000 : 2500);
  const memberStatus = (member as any).status || '';
  const isFrozen = memberStatus === 'Freeze' || member.feeStatus === FeeStatus.FREEZE;
  const isDormant = memberStatus === 'Dormant' || member.feeStatus === FeeStatus.DORMANT;
  const isDeleted = (member as any).deletedAt !== undefined;
  
  // Calculate amount due and status for unpaid members
  const dueAmount = showUnpaidDetails ? calculateDueAmount(member) : 0;
  const membershipStatus = calculateMembershipStatus(member.expiryDate);
  const isExpired = membershipStatus === MembershipStatus.EXPIRED;
  const isUnpaid = !member.feePaid || dueAmount > 0;
  const paymentStatus = isExpired ? 'Expired' : (isUnpaid ? 'Unpaid' : 'Paid');
  
  const handleMarkAsPaid = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMarkAsPaid) {
      onMarkAsPaid(member.id);
    }
  };

  const handleFreeze = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFreeze) {
      onFreeze(member.id);
    }
  };

  const handleUnfreeze = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onUnfreeze) {
      onUnfreeze(member.id);
    }
  };

  const handleMarkDormant = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMarkDormant) {
      onMarkDormant(member.id);
    }
  };

  const handleActivate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onActivate) {
      onActivate(member.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(member.id);
    }
  };

  const handleRestore = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRestore) {
      onRestore(member.id);
    }
  };

  const handlePermanentDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPermanentDelete) {
      onPermanentDelete(member.id);
    }
  };
  
  return (
    <Link href={`/members/${member.id}`}>
      <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${isFrozen ? 'border-blue-200 bg-blue-50/30' : ''} ${isDeleted ? 'border-red-200 bg-red-50/30 opacity-75' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-900">{member.name}</h3>
                {isFrozen && !isDeleted && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                    <Snowflake className="mr-1 h-3 w-3" />
                    Frozen
                  </Badge>
                )}
                {isDeleted && (
                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                    <Trash2 className="mr-1 h-3 w-3" />
                    Deleted
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">ID: {member.id}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <StatusBadge status={member.status} />
              {showInactiveStatus && (
                <InactiveStatusBadge reasons={getInactiveReasons(member)} />
              )}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {!showUnpaidDetails && (
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="text-slate-900">{member.phone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">{showUnpaidDetails ? 'Membership Type:' : 'Plan Type:'}</span>
              <Badge variant="outline">{planType}</Badge>
            </div>
            {showUnpaidDetails ? (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Due:</span>
                  <span className="text-red-600 font-semibold">₹{dueAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <Badge 
                    variant="outline" 
                    className={isExpired 
                      ? 'bg-orange-100 text-orange-700 border-orange-300' 
                      : 'bg-red-100 text-red-700 border-red-300'
                    }
                  >
                    {paymentStatus}
                  </Badge>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fee Amount:</span>
                  <span className="text-slate-900 font-medium">₹{feeAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Expires:</span>
                  <span className="text-slate-900">{format(member.expiryDate, 'MMM dd, yyyy')}</span>
                </div>
              </>
            )}
            {isFrozen && !isDeleted && (member as any).frozenDate && (
              <div className="flex justify-between">
                <span className="text-slate-500">Frozen Since:</span>
                <span className="text-blue-600 font-medium">{format(new Date((member as any).frozenDate), 'MMM dd, yyyy')}</span>
              </div>
            )}
            {isDeleted && (member as any).deletedAt && (
              <div className="flex justify-between">
                <span className="text-slate-500">Deleted On:</span>
                <span className="text-red-600 font-medium">{format(new Date((member as any).deletedAt), 'MMM dd, yyyy')}</span>
              </div>
            )}
            {(showMarkAsPaid || showFreezeActions || showUnfreezeActions || showDormantActions || showActivateActions || showDeleteActions || showRestoreActions) && (
              <div className="pt-2 mt-2 border-t border-slate-200 space-y-2">
                {showMarkAsPaid && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleMarkAsPaid}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Mark as Paid
                  </Button>
                )}
                {showFreezeActions && !isFrozen && !isDeleted && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleFreeze}
                    className="w-full border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    <Snowflake className="mr-1 h-3 w-3" />
                    Freeze
                  </Button>
                )}
                {(showUnfreezeActions || (showFreezeActions && isFrozen)) && isFrozen && !isDeleted && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleUnfreeze}
                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Unlock className="mr-1 h-3 w-3" />
                    Unfreeze
                  </Button>
                )}
                {showDormantActions && !isDormant && !isFrozen && !isDeleted && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleMarkDormant}
                    className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                  >
                    <UserMinus className="mr-1 h-3 w-3" />
                    Mark Dormant
                  </Button>
                )}
                {(showActivateActions || (showDormantActions && isDormant)) && isDormant && !isDeleted && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleActivate}
                    className="w-full border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <UserPlus className="mr-1 h-3 w-3" />
                    Activate
                  </Button>
                )}
                {showDeleteActions && !isDeleted && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDelete}
                    className="w-full border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                )}
                {showRestoreActions && isDeleted && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRestore}
                      className="w-full border-green-200 text-green-700 hover:bg-green-50"
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePermanentDelete}
                      className="w-full border-red-300 text-red-800 hover:bg-red-100"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Delete Forever
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

