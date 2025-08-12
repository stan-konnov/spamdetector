# SpamDetector — Boot & Run (Quickstart)

Minimal steps to boot this NestJS + Prisma + BullMQ service with Docker.

## Prereqs
- Docker (and Docker Compose v2)
- Optional: `curl` for testing

## 1) Create `.env`
These defaults match the provided `docker-compose.yml` services:

```env
# App
PORT=3000
NODE_ENV=development

# Database (service name is 'postgres')
DATABASE_URL=postgresql://spamdetector:spamdetector@postgres:5432/spamdetector

# Redis (service name is 'redis')
REDIS_URL=redis://redis:6379

# LLM/Moderator (service name is 'ollama')
OLLAMA_API_URL=http://ollama:11434
```

## 2) Start the stack
```bash
docker compose up -d --build
# services: redis, postgres, (optional) ollama, api
```

Follow logs:
```bash
docker compose logs -f api
```

## 3) Test the API
The API uses a global prefix `/api` and URI versioning. Create a post:

```bash
curl -s -X POST http://localhost:3000/api/v1/posts   -H 'Content-Type: application/json'   -d '{ "content": "hello from docker" }'
```

Expected shape:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "hello from docker",
    "status": "PENDING",
    "verdict": null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "message": "Post created successfully."
}
```

The post is queued to the `moderation` BullMQ queue for asynchronous processing.

## 4) Stop & clean up
```bash
docker compose down -v
```

## Ports
- API: `3000` (http://localhost:3000/api)
- Redis: `6379`
- Postgres: `5432`
- Ollama: `11434`
