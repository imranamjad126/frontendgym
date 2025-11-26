import { getItem, setItem } from '../storage/localStorage';
import { STORAGE_KEYS } from '../storage/storageKeys';
import { Member } from '../types/member';

export function generateMemberId(): number {
  const existingMembers = getItem<Member[]>(STORAGE_KEYS.MEMBERS) || [];
  
  if (existingMembers.length === 0) {
    setItem(STORAGE_KEYS.NEXT_MEMBER_ID, 1);
    return 1;
  }
  
  const maxId = Math.max(...existingMembers.map(m => m.id));
  const nextId = maxId + 1;
  setItem(STORAGE_KEYS.NEXT_MEMBER_ID, nextId);
  return nextId;
}

export function generateAttendanceId(memberId: number): string {
  const timestamp = Date.now();
  return `att_${timestamp}_${memberId}`;
}









