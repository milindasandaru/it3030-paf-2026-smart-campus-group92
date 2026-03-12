# Smart Campus Operations Hub Architecture

## Overview

The solution is split into two deployable applications:

- `frontend`: React + TypeScript + Vite single-page application.
- `backend`: Spring Boot 3 REST API with JPA, Security, and OAuth2 client support.

Supabase hosts the PostgreSQL database externally. Docker Compose runs only the frontend and backend services.

## Backend Layers

- `controller`: HTTP resource layer.
- `service`: business contracts.
- `service.impl`: business implementations.
- `repository`: persistence contracts.
- `entity`: JPA aggregates.
- `dto`: request and response contracts.
- `mapper`: entity-to-dto conversion.
- `security`: Spring Security and OAuth2 placeholder setup.
- `exception`: API error handling.
- `config`: cross-cutting configuration.
- `util`: enums and shared helpers.

## Frontend Structure

- `src/api`: Axios client and endpoint wrappers.
- `src/components`: reusable UI blocks.
- `src/pages`: route-level views.
- `src/layouts`: shell layouts.
- `src/hooks`: custom hooks.
- `src/services`: higher-level client-side orchestration.
- `src/context`: React context providers.
- `src/utils`: shared helpers.

## Team Split Suggestion

- Developer 1: Authentication, security, user management, CI.
- Developer 2: Resources and bookings.
- Developer 3: Tickets, comments, notifications.
- Developer 4: Frontend shell, shared components, integration.

## Deployment Notes

- Frontend container serves a static production build via Nginx.
- Backend container runs the packaged Spring Boot jar.
- Secrets are injected through environment variables in GitHub Actions or deployment infrastructure.
