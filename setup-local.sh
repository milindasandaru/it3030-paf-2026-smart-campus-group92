#!/bin/bash
# Smart Campus Hub - Quick Local Setup Script

echo "🚀 Smart Campus Hub - Local Setup"
echo "=================================="
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Docker found"

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env created. Please review and update if needed."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📦 Starting PostgreSQL container..."

# Stop existing postgres container if it exists
docker stop smart-campus-postgres 2>/dev/null
docker rm smart-campus-postgres 2>/dev/null

# Start new postgres container
docker run -d \
  --name smart-campus-postgres \
  -e POSTGRES_DB=smart_campus_hub \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

echo ""
echo "🗄️  Initializing database schema..."

# Check if psql is available
if command -v psql &> /dev/null; then
    psql -h localhost -U postgres -d smart_campus_hub -f database/schema.sql 2>/dev/null
    psql -h localhost -U postgres -d smart_campus_hub -f database/migration_add_passwords.sql 2>/dev/null
    echo "✅ Database schema initialized"
else
    echo "⚠️  psql not found. Running schema with docker exec..."
    docker exec -it smart-campus-postgres psql -U postgres -d smart_campus_hub -f /dev/stdin < database/schema.sql 2>/dev/null
    docker exec -it smart-campus-postgres psql -U postgres -d smart_campus_hub -f /dev/stdin < database/migration_add_passwords.sql 2>/dev/null
    echo "✅ Database schema initialized"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📋 Test Credentials:"
echo "   Admin:   admin@smartcampus.edu / admin123"
echo "   Staff:   staff@smartcampus.edu / staff123"
echo "   Student: student@smartcampus.edu / student123"
echo ""
echo "🎯 Next steps:"
echo "   1. Terminal 1: cd backend && mvn spring-boot:run"
echo "   2. Terminal 2: cd frontend && npm install && npm run dev"
echo "   3. Open http://localhost:5173 in your browser"
echo ""
