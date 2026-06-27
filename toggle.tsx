import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DeviceStatus } from '@/types';

interface StatusBadgeProps {
  status: DeviceStatus;
  className?: string;
}

const statusConfig: Record<DeviceStatus, { label: string; className: string }> = {
  normal: {
    label: 'Normal',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  },
  warning: {
    label: 'Warning',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  },
  alert: {
    label: 'Alert',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  },
  offline: {
    label: 'Offline',
    className: 'bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium px-2.5 py-0.5 rounded-full border transition-colors',
        config.className,
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full mr-1.5',
          status === 'normal' && 'bg-emerald-500',
          status === 'warning' && 'bg-amber-500',
          status === 'alert' && 'bg-red-500',
          status === 'offline' && 'bg-slate-400'
        )}
      />
      {config.label}
    </Badge>
  );
}
