# Quick Fix: Database Column Error

## 🚨 Error
```
column hotspots.zone_name does not exist
column hotspots.zone_analysis_json does not exist
```

## ✅ Solution (Choose One)

### Option 1: Python Script (Easiest)
```bash
cd backend
python migrate_database.py
```

### Option 2: SQL Direct
```bash
psql -U postgres -d sustainable_ai
```
Then run:
```sql
ALTER TABLE hotspots ADD COLUMN zone_name VARCHAR(100);
ALTER TABLE hotspots ADD COLUMN zone_analysis_json JSON;
CREATE INDEX idx_hotspots_zone_name ON hotspots(zone_name);
```

### Option 3: Docker
```bash
docker-compose exec backend python migrate_database.py
```

## ✅ Verify
```bash
# Restart backend
cd backend
uvicorn main:app --reload

# Test in browser
# Navigate to City Explorer and search a city
```

## 📚 Full Guide
See `DATABASE_MIGRATION_GUIDE.md` for detailed instructions.

---

**That's it! Your database is now updated.** 🎉
