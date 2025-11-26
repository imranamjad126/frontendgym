import { getAllAttendance } from '../storage/attendanceStorage';
import { getAllMembers } from '../storage/memberStorage';
import { Member } from '../types/member';
import { FeeStatus } from '../types/fee';

/**
 * Check if a member is active and should be counted in attendance
 * 
 * Active member criteria:
 * - Not deleted (deletedAt is null/undefined)
 * - Not frozen (status !== 'Freeze' AND feeStatus !== FREEZE)
 * - Paid (feePaid === true)
 * - Active status (feeStatus === ACTIVE)
 * 
 * Excludes:
 * - Deleted members
 * - Frozen members
 * - Unpaid members
 * - Inactive members
 * - Dormant members
 */
function isActiveMember(member: Member): boolean {
  // Exclude deleted members (double-check even though getAllMembers filters them)
  if (member.deletedAt !== undefined && member.deletedAt !== null) {
    return false;
  }
  
  // Exclude frozen members
  if (member.status === 'Freeze' || member.feeStatus === FeeStatus.FREEZE) {
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
 * Get count of daily visitors for a specific date
 * Only counts active members (not frozen, not inactive, not deleted)
 * 
 * This function:
 * 1. Gets fresh data from storage (no caching, no stale data)
 * 2. Filters out deleted members (getAllMembers excludes deleted by default)
 * 3. Only counts members who are active (paid, not frozen, not inactive)
 * 4. Counts unique members who have attendance marked for the date
 */
export function getDailyVisitorsCount(date: Date = new Date()): number {
  try {
    // Always get fresh data from storage (no caching, no stale data)
    const allAttendance = getAllAttendance();
    const allMembers = getAllMembers(); // This excludes deleted members by default
    
    // Create a Set of active member IDs for O(1) lookup
    const activeMemberIds = new Set<number>();
    
    // Filter and build set of active member IDs
    allMembers.forEach(member => {
      // Only include active members in the set
      // This filters out: deleted, frozen, unpaid, inactive, dormant members
      if (isActiveMember(member)) {
        activeMemberIds.add(member.id);
      }
    });
    
    // Set date to start of day for accurate comparison
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    // Get unique member IDs who attended on the target date AND are active
    const uniqueActiveAttendees = new Set<number>();
    
    allAttendance.forEach(record => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      
      // Check if attendance is for the target date
      if (recordDate.getTime() === targetDate.getTime()) {
        // Only count if member is active (exists in activeMemberIds set)
        // This ensures we don't count:
        // - Deleted members
        // - Frozen members
        // - Unpaid/inactive members
        // - Dormant members
        if (activeMemberIds.has(record.memberId)) {
          uniqueActiveAttendees.add(record.memberId);
        }
      }
    });
    
    return uniqueActiveAttendees.size;
  } catch (error) {
    console.error('Error calculating daily visitors count:', error);
    return 0;
  }
}

/**
 * Get daily visitors count for today
 */
export function getTodayVisitorsCount(): number {
  return getDailyVisitorsCount(new Date());
}


