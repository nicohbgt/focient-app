# FoCient Local Development Runbook

This guide covers setting up, running, testing, and debugging the entire FoCient monorepo locally on Windows, macOS, or Linux.

---

## 1. Prerequisites

Ensure your workstation meets the following minimum toolchain requirements:

| Component | Minimum Version | Recommended | Verification Command |
|---|---|---|---|
| **Node.js** | `>= 20.18.0` | `v22.x` or `v24.x` | `node -v` |
| **npm** | `>= 10.8.0` | `10.8.2` | `npm -v` |
| **PostgreSQL** | `>= 16.0` | `16.x` | `psql --version` |
| **Redis** *(optional)* | `>= 7.0` | `7.x` (fallback to in-memory) | `redis-cli --version` |
| **Flutter SDK** | `>= 3.24.0` | `3.24.x` | `flutter --version` |
| **Java JDK** | `17` | OpenJDK 17 | `java -version` |

---

## 2. Repository Architecture & Layout

FoCient is structured as a Turbo monorepo:

```
focient-app/
├── apps/
│   ├── mobile/         # Flutter cross-platform mobile client (iOS / Android)
│   ├── server/         # Express.js REST API with Guilt-Free Adaptive Engine
│   └── web/            # Next.js 14 App Router web client with WCAG AAA Calm UI
├── packages/
│   ├── contracts/      # Shared DTOs, Zod schemas, routes & Timezone DST utilities
│   ├── database/       # Prisma schema, migrations, seeders & client
│   └── ui-tokens/      # DTCG Design Tokens, color palettes, and motion curves
├── docs/
│   ├── adr/            # Architecture Decision Records
│   ├── runbooks/       # Operational runbooks (local setup, deployment)
│   └── openapi.yaml    # OpenAPI 3.1 REST API specification
└── package.json        # Workspace root and orchestrator scripts
```

---

## 3. Step-by-Step Local Setup

### Step 3.1: Clone and Install Workspace Dependencies
From the repository root:
```bash
npm install
```

### Step 3.2: Configure Environment Variables
Copy example environment templates for root and individual packages:

```bash
# apps/server/.env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://focient:focient_password@localhost:5432/focient_dev
JWT_SECRET=super_secret_cryptographic_jwt_key_min_32_chars_long_12345
REFRESH_TOKEN_SECRET=super_secret_refresh_token_cryptographic_key_32_chars_123
GOOGLE_CLIENT_ID=optional_google_client_id_for_web
REDIS_URL=redis://localhost:6379 # Omit to use automated in-memory fallback
EMAIL_PROVIDER=in-memory         # In-memory hashed OTP for local testing
LOG_LEVEL=debug
```

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Step 3.3: Database Provisioning and Prisma Migrations
If using Docker to run local PostgreSQL:
```bash
docker run -d --name focient-postgres \
  -e POSTGRES_USER=focient \
  -e POSTGRES_PASSWORD=focient_password \
  -e POSTGRES_DB=focient_dev \
  -p 5432:5432 postgres:16-alpine
```

Generate Prisma client and apply database migrations:
```bash
npx prisma generate --schema=packages/database/schema.prisma
npx prisma migrate dev --schema=packages/database/schema.prisma
```

*(Optional)* Seed default categories and demo user:
```bash
npm run seed --prefix packages/database
```

---

## 4. Running the Development Services

### Running Full Monorepo (Web + Server)
```bash
npm run dev
```
- **Web Client**: [http://localhost:3000](http://localhost:3000)
- **API Server**: [http://localhost:4000](http://localhost:4000)
- **Health Probe**: [http://localhost:4000/health](http://localhost:4000/health)

### Running Mobile Client (Flutter)
```bash
cd apps/mobile
flutter pub get
flutter run
```
To run on a specific attached device or emulator:
```bash
flutter devices
flutter run -d <DEVICE_ID>
```

---

## 5. Quality, Verification & CI Commands

Run the full local verification pipeline before committing:

| Target | Command | Notes |
|---|---|---|
| **Typecheck** | `npm run typecheck` | Validates TypeScript across all 5 workspace packages |
| **All Monorepo Tests** | `npm test` | Runs web (80 tests) + server (96 tests) test suites |
| **Server Tests** | `npm test --prefix apps/server` | Includes OIDC, OTP, Engines, Postgres, Timezone DST |
| **Web Tests** | `npm test --prefix apps/web` | Includes E2E, WCAG AAA a11y, microinteractions, copywriting |
| **Coverage Threshold** | `npm run test:coverage` | Enforces $\ge 75\%$ line and $\ge 65\%$ branch coverage |
| **Smoke Test** | `npm run smoke` | Launches live server and tests health, auth, and placement |
| **Flutter Analysis** | `flutter analyze --no-fatal-infos` | Mobile static analysis (zero issues required) |
| **Flutter Tests** | `flutter test` | Mobile Riverpod state and repository tests |

---

## 6. Troubleshooting Common Issues

### 1. `DATABASE_URL` Not Found or Connection Refused
- In local unit test runs, test suites gracefully skip PostgreSQL live tests if `DATABASE_URL` is disconnected, testing pure in-memory engine logic.
- To run live Postgres tests, start Postgres container and set `DATABASE_URL`.

### 2. Redis Not Available
- When `REDIS_URL` is omitted or unavailable, the backend automatically initializes an in-memory TTL cache and job queue fallback. No setup required.

### 3. Android Core Library Desugaring Error
- If building the mobile app fails with `Dependency ':flutter_local_notifications' requires core library desugaring to be enabled for :app`, ensure `apps/mobile/android/app/build.gradle` contains:
  ```groovy
  compileOptions {
      coreLibraryDesugaringEnabled true
      sourceCompatibility JavaVersion.VERSION_1_8
      targetCompatibility JavaVersion.VERSION_1_8
  }
  dependencies {
      coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs:2.1.4'
  }
  ```
