-- Initial database schema for Smart Irrigation IoT System
-- PostgreSQL migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE "UserRole" AS ENUM ('farmer', 'manager', 'agronomist', 'technician', 'admin');
CREATE TYPE "GrowthStage" AS ENUM ('seedling', 'vegetative', 'flowering', 'fruiting', 'harvest');
CREATE TYPE "ScheduleStatus" AS ENUM ('pending', 'active', 'completed', 'cancelled', 'failed');
CREATE TYPE "DeviceType" AS ENUM ('sensor', 'valve', 'pump', 'controller');
CREATE TYPE "DeviceStatus" AS ENUM ('online', 'offline', 'maintenance', 'error');
CREATE TYPE "AlertType" AS ENUM ('sensor_error', 'device_offline', 'threshold_exceeded', 'low_water', 'system_error');
CREATE TYPE "AlertSeverity" AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE "WaterSourceType" AS ENUM ('well', 'reservoir', 'river', 'municipal');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role "UserRole" NOT NULL,
    permissions JSONB DEFAULT '[]'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Farms table
CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    location JSONB NOT NULL,
    area DOUBLE PRECISION NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_farms_owner_id ON farms(owner_id);

-- Farm access table (for multi-user access)
CREATE TABLE farm_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(farm_id, user_id)
);

CREATE INDEX idx_farm_access_user_id ON farm_access(user_id);

-- Irrigation zones table
CREATE TABLE irrigation_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    area DOUBLE PRECISION NOT NULL,
    crop_type VARCHAR(100) NOT NULL,
    growth_stage "GrowthStage" NOT NULL,
    soil_type VARCHAR(100) NOT NULL,
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    sensors TEXT[] DEFAULT '{}',
    actuators TEXT[] DEFAULT '{}',
    configuration JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_irrigation_zones_farm_id ON irrigation_zones(farm_id);
CREATE INDEX idx_irrigation_zones_priority ON irrigation_zones(priority);

-- Irrigation schedules table
CREATE TABLE irrigation_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id UUID NOT NULL REFERENCES irrigation_zones(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL,
    flow_rate DOUBLE PRECISION NOT NULL,
    water_amount DOUBLE PRECISION NOT NULL,
    status "ScheduleStatus" DEFAULT 'pending',
    is_manual BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES users(id),
    executed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_irrigation_schedules_zone_id ON irrigation_schedules(zone_id);
CREATE INDEX idx_irrigation_schedules_start_time ON irrigation_schedules(start_time);
CREATE INDEX idx_irrigation_schedules_status ON irrigation_schedules(status);
CREATE INDEX idx_irrigation_schedules_created_by ON irrigation_schedules(created_by);

-- Devices table
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    type "DeviceType" NOT NULL,
    model VARCHAR(100) NOT NULL,
    firmware_version VARCHAR(50) NOT NULL,
    status "DeviceStatus" DEFAULT 'offline',
    location JSONB NOT NULL,
    configuration JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    security_key VARCHAR(255) NOT NULL,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_devices_farm_id ON devices(farm_id);
CREATE INDEX idx_devices_type ON devices(type);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_last_seen ON devices(last_seen);

-- Alerts table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type "AlertType" NOT NULL,
    severity "AlertSeverity" NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    source_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

CREATE INDEX idx_alerts_source_id ON alerts(source_id);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);
CREATE INDEX idx_alerts_acknowledged_by ON alerts(acknowledged_by);

-- Water sources table
CREATE TABLE water_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type "WaterSourceType" NOT NULL,
    capacity DOUBLE PRECISION NOT NULL,
    current_level DOUBLE PRECISION NOT NULL,
    pump_rate DOUBLE PRECISION NOT NULL,
    location JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (current_level <= capacity)
);

CREATE INDEX idx_water_sources_farm_id ON water_sources(farm_id);
CREATE INDEX idx_water_sources_is_active ON water_sources(is_active);

-- Reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config JSONB NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    generated_by UUID NOT NULL REFERENCES users(id),
    file_url TEXT,
    data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_reports_generated_by ON reports(generated_by);
CREATE INDEX idx_reports_generated_at ON reports(generated_at);

-- Weather cache table
CREATE TABLE weather_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    forecasts JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_weather_cache_expires_at ON weather_cache(expires_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON farms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_irrigation_zones_updated_at BEFORE UPDATE ON irrigation_zones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_irrigation_schedules_updated_at BEFORE UPDATE ON irrigation_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_water_sources_updated_at BEFORE UPDATE ON water_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123 - CHANGE IN PRODUCTION)
INSERT INTO users (username, email, password_hash, role, is_active)
VALUES (
    'admin',
    'admin@irrigation.local',
    '$2b$10$rKvVPZqGhf5L5h5L5h5L5uO5L5h5L5h5L5h5L5h5L5h5L5h5L5h5L',
    'admin',
    true
);
