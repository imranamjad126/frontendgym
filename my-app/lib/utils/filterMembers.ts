import { Member, MemberWithStatus } from '../types/member';
import { FeeStatus } from '../types/fee';
import { MembershipStatus } from '../types/status';
import { calculateMembershipStatus } from './status';
import { getMemberAttendance } from '../storage/attendanceStorage';

/**
 * Calculate the due amount for a member
 * Returns the fee amount if unpaid or expired, 0 if paid and not expired
 */
export function calculateDueAmount(member: Member): number {
  // Check if membership is expired
  const membershipStatus = calculateMembershipStatus(member.expiryDate);
  const isExpired = membershipStatus === MembershipStatus.EXPIRED;
  
  // If membership is expired, they need to renew (show fee amount as due)
  if (isExpired) {
    return member.feeAmount || 0;
  }
  
  // If member has paid and not expired, due amount is 0
  if (member.feePaid === true) {
    return 0;
  }
  
  // If unpaid, return the fee amount
  return member.feeAmount || 0;
}

/**
 * Check if a member is unpaid based on isPaid and dueAmount
 */
function isMemberUnpaid(member: Member): boolean {
  const isPaid = member.feePaid === true;
  const dueAmount = calculateDueAmount(member);
  
  // Member is unpaid if isPaid === false OR dueAmount > 0
  return !isPaid || dueAmount > 0;
}

/**
 * Check if a member is dormant (no attendance for 30+ days)
 */
function isMemberDormant(member: Member): boolean {
  const attendanceRecords = getMemberAttendance(member.id);
  
  if (attendanceRecords.length === 0) {
    // If member has never attended, check if created more than 30 days ago
    const daysSinceCreation = Math.floor(
      (new Date().getTime() - member.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceCreation >= 30;
  }
  
  // Get the most recent attendance
  const mostRecentAttendance = attendanceRecords
    .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
  
  if (!mostRecentAttendance) {
    return true;
  }
  
  // Calculate days since last attendance
  const daysSinceLastAttendance = Math.floor(
    (new Date().getTime() - mostRecentAttendance.date.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return daysSinceLastAttendance >= 30;
}

/**
 * Check if a member has missing attendance for current billing cycle (<30 days)
 * This is for inactive status, not dormant
 * 
 * Logic: If member has no attendance in the current billing cycle (from feePaidDate)
 * AND it's been less than 30 days since feePaidDate, they're inactive (not dormant)
 */
function hasMissingAttendance(member: Member): boolean {
  // If member is dormant, they should not be considered inactive due to attendance
  if (isMemberDormant(member)) {
    return false;
  }
  
  const attendanceRecords = getMemberAttendance(member.id);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Calculate billing cycle start (from fee paid date)
  const billingCycleStart = new Date(member.feePaidDate);
  billingCycleStart.setHours(0, 0, 0, 0);
  
  // Calculate days since billing cycle started
  const daysSinceBillingStart = Math.floor(
    (today.getTime() - billingCycleStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // If it's been 30+ days, this should be handled by dormant logic, not inactive
  if (daysSinceBillingStart >= 30) {
    return false;
  }
  
  // Check if there's any attendance in the current billing cycle
  const hasAttendanceInCycle = attendanceRecords.some(record => {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate >= billingCycleStart && recordDate <= today;
  });
  
  // If no attendance in current billing cycle and it's been less than 30 days, consider inactive
  return !hasAttendanceInCycle && daysSinceBillingStart > 0;
}

/**
 * Check if a member is inactive
 * Inactive = payment/fee related or manual freeze (NOT dormant)
 */
export function isMemberInactive(member: Member): boolean {
  // Exclude deleted members
  if (member.deletedAt !== undefined) {
    return false;
  }
  
  // Exclude dormant members (they have their own category)
  if (isMemberDormant(member)) {
    return false;
  }
  
  // Condition 1: Payment is due (unpaid)
  const isUnpaid = isMemberUnpaid(member);
  
  // Condition 2: Membership expired
  const membershipStatus = calculateMembershipStatus(member.expiryDate);
  const isExpired = membershipStatus === MembershipStatus.EXPIRED;
  
  // Condition 3: Member is frozen (manual freeze)
  const isFrozen = member.feeStatus === FeeStatus.FREEZE;
  
  // Condition 4: Attendance missing for current billing cycle (<30 days)
  const hasMissingAtt = hasMissingAttendance(member);
  
  // Member is inactive if ANY of these conditions are true
  return isUnpaid || isExpired || isFrozen || hasMissingAtt;
}

/**
 * Get inactive status reasons for a member
 * Returns array of status strings: ['Unpaid', 'Expired', 'Frozen', 'No Attendance']
 */
export function getInactiveReasons(member: Member): string[] {
  const reasons: string[] = [];
  
  if (isMemberUnpaid(member)) {
    reasons.push('Unpaid');
  }
  
  const membershipStatus = calculateMembershipStatus(member.expiryDate);
  if (membershipStatus === MembershipStatus.EXPIRED) {
    reasons.push('Expired');
  }
  
  if (member.feeStatus === FeeStatus.FREEZE) {
    reasons.push('Frozen');
  }
  
  if (hasMissingAttendance(member)) {
    reasons.push('No Attendance');
  }
  
  return reasons;
}

export function filterMembersByCategory(members: MemberWithStatus[], filter: string): MemberWithStatus[] {
  // Helper to check if member is deleted
  const isDeleted = (m: Member) => m.deletedAt !== undefined;
  
  switch (filter) {
    case 'active':
      // Only show members with feeStatus = "Active" and not deleted
      return members.filter(m => m.feeStatus === FeeStatus.ACTIVE && !isDeleted(m));
    
    case 'inactive':
      // Show members who meet inactive conditions (payment/fee related or manual freeze)
      // Exclude dormant members (they have their own category)
      return members.filter(m => isMemberInactive(m));
    
    case 'freeze':
      // Only show members with feeStatus = "Freeze" and not deleted
      return members.filter(m => 
        m.feeStatus === FeeStatus.FREEZE && !isDeleted(m)
      );
    
    case 'dormant':
      // Show members with feeStatus = "Dormant" OR members with 30+ days no attendance
      return members.filter(m => {
        if (isDeleted(m)) {
          return false;
        }
        // Check if member is marked as Dormant OR has 30+ days no attendance
        return m.feeStatus === FeeStatus.DORMANT || isMemberDormant(m);
      });
    
    case 'unpaid':
      // Show unpaid members: isPaid === false OR dueAmount > 0
      // Also include expired members (even if they paid, if membership expired, they need to renew)
      // Exclude deleted members
      return members.filter(m => {
        // Exclude deleted members
        if (isDeleted(m)) {
          return false;
        }
        
        // Check if member is unpaid using isPaid === false OR dueAmount > 0
        const isPaid = m.feePaid === true;
        const dueAmount = calculateDueAmount(m);
        const isUnpaid = !isPaid || dueAmount > 0;
        
        // Calculate membership status (Active, Expiring, or Expired)
        const membershipStatus = calculateMembershipStatus(m.expiryDate);
        const isExpired = membershipStatus === MembershipStatus.EXPIRED;
        
        // Show member if:
        // 1. They are unpaid (isPaid === false OR dueAmount > 0), OR
        // 2. Their membership has expired (even if they paid, expired members need to renew)
        return isUnpaid || isExpired;
      });
    
    case 'deleted':
      // Show only soft-deleted members - must have deletedAt set and not null/undefined
      return members.filter(m => {
        const deleted = m.deletedAt !== undefined && m.deletedAt !== null;
        return deleted;
      });
    
    default:
      // Default: show all non-deleted members
      return members.filter(m => !isDeleted(m));
  }
}

export function getPageTitle(filter?: string): string {
  switch (filter) {
    case 'active':
      return 'Active Members';
    case 'inactive':
      return 'Inactive Members';
    case 'freeze':
      return 'Freeze Members';
    case 'dormant':
      return 'Dormant Members';
    case 'unpaid':
      return 'Unpaid Members';
    case 'deleted':
      return 'Deleted Members';
    default:
      return 'All Members';
  }
}

