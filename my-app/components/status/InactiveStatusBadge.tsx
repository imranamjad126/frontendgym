'use client';

import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, Snowflake, XCircle } from 'lucide-react';

interface InactiveStatusBadgeProps {
  reasons: string[];
  className?: string;
}

export function InactiveStatusBadge({ reasons, className }: InactiveStatusBadgeProps) {
  if (reasons.length === 0) {
    return null;
  }

  const getBadgeConfig = (reason: string) => {
    switch (reason) {
      case 'Unpaid':
        return {
          label: 'Unpaid',
          icon: XCircle,
          className: 'bg-red-100 text-red-700 border-red-300',
        };
      case 'Expired':
        return {
          label: 'Expired',
          icon: Clock,
          className: 'bg-orange-100 text-orange-700 border-orange-300',
        };
      case 'Frozen':
        return {
          label: 'Frozen',
          icon: Snowflake,
          className: 'bg-blue-100 text-blue-700 border-blue-300',
        };
      case 'No Attendance':
        return {
          label: 'No Attendance',
          icon: AlertCircle,
          className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        };
      default:
        return {
          label: reason,
          icon: AlertCircle,
          className: 'bg-gray-100 text-gray-700 border-gray-300',
        };
    }
  };

  return (
    <div className={`flex flex-wrap gap-1 ${className || ''}`}>
      {reasons.map((reason, index) => {
        const config = getBadgeConfig(reason);
        const Icon = config.icon;
        return (
          <Badge
            key={index}
            variant="outline"
            className={`${config.className} text-xs`}
          >
            <Icon className="mr-1 h-3 w-3" />
            {config.label}
          </Badge>
        );
      })}
    </div>
  );
}






