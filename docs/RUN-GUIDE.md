# Local Run Guide

## Quick Start

```bash
npm install
cp .env.example .env
npm run setup
npm run dev
```

Open **http://localhost:5173**.

## First-time setup

Prerequisite: Node.js 18.18+ and npm. Run commands from the repository root.

`cp .env.example .env` creates the root environment file. The API loads it automatically with `dotenv`; no manual export is needed. Keep `TEST_TOKEN_SECRET` at least 32 characters. Set `AI_PROVIDER` and `AI_API_KEY` only when `AI_ENABLED="true"`.

`npm run setup` generates Prisma Client, creates `apps/api/prisma/dev.db` if needed, and applies pending migrations. It does not reset data.

## Run the app

Recommended development command:

```bash
npm run dev
```

Vite serves the frontend at **http://localhost:5173**. Express serves the API at **http://localhost:3000**. Browser `/api/**` requests are proxied to Express.

Individual services:

```bash
npm run dev:web
npm run dev:api
```

Production-style single origin:

```bash
npm run build
npm start
```

Open **http://localhost:3000**. Express serves `apps/web/dist`, SPA fallback routes, and `/api/**`. Use `npm start` only after `npm run build`.

## Tests and coverage

```bash
npm test
npm run test:web
npm run test:api
npm run coverage:web
npm run coverage:api
npm run typecheck
npm run lint
npm run format:check
```

## Stop the app

Press `Ctrl+C` in the terminal running `npm run dev` or `npm start`.

## Troubleshooting

- **Port 3000 already in use:** stop the conflicting process, or change `API_PORT` in `.env` and the Vite proxy target in `apps/web/vite.config.ts`.
- **Missing environment variables:** recreate `.env` from `.env.example`; ensure `DATABASE_URL`, `WEB_ORIGIN`, and a 32+ character `TEST_TOKEN_SECRET` are present.
- **Database setup fails:** run `npm run setup` from the repository root, verify `DATABASE_URL="file:./dev.db"`, and ensure `apps/api/prisma` is writable. Do not delete the database unless you intend to lose local data.
