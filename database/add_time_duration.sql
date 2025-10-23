-- Migration: Add time_duration column to ceo_agents table
-- Date: 2024-12-19
-- Description: Add time_duration field for agent operation duration in minutes

-- Add time_duration column to ceo_agents table
ALTER TABLE ceo_agents ADD COLUMN time_duration INTEGER DEFAULT 10;

-- Update existing records with default time_duration
UPDATE ceo_agents SET time_duration = 10 WHERE time_duration IS NULL;

-- Migration complete
SELECT 'Time duration column added successfully!' as result;
