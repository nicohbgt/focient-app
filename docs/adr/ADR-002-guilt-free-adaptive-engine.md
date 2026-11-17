# ADR-002: Guilt-Free Adaptive Engine and Non-Punitive Reschedule Heuristics

## Status
**Accepted** (October 2026)

## Context
Traditional productivity applications often produce burnout, cognitive friction, and guilt:
1. When tasks run past their planned times, conventional apps flash red "Overdue" or "Late" alerts.
2. Incomplete tasks accumulate in punitive debt queues that overwhelm users.
3. Users struggle to prioritize due to endless to-do lists without hard daily cognitive capacity constraints.

FoCient was architected to eliminate productivity guilt through an adaptive scheduling engine based on empathetic ergonomics.

## Decision
1. **Zero Punitive Vocabulary Guarantee**:
   - The entire platform strictly prohibits accusatory terminology (`Terlambat`, `Overdue`, `Failed`, `Telat`, `Hukuman`, `Punish`).
   - Copywriting is affirmative, supportive, and focused on calm forward progress.
2. **Algoritma 1: Workload & Daily Capacity Engine**:
   - Daily workload is calculated against user-configured working hours (e.g. 8h max).
   - Capacity states: `LIGHT` (< 50%), `OPTIMAL` (50% - 75%), `NEAR_CAPACITY` (76% - 90%), `OVERLOAD` (> 90%).
   - Overload triggers a warm, supportive Amber banner rather than harsh error modals.
3. **Algoritma 2: Silent Placement Engine**:
   - Unscheduled tasks are automatically placed into open schedule gaps (`Celah Awal`, `Celah Antar-Tugas`, `Celah Akhir`).
   - Automatically injects a **10-minute cognitive buffer** between consecutive focus blocks to allow mental recovery.
4. **Algoritma 3: Adaptive Ripple Reschedule**:
   - When a task extends past its scheduled duration, downstream tasks are automatically shifted forward by the required delta plus the 10-minute cognitive buffer.
   - If downstream tasks exceed end-of-work hours, the engine proposes non-punitive reallocations (`Move to Tomorrow` or `Move to Backlog`).
5. **Algoritma 4: Top-3 Priorities Quota & Swap Resolution**:
   - Enforces a strict quota of maximum 3 active Top-3 focus tasks per day.
   - Adding a 4th Top-3 task invokes a deterministic swap resolution or prompts the user to select an existing task to demote to Normal priority.

## Consequences
- **Positive**:
  - Significant reduction in user anxiety and cognitive fatigue.
  - Schedules remain realistic, dynamically adapting to real-world interruptions.
  - Predictable, mathematically sound scheduling without black-box complexity.
- **Negative / Trade-offs**:
  - Requires strict guardrails in validation schemas and UI copywriting tests to ensure no punitive terms are introduced.
