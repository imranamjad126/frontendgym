'use client';

import { useState, useEffect, useCallback } from 'react';
import { Member } from '@/lib/types/member';
import { calculateMembershipStatus } from '@/lib/utils/status';
import { MemberWithStatus } from '@/lib/types/member';
import {
  fetchAllMembersFromSupabase,
  addMemberToSupabase,
  updateMemberInSupabase,
  deleteMemberFromSupabase,
  restoreMemberInSupabase,
  permanentlyDeleteMemberFromSupabase,
} from '@/lib/supabase/memberOperations';

export function useSupabaseMembers() {
  const [members, setMembers] = useState<MemberWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(async (includeDeleted: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await fetchAllMembersFromSupabase(includeDeleted);
      
      if (fetchError) {
        setError(fetchError.message);
        setMembers([]);
        return;
      }

      const membersWithStatus: MemberWithStatus[] = data.map(member => ({
        ...member,
        status: calculateMembershipStatus(member.expiryDate),
      }));
      
      setMembers(membersWithStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const refresh = useCallback(async (includeDeleted: boolean = false) => {
    await loadMembers(includeDeleted);
  }, [loadMembers]);

  const addMember = useCallback(async (memberData: {
    name: string;
    phone: string;
    plan: string;
    start_date: string;
    end_date: string;
    status: string;
    email?: string;
    gender?: string;
  }): Promise<{ success: boolean; error: string | null }> => {
    try {
      setError(null);
      const { data, error: addError } = await addMemberToSupabase(memberData);
      
      if (addError) {
        setError(addError.message);
        return { success: false, error: addError.message };
      }

      // Refresh the list after adding
      await refresh();
      
      // Dispatch event for real-time updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('membersUpdated'));
      }

      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add member';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [refresh]);

  const updateMember = useCallback(async (
    id: number,
    updates: Partial<Member>
  ): Promise<{ success: boolean; error: string | null }> => {
    try {
      setError(null);
      const { data, error: updateError } = await updateMemberInSupabase(id, updates);
      
      if (updateError) {
        setError(updateError.message);
        return { success: false, error: updateError.message };
      }

      // Refresh the list after updating
      await refresh();
      
      // Dispatch event for real-time updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('membersUpdated'));
      }

      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update member';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [refresh]);

  const deleteMember = useCallback(async (id: number): Promise<{ success: boolean; error: string | null }> => {
    try {
      setError(null);
      const { success, error: deleteError } = await deleteMemberFromSupabase(id);
      
      if (deleteError || !success) {
        const errorMessage = deleteError?.message || 'Failed to delete member';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Refresh the list after deleting
      await refresh();
      
      // Dispatch event for real-time updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('membersUpdated'));
      }

      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete member';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [refresh]);

  const restoreMember = useCallback(async (id: number): Promise<{ success: boolean; error: string | null }> => {
    try {
      setError(null);
      const { data, error: restoreError } = await restoreMemberInSupabase(id);
      
      if (restoreError) {
        setError(restoreError.message);
        return { success: false, error: restoreError.message };
      }

      // Refresh the list after restoring
      await refresh(true);
      
      // Dispatch event for real-time updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('membersUpdated'));
      }

      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore member';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [refresh]);

  const permanentlyDeleteMember = useCallback(async (id: number): Promise<{ success: boolean; error: string | null }> => {
    try {
      setError(null);
      const { success, error: deleteError } = await permanentlyDeleteMemberFromSupabase(id);
      
      if (deleteError || !success) {
        const errorMessage = deleteError?.message || 'Failed to permanently delete member';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Refresh the list after deleting
      await refresh(true);
      
      // Dispatch event for real-time updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('membersUpdated'));
      }

      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to permanently delete member';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [refresh]);

  return {
    members,
    loading,
    error,
    refresh,
    addMember,
    updateMember,
    deleteMember,
    restoreMember,
    permanentlyDeleteMember,
  };
}



