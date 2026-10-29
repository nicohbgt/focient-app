import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { emptyTokens } from '@focient/ui-tokens/empty-token';
import { dictionaries, idCopywriting, enCopywriting } from '../src/components/i18n/copywriting.ts';

test('FoCient Empty State Specification & Anti-Burnout Compliance Suite', async (t) => {
  const css = await readFile(new URL('../src/components/components.css', import.meta.url), 'utf8');

  await t.test('1. Semantic Design Token Integration & Contrast Ratio', () => {
    // Canonical DTCG tokens
    assert.equal(emptyTokens['empty-canvas-bg'], '#F8FAFC');
    assert.equal(emptyTokens['empty-icon-ring-bg'], '#F0FDFA');
    assert.equal(emptyTokens['empty-icon-ring-success'], '#ECFDF5');
    assert.equal(emptyTokens['empty-icon-ring-muted'], '#F1F5F9');
    assert.equal(emptyTokens['empty-icon-ring-size'], '80px');
    assert.equal(emptyTokens['empty-icon-accent-onboarding'], '#0D9488');
    assert.equal(emptyTokens['empty-icon-accent-success'], '#059669');
    assert.equal(emptyTokens['empty-icon-accent-search'], '#64748B');
    assert.equal(emptyTokens['empty-icon-accent-rest'], '#0D9488');
    assert.equal(emptyTokens['empty-text-title'], '#0F172A');
    assert.equal(emptyTokens['empty-text-body'], '#64748B');
    assert.equal(emptyTokens['empty-layout-min-height'], '360px');
    assert.equal(emptyTokens['empty-layout-padding-y'], '64px');

    // Registered in :root
    assert.ok(css.includes('--empty-canvas-bg: #F8FAFC;'), 'CSS must define --empty-canvas-bg');
    assert.ok(css.includes('--empty-icon-ring-bg: #F0FDFA;'), 'CSS must define --empty-icon-ring-bg');
    assert.ok(css.includes('--empty-icon-ring-success: #ECFDF5;'), 'CSS must define --empty-icon-ring-success');
    assert.ok(css.includes('--empty-icon-ring-muted: #F1F5F9;'), 'CSS must define --empty-icon-ring-muted');
    assert.ok(css.includes('--empty-icon-ring-size: 80px;'), 'CSS must define --empty-icon-ring-size');
    assert.ok(css.includes('--empty-icon-accent-onboarding: #0D9488;'), 'CSS must define --empty-icon-accent-onboarding');
    assert.ok(css.includes('--empty-icon-accent-success: #059669;'), 'CSS must define --empty-icon-accent-success');
    assert.ok(css.includes('--empty-text-title: #0F172A;'), 'CSS must define --empty-text-title');
    assert.ok(css.includes('--empty-text-body: #64748B;'), 'CSS must define --empty-text-body');
    assert.ok(css.includes('--empty-layout-min-height: 360px;'), 'CSS must define --empty-layout-min-height');
    assert.ok(css.includes('--empty-layout-padding-y: 64px;'), 'CSS must define --empty-layout-padding-y');
  });

  await t.test('2. Macro Whitespace & Decluttered Layout Spec', () => {
    assert.ok(css.includes('.focient-empty-state'), 'CSS must define .focient-empty-state container');
    assert.ok(css.includes('--empty-layout-min-height'), 'Empty state must use min-height token');
    assert.ok(css.includes('--empty-layout-padding-y'), 'Empty state must use macro padding-y token');
    assert.ok(css.includes('.focient-empty-icon-ring'), 'CSS must define .focient-empty-icon-ring');
    assert.ok(css.includes('--empty-icon-ring-size'), 'Icon ring must use size token');
    assert.ok(css.includes('border-radius: 50%'), 'Icon ring must be a perfect circle');
  });

  await t.test('3. Variant-Specific Icon Rings & Semantic Colors', () => {
    // 4 Variant Icon Rings
    assert.ok(css.includes('.focient-empty-icon-ring--onboarding'), 'Must define onboarding ring');
    assert.ok(css.includes('--empty-icon-ring-bg'), 'Onboarding ring must use soft teal bg');
    assert.ok(css.includes('--empty-icon-accent-onboarding'), 'Onboarding icon must use #0D9488');

    assert.ok(css.includes('.focient-empty-icon-ring--completed'), 'Must define completed ring');
    assert.ok(css.includes('--empty-icon-ring-success'), 'Completed ring must use soft green bg');
    assert.ok(css.includes('--empty-icon-accent-success'), 'Completed icon must use #059669');

    assert.ok(css.includes('.focient-empty-icon-ring--search'), 'Must define search ring');
    assert.ok(css.includes('--empty-icon-ring-muted'), 'Search ring must use soft neutral muted bg');
    assert.ok(css.includes('--empty-icon-accent-search'), 'Search icon must use #64748B');

    assert.ok(css.includes('.focient-empty-icon-ring--rest'), 'Must define rest ring');
    assert.ok(css.includes('--empty-icon-accent-rest'), 'Rest icon must use #0D9488');
  });

  await t.test('4. Typography & Single Clear Action Layout', () => {
    assert.ok(css.includes('.focient-empty-title'), 'CSS must define .focient-empty-title');
    assert.ok(css.includes('.focient-empty-body'), 'CSS must define .focient-empty-body');
    assert.ok(css.includes('.focient-empty-actions'), 'CSS must define .focient-empty-actions');
    assert.ok(css.includes('max-width: 440px'), 'Empty body must be width-constrained for readable line length');
  });

  await t.test('5. Component Structure & Export Verification', async () => {
    const organismIndex = await readFile(new URL('../src/components/organism/index.ts', import.meta.url), 'utf8');
    assert.ok(organismIndex.includes('EmptyState'), 'Organism index must export EmptyState');

    const emptyStateTsx = await readFile(new URL('../src/components/organism/EmptyState.tsx', import.meta.url), 'utf8');
    assert.ok(emptyStateTsx.includes('EmptyStateVariant'), 'EmptyState must export EmptyStateVariant type');
    assert.ok(emptyStateTsx.includes('onboarding'), 'EmptyState must support onboarding variant');
    assert.ok(emptyStateTsx.includes('all-completed'), 'EmptyState must support all-completed variant');
    assert.ok(emptyStateTsx.includes('search-empty'), 'EmptyState must support search-empty variant');
    assert.ok(emptyStateTsx.includes('rest-day'), 'EmptyState must support rest-day variant');

    const iconsNamedTsx = await readFile(new URL('../src/components/icons/named-icons.tsx', import.meta.url), 'utf8');
    assert.ok(iconsNamedTsx.includes('RouteIcon'), 'named-icons must export RouteIcon');
    assert.ok(iconsNamedTsx.includes('CalendarPlusIcon'), 'named-icons must export CalendarPlusIcon');
    assert.ok(iconsNamedTsx.includes('HourglassIcon'), 'named-icons must export HourglassIcon');
    assert.ok(iconsNamedTsx.includes('ActivityIcon'), 'named-icons must export ActivityIcon');
  });

  await t.test('6. Anti-Burnout & Guilt-Free Copywriting Parity', () => {
    const locales = ['id', 'en'] as const;

    for (const loc of locales) {
      const dict = dictionaries[loc];
      assert.ok(dict.emptyStates, `${loc} must include emptyStates dictionary`);
      assert.ok(dict.emptyStates.onboardingTitle, `${loc} has onboardingTitle`);
      assert.ok(dict.emptyStates.onboardingBody, `${loc} has onboardingBody`);
      assert.ok(dict.emptyStates.onboardingAction, `${loc} has onboardingAction`);
      assert.ok(dict.emptyStates.allCompletedTitle, `${loc} has allCompletedTitle`);
      assert.ok(dict.emptyStates.allCompletedBody, `${loc} has allCompletedBody`);
      assert.ok(dict.emptyStates.allCompletedAction, `${loc} has allCompletedAction`);
      assert.ok(dict.emptyStates.searchEmptyTitle, `${loc} has searchEmptyTitle`);
      assert.ok(dict.emptyStates.searchEmptyBody, `${loc} has searchEmptyBody`);
      assert.ok(dict.emptyStates.searchEmptyAction, `${loc} has searchEmptyAction`);
      assert.ok(dict.emptyStates.restDayTitle, `${loc} has restDayTitle`);
      assert.ok(dict.emptyStates.restDayBody, `${loc} has restDayBody`);
      assert.ok(dict.emptyStates.restDayAction, `${loc} has restDayAction`);
    }

    // Indonesian Specifics
    assert.equal(idCopywriting.emptyStates.onboardingTitle, 'Mulai Hari dengan Ritme Tenang');
    assert.equal(idCopywriting.emptyStates.onboardingAction, '+ Tambah Tugas Pertama');
    assert.equal(idCopywriting.emptyStates.allCompletedTitle, 'Fokus Hari Ini Telah Tuntas');
    assert.equal(idCopywriting.emptyStates.allCompletedAction, 'Lihat Ringkasan Hari Ini');
    assert.equal(idCopywriting.emptyStates.allCompletedSecondaryAction, 'Tinjau Evaluasi Mingguan');
    assert.equal(idCopywriting.emptyStates.searchEmptyTitle, 'Tidak Menemukan Tugas Terkait');
    assert.equal(idCopywriting.emptyStates.searchEmptyAction, 'Reset Filter Pencarian');
    assert.equal(idCopywriting.emptyStates.restDayTitle, 'Waktunya Menjaga Kapasitas Energi');
    assert.equal(idCopywriting.emptyStates.restDayAction, 'Atur Jadwal Hari Berikutnya');

    // Anti-burnout check: "allCompleted" must NOT demand creating new tasks immediately
    assert.ok(
      !idCopywriting.emptyStates.allCompletedBody.includes('tambah') &&
      !idCopywriting.emptyStates.allCompletedBody.includes('harus') &&
      !idCopywriting.emptyStates.allCompletedBody.includes('lanjut'),
      'Completed body must affirm relief and rest, not demand more work'
    );
  });
});
