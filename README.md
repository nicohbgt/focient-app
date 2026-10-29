# FoCient (Focus & Efficient) — Guilt-Free Productivity Platform

> **FoCient** (Focus & Efficient) is a human-centric productivity platform engineered around the philosophy of **Guilt-Free Productivity**. Powered by a deterministic scheduling engine, FoCient adaptively manages daily capacity, prevents burnout, and completely eliminates punitive terminology (*Terlambat*, *Overdue*, *Failed*, *Telat*, *Hukuman*).

[![CI Pipeline](https://github.com/focient/focient-app/actions/workflows/ci.yml/badge.svg)](https://github.com/focient/focient-app/actions/workflows/ci.yml)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D20.18.0-brightgreen.svg)](https://nodejs.org/)
[![Flutter](https://img.shields.io/badge/Flutter-3.24-blue.svg)](https://flutter.dev/)
[![WCAG](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AAA-success.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

## 1. Feature Status: Implemented vs. Planned Roadmap

To maintain clear transparency between production-ready capabilities and future phase expansions, features are categorized below:

### A. Implemented & Production-Ready Features
*These features are fully implemented, accompanied by comprehensive automated test suites, and validated in CI.*

- **Guilt-Free Adaptive Engine**:
  - **Algoritma 1 (Workload & Capacity Engine)**: Real-time capacity scoring (`LIGHT`, `OPTIMAL`, `NEAR_CAPACITY`, `OVERLOAD`) with calm, non-accusatory Amber threshold alerts.
  - **Algoritma 2 (Silent Placement Engine)**: Automatic placement of unscheduled tasks into schedule gaps (`Celah Awal`, `Celah Antar-Tugas`, `Celah Akhir`) with a mandatory **10-minute cognitive buffer**.
  - **Algoritma 3 (Adaptive Ripple Reschedule)**: Non-punitive forward cascading of downstream commitments when tasks run over time.
  - **Algoritma 4 (Top-3 Priorities Quota & Swap Resolution)**: Hard cap of 3 active Top-3 focus tasks per day with deterministic precedence rules (Pins $\to$ Deep Focus $\to$ Duration $\to$ FIFO) and candidate swap workflows.
- **Zero-Punitive Vocabulary Guardrail**:
  - Full automated scanning across English and Indonesian copywriting preventing guilt-inducing or punitive words in UI, validation, and error messages.
- **Enterprise Security & Cryptographic Auth**:
  - Cryptographically verified Google OpenID Connect (OIDC) token validation against Google's live JWKS endpoints.
  - Persistent HMAC-SHA256 hashed OTP records with single-use guarantees, 5-minute expiry, 30-second cooldown rate limits, and 5-attempt brute-force lockouts.
  - Session lifecycle management with rotating refresh tokens and instantaneous revocation upon logout or password reset.
  - Complete elimination of hard-coded secrets; production builds enforce high-entropy 32+ character secrets.
- **Timezone & Daylight Saving Time (DST) Resilience**:
  - Dynamic local day boundary resolution (`startOfDay` and `endOfDay`) based on IANA timezone names (e.g. `Asia/Jakarta`, `America/New_York`, `Europe/London`).
  - Native support for 23-hour spring-forward and 25-hour fall-back DST transitions without task dropping or schedule skew.
- **Web Client (Next.js 14 App Router)**:
  - Modern, responsive application with WCAG 2.1 AAA contrast ratios ($\ge 7.0:1$), keyboard navigation rings, reduced motion support, and tactile microinteractions.
  - Complete end-to-end flows: Authentication, Onboarding & Capacity Setup, Today Plan Dashboard, Task Creation/Editing, Adaptive Reschedule Modals, and Weekly Insights.
- **Mobile Client (Flutter 3.x)**:
  - Reactive Riverpod architecture with session-based navigation (`AuthGate`).
  - Network repository with optimistic updates, exponential backoff retries (`withRetry`), and conflict management.
  - Native FCM push notifications and background focus notifications.
- **Universal Calendar Export**:
  - Standard RFC 5545 iCalendar (`.ics`) export endpoint (`/api/schedule/export/ics`) compatible with Google Calendar, Apple Calendar, and Microsoft Outlook.
- **Infrastructure & Quality**:
  - Multi-stage Docker containerization and Docker Compose orchestration.
  - PostgreSQL 16 relational database with Prisma migrations.
  - Redis 7 cache and job queue with transparent in-memory fallback.
  - GitHub Actions CI pipeline with Postgres/Redis services, Turborepo caching, code coverage thresholds ($\ge 75\%$ lines), and smoke tests.

### B. Planned Integrations & Phase 2 Roadmap
*These architectural components are formally documented with technical blueprints and scheduled for subsequent development phases.*

- **Bidirectional Google & Outlook Calendar OAuth Sync**:
  - Full two-way event synchronization using Google Calendar API and Microsoft Graph API (formally documented in [ADR-005](file:///docs/adr/ADR-005-calendar-integration-scope.md); current MVP uses universal RFC 5545 `.ics` export).
- **Code-Generated Offline Drift / SQLite Persistence**:
  - SQLite local caching on mobile via Drift (formally deferred to Phase 2 per [ADR-004](file:///docs/adr/ADR-004-offline-drift-persistence-deferral.md) to eliminate NDK native compilation bottlenecks; current client utilizes resilient in-memory repository caching and retry backoff).
- **Real-Time Cross-Device Synchronization**:
  - WebSocket / SSE push channels for instant real-time synchronization between concurrent Web and Mobile sessions.
- **Generative AI Reflection Co-Pilot**:
  - Asynchronous LLM agents providing personalized weekly habit reflections and empathetic planning recommendations.

---

## 2. Monorepo Architecture

FoCient is organized as a Turborepo monorepo with npm workspaces:

```
focient-app/
├── apps/
│   ├── mobile/         # Flutter cross-platform mobile client (iOS / Android)
│   ├── server/         # Express.js REST API with Guilt-Free Adaptive Engine
│   └── web/            # Next.js 14 App Router web client with WCAG AAA Calm UI
├── packages/
│   ├── contracts/      # Shared DTOs, Zod schemas, API routes & Timezone DST utilities
│   ├── database/       # Prisma schema, migrations, seeders & client
│   └── ui-tokens/      # DTCG Design Tokens, color palettes, and motion curves
├── docs/
│   ├── adr/            # Architecture Decision Records (ADRs)
│   ├── runbooks/       # Local Setup and Production Deployment Runbooks
│   └── openapi.yaml    # OpenAPI 3.1 REST API specification
└── package.json        # Workspace orchestrator (npm workspaces + Turbo)
```

---

## 3. Quick Start & Verification

### Prerequisites
- **Node.js**: `>= 20.18.0`
- **npm**: `>= 10.8.0`
- **PostgreSQL**: `>= 16.0` (or Docker)
- **Flutter SDK**: `>= 3.24.0` (for mobile development)

### Local Setup
```bash
# 1. Install all monorepo dependencies
npm install

# 2. Generate Prisma Client and apply migrations
npx prisma generate --schema=packages/database/schema.prisma
npx prisma migrate dev --schema=packages/database/schema.prisma

# 3. Start development servers (Web on :3000, API on :4000)
npm run dev
```

For full setup instructions, environment variables, and Docker database setup, see the [Local Setup Runbook](file:///docs/runbooks/local-setup.md).

### Verification & Testing Suite
```bash
# Typecheck all workspace packages
npm run typecheck

# Run full test suite across web (80 tests) and server (96 tests)
npm test

# Run code coverage check (enforces >= 75% core line coverage)
npm run test:coverage

# Run live API server smoke test
npm run smoke

# Run mobile Flutter analysis and unit tests
cd apps/mobile
flutter analyze --no-fatal-infos
flutter test
```

---

## 4. Documentation & Architecture Decision Records

- **API Specification**: [OpenAPI 3.1 YAML](file:///docs/openapi.yaml)
- **Operational Runbooks**:
  - [Local Development Setup Runbook](file:///docs/runbooks/local-setup.md)
  - [Production Deployment Runbook](file:///docs/runbooks/deployment.md)
- **Architecture Decision Records (ADRs)**:
  - [ADR-001: Monorepo Architecture and Unified Cross-Platform Tech Stack](file:///docs/adr/ADR-001-monorepo-tech-stack.md)
  - [ADR-002: Guilt-Free Adaptive Engine and Non-Punitive Reschedule Heuristics](file:///docs/adr/ADR-002-guilt-free-adaptive-engine.md)
  - [ADR-003: Cryptographic Authentication, Verified Google OIDC, Persistent Hashed OTPs, and Session Revocation](file:///docs/adr/ADR-003-auth-session-security.md)
  - [ADR-004: Explicit Deferral of Offline Drift/SQLite Code-Generated Persistence](file:///docs/adr/ADR-004-offline-drift-persistence-deferral.md)
  - [ADR-005: Calendar Integration Strategy & Two-Way Sync Phasing](file:///docs/adr/ADR-005-calendar-integration-scope.md)
  - [ADR-006: IANA Timezone Normalization and Daylight Saving Time (DST) Resilience for Daily Plans](file:///docs/adr/ADR-006-timezone-and-dst-handling.md)

---

## 5. Design Tokens & Visual Principles (100% Inter)

- **Typeface**: 100% Inter font family with strict 3-tier weights: Regular (400), Medium (500), SemiBold (600).
- **Tabular Figures**: Every numeric display, timer, and timestamp enforces `tabular-nums` to eliminate layout jitter.
- **Calm Color Palette**:
  - Deep Cobalt (`#2563EB`) — Focus & primary actions.
  - Soft Teal (`#0D9488`) — Balance, capacity meters, and adaptive shifts.
  - Warm Amber (`#D97706` / `#FFFBEB`) — Capacity alerts & reschedule guidance (replaces conventional harsh red warnings).
  - Cool Slate (`#F8FAFC`, `#FFFFFF`, `#0F172A`) — Decluttered background canvas and high-contrast typography.
