'use client';

import { useState, useEffect, useCallback } from 'react';
import { AttendanceRecord } from '@/lib/types/attendance';
import { getMemberAttendance, getRecentAttendance } from '@/lib/storage/attendanceStorage';

export function useAttendance(memberId: number) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const records = getMemberAttendance(memberId);
      setAttendance(records);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  const refresh = useCallback(() => {
    setLoading(true);
    try {
      const records = getMemberAttendance(memberId);
      setAttendance(records);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh attendance');
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  return { attendance, loading, error, refresh };
}

export function useRecentAttendance(memberId: number) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const records = getRecentAttendance(memberId);
      setAttendance(records);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recent attendance');
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  return { attendance, loading, error };
}

