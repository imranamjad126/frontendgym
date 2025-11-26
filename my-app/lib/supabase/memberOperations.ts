import { supabase } from '../supabase';
import { Member } from '../types/member';
import { FeeType, FEE_AMOUNTS } from '../types/fee';

// Supabase table structure mapping
interface SupabaseMember {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  plan: string; // 'WITH_AC' | 'WITHOUT_AC' | 'ONE_DAY'
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  status: string; // 'active' | 'inactive' | 'expired' | 'freeze' | 'dormant'
  gender?: string; // 'Male' | 'Female'
  fee_amount?: number;
  fee_paid?: boolean;
  fee_paid_date?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  frozen_date?: string | null;
}

// Convert Supabase member to app Member format
function supabaseToMember(supabaseMember: SupabaseMember): Member {
  return {
    id: supabaseMember.id || 0,
    name: supabaseMember.name,
    email: supabaseMember.email || '',
    phone: supabaseMember.phone,
    gender: supabaseMember.gender as 'Male' | 'Female' | undefined,
    feeType: (supabaseMember.plan as FeeType) || FeeType.WITHOUT_AC,
    feeAmount: supabaseMember.fee_amount || FEE_AMOUNTS[supabaseMember.plan as FeeType] || FEE_AMOUNTS[FeeType.WITHOUT_AC],
    feePaid: supabaseMember.fee_paid ?? false,
    feeStatus: supabaseMember.status === 'active' ? 'ACTIVE' : supabaseMember.status === 'inactive' ? 'UNPAID' : 'EXPIRED',
    feePaidDate: supabaseMember.fee_paid_date ? new Date(supabaseMember.fee_paid_date) : new Date(supabaseMember.start_date),
    expiryDate: new Date(supabaseMember.end_date),
    status: supabaseMember.status,
    frozenDate: supabaseMember.frozen_date ? new Date(supabaseMember.frozen_date) : undefined,
    deletedAt: supabaseMember.deleted_at ? new Date(supabaseMember.deleted_at) : undefined,
    createdAt: supabaseMember.created_at ? new Date(supabaseMember.created_at) : new Date(),
    updatedAt: supabaseMember.updated_at ? new Date(supabaseMember.updated_at) : new Date(),
  };
}

// Convert app Member to Supabase format
function memberToSupabase(member: Partial<Member>): Partial<SupabaseMember> {
  return {
    name: member.name,
    phone: member.phone,
    email: member.email,
    plan: member.feeType || FeeType.WITHOUT_AC,
    start_date: member.feePaidDate ? member.feePaidDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    end_date: member.expiryDate ? member.expiryDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    status: member.status || 'active',
    gender: member.gender,
    fee_amount: member.feeAmount,
    fee_paid: member.feePaid,
    fee_paid_date: member.feePaidDate ? member.feePaidDate.toISOString().split('T')[0] : undefined,
    frozen_date: member.frozenDate ? member.frozenDate.toISOString().split('T')[0] : null,
    deleted_at: member.deletedAt ? member.deletedAt.toISOString().split('T')[0] : null,
  };
}

/**
 * Add a new member to Supabase
 */
export async function addMemberToSupabase(memberData: {
  name: string;
  phone: string;
  plan: string;
  start_date: string;
  end_date: string;
  status: string;
  email?: string;
  gender?: string;
}): Promise<{ data: Member | null; error: Error | null }> {
  try {
    const supabaseData: SupabaseMember = {
      name: memberData.name,
      phone: memberData.phone,
      email: memberData.email || '',
      plan: memberData.plan,
      start_date: memberData.start_date,
      end_date: memberData.end_date,
      status: memberData.status,
      gender: memberData.gender,
      fee_amount: FEE_AMOUNTS[memberData.plan as FeeType] || FEE_AMOUNTS[FeeType.WITHOUT_AC],
      fee_paid: memberData.status === 'active',
      fee_paid_date: memberData.start_date,
    };

    const { data, error } = await supabase
      .from('members')
      .insert([supabaseData])
      .select()
      .single();

    if (error) {
      console.error('Error adding member to Supabase:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      const errorMessage = error.message || error.code || JSON.stringify(error) || 'Unknown error';
      return { data: null, error: new Error(`Supabase Error: ${errorMessage}`) };
    }

    const member = supabaseToMember(data as SupabaseMember);
    return { data: member, error: null };
  } catch (err) {
    console.error('Exception adding member to Supabase:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

/**
 * Fetch all members from Supabase
 */
export async function fetchAllMembersFromSupabase(includeDeleted: boolean = false): Promise<{ data: Member[]; error: Error | null }> {
  try {
    console.log('🔍 Starting to fetch members from Supabase...');
    
    let query = supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    console.log('📡 Executing Supabase query...');
    const { data, error } = await query;
    console.log('📥 Query response received:', { hasData: !!data, dataLength: data?.length, hasError: !!error });

    if (error) {
      // Comprehensive error logging
      console.group('❌ SUPABASE ERROR DETAILS');
      console.error('Error object:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      console.error('Error instanceof Error:', error instanceof Error);
      
      // Try to extract all possible error properties
      if (error) {
        console.error('Error.message:', error.message);
        console.error('Error.code:', (error as any).code);
        console.error('Error.details:', (error as any).details);
        console.error('Error.hint:', (error as any).hint);
        console.error('Error.status:', (error as any).status);
        console.error('Error.statusCode:', (error as any).statusCode);
        
        // Try to stringify
        try {
          console.error('Error JSON:', JSON.stringify(error, null, 2));
        } catch (e) {
          console.error('Cannot stringify error:', e);
        }
        
        // Try to get all enumerable properties
        console.error('Error properties:', Object.getOwnPropertyNames(error));
        console.error('Error keys:', Object.keys(error));
      }
      console.groupEnd();
      
      // Extract error message with comprehensive fallbacks
      const errorMessage = 
        error?.message || 
        (error as any)?.code || 
        (error as any)?.details || 
        (error as any)?.hint ||
        (error as any)?.status ||
        (typeof error === 'string' ? error : 'Table "members" does not exist. Please run the SQL script from supabase-setup.sql in Supabase SQL Editor.');
      
      const finalError = new Error(`Supabase Error: ${errorMessage}`);
      console.error('🚨 Returning error:', finalError.message);
      return { data: [], error: finalError };
    }

    console.log('✅ Successfully fetched members:', data?.length || 0);
    const members = (data || []).map((item: SupabaseMember) => supabaseToMember(item));
    return { data: members, error: null };
  } catch (err) {
    console.group('❌ EXCEPTION IN fetchAllMembersFromSupabase');
    console.error('Exception type:', typeof err);
    console.error('Exception:', err);
    console.error('Exception message:', err instanceof Error ? err.message : 'Not an Error object');
    console.error('Exception stack:', err instanceof Error ? err.stack : 'No stack');
    console.groupEnd();
    
    const errorMessage = err instanceof Error 
      ? err.message 
      : `Unknown exception: ${JSON.stringify(err)}`;
    
    return { data: [], error: new Error(`Exception: ${errorMessage}`) };
  }
}

/**
 * Update a member in Supabase
 */
export async function updateMemberInSupabase(
  id: number,
  updates: Partial<Member>
): Promise<{ data: Member | null; error: Error | null }> {
  try {
    const supabaseUpdates = memberToSupabase(updates);
    supabaseUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('members')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating member in Supabase:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      const errorMessage = error.message || error.code || JSON.stringify(error) || 'Unknown error';
      return { data: null, error: new Error(`Supabase Error: ${errorMessage}`) };
    }

    const member = supabaseToMember(data as SupabaseMember);
    return { data: member, error: null };
  } catch (err) {
    console.error('Exception updating member in Supabase:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

/**
 * Delete a member from Supabase (soft delete)
 */
export async function deleteMemberFromSupabase(id: number): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('members')
      .update({ deleted_at: new Date().toISOString().split('T')[0] })
      .eq('id', id);

    if (error) {
      console.error('Error deleting member from Supabase:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      const errorMessage = error.message || error.code || JSON.stringify(error) || 'Unknown error';
      return { success: false, error: new Error(`Supabase Error: ${errorMessage}`) };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Exception deleting member from Supabase:', err);
    return { success: false, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

/**
 * Permanently delete a member from Supabase
 */
export async function permanentlyDeleteMemberFromSupabase(id: number): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error permanently deleting member from Supabase:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      const errorMessage = error.message || error.code || JSON.stringify(error) || 'Unknown error';
      return { success: false, error: new Error(`Supabase Error: ${errorMessage}`) };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Exception permanently deleting member from Supabase:', err);
    return { success: false, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

/**
 * Restore a deleted member in Supabase
 */
export async function restoreMemberInSupabase(id: number): Promise<{ data: Member | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('members')
      .update({ deleted_at: null })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error restoring member in Supabase:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      const errorMessage = error.message || error.code || JSON.stringify(error) || 'Unknown error';
      return { data: null, error: new Error(`Supabase Error: ${errorMessage}`) };
    }

    const member = supabaseToMember(data as SupabaseMember);
    return { data: member, error: null };
  } catch (err) {
    console.error('Exception restoring member in Supabase:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

