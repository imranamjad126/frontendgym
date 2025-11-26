import { MemberWithStatus } from '../types/member';

export function searchMembers(query: string, members: MemberWithStatus[]): MemberWithStatus[] {
  if (!query.trim()) {
    return members;
  }
  
  const queryLower = query.toLowerCase().trim();
  const queryNumber = parseInt(query, 10);
  
  return members.filter(member => {
    // Exact ID match
    if (!isNaN(queryNumber) && member.id === queryNumber) {
      return true;
    }
    
    // Case-insensitive partial name match
    if (member.name.toLowerCase().includes(queryLower)) {
      return true;
    }
    
    return false;
  });
}

export function filterMembersByStatus(members: MemberWithStatus[], status: string): MemberWithStatus[] {
  if (!status) return members;
  // Status is calculated, so we'll filter after calculating
  return members; // This will be handled by the component
}

export function sortMembersByExpiry(members: MemberWithStatus[]): MemberWithStatus[] {
  return [...members].sort((a, b) => {
    return a.expiryDate.getTime() - b.expiryDate.getTime();
  });
}









