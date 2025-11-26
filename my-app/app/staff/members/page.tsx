'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getAllMembers } from '@/lib/data/members';
import { Member } from '@/lib/types/member';
import { MemberList } from '@/components/members/MemberList';
import { MemberWithStatus } from '@/lib/types/member';
import { calculateMembershipStatus } from '@/lib/utils/status';

export default function StaffMembersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<MemberWithStatus[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (!loading && user && user.role !== 'STAFF' && user.role !== 'ADMIN') {
      router.push('/unauthorized');
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && (user.role === 'STAFF' || user.role === 'ADMIN')) {
      loadMembers();
    }
  }, [user]);

  const loadMembers = async () => {
    try {
      const gym_id = user?.role === 'ADMIN' ? undefined : user?.gym_id || null;
      const data = await getAllMembers(gym_id);
      const membersWithStatus: MemberWithStatus[] = data.map(member => ({
        ...member,
        status: calculateMembershipStatus(member.expiryDate),
      }));
      setMembers(membersWithStatus);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  if (loading || loadingMembers) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN')) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Members</h1>
        <p className="text-slate-600 mt-1">Manage gym members</p>
      </div>

      <MemberList 
        members={members}
        showMarkAsPaid={false}
        showUnpaidDetails={false}
        showEditAction={true}
        showFreezeActions={true}
        showUnfreezeActions={false}
        showDormantActions={true}
        showActivateActions={false}
        showDeleteActions={true}
        showRestoreActions={false}
        showInactiveStatus={false}
      />
    </div>
  );
}


