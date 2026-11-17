# FoCient Production Deployment Runbook

This runbook documents production deployment, container orchestration, environment security, database lifecycle, and operational monitoring for the FoCient platform.

---

## 1. Production Architecture Overview

The production architecture is deployed via containerized services:

```
                  Internet / Client Requests
                              │
                    ┌─────────▼─────────┐
                    │ Reverse Proxy/SSL │
                    │  (Caddy / NGINX)  │
                    └────┬─────────┬────┘
                         │         │
          /api/*, /health│         │ /* (Web UI)
                         ▼         ▼
                ┌─────────────┐  ┌─────────────┐
                │ focient-api │  │ focient-web │
                │  (Node.js)  │  │  (Next.js)  │
                └──────┬──────┘  └─────────────┘
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
    ┌─────────────────┐ ┌─────────────────┐
    │  PostgreSQL 16  │ │     Redis 7     │
    │  (Relational)   │ │ (Cache & Queue) │
    └─────────────────┘ └─────────────────┘
```

---

## 2. Environment Variables & Secret Management

> [!CAUTION]
> In production environments (`NODE_ENV=production`), the FoCient API immediately halts on startup if `JWT_SECRET` is omitted or shorter than 32 characters. Never use default or development keys in production.

### Required Server Environment Variables (`apps/server`)
| Variable | Description | Security Requirements |
|---|---|---|
| `NODE_ENV` | Environment name | Must be set to `production` |
| `PORT` | API server listen port | Typically `4000` |
| `DATABASE_URL` | PostgreSQL connection string | Valid connection URI with SSL mode enabled |
| `JWT_SECRET` | Cryptographic secret for access tokens | Minimum 32 characters, high entropy |
| `REFRESH_TOKEN_SECRET` | Cryptographic secret for refresh tokens | Minimum 32 characters, distinct from `JWT_SECRET` |
| `REDIS_URL` | Redis cluster / instance connection string | `rediss://...` with TLS enabled |
| `GOOGLE_CLIENT_ID` | Google OAuth Web / Android Client ID | Matches authorized Google Cloud Console credentials |
| `EMAIL_PROVIDER` | Transactional email provider | `resend`, `sendgrid`, or `smtp` |
| `RESEND_API_KEY` | API key if `EMAIL_PROVIDER=resend` | Confidential provider API key |
| `FCM_SERVICE_ACCOUNT_KEY` | Firebase Admin credentials | JSON secret string or file path |

### Required Web Environment Variables (`apps/web`)
| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Environment name | `production` |
| `NEXT_PUBLIC_API_URL` | Public-facing API base URL | `https://api.focient.app` |
| `PORT` | Web frontend listen port | `3000` |

---

## 3. Docker Deployment Procedures

FoCient includes multi-stage optimized Dockerfiles:
- `apps/server/Dockerfile`: Multi-stage build producing lean Node.js production image with compiled TypeScript and Prisma client.
- `apps/web/Dockerfile`: Standalone Next.js multi-stage build.

### Running with Docker Compose
```bash
# 1. Pull / Build Images
docker compose build

# 2. Run Database Migrations
docker compose run --rm api npx prisma migrate deploy --schema=packages/database/schema.prisma

# 3. Launch Services in Detached Mode
docker compose up -d

# 4. Verify Running Services
docker compose ps
```

---

## 4. Database Lifecycle & Migrations

### Applying Production Migrations
Production migrations are strictly managed through Prisma Migrate Deploy:
```bash
npx prisma migrate deploy --schema=packages/database/schema.prisma
```
- Never execute `prisma migrate dev` or `prisma db push` in production.
- If a migration failure occurs, inspect `_prisma_migrations` table and rollback safely before restarting containers.

### Automated Backups
Schedule daily PostgreSQL backups using `pg_dump`:
```bash
# Automated cron backup script
BACKUP_FILE="/backups/focient_$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz"
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"
```

---

## 5. Health Checks & Telemetry Probes

Load balancers, Kubernetes, and uptime checkers must monitor two dedicated probes:

1. **Liveness Probe**: `GET /health`
   - Returns `200 OK` when HTTP process is alive and responding.
   - Response: `{"status":"ok","timestamp":"..."}`
2. **Readiness Probe**: `GET /ready`
   - Returns `200 OK` only when PostgreSQL database connection is established.
   - Returns `503 Service Unavailable` if database connection fails, preventing bad traffic routing during initialization.

---

## 6. Zero-Downtime Rolling Update Strategy

1. Build and push new Docker images tagged with release git commit hash (`:sha-<commit>`).
2. Run database migration task: `npx prisma migrate deploy`. All migrations must be backwards-compatible with N-1 running code.
3. Perform rolling restart of API containers:
   ```bash
   docker compose up -d --no-deps --scale api=2 --no-recreate api
   docker compose up -d --no-deps api
   ```
4. Perform rolling restart of Web containers.
5. Verify `/ready` returns `200` on all instances.
