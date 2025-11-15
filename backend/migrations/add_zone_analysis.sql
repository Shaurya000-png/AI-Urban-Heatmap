-- Migration: Add zone analysis columns to hotspots table
-- Date: 2025-11-07
-- Description: Adds zone_name and zone_analysis_json columns for detailed area analysis

-- Add zone_name column
ALTER TABLE hotspots 
ADD COLUMN IF NOT EXISTS zone_name VARCHAR(100);

-- Add zone_analysis_json column
ALTER TABLE hotspots 
ADD COLUMN IF NOT EXISTS zone_analysis_json JSON;

-- Create index on zone_name for faster queries
CREATE INDEX IF NOT EXISTS idx_hotspots_zone_name ON hotspots(zone_name);

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'hotspots' 
  AND column_name IN ('zone_name', 'zone_analysis_json');
