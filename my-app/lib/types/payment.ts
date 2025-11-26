export interface PaymentRecord {
  id: string;
  memberId: number;
  memberName: string;
  feeType: 'WITH_AC' | 'WITHOUT_AC' | 'ONE_DAY';
  amount: number;
  paymentDate: Date;
  createdAt: Date;
}

