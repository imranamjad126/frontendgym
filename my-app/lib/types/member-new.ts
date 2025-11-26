// ============================================
// NEW MEMBER TYPES - Matching Supabase Schema
// ============================================

export interface Member {
  id: string; // UUID
  name: string;
  phone: string;
  gender: string | null;
  cnic: string | null;
  membership_type: string;
  ac_type: string;
  amount: number;
  start_date: string; // Date as string (YYYY-MM-DD)
  expiry_date: string; // Date as string (YYYY-MM-DD)
  status: string;
  created_at: string; // ISO timestamp
}

export interface Attendance {
  id: string; // UUID
  member_id: string; // UUID
  date: string; // Date as string (YYYY-MM-DD)
}

export interface Payment {
  id: string; // UUID
  member_id: string; // UUID
  amount: number;
  method: string;
  date: string; // Date as string (YYYY-MM-DD)
}

// Member status types
export type MemberStatus = 'active' | 'inactive' | 'expired' | 'freeze' | 'dormant' | 'unpaid';

// Membership types
export type MembershipType = 'monthly' | 'quarterly' | 'yearly' | 'one_day';

// AC types
export type ACType = 'with_ac' | 'without_ac';

// Payment methods
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'online';



