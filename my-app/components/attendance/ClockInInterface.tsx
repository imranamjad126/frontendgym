'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MemberSearchBar } from './MemberSearchBar';
import { MemberSearchResults } from './MemberSearchResults';
import { CheckInConfirmation } from './CheckInConfirmation';
import { useMembers } from '@/hooks/useMembers';
import { searchMembers } from '@/lib/utils/search';
import { saveAttendance, canMemberMarkAttendance } from '@/lib/storage/attendanceStorage';
import { MembershipStatus } from '@/lib/types/status';
import { MemberWithStatus } from '@/lib/types/member';
import { calculateMembershipStatus } from '@/lib/utils/status';

export function ClockInInterface() {
  const { members, refresh } = useMembers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<MemberWithStatus | null>(null);
  const [confirmation, setConfirmation] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  const filteredMembers = searchQuery.trim()
    ? searchMembers(searchQuery, members)
    : [];

  // Automatically mark attendance when member is selected
  useEffect(() => {
    if (selectedMember) {
      setConfirmation(null);
      
      // Automatically mark attendance
      try {
        // Validate member is active using member ID
        const membershipStatus = calculateMembershipStatus(selectedMember.expiryDate);
        const canMark = canMemberMarkAttendance(selectedMember.id);
        
        if (membershipStatus === MembershipStatus.EXPIRED || !canMark) {
          setConfirmation({
            type: 'error',
            message: `Cannot check in member ID ${selectedMember.id}. Membership has expired or member is inactive. Please renew their membership first.`,
          });
          return;
        }

        // Save attendance using member ID
        saveAttendance(selectedMember.id);
        
        // Dispatch custom event to notify dashboard of attendance update
        window.dispatchEvent(new CustomEvent('attendanceUpdated'));
        
        refresh();

        if (membershipStatus === MembershipStatus.EXPIRING) {
          setConfirmation({
            type: 'warning',
            message: `Check-in successful (ID: ${selectedMember.id}). Warning: ${selectedMember.name}'s membership expires soon.`,
          });
        } else {
          setConfirmation({
            type: 'success',
            message: `Member ID ${selectedMember.id} (${selectedMember.name}) checked in successfully.`,
          });
        }

        // Clear selection after 1.5 seconds
        setTimeout(() => {
          setSelectedMember(null);
          setSearchQuery('');
          setConfirmation(null);
        }, 1500);
      } catch (error) {
        setConfirmation({
          type: 'error',
          message: error instanceof Error ? error.message : 'Failed to record attendance',
        });
      }
    }
  }, [selectedMember, refresh]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Member Check-In</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MemberSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
          />

          {searchQuery.trim() && filteredMembers.length > 0 && (
            <MemberSearchResults
              members={filteredMembers}
              onSelect={setSelectedMember}
              selectedId={selectedMember?.id}
            />
          )}


          {confirmation && (
            <CheckInConfirmation
              type={confirmation.type}
              message={confirmation.message}
              status={selectedMember?.status}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}




