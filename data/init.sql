-- Database initialization script for PostgreSQL
-- This script is executed when the PostgreSQL container starts

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Create indexes for better performance
-- These will be created after the tables are created by SQLAlchemy

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'SustainAble AI Database initialized successfully';
END $$;