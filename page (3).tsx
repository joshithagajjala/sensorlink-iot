'use client';

import { useState, useMemo } from 'react';
import { useSensorLink } from '@/context/sensorlink-context';
import { AppLayout } from '@/components/app-layout';
import { StatCard } from '@/components/dashboard/stat-card';
import { DeviceCard } from '@/components/dashboard/device-card';
import { WaterTank } from '@/components/dashboard/water-tank';
import { PredictionSummary } from '@/components/dashboard/prediction-summary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  Gauge,
  Search,
  LayoutGrid,
  List,
} from 'lucide-react';
import { calculateTankLevel } from '@/lib/mock-data';
import { DeviceStatus } from '@/types';
import { cn } from '@/lib/utils';

type SortOption = 'name' | 'status' | 'distance' | 'updated';
type ViewMode = 'grid' | 'tank';

export default function DashboardPage() {
  const { devices, stats, isLoading } = useSensorLink();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Filter and sort devices
  const filteredDevices = useMemo(() => {
    let result = [...devices];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.friendly_name.toLowerCase().includes(query) ||
          d.device_id.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.friendly_name.localeCompare(b.friendly_name);
        case 'status':
          const statusOrder = { alert: 0, warning: 1, normal: 2, offline: 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        case 'distance':
          return (b.current_distance || 0) - (a.current_distance || 0);
        case 'updated':
          return new Date(b.last_updated || 0).getTime() - new Date(a.last_updated || 0).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [devices, searchQuery, statusFilter, sortBy]);

  if (isLoading) {
    return (
      <AppLayout>
        <DashboardSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your connected IoT devices in real-time.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Devices"
            value={stats.totalDevices}
            icon={Activity}
            color="blue"
          />
          <StatCard
            title="Online"
            value={stats.onlineDevices}
            icon={Wifi}
            color="green"
          />
          <StatCard
            title="Offline"
            value={stats.offlineDevices}
            icon={WifiOff}
            color="yellow"
          />
          <StatCard
            title="Active Alerts"
            value={stats.activeAlerts}
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title="Avg Distance"
            value={`${stats.averageDistance.toFixed(1)}cm`}
            icon={Gauge}
            color="teal"
          />
        </div>

        {/* Prediction Summary */}
        <PredictionSummary devices={devices} />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search devices..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as DeviceStatus | 'all')}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="alert">Alert</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Last Updated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="distance">Distance</SelectItem>
            </SelectContent>
          </Select>

          {/* View toggle */}
          <div className="flex rounded-lg border bg-muted/50 p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-md"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'tank' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('tank')}
              className="rounded-md"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredDevices.length} of {devices.length} devices
        </p>

        {/* Device display */}
        {filteredDevices.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">No devices found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Add a device to get started'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDevices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDevices.map((device) => {
              const tankLevel = calculateTankLevel(device.current_distance || 0);
              return (
                <div
                  key={device.id}
                  className="flex flex-col items-center p-6 rounded-xl border bg-card card-hover cursor-pointer"
                  onClick={() => window.location.href = `/devices/${device.device_id}`}
                >
                  <WaterTank
                    level={tankLevel}
                    threshold={(device.threshold / 200) * 100}
                    height={160}
                    width={100}
                    status={device.status}
                  />
                  <div className="mt-4 text-center">
                    <h3 className="font-medium">{device.friendly_name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{device.device_id}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-10 w-40 bg-muted rounded" />
        <div className="h-4 w-80 bg-muted rounded" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-28 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="h-10 bg-muted rounded max-w-md" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}
