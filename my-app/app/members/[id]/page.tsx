'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MemberDetailView } from '@/components/members/MemberDetailView';
import { MemberEditForm } from '@/components/members/MemberEditForm';
import { AttendanceHistory } from '@/components/attendance/AttendanceHistory';
import { useMember } from '@/hooks/useMember';
import { useRecentAttendance } from '@/hooks/useAttendance';
import { updateMember } from '@/lib/storage/memberStorage';
import { Button } from '@/components/ui/button';
import { Edit2, ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';
import { MemberWithStatus } from '@/lib/types/member';
import { MembershipSlip } from '@/components/members/MembershipSlip';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = parseInt(params.id as string, 10);
  const { member, loading, refresh } = useMember(memberId);
  const { attendance } = useRecentAttendance(memberId);
  const [isEditing, setIsEditing] = useState(false);
  const [showSlip, setShowSlip] = useState(false);

  const handleSave = (updates: Partial<MemberWithStatus>) => {
    try {
      updateMember(memberId, updates);
      refresh();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update member:', error);
      alert('Failed to update member. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Loading member...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-500 text-lg mb-4">Member not found</p>
          <Link href="/members">
            <Button variant="outline">Back to Members</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/members">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{member.name}</h1>
            <p className="text-slate-600">Member Details</p>
          </div>
        </div>
        {!isEditing && (
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowSlip(true)} variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print Slip
            </Button>
            <Button onClick={() => setIsEditing(true)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Member
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="max-w-2xl">
          <MemberEditForm
            member={member}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <>
          <MemberDetailView member={member} onStatusChange={refresh} />
          <AttendanceHistory records={attendance} />
        </>
      )}

      {/* Membership Slip Modal */}
      {member && (
        <Dialog open={showSlip} onOpenChange={setShowSlip}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <MembershipSlip 
              member={member} 
              onClose={() => setShowSlip(false)}
              showActions={true}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}


