@echo off
echo Creating database...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS beep_boop_chat;"

echo Setting up tables...
mysql -u root -p beep_boop_chat < src/lib/setup.sql

echo Database initialization completed.
