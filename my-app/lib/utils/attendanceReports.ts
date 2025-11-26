import { getAllAttendance } from '../storage/attendanceStorage';
import { getAllMembers } from '../storage/memberStorage';
import { Member } from '../types/member';
import { FeeStatus } from '../types/fee';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, format, eachDayOfInterval } from 'date-fns';

/**
 * Check if a member is active (same logic as dailyVisitors)
 */
function isActiveMember(member: Member): boolean {
  // Exclude deleted members
  if (member.deletedAt !== undefined && member.deletedAt !== null) {
    return false;
  }
  
  // Exclude frozen members
  if (member.feeStatus === FeeStatus.FREEZE) {
    return false;
  }
  
  // Exclude unpaid members
  if (member.feePaid !== true) {
    return false;
  }
  
  // Exclude inactive/dormant members
  if (member.feeStatus === FeeStatus.INACTIVE || member.feeStatus === FeeStatus.DORMANT) {
    return false;
  }
  
  // Only count active, paid members with ACTIVE status
  return member.feeStatus === FeeStatus.ACTIVE;
}

/**
 * Get active member IDs set for quick lookup
 */
function getActiveMemberIds(): Set<number> {
  const allMembers = getAllMembers();
  const activeMemberIds = new Set<number>();
  
  allMembers.forEach(member => {
    if (isActiveMember(member)) {
      activeMemberIds.add(member.id);
    }
  });
  
  return activeMemberIds;
}

/**
 * Get attendance count for a specific date (only active members)
 */
export function getActiveAttendanceCount(date: Date): number {
  const allAttendance = getAllAttendance();
  const activeMemberIds = getActiveMemberIds();
  
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  const uniqueActiveAttendees = new Set<number>();
  
  allAttendance.forEach(record => {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);
    
    if (recordDate.getTime() === targetDate.getTime()) {
      if (activeMemberIds.has(record.memberId)) {
        uniqueActiveAttendees.add(record.memberId);
      }
    }
  });
  
  return uniqueActiveAttendees.size;
}

/**
 * Get daily attendance data for a month
 * Returns array with all days of the month, showing attendance count per day (active members only)
 */
export function getMonthlyAttendanceData(year: number, month: number): Array<{ date: string; day: number; attendance: number }> {
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));
  
  // Get all days in the month
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const activeMemberIds = getActiveMemberIds();
  const allAttendance = getAllAttendance();
  
  // Create a map of date -> attendance count
  const attendanceByDate = new Map<string, Set<number>>();
  
  allAttendance.forEach(record => {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);
    
    // Only count if member is active
    if (activeMemberIds.has(record.memberId)) {
      const dateKey = format(recordDate, 'yyyy-MM-dd');
      
      if (!attendanceByDate.has(dateKey)) {
        attendanceByDate.set(dateKey, new Set<number>());
      }
      
      attendanceByDate.get(dateKey)!.add(record.memberId);
    }
  });
  
  // Build array with all days of the month
  return allDays.map(day => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const attendees = attendanceByDate.get(dateKey) || new Set<number>();
    
    return {
      date: format(day, 'MMM dd'),
      day: day.getDate(),
      attendance: attendees.size,
    };
  });
}

/**
 * Get new members count for a date range (only active members)
 */
export function getNewMembersCount(startDate: Date, endDate: Date): number {
  const allMembers = getAllMembers();
  
  return allMembers.filter(member => {
    const createdDate = new Date(member.createdAt);
    createdDate.setHours(0, 0, 0, 0);
    
    return createdDate >= startDate && createdDate <= endDate && isActiveMember(member);
  }).length;
}






