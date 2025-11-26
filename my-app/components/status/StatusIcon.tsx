import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { MembershipStatus } from '@/lib/types/status';
import { cn } from '@/lib/utils/cn';

interface StatusIconProps {
  status: MembershipStatus;
  className?: string;
}

export function StatusIcon({ status, className }: StatusIconProps) {
  const iconProps = {
    className: cn('h-4 w-4', className),
  };

  switch (status) {
    case MembershipStatus.ACTIVE:
      return <CheckCircle2 {...iconProps} className={cn(iconProps.className, 'text-green-600')} />;
    case MembershipStatus.EXPIRING:
      return <AlertTriangle {...iconProps} className={cn(iconProps.className, 'text-yellow-600')} />;
    case MembershipStatus.EXPIRED:
      return <XCircle {...iconProps} className={cn(iconProps.className, 'text-red-600')} />;
    default:
      return null;
  }
}









