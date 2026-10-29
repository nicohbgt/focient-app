# ADR-004: Explicit Deferral of Offline Drift/SQLite Code-Generated Persistence

## Status
**Accepted / Deferred to Phase 2** (October 2026)

## Context
The FoCient mobile application (`apps/mobile`) includes table definitions in `lib/data/local_database.dart` intended for Drift/SQLite offline-first persistence (`TaskEntries`, `ScheduleBlockEntries`).

During ongoing evaluation and build stabilization:
1. **Toolchain & Native Compilation Overhead**: Drift relies on `sqlite3_flutter_libs` which requires specific Android NDK versions (e.g., NDK side-by-side 28.x) and native C++ linkers on iOS/macOS. This introduced substantial build delays (12+ minutes) and fragile toolchain dependencies in CI/CD pipelines.
2. **Code Generation Bottleneck**: Drift requires `build_runner` and `drift_dev` to generate `local_database.g.dart`. Maintaining code-generation in cross-platform developer workflows introduces friction and file drift.
3. **Existing Architectural Resilience**:
   - The Flutter application already leverages Riverpod (`flutter_riverpod`) for reactive, immediate UI state updates.
   - `FocientRepository` and `FocientNetworkClient` already implement optimistic local updates, automatic retry with backoff (`withRetry`), and conflict management (`ConflictException`).
   - For MVP scale, user daily focus sessions and today plans are small enough to be preserved in an in-memory repository cache with fallback serialization.

## Decision
1. **Explicitly Defer Drift SQLite Persistence to Phase 2**:
   - Retain `local_database.dart` as a documented schema reference and migration blueprint.
   - Do not require active `build_runner` code generation or native SQLite database initialization in the MVP critical path.
2. **Implement Resilient In-Memory & Repository Fallback Cache**:
   - `FocientRepository` maintains an in-memory cached state of active tasks and planning blocks.
   - On network failure or offline usage, repository read operations serve the most recently synchronized plan rather than throwing fatal exceptions.
   - Failed writes trigger graceful non-punitive UI feedback ("Perubahan disimpan lokal; akan disinkronkan saat online") and allow manual or automatic retry.

## Consequences
- **Positive**:
  - Clean, fast builds across Android and iOS without NDK compilation failures.
  - Mobile test execution (`flutter test`) runs in under 10 seconds without native mock requirements.
  - Zero punitive or accusatory user disruption during intermittent connectivity.
- **Negative / Future Work**:
  - Cold app restarts when completely offline will rely on remote fetch upon connectivity rather than long-term offline SQLite storage.
  - Full multi-day offline queue synchronization will be scheduled for Phase 2 once backend contracts and multi-device sync protocols are fully established.
