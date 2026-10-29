# ADR-001: Monorepo Architecture and Unified Cross-Platform Tech Stack

## Status
**Accepted** (October 2026)

## Context
FoCient requires synchronized development across three consumer surfaces and shared domain layers:
1. **Server API**: Core scheduling algorithms, database access, background queues, and auth.
2. **Web Application**: Next.js 14 web client featuring WCAG 2.1 AAA accessibility and responsive design.
3. **Mobile Client**: Flutter iOS and Android mobile applications with native device notifications and offline resilience.
4. **Shared Domain Packages**: API contracts, validation schemas, design tokens, and database models.

Maintaining separate git repositories would lead to contract drift, out-of-sync API schemas, divergent design token implementations, and fragmented continuous integration pipelines.

## Decision
1. **Turborepo Workspace Monorepo**:
   - Manage the entire ecosystem within a single Turbo repository (`focient-app`).
   - Group applications under `apps/` (`apps/web`, `apps/server`, `apps/mobile`).
   - Group shared reusable libraries under `packages/` (`packages/contracts`, `packages/database`, `packages/ui-tokens`).
2. **Unified TypeScript Domain Contracts**:
   - Share Zod schemas and TypeScript DTOs via `@focient/contracts`.
   - Both Web and Server import contracts directly, guaranteeing compile-time type safety for every request and response.
   - Flutter maps to and from the identical contract specifications via `TaskDtoMapper`.
3. **Centralized Design Token Standard (DTCG)**:
   - Export W3C DTCG Design Tokens from `@focient/ui-tokens` with 4-point spacing, calming palettes, and fluid motion curves.
4. **Prisma ORM with PostgreSQL 16**:
   - Single canonical database schema defined in `packages/database/schema.prisma`.
   - Database migrations and seed scripts version-controlled alongside application code.

## Consequences
- **Positive**:
  - Atomic cross-package pull requests and single-command CI pipelines.
  - Zero contract drift between server endpoints and web/mobile clients.
  - Shared build cache via Turborepo accelerating CI runs.
- **Negative / Trade-offs**:
  - Flutter workspace requires separate tooling (`flutter pub`) coordinated alongside npm workspace commands.
