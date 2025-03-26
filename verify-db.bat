@echo off
echo Verifying database setup...
echo.
echo Checking database existence:
mysql -u root -p -e "SHOW DATABASES;"
echo.
echo Checking tables in beep_boop_chat:
mysql -u root -p -e "USE beep_boop_chat; SHOW TABLES;"
