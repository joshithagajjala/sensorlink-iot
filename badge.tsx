'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  PlusCircle,
  Settings,
  Wifi,
  WifiOff,
  X,
  LogOut,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useSensorLink } from '@/context/sensorlink-context';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/devices', label: 'All Devices', icon: Activity },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/devices/add', label: 'Add Device', icon: PlusCircle },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { stats } = useSensorLink();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 flex h-full w-72 flex-col bg-card border-r transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b lg:pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-primary shadow-lg shadow-primary/25">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SensorLink
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">IoT Monitoring</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Button
                key={item.href}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3 h-11 px-3',
                  isActive && 'bg-primary/10 text-primary font-medium'
                )}
                onClick={() => {
                  router.push(item.href);
                  onClose();
                }}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        {/* System Status */}
        <div className="p-4 border-t">
          <div className="p-4 rounded-xl bg-muted/50">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">
              System Status
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Devices Online</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Wifi className="w-4 h-4 text-emerald-500" />
                  {stats.onlineDevices}/{stats.totalDevices}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Devices Offline</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <WifiOff className="w-4 h-4 text-slate-400" />
                  {stats.offlineDevices}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active Alerts</span>
                <span className={cn(
                  'font-medium',
                  stats.activeAlerts > 0 ? 'text-red-500' : 'text-muted-foreground'
                )}>
                  {stats.activeAlerts}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
