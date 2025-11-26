import { supabase } from '@/lib/auth/client';
import { getCurrentUser } from '@/lib/auth/auth';
import { Member } from '@/lib/types/member';

export async function getAllMembers(gym_id?: string | null, includeDeleted: boolean = false): Promise<Member[]> {
  let query = supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false });

  // Filter by gym_id if provided
  if (gym_id) {
    query = query.eq('gym_id', gym_id);
  }

  // Filter deleted members
  if (!includeDeleted) {
    query = query.is('deleted_at', null);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  // Convert to Member type
  return (data || []).map((m: any) => ({
    id: m.id ? (typeof m.id === 'string' ? parseInt(m.id.replace(/-/g, '').substring(0, 8), 16) : m.id) : 0,
    name: m.name,
    email: m.email || '',
    phone: m.phone,
    gender: m.gender as 'Male' | 'Female' | undefined,
    feeType: m.fee_type as any,
    feeAmount: m.fee_amount,
    feePaid: m.fee_paid,
    feeStatus: m.fee_status as any,
    status: m.status,
    feePaidDate: new Date(m.fee_paid_date || m.start_date),
    expiryDate: new Date(m.expiry_date),
    frozenDate: m.frozen_date ? new Date(m.frozen_date) : undefined,
    deletedAt: m.deleted_at ? new Date(m.deleted_at) : undefined,
    createdAt: new Date(m.created_at),
    updatedAt: new Date(m.updated_at),
  }));
}

export async function getMembersByGym(gym_id: string, includeDeleted: boolean = false): Promise<Member[]> {
  return getAllMembers(gym_id, includeDeleted);
}

export async function createMember(memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'> & { gym_id: string }): Promise<Member> {
  const { data, error } = await supabase
    .from('members')
    .insert([{
      gym_id: memberData.gym_id,
      name: memberData.name,
      phone: memberData.phone,
      email: memberData.email,
      gender: memberData.gender,
      fee_type: memberData.feeType,
      fee_amount: memberData.feeAmount,
      fee_paid: memberData.feePaid,
      fee_status: memberData.feeStatus,
      status: memberData.status,
      fee_paid_date: memberData.feePaidDate.toISOString().split('T')[0],
      expiry_date: memberData.expiryDate.toISOString().split('T')[0],
      frozen_date: memberData.frozenDate?.toISOString().split('T')[0],
    }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  const memberId = data.id ? (typeof data.id === 'string' ? parseInt(data.id.replace(/-/g, '').substring(0, 8), 16) : data.id) : 0;
  
  return {
    id: memberId,
    name: data.name,
    email: data.email || '',
    phone: data.phone,
    gender: data.gender as 'Male' | 'Female' | undefined,
    feeType: data.fee_type as any,
    feeAmount: data.fee_amount,
    feePaid: data.fee_paid,
    feeStatus: data.fee_status as any,
    status: data.status,
    feePaidDate: new Date(data.fee_paid_date || data.start_date),
    expiryDate: new Date(data.expiry_date),
    frozenDate: data.frozen_date ? new Date(data.frozen_date) : undefined,
    deletedAt: data.deleted_at ? new Date(data.deleted_at) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function updateMember(id: string, updates: Partial<Member>, gym_id?: string): Promise<Member> {
  const updateData: any = {};

  if (updates.name) updateData.name = updates.name;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.phone) updateData.phone = updates.phone;
  if (updates.gender) updateData.gender = updates.gender;
  if (updates.feeType) updateData.fee_type = updates.feeType;
  if (updates.feeAmount !== undefined) updateData.fee_amount = updates.feeAmount;
  if (updates.feePaid !== undefined) updateData.fee_paid = updates.feePaid;
  if (updates.feeStatus) updateData.fee_status = updates.feeStatus;
  if (updates.status) updateData.status = updates.status;
  if (updates.feePaidDate) updateData.fee_paid_date = updates.feePaidDate.toISOString().split('T')[0];
  if (updates.expiryDate) updateData.expiry_date = updates.expiryDate.toISOString().split('T')[0];
  if (updates.frozenDate) updateData.frozen_date = updates.frozenDate.toISOString().split('T')[0];

  let query = supabase
    .from('members')
    .update(updateData)
    .eq('id', id);

  if (gym_id) {
    query = query.eq('gym_id', gym_id);
  }

  const { data, error } = await query.select().single();

  if (error) {
    throw error;
  }

  const memberId = data.id ? (typeof data.id === 'string' ? parseInt(data.id.replace(/-/g, '').substring(0, 8), 16) : data.id) : 0;
  
  return {
    id: memberId,
    name: data.name,
    email: data.email || '',
    phone: data.phone,
    gender: data.gender as 'Male' | 'Female' | undefined,
    feeType: data.fee_type as any,
    feeAmount: data.fee_amount,
    feePaid: data.fee_paid,
    feeStatus: data.fee_status as any,
    status: data.status,
    feePaidDate: new Date(data.fee_paid_date || data.start_date),
    expiryDate: new Date(data.expiry_date),
    frozenDate: data.frozen_date ? new Date(data.frozen_date) : undefined,
    deletedAt: data.deleted_at ? new Date(data.deleted_at) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function deleteMember(id: string, gym_id?: string): Promise<void> {
  let query = supabase
    .from('members')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (gym_id) {
    query = query.eq('gym_id', gym_id);
  }

  const { error } = await query;

  if (error) {
    throw error;
  }
}

