# ADR-006: IANA Timezone Normalization and Daylight Saving Time (DST) Resilience for Daily Plans

## Status
**Accepted** (October 2026)

## Context
FoCient plans tasks and calculates daily capacity around calendar days. However:
1. **Timezone Discrepancies**: A user in Jakarta (UTC+7) or London (UTC+0 / UTC+1) experiences midnight at a different UTC timestamp than a user in New York (UTC-5 / UTC-4). Naive string operations (such as appending `T00:00:00.000Z`) evaluate dates in UTC rather than the user's local day, leading to tasks appearing on the wrong day.
2. **Daylight Saving Time (DST) Transitions**:
   - In Spring, clocks "spring forward" by one hour (e.g. 02:00 -> 03:00 in the US), resulting in a **23-hour calendar day**.
   - In Autumn, clocks "fall back" by one hour (e.g. 02:00 -> 01:00 in the US), resulting in a **25-hour calendar day**.
   - Rigid 24-hour assumptions cause scheduling overlap or out-of-bounds capacity errors during transition dates.

## Decision
1. **Store Timestamps in UTC, Group by Local IANA Timezone**:
   - All database timestamps (`createdAt`, `startTime`, `scheduledStart`, `completedAt`) are strictly stored as UTC `DateTime` values (ISO 8601 with `Z`).
   - Each user profile stores an IANA timezone identifier (e.g. `'Asia/Jakarta'`, `'America/New_York'`, `'Europe/London'`).
2. **Dynamic Local Day Boundary Resolution**:
   - Developed `getLocalDayBoundaries(dateStr, timeZone)` in `@focient/contracts` (re-exported in `apps/server/src/common/timezone.util.ts`).
   - Uses native `Intl.DateTimeFormat` with iterative convergence to calculate exact UTC `startOfDay` (local 00:00:00.000) and `endOfDay` (local 23:59:59.999).
   - Correctly determines 23-hour length during Spring-Forward and 25-hour length during Fall-Back.
3. **Database Querying via Local Day Boundaries**:
   - All Today Plan and daily capacity calculations query tasks with `{ gte: boundaries.startOfDay, lte: boundaries.endOfDay }`.
   - Workload capacity limits gracefully adapt to actual available working hours during DST days.

## Consequences
- **Positive**:
  - Global users experience accurate daily plans regardless of local timezone or DST status.
  - Zero task dropping, duplicate slotting, or incorrect day allocation across DST clock shifts.
  - Full automated test coverage in `apps/server/test/timezone-dst.test.ts`.
- **Negative / Trade-offs**:
  - Daily plan queries require fetching the user's timezone prior to calculating day boundaries.
