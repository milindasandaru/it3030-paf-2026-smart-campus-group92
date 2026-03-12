# Smart Campus

Smart Campus is a starter monorepo for a Spring Boot backend and a React frontend. The goal of this baseline is to give you a project that is easy to run locally, easy to extend, and predictable in GitHub CI.

## Stack

- Backend: Spring Boot, Java 21, Maven Wrapper
- Frontend: React 19, Vite, ESLint
- Tooling: Prettier, GitHub Actions

## Project structure

```text
.
|-- .github/
|   `-- workflows/
|-- backend/
|   |-- mvnw
|   |-- mvnw.cmd
|   |-- pom.xml
|   `-- src/
|       |-- main/
|       `-- test/
|-- frontend/
|   |-- package.json
|   |-- vite.config.js
|   `-- src/
|-- package.json
|-- .prettierrc.json
`-- README.md
```

## Prerequisites

- Java 21 or newer
- Node.js 20 or newer
- npm 10 or newer

## Getting started

```bash
npm install
npm install --prefix frontend
npm run dev
```

`npm run dev` starts both applications together:

- Frontend: http://localhost:5173
- Backend: http://localhost:8080

## Root commands

- `npm run dev` starts backend and frontend together.
- `npm run lint` runs the frontend linter.
- `npm run format` formats the repository with Prettier.
- `npm run format:check` validates formatting without changing files.
- `npm run test` runs backend tests.
- `npm run build` builds the frontend and packages the backend.
- `npm run ci` runs the same checks used in GitHub Actions.

## Backend starter endpoints

- `GET /api/health`
- `GET /api/info`

These endpoints exist so the frontend and CI have a stable backend baseline from the beginning.

## GitHub Actions

The workflow in `.github/workflows/ci.yml` does the following on each push and pull request:

- installs root and frontend dependencies
- verifies formatting
- runs ESLint
- runs backend tests
- builds frontend and backend

## Suggested next steps

Once this baseline is stable, the next layers are usually:

1. Add a database and Spring profiles.
2. Add feature modules such as users, rooms, events, and notices.
3. Add authentication after the core flows are stable.

## License

See the LICENSE file in the repository root.
