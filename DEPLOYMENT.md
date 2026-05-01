# Deployment Guide

## Prerequisites

- Docker & Docker Compose installed
- Git installed
- (For local dev) PostgreSQL 14+ running locally on port 5432

## Local Development Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd smart-campus-hub
```

### 2. Configure environment

Copy and update `.env.example`:

```bash
cp .env.example .env
# Edit .env with your local database credentials
```

### 3. Start PostgreSQL locally (if not running)

```bash
# Using Docker
docker run -d \
  --name smart-campus-postgres \
  -e POSTGRES_DB=smart_campus_hub \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15

# Or use your local PostgreSQL instance
```

### 4. Initialize database

```bash
psql -U postgres -d smart_campus_hub -f database/schema.sql
psql -U postgres -d smart_campus_hub -f database/migration_add_passwords.sql
```

### 5. Start backend

```bash
cd backend
mvn spring-boot:run
# Backend runs on http://localhost:8090
```

### 6. Start frontend (in another terminal)

```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### Test Credentials

- **Admin**: admin@smartcampus.edu / admin123
- **Staff**: staff@smartcampus.edu / staff123
- **Student**: student@smartcampus.edu / student123

---

## Docker Compose Deployment

### Build and run with Docker Compose

```bash
docker compose up --build
```

This will:

- Build the backend Docker image
- Build the frontend Docker image
- Run both services on a shared network
- Backend: http://localhost:8090
- Frontend: http://localhost:5173

### Environment Configuration

Create a `.env` file at the repository root with your production database details:

```bash
DATABASE_URL=jdbc:postgresql://your-db-host:5432/smart_campus_hub?sslmode=require
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-secure-password
FRONTEND_URL=https://your-domain.com
VITE_API_BASE_URL=https://your-domain.com/api
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Scale and monitor

```bash
# View logs
docker compose logs -f

# Scale services
docker compose up --scale backend=2

# Stop services
docker compose down
```

---

## Production Deployment

### Using Supabase (Recommended)

1. Create a PostgreSQL database on Supabase
2. Run migrations:

```bash
psql -h db.xxxx.supabase.co -U postgres -d postgres -f database/schema.sql
psql -h db.xxxx.supabase.co -U postgres -d postgres -f database/migration_add_passwords.sql
```

3. Configure `.env` with Supabase connection string
4. Deploy backend and frontend (e.g., to Render, Railway, Vercel)

### Using Kubernetes

Helm charts and K8s manifests can be generated from Docker images.

### Using Azure, AWS, or GCP

Deploy the Docker images to your preferred cloud provider's container service.

---

## Troubleshooting

### Sign-in not working

- Ensure database has the password column: `ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);`
- Verify test users exist in the database
- Check logs: `docker compose logs backend`

### Database connection failed

- Verify DATABASE_URL in `.env`
- Ensure PostgreSQL is running and accessible
- Check credentials in `.env`

### Frontend API calls failing

- Verify VITE_API_BASE_URL in `.env`
- Check CORS settings in backend security config
- Verify backend is running on port 8090

### Port already in use

- Change port in `.env` (SERVER_PORT for backend, modify docker-compose.yml for frontend)
- Or kill existing process: `lsof -ti :8090 | xargs kill -9`

---

## CI/CD Pipeline

The repository includes GitHub Actions workflows in `.github/workflows/` for automated testing and deployment.

Run tests locally:

```bash
# Backend
cd backend
mvn test

# Frontend
cd frontend
npm run test -- --run
npm run lint
```

Build production artifacts:

```bash
# Backend
cd backend
mvn clean package

# Frontend
cd frontend
npm run build
```
