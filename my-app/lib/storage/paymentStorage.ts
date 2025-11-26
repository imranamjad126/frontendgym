import { PaymentRecord } from '../types/payment';
import { getItem, setItem } from './localStorage';
import { STORAGE_KEYS } from './storageKeys';
import { generateMemberId } from '../utils/idGenerator';

export function getAllPayments(): PaymentRecord[] {
  const payments = getItem<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS) || [];
  // Convert date strings back to Date objects
  return payments.map(payment => ({
    ...payment,
    paymentDate: new Date(payment.paymentDate),
    createdAt: new Date(payment.createdAt),
  }));
}

export function getMemberPayments(memberId: number): PaymentRecord[] {
  const allPayments = getAllPayments();
  return allPayments.filter(payment => payment.memberId === memberId);
}

export function getPaymentsByDateRange(startDate: Date, endDate: Date): PaymentRecord[] {
  const allPayments = getAllPayments();
  return allPayments.filter(payment => {
    const paymentDate = new Date(payment.paymentDate);
    return paymentDate >= startDate && paymentDate <= endDate;
  });
}

export function savePayment(
  memberId: number,
  memberName: string,
  feeType: 'WITH_AC' | 'WITHOUT_AC' | 'ONE_DAY',
  amount: number,
  paymentDate: Date = new Date()
): PaymentRecord {
  const allPayments = getAllPayments();
  const newPayment: PaymentRecord = {
    id: `payment_${memberId}_${Date.now()}`,
    memberId,
    memberName,
    feeType,
    amount,
    paymentDate,
    createdAt: new Date(),
  };
  
  allPayments.push(newPayment);
  setItem(STORAGE_KEYS.PAYMENTS, allPayments);
  
  // Dispatch custom event when payment is added
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('paymentsUpdated'));
  }
  
  return newPayment;
}

export function getTotalRevenue(startDate?: Date, endDate?: Date): number {
  const payments = startDate && endDate
    ? getPaymentsByDateRange(startDate, endDate)
    : getAllPayments();
  
  return payments.reduce((sum, payment) => sum + payment.amount, 0);
}

