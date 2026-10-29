import 'package:drift/drift.dart';

/// Architectural Reference: Drift (SQLite) Local Database Schema
///
/// NOTE: Full code-generated Drift SQLite offline persistence is explicitly
/// deferred to Phase 2 per ADR-004 (`docs/adr/ADR-004-offline-drift-persistence-deferral.md`).
///
/// In the MVP architecture, offline resilience is provided by:
/// 1. Riverpod optimistic in-memory caching (`task_state.dart`, `today_plan_provider.dart`).
/// 2. `FocientRepository` with automated network retry (`withRetry`) and conflict detection.
/// 3. Zero native C/NDK compilation dependency overhead in continuous integration.
class TaskEntries extends Table {
  TextColumn get id => text()();
  TextColumn get title => text().withLength(min: 1, max: 120)();
  TextColumn get notes => text().nullable()();
  IntColumn get durationMinutes => integer()();
  TextColumn get priority => text().withDefault(const Constant('NORMAL'))();
  TextColumn get status => text().withDefault(const Constant('TODO'))();
  TextColumn get category => text().nullable()();
  DateTimeColumn get scheduledStart => dateTime().nullable()();
  DateTimeColumn get scheduledEnd => dateTime().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

class ScheduleBlockEntries extends Table {
  TextColumn get id => text()();
  TextColumn get taskId => text().nullable()();
  TextColumn get title => text()();
  DateTimeColumn get startTime => dateTime()();
  DateTimeColumn get endTime => dateTime()();
  BoolColumn get isLocked => boolean().withDefault(const Constant(false))();
  TextColumn get type => text().withDefault(const Constant('TASK'))();

  @override
  Set<Column> get primaryKey => {id};
}

// @DriftDatabase(tables: [TaskEntries, ScheduleBlockEntries])
// class FocientLocalDatabase extends _$FocientLocalDatabase {
//   FocientLocalDatabase(QueryExecutor e) : super(e);
// 
//   @override
//   int get schemaVersion => 1;
// }
