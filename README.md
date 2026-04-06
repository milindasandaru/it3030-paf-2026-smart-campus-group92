# Smart Campus Operations Hub

Production-ready full-stack starter for managing university facilities, bookings, incidents, and notifications.

## Stack

### Frontend
- React
- TypeScript
- Vite
- React Router
- Axios
- ESLint
- Prettier
- Vitest

### Backend
- Java 21
- Spring Boot 3
- Spring Web
- Spring Data JPA
- Hibernate ORM
- Spring Security
- OAuth2 client placeholder for Google login
- Lombok
- Maven

### Data and DevOps
- PostgreSQL on Supabase
- Docker
- GitHub Actions CI

## Repository Structure

```text
smart-campus-hub/
├── backend/
│   ├── pom.xml
│   ├── checkstyle.xml
│   ├── Dockerfile
│   └── src/
│       ├── main/
│       │   ├── java/com/smartcampus/hub/
│       │   │   ├── config/
│       │   │   ├── controller/
│       │   │   ├── dto/
│       │   │   ├── entity/
│       │   │   ├── exception/
│       │   │   ├── mapper/
│       │   │   ├── repository/
│       │   │   ├── security/
│       │   │   ├── service/
│       │   │   ├── service/impl/
│       │   │   └── util/
│       │   └── resources/application.yml
│       └── test/
├── frontend/
│   ├── package.json
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── services/
│       ├── test/
│       └── utils/
├── database/
│   └── schema.sql
├── docs/
│   └── architecture.md
├── .github/workflows/
│   └── ci.yml
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

## Core Features Covered

- Resource catalog management
- Booking request API with time conflict validation
- Ticket and comment management
- Notification management
- OAuth2-ready authentication placeholder
- Dockerized frontend and backend
- CI workflow for backend and frontend quality gates

## Backend Design

Layered architecture is organized into these packages:

- `config`
- `controller`
- `service`
- `service.impl`
- `repository`
- `entity`
- `dto`
- `mapper`
- `security`
- `exception`
- `util`

### Main REST Endpoints

- `GET|POST|PUT|DELETE /api/resources`
- `GET|POST|PUT|DELETE /api/bookings`
- `GET|POST|PUT|DELETE /api/tickets`
- `GET|POST|PUT|DELETE /api/comments`
- `GET|POST|PUT|DELETE /api/notifications`
- `GET|POST|PUT|DELETE /api/auth`

### Database Configuration

The backend connects to Supabase PostgreSQL using JDBC and environment variables:

- `DATABASE_URL`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`

Example Spring configuration is already defined in `backend/src/main/resources/application.yml`.

## Frontend Design

Route-driven SPA with these primary pages:

- `LoginPage`
- `DashboardPage`
- `ResourcesPage`
- `BookingsPage`
- `CreateBookingPage`
- `TicketsPage`
- `TicketDetailsPage`
- `NotificationsPanel`
- `AdminPanel`

An Axios client is provided under `frontend/src/api/client.ts`.

## Local Setup

### 1. Configure environment variables

Copy `.env.example` values into your shell or a local env file compatible with your runtime.

### 2. Start backend

```bash
cd backend
mvn spring-boot:run
```

### 3. Start frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Run with Docker Compose

```bash
docker compose up --build
```

## Quality Commands

### Backend

```bash
cd backend
mvn test
mvn spotless:apply
```

### Frontend

```bash
cd frontend
npm run lint
npm run format
npm run test -- --run
npm run build
```

## Team Guidance

Suggested ownership split for 4 developers:

1. Authentication, security, deployment, CI.
2. Resources and booking workflows.
3. Tickets, comments, notifications.
4. Frontend shell, shared components, API integration.

## Notes

- `database/schema.sql` matches the initial JPA model.
- OAuth2 Google login is scaffolded as a placeholder and needs real credentials and success handling.
- Docker Compose assumes Supabase remains external and only runs frontend and backend.
