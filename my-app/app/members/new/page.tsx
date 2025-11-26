'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MemberForm } from '@/components/members/MemberForm';
import { MembershipSlip } from '@/components/members/MembershipSlip';
import { useMembers } from '@/hooks/useMembers';
import { saveMember } from '@/lib/storage/memberStorage';
import { FeeType, FeeStatus, FEE_AMOUNTS } from '@/lib/types/fee';
import { Member } from '@/lib/types/member';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function AddMemberPage() {
  const router = useRouter();
  const { refresh } = useMembers();
  const [newMember, setNewMember] = useState<Member | null>(null);
  const [showSlip, setShowSlip] = useState(false);

  const handleSubmit = (data: {
    name: string;
    email: string;
    phone: string;
    gender?: string;
    feeType: string;
    feePaidDate: string;
    expiryDate: string;
  }) => {
    try {
      const feeType = data.feeType as FeeType;
      
      const savedMember = saveMember({
        name: data.name,
        email: data.email,
        phone: data.phone,
        gender: data.gender as 'Male' | 'Female' | undefined,
        feeType: feeType,
        feeAmount: FEE_AMOUNTS[feeType],
        feePaid: true,
        feeStatus: FeeStatus.ACTIVE,
        status: 'Active',
        feePaidDate: new Date(data.feePaidDate),
        expiryDate: new Date(data.expiryDate),
      });

      refresh();
      setNewMember(savedMember);
      setShowSlip(true);
    } catch (error) {
      console.error('Failed to save member:', error);
      alert('Failed to save member. Please try again.');
    }
  };

  const handleCloseSlip = () => {
    setShowSlip(false);
    if (newMember) {
      router.push(`/members/${newMember.id}`);
    } else {
      router.push('/members');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Add New Member</h1>
          <p className="text-slate-600">Register a new gym member</p>
        </div>

        <div className="max-w-2xl">
          <MemberForm onSubmit={handleSubmit} />
        </div>
      </div>

      {/* Membership Slip Modal */}
      {newMember && (
        <Dialog open={showSlip} onOpenChange={setShowSlip}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <MembershipSlip 
              member={newMember} 
              onClose={handleCloseSlip}
              showActions={true}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

