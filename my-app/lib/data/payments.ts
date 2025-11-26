import { supabase } from '@/lib/auth/client';

interface Payment {
  id: number;
  memberId: number;
  amount: number;
  method: string;
  date: Date;
}

export async function getAllPayments(gym_id?: string | null): Promise<Payment[]> {
  let query = supabase
    .from('payments')
    .select('*')
    .order('date', { ascending: false });

  if (gym_id) {
    query = query.eq('gym_id', gym_id);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data || []).map((p: any) => ({
    id: p.id ? (typeof p.id === 'string' ? parseInt(p.id.replace(/-/g, '').substring(0, 8), 16) : p.id) : 0,
    memberId: p.member_id ? (typeof p.member_id === 'string' ? parseInt(p.member_id.replace(/-/g, '').substring(0, 8), 16) : p.member_id) : 0,
    amount: p.amount,
    method: p.method as any,
    date: new Date(p.date),
  }));
}

export async function createPayment(
  member_id: string,
  amount: number,
  method: string,
  date: Date,
  gym_id: string
): Promise<Payment> {
  const { data, error } = await supabase
    .from('payments')
    .insert([{
      gym_id,
      member_id,
      amount,
      method,
      date: date.toISOString().split('T')[0],
    }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  const paymentId = data.id ? (typeof data.id === 'string' ? parseInt(data.id.replace(/-/g, '').substring(0, 8), 16) : data.id) : 0;
  const memberId = data.member_id ? (typeof data.member_id === 'string' ? parseInt(data.member_id.replace(/-/g, '').substring(0, 8), 16) : data.member_id) : 0;

  return {
    id: paymentId,
    memberId: memberId,
    amount: data.amount,
    method: data.method as any,
    date: new Date(data.date),
  };
}

