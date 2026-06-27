import { Device, DistanceReading, Alert, DeviceStatus, AlertType } from '@/types';

// Device name prefixes for realistic naming
const devicePrefixes = ['Tank', 'Reservoir', 'Container', 'Silo', 'Basin', 'Well', 'Cistern'];
const deviceLocations = ['North', 'South', 'East', 'West', 'Main', 'Backup', 'Primary', 'Secondary'];

// Generate random device ID
export function generateDeviceId(): string {
  const prefix = 'ESP32';
  const suffix = Math.random().toString(16).substring(2, 8).toUpperCase();
  return `${prefix}_${suffix}`;
}

// Generate random status based on distance and threshold
export function calculateStatus(distance: number, threshold: number): DeviceStatus {
  if (distance < 0 || distance > 400) return 'offline';
  const thresholdPercent = distance / threshold;
  if (thresholdPercent >= 1) return 'alert';
  if (thresholdPercent >= 0.85) return 'warning';
  return 'normal';
}

// Generate realistic distance value
function generateDistance(baseDistance: number, variance: number = 15): number {
  const noise = (Math.random() - 0.5) * variance;
  return Math.max(5, Math.min(395, baseDistance + noise));
}

// Generate mock devices
export function generateMockDevices(count: number = 8): Device[] {
  const devices: Device[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const prefix = devicePrefixes[i % devicePrefixes.length];
    const location = deviceLocations[i % deviceLocations.length];
    const friendlyName = `${location} ${prefix}`;
    const deviceId = generateDeviceId();
    const threshold = 80 + Math.floor(Math.random() * 40);
    const baseDistance = 20 + Math.random() * 150;
    const currentDistance = generateDistance(baseDistance);
    const status = calculateStatus(currentDistance, threshold);
    const lastUpdatedMinutesAgo = Math.floor(Math.random() * 60);
    const lastUpdated = new Date(now.getTime() - lastUpdatedMinutesAgo * 60000).toISOString();

    devices.push({
      id: `dev_${i + 1}`,
      device_id: deviceId,
      friendly_name: friendlyName,
      threshold,
      status,
      current_distance: currentDistance,
      last_updated: lastUpdated,
      created_at: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: lastUpdated,
    });
  }

  // Set 1-2 devices offline
  const offlineCount = Math.random() > 0.7 ? 2 : 1;
  for (let i = 0; i < offlineCount; i++) {
    const idx = devices.length - 1 - i;
    if (devices[idx]) {
      devices[idx].status = 'offline';
      devices[idx].last_updated = new Date(now.getTime() - (2 + Math.random() * 5) * 60 * 60 * 1000).toISOString();
    }
  }

  return devices;
}

// Generate distance readings for a device
export function generateMockReadings(
  deviceId: string,
  hoursBack: number = 24,
  readingIntervalMinutes: number = 5
): DistanceReading[] {
  const readings: DistanceReading[] = [];
  const now = new Date();
  const totalReadings = (hoursBack * 60) / readingIntervalMinutes;
  const baseDistance = 50 + Math.random() * 100;
  const threshold = 100;

  // Create a pattern (tank fills and empties)
  let currentDistance = baseDistance;

  for (let i = 0; i < totalReadings; i++) {
    const timestamp = new Date(now.getTime() - i * readingIntervalMinutes * 60000);

    // Add some pattern (gradual fill/drain cycles)
    const hour = timestamp.getHours();
    const cyclePosition = (hour % 8) / 8;

    // Distance increases as tank empties (distance sensor points down)
    const cycleEffect = Math.sin(cyclePosition * Math.PI * 2) * 40;
    const trend = (i / totalReadings) * 10; // Slight trend up or down
    currentDistance = baseDistance + cycleEffect + trend;

    const noise = (Math.random() - 0.5) * 8;
    const distance = Math.max(5, Math.min(395, currentDistance + noise));
    const status = Math.random() > 0.98 ? 'offline' : calculateStatus(distance, threshold);

    readings.push({
      id: `reading_${deviceId}_${i}`,
      device_id: deviceId,
      distance: Math.round(distance * 100) / 100,
      status,
      recorded_at: timestamp.toISOString(),
      created_at: timestamp.toISOString(),
    });
  }

  return readings.reverse();
}

// Generate mock alerts
export function generateMockAlerts(devices: Device[], count: number = 20): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();
  const alertTypes: AlertType[] = ['threshold_exceeded', 'threshold_warning', 'device_offline', 'device_recovered'];
  const messages: Record<AlertType, string[]> = {
    threshold_exceeded: ['Distance threshold exceeded', 'Critical threshold breach detected', 'Emergency: Threshold limit reached'],
    threshold_warning: ['Approaching threshold limit', 'Warning level reached', 'Threshold warning activated'],
    device_offline: ['Device went offline', 'Connection lost', ' Device unreachable'],
    device_recovered: ['Device back online', 'Connection restored', 'Device recovered successfully'],
  };

  for (let i = 0; i < count; i++) {
    const device = devices[Math.floor(Math.random() * devices.length)];
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const hoursAgo = Math.floor(Math.random() * 48) + 1;
    const minutesAgo = Math.floor(Math.random() * 60);

    alerts.push({
      id: `alert_${i}`,
      device_id: device.device_id,
      alert_type: alertType,
      distance: alertType.includes('threshold') ? device.threshold + Math.random() * 20 : null,
      message: messages[alertType][Math.floor(Math.random() * messages[alertType].length)],
      is_read: Math.random() > 0.3,
      created_at: new Date(now.getTime() - (hoursAgo * 60 + minutesAgo) * 60000).toISOString(),
    });
  }

  // Sort by created_at descending
  return alerts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// Generate device analytics
export function generateDeviceAnalytics(readings: DistanceReading[]) {
  const distances = readings.map(r => r.distance);
  const alerts = readings.filter(r => r.status === 'alert' || r.status === 'warning');

  return {
    maxDistance: Math.max(...distances),
    minDistance: Math.min(...distances),
    avgDistance: distances.reduce((a, b) => a + b, 0) / distances.length,
    totalAlerts: alerts.length,
  };
}

// Generate hourly readings for charts
export function generateHourlyReadings(hours: number = 24): { hour: string; distance: number; alerts: number }[] {
  const data = [];
  const now = new Date();
  const baseDistance = 80;

  for (let i = hours - 1; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hourLabel = hour.getHours().toString().padStart(2, '0') + ':00';
    const cycleEffect = Math.sin((i / hours) * Math.PI * 4) * 30;
    const distance = baseDistance + cycleEffect + (Math.random() - 0.5) * 20;
    const alertCount = distance > 100 ? Math.floor(Math.random() * 3) : 0;

    data.push({
      hour: hourLabel,
      distance: Math.round(Math.max(10, Math.min(200, distance))),
      alerts: alertCount,
    });
  }

  return data;
}

// Generate daily readings for charts
export function generateDailyReadings(days: number = 7): { day: string; distance: number; alerts: number }[] {
  const data = [];
  const now = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const baseDistance = 80;

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayLabel = dayNames[day.getDay()];
    const cycleEffect = Math.sin((i / days) * Math.PI * 2) * 25;
    const distance = baseDistance + cycleEffect + (Math.random() - 0.5) * 30;
    const alertCount = distance > 100 ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 2);

    data.push({
      day: dayLabel,
      distance: Math.round(Math.max(10, Math.min(200, distance))),
      alerts: alertCount,
    });
  }

  return data;
}

// Water tank percentage based on distance (assuming tank depth of 200cm)
export function calculateTankLevel(distance: number, tankDepth: number = 200): number {
  // If sensor is 200cm above tank bottom and distance reading is 80cm to water surface
  // Water level = Tank depth - distance to water
  const waterLevel = tankDepth - Math.min(distance, tankDepth);
  return Math.max(0, Math.min(100, (waterLevel / tankDepth) * 100));
}

// Predict time to fill or empty based on historical readings
export function predictTankTime(
  readings: { distance: number; recorded_at: string }[],
  tankDepth: number = 200,
  threshold: number = 100
): {
  timeToEmpty: number | null; // minutes until empty (water level = 0)
  timeToFull: number | null; // minutes until full (water level = 100%)
  fillRate: number; // cm per hour (negative means filling, positive means emptying)
  confidence: 'high' | 'medium' | 'low';
  trend: 'filling' | 'emptying' | 'stable';
} {
  if (readings.length < 10) {
    return { timeToEmpty: null, timeToFull: null, fillRate: 0, confidence: 'low', trend: 'stable' };
  }

  // Calculate rate of change over recent readings
  const recentReadings = readings.slice(-20); // Last 20 readings
  const rates: number[] = [];

  for (let i = 1; i < recentReadings.length; i++) {
    const prev = recentReadings[i - 1];
    const curr = recentReadings[i];
    const timeDiff = (new Date(curr.recorded_at).getTime() - new Date(prev.recorded_at).getTime()) / (1000 * 60 * 60); // hours
    if (timeDiff > 0) {
      const distanceDiff = curr.distance - prev.distance;
      rates.push(distanceDiff / timeDiff); // cm per hour
    }
  }

  if (rates.length === 0) {
    return { timeToEmpty: null, timeToFull: null, fillRate: 0, confidence: 'low', trend: 'stable' };
  }

  // Average rate (positive = emptying, negative = filling)
  const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;

  // Calculate variance for confidence
  const variance = rates.reduce((sum, r) => sum + Math.pow(r - avgRate, 2), 0) / rates.length;
  const stdDev = Math.sqrt(variance);

  // Confidence level based on consistency
  let confidence: 'high' | 'medium' | 'low';
  if (stdDev < 2 && rates.length >= 15) {
    confidence = 'high';
  } else if (stdDev < 5 && rates.length >= 10) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  // Current distance reading
  const currentDistance = recentReadings[recentReadings.length - 1].distance;
  const currentWaterLevel = tankDepth - currentDistance;

  // Determine trend
  let trend: 'filling' | 'emptying' | 'stable';
  if (Math.abs(avgRate) < 0.5) {
    trend = 'stable';
  } else if (avgRate > 0) {
    trend = 'emptying'; // distance increasing = water decreasing
  } else {
    trend = 'filling'; // distance decreasing = water increasing
  }

  // Calculate time predictions
  let timeToEmpty: number | null = null;
  let timeToFull: number | null = null;

  if (avgRate > 0.1) {
    // Tank is emptying (distance increasing)
    // Time until water level = 0 (distance = tankDepth)
    const distanceToEmpty = tankDepth - currentDistance;
    timeToEmpty = (distanceToEmpty / avgRate) * 60; // minutes
    timeToEmpty = Math.max(0, Math.min(timeToEmpty, 7 * 24 * 60)); // Cap at 7 days
  } else if (avgRate < -0.1) {
    // Tank is filling (distance decreasing)
    // Time until water level = 100% (distance = 0)
    const distanceToEmpty = currentDistance;
    timeToEmpty = (distanceToEmpty / avgRate) * 60; // minutes (will be negative, so abs)
    timeToFull = Math.abs((currentDistance / avgRate) * 60); // minutes
    timeToFull = Math.max(0, Math.min(timeToFull, 7 * 24 * 60)); // Cap at 7 days
  }

  return {
    timeToEmpty: timeToEmpty !== null && timeToEmpty > 0 ? timeToEmpty : null,
    timeToFull: timeToFull !== null && timeToFull > 0 ? timeToFull : null,
    fillRate: avgRate,
    confidence,
    trend,
  };
}

// Format minutes to human readable string
export function formatTimePrediction(minutes: number | null): string {
  if (minutes === null || minutes <= 0) return 'Unknown';

  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  } else if (minutes < 24 * 60) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  } else {
    const days = Math.floor(minutes / (24 * 60));
    const hours = Math.round((minutes % (24 * 60)) / 60);
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }
}
