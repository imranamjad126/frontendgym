'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status/StatusBadge';
import { InactiveStatusBadge } from '@/components/status/InactiveStatusBadge';
import { MemberCard } from './MemberCard';
import { MemberWithStatus } from '@/lib/types/member';
import { FeeType } from '@/lib/types/fee';
import { format } from 'date-fns';
import Link from 'next/link';
import { CheckCircle2, Snowflake, Unlock, Trash2, RotateCcw, X, RefreshCw, UserMinus, UserPlus, Edit2 } from 'lucide-react';
import { FeeStatus } from '@/lib/types/fee';
import { getInactiveReasons, isMemberInactive } from '@/lib/utils/filterMembers';
import { calculateDueAmount } from '@/lib/utils/filterMembers';
import { calculateMembershipStatus } from '@/lib/utils/status';
import { MembershipStatus } from '@/lib/types/status';
import { MemberEditForm } from './MemberEditForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface MemberListProps {
  members: MemberWithStatus[];
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
  showUnpaidDetails?: boolean; // Show Amount Due and Status columns for unpaid members
  showEditAction?: boolean; // Show Edit button in Actions column
  onEdit?: (member: MemberWithStatus) => void; // Callback when Edit is clicked
}

export function MemberList({ 
  members, 
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
  showUnpaidDetails = false,
  showEditAction = false,
  onEdit
}: MemberListProps) {
  const [editingMember, setEditingMember] = useState<MemberWithStatus | null>(null);
  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-lg">No members found</p>
        <p className="text-slate-400 text-sm mt-2">
          {showUnfreezeActions ? 'No frozen members at the moment' : 
           showRestoreActions ? 'No deleted members. The bin is empty.' : 
           'Add your first member to get started'}
        </p>
      </div>
    );
  }

  const handleMarkAsPaid = (memberId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMarkAsPaid) {
      onMarkAsPaid(memberId);
    }
  };

  const handleFreeze = (memberId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFreeze) {
      onFreeze(memberId);
    }
  };

  const handleUnfreeze = (memberId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onUnfreeze) {
      onUnfreeze(memberId);
    }
  };

  const handleDelete = (memberId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(memberId);
    }
  };

  const handleRestore = (memberId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRestore) {
      onRestore(memberId);
    }
  };

  const handlePermanentDelete = (memberId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPermanentDelete) {
      onPermanentDelete(memberId);
    }
  };

  const handleEdit = (member: MemberWithStatus, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingMember(member);
    if (onEdit) {
      onEdit(member);
    }
  };

  const handleEditSave = (updates: Partial<MemberWithStatus>) => {
    if (editingMember && onEdit) {
      // The parent component should handle the actual update
      // This is just to close the modal
      setEditingMember(null);
    }
  };

  const handleEditCancel = () => {
    setEditingMember(null);
  };

  const isMemberFrozen = (member: MemberWithStatus) => {
    const memberStatus = (member as any).status || '';
    return memberStatus === 'Freeze' || member.feeStatus === FeeStatus.FREEZE;
  };

  const isMemberDeleted = (member: MemberWithStatus) => {
    return (member as any).deletedAt !== undefined;
  };

  const isMemberDormant = (member: MemberWithStatus) => {
    const memberStatus = (member as any).status || '';
    return memberStatus === 'Dormant' || member.feeStatus === FeeStatus.DORMANT;
  };

  const handleMarkDormant = (memberId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMarkDormant) {
      onMarkDormant(memberId);
    }
  };

  const handleActivate = (memberId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onActivate) {
      onActivate(memberId);
    }
  };

  return (
    <>
      {/* Desktop: Table view */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              {!showUnpaidDetails && <TableHead>Phone</TableHead>}
              <TableHead>{showUnpaidDetails ? 'Membership Type' : 'Plan Type'}</TableHead>
              {showUnpaidDetails && <TableHead>Amount Due</TableHead>}
              {!showUnpaidDetails && <TableHead>Fee Amount</TableHead>}
              {showUnpaidDetails && <TableHead>Status</TableHead>}
              {!showUnpaidDetails && <TableHead>Status</TableHead>}
              {!showUnpaidDetails && <TableHead>Expiry Date</TableHead>}
              {showRestoreActions && <TableHead>Deleted Date</TableHead>}
              {(showMarkAsPaid || showFreezeActions || showUnfreezeActions || showDormantActions || showActivateActions || showDeleteActions || showRestoreActions || showEditAction) && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const feeType = member.feeType || FeeType.WITHOUT_AC;
              const planType = feeType === FeeType.WITH_AC ? 'AC' : 'Non-AC';
              const feeAmount = member.feeAmount || (feeType === FeeType.WITH_AC ? 3000 : 2500);
              const frozen = isMemberFrozen(member);
              const deleted = isMemberDeleted(member);
              
              // Calculate amount due and status for unpaid members
              const dueAmount = showUnpaidDetails ? calculateDueAmount(member) : 0;
              const membershipStatus = calculateMembershipStatus(member.expiryDate);
              const isExpired = membershipStatus === MembershipStatus.EXPIRED;
              const isUnpaid = !member.feePaid || dueAmount > 0;
              const paymentStatus = isExpired ? 'Expired' : (isUnpaid ? 'Unpaid' : 'Paid');
              
              return (
                <TableRow key={member.id} className={`hover:bg-slate-50 ${frozen ? 'bg-blue-50/50' : ''} ${deleted ? 'bg-red-50/50 opacity-75' : ''}`}>
                  <TableCell className="font-medium">{member.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/members/${member.id}`} className="text-slate-900 hover:text-slate-700 font-medium">
                        {member.name}
                      </Link>
                      {frozen && !deleted && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                          <Snowflake className="mr-1 h-3 w-3" />
                          Frozen
                        </Badge>
                      )}
                      {deleted && (
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                          <Trash2 className="mr-1 h-3 w-3" />
                          Deleted
                        </Badge>
                      )}
                    </div>
                    {frozen && !deleted && (member as any).frozenDate && (
                      <p className="text-xs text-blue-600 mt-1">
                        Since {format(new Date((member as any).frozenDate), 'MMM dd, yyyy')}
                      </p>
                    )}
                    {deleted && (member as any).deletedAt && (
                      <p className="text-xs text-red-600 mt-1">
                        Deleted on {format(new Date((member as any).deletedAt), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </TableCell>
                  {!showUnpaidDetails && <TableCell className="text-slate-600">{member.phone}</TableCell>}
                  <TableCell>
                    <Badge variant="outline">{planType}</Badge>
                  </TableCell>
                  {showUnpaidDetails ? (
                    <>
                      <TableCell className="font-medium text-red-600">
                        ₹{dueAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={isExpired 
                            ? 'bg-orange-100 text-orange-700 border-orange-300' 
                            : 'bg-red-100 text-red-700 border-red-300'
                          }
                        >
                          {paymentStatus}
                        </Badge>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium text-slate-900">₹{feeAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {(() => {
                            // Determine status: Active, Inactive, or Expired
                            const membershipStatus = calculateMembershipStatus(member.expiryDate);
                            const isExpired = membershipStatus === MembershipStatus.EXPIRED;
                            const isInactive = isMemberInactive(member);
                            
                            if (isExpired) {
                              return <StatusBadge status={MembershipStatus.EXPIRED} />;
                            } else if (isInactive) {
                              return (
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                                  Inactive
                                </Badge>
                              );
                            } else {
                              return <StatusBadge status={MembershipStatus.ACTIVE} />;
                            }
                          })()}
                          {showInactiveStatus && (
                            <InactiveStatusBadge reasons={getInactiveReasons(member)} />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {format(member.expiryDate, 'MMM dd, yyyy')}
                      </TableCell>
                    </>
                  )}
                  {showRestoreActions && (
                    <TableCell className="text-slate-600">
                      {(member as any).deletedAt 
                        ? format(new Date((member as any).deletedAt), 'MMM dd, yyyy')
                        : '—'}
                    </TableCell>
                  )}
                  {(showMarkAsPaid || showFreezeActions || showUnfreezeActions || showDormantActions || showActivateActions || showDeleteActions || showRestoreActions || showEditAction) && (
                    <TableCell>
                      <div className="flex items-center gap-2 flex-wrap">
                        {showEditAction && !deleted && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleEdit(member, e)}
                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                        )}
                        {showMarkAsPaid && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={(e) => handleMarkAsPaid(member.id, e)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Mark as Paid
                          </Button>
                        )}
                        {showFreezeActions && !frozen && !deleted && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleFreeze(member.id, e)}
                            className="border-slate-200 text-slate-700 hover:bg-slate-50"
                          >
                            <Snowflake className="mr-1 h-3 w-3" />
                            Freeze
                          </Button>
                        )}
                        {(showUnfreezeActions || (showFreezeActions && frozen)) && frozen && !deleted && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleUnfreeze(member.id, e)}
                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            <Unlock className="mr-1 h-3 w-3" />
                            Unfreeze
                          </Button>
                        )}
                        {showDormantActions && !isMemberDormant(member) && !frozen && !deleted && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleMarkDormant(member.id, e)}
                            className="border-orange-200 text-orange-700 hover:bg-orange-50"
                          >
                            <UserMinus className="mr-1 h-3 w-3" />
                            Mark Dormant
                          </Button>
                        )}
                        {(showActivateActions || (showDormantActions && isMemberDormant(member))) && isMemberDormant(member) && !deleted && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleActivate(member.id, e)}
                            className="border-green-200 text-green-700 hover:bg-green-50"
                          >
                            <UserPlus className="mr-1 h-3 w-3" />
                            Activate
                          </Button>
                        )}
                        {showDeleteActions && !deleted && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleDelete(member.id, e)}
                            className="border-red-200 text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Delete
                          </Button>
                        )}
                        {showRestoreActions && deleted && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => handleRestore(member.id, e)}
                              className="border-green-200 text-green-700 hover:bg-green-50"
                            >
                              <RefreshCw className="mr-1 h-3 w-3" />
                              Restore
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => handlePermanentDelete(member.id, e)}
                              className="border-red-300 text-red-800 hover:bg-red-100"
                            >
                              <X className="mr-1 h-3 w-3" />
                              Delete Forever
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: Card view */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {members.map((member) => (
          <MemberCard 
            key={member.id} 
            member={member}
            showUnpaidDetails={showUnpaidDetails}
            showMarkAsPaid={showMarkAsPaid}
            onMarkAsPaid={onMarkAsPaid}
            showFreezeActions={showFreezeActions}
            showDormantActions={showDormantActions}
            showActivateActions={showActivateActions}
            onMarkDormant={onMarkDormant}
            onActivate={onActivate}
            showUnfreezeActions={showUnfreezeActions}
            onFreeze={onFreeze}
            onUnfreeze={onUnfreeze}
            showDeleteActions={showDeleteActions}
            showRestoreActions={showRestoreActions}
            onDelete={onDelete}
            onRestore={onRestore}
            onPermanentDelete={onPermanentDelete}
            showInactiveStatus={showInactiveStatus}
          />
        ))}
      </div>

      {/* Edit Member Modal */}
      {editingMember && (
        <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <MemberEditForm
              member={editingMember}
              onSave={(updates) => {
                if (onEdit) {
                  onEdit({ ...editingMember, ...updates });
                }
                setEditingMember(null);
              }}
              onCancel={handleEditCancel}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

