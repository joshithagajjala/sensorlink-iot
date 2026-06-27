'use client';

import { useMemo } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSensorLink } from '@/context/sensorlink-context';
import { generateHourlyReadings, generateDailyReadings } from '@/lib/mock-data';
import {
  TrendingUp,
  AlertTriangle,
  Activity,
  Wifi,
  Gauge,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = ['#3b82f6', '#14b8a6', '#f59e0b', '#f97316', '#8b5cf6'];

// Simple SVG charts
function SimpleLineChart({ data }: { data: { [key: string]: number | string }[] }) {
  const values = data.map(d => Number(d.distance));
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-64">
      <polyline
        fill="none"
        stroke="#3b82f6"
        strokeWidth="0.8"
        points={data.map((point, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 40 - ((Number(point.distance) - min) / range) * 38 - 1;
          return `${x},${y}`;
        }).join(' ')}
      />
    </svg>
  );
}

function SimpleBarChart({ data }: { data: { [key: string]: number | string }[] }) {
  const max = Math.max(...data.map(d => Number(d.alerts)), 1);

  return (
    <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-48">
      {data.map((point, index) => {
        const height = (Number(point.alerts) / max) * 45;
        const width = 100 / data.length;
        return (
          <rect
            key={index}
            x={index * width + 1}
            y={50 - height}
            width={Math.max(width - 2, 1)}
            height={height}
            fill="#ef4444"
            rx="0.5"
          />
        );
      })}
    </svg>
  );
}

export default function AnalyticsPage() {
  const { devices, alerts, stats } = useSensorLink();

  const healthSummary = useMemo(() => ({
    healthy: devices.filter((d) => d.status === 'normal').length,
    warning: devices.filter((d) => d.status === 'warning').length,
    critical: devices.filter((d) => d.status === 'alert').length,
    offline: devices.filter((d) => d.status === 'offline').length,
  }), [devices]);

  const healthPieData = [
    { name: 'Healthy', value: healthSummary.healthy, color: '#22c55e' },
    { name: 'Warning', value: healthSummary.warning, color: '#f59e0b' },
    { name: 'Critical', value: healthSummary.critical, color: '#ef4444' },
    { name: 'Offline', value: healthSummary.offline, color: '#64748b' },
  ].filter((d) => d.value > 0);

  const alertBreakdown = useMemo(() => {
    const types = alerts.reduce((acc, alert) => {
      acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(types).map(([type, count]) => ({
      type: type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      count,
    }));
  }, [alerts]);

  const distanceData = generateHourlyReadings(24);
  const alertData = generateDailyReadings(7);
  const deviceComparison = devices.slice(0, 6).map((device) => ({
    name: device.friendly_name.split(' ')[0],
    distance: device.current_distance || 0,
    threshold: device.threshold,
  }));

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights and trends for your IoT sensor network.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SummaryCard title="Total Alerts" value={alerts.length} icon={AlertTriangle} color="text-red-500" bg="bg-red-50 dark:bg-red-950/20" />
          <SummaryCard title="Avg Distance" value={`${stats.averageDistance.toFixed(1)}cm`} icon={Gauge} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-950/20" />
          <SummaryCard title="Device Health" value={`${Math.round((healthSummary.healthy / (devices.length || 1)) * 100)}%`} icon={Activity} color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-950/20" />
          <SummaryCard title="Online Rate" value={`${Math.round((stats.onlineDevices / (stats.totalDevices || 1)) * 100)}%`} icon={Wifi} color="text-cyan-500" bg="bg-cyan-50 dark:bg-cyan-950/20" />
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList>
            <TabsTrigger value="trends">Distance Trends</TabsTrigger>
            <TabsTrigger value="alerts">Alert Analysis</TabsTrigger>
            <TabsTrigger value="devices">Device Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Distance Trends</CardTitle>
                  <CardDescription>Average distance readings across all devices over time.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleLineChart data={distanceData} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Alert Frequency</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart data={alertData} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Device Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {healthPieData.map((item) => (
                      <div key={item.name} className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                        <span className="flex-1 text-sm">{item.name}</span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Alert Types Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {alertBreakdown.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No alerts recorded</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {alertBreakdown.map((item, index) => (
                        <div key={item.type} className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="flex-1 text-sm">{item.type}</span>
                          <Badge variant="outline">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Alerting Devices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(alerts.reduce((acc, alert) => {
                      acc[alert.device_id] = (acc[alert.device_id] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>))
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([deviceId, count], index) => {
                        const device = devices.find((d) => d.device_id === deviceId);
                        return (
                          <div key={deviceId} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{device?.friendly_name || deviceId}</p>
                            </div>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="devices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Distance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deviceComparison.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground">{item.distance.toFixed(1)}cm / {item.threshold}cm</span>
                      </div>
                      <div className="h-4 bg-muted rounded overflow-hidden">
                        <div className="h-full bg-blue-500 rounded" style={{ width: `${Math.min((item.distance / item.threshold) * 100, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map((device) => (
                <Card key={device.id} className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-medium">{device.friendly_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{device.device_id}</p>
                      </div>
                      <Badge variant="outline" className={cn(
                        device.status === 'normal' && 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
                        device.status === 'warning' && 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
                        device.status === 'alert' && 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400',
                        device.status === 'offline' && 'bg-slate-50 text-slate-700 dark:bg-slate-900/50 dark:text-slate-400'
                      )}>
                        {device.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Distance</span>
                        <span className="font-medium">{device.current_distance?.toFixed(1) || '--'} cm</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Threshold</span>
                        <span className="font-medium">{device.threshold} cm</span>
                      </div>
                      <div className="h-2 bg-muted rounded overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded',
                            device.status === 'alert' && 'bg-red-500',
                            device.status === 'warning' && 'bg-amber-500',
                            device.status === 'normal' && 'bg-emerald-500',
                            device.status === 'offline' && 'bg-slate-400'
                          )}
                          style={{ width: `${Math.min(((device.current_distance || 0) / device.threshold) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function SummaryCard({ title, value, icon: Icon, color, bg }: {
  title: string;
  value: string | number;
  icon: typeof Activity;
  color: string;
  bg: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', bg)}>
            <Icon className={cn('h-5 w-5', color)} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
