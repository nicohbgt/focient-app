import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { errorTokens } from '@focient/ui-tokens/error-token';
import { dictionaries, idCopywriting, enCopywriting } from '../src/components/i18n/copywriting.ts';

test('FoCient Error & Fail States Specification Compliance Suite', async (t) => {
  const css = await readFile(new URL('../src/components/components.css', import.meta.url), 'utf8');

  await t.test('1. Semantic Design Token Integration & WCAG AAA Contrast', () => {
    // Canonical error token mappings from DTCG
    assert.equal(errorTokens['error-surface-subtle'], '#FFF1F2');
    assert.equal(errorTokens['error-border-subtle'], '#FECDD3');
    assert.equal(errorTokens['error-border-action'], '#E11D48');
    assert.equal(errorTokens['error-border-width'], '2px');
    assert.equal(errorTokens['error-text-bold'], '#9F1239');
    assert.equal(errorTokens['error-text-muted'], '#64748B');
    assert.equal(errorTokens['error-icon-base'], '#E11D48');
    assert.equal(errorTokens['error-conflict-surface'], '#FFFBEB');
    assert.equal(errorTokens['error-conflict-border'], '#FDE68A');
    assert.equal(errorTokens['error-conflict-accent'], '#D97706');
    assert.equal(errorTokens['error-conflict-text'], '#92400E');
    assert.equal(errorTokens['error-shake-offset'], '4px');
    assert.equal(errorTokens['error-shake-duration'], '200ms');
    assert.equal(errorTokens['error-toast-duration'], '7000ms');
    assert.equal(errorTokens['error-helper-min-height'], '20px');

    // CSS variables registered in :root
    assert.ok(css.includes('--error-surface-subtle: #FFF1F2;'), 'CSS must define --error-surface-subtle');
    assert.ok(css.includes('--error-border-subtle: #FECDD3;'), 'CSS must define --error-border-subtle');
    assert.ok(css.includes('--error-border-action: #E11D48;'), 'CSS must define --error-border-action');
    assert.ok(css.includes('--error-text-bold: #9F1239;'), 'CSS must define --error-text-bold');
    assert.ok(css.includes('--error-conflict-surface: #FFFBEB;'), 'CSS must define --error-conflict-surface');
    assert.ok(css.includes('--error-conflict-accent: #D97706;'), 'CSS must define --error-conflict-accent');
    assert.ok(css.includes('--error-shake-offset: 4px;'), 'CSS must define --error-shake-offset');
    assert.ok(css.includes('--error-shake-duration: 200ms;'), 'CSS must define --error-shake-duration');
    assert.ok(css.includes('--error-toast-duration: 7000ms;'), 'CSS must define --error-toast-duration');
    assert.ok(css.includes('--error-helper-min-height: 20px;'), 'CSS must define --error-helper-min-height');
  });

  await t.test('2. Level 1: Micro Action Fail (Button Shake & Danger Toast)', () => {
    // Button shake keyframe animation
    assert.ok(css.includes('@keyframes focient-shake'), 'CSS must define @keyframes focient-shake');
    assert.ok(css.includes('.focient-btn--shake'), 'CSS must define .focient-btn--shake');
    assert.ok(css.includes('--error-shake-duration'), 'Shake animation must use --error-shake-duration');
    assert.ok(css.includes('--error-shake-offset'), 'Shake animation must use --error-shake-offset');

    // Reduced motion safety
    assert.ok(css.includes('prefers-reduced-motion: reduce'), 'Must have prefers-reduced-motion guard');

    // Danger toast styling
    assert.ok(css.includes('.focient-toast--danger'), 'CSS must define .focient-toast--danger');
    assert.ok(css.includes('var(--error-surface-subtle, #FFF1F2)'), 'Danger toast must use subtle red surface');
    assert.ok(css.includes('var(--error-border-subtle, #FECDD3)'), 'Danger toast must use subtle border');
    assert.ok(css.includes('var(--error-text-bold, #9F1239)'), 'Danger toast must use WCAG AAA text color');
  });

  await t.test('3. Level 2: Input Field Validation & Zero Layout Shift', () => {
    // 2px border and active danger token
    assert.ok(css.includes('.focient-input--error'), 'InputField must have .focient-input--error');
    assert.ok(css.includes('--error-border-width'), 'InputField error border must use --error-border-width');
    assert.ok(css.includes('--error-border-action'), 'InputField error border must use --error-border-action');

    // Zero layout shift container
    assert.ok(css.includes('.focient-input-helper-container'), 'CSS must define .focient-input-helper-container');
    assert.ok(css.includes('--error-helper-min-height'), 'Container must reserve space with --error-helper-min-height');

    // Multi-sensory trailing alert icon
    assert.ok(css.includes('.focient-input-trailing-alert'), 'CSS must define .focient-input-trailing-alert');
    assert.ok(css.includes('--error-icon-base'), 'Trailing alert icon must use --error-icon-base');
    assert.ok(css.includes('.focient-input-helper--error'), 'Error helper class must exist');
    assert.ok(css.includes('--error-text-bold'), 'Error helper text must use --error-text-bold');
  });

  await t.test('4. Level 3: Module / Component Inline Fail', () => {
    assert.ok(css.includes('.focient-inline-fail'), 'CSS must define .focient-inline-fail');
    assert.ok(css.includes('.focient-inline-fail-icon'), 'CSS must define .focient-inline-fail-icon');
    assert.ok(css.includes('.focient-inline-fail-title'), 'CSS must define .focient-inline-fail-title');
    assert.ok(css.includes('.focient-inline-fail-body'), 'CSS must define .focient-inline-fail-body');
  });

  await t.test('5. Level 4: Data Conflict / Sync Fail (Calming Amber Tokens)', () => {
    assert.ok(css.includes('.focient-sync-conflict-banner'), 'CSS must define .focient-sync-conflict-banner');
    assert.ok(css.includes('var(--error-conflict-surface, #FFFBEB)'), 'Conflict banner must use warm amber surface');
    assert.ok(css.includes('var(--error-conflict-border, #FDE68A)'), 'Conflict banner must use amber border');
    assert.ok(css.includes('var(--error-conflict-accent, #D97706)'), 'Conflict banner must use amber accent');
    assert.ok(css.includes('var(--error-conflict-text, #92400E)'), 'Conflict banner must use high-contrast amber text');
  });

  await t.test('6. Level 5: Full-View / Page-Level Error', () => {
    assert.ok(css.includes('.focient-fullview-error'), 'CSS must define .focient-fullview-error');
    assert.ok(css.includes('.focient-fullview-icon'), 'CSS must define .focient-fullview-icon');
    assert.ok(css.includes('.focient-fullview-title'), 'CSS must define .focient-fullview-title');
    assert.ok(css.includes('.focient-fullview-body'), 'CSS must define .focient-fullview-body');
    assert.ok(css.includes('var(--space-16, 64px)'), 'Full view must use spacious whitespace');
  });

  await t.test('7. Component Structure & Export Verification', async () => {
    const organismIndex = await readFile(new URL('../src/components/organism/index.ts', import.meta.url), 'utf8');
    assert.ok(organismIndex.includes('InlineModuleFail'), 'Organism index must export InlineModuleFail');
    assert.ok(organismIndex.includes('SyncConflictAlert'), 'Organism index must export SyncConflictAlert');
    assert.ok(organismIndex.includes('FullViewError'), 'Organism index must export FullViewError');

    const buttonTsx = await readFile(new URL('../src/components/primitive/Button.tsx', import.meta.url), 'utf8');
    assert.ok(buttonTsx.includes('shake?: boolean'), 'ButtonProps must support shake prop');
    assert.ok(buttonTsx.includes('focient-btn--shake'), 'Button must apply focient-btn--shake class');

    const inputTsx = await readFile(new URL('../src/components/primitive/InputField.tsx', import.meta.url), 'utf8');
    assert.ok(inputTsx.includes('focient-input-trailing-alert'), 'InputField must render trailing alert icon');
    assert.ok(inputTsx.includes('focient-input-helper-container'), 'InputField must wrap helper in zero-layout-shift container');
    assert.ok(inputTsx.includes('aria-invalid='), 'InputField must maintain aria-invalid accessibility attribute');
    assert.ok(inputTsx.includes('aria-describedby='), 'InputField must maintain aria-describedby accessibility attribute');
  });

  await t.test('8. Anti-Accusatory Copywriting & Multi-Language Dictionary Parity', () => {
    const locales = ['id', 'en'] as const;

    for (const loc of locales) {
      const dict = dictionaries[loc];
      assert.ok(dict.errorStates, `${loc} must include errorStates subtree`);
      assert.ok(dict.errorStates.microFailToast, `${loc} must have microFailToast`);
      assert.ok(dict.errorStates.retryAction, `${loc} must have retryAction`);
      assert.ok(dict.errorStates.moduleFailTitle, `${loc} must have moduleFailTitle`);
      assert.ok(dict.errorStates.moduleFailBody, `${loc} must have moduleFailBody`);
      assert.ok(dict.errorStates.reloadModuleAction, `${loc} must have reloadModuleAction`);
      assert.ok(dict.errorStates.syncConflictTitle, `${loc} must have syncConflictTitle`);
      assert.ok(dict.errorStates.syncConflictBody, `${loc} must have syncConflictBody`);
      assert.ok(dict.errorStates.useLatestVersionAction, `${loc} must have useLatestVersionAction`);
      assert.ok(dict.errorStates.keepDraftAction, `${loc} must have keepDraftAction`);
      assert.ok(dict.errorStates.fullViewTitle, `${loc} must have fullViewTitle`);
      assert.ok(dict.errorStates.fullViewBody, `${loc} must have fullViewBody`);
      assert.ok(dict.errorStates.fullViewAction, `${loc} must have fullViewAction`);
    }

    // Indonesian Guilt-Free UX Writing Check
    assert.equal(
      idCopywriting.errorStates.microFailToast,
      'Perubahan belum tersimpan. Draf kamu tetap aman di perangkat.'
    );
    assert.equal(idCopywriting.errorStates.retryAction, 'Coba Lagi');
    assert.equal(idCopywriting.errorStates.moduleFailTitle, 'Modul Belum Dapat Dimuat');
    assert.equal(idCopywriting.errorStates.syncConflictTitle, 'Ditemukan Penyesuaian Jadwal Terbaru');
    assert.equal(idCopywriting.errorStates.fullViewTitle, 'Sistem Sedang Menyesuaikan Diri');
    assert.equal(idCopywriting.errorStates.fullViewAction, 'Periksa Jaringan & Muat Ulang');

    // English Guilt-Free UX Writing Check
    assert.equal(
      enCopywriting.errorStates.microFailToast,
      "Changes couldn't be saved. Your draft remains safe on this device."
    );
    assert.equal(enCopywriting.errorStates.retryAction, 'Try Again');
    assert.equal(enCopywriting.errorStates.fullViewTitle, 'System Is Adjusting');
  });
});
