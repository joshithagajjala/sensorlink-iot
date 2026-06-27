'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { predictTankTime, formatTimePrediction, calculateTankLevel, generateMockReadings } from '@/lib/mock-data';
import { Device } from '@/types';
import { Clock, AlertTriangle, Droplets, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface PredictionSummaryProps {
  devices: Device[];
}

export function PredictionSummary({ devices }: PredictionSummaryProps) {
  const router = useRouter();

  const devicePredictions = useMemo(() => {
    return devices
      .filter(d => d.status !== 'offline' && d.current_distance !== null)
      .map(device => {
        // Generate readings for prediction
        const readings = generateMockReadings(device.device_id, 1, 5);
        const prediction = predictTankTime(readings.map(r => ({ distance: r.distance, recorded_at: r.recorded_at })), 200, device.threshold);
        const tankLevel = calculateTankLevel(device.current_distance || 0);

        return {
          device,
          prediction,
          tankLevel,
          readings,
        };
      })
      .filter(d => d.prediction.confidence !== 'low' && d.prediction.trend !== 'stable')
      .sort((a, b) => {
        // Sort by urgency (time to empty first)
        const aTime = a.prediction.timeToEmpty || Infinity;
        const bTime = b.prediction.timeToEmpty || Infinity;
        return aTime - bTime;
      })
      .slice(0, 4); // Show top 4
  }, [devices]);

  if (devicePredictions.length === 0) {
    return null;
  }

  const criticalDevices = devicePredictions.filter(
    d => d.prediction.timeToEmpty !== null && d.prediction.timeToEmpty < 60
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Tank Level Predictions
          </CardTitle>
          {criticalDevices.length > 0 && (
            <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-800">
              {criticalDevices.length} Critical
            </Badge>
          )}
        </div>
        <CardDescription>
          Estimated fill/empty times based on current trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {devicePredictions.map(({ device, prediction, tankLevel }) => {
            const isCritical = prediction.timeToEmpty !== null && prediction.timeToEmpty < 60;
            const TrendIcon = prediction.trend === 'filling' ? TrendingDown : prediction.trend === 'emptying' ? TrendingUp : Minus;
            const trendColor = prediction.trend === 'filling' ? 'text-cyan-500' : prediction.trend === 'emptying' ? 'text-amber-500' : 'text-muted-foreground';

            return (
              <div
                key={device.device_id}
                className={cn(
                  'flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors',
                  isCritical
                    ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/30'
                    : 'bg-muted/50 border-border hover:bg-muted'
                )}
                onClick={() => router.push(`/devices/${device.device_id}`)}
              >
                <div className={cn('p-2 rounded-lg bg-background', trendColor)}>
                  <TrendIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{device.friendly_name}</p>
                    {isCritical && (
                      <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {prediction.trend === 'filling'
                      ? `Filling - ${formatTimePrediction(prediction.timeToFull)} to full`
                      : prediction.trend === 'emptying'
                      ? `Emptying - ${formatTimePrediction(prediction.timeToEmpty)} remaining`
                      : 'Stable level'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-sm">{tankLevel.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.abs(prediction.fillRate).toFixed(1)} cm/hr
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {devicePredictions.length === 0 && (
          <p className="text-center text-muted-foreground py-4 text-sm">
            No significant trends detected
          </p>
        )}
      </CardContent>
    </Card>
  );
}
