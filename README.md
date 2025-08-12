# SpamDetector

A small NestJS service that accepts social posts, enqueues them for moderation, and stores the verdict. It’s designed to be easy to run (Docker) and straightforward to read.

## Features
- **POST /api/v1/posts** — submit content for moderation
- **Async moderation** via BullMQ + Redis (queue: `moderation`, action: `moderate`)
- **Prisma + PostgreSQL** — typed data access and migrations
- **DTO validation** & versioned routing (`/api` + `v1`)
- Clean, typed response envelopes

## Stack
- **Runtime:** Node.js 24, NestJS
- **DB:** PostgreSQL + Prisma Client
- **Queue:** BullMQ (Redis)
- **Language:** TypeScript

## Data Model (Prisma)
```prisma
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

enum PostStatus { SAFE PENDING FLAGGED }

model Post {
  @@map("posts")

  id        String     @id @default(uuid())
  content   String
  status    PostStatus @default(PENDING)
  verdict   Json?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}
```

## API
### Create a post
`POST /api/v1/posts`

**Body**
```json
{ "content": "text to moderate" }
```

**Response (200)**
```json
{
  "success": true,
  "data": { "...Post fields..." },
  "message": "Post created successfully."
}
```

This immediately creates a `Post` with `status=PENDING` and enqueues a job to the `moderation` queue with `jobId = post.id`. A worker consumes the job and updates the `status` to `SAFE` or `FLAGGED` and may attach a JSON `verdict`.

> Base path: all routes are prefixed with `/api` and use URI versioning (e.g., `/api/v1/...`).

## Architecture & Flow
1. **Controller** (`PostsController`) accepts the request and validates the DTO.
2. **Service** (`PostsService`) persists the `Post` via Prisma and enqueues a `moderate` job.
3. **Queue** (`BullModule`, queue name `moderation`) stores the job in Redis with retries/backoff.
4. **Processor** (`ModerationProcessor`) runs with concurrency = 4 and calls `ModerationService`.
5. **ModerationService** determines the verdict and writes back to the DB.
6. **DTO Response** returns a consistent envelope to clients.

### Concurrency & Retry
- Concurrency: **4** (see `src/common/constants.ts`).
- Jobs use **exponential backoff** and **auto-cleanup** for completed/failed items.

## Configuration
Environment variables (read via Nest Config):
- `PORT` — default `3000`
- `NODE_ENV` — `development` | `production`
- `DATABASE_URL` — `postgresql://user:pass@host:5432/dbname`
- `REDIS_URL` — `redis://host:port`
- `OLLAMA_API_URL` — `http://ollama:11434`

## Running
### With Docker (recommended)
1. Create a `.env` (see **README.boot.md**).
2. Start services:
   ```bash
   docker compose up -d --build
   ```
3. Test the endpoint:
   ```bash
   curl -s -X POST http://localhost:3000/api/v1/posts      -H 'Content-Type: application/json'      -d '{ "content": "hello world" }'
   ```

### Local dev without Docker
```bash
npm i
npm prepare              # husky
npm run start:dev        # ts-node-dev
```

> For non-interactive environments (CI/CD), prefer `prisma migrate deploy` to apply already-created migrations.

## Design Choices (why it looks this way)
- **Async pipeline** decouples write path from moderation work → low latency for clients.
- **BullMQ** gives retries, backoff, and persistence; processor concurrency is tunable.
- **Prisma** provides type-safety and migration history kept in-git.
- **Versioned API** allows future evolution without breaking existing clients.
- **Consistent envelopes** (`success`, `data`, `message`) simplify client handling.

## Performance & Reliability
- **Concurrency=4** on processing to utilise CPU while avoiding thundering herds.
- **Exponential backoff & cleanup** reduces log noise and reprocessing storms.
- **Slim base images** (Debian slim) avoid Prisma binary pitfalls and keep image size reasonable.
- **Validation pipe** and typed DTOs fail fast on bad input.

## Security Notes
- Keep secrets out of git; prefer `.env` or your secret store.
- Consider adding CORS policies, rate limiting, and auth if exposing publicly.
- Regularly rotate database and Redis credentials.

## Project Layout (high-level)
```
src/
  main.ts                # bootstrap, global prefix /api, URI versioning
  posts/                 # controller + service for post creation
  moderation/            # processor + service for moderation pipeline
  common/                # constants, DTOs
prisma/
  schema.prisma          # data model (Post)
```

## Roadmap / Ideas
- GET endpoints to fetch post status by ID
- Swagger/OpenAPI docs at `/docs`
- Health and readiness endpoints for orchestrators
- Pluggable moderation strategies (LLM providers, rules engines)

---

See **README.boot.md** for the shortest path to run it. Contributions and PRs welcome.
