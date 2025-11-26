// ============================================
// MEMBERS CRUD OPERATIONS
// ============================================

import { supabase } from './client';
import { Member, MemberStatus } from '@/lib/types/member-new';

/**
 * Add a new member
 */
export async function addMember(memberData: {
  name: string;
  phone: string;
  gender?: string | null;
  cnic?: string | null;
  membership_type: string;
  ac_type: string;
  amount: number;
  start_date: string;
  expiry_date: string;
  status: string;
}): Promise<{ data: Member | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('members')
      .insert([memberData])
      .select()
      .single();

    if (error) {
      console.error('Error adding member:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Member, error: null };
  } catch (err) {
    console.error('Exception adding member:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

/**
 * Update a member
 */
export async function updateMember(
  id: string,
  updates: Partial<Omit<Member, 'id' | 'created_at'>>
): Promise<{ data: Member | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating member:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Member, error: null };
  } catch (err) {
    console.error('Exception updating member:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

/**
 * Delete a member (hard delete)
 */
export async function deleteMember(id: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting member:', error);
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Exception deleting member:', err);
    return { success: false, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

/**
 * Get all members
 */
export async function getAllMembers(): Promise<{ data: Member[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching members:', error);
      return { data: [], error: new Error(error.message) };
    }

    return { data: (data || []) as Member[], error: null };
  } catch (err) {
    console.error('Exception fetching members:', err);
    return { data: [], error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

/**
 * Get members by status
 */
export async function getMembersByStatus(status: MemberStatus): Promise<{ data: Member[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching members by status:', error);
      return { data: [], error: new Error(error.message) };
    }

    return { data: (data || []) as Member[], error: null };
  } catch (err) {
    console.error('Exception fetching members by status:', err);
    return { data: [], error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

/**
 * Freeze a member
 */
export async function freezeMember(id: string): Promise<{ data: Member | null; error: Error | null }> {
  return updateMember(id, { status: 'freeze' });
}

/**
 * Mark member as inactive
 */
export async function inactiveMember(id: string): Promise<{ data: Member | null; error: Error | null }> {
  return updateMember(id, { status: 'inactive' });
}

/**
 * Mark member as unpaid
 */
export async function unpaidMember(id: string): Promise<{ data: Member | null; error: Error | null }> {
  return updateMember(id, { status: 'unpaid' });
}

/**
 * Mark member as dormant
 */
export async function dormantMember(id: string): Promise<{ data: Member | null; error: Error | null }> {
  return updateMember(id, { status: 'dormant' });
}

/**
 * Get member by ID
 */
export async function getMemberById(id: string): Promise<{ data: Member | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching member:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Member, error: null };
  } catch (err) {
    console.error('Exception fetching member:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}



