'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Device, Alert, DistanceReading, DeviceStats } from '@/types';
import { generateMockDevices, generateMockAlerts, generateMockReadings } from '@/lib/mock-data';

interface SensorLinkContextType {
  devices: Device[];
  alerts: Alert[];
  stats: DeviceStats;
  selectedDevice: Device | null;
  deviceReadings: DistanceReading[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  selectDevice: (device: Device | null) => void;
  updateDevice: (deviceId: string, updates: Partial<Device>) => void;
  markAlertRead: (alertId: string) => void;
  markAllAlertsRead: () => void;
  addDevice: (device: Omit<Device, 'id' | 'created_at' | 'updated_at'>) => void;
  deleteDevice: (deviceId: string) => void;
}

const SensorLinkContext = createContext<SensorLinkContextType | undefined>(undefined);

export function useSensorLink() {
  const context = useContext(SensorLinkContext);
  if (!context) {
    throw new Error('useSensorLink must be used within a SensorLinkProvider');
  }
  return context;
}

export function SensorLinkProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceReadings, setDeviceReadings] = useState<DistanceReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate stats from devices
  const stats: DeviceStats = {
    totalDevices: devices.length,
    onlineDevices: devices.filter(d => d.status !== 'offline').length,
    offlineDevices: devices.filter(d => d.status === 'offline').length,
    activeAlerts: alerts.filter(a => !a.is_read).length,
    averageDistance: devices.length > 0
      ? devices.filter(d => d.current_distance !== null).reduce((sum, d) => sum + (d.current_distance || 0), 0) / devices.filter(d => d.current_distance !== null).length
      : 0,
  };

  // Initialize data
  useEffect(() => {
    refreshData();
  }, []);

  // Load readings when device is selected
  useEffect(() => {
    if (selectedDevice) {
      const readings = generateMockReadings(selectedDevice.device_id, 24);
      setDeviceReadings(readings);
    } else {
      setDeviceReadings([]);
    }
  }, [selectedDevice]);

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockDevices = generateMockDevices(8);
    const mockAlerts = generateMockAlerts(mockDevices, 15);
    setDevices(mockDevices);
    setAlerts(mockAlerts);
    setIsLoading(false);
  };

  const selectDevice = (device: Device | null) => {
    setSelectedDevice(device);
  };

  const updateDevice = (deviceId: string, updates: Partial<Device>) => {
    setDevices(prev => prev.map(d =>
      d.device_id === deviceId ? { ...d, ...updates, updated_at: new Date().toISOString() } : d
    ));
    if (selectedDevice?.device_id === deviceId) {
      setSelectedDevice(prev => prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null);
    }
  };

  const markAlertRead = (alertId: string) => {
    setAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, is_read: true } : a
    ));
  };

  const markAllAlertsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
  };

  const addDevice = (device: Omit<Device, 'id' | 'created_at' | 'updated_at'>) => {
    const newDevice: Device = {
      ...device,
      id: `dev_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setDevices(prev => [...prev, newDevice]);
  };

  const deleteDevice = (deviceId: string) => {
    setDevices(prev => prev.filter(d => d.device_id !== deviceId));
    setAlerts(prev => prev.filter(a => a.device_id !== deviceId));
    if (selectedDevice?.device_id === deviceId) {
      setSelectedDevice(null);
    }
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prev => prev.map(device => {
        if (device.status === 'offline') return device;

        const newDistance = Math.max(5, Math.min(395,
          (device.current_distance || 50) + (Math.random() - 0.5) * 2
        ));
        const newStatus = newDistance >= device.threshold ? 'alert'
          : newDistance >= device.threshold * 0.85 ? 'warning'
          : 'normal';

        return {
          ...device,
          current_distance: newDistance,
          status: newStatus,
          last_updated: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SensorLinkContext.Provider value={{
      devices,
      alerts,
      stats,
      selectedDevice,
      deviceReadings,
      isLoading,
      refreshData,
      selectDevice,
      updateDevice,
      markAlertRead,
      markAllAlertsRead,
      addDevice,
      deleteDevice,
    }}>
      {children}
    </SensorLinkContext.Provider>
  );
}
