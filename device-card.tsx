'use client';

import { cn } from '@/lib/utils';
import { DeviceStatus } from '@/types';

interface WaterTankProps {
  level: number; // 0-100
  threshold: number; // threshold level as percentage
  height?: number;
  width?: number;
  status?: DeviceStatus;
  showLabel?: boolean;
}

export function WaterTank({
  level,
  threshold,
  height = 200,
  width = 120,
  status = 'normal',
  showLabel = true,
}: WaterTankProps) {
  const clampedLevel = Math.max(0, Math.min(100, level));
  const clampedThreshold = Math.max(0, Math.min(100, threshold));
  const waterHeight = (clampedLevel / 100) * height;
  const thresholdPosition = height - (clampedThreshold / 100) * height;

  const getWaterColor = () => {
    if (status === 'alert') return 'from-red-600 to-red-700';
    if (status === 'warning') return 'from-amber-500 to-amber-600';
    return 'from-cyan-400 to-blue-500';
  };

  const getStatusColor = () => {
    if (status === 'alert') return 'bg-red-500';
    if (status === 'warning') return 'bg-amber-500';
    if (status === 'offline') return 'bg-slate-400';
    return 'bg-emerald-500';
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Tank container */}
      <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
        {/* Tank outline */}
        <div className="absolute inset-0 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 overflow-hidden shadow-inner">
          {/* Water fill */}
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 bg-gradient-to-t transition-all duration-1000 ease-out',
              getWaterColor()
            )}
            style={{ height: `${waterHeight}px` }}
          >
            {/* Water surface animation */}
            <div className="absolute top-0 left-0 right-0 h-4 overflow-hidden">
              <svg
                viewBox="0 0 120 10"
                className="w-full h-auto"
                style={{ width: `${width}px` }}
              >
                <path
                  d="M0,5 Q15,0 30,5 T60,5 T90,5 T120,5 V10 H0 Z"
                  fill="currentColor"
                  className="text-white/30 animate-pulse"
                />
              </svg>
            </div>
            {/* Bubbles */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ left: '20%', bottom: '20%', animationDelay: '0s' }} />
              <div className="absolute w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ left: '60%', bottom: '40%', animationDelay: '0.5s' }} />
              <div className="absolute w-1 h-1 bg-white/20 rounded-full animate-bounce" style={{ left: '80%', bottom: '30%', animationDelay: '1s' }} />
            </div>
          </div>

          {/* Threshold line */}
          <div
            className="absolute left-0 right-0 flex items-center transition-all duration-300"
            style={{ top: `${thresholdPosition}px` }}
          >
            <div className="flex-1 border-t-2 border-dashed border-red-400 dark:border-red-500" />
            <div className="shrink-0 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
              Thresh
            </div>
          </div>

          {/* Level markers */}
          {[0, 25, 50, 75, 100].map((mark) => (
            <div
              key={mark}
              className="absolute right-2 flex items-center text-[10px] text-muted-foreground font-medium"
              style={{ bottom: `${mark}%`, transform: `translateY(${mark === 0 ? 0 : 50}%)` }}
            >
              <span className="text-muted-foreground/50">{mark}%</span>
              <div className="w-3 ml-1 border-t border-slate-300 dark:border-slate-600" />
            </div>
          ))}
        </div>

        {/* Glass reflection effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Status indicator */}
      {showLabel && (
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center">
            <span className={cn('w-2 h-2 rounded-full', getStatusColor())} />
            <span className="font-semibold text-lg">{clampedLevel.toFixed(1)}%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Water Level
          </p>
        </div>
      )}
    </div>
  );
}
