"""
Database Migration Script
Adds zone_name and zone_analysis_json columns to hotspots table
"""

import sys
from sqlalchemy import create_engine, text, inspect
from database import engine, Base
from models.hotspot import Hotspot

def check_column_exists(engine, table_name, column_name):
    """Check if a column exists in a table"""
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns

def migrate_database():
    """Run database migration to add new columns"""
    print("🔄 Starting database migration...")
    
    try:
        # Check if columns already exist
        zone_name_exists = check_column_exists(engine, 'hotspots', 'zone_name')
        zone_analysis_exists = check_column_exists(engine, 'hotspots', 'zone_analysis_json')
        
        if zone_name_exists and zone_analysis_exists:
            print("✅ Columns already exist. No migration needed.")
            return True
        
        with engine.connect() as conn:
            # Add zone_name column if it doesn't exist
            if not zone_name_exists:
                print("📝 Adding zone_name column...")
                conn.execute(text("""
                    ALTER TABLE hotspots 
                    ADD COLUMN zone_name VARCHAR(100)
                """))
                conn.commit()
                print("✅ zone_name column added successfully")
            else:
                print("ℹ️  zone_name column already exists")
            
            # Add zone_analysis_json column if it doesn't exist
            if not zone_analysis_exists:
                print("📝 Adding zone_analysis_json column...")
                conn.execute(text("""
                    ALTER TABLE hotspots 
                    ADD COLUMN zone_analysis_json JSON
                """))
                conn.commit()
                print("✅ zone_analysis_json column added successfully")
            else:
                print("ℹ️  zone_analysis_json column already exists")
            
            # Create index on zone_name for better performance
            print("📝 Creating index on zone_name...")
            try:
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_hotspots_zone_name 
                    ON hotspots(zone_name)
                """))
                conn.commit()
                print("✅ Index created successfully")
            except Exception as idx_error:
                print(f"⚠️  Index creation skipped: {idx_error}")
        
        print("\n✅ Migration completed successfully!")
        print("\n📊 Verifying migration...")
        
        # Verify columns exist
        inspector = inspect(engine)
        columns = inspector.get_columns('hotspots')
        column_names = [col['name'] for col in columns]
        
        print(f"\n📋 Current hotspots table columns:")
        for col in columns:
            print(f"   - {col['name']}: {col['type']}")
        
        if 'zone_name' in column_names and 'zone_analysis_json' in column_names:
            print("\n✅ All new columns verified successfully!")
            return True
        else:
            print("\n❌ Migration verification failed!")
            return False
            
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        print("\n🔍 Troubleshooting tips:")
        print("1. Check database connection in config.py")
        print("2. Ensure PostgreSQL is running")
        print("3. Verify database user has ALTER TABLE permissions")
        print("4. Check if database URL is correct")
        return False

def rollback_migration():
    """Rollback migration (remove added columns)"""
    print("🔄 Rolling back migration...")
    
    try:
        with engine.connect() as conn:
            # Drop columns
            print("📝 Removing zone_name column...")
            conn.execute(text("""
                ALTER TABLE hotspots 
                DROP COLUMN IF EXISTS zone_name
            """))
            
            print("📝 Removing zone_analysis_json column...")
            conn.execute(text("""
                ALTER TABLE hotspots 
                DROP COLUMN IF EXISTS zone_analysis_json
            """))
            
            # Drop index
            print("📝 Removing index...")
            conn.execute(text("""
                DROP INDEX IF EXISTS idx_hotspots_zone_name
            """))
            
            conn.commit()
            print("✅ Rollback completed successfully!")
            return True
            
    except Exception as e:
        print(f"❌ Rollback failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("  Database Migration: Add Zone Analysis Columns")
    print("=" * 60)
    print()
    
    # Check command line arguments
    if len(sys.argv) > 1 and sys.argv[1] == "--rollback":
        success = rollback_migration()
    else:
        success = migrate_database()
    
    print()
    print("=" * 60)
    
    if success:
        print("✅ Operation completed successfully!")
        sys.exit(0)
    else:
        print("❌ Operation failed!")
        sys.exit(1)
