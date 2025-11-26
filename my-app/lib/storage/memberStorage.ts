import { Member } from '../types/member';
import { getItem, setItem } from './localStorage';
import { STORAGE_KEYS } from './storageKeys';
import { generateMemberId } from '../utils/idGenerator';
import { FeeType, FEE_AMOUNTS, FeeStatus } from '../types/fee';
import { savePayment } from './paymentStorage';

export function getAllMembers(includeDeleted: boolean = false): Member[] {
  const members = getItem<Member[]>(STORAGE_KEYS.MEMBERS) || [];
  // Convert date strings back to Date objects and ensure all required fields exist
  const processedMembers = members.map(member => {
    const feeType = member.feeType || FeeType.WITHOUT_AC;
    const feeAmount = member.feeAmount || FEE_AMOUNTS[feeType];
    // Only default to true if feeStatus is ACTIVE, otherwise preserve the original value
    const feePaid = member.feePaid !== undefined ? member.feePaid : (member.feeStatus === FeeStatus.ACTIVE ? true : false);
    const feeStatus = member.feeStatus || FeeStatus.ACTIVE;
    
    return {
      ...member,
      feeType,
      feeAmount,
      feePaid,
      feeStatus,
      feePaidDate: new Date(member.feePaidDate),
      expiryDate: new Date(member.expiryDate),
      frozenDate: member.frozenDate ? new Date(member.frozenDate) : undefined,
      deletedAt: member.deletedAt ? new Date(member.deletedAt) : undefined,
      createdAt: new Date(member.createdAt),
      updatedAt: new Date(member.updatedAt),
    };
  });
  
  // Filter out deleted members unless explicitly requested
  // Only filter members that have deletedAt set (not null/undefined)
  if (!includeDeleted) {
    return processedMembers.filter(m => !m.deletedAt || m.deletedAt === null);
  }
  
  // Return all members including deleted ones
  return processedMembers;
}

export function getDeletedMembers(): Member[] {
  const allMembers = getAllMembers(true);
  // Only return members that actually have deletedAt set (not null/undefined)
  return allMembers.filter(m => m.deletedAt !== undefined && m.deletedAt !== null);
}

export function getMember(id: number, includeDeleted: boolean = true): Member | null {
  const members = getAllMembers(includeDeleted);
  const member = members.find(m => m.id === id);
  return member || null;
}

/**
 * Dispatch custom event when members change
 * This allows components to react to member changes in real-time
 */
function dispatchMemberChangeEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('membersUpdated'));
  }
}

export function saveMember(member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Member {
  const members = getAllMembers();
  const newMember: Member = {
    ...member,
    id: generateMemberId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  members.push(newMember);
  setItem(STORAGE_KEYS.MEMBERS, members);
  
  // Save payment history when member is added with fee
  if (newMember.feePaid && newMember.feeAmount) {
    savePayment(
      newMember.id,
      newMember.name,
      newMember.feeType,
      newMember.feeAmount,
      newMember.feePaidDate
    );
  }
  
  dispatchMemberChangeEvent();
  return newMember;
}

export function updateMember(id: number, updates: Partial<Omit<Member, 'id' | 'createdAt'>>): Member | null {
  const members = getAllMembers();
  const index = members.findIndex(m => m.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedMember: Member = {
    ...members[index],
    ...updates,
    id,
    createdAt: members[index].createdAt,
    updatedAt: new Date(),
  };
  
  members[index] = updatedMember;
  setItem(STORAGE_KEYS.MEMBERS, members);
  dispatchMemberChangeEvent();
  return updatedMember;
}

/**
 * Soft delete a member
 * Sets deletedAt to today instead of removing from storage
 */
export function deleteMember(id: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const result = updateMember(id, {
    deletedAt: today,
  });
  
  return result !== null;
}

/**
 * Restore a soft-deleted member
 * Removes deletedAt to restore the member
 */
export function restoreMember(id: number): Member | null {
  // Get all members from storage (raw data, including deleted)
  const allMembersRaw = getItem<Member[]>(STORAGE_KEYS.MEMBERS) || [];
  const index = allMembersRaw.findIndex(m => m.id === id);
  
  if (index === -1) {
    return null;
  }
  
  // Create updated member object without deletedAt
  const { deletedAt, ...memberWithoutDeletedAt } = allMembersRaw[index];
  const updatedMember: Member = {
    ...memberWithoutDeletedAt,
    id,
    createdAt: new Date(memberWithoutDeletedAt.createdAt),
    updatedAt: new Date(),
    feePaidDate: new Date(memberWithoutDeletedAt.feePaidDate),
    expiryDate: new Date(memberWithoutDeletedAt.expiryDate),
    frozenDate: memberWithoutDeletedAt.frozenDate ? new Date(memberWithoutDeletedAt.frozenDate) : undefined,
  };
  
  // Update in storage
  allMembersRaw[index] = updatedMember;
  setItem(STORAGE_KEYS.MEMBERS, allMembersRaw);
  
  dispatchMemberChangeEvent();
  return updatedMember;
}

/**
 * Permanently delete a member (hard delete)
 * Use with caution - this permanently removes the member
 */
export function permanentlyDeleteMember(id: number): boolean {
  const allMembers = getAllMembers(true);
  const index = allMembers.findIndex(m => m.id === id);
  
  if (index === -1) {
    return false;
  }
  
  allMembers.splice(index, 1);
  setItem(STORAGE_KEYS.MEMBERS, allMembers);
  dispatchMemberChangeEvent();
  return true;
}

/**
 * Mark a member as paid
 * Updates feePaid to true, feeStatus to PAID, and sets feePaidDate to today
 * Also saves payment history
 */
export function markMemberAsPaid(id: number): Member | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const member = getMember(id);
  if (!member) {
    return null;
  }
  
  // Calculate new expiry date (30 days from today)
  const newExpiryDate = new Date(today);
  newExpiryDate.setDate(newExpiryDate.getDate() + 30);
  
  const updatedMember = updateMember(id, {
    feePaid: true,
    feeStatus: FeeStatus.PAID,
    feePaidDate: today,
    expiryDate: newExpiryDate,
  });
  
  // Save payment history
  if (updatedMember && updatedMember.feeAmount) {
    savePayment(
      updatedMember.id,
      updatedMember.name,
      updatedMember.feeType,
      updatedMember.feeAmount,
      today
    );
  }
  
  return updatedMember;
}

/**
 * Freeze a member's membership
 * Sets status to 'Freeze', feeStatus to FREEZE, and frozenDate to today
 */
export function freezeMember(id: number): Member | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return updateMember(id, {
    status: 'Freeze',
    feeStatus: FeeStatus.FREEZE,
    frozenDate: today,
  });
}

/**
 * Unfreeze a member's membership
 * Sets status back to 'Active', feeStatus to ACTIVE, and clears frozenDate
 */
export function unfreezeMember(id: number): Member | null {
  return updateMember(id, {
    status: 'Active',
    feeStatus: FeeStatus.ACTIVE,
    frozenDate: undefined,
  });
}

/**
 * Mark a member as dormant
 * Sets status to 'Dormant' and feeStatus to DORMANT
 */
export function markMemberAsDormant(id: number): Member | null {
  return updateMember(id, {
    status: 'Dormant',
    feeStatus: FeeStatus.DORMANT,
  });
}

/**
 * Activate a dormant member
 * Sets status back to 'Active' and feeStatus to ACTIVE
 */
export function activateDormantMember(id: number): Member | null {
  return updateMember(id, {
    status: 'Active',
    feeStatus: FeeStatus.ACTIVE,
  });
}

/**
 * Get all inactive members
 * Returns members who meet inactive conditions:
 * - Payment is due (unpaid)
 * - Membership expired
 * - Member is frozen (manual freeze)
 * - Attendance missing for current billing cycle (<30 days, not dormant)
 * 
 * Does NOT include dormant members (they have their own category)
 */
export function getInactiveMembers(): Member[] {
  const { isMemberInactive } = require('../utils/filterMembers');
  const allMembers = getAllMembers();
  return allMembers.filter(m => isMemberInactive(m));
}

