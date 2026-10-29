# ADR-005: Calendar Integration Scope & Export Specification

## Status
**Accepted** (October 2026)

## Context
FoCient helps users schedule tasks, focus blocks, and mindful rest intervals. Integrating with external calendars (Google Calendar, Apple Calendar, Microsoft Outlook) was evaluated for MVP vs Phase 2 scope.

Full bidirectional OAuth synchronization involves:
1. Multi-provider OAuth consent screens (Google Cloud Console verification, Microsoft Azure AD App Registration, Apple Developer Services).
2. Continuous background webhook listeners for external event updates, deletions, and cancellations.
3. Complex multi-way conflict resolution heuristics when an external event collides with a scheduled focus session.
4. Handling token expiration, revoked consent, and sensitive personal calendar read/write scopes.

## Decision
1. **MVP Scope: Universal RFC 5545 iCalendar (`.ics`) Export**:
   - Provide standard HTTP endpoint `GET /api/schedule/export/ics` (and `/api/schedule/export.ics`).
   - Generates standard RFC 5545 `.ics` calendar streams containing scheduled tasks, focus sessions, and rest buffers.
   - Allows users to one-click import their FoCient daily or weekly plan directly into Google Calendar, Apple Calendar, or Outlook without sharing OAuth credentials or granting invasive account permissions.
2. **Post-MVP / Phase 2: Bidirectional OAuth Synchronization**:
   - Bi-directional 2-way sync with Google Calendar API and Outlook Graph API is formally deferred to Phase 2.
   - Pre-built DTOs (`ExternalCalendarEventDto`, `CalendarSyncResponseDto`) in `@focient/contracts` remain reserved for Phase 2 implementation.

## Consequences
- **Positive**:
  - Immediate, 100% functional interoperability with all major calendar clients on desktop, web, and mobile.
  - Zero external cloud provider credential setup, quota limits, or App Verification delays required for MVP launch.
  - Complete user privacy: no third-party calendar read access required.
- **Negative**:
  - Updates in external calendar apps do not automatically push backward into FoCient without re-exporting or Phase 2 webhook sync.
