# 🚨 FIX DATABASE ERROR NOW

## The Problem
Your database is missing two columns: `zone_name` and `zone_analysis_json`

## The Solution (Choose ONE method)

---

## ✅ METHOD 1: Run Python Script (Easiest)

### Step 1: Open Terminal/Command Prompt
- Press `Win + R`
- Type `cmd` and press Enter

### Step 2: Navigate to Backend Folder
```bash
cd c:\Users\Admin\Downloads\SustainableAI-compyle-sustainable-ai-urban-heatmap\SustainableAI-compyle-sustainable-ai-urban-heatmap\backend
```

### Step 3: Run Migration
```bash
python run_migration.py
```

### Step 4: You Should See
```
============================================================
  Database Migration: Add Zone Analysis Columns
============================================================

🔄 Connecting to database...
✅ Connected successfully!

📝 Adding zone_name column...
✅ zone_name column added
📝 Adding zone_analysis_json column...
✅ zone_analysis_json column added
📝 Creating index...
✅ Index created

✅ Migration completed!

📊 Verifying columns...

📋 Hotspots table columns:
   - id: integer
   - latitude: double precision
   - longitude: double precision
   - temperature: double precision
   - vegetation_index: double precision
   - traffic_density: integer
   - land_use: character varying
   - city: character varying
   - zone_name: character varying
   - zone_analysis_json: json
   - created_at: timestamp with time zone
   - updated_at: timestamp with time zone

============================================================
✅ SUCCESS! You can now restart your backend server.
============================================================
```

---

## ✅ METHOD 2: Direct SQL (Alternative)

### Step 1: Open PostgreSQL Command Line
```bash
psql -U postgres -d sustainable_ai
```

### Step 2: Run These SQL Commands
```sql
ALTER TABLE hotspots ADD COLUMN IF NOT EXISTS zone_name VARCHAR(100);
ALTER TABLE hotspots ADD COLUMN IF NOT EXISTS zone_analysis_json JSON;
CREATE INDEX IF NOT EXISTS idx_hotspots_zone_name ON hotspots(zone_name);
```

### Step 3: Verify
```sql
\d hotspots
```

You should see the new columns listed.

### Step 4: Exit
```sql
\q
```

---

## ✅ METHOD 3: Using pgAdmin (GUI)

### Step 1: Open pgAdmin

### Step 2: Connect to Database
- Navigate to: Servers → PostgreSQL → Databases → sustainable_ai

### Step 3: Open Query Tool
- Right-click on `sustainable_ai` → Query Tool

### Step 4: Paste and Execute
```sql
ALTER TABLE hotspots ADD COLUMN IF NOT EXISTS zone_name VARCHAR(100);
ALTER TABLE hotspots ADD COLUMN IF NOT EXISTS zone_analysis_json JSON;
CREATE INDEX IF NOT EXISTS idx_hotspots_zone_name ON hotspots(zone_name);
```

### Step 5: Click Execute (F5)

---

## ✅ METHOD 4: Double-Click Batch File

### Step 1: Navigate to Backend Folder
```
c:\Users\Admin\Downloads\SustainableAI-compyle-sustainable-ai-urban-heatmap\SustainableAI-compyle-sustainable-ai-urban-heatmap\backend
```

### Step 2: Double-click
```
migrate.bat
```

---

## After Migration

### 1. Restart Your Backend Server

**If running in terminal:**
- Press `Ctrl + C` to stop
- Run again:
  ```bash
  uvicorn main:app --reload
  ```

**If running in Docker:**
```bash
docker-compose restart backend
```

### 2. Test the Application

1. Open browser: `http://localhost:3000` or `http://localhost:5173`
2. Go to City Explorer
3. Search for a city (e.g., "Mumbai")
4. Click on any hotspot marker
5. You should see detailed zone analysis!

---

## Verification

### Check if Migration Worked

**Method 1: Try the app**
- If you can search cities without errors, it worked! ✅

**Method 2: Check database**
```bash
psql -U postgres -d sustainable_ai -c "\d hotspots"
```

Look for:
- `zone_name` column
- `zone_analysis_json` column

---

## Still Having Issues?

### Error: "psql: command not found"
- PostgreSQL is not in your PATH
- Use pgAdmin instead (Method 3)

### Error: "connection refused"
- PostgreSQL is not running
- Start it:
  - Windows: Services → PostgreSQL → Start
  - Or restart your computer

### Error: "password authentication failed"
- Check password in `run_migration.py` line 6
- Default is: `Rizwan25`
- Update if different

### Error: "database does not exist"
- Create database first:
  ```bash
  createdb sustainable_ai
  ```
- Then run seed script:
  ```bash
  cd data
  python seed_data.py
  ```
- Then run migration again

---

## Quick Checklist

- [ ] PostgreSQL is running
- [ ] Database `sustainable_ai` exists
- [ ] Ran migration script
- [ ] Saw success message
- [ ] Restarted backend server
- [ ] Tested in browser
- [ ] No more errors!

---

## Need Help?

1. Check `DATABASE_MIGRATION_GUIDE.md` for detailed troubleshooting
2. Check backend terminal for error messages
3. Check PostgreSQL logs
4. Verify database credentials in `backend/config.py`

---

**Once migration is complete, your app will work perfectly!** 🎉

The heat map overlay and detailed zone analysis will appear automatically.
