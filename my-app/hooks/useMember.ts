'use client';

import { useState, useEffect, useCallback } from 'react';
import { Member } from '@/lib/types/member';
import { MemberWithStatus } from '@/lib/types/member';
import { getMember } from '@/lib/storage/memberStorage';
import { calculateMembershipStatus } from '@/lib/utils/status';

export function useMember(id: number) {
  const [member, setMember] = useState<MemberWithStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const foundMember = getMember(id);
      if (foundMember) {
        setMember({
          ...foundMember,
          status: calculateMembershipStatus(foundMember.expiryDate),
        });
        setError(null);
      } else {
        setError('Member not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load member');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const refresh = useCallback(() => {
    setLoading(true);
    try {
      const foundMember = getMember(id);
      if (foundMember) {
        setMember({
          ...foundMember,
          status: calculateMembershipStatus(foundMember.expiryDate),
        });
        setError(null);
      } else {
        setError('Member not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh member');
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { member, loading, error, refresh };
}

