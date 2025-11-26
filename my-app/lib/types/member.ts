import { MembershipStatus } from './status';
import { FeeType, FeeStatus } from './fee';

export type Gender = 'Male' | 'Female';

export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender?: Gender; // Male or Female
  feePaidDate: Date;
  expiryDate: Date;
  feeType: FeeType;
  feeAmount: number;
  feePaid: boolean;
  feeStatus: FeeStatus;
  status?: string; // For category: Active, Inactive, Freeze, Dormant
  frozenDate?: Date; // Date when member was frozen
  deletedAt?: Date; // Date when member was soft deleted
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberWithStatus extends Member {
  status: MembershipStatus;
}

export type MemberFormData = Omit<Member, 'id' | 'createdAt' | 'updatedAt'>;

