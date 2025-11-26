import { AttendanceRecord } from '../types/attendance';
import { getItem, setItem } from './localStorage';
import { STORAGE_KEYS } from './storageKeys';
import { generateAttendanceId } from '../utils/idGenerator';
import { getAllMembers } from './memberStorage';
import { calculateMembershipStatus } from '../utils/status';
import { MembershipStatus } from '../types/status';

export function getAllAttendance(): AttendanceRecord[] {
  const records = getItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE) || [];
  // Convert date strings back to Date objects
  return records.map(record => ({
    ...record,
    checkInTime: new Date(record.checkInTime),
    date: new Date(record.date),
  }));
}

export function getMemberAttendance(memberId: number): AttendanceRecord[] {
  const allRecords = getAllAttendance();
  return allRecords.filter(record => record.memberId === memberId);
}

export function getRecentAttendance(memberId: number, days: number = 30): AttendanceRecord[] {
  const memberRecords = getMemberAttendance(memberId);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentRecords = memberRecords.filter(record => record.date >= cutoffDate);
  
  // Sort by date descending (most recent first)
  recentRecords.sort((a, b) => b.checkInTime.getTime() - a.checkInTime.getTime());
  
  // Return last 30 days or last 10 records, whichever provides more data
  if (recentRecords.length <= 10) {
    return recentRecords;
  }
  
  return recentRecords.slice(0, 10);
}

/**
 * Check if a member is active (can mark attendance)
 * Active = not expired, not deleted, and paid
 */
function isMemberActiveForAttendance(memberId: number): boolean {
  const allMembers = getAllMembers();
  const member = allMembers.find(m => m.id === memberId);
  
  if (!member) {
    return false; // Member not found
  }
  
  // Check if member is deleted
  if (member.deletedAt !== undefined && member.deletedAt !== null) {
    return false;
  }
  
  // Check if membership is expired
  const membershipStatus = calculateMembershipStatus(member.expiryDate);
  if (membershipStatus === MembershipStatus.EXPIRED) {
    return false;
  }
  
  // Member is active if not expired and not deleted
  return true;
}

export function saveAttendance(memberId: number): AttendanceRecord {
  // Validate that member is active before saving attendance
  if (!isMemberActiveForAttendance(memberId)) {
    throw new Error('Cannot mark attendance for expired or inactive members. Please renew their membership first.');
  }
  
  const allRecords = getAllAttendance();
  const now = new Date();
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  
  const newRecord: AttendanceRecord = {
    id: generateAttendanceId(memberId),
    memberId,
    checkInTime: now,
    date,
  };
  
  allRecords.push(newRecord);
  setItem(STORAGE_KEYS.ATTENDANCE, allRecords);
  
  // Dispatch custom event when attendance is added
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('attendanceUpdated'));
  }
  
  return newRecord;
}

/**
 * Check if a member has attendance marked for today
 */
export function hasAttendanceToday(memberId: number): boolean {
  const allRecords = getAllAttendance();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return allRecords.some(record => {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);
    return record.memberId === memberId && recordDate.getTime() === today.getTime();
  });
}

/**
 * Mark attendance for a member for today (only if not already marked)
 * Returns true if attendance was marked, false if already marked
 * Throws error if member is expired or inactive
 */
export function markAttendanceToday(memberId: number): boolean {
  // Check if already marked
  if (hasAttendanceToday(memberId)) {
    return false; // Already marked, do nothing
  }
  
  // Validate member is active before marking attendance
  if (!isMemberActiveForAttendance(memberId)) {
    throw new Error('Cannot mark attendance for expired or inactive members. Please renew their membership first.');
  }
  
  // Mark attendance
  saveAttendance(memberId);
  return true; // Successfully marked
}

/**
 * Check if a member can mark attendance (is active)
 * This is a public function for UI components to check before showing buttons
 */
export function canMemberMarkAttendance(memberId: number): boolean {
  return isMemberActiveForAttendance(memberId);
}




