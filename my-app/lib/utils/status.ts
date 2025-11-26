import { MembershipStatus } from '../types/status';

export function calculateMembershipStatus(expiryDate: Date): MembershipStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) {
    return MembershipStatus.EXPIRED;
  }
  
  if (daysUntilExpiry <= 3) {
    return MembershipStatus.EXPIRING;
  }
  
  return MembershipStatus.ACTIVE;
}

export function isExpiring(expiryDate: Date): boolean {
  return calculateMembershipStatus(expiryDate) === MembershipStatus.EXPIRING;
}

export function isExpired(expiryDate: Date): boolean {
  return calculateMembershipStatus(expiryDate) === MembershipStatus.EXPIRED;
}

export function daysUntilExpiry(expiryDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}









