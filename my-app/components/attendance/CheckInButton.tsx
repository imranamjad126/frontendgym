'use client';

import { Button } from '@/components/ui/button';
import { MembershipStatus } from '@/lib/types/status';
import { CheckCircle2, XCircle } from 'lucide-react';

interface CheckInButtonProps {
  status: MembershipStatus;
  onCheckIn: () => void;
  disabled?: boolean;
}

export function CheckInButton({ status, onCheckIn, disabled }: CheckInButtonProps) {
  const isExpired = status === MembershipStatus.EXPIRED;
  const isDisabled = isExpired || disabled;

  return (
    <Button
      onClick={onCheckIn}
      disabled={isDisabled}
      variant={isExpired ? 'destructive' : 'default'}
      className={`w-full ${isDisabled && !isExpired ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : ''}`}
      size="lg"
    >
      {isExpired ? (
        <>
          <XCircle className="mr-2 h-5 w-5" />
          Membership Expired
        </>
      ) : (
        <>
          <CheckCircle2 className="mr-2 h-5 w-5" />
          Check In
        </>
      )}
    </Button>
  );
}




