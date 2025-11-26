// ============================================
// ATTENDANCE OPERATIONS
// ============================================

import { supabase } from './client';
import { Attendance } from '@/lib/types/member-new';

/**
 * Record attendance for a member
 */
export async function recordAttendance(
  memberId: string,
  date: string
): Promise<{ data: Attendance | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .insert([{ member_id: memberId, date }])
      .select()
      .single();

    if (error) {
      // If duplicate, that's okay - member already marked for today
      if (error.code === '23505') {
        // Get existing record
        const { data: existing } = await supabase
          .from('attendance')
          .select('*')
          .eq('member_id', memberId)
          .eq('date', date)
          .single();
        
        return { data: existing as Attendance, error: null };
      }
      
      console.error('Error recording attendance:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Attendance, error: null };
  } catch (err) {
    console.error('Exception recording attendance:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

/**
 * Get attendance for a member
 */
export async function getMemberAttendance(memberId: string): Promise<{ data: Attendance[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('member_id', memberId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching attendance:', error);
      return { data: [], error: new Error(error.message) };
    }

    return { data: (data || []) as Attendance[], error: null };
  } catch (err) {
    console.error('Exception fetching attendance:', err);
    return { data: [], error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

/**
 * Get attendance for a specific date
 */
export async function getAttendanceByDate(date: string): Promise<{ data: Attendance[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', date);

    if (error) {
      console.error('Error fetching attendance by date:', error);
      return { data: [], error: new Error(error.message) };
    }

    return { data: (data || []) as Attendance[], error: null };
  } catch (err) {
    console.error('Exception fetching attendance by date:', err);
    return { data: [], error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

/**
 * Check if member has attendance for a date
 */
export async function hasAttendance(memberId: string, date: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('id')
      .eq('member_id', memberId)
      .eq('date', date)
      .single();

    return !error && data !== null;
  } catch {
    return false;
  }
}



