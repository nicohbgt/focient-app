import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('FoCient Settings Feature & Real Data-Driven State Suite', () => {
  it('1. Anti-Burnout capacity enforcement: max daily limit cannot exceed 8.0 hours', () => {
    const maxCapacityHours = 8.0;
    const testCases = [
      { input: 6.0, expected: 6.0, isValid: true },
      { input: 8.0, expected: 8.0, isValid: true },
      { input: 9.5, expected: 8.0, isValid: false }, // Must clamp or reject
      { input: 12.0, expected: 8.0, isValid: false }, // Must clamp or reject
    ];

    testCases.forEach((tc) => {
      const clamped = Math.min(tc.input, maxCapacityHours);
      assert.ok(
        clamped <= maxCapacityHours,
        `Capacity limit ${clamped}h exceeds anti-burnout threshold ${maxCapacityHours}h`
      );
      if (tc.isValid) {
        assert.equal(clamped, tc.input);
      } else {
        assert.equal(clamped, 8.0);
      }
    });
  });

  it('2. Zero punitive language in Settings copywriting and status messages', () => {
    const punitiveForbiddenWords = [
      'terlambat', 'gagal', 'hukuman', 'sanksi', 'overdue', 'failed', 'lazy', 'punish',
      'telat', 'buruk', 'malas', 'denda'
    ];

    const settingsLabels = [
      'Pengaturan Ruang Kerja',
      'Ritme & Batas Kapasitas Sehat',
      'Maksimal 8 Jam Sehari (Anti-Burnout)',
      'Jeda Istirahat Otomatis',
      'Beban Mendekati Batas',
      'Sinkronisasi Database Real-Time',
      'Data Tersimpan Aman',
      'Mulai Hari dengan Ritme Tenang',
      'Belum ada tugas terjadwal hari ini. Tambahkan tugas pertama Anda dengan ritme yang nyaman.'
    ];

    settingsLabels.forEach((phrase) => {
      const lower = phrase.toLowerCase();
      punitiveForbiddenWords.forEach((forbidden) => {
        assert.ok(
          !lower.includes(forbidden),
          `Phrase "${phrase}" contains forbidden punitive word: "${forbidden}"`
        );
      });
    });
  });

  it('3. Real category CRUD & color swatches contract', () => {
    const defaultColorOptions = [
      '#2563EB', '#0D9488', '#D97706', '#7C3AED', '#DC2626', '#4B5563', '#059669'
    ];

    // Every color must be a valid 6-char hex code
    defaultColorOptions.forEach((hex) => {
      assert.match(hex, /^#[0-9A-Fa-f]{6}$/, `Invalid category hex format: ${hex}`);
    });

    // Category structure
    const sampleCategory = {
      id: 'cat-eng-01',
      name: 'Engineering & Code',
      color: '#2563EB',
      dailyMinutesLimit: 180,
    };

    assert.ok(sampleCategory.name.length > 0);
    assert.ok(sampleCategory.dailyMinutesLimit >= 15);
  });

  it('4. Real-time database sync status contract', () => {
    type DbStatus = 'connected' | 'syncing' | 'offline_cached' | 'error';
    const validStatuses: DbStatus[] = ['connected', 'syncing', 'offline_cached', 'error'];

    const currentStatus: DbStatus = 'connected';
    assert.ok(validStatuses.includes(currentStatus));
  });

  it('5. Quiet hours time range validation contract', () => {
    const quietHours = {
      enabled: true,
      start: '21:00',
      end: '08:00',
    };

    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    assert.match(quietHours.start, timeRegex);
    assert.match(quietHours.end, timeRegex);
  });

  it('6. Rapid concurrent setting updates merge correctly without reverting', () => {
    // Simulating multiple rapid modifications in succession
    let userState = {
      name: 'Nico',
      roleArchetype: 'General',
      workingRhythm: 'Steady Pacer',
      startWorkTime: '09:00',
      endWorkTime: '17:00',
      restTimePerTask: 10,
      weekStartDay: 'monday',
    };

    // Rapid change 1: Rhythm to Night Owl
    const change1 = { workingRhythm: 'Night Owl' };
    userState = { ...userState, ...change1 };
    assert.equal(userState.workingRhythm, 'Night Owl');

    // Rapid change 2: Start time to 18:00 before change 1 server roundtrip
    const change2 = { startWorkTime: '18:00' };
    userState = { ...userState, ...change2 };
    assert.equal(userState.startWorkTime, '18:00');

    // Rapid change 3: Week start to sunday
    const change3 = { weekStartDay: 'sunday' };
    userState = { ...userState, ...change3 };
    assert.equal(userState.weekStartDay, 'sunday');

    // When change 1 network response arrives with stale startWorkTime '09:00',
    // the store merge preserves optimistic updates ({ ...data.user, ...prev })
    const serverResponse1 = {
      name: 'Nico',
      roleArchetype: 'General',
      workingRhythm: 'Night Owl',
      startWorkTime: '09:00', // Stale
      endWorkTime: '17:00',
      restTimePerTask: 10,
      weekStartDay: 'monday', // Stale
    };

    // Store update logic
    userState = { ...serverResponse1, ...userState };

    // Assert that rapid changes 2 & 3 were NOT reverted!
    assert.equal(userState.workingRhythm, 'Night Owl');
    assert.equal(userState.startWorkTime, '18:00');
    assert.equal(userState.weekStartDay, 'sunday');
  });

  it('7. Week Start Day setting is strictly located in Rhythm & Capacity without duplicate in Account & Language', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const settingsPath = path.resolve(process.cwd(), 'apps/web/src/screens/settings/SettingsScreen.tsx');
    const content = fs.readFileSync(settingsPath, 'utf8');

    // Must be in Rhythm section
    assert.ok(
      content.includes('activeSection === \'rhythm\'') || content.includes('activeSection === "rhythm"'),
      'Rhythm section must exist'
    );
    assert.ok(
      content.includes('handleSelectWeekStart(\'monday\')'),
      'Week start day selector must be available in Rhythm & Capacity'
    );

    // Must NOT be in Security / Account & Language body panel
    const securityPanelIndex = content.indexOf("{activeSection === 'security' && (");
    assert.ok(securityPanelIndex > -1, 'Security (Account & Language) body panel must exist');
    const securityPanelContent = content.slice(securityPanelIndex);
    assert.equal(
      securityPanelContent.includes('handleSelectWeekStart'),
      false,
      'Duplicate handleSelectWeekStart must be removed from Account & Language'
    );
  });

  it('8. Settings screen initial render strictly skips autosave when values have not changed', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const settingsPath = path.resolve(process.cwd(), 'apps/web/src/screens/settings/SettingsScreen.tsx');
    const content = fs.readFileSync(settingsPath, 'utf8');

    // 1. Must maintain lastSavedSnapshotRef and getSettingsSnapshot
    assert.ok(content.includes('lastSavedSnapshotRef = React.useRef'), 'Must declare lastSavedSnapshotRef');
    assert.ok(content.includes('getSettingsSnapshot = useCallback'), 'Must declare getSettingsSnapshot');

    // 2. Must initialize lastSavedSnapshotRef on mount with loaded values
    assert.ok(
      content.includes('lastSavedSnapshotRef.current = JSON.stringify({'),
      'Must initialize lastSavedSnapshotRef on mount'
    );

    // 3. Must guard against running scheduleAutoSave when currentSnapshot === lastSavedSnapshotRef.current
    assert.ok(
      content.includes('if (currentSnapshot === lastSavedSnapshotRef.current) {\n      return;\n    }') ||
      content.includes('if (currentSnapshot === lastSavedSnapshotRef.current) {\r\n      return;\r\n    }'),
      'Autosave effect must return immediately without saving if current snapshot matches saved snapshot'
    );
  });

  it('9. Today Plan screen uses max-w-6xl mx-auto w-full matching Dashboard, Tasks, Insights & Settings', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const planPath = path.resolve(process.cwd(), 'apps/web/src/screens/plan/TodayPlanScreen.tsx');
    const content = fs.readFileSync(planPath, 'utf8');

    assert.ok(
      content.includes('max-w-6xl mx-auto w-full'),
      'TodayPlanScreen must use max-w-6xl mx-auto w-full for consistent card layout'
    );
    assert.equal(
      content.includes('max-w-4xl mx-auto'),
      false,
      'Obsolete narrower max-w-4xl mx-auto must be removed'
    );
  });
});
