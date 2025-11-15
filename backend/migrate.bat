@echo off
echo ============================================================
echo   Running Database Migration
echo ============================================================
echo.

python run_migration.py

echo.
echo ============================================================
echo   Migration Complete
echo ============================================================
echo.
echo Press any key to close...
pause > nul
