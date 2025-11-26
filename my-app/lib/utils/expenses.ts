import { getAllPayments } from '../storage/paymentStorage';
import { getAllMembers } from '../storage/memberStorage';
import { Member } from '../types/member';
import { FeeStatus, FeeType } from '../types/fee';

/**
 * Check if a member is active (same logic as other utilities)
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
 * Expenses breakdown interface
 */
export interface ExpensesBreakdown {
  acMembers: number;      // Total from AC members (WITH_AC)
  nonAcMembers: number;   // Total from Non-AC members (WITHOUT_AC)
  oneDayPayments: number; // One-day payments (special category)
  total: number;          // Sum of all three
}

/**
 * Calculate expenses breakdown
 * Only includes payments from active members
 * Excludes deleted, frozen, inactive members
 */
export function getExpensesBreakdown(): ExpensesBreakdown {
  const allPayments = getAllPayments();
  const activeMemberIds = getActiveMemberIds();
  
  let acMembers = 0;
  let nonAcMembers = 0;
  let oneDayPayments = 0;
  
  allPayments.forEach(payment => {
    // Only count payments from active members
    if (!activeMemberIds.has(payment.memberId)) {
      return;
    }
    
    // One Day Payment: Amount = 150 or feeType = ONE_DAY
    if (payment.amount === 150 || payment.feeType === FeeType.ONE_DAY) {
      oneDayPayments += payment.amount;
    }
    // Standard monthly fees: 2500 (WITHOUT_AC) or 3000 (WITH_AC)
    else if (payment.amount === 2500 || payment.amount === 3000) {
      // Categorize standard monthly fees by fee type
      if (payment.feeType === FeeType.WITH_AC) {
        acMembers += payment.amount;
      } else if (payment.feeType === FeeType.WITHOUT_AC) {
        nonAcMembers += payment.amount;
      }
    }
    // Other payments (if any) - ignore payments that don't match standard amounts
  });
  
  const total = acMembers + nonAcMembers + oneDayPayments;
  
  return {
    acMembers,
    nonAcMembers,
    oneDayPayments,
    total,
  };
}

/**
 * Get total expenses (sum of all categories)
 */
export function getTotalExpenses(): number {
  const breakdown = getExpensesBreakdown();
  return breakdown.total;
}

