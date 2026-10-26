import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadingTokens } from '@focient/ui-tokens/loading-token';
import { dictionaries, idCopywriting, enCopywriting } from '../src/component/i18n/copywriting.ts';

test('FoCient Loading State, Skeleton Shimmer & CLS Compliance Suite', async (t) => {
  const css = await readFile(new URL('../src/component/components.css', import.meta.url), 'utf8');

  await t.test('1. Semantic Design Token Integration', () => {
    // Canonical DTCG tokens
    assert.equal(loadingTokens['loading-skeleton-base'], '#F1F5F9');
    assert.equal(loadingTokens['loading-skeleton-shimmer'], 'rgba(255, 255, 255, 0.65)');
    assert.equal(loadingTokens['loading-skeleton-radius'], '4px');
    assert.equal(loadingTokens['loading-progress-bar-color'], '#2563EB');
    assert.equal(loadingTokens['loading-progress-bar-height'], '3px');
    assert.equal(loadingTokens['loading-sync-accent'], '#0D9488');
    assert.equal(loadingTokens['loading-sync-surface'], '#F0FDFA');
    assert.equal(loadingTokens['loading-sync-border'], '#CCFBF1');
    assert.equal(loadingTokens['loading-sync-text'], '#0F766E');
    assert.equal(loadingTokens['loading-duration-shimmer'], '1600ms');
    assert.equal(loadingTokens['loading-duration-spin'], '700ms');
    assert.equal(loadingTokens['loading-duration-sync-spin'], '1500ms');

    // CSS variables registered in :root
    assert.ok(css.includes('--loading-skeleton-base: #F1F5F9;'), 'CSS must define --loading-skeleton-base');
    assert.ok(css.includes('--loading-skeleton-shimmer: rgba(255, 255, 255, 0.65);'), 'CSS must define --loading-skeleton-shimmer');
    assert.ok(css.includes('--loading-progress-bar-color: #2563EB;'), 'CSS must define --loading-progress-bar-color');
    assert.ok(css.includes('--loading-progress-bar-height: 3px;'), 'CSS must define --loading-progress-bar-height');
    assert.ok(css.includes('--loading-sync-accent: #0D9488;'), 'CSS must define --loading-sync-accent');
    assert.ok(css.includes('--loading-duration-shimmer: 1600ms;'), 'CSS must define --loading-duration-shimmer');
    assert.ok(css.includes('--loading-duration-sync-spin: 1500ms;'), 'CSS must define --loading-duration-sync-spin');
  });

  await t.test('2. Micro Action Loading (Button Spinner & Double-Submit Guard)', () => {
    assert.ok(css.includes('.focient-btn--loading'), 'Button must have .focient-btn--loading class');
    assert.ok(css.includes('cursor: wait'), 'Loading button must display wait cursor');
    assert.ok(css.includes('pointer-events: none'), 'Loading button must lock pointer events to prevent double submission');
    assert.ok(css.includes('.focient-btn-spinner'), 'Button must define .focient-btn-spinner');
    assert.ok(css.includes('border-top-color: currentColor'), 'Spinner must use currentColor to align with button variant');
    assert.ok(css.includes('.focient-btn--sm .focient-btn-spinner'), 'Small button must have dedicated 16px spinner');
  });

  await t.test('3. Structural Shimmer & Skeleton Specification', () => {
    // Keyframe shimmer wave
    assert.ok(css.includes('@keyframes focient-shimmer'), 'CSS must define @keyframes focient-shimmer');
    assert.ok(css.includes('background-position: -200% 0'), 'Shimmer starts at -200%');
    assert.ok(css.includes('background-position: 200% 0'), 'Shimmer ends at 200%');

    // Base skeleton class
    assert.ok(css.includes('.focient-skeleton'), 'CSS must define .focient-skeleton');
    assert.ok(css.includes('background-size: 200% 100%'), 'Skeleton gradient size must be 200%');
    assert.ok(css.includes('--loading-duration-shimmer'), 'Skeleton must use --loading-duration-shimmer token');

    // Geometric variants
    assert.ok(css.includes('.focient-skeleton--circle'), 'Must support circle variant');
    assert.ok(css.includes('.focient-skeleton--card'), 'Must support card variant');
    assert.ok(css.includes('.focient-skeleton--text'), 'Must support text variant');
    assert.ok(css.includes('.focient-skeleton--title'), 'Must support title variant');
    assert.ok(css.includes('.focient-skeleton--badge'), 'Must support badge variant');

    // Dark Mode Support
    assert.ok(css.includes('[data-theme="dark"] .focient-skeleton'), 'Must define dark mode skeleton gradient');
    assert.ok(css.includes('#1E293B'), 'Dark mode skeleton must use Deep Slate base fill #1E293B');

    // Reduced motion safety
    assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'), 'Skeleton must respect prefers-reduced-motion');
  });

  await t.test('4. Global Micro Progress Bar Specification', () => {
    assert.ok(css.includes('.focient-top-progress-bar'), 'CSS must define .focient-top-progress-bar');
    assert.ok(css.includes('position: fixed'), 'Top bar must be fixed at the top of the viewport');
    assert.ok(css.includes('height: var(--loading-progress-bar-height, 3px)'), 'Top bar must be 3px micro height');
    assert.ok(css.includes('.focient-top-progress-bar-indicator--indeterminate'), 'Top bar must support indeterminate mode');
  });

  await t.test('5. Adaptive Background Sync Badge Specification', () => {
    assert.ok(css.includes('.focient-sync-indicator'), 'CSS must define .focient-sync-indicator');
    assert.ok(css.includes('border-radius: var(--radius-full, 9999px)'), 'Sync badge must be a pill');
    assert.ok(css.includes('.focient-sync-spin-icon'), 'CSS must define .focient-sync-spin-icon');
    assert.ok(css.includes('--loading-duration-sync-spin'), 'Sync icon must rotate calmly with 1500ms duration');
  });

  await t.test('6. Component Structure & Export Verification', async () => {
    const primitiveIndex = await readFile(new URL('../src/component/primitive/index.ts', import.meta.url), 'utf8');
    assert.ok(primitiveIndex.includes('Skeleton'), 'primitive/index.ts must export Skeleton');

    const organismIndex = await readFile(new URL('../src/component/organism/index.ts', import.meta.url), 'utf8');
    assert.ok(organismIndex.includes('TaskCardSkeleton'), 'organism/index.ts must export TaskCardSkeleton');
    assert.ok(organismIndex.includes('CapacityMeterSkeleton'), 'organism/index.ts must export CapacityMeterSkeleton');
    assert.ok(organismIndex.includes('AdaptiveSyncBadge'), 'organism/index.ts must export AdaptiveSyncBadge');
    assert.ok(organismIndex.includes('TopProgressBar'), 'organism/index.ts must export TopProgressBar');

    const taskSkeletonTsx = await readFile(new URL('../src/component/organism/TaskCardSkeleton.tsx', import.meta.url), 'utf8');
    assert.ok(taskSkeletonTsx.includes('focient-task-card'), 'TaskCardSkeleton must reuse .focient-task-card for CLS parity');

    const capacitySkeletonTsx = await readFile(new URL('../src/component/organism/CapacityMeterSkeleton.tsx', import.meta.url), 'utf8');
    assert.ok(capacitySkeletonTsx.includes('padding: \'16px\''), 'CapacityMeterSkeleton must match 16px padding');
  });

  await t.test('7. Anti-Anxiety & Supportive Copywriting Parity', () => {
    const locales = ['id', 'en'] as const;

    for (const loc of locales) {
      const dict = dictionaries[loc];
      assert.ok(dict.loadingStates, `${loc} must include loadingStates dictionary`);
      assert.ok(dict.loadingStates.syncingTimeline, `${loc} has syncingTimeline`);
      assert.ok(dict.loadingStates.savingChanges, `${loc} has savingChanges`);
      assert.ok(dict.loadingStates.optimizingSchedule, `${loc} has optimizingSchedule`);
    }

    assert.equal(idCopywriting.loadingStates.syncingTimeline, 'Menyesuaikan ritme linimasa...');
    assert.equal(enCopywriting.loadingStates.syncingTimeline, 'Adjusting timeline rhythm...');

    // Anti-anxiety check: copywriting must NOT use stressful technical server jargon
    assert.ok(
      !idCopywriting.loadingStates.syncingTimeline.includes('server') &&
      !idCopywriting.loadingStates.syncingTimeline.includes('API') &&
      !idCopywriting.loadingStates.syncingTimeline.includes('database'),
      'Copywriting must be supportive and human-centric, avoiding technical stress'
    );
  });
});
