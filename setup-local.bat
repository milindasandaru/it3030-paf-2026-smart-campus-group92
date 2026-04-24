@echo off
REM Smart Campus Hub - Quick Local Setup Script (Windows)

echo.
echo ==================================
echo Smart Campus Hub - Local Setup
echo ==================================
echo.

REM Check Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

echo [OK] Docker found

REM Create .env if it doesn't exist
if not exist .env (
    echo [*] Creating .env file from .env.example...
    copy .env.example .env
    echo [OK] .env created. Please review and update if needed.
) else (
    echo [OK] .env file already exists
)

echo.
echo [*] Starting PostgreSQL container...

REM Stop existing postgres container if it exists
docker stop smart-campus-postgres >nul 2>&1
docker rm smart-campus-postgres >nul 2>&1

REM Start new postgres container
docker run -d ^
  --name smart-campus-postgres ^
  -e POSTGRES_DB=smart_campus_hub ^
  -e POSTGRES_PASSWORD=postgres ^
  -p 5432:5432 ^
  postgres:15

echo [*] Waiting for PostgreSQL to be ready...
timeout /t 5 /nobreak

echo.
echo [*] Initializing database schema...

REM Note: psql needs to be in PATH. Adjust path if needed.
where psql >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] psql not found in PATH. Please ensure PostgreSQL client tools are installed.
    echo [*] Manual setup required - run these commands in psql:
    echo.
    echo psql -h localhost -U postgres -d smart_campus_hub
    echo \i database/schema.sql
    echo \i database/migration_add_passwords.sql
    echo.
) else (
    psql -h localhost -U postgres -d smart_campus_hub -f database/schema.sql
    psql -h localhost -U postgres -d smart_campus_hub -f database/migration_add_passwords.sql
    echo [OK] Database schema initialized
)

echo.
echo [OK] Setup complete!
echo.
echo Test Credentials:
echo   Admin:   admin@smartcampus.edu / admin123
echo   Staff:   staff@smartcampus.edu / staff123
echo   Student: student@smartcampus.edu / student123
echo.
echo Next steps:
echo   1. Terminal 1: cd backend ^&^& mvn spring-boot:run
echo   2. Terminal 2: cd frontend ^&^& npm install ^&^& npm run dev
echo   3. Open http://localhost:5173 in your browser
echo.
pause
