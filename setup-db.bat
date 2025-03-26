@echo off
echo Running database setup...
mysql -u root -p < src/lib/setup.sql
echo Database setup completed.
