import { FeeType } from './fee';

export interface PaymentRecord {
  id: string;
  memberId: number;
  memberName: string;
  feeType: FeeType;
  amount: number;
  paymentDate: Date;
  createdAt: Date;
}

