'use client';

import { useState } from 'react';
import { useSensorLink } from '@/context/sensorlink-context';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, AlertTriangle, WifiOff, CheckCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { AlertType } from '@/types';

const alertTypeConfig: Record<AlertType, { icon: typeof AlertTriangle; color: string }> = {
  threshold_exceeded: { icon: AlertTriangle, color: 'text-red-500' },
  threshold_warning: { icon: AlertTriangle, color: 'text-amber-500' },
  device_offline: { icon: WifiOff, color: 'text-slate-500' },
  device_recovered: { icon: CheckCheck, color: 'text-emerald-500' },
};

export function NotificationCenter() {
  const { alerts, markAlertRead, markAllAlertsRead } = useSensorLink();
  const [open, setOpen] = useState(false);

  const unreadCount = alerts.filter(a => !a.is_read).length;
  const recentAlerts = alerts.slice(0, 10);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 sm:w-96">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto py-1 px-2"
              onClick={() => markAllAlertsRead()}
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {recentAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentAlerts.map((alert) => {
                const config = alertTypeConfig[alert.alert_type];
                const Icon = config.icon;
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      'flex items-start gap-3 p-4 transition-colors hover:bg-muted/50',
                      !alert.is_read && 'bg-blue-50/50 dark:bg-blue-950/20'
                    )}
                  >
                    <div className={cn('mt-0.5', config.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          'text-sm leading-tight',
                          !alert.is_read && 'font-medium'
                        )}>
                          {alert.message}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-6 w-6 opacity-60 hover:opacity-100"
                          onClick={() => markAlertRead(alert.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.device_id} · {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </p>
                      {alert.distance && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Distance: {alert.distance.toFixed(1)}cm
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
