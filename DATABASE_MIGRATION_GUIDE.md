# Database Migration Guide

## Issue: Missing Columns Error

**Error Message:**
```
sqlalchemy.exc.ProgrammingError: (psycopg2.errors.UndefinedColumn) 
column hotspots.zone_name does not exist
column hotspots.zone_analysis_json does not exist
```

**Cause:** The database table `hotspots` doesn't have the new columns required for zone analysis feature.

**Solution:** Run the database migration to add the missing columns.

---

## Quick Fix (Recommended)

### Option 1: Run Python Migration Script

```bash
# Navigate to backend directory
cd backend

# Run migration
python migrate_database.py
```

**Expected Output:**
```
============================================================
  Database Migration: Add Zone Analysis Columns
============================================================

🔄 Starting database migration...
📝 Adding zone_name column...
✅ zone_name column added successfully
📝 Adding zone_analysis_json column...
✅ zone_analysis_json column added successfully
📝 Creating index on zone_name...
✅ Index created successfully

✅ Migration completed successfully!

📊 Verifying migration...

📋 Current hotspots table columns:
   - id: INTEGER
   - latitude: DOUBLE_PRECISION
   - longitude: DOUBLE_PRECISION
   - temperature: DOUBLE_PRECISION
   - vegetation_index: DOUBLE_PRECISION
   - traffic_density: INTEGER
   - land_use: VARCHAR(50)
   - city: VARCHAR(100)
   - zone_name: VARCHAR(100)
   - zone_analysis_json: JSON
   - created_at: TIMESTAMP
   - updated_at: TIMESTAMP

✅ All new columns verified successfully!
============================================================
✅ Operation completed successfully!
============================================================
```

---

### Option 2: Run SQL Migration Directly

```bash
# Connect to PostgreSQL
psql -U postgres -d sustainable_ai

# Run the migration SQL
\i backend/migrations/add_zone_analysis.sql
```

**Or using psql command:**
```bash
psql -U postgres -d sustainable_ai -f backend/migrations/add_zone_analysis.sql
```

---

### Option 3: Manual SQL Execution

**Connect to your database and run:**

```sql
-- Add zone_name column
ALTER TABLE hotspots 
ADD COLUMN IF NOT EXISTS zone_name VARCHAR(100);

-- Add zone_analysis_json column
ALTER TABLE hotspots 
ADD COLUMN IF NOT EXISTS zone_analysis_json JSON;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_hotspots_zone_name ON hotspots(zone_name);
```

---

## Verification

### Check if Migration Succeeded

**Method 1: Using Python Script**
```bash
cd backend
python -c "from migrate_database import check_column_exists; from database import engine; print('zone_name:', check_column_exists(engine, 'hotspots', 'zone_name')); print('zone_analysis_json:', check_column_exists(engine, 'hotspots', 'zone_analysis_json'))"
```

**Method 2: Using SQL**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'hotspots' 
  AND column_name IN ('zone_name', 'zone_analysis_json');
```

**Expected Result:**
```
     column_name      | data_type
----------------------+-----------
 zone_name            | character varying
 zone_analysis_json   | json
```

**Method 3: Check in Application**
```bash
# Start the backend
cd backend
uvicorn main:app --reload

# The error should be gone now
```

---

## Rollback (If Needed)

If you need to remove the new columns:

```bash
cd backend
python migrate_database.py --rollback
```

**Or manually:**
```sql
ALTER TABLE hotspots DROP COLUMN IF EXISTS zone_name;
ALTER TABLE hotspots DROP COLUMN IF EXISTS zone_analysis_json;
DROP INDEX IF EXISTS idx_hotspots_zone_name;
```

---

## Troubleshooting

### Error: "permission denied for table hotspots"

**Solution:** Grant ALTER permissions to your database user:
```sql
GRANT ALL PRIVILEGES ON TABLE hotspots TO your_username;
```

### Error: "database does not exist"

**Solution:** Create the database first:
```bash
createdb sustainable_ai
# Then run seed_data.py to create tables
python data/seed_data.py
# Then run migration
python backend/migrate_database.py
```

### Error: "relation 'hotspots' does not exist"

**Solution:** Create the tables first:
```bash
cd data
python seed_data.py
```

### Error: "psycopg2 not installed"

**Solution:** Install required dependencies:
```bash
pip install psycopg2-binary
# or
pip install -r requirements.txt
```

### Error: "cannot connect to database"

**Solution:** Check your database connection:
1. Verify PostgreSQL is running:
   ```bash
   # Windows
   sc query postgresql-x64-13
   
   # Linux/Mac
   sudo systemctl status postgresql
   ```

2. Check connection string in `backend/config.py`:
   ```python
   database_url: str = "postgresql://postgres:password@localhost:5432/sustainable_ai"
   ```

3. Test connection:
   ```bash
   psql -U postgres -d sustainable_ai -c "SELECT 1;"
   ```

---

## After Migration

### 1. Restart Backend Server

```bash
cd backend
uvicorn main:app --reload
```

### 2. Test the Application

1. Navigate to City Explorer
2. Search for a city (e.g., "Mumbai")
3. Click on any hotspot
4. You should see detailed zone analysis

### 3. Verify Data

**Check if new data includes zone analysis:**
```sql
SELECT 
    city,
    zone_name,
    zone_analysis_json->>'description' as description,
    COUNT(*) as hotspot_count
FROM hotspots
WHERE zone_name IS NOT NULL
GROUP BY city, zone_name, zone_analysis_json->>'description'
LIMIT 5;
```

---

## Migration Details

### Columns Added

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| `zone_name` | VARCHAR(100) | Name of the urban zone (e.g., "City Center") |
| `zone_analysis_json` | JSON | Complete zone analysis including heat factors and recommendations |

### Index Created

| Index Name | Column | Purpose |
|------------|--------|---------|
| `idx_hotspots_zone_name` | zone_name | Faster queries filtering by zone |

### Sample Data Structure

**zone_analysis_json format:**
```json
{
  "zone_name": "City Center",
  "description": "High-density commercial area with significant urban development",
  "temperature_status": "🔥 HIGH: Elevated temperatures pose health risks",
  "vegetation_status": "🌱 Low vegetation coverage - priority area",
  "traffic_status": "🚗 Heavy traffic contributing to heat",
  "heat_factors": [
    "Dense concrete and asphalt surfaces",
    "Limited green cover and vegetation",
    "High traffic density"
  ],
  "recommendations": [
    "Install green roofs on commercial buildings",
    "Create vertical gardens on building facades",
    "Plant street trees for shade"
  ]
}
```

---

## Docker Users

If you're using Docker, the migration needs to run inside the container:

```bash
# Option 1: Execute in running container
docker-compose exec backend python migrate_database.py

# Option 2: Run as one-off command
docker-compose run --rm backend python migrate_database.py

# Option 3: Connect to database container
docker-compose exec postgres psql -U postgres -d sustainable_ai -f /migrations/add_zone_analysis.sql
```

---

## Production Deployment

### Before Deploying

1. **Backup your database:**
   ```bash
   pg_dump -U postgres sustainable_ai > backup_before_migration.sql
   ```

2. **Test migration on staging:**
   ```bash
   # Restore backup to staging
   psql -U postgres staging_db < backup_before_migration.sql
   
   # Run migration on staging
   python migrate_database.py
   
   # Test application
   # If successful, proceed to production
   ```

3. **Run migration on production:**
   ```bash
   # During maintenance window
   python migrate_database.py
   ```

4. **Verify production:**
   ```bash
   # Check columns exist
   psql -U postgres production_db -c "\d hotspots"
   
   # Test application
   curl http://your-api.com/api/city/search/?city_name=Mumbai
   ```

---

## Alternative: Recreate Database (Development Only)

⚠️ **WARNING: This will delete all existing data!**

```bash
# Drop and recreate database
dropdb sustainable_ai
createdb sustainable_ai

# Run seed script (creates tables with new columns)
cd data
python seed_data.py
```

---

## Summary

### What the Migration Does
✅ Adds `zone_name` column to store area names
✅ Adds `zone_analysis_json` column to store detailed analysis
✅ Creates index for better query performance
✅ Preserves all existing data
✅ Safe to run multiple times (idempotent)

### What You Need to Do
1. Run migration: `python backend/migrate_database.py`
2. Restart backend server
3. Test the application
4. Verify zone analysis appears in popups

### If Something Goes Wrong
- Check error messages carefully
- Verify database connection
- Check user permissions
- Try rollback: `python backend/migrate_database.py --rollback`
- Restore from backup if needed

---

**Status**: Migration script ready to run
**Impact**: Non-destructive (adds columns only)
**Downtime**: None (can run while app is running)
**Rollback**: Supported
