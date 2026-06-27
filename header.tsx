'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { predictTankTime, formatTimePrediction, calculateTankLevel } from '@/lib/mock-data';
import { TrendingUp, TrendingDown, Minus, Clock, Droplets, AlertTriangle, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TankPredictionProps {
  readings: { distance: number; recorded_at: string }[];
  currentDistance: number;
  threshold: number;
  tankDepth?: number;
}

export function TankPrediction({ readings, currentDistance, threshold, tankDepth = 200 }: TankPredictionProps) {
  const prediction = useMemo(() => {
    return predictTankTime(readings, tankDepth, threshold);
  }, [readings, threshold, tankDepth]);

  const tankLevel = calculateTankLevel(currentDistance, tankDepth);

  const getTrendIcon = () => {
    switch (prediction.trend) {
      case 'filling':
        return <TrendingDown className="h-4 w-4 text-cyan-500" />;
      case 'emptying':
        return <TrendingUp className="h-4 w-4 text-amber-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (prediction.trend) {
      case 'filling':
        return 'text-cyan-600 dark:text-cyan-400';
      case 'emptying':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getConfidenceBadge = () => {
    switch (prediction.confidence) {
      case 'high':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">High Confidence</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-800">Medium Confidence</Badge>;
      default:
        return <Badge variant="outline" className="bg-slate-50 text-slate-600 dark:bg-slate-900/50 dark:text-slate-400">Low Confidence</Badge>;
    }
  };

  // Warning conditions
  const isEmptySoon = prediction.timeToEmpty !== null && prediction.timeToEmpty < 60; // Less than 1 hour
  const isFullSoon = prediction.timeToFull !== null && prediction.timeToFull < 30; // Less than 30 min

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Tank Level Prediction
          </CardTitle>
          {getConfidenceBadge()}
        </div>
        <CardDescription>
          Based on recent sensor readings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Trend */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            {getTrendIcon()}
            <div>
              <p className="text-sm text-muted-foreground">Current Trend</p>
              <p className={cn('font-semibold capitalize', getTrendColor())}>
                {prediction.trend === 'filling' ? 'Filling Up' : prediction.trend === 'emptying' ? 'Emptying' : 'Stable'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Rate</p>
            <p className="font-semibold text-sm">
              {Math.abs(prediction.fillRate).toFixed(1)} cm/hr
            </p>
          </div>
        </div>

        {/* Main Predictions */}
        <div className="grid grid-cols-2 gap-3">
          {/* Time to Empty */}
          <div className={cn(
            'p-4 rounded-xl border',
            isEmptySoon ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800' : 'bg-muted/50 border-border'
          )}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={cn('h-4 w-4', isEmptySoon ? 'text-red-500' : 'text-muted-foreground')} />
              <span className="text-xs text-muted-foreground">Time to Empty</span>
            </div>
            <p className={cn(
              'text-xl font-bold',
              isEmptySoon ? 'text-red-600 dark:text-red-400' : 'text-foreground'
            )}>
              {prediction.timeToEmpty !== null
                ? formatTimePrediction(prediction.timeToEmpty)
                : '--'}
            </p>
            {prediction.trend === 'emptying' && prediction.timeToEmpty !== null && (
              <p className="text-xs text-muted-foreground mt-1">
                ~{Math.round(tankLevel)}% remaining
              </p>
            )}
          </div>

          {/* Time to Full */}
          <div className={cn(
            'p-4 rounded-xl border',
            isFullSoon ? 'bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800' : 'bg-muted/50 border-border'
          )}>
            <div className="flex items-center gap-2 mb-2">
              <Droplets className={cn('h-4 w-4', isFullSoon ? 'text-cyan-500' : 'text-muted-foreground')} />
              <span className="text-xs text-muted-foreground">Time to Full</span>
            </div>
            <p className={cn(
              'text-xl font-bold',
              isFullSoon ? 'text-cyan-600 dark:text-cyan-400' : 'text-foreground'
            )}>
              {prediction.trend === 'filling' && prediction.timeToFull !== null
                ? formatTimePrediction(prediction.timeToFull)
                : '--'}
            </p>
            {prediction.trend === 'filling' && prediction.timeToFull !== null && (
              <p className="text-xs text-muted-foreground mt-1">
                ~{Math.round(100 - tankLevel)}% to fill
              </p>
            )}
          </div>
        </div>

        {/* Visual Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Level</span>
            <span className="font-medium">{tankLevel.toFixed(1)}%</span>
          </div>
          <div className="relative h-4 rounded-full bg-muted overflow-hidden">
            {/* Water level */}
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                tankLevel > 50 ? 'bg-cyan-500' : tankLevel > 20 ? 'bg-amber-500' : 'bg-red-500'
              )}
              style={{ width: `${tankLevel}%` }}
            />
            {/* Trend indicator */}
            {prediction.trend !== 'stable' && (
              <div
                className={cn(
                  'absolute top-0 h-full w-1 transition-all duration-300',
                  prediction.trend === 'filling' ? 'bg-cyan-300' : 'bg-amber-300'
                )}
                style={{
                  left: prediction.trend === 'filling'
                    ? `${Math.min(tankLevel + 5, 100)}%`
                    : `${Math.max(tankLevel - 5, 0)}%`
                }}
              />
            )}
          </div>
          {/* Scale markers */}
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Empty</span>
            <span>50%</span>
            <span>Full</span>
          </div>
        </div>

        {/* Alert Warnings */}
        {isEmptySoon && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-red-700 dark:text-red-300">Tank Nearly Empty</p>
              <p className="text-xs text-red-600 dark:text-red-400">
                Tank will empty in approximately {formatTimePrediction(prediction.timeToEmpty)}. Consider refilling soon.
              </p>
            </div>
          </div>
        )}

        {prediction.trend === 'filling' && isFullSoon && tankLevel > 80 && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800">
            <Droplets className="h-5 w-5 text-cyan-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-cyan-700 dark:text-cyan-300">Tank Almost Full</p>
              <p className="text-xs text-cyan-600 dark:text-cyan-400">
                Tank will reach full capacity in approximately {formatTimePrediction(prediction.timeToFull)}.
              </p>
            </div>
          </div>
        )}

        {/* Stats Footer */}
        <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
          <span>Analyzed {readings.length} readings</span>
          <span>Updated just now</span>
        </div>
      </CardContent>
    </Card>
  );
}
