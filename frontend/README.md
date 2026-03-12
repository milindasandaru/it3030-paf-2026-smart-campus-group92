# Frontend

This package contains the React application for the Smart Campus project.

## Available commands

- `npm run dev` starts the Vite development server.
- `npm run build` creates the production build in `dist`.
- `npm run lint` runs ESLint with zero warnings allowed.
- `npm run preview` serves the production build locally.

## API integration

The Vite dev server proxies `/api/*` requests to `http://localhost:8080`, so the frontend can talk to the Spring Boot backend during development without extra configuration.
