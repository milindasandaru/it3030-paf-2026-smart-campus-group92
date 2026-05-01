# Smart Campus Operations Hub

Smart Campus Operations Hub is a full-stack campus operations platform for managing shared resources, facility bookings, maintenance tickets, notifications, and role-based dashboards for different university staff and students.

The repository contains:

- A React + TypeScript frontend for students, lecturers, technicians, and administrators
- A Spring Boot backend with REST APIs, validation, seed data, and PostgreSQL persistence
- Docker and helper scripts for local development

## What The App Covers

The current implementation supports:

- Resource browsing and admin resource management
- Booking creation, approval, rejection, cancellation, and check-in workflows
- Ticket reporting and technician/admin handling flows
- Ticket comments and notifications
- Role-aware dashboards for `ADMIN`, `TECHNICIAN`, `LECTURER`, and `STUDENT`
- Email/password login plus Google OAuth scaffolding
- Analytics and reporting endpoints used by dashboard views

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- Axios
- Recharts
- ESLint
- Prettier
- Vitest

### Backend

- Java 21
- Spring Boot 3.3
- Spring Web
- Spring Validation
- Spring Data JPA
- Spring Security
- Spring OAuth2 Client
- PostgreSQL
- Lombok
- Maven
- Spotless
- Checkstyle

### Tooling

- Docker Compose
- PowerShell helper scripts

## Repository Structure

```text
.
|-- backend/
|   |-- pom.xml
|   |-- checkstyle.xml
|   |-- Dockerfile
|   `-- src/
|       |-- main/
|       |   |-- java/com/smartcampus/hub/
|       |   |   |-- config/
|       |   |   |-- controller/
|       |   |   |-- dto/
|       |   |   |-- entity/
|       |   |   |-- exception/
|       |   |   |-- mapper/
|       |   |   |-- repository/
|       |   |   |-- security/
|       |   |   |-- service/
|       |   |   |-- service/impl/
|       |   |   `-- util/
|       |   `-- resources/application.yml
|       `-- test/
|-- database/
|   `-- schema.sql
|-- frontend/
|   |-- package.json
|   |-- Dockerfile
|   |-- nginx.conf
|   `-- src/
|       |-- api/
|       |-- components/
|       |-- context/
|       |-- hooks/
|       |-- layouts/
|       |-- pages/
|       |-- services/
|       |-- test/
|       `-- utils/
|-- scripts/
|   |-- format-all.ps1
|   |-- format-backend.ps1
|   `-- format-frontend.ps1
|-- .env.example
|-- docker-compose.yml
`-- README.md
```

## Frontend Pages And Flows

The frontend currently includes these main routes:

- `/` landing page
- `/login`
- `/dashboard` role-based redirect
- `/resources`
- `/resources/:resourceId`
- `/bookings`
- `/bookings/new`
- `/tickets`
- `/tickets/new`
- `/tickets/:ticketId`
- `/notifications`
- `/admin-dashboard`
- `/technician-dashboard`
- `/lecturer-dashboard`
- `/student-dashboard`
- `/admin`
- `/admin/resources`
- `/admin/resources/new`
- `/admin/resources/:resourceId/edit`

Access to these routes is enforced in the frontend with `ProtectedRoute` and role checks.

## Backend Modules

The backend follows a layered Spring structure with:

- `controller` for HTTP endpoints
- `service` and `service.impl` for business logic
- `repository` for persistence
- `entity` for JPA models
- `dto` and `mapper` for request/response shaping
- `security` for auth and OAuth configuration
- `exception` for API error handling

Main API groups:

- `/api/auth`
- `/api/resources`
- `/api/bookings`
- `/api/tickets`
- `/api/comments`
- `/api/notifications`
- `/api/analytics`
- `/api/reports`

Notable workflow endpoints include:

- `POST /api/auth/login`
- `PUT /api/bookings/{id}/approve`
- `PUT /api/bookings/{id}/reject`
- `PUT /api/bookings/{id}/cancel`
- `POST /api/bookings/{id}/check-in`
- `PUT /api/tickets/{id}/assign`
- `PUT /api/tickets/{id}/start`
- `PUT /api/tickets/{id}/resolve`
- `PUT /api/tickets/{id}/close`
- `PUT /api/tickets/{id}/reject`
- `PUT /api/tickets/{id}/reopen`
- `GET /api/comments/ticket/{ticketId}`
- `PUT /api/notifications/{id}/read`

## Seed Data And Demo Login

On startup, the backend seeds a few users and sample resources/bookings through `backend/src/main/java/com/smartcampus/hub/config/DataLoader.java`.

You can use these accounts for local testing:

- `admin@smartcampus.edu` / `Admin@123`
- `lecturer@smartcampus.edu` / `Lecturer@123`
- `student@smartcampus.edu` / `Student@123`

The login form also accepts identifiers like `admin` in addition to the full email.

## Environment Variables

Copy `.env.example` and set the values for your environment.

### Root `.env`

```env
DATABASE_URL=jdbc:postgresql://db.<supabase-project>.supabase.co:5432/postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-password
GOOGLE_CLIENT_ID=placeholder-client-id
GOOGLE_CLIENT_SECRET=placeholder-client-secret
FRONTEND_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:8080/api
SERVER_PORT=8080
```

### Important Port Note

The frontend and Docker setup expect the backend API at `http://localhost:8080/api`.

The backend `application.yml` currently defaults `SERVER_PORT` to `8090`, so for local development and Docker Compose you should set:

```env
SERVER_PORT=8080
```

If you prefer keeping the backend on `8090`, then also update `VITE_API_BASE_URL` to `http://localhost:8090/api`.

## Local Development

### 1. Install prerequisites

- Node.js 18+
- npm
- Java 21
- Maven
- PostgreSQL or a hosted PostgreSQL database such as Supabase

### 2. Configure environment variables

Create a root `.env` file based on `.env.example` and add `SERVER_PORT=8080` unless you intentionally want another backend port.

### 3. Start the backend

```powershell
cd backend
mvn spring-boot:run
```

The API will be available at `http://localhost:8080` if `SERVER_PORT=8080`.

### 4. Start the frontend

```powershell
cd frontend
npm install
npm run dev
```

The Vite app runs at `http://localhost:5173`.

## Docker Compose

You can run the frontend and backend with Docker:

```powershell
docker compose up --build
```

Before running this, make sure your `.env` includes working database credentials and that `SERVER_PORT=8080` is set so the backend matches the `docker-compose.yml` port mapping.

## Quality Commands

### Frontend

```powershell
cd frontend
npm run lint
npm run format
npm run test -- --run
npm run build
```

### Backend

```powershell
cd backend
mvn test
mvn spotless:apply
mvn checkstyle:check
```

### Repository helper scripts

```powershell
./scripts/format-frontend.ps1
./scripts/format-backend.ps1
./scripts/format-all.ps1
```

## Development Notes

- The backend imports environment values from both `backend/.env` and the repository root `.env` when present.
- CORS is configured from `FRONTEND_URL`.
- Google OAuth is scaffolded, but production credentials and final success/failure flow handling still need to be finalized.
- Security configuration currently permits all requests at the backend level, while the frontend enforces role-based route access.
- `database/schema.sql` provides the database baseline alongside the JPA model.

## Suggested Team Split

If this project is being developed by a team, a practical split is:

1. Authentication, security, environment setup, CI/CD
2. Resource and booking workflows
3. Ticketing, comments, notifications, analytics
4. Frontend dashboards, layout, and API integration
