# FoCient Development & Monorepo Architecture

> **FoCient** — An intelligent daily focus management & guilt-free adaptive planning ecosystem built upon two core pillars: **Focus** (single-task cognitive clarity) and **Efficiency** (frictionless, guilt-free adaptive rescheduling).

---

## 🏛️ Monorepo Domain Map

The repository is organized directly around the **14 core FoCient Development Domains**:

```
FoCient Development
│
├── 1. Frontend / Client
│   ├── apps/web                        # React 18 + TypeScript web client
│   ├── apps/mobile                     # Flutter 3.x mobile client (Android / iOS)
│   └── packages/ui-token               # Shared DTCG design tokens (Web CSS & Flutter Dart)
│
├── 2. Backend / Server
│   └── apps/server                     # Node.js + Express REST API application
│
├── 3. Database
│   └── packages/database               # Prisma ORM, PostgreSQL schema, migrations, seeds
│
├── 4. API & Integration
│   └── packages/contracts              # Shared DTOs, API routes, external calendar interfaces
│
├── 5. Authentication & Authorization
│   ├── apps/server/src/modules/auth    # JWT issuance, verification, bcrypt password hashing
│   └── apps/server/src/modules/auth/auth.middleware.ts # Bearer token auth guard
│
├── 6. Business Logic (Engines)
│   ├── apps/server/src/engine/task-placement-engine # Intelligent non-fragmenting slot placement
│   ├── apps/server/src/engine/reschedule-engine.ts  # Ripple reschedule downstream auto-shift
│   ├── apps/server/src/engine/workload-engine.ts    # Daily capacity & guilt-free overload thresholds
│   └── apps/server/src/engine/top-3-priority.ts     # Single-task focus isolation algorithm
│
├── 7. State Management
│   ├── apps/web/src/hooks/useTaskStore.ts           # Web task backlog & focus store
│   ├── apps/web/src/hooks/useCapacityStore.ts       # Workload allocation & alert trigger state
│   ├── apps/web/src/hooks/useThemeStore.ts          # Light / Dark mode persistence
│   └── apps/mobile/lib/data/task_state.dart         # Flutter reactive task & capacity notifier
│
├── 8. Validation & Error Handling
│   ├── packages/contracts/src/schemas.ts            # Zod runtime payload validation
│   ├── apps/server/src/common/errors.ts             # AppError & HTTP domain exception hierarchy
│   ├── apps/server/src/middleware/validate.middleware.ts # Zod request validation middleware
│   └── apps/server/src/middleware/error.middleware.ts    # Global centralized error handler
│
├── 9. Notification / Reminder
│   └── apps/server/src/modules/notification        # Gentle focus reminders & non-punitive alerts
│
├── 10. Analytics & Data Processing
│   └── apps/server/src/modules/insight             # Weekly reflection, focus minutes, pacing balance
│
├── 11. Testing
│   ├── packages/ui-token/test/token-contract.test.mjs # Design token & WCAG AAA contract tests
│   └── .github/workflows/ci.yml                    # Automated CI test & typecheck pipeline
│
├── 12. Security
│   ├── apps/server/src/middleware/security.middleware.ts # Helmet headers, strict CORS, Rate limiting
│   └── packages/contracts/src/schemas.ts           # Input sanitization against injection
│
├── 13. Deployment & Infrastructure
│   ├── docker-compose.yml                          # Multi-service composition (Postgres, Server, Web)
│   ├── apps/server/Dockerfile                      # Multi-stage container for Node backend
│   ├── apps/web/Dockerfile                         # Multi-stage container with Nginx runtime
│   └── .env.example                                # Master environment variable template
│
└── 14. Monitoring & Maintenance
    ├── apps/server/src/common/logger.ts            # Structured JSON logger with request context
    └── apps/server/src/modules/health/health.controller.ts # Liveness (/health) & Readiness (/ready)
```

---

## 📦 Detailed Domain Specifications

### 1. Frontend / Client
- **Web App (`apps/web`)**:
  - React 18, TypeScript, and modern bundler configuration.
  - Primitive components: `<Button/>`, `<InputField/>`, `<Checkbox/>`, `<Badge/>`.
  - Organism components: `<TaskCard/>`, `<DailyCapacityMeter/>`, `<RescheduleAlert/>`.
- **Mobile App (`apps/mobile`)**:
  - Flutter application with native Material 3 widgets implementing identical visual and motion specs.
- **Design Tokens (`packages/ui-token`)**:
  - W3C DTCG canonical tokens generating `:root` and `:root[data-theme="dark"]` CSS, and Flutter `Color`, `BoxShadow`, `Duration`, and `Cubic` easing curves.

### 2. Backend / Server
- **Server App (`apps/server`)**:
  - Express.js API server modularized into `auth`, `task`, `schedule`, `notification`, and `insight` routes.
  - Graceful shutdown handling (`SIGTERM`, `SIGINT`) with database disconnection.

### 3. Database
- **Database (`packages/database`)**:
  - PostgreSQL schema with Prisma ORM: `User`, `Task`, `ScheduleBlock`, `WorkloadDaily`, `RescheduleLog`, `Notification`.
  - Realistic seed script (`seeds/seed.ts`) providing initial Top-3 tasks and demo user.

### 4. API & Integration
- **Contracts (`packages/contracts`)**:
  - Single source of truth for DTOs and API route constants (`API_ROUTES`).
  - Google Calendar / Apple Calendar integration models for bi-directional synchronization.

### 5. Authentication & Authorization
- **Auth Module (`apps/server/src/modules/auth`)**:
  - Salted `bcryptjs` password hashing.
  - Signed JWT bearer authentication with automatic request context injection (`req.user.id`).

### 6. Business Logic
- **Placement Engine**: Scans open work-hour slots without fragmenting rest buffers.
- **Ripple Reschedule Engine**: Shifts downstream tasks along the Y-axis when predecessor tasks extend.
- **Workload Engine**: Classifies daily workload (`LIGHT` <50%, `OPTIMAL` 50–75%, `NEAR_CAPACITY` 76–90%, `OVERLOAD` >90%).
- **Top-3 Priority Engine**: Algorithmic isolation and ranking of high-leverage focus items.

### 7. State Management
- **Web Store Hooks (`apps/web/src/hooks`)**:
  - `useTaskStore`: Backlog and focus state.
  - `useCapacityStore`: Daily workload and trigger thresholds.
  - `useThemeStore`: Persistent Dark/Light mode theme switching.
- **Mobile State (`apps/mobile/lib/data/task_state.dart`)**:
  - Reactive `ChangeNotifier` task store with capacity calculations.

### 8. Validation & Error Handling
- **Zod Schemas**: Strict schema validation on all request boundaries.
- **Error Hierarchy**: `AppError`, `ValidationError`, `NotFoundError`, `ConflictError`, `UnauthorizedError`.
- Centralized error-handling middleware logging structured error payloads.

### 9. Notification / Reminder
- Empathetic notifications avoiding punitive language (strictly forbidding *"Terlambat"* or *"Gagal"*).
- Timed focus session reminders and gentle capacity rebalancing suggestions.

### 10. Analytics & Data Processing
- **Insight Module**: Weekly reflection metrics aggregating focus minutes, task completion velocity, and a **Guilt-Free Balance Score** (0–100).

### 11. Testing
- Automated token contract test suite checking staleness, values, and WCAG AAA ($\ge 7:1$) contrast across platforms.
- Automated CI pipeline via GitHub Actions.

### 12. Security
- Helmet security headers, CORS origin whitelisting, IP-based API rate limiting (`express-rate-limit`), and parameter sanitization.

### 13. Deployment & Infrastructure
- Docker Compose configuration orchestrating PostgreSQL, Backend, and Frontend.
- Multi-stage Dockerfiles optimized for lightweight production artifacts.

### 14. Monitoring & Maintenance
- `/health` liveness probe and `/ready` readiness probe executing live database health checks.
- Structured JSON logging with timestamp and error context.

---

## 🚀 Getting Started

### Prerequisites
- Node.js $\ge 20$
- PostgreSQL $\ge 15$ (or Docker)
- Flutter SDK $\ge 3.10$ (for mobile)

### Quick Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Configure environment:**
   ```sh
   cp .env.example .env
   ```

3. **Verify design tokens & tests:**
   ```sh
   npm run generate:tokens
   npm run test:tokens
   ```

4. **Run typechecks:**
   ```sh
   npm run typecheck:contracts
   npm run typecheck:web
   ```

5. **Start multi-container development environment:**
   ```sh
   docker-compose up -d
   ```
