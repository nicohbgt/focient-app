# FoCient Monorepo — Implementation Status Audit

**Audit date:** 28 October 2026
**Scope:** Repository source, package configuration, automated checks, and delivery configuration available in this checkout.
**Method:** Source-code inspection plus local test/type-check/build commands. This is a code-status assessment, not a product or security certification.

## 1. Executive summary

FoCient has a **substantial backend domain prototype**: authentication, task/category persistence, workload calculation, Top 3 selection, automatic placement, adaptive rescheduling, daily-plan aggregation, notifications, and insight calculations are implemented as TypeScript source. The deterministic engines are particularly well covered by unit tests.

The mobile client has progressed from a placeholder to a **screen-level prototype**: authentication, multi-step onboarding, dashboard, Today Plan, task list, add-task, and task-detail screens now exist. However, the repository is **not yet an end-to-end runnable, deployable MVP**. The web client remains a placeholder, the current server type-check fails, the root/web build paths remain blocked, and production integrations are incomplete or simulated.

### Changes since the 26 October audit

- Eight commits added a Flutter platform shell and mobile UI flow, local Riverpod state, REST client/repository, OTP-related auth endpoints, planning endpoints, task metadata, and extra contract/schema fields.
- Database schema now declares the mobile-related fields (`username`, work-rhythm preferences, task energy/focus/rest metadata, and activity reflection fields), closing much of the earlier *schema-definition* drift.
- This is not yet a completed database migration: `packages/database/migrations/` has no committed migration files, and the generated Prisma client currently does not contain the new fields.
- Test counts increased: tokens **11 → 16**, server **34 → 40**, web **27 → 72**.

### Objective readiness snapshot

| Area | Status | Evidence-based assessment |
| --- | --- | --- |
| Monorepo organisation | Implemented | Unified on npm workspaces (`packageManager: npm@11.6.0`), redundant `pnpm-workspace.yaml` removed, naming standardized on `@focient/ui-tokens`, and nested locks removed. |
| Shared contracts and validation | Mostly implemented | DTO/schema coverage expanded for mobile onboarding and task metadata; compatibility and transport tests remain limited. |
| Database model | Partial | Prisma schema synchronized with generated client via `postinstall` hook; versioned migration files still pending. |
| Backend business logic | Mostly implemented, type-safe | Core engines/controllers and 40 server tests pass; server type-check passes (0 errors). |
| Web product | Not implemented | The only route is a placeholder; component library and API hooks are unused by an application page. |
| Mobile product | Partially implemented | A navigable UI prototype and repository exist, but the shipped entry point opens a developer screen inspector and most screens use in-memory/optimistic state. |
| Design system | Mostly implemented | Cross-platform tokens, generated artifacts, and 16 token tests pass. |
| CI/CD and containers | In progress / Unblocked | Root Turbo build (`npm run build`), typechecks (`npm run typecheck`), and tests pass; Dockerfiles updated to `@focient/ui-tokens` and proper runtime execution. |
| Production integrations | Not implemented / simulated | Cache, queue, FCM, AI, and Google login contain stubs or non-production behaviour. |

## 2. Repository map and responsibilities

```text
focient-app/
├── apps/
│   ├── server/       Express REST API and deterministic scheduling engines
│   ├── web/          Next.js 14 client, component library, API/query hooks
│   └── mobile/       Flutter client, presentation widgets, local-data scaffolding
├── packages/
│   ├── contracts/    Shared DTOs, Zod validation, API route constants
│   ├── database/     Prisma schema, client singleton, development seed
│   └── ui-tokens/    Design-token sources and generated web/Flutter outputs
├── docker-compose.yml
├── turbo.json
└── .github/workflows/ci.yml
```

### Runtime shape intended by the source

```text
Web client ─┐
            ├── HTTP + Bearer JWT ──> Express API ──> Prisma ──> PostgreSQL
Mobile app ─┘                              │
                                             ├── scheduling engines
                                             ├── notifications / insights
                                             └── intended Redis, queue, AI, FCM extensions
```

The arrows after the API are only fully real for Prisma and the deterministic engines. Redis, background work, FCM, and AI are not connected to production providers.

## 3. What is already implemented

### 3.1 Shared domain contracts — `packages/contracts`

- TypeScript DTOs model users, categories, tasks, capacity, schedule blocks, rescheduling, activity logs, and weekly insights.
- Zod validates registration/login, task input, onboarding, categories, task completion, auto-placement, and reschedule requests.
- Task validation includes title/duration limits, ISO timestamps, Top 3 quota helpers, same-day checks, and supportive Indonesian/English validation wording.
- A shared `API_ROUTES` object is used by existing web hooks.

**Current limitation:** DTOs and schemas declare newer fields such as energy level, onboarding motivations/goals, success metrics, and generated plans, but the Prisma schema and controllers do not yet persist or serve most of them. Accepting a field in a request is not equivalent to implementing it.

### 3.2 Database layer — `packages/database`

The Prisma schema defines the core relational model:

- `User`, `Category`, `Task`, and `ScheduleBlock`.
- Daily workload/capacity, activity logs, reschedule audit/log records, and notifications.
- Ownership relations and useful user/date/status indexes.
- A Prisma client singleton and a development demo seed are present.

This supports the current API’s core task-and-schedule workflow. The `migrations/` directory exists but has no committed migration files, so an environment cannot be reproduced safely through versioned migrations. The package exposes `db:push`, which is suitable for prototyping but not controlled production schema evolution.

### 3.3 Server API and deterministic logic — `apps/server`

The Express application mounts protected API modules, has Helmet/CORS/rate-limiting, Zod request validation, centralized error mapping, graceful Prisma shutdown, and liveness/readiness endpoints.

Implemented API areas include:

| Domain | Implemented operations |
| --- | --- |
| Auth | Email registration/login, JWT issuance, guest/demo session, onboarding, profile lookup, nominal Google sign-in endpoint |
| Tasks | List/filter, Top 3 selection, create with capacity calculation and placement, lookup, completion, update, deletion |
| Categories | List/default seeding, create, delete |
| Schedule | Today plan, blocks, auto-placement, trigger review, ripple proposal/application, daily capacity, batch rescheduling |
| Notifications | List and mark read |
| Insights | Daily, weekly reflection, weekly summary |
| Health | `/health` and database-backed `/ready` |

The business engines are real source code, not UI-only claims:

- `workload.engine.ts`: calculates daily allocation percentage and capacity bands.
- `top3-priorities.engine.ts`: limits active Top 3 work and selects/rotates focus candidates.
- `silent-placement.engine.ts`: finds first-fit working-hour gaps with buffers.
- `adaptive-reschedule.engine.ts`: detects lateness/collisions/overload and computes non-punitive ripple shifts.

### 3.4 UI tokens and reusable components — `packages/ui-tokens`, `apps/web/src/components`, `apps/mobile/lib/presentation`

- Token source files define colour, dark colour, type, spacing, layout, radius, animation, shadows, and icons.
- Generated CSS/JS/Dart artifacts and SVG assets are checked against the canonical source.
- Web primitives and composite widgets exist: buttons, inputs, checkboxes, navigation, task cards/forms, capacity meter, reschedule alert, modals, toasts, and a showcase.
- Flutter now has a platform shell and screens for welcome/login/register/OTP/password reset, five onboarding steps, dashboard, Today Plan, task list, task creation, and task detail. It also has a `FocientRepository` HTTP wrapper and Riverpod state.

The mobile screens are a **connected prototype**, not yet a production workflow: the default app home is a developer `FocientScreenInspector`, user task/planning state is mostly in memory, and failed repository writes are intentionally treated as optimistic local success.

### 3.5 Tests that pass in this checkout

| Command | Result | Coverage nature |
| --- | --- | --- |
| `npm run test:tokens` | Pass — 16 tests | Generated token fidelity, contrast, typography, icons, motion, shadows, state tokens |
| `npm run test:server` | Pass — 40 tests | Deterministic engines, validation/system-flow calculations, PRD-alignment rules |
| `npm run test:web` | Pass — 72 tests | Static copy, component presence/CSS rules, contract validation, state specifications |
| `npm run typecheck:contracts` | Pass | Shared TypeScript contracts |
| `npm run typecheck:server` | Pass | Prisma client synchronized via `postinstall: prisma generate`; 0 type errors |
| `npm run typecheck:web` | Pass | Web TypeScript source |
| `npm run build` | Pass | Root Turborepo build passes across all workspaces in 40s |

Passing checks are valuable, but they do not start a database, call HTTP endpoints, render the client routes, or build container images. They should therefore be read as **unit/contract confidence**, not end-to-end release evidence.

## 4. What remains missing or incomplete

### 4.1 Product clients: web is a shell; mobile is a prototype — critical

- `apps/web/src/app/page.tsx` renders only “Backend & Core Business Engine Active. UI/UX screen development pending.” There are no implemented app routes for login, onboarding, today, tasks, or insights.
- Mobile has the required visual screens and calls the API for auth, onboarding, and task/planning mutations. Its default production entry still launches `FocientScreenInspector`, which exposes mock data and direct screen switching for UI review.
- The mobile task and planning providers remain in-memory. The local Drift database declaration is commented out, fetch-on-start is not wired into the screen flow, and repository errors often return local success rather than a recoverable error state.
- Existing web React Query hooks and UI components are still not composed into a user journey.

**Needed:** replace the mobile inspector with an app router/session bootstrap, wire server/cache synchronization and visible error/conflict states, complete the web product screens/route guards, and test both complete user journeys.

### 4.2 Web package and deployment — Resolved

- **Package manager locked:** Standardized strictly on npm workspaces (`packageManager: npm@11.6.0` in root `package.json`), removed redundant `pnpm-workspace.yaml`, and cleaned up orphaned nested lockfiles/symlinks (`apps/web/package-lock.json`, `packages/contracts/package-lock.json`).
- **Package naming aligned:** Standardized package references to `@focient/ui-tokens` across `apps/web/package.json`, `next.config.mjs`, and documentation.
- **Source import repaired:** Fixed invalid `../../components/components.css` import in `apps/web/src/app/layout.tsx` to `../components/components.css`.
- **Dockerfiles repaired:** Both `apps/server/Dockerfile` and `apps/web/Dockerfile` now reference `packages/ui-tokens`, invoke `npm ci`, run `prisma generate`, and build production Next.js runtime containers rather than copying raw source into Nginx.
- **Reproducible build pipeline verified:** `postinstall` automatically triggers `npm run db:generate --prefix packages/database`. Root `npm run build` (Turborepo), `npm run typecheck`, and `npm test` execute cleanly across all packages (`@focient/contracts`, `@focient/database`, `@focient/server`, `@focient/ui-tokens`, `@focient/web`).

### 4.3 Authentication and secret handling are unsafe for production — critical

- The Google sign-in endpoint merely decodes an input JWT; it does not validate its signature, issuer, audience, expiry, or nonce. It falls back to `mock_google_token` and creates/uses a fixed email if no valid payload can be decoded.
- JWT has a hard-coded development fallback secret. `docker-compose.yml` also contains a hard-coded production-labelled secret.
- Session tokens are stored in browser `localStorage`, increasing impact from an XSS vulnerability; there is no refresh/revocation/session lifecycle.
- The new registration and password-reset OTPs are held in an in-memory `Map` and their codes are written to server stdout. No SMTP/Resend/SendGrid client or mail credentials are configured, so they do not deliver real email and are lost on process restart.

**Needed:** implement provider-side OpenID Connect token verification, reject missing/invalid tokens, require secrets at startup, move production secrets to a secret manager, establish a documented session strategy, and add auth abuse/integration tests.

### 4.4 “Production integrations” are currently simulations — high

- `common/redis.ts` is an in-process `Map`, not Redis, and appears unused by request processing.
- `common/queue.ts` is an in-memory array that waits 50 ms and performs no job handler work; it is not BullMQ and has no retry/persistence/worker process.
- Notification dispatch returns a simulated successful FCM response; no `firebase-admin`, credentials, device-token persistence, or provider send exists.
- The AI extension can call a provider, but is unused by controllers and uses a LiteLLM/Gemini request shape that needs provider-specific validation and observability.
- Calendar DTOs exist, but there is no calendar authorization, sync, webhook, or conflict-import implementation.

**Needed:** either remove these claims from the release scope or implement and test each provider-backed integration with failure/retry/idempotency behaviour.

### 4.5 Data lifecycle and contract drift — high

- No committed Prisma migration file is present, even though the Prisma schema changed substantially.
- The recent schema/service work persists many formerly unimplemented fields, including task energy/focus/rest metadata and user onboarding preferences. The current generated Prisma client is stale, causing server type-check errors; run Prisma generation in a reproducible install/build step before compiling.
- A `GeneratePlanSchema` and response DTO exist without a server route/implementation.
- The mobile model still has its own state representation and mapping layer; it needs contract tests to ensure every server enum and new persistence field round-trips correctly.
- The database seed invokes `ts-node/esm`, but `ts-node` is not declared in the database package dependencies.
- The task deletion handler removes records but does not send a success response, so a client request can remain unresolved.

**Needed:** define a source-of-truth feature matrix, migrate schema and services in lockstep, generate/version the database schema, and add contract compatibility tests across server/web/mobile.

### 4.6 Test strategy is incomplete — high

- Server tests test engines and data transformations without a real PostgreSQL/Prisma HTTP request lifecycle.
- Web tests mostly inspect source/static implementation rules; no browser rendering, accessibility, user-event, or API-mocked integration test exists.
- Flutter tests did not complete in the available execution window, so mobile verification remains unconfirmed. The Drift implementation is now explicitly commented out rather than generated; offline persistence is therefore deferred, not implemented.
- No coverage thresholds, lint script, dependency/security scanning, container build validation, or deployed smoke test appears in CI.

**Needed:** add ephemeral PostgreSQL/Redis integration tests, API route tests, Playwright/Cypress browser flows, Flutter analyzer/widget tests and code generation, plus CI jobs for clean install, build, container build, and migration verification.

### 4.7 Codebase maintainability — medium

- `apps/web/src/component/` and `apps/web/src/components/` are duplicated. This creates divergence risk and already contributes to an incorrect stylesheet import.
- Documentation describes NestJS, NextAuth/Supabase, BullMQ, Redis, Vercel, FCM, Sentry, and PostHog as stack elements, but the executable code is Express plus in-memory/simulated substitutes. The README should state aspiration versus current state.
- No API specification (OpenAPI), architecture decision records, setup runbook, or environment-specific deployment instructions are committed.
- Some day calculations use UTC date construction while user profiles have a timezone. This needs deliberate timezone semantics before real users schedule across offsets or DST.

## 5. Delivery blockers versus improvements

| Priority | Work item | Why it matters | Completion evidence |
| --- | --- | --- | --- |
| P0 | Repair generated Prisma client, workspace, clean install, root build, Next build, and both Dockerfiles | The current server does not type-check and the project cannot produce a verified deployable artifact. | Clean clone: Prisma generation, install, `npm run build`, and container builds pass. |
| P0 | Turn the mobile prototype into an app and implement the web primary flow | Mobile is still inspector-led/local-first; web cannot use the backend. | A user can register, onboard, create/complete tasks, see Today, reschedule, and inspect insights without mock/inspector paths. |
| P0 | Replace insecure Google/JWT defaults and externalize secrets | Current auth is not safe to expose. | Valid provider tokens pass; forged/expired tokens fail; startup rejects missing production secrets. |
| P1 | Version Prisma migrations and align schema/contracts | Prevents lost data and silently dropped fields. | Fresh database migrates and all implemented fields round-trip. |
| P1 | Add real API/database and browser/mobile tests | Unit tests alone cannot prove product behavior. | CI starts dependencies and executes representative user flows. |
| P1 | Decide/implement Redis, jobs, FCM, calendar scope | Avoids shipping simulated capabilities as real functionality. | Provider-backed acceptance tests and operational failure handling. |
| P2 | Consolidate duplicate web component directories and add OpenAPI/runbooks | Reduces maintenance and onboarding cost. | One canonical component tree; generated/maintained API docs and setup guide. |
| P2 | Add observability, backup, data-retention, accessibility, and timezone hardening | Required for reliable operation beyond an MVP demo. | Telemetry/error dashboards, a11y checks, timezone test matrix, documented SLOs. |

## 6. Suggested implementation sequence

1. **Restore a green baseline:** generate Prisma client in the reproducible build path, select npm or pnpm, repair names/imports/Dockerfiles, add the Turbo package-manager field, and make clean CI install/build pass.
2. **Close the data contract:** add an initial migration, choose which new behavioural fields are in MVP, remove deferred contract surface, and prove mobile/server mapper parity.
3. **Deliver one production vertical slice:** replace the mobile inspector with session routing and server-backed state; implement the same login → onboarding → task → Today → reschedule → insights journey in web.
4. **Secure and verify:** implement OAuth verification, secret management, integration tests with PostgreSQL, and browser/mobile tests.
5. **Add optional integrations only after the vertical slice is stable:** Redis/BullMQ, FCM, calendar, AI, analytics, and error monitoring.

## 7. Audit limits and working-tree note

- Docker could not be invoked in this environment, so image failure is established by source inspection (and should be confirmed in CI once Docker is available).
- Flutter test did not complete within the available command window; it is therefore marked unverified rather than failed. Offline Drift persistence is intentionally commented out and remains deferred.
- Uncommitted changes existed outside this audit document in the contracts/database source area. This audit did not modify those files.
- This document records the checked-out state on the audit date. Update the tables as P0/P1 work lands so it becomes the project’s ongoing delivery dashboard.
