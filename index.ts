export type DeviceStatus = 'normal' | 'warning' | 'alert' | 'offline';

export type AlertType = 'threshold_exceeded' | 'device_offline' | 'device_recovered' | 'threshold_warning';

export interface Device {
  id: string;
  device_id: string;
  friendly_name: string;
  threshold: number;
  status: DeviceStatus;
  current_distance: number | null;
  last_updated: string | null;
  created_at: string;
  updated_at: string;
}

export interface DistanceReading {
  id: string;
  device_id: string;
  distance: number;
  status: DeviceStatus;
  recorded_at: string;
  created_at: string;
}

export interface Alert {
  id: string;
  device_id: string;
  alert_type: AlertType;
  distance: number | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface DeviceStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  activeAlerts: number;
  averageDistance: number;
}

export interface DeviceAnalytics {
  maxDistance: number;
  minDistance: number;
  avgDistance: number;
  totalAlerts: number;
}

export interface ChartDataPoint {
  timestamp: string;
  distance: number;
  label?: string;
}

export interface AlertCountByType {
  threshold_exceeded: number;
  device_offline: number;
  device_recovered: number;
  threshold_warning: number;
}
