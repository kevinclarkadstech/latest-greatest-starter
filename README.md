# App Starter Template

Shared features

[ ] Better Auth

[ ] Logging (Cabin.js, Better Stack, Sentry, Datadog with Pino)

[ ] PNPM and Turborepo monorepo

[ ] Vitest

[ ] Feature flags (probably custom but look into Unleash or GrowthBook or Split.io or LaunchDarkly)

UI Features

[ ] Forms (Mantine or React Hook Form)

[ ] Realtime/web sockets

[ ] Tailwind CSS?

[ ] Tanstack Query with tRPC

[ ] Mantine, ShadCN, or Ionic Framework for UI components (honorable mentions to Radix UI and NextUI)

[ ] Hybrid app, or Expo and RN for native and Next.js for web

API Features

[ ] Rate limiting

[ ] CORS

[ ] tRPC

[ ] Zod

[ ] Redis cache

[ ] Postgres database with pgvector

[ ] Better Auth package

[ ] Realtime/web sockets

[ ] Inggest or Open Workflow for background jobs

[ ] Docker for infrastructure such as db, cache, etc.

[ ] Queue? BullMQ or RabbitMQ or Redis Queue p-queue?

[ ] Hono or NitroJS for server framework

[ ] Meilisearch for search

## Local infrastructure (Docker Compose)

The repository includes [docker-compose.yml](docker-compose.yml) with:

- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`
- Meilisearch on `localhost:7700`

### Start services

```bash
docker compose up -d
```

### Stop services

```bash
docker compose down
```

To also remove volumes (reset all data):

```bash
docker compose down -v
```

### Default credentials and settings

- Postgres user: `postgres`
- Postgres password: `postgres`
- Postgres database: `app`
- Redis password: `redis`
- Meilisearch master key: `masterKey`

Redis URL format with auth:

```txt
redis://:REDIS_PASSWORD@localhost:6379
```

### Override defaults

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

CMD:

```cmd
copy .env.example .env
```

Then edit `.env` to override defaults such as Postgres credentials, Redis password/port, and Meilisearch key.

Compose automatically reads `.env` from the repo root when you run:

```bash
docker compose up -d
```

### App environment variables (example)

Use this in your app-level env file (for example `.env.local`) to connect to local containers:

```dotenv
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app
REDIS_URL=redis://:redis@localhost:6379
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=masterKey
```

If you change container credentials or ports in root `.env`, keep these app values in sync.
