'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { Device } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ArrowRight, Gauge, Timer, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeviceCardProps {
  device: Device;
}

export function DeviceCard({ device }: DeviceCardProps) {
  const router = useRouter();
  const isOffline = device.status === 'offline';
  const isOk = device.status === 'normal';

  const getBorderColor = () => {
    switch (device.status) {
      case 'alert':
        return 'border-l-red-500 shadow-red-500/10';
      case 'warning':
        return 'border-l-amber-500 shadow-amber-500/10';
      case 'normal':
        return 'border-l-emerald-500 shadow-emerald-500/10';
      case 'offline':
        return 'border-l-slate-400 shadow-slate-400/10';
    }
  };

  const getBgColor = () => {
    switch (device.status) {
      case 'alert':
        return 'bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30';
      case 'warning':
        return 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/30';
      case 'normal':
        return 'bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20';
      case 'offline':
        return 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800/50';
    }
  };

  return (
    <Card
      className={cn(
        'card-hover overflow-hidden border-l-4 cursor-pointer group',
        getBorderColor(),
        getBgColor()
      )}
      onClick={() => router.push(`/devices/${device.device_id}`)}
    >
      <CardContent className="p-5">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-lg leading-tight truncate">
                {device.friendly_name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                {device.device_id}
              </p>
            </div>
            <StatusBadge status={device.status} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {/* Distance */}
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-background/50">
                <Gauge className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Distance</p>
                <p className={cn(
                  'font-bold text-lg',
                  isOffline ? 'text-muted-foreground' : 'text-foreground'
                )}>
                  {isOffline ? '--' : `${device.current_distance?.toFixed(1)}cm`}
                </p>
              </div>
            </div>

            {/* Threshold */}
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-background/50">
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Threshold</p>
                <p className="font-bold text-lg">
                  {device.threshold}cm
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {!isOffline && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {(device.current_distance || 0) >= device.threshold ? 'Over' : 'Under'} threshold
                </span>
                <Badge variant="outline" className="text-[10px] py-0 h-5">
                  {Math.round(((device.current_distance || 0) / device.threshold) * 100)}%
                </Badge>
              </div>
              <div className="h-2 rounded-full bg-background/50 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    device.status === 'alert' && 'bg-red-500',
                    device.status === 'warning' && 'bg-amber-500',
                    device.status === 'normal' && 'bg-emerald-500'
                  )}
                  style={{
                    width: isOffline
                      ? '0%'
                      : `${Math.min(100, ((device.current_distance || 0) / device.threshold) * 100)}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Timer className="w-3.5 h-3.5" />
              <span>
                {device.last_updated
                  ? `Updated ${formatDistanceToNow(new Date(device.last_updated), { addSuffix: true })}`
                  : 'Never updated'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity h-8"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/devices/${device.device_id}`);
              }}
            >
              View
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
