// ============================================
// PAYMENTS OPERATIONS
// ============================================

import { supabase } from './client';
import { Payment } from '@/lib/types/member-new';

/**
 * Record a payment
 */
export async function recordPayment(
  memberId: string,
  amount: number,
  method: string,
  date: string
): Promise<{ data: Payment | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([{ member_id: memberId, amount, method, date }])
      .select()
      .single();

    if (error) {
      console.error('Error recording payment:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Payment, error: null };
  } catch (err) {
    console.error('Exception recording payment:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

/**
 * Get payments for a member
 */
export async function getMemberPayments(memberId: string): Promise<{ data: Payment[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('member_id', memberId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      return { data: [], error: new Error(error.message) };
    }

    return { data: (data || []) as Payment[], error: null };
  } catch (err) {
    console.error('Exception fetching payments:', err);
    return { data: [], error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

/**
 * Get payments by date range
 */
export async function getPaymentsByDateRange(
  startDate: string,
  endDate: string
): Promise<{ data: Payment[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching payments by date range:', error);
      return { data: [], error: new Error(error.message) };
    }

    return { data: (data || []) as Payment[], error: null };
  } catch (err) {
    console.error('Exception fetching payments by date range:', err);
    return { data: [], error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

/**
 * Get total payments for a member
 */
export async function getMemberTotalPayments(memberId: string): Promise<{ total: number; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('amount')
      .eq('member_id', memberId);

    if (error) {
      console.error('Error calculating total payments:', error);
      return { total: 0, error: new Error(error.message) };
    }

    const total = (data || []).reduce((sum, payment) => sum + (payment.amount || 0), 0);
    return { total, error: null };
  } catch (err) {
    console.error('Exception calculating total payments:', err);
    return { total: 0, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}



