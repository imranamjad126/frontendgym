'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { MemberForm } from '@/components/members/MemberForm';
import { MembershipSlip } from '@/components/members/MembershipSlip';
import { createMember } from '@/lib/data/members';
import { FeeType, FeeStatus, FEE_AMOUNTS } from '@/lib/types/fee';
import { Member } from '@/lib/types/member';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function AddMemberPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [newMember, setNewMember] = useState<Member | null>(null);
  const [showSlip, setShowSlip] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (!loading && user && user.role !== 'STAFF' && user.role !== 'OWNER') {
      router.push('/unauthorized');
      return;
    }
  }, [user, loading, router]);

  const handleSubmit = async (data: {
    name: string;
    email: string;
    phone: string;
    gender?: string;
    feeType: string;
    feePaidDate: string;
    expiryDate: string;
  }) => {
    if (!user) return;

    const gym_id = user.gym_id || '';

    if (!gym_id) {
      alert('Gym ID is required');
      return;
    }

    try {
      const feeType = data.feeType as FeeType;
      
      const savedMember = await createMember({
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
        gym_id,
      });

      setNewMember(savedMember);
      setShowSlip(true);
    } catch (error: any) {
      console.error('Failed to save member:', error);
      alert('Failed to save member. Please try again.');
    }
  };

  const handleCloseSlip = () => {
    setShowSlip(false);
    if (newMember) {
      router.push(`/staff/members/${newMember.id}`);
    } else {
      router.push('/staff/members');
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

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

      {newMember && (
        <Dialog open={showSlip} onOpenChange={setShowSlip}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <MembershipSlip 
              member={newMember as any} 
              onClose={handleCloseSlip}
              showActions={true}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}



