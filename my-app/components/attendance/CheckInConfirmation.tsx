'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { MembershipStatus } from '@/lib/types/status';

interface CheckInConfirmationProps {
  type: 'success' | 'error' | 'warning';
  message: string;
  status?: MembershipStatus;
}

export function CheckInConfirmation({ type, message, status }: CheckInConfirmationProps) {
  const variantMap = {
    success: 'success' as const,
    error: 'destructive' as const,
    warning: 'warning' as const,
  };

  const iconMap = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
  };

  const Icon = iconMap[type];

  return (
    <Alert variant={variantMap[type]}>
      <Icon className="h-4 w-4" />
      <AlertTitle>
        {type === 'success' ? 'Check-in Successful' : type === 'error' ? 'Check-in Failed' : 'Warning'}
      </AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}









