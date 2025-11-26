import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MembershipStatus } from '@/lib/types/status';
import { daysUntilExpiry } from '@/lib/utils/status';

interface ExpiryWarningProps {
  expiryDate: Date;
  status: MembershipStatus;
}

export function ExpiryWarning({ expiryDate, status }: ExpiryWarningProps) {
  if (status === MembershipStatus.ACTIVE) {
    return null;
  }

  const days = daysUntilExpiry(expiryDate);
  const isExpired = status === MembershipStatus.EXPIRED;

  return (
    <Alert variant={isExpired ? 'destructive' : 'warning'}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>
        {isExpired ? 'Membership Expired' : 'Membership Expiring Soon'}
      </AlertTitle>
      <AlertDescription>
        {isExpired
          ? `This membership expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago.`
          : `This membership expires in ${days} day${days !== 1 ? 's' : ''}.`}
      </AlertDescription>
    </Alert>
  );
}









