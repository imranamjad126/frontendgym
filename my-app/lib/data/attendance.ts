import { supabase } from '@/lib/auth/client';
import { AttendanceRecord } from '@/lib/types/attendance';

export async function getAllAttendance(gym_id?: string | null): Promise<AttendanceRecord[]> {
  let query = supabase
    .from('attendance')
    .select('*')
    .order('date', { ascending: false });

  if (gym_id) {
    query = query.eq('gym_id', gym_id);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data || []).map((a: any) => ({
    id: a.id ? (typeof a.id === 'string' ? parseInt(a.id.replace(/-/g, '').substring(0, 8), 16) : a.id) : 0,
    memberId: a.member_id ? (typeof a.member_id === 'string' ? parseInt(a.member_id.replace(/-/g, '').substring(0, 8), 16) : a.member_id) : 0,
    date: new Date(a.date),
    checkInTime: a.check_in_time ? new Date(a.check_in_time) : new Date(a.date),
  }));
}

export async function createAttendance(member_id: string, date: Date, gym_id: string): Promise<AttendanceRecord> {
  const { data, error } = await supabase
    .from('attendance')
    .insert([{
      gym_id,
      member_id,
      date: date.toISOString().split('T')[0],
    }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  const attendanceId = data.id ? (typeof data.id === 'string' ? parseInt(data.id.replace(/-/g, '').substring(0, 8), 16) : data.id) : 0;
  const memberId = data.member_id ? (typeof data.member_id === 'string' ? parseInt(data.member_id.replace(/-/g, '').substring(0, 8), 16) : data.member_id) : 0;

  return {
    id: attendanceId,
    memberId: memberId,
    date: new Date(data.date),
    checkInTime: data.check_in_time ? new Date(data.check_in_time) : new Date(data.date),
  };
}

