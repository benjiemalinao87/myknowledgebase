-- Add timezone support to personas and chat settings
-- This migration adds timezone configuration for better date/time handling

-- Add timezone column to personas table
ALTER TABLE personas ADD COLUMN timezone TEXT DEFAULT 'America/Los_Angeles';
ALTER TABLE personas ADD COLUMN business_hours TEXT DEFAULT '9:00 AM - 5:00 PM';

-- Create a settings table for global and user-specific preferences
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  setting_key TEXT NOT NULL,
  setting_value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, setting_key)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(setting_key);

-- Insert default timezone settings
INSERT INTO settings (id, user_id, setting_key, setting_value) 
VALUES 
  ('default-timezone', NULL, 'timezone', 'America/Los_Angeles'),
  ('default-business-hours', NULL, 'business_hours', '9:00 AM - 5:00 PM'),
  ('default-date-format', NULL, 'date_format', 'MM/DD/YYYY');

-- Update existing personas with timezone info
UPDATE personas SET 
  timezone = 'America/Los_Angeles',
  business_hours = '9:00 AM - 5:00 PM'
WHERE timezone IS NULL;