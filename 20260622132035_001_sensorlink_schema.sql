-- Devices table: stores IoT sensor devices
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(50) UNIQUE NOT NULL,
  friendly_name VARCHAR(100),
  threshold DECIMAL(10, 2) NOT NULL DEFAULT 50.0,
  status VARCHAR(20) NOT NULL DEFAULT 'offline',
  current_distance DECIMAL(10, 2),
  last_updated TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Distance readings table: stores sensor readings
CREATE TABLE IF NOT EXISTS distance_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(50) NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  distance DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'normal',
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts table: stores device alerts
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(50) NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  distance DECIMAL(10, 2),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);
CREATE INDEX IF NOT EXISTS idx_readings_device_id ON distance_readings(device_id);
CREATE INDEX IF NOT EXISTS idx_readings_recorded_at ON distance_readings(recorded_at);
CREATE INDEX IF NOT EXISTS idx_alerts_device_id ON alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON alerts(is_read);

-- Enable RLS
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE distance_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for devices (public read/write for demo purposes)
CREATE POLICY "select_devices" ON devices FOR SELECT USING (true);
CREATE POLICY "insert_devices" ON devices FOR INSERT WITH CHECK (true);
CREATE POLICY "update_devices" ON devices FOR UPDATE USING (true);
CREATE POLICY "delete_devices" ON devices FOR DELETE USING (true);

-- RLS policies for distance_readings
CREATE POLICY "select_readings" ON distance_readings FOR SELECT USING (true);
CREATE POLICY "insert_readings" ON distance_readings FOR INSERT WITH CHECK (true);

-- RLS policies for alerts
CREATE POLICY "select_alerts" ON alerts FOR SELECT USING (true);
CREATE POLICY "insert_alerts" ON alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "update_alerts" ON alerts FOR UPDATE USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for devices table
CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON devices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();