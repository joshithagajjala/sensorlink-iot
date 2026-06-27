'use client';

import { DeviceStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: DeviceStatus;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

const statusColors: Record<DeviceStatus, string> = {
  normal: 'bg-emerald-500',
  warning: 'bg-amber-500',
  alert: 'bg-red-500',
  offline: 'bg-slate-400',
};

export function StatusIndicator({ status, size = 'md', pulse = true, className }: StatusIndicatorProps) {
  return (
    <span className={cn('relative inline-flex', className)}>
      <span
        className={cn(
          'rounded-full',
          sizeClasses[size],
          statusColors[status]
        )}
      />
      {pulse && status !== 'offline' && (
        <span
          className={cn(
            'absolute top-0 left-0 w-full h-full rounded-full animate-ping opacity-75',
            statusColors[status]
          )}
        />
      )}
    </span>
  );
}
