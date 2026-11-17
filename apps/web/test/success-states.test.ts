import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { successTokens } from '@focient/ui-tokens/success-token';
import { dictionaries, idCopywriting, enCopywriting } from '../src/components/i18n/copywriting.ts';

test('FoCient Success State, Calm Affirmation & Reversibility Suite', async (t) => {
  const css = await readFile(new URL('../src/components/components.css', import.meta.url), 'utf8');

  await t.test('1. Semantic Design Token Integration', () => {
    // Canonical DTCG tokens
    assert.equal(successTokens['success-surface-subtle'], '#ECFDF5');
    assert.equal(successTokens['success-border-subtle'], '#A7F3D0');
    assert.equal(successTokens['success-action-base'], '#059669');
    assert.equal(successTokens['success-text-bold'], '#065F46');
    assert.equal(successTokens['success-task-strikethrough'], '#94A3B8');
    assert.equal(successTokens['success-task-completed-opacity'], 0.6);
    assert.equal(successTokens['success-pop-scale-start'], 0.7);
    assert.equal(successTokens['success-pop-scale-end'], 1.0);
    assert.equal(successTokens['success-pop-duration'], '150ms');
    assert.equal(successTokens['success-toast-duration'], '4000ms');
    assert.equal(successTokens['success-button-transition-duration'], '600ms');

    // CSS variables in :root
    assert.ok(css.includes('--success-surface-subtle: #ECFDF5;'), 'CSS must define --success-surface-subtle');
    assert.ok(css.includes('--success-border-subtle: #A7F3D0;'), 'CSS must define --success-border-subtle');
    assert.ok(css.includes('--success-action-base: #059669;'), 'CSS must define --success-action-base');
    assert.ok(css.includes('--success-text-bold: #065F46;'), 'CSS must define --success-text-bold');
    assert.ok(css.includes('--success-task-strikethrough: #94A3B8;'), 'CSS must define --success-task-strikethrough');
    assert.ok(css.includes('--success-task-completed-opacity: 0.6;'), 'CSS must define --success-task-completed-opacity');
    assert.ok(css.includes('--success-pop-duration: 150ms;'), 'CSS must define --success-pop-duration');
    assert.ok(css.includes('--success-toast-duration: 4000ms;'), 'CSS must define --success-toast-duration');
    assert.ok(css.includes('--success-button-transition-duration: 600ms;'), 'CSS must define --success-button-transition-duration');
  });

  await t.test('2. Level 1: Micro-Interactive Checkmark (Pop Scale & Strikethrough)', () => {
    // Keyframe pop scale animation
    assert.ok(css.includes('@keyframes focient-check-pop'), 'CSS must define @keyframes focient-check-pop');
    assert.ok(css.includes('transform: scale(var(--success-pop-scale-start, 0.7));'), 'Pop starts at 0.7');
    assert.ok(css.includes('transform: scale(var(--success-pop-scale-end, 1.0));'), 'Pop ends at 1.0');

    // Checkbox box & icon styling
    assert.ok(css.includes('.focient-checkbox-box--success'), 'Checkbox must support success variant');
    assert.ok(css.includes('background-color: var(--success-action-base, #059669)'), 'Success checkbox filled with #059669');
    assert.ok(css.includes('animation: focient-check-pop var(--success-pop-duration, 150ms)'), 'Icon animates with pop keyframe in 150ms');

    // Strikethrough and opacity fade
    assert.ok(css.includes('.focient-checkbox-label--strikethrough'), 'CSS must define strikethrough label');
    assert.ok(css.includes('color: var(--success-task-strikethrough, #94A3B8);'), 'Strikethrough label must use neutral subtle #94A3B8');
    assert.ok(css.includes('.focient-card--completed'), 'CSS must define completed card container');
    assert.ok(css.includes('opacity: var(--success-task-completed-opacity, 0.6);'), 'Completed card opacity must be 0.6');
  });

  await t.test('3. Level 2: Transient Feedback (Success Toast with Reversibility Buffer)', () => {
    assert.ok(css.includes('.focient-toast--success'), 'CSS must define .focient-toast--success');
    assert.ok(css.includes('background-color: var(--success-surface-subtle, #ECFDF5)'), 'Toast background must be #ECFDF5');
    assert.ok(css.includes('border: 1px solid var(--success-border-subtle, #A7F3D0)'), 'Toast border must be 1px #A7F3D0');
    assert.ok(css.includes('color: var(--success-text-bold, #065F46)'), 'Toast text must be #065F46 (WCAG AAA)');
    assert.ok(css.includes('.focient-toast--success .focient-toast-action-btn'), 'Toast must have action button styling');
    assert.ok(css.includes('font-weight: 600'), 'Toast action button has semi-bold 600 weight');
  });

  await t.test('4. Level 3: Module & Inline Success (Daily Target Achievement Banner)', async () => {
    assert.ok(css.includes('.focient-success-banner'), 'CSS must define .focient-success-banner');
    assert.ok(css.includes('border-radius: var(--radius-lg, 12px)'), 'Banner must have 12px radius');
    assert.ok(css.includes('padding: var(--space-4, 16px)'), 'Banner must have 16px padding');

    const bannerTsx = await readFile(new URL('../src/components/organism/DailySuccessBanner.tsx', import.meta.url), 'utf8');
    assert.ok(bannerTsx.includes('role="status"'), 'DailySuccessBanner must have role="status" for screen readers');
    assert.ok(bannerTsx.includes('aria-live="polite"'), 'DailySuccessBanner must be polite (non-jarring)');
    assert.ok(bannerTsx.includes('dailyPillarCompletedTitle'), 'DailySuccessBanner uses localized title');
    assert.ok(bannerTsx.includes('dailyPillarCompletedBody'), 'DailySuccessBanner uses localized body');
  });

  await t.test('5. Level 4: Button Success Transformation', () => {
    assert.ok(css.includes('.focient-btn--success'), 'CSS must define .focient-btn--success');
    assert.ok(css.includes('background-color: var(--success-action-base, #059669)'), 'Success button must have #059669 background');
    assert.ok(css.includes('var(--success-button-transition-duration, 600ms)'), 'Success button transition must be 600ms');
    assert.ok(css.includes('.focient-btn-success-check'), 'Button must support success checkmark icon');
  });

  await t.test('6. Anti-Hyper-Gamified & Calm Affirmation Specification', () => {
    // Assert absence of noisy hyper-gamified anti-patterns
    assert.ok(!css.includes('confetti'), 'CSS must NOT contain confetti animations');
    assert.ok(!css.includes('fireworks'), 'CSS must NOT contain fireworks animations');
    assert.ok(!css.includes('modal--success-celebrate'), 'No intrusive full-screen success modals');

    // Assert reversibility buffer availability
    assert.equal(idCopywriting.successStates.undoAction, 'Urungkan');
    assert.equal(enCopywriting.successStates.undoAction, 'Undo');
  });

  await t.test('7. Bilingual Copywriting Parity', () => {
    const locales = ['id', 'en'] as const;

    for (const loc of locales) {
      const dict = dictionaries[loc];
      assert.ok(dict.successStates, `${loc} must include successStates`);
      assert.ok(dict.successStates.dailyPillarCompletedTitle, `${loc} has dailyPillarCompletedTitle`);
      assert.ok(dict.successStates.dailyPillarCompletedBody, `${loc} has dailyPillarCompletedBody`);
      assert.ok(dict.successStates.undoAction, `${loc} has undoAction`);
      assert.ok(dict.successStates.savedSuccess, `${loc} has savedSuccess`);
      assert.ok(dict.successStates.scheduleUpdated, `${loc} has scheduleUpdated`);
      assert.ok(typeof dict.successStates.taskCompletedUndo === 'function', `${loc} has taskCompletedUndo function`);
    }

    assert.equal(idCopywriting.successStates.dailyPillarCompletedTitle, 'Ritme Hari Ini Selesai');
    assert.equal(
      idCopywriting.successStates.dailyPillarCompletedBody,
      'Semua prioritas inti telah tuntas. Energi harianmu terpakai secara efektif tanpa beban berlebih.'
    );
    assert.equal(idCopywriting.successStates.savedSuccess, 'Tersimpan');
    assert.equal(idCopywriting.successStates.taskCompletedUndo('Review PR'), '"Review PR" selesai');

    assert.equal(enCopywriting.successStates.dailyPillarCompletedTitle, "Today's Rhythm Complete");
    assert.equal(
      enCopywriting.successStates.dailyPillarCompletedBody,
      'All core priorities accomplished. Your daily energy was spent effectively without overload.'
    );
    assert.equal(enCopywriting.successStates.savedSuccess, 'Saved');
    assert.equal(enCopywriting.successStates.taskCompletedUndo('Review PR'), '"Review PR" completed');
  });

  await t.test('8. Consolidated Canonical Directory Verification (src/components)', async () => {
    const componentsCss = await readFile(new URL('../src/components/components.css', import.meta.url), 'utf8');
    assert.ok(componentsCss.includes('.focient-btn--success'), 'components.css must define .focient-btn--success');

    const componentsBanner = await readFile(new URL('../src/components/organism/DailySuccessBanner.tsx', import.meta.url), 'utf8');
    assert.ok(componentsBanner.includes('DailySuccessBanner'), 'DailySuccessBanner.tsx must be in canonical components');

    const componentsCopy = await readFile(new URL('../src/components/i18n/copywriting.ts', import.meta.url), 'utf8');
    assert.ok(componentsCopy.includes('successStates'), 'copywriting.ts must be in canonical components');
  });
});
