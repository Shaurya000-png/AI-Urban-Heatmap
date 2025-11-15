"""Quick migration script to add zone columns"""
from sqlalchemy import create_engine, text
import sys

# Database URL - update if needed
DATABASE_URL = "postgresql://postgres:Rizwan25@localhost:5432/sustainable_ai"

print("=" * 60)
print("  Database Migration: Add Zone Analysis Columns")
print("=" * 60)
print()

try:
    print("🔄 Connecting to database...")
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        print("✅ Connected successfully!")
        print()
        
        # Add zone_name column
        print("📝 Adding zone_name column...")
        try:
            conn.execute(text("""
                ALTER TABLE hotspots 
                ADD COLUMN IF NOT EXISTS zone_name VARCHAR(100)
            """))
            conn.commit()
            print("✅ zone_name column added")
        except Exception as e:
            print(f"ℹ️  zone_name: {e}")
        
        # Add zone_analysis_json column
        print("📝 Adding zone_analysis_json column...")
        try:
            conn.execute(text("""
                ALTER TABLE hotspots 
                ADD COLUMN IF NOT EXISTS zone_analysis_json JSON
            """))
            conn.commit()
            print("✅ zone_analysis_json column added")
        except Exception as e:
            print(f"ℹ️  zone_analysis_json: {e}")
        
        # Create index
        print("📝 Creating index...")
        try:
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_hotspots_zone_name 
                ON hotspots(zone_name)
            """))
            conn.commit()
            print("✅ Index created")
        except Exception as e:
            print(f"ℹ️  Index: {e}")
        
        print()
        print("✅ Migration completed!")
        print()
        
        # Verify
        print("📊 Verifying columns...")
        result = conn.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'hotspots' 
            ORDER BY ordinal_position
        """))
        
        print("\n📋 Hotspots table columns:")
        for row in result:
            print(f"   - {row[0]}: {row[1]}")
        
        print()
        print("=" * 60)
        print("✅ SUCCESS! You can now restart your backend server.")
        print("=" * 60)
        
except Exception as e:
    print()
    print("=" * 60)
    print(f"❌ ERROR: {e}")
    print("=" * 60)
    print()
    print("🔍 Troubleshooting:")
    print("1. Check if PostgreSQL is running")
    print("2. Verify database credentials in this script")
    print("3. Ensure database 'sustainable_ai' exists")
    print()
    sys.exit(1)
