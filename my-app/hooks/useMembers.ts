'use client';

import { useState, useEffect, useCallback } from 'react';
import { Member } from '@/lib/types/member';
import { getAllMembers } from '@/lib/storage/memberStorage';
import { calculateMembershipStatus } from '@/lib/utils/status';
import { MemberWithStatus } from '@/lib/types/member';

export function useMembers() {
  const [members, setMembers] = useState<MemberWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(() => {
    try {
      const allMembers = getAllMembers();
      const membersWithStatus: MemberWithStatus[] = allMembers.map(member => ({
        ...member,
        status: calculateMembershipStatus(member.expiryDate),
      }));
      setMembers(membersWithStatus);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const refresh = useCallback(() => {
    setLoading(true);
    try {
      const allMembers = getAllMembers();
      const membersWithStatus: MemberWithStatus[] = allMembers.map(member => ({
        ...member,
        status: calculateMembershipStatus(member.expiryDate),
      }));
      setMembers(membersWithStatus);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh members');
    } finally {
      setLoading(false);
    }
  }, []);

  return { members, loading, error, refresh };
}

