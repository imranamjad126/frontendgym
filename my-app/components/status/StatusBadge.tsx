import { MembershipStatus } from '@/lib/types/status';
import { Badge } from '@/components/ui/badge';
import { StatusIcon } from './StatusIcon';

interface StatusBadgeProps {
  status: MembershipStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variantMap = {
    [MembershipStatus.ACTIVE]: 'success' as const,
    [MembershipStatus.EXPIRING]: 'warning' as const,
    [MembershipStatus.EXPIRED]: 'destructive' as const,
  };

  return (
    <Badge variant={variantMap[status]} className={className}>
      <StatusIcon status={status} className="mr-1" />
      {status}
    </Badge>
  );
}









