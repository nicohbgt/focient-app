import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { motionTokens } from '@focient/ui-tokens/motion-token';
import { animationTokens } from '@focient/ui-tokens/animation-token';

test('FoCient Microinteraction System, Tactile & Motion Token Suite', async (t) => {
  const microCss = await readFile(new URL('../src/component/microinteractions.css', import.meta.url), 'utf8');
  const compCss = await readFile(new URL('../src/component/components.css', import.meta.url), 'utf8');

  await t.test('1. Foundational Motion Tokens & DTCG Standard Contracts', () => {
    // Canonical DTCG Timing Tokens in animation-token
    assert.equal(animationTokens['duration-instant'], '100ms');
    assert.equal(animationTokens['duration-fast'], '150ms');
    assert.equal(animationTokens['duration-normal'], '200ms');
    assert.equal(animationTokens['duration-moderate'], '250ms');
    assert.equal(animationTokens['duration-slow'], '300ms');
    assert.equal(animationTokens['duration-deliberate'], '400ms');

    // Canonical DTCG Motion Tokens
    assert.equal(motionTokens['motion-press-scale'], 0.98);
    assert.equal(motionTokens['motion-lift-subtle'], '-2px');
    assert.equal(motionTokens['motion-drag-scale'], 1.02);
    assert.equal(motionTokens['motion-drag-opacity'], 0.92);
    assert.equal(motionTokens['motion-modal-offset'], '16px');
    assert.equal(motionTokens['motion-sheet-handle-width'], '36px');
    assert.equal(motionTokens['motion-sheet-handle-height'], '4px');
    assert.equal(motionTokens['motion-breathe-duration'], '3000ms');
    assert.equal(motionTokens['motion-dot-size'], '8px');
    assert.equal(motionTokens['motion-drop-min-height'], '48px');
    assert.equal(motionTokens['motion-drop-border-width'], '2px');
    assert.equal(motionTokens['motion-focus-ring-width'], '2px');
    assert.equal(motionTokens['motion-focus-ring-offset'], '2px');
    assert.equal(motionTokens['motion-focus-ring-color'], '#BFDBFE');
    assert.equal(motionTokens['motion-chevron-rotation'], '180deg');
    assert.equal(motionTokens['motion-workload-threshold-light'], 50);
    assert.equal(motionTokens['motion-workload-threshold-optimal'], 75);
    assert.equal(motionTokens['motion-workload-threshold-near'], 90);
    assert.equal(motionTokens['motion-capacity-fill-duration'], '400ms');
    assert.equal(motionTokens['motion-haptic-duration'], '10ms');
    assert.equal(motionTokens['motion-reorder-duration'], '250ms');

    // Verify CSS variables in :root
    assert.ok(microCss.includes('--duration-instant:    100ms;'), 'microinteractions.css must define --duration-instant');
    assert.ok(microCss.includes('--duration-fast:       150ms;'), 'microinteractions.css must define --duration-fast');
    assert.ok(microCss.includes('--duration-normal:     200ms;'), 'microinteractions.css must define --duration-normal');
    assert.ok(microCss.includes('--duration-moderate:   250ms;'), 'microinteractions.css must define --duration-moderate');
    assert.ok(microCss.includes('--duration-slow:       300ms;'), 'microinteractions.css must define --duration-slow');
    assert.ok(microCss.includes('--duration-deliberate: 400ms;'), 'microinteractions.css must define --duration-deliberate');
    assert.ok(microCss.includes('--motion-press-scale: scale(0.98);'), 'microinteractions.css must define --motion-press-scale');
    assert.ok(microCss.includes('--motion-lift-subtle: translateY(-2px);'), 'microinteractions.css must define --motion-lift-subtle');
    assert.ok(microCss.includes('--motion-drag-scale: scale(1.02);'), 'microinteractions.css must define --motion-drag-scale');
  });

  await t.test('2. Microinteraction A: Tactile Press, Hover & Focus-Visible Ring', () => {
    assert.ok(microCss.includes('.focient-tactile'), 'Must define .focient-tactile');
    assert.ok(microCss.includes('.focient-interactive'), 'Must define .focient-interactive');
    assert.ok(microCss.includes(':active:not(:disabled)'), 'Must have :active:not(:disabled) rule');
    assert.ok(microCss.includes('transform: var(--motion-press-scale, scale(0.98))'), 'Active press scales to 0.98');
    assert.ok(microCss.includes(':focus-visible'), 'Must have :focus-visible rule');
    assert.ok(microCss.includes('outline: 2px solid var(--color-primary-track-base, #BFDBFE)'), 'Focus ring is 2px #BFDBFE');
    assert.ok(microCss.includes('outline-offset: 2px'), 'Focus ring offset is 2px (dual ring effect)');
  });

  await t.test('3. Microinteraction B & 2: Checkmark Popping & Strikethrough Fade', () => {
    assert.ok(microCss.includes('.focient-checkbox__icon'), 'Must define .focient-checkbox__icon');
    assert.ok(microCss.includes('.focient-task-card[data-completed="true"]'), 'Must target data-completed="true"');
    assert.ok(microCss.includes('opacity: 0.6'), 'Completed card opacity is 0.6');
    assert.ok(microCss.includes('text-decoration: line-through'), 'Completed title has strikethrough');
    assert.ok(microCss.includes('color: var(--color-neutral-text-subtle, #94A3B8)'), 'Completed title muted to #94A3B8');
  });

  await t.test('4. Microinteraction C & 8: In-Progress Current Time Dot & Breathe Animation', () => {
    assert.ok(microCss.includes('.focient-current-time-dot'), 'Must define .focient-current-time-dot');
    assert.ok(microCss.includes('animation: focient-breathe'), 'Dot animates with focient-breathe');
    assert.ok(microCss.includes('@keyframes focient-breathe'), 'Must define @keyframes focient-breathe');
    assert.ok(microCss.includes('transform: scale(1.25)'), 'Breathe cycle peaks at scale 1.25');
    assert.ok(microCss.includes('--motion-breathe-duration, 3000ms'), 'Breathe cycle is 3000ms');
  });

  await t.test('5. Microinteraction D & 3: Drag & Drop Active Card & Placeholder', () => {
    assert.ok(microCss.includes('.focient-task-card--dragging'), 'Must define .focient-task-card--dragging');
    assert.ok(microCss.includes('cursor: grabbing !important'), 'Dragging uses grabbing cursor');
    assert.ok(microCss.includes('transform: var(--motion-drag-scale, scale(1.02))'), 'Dragging card scales to 1.02');
    assert.ok(microCss.includes('opacity: 0.92'), 'Dragging card opacity is 0.92');
    assert.ok(microCss.includes('z-index: 50'), 'Dragging card elevated with z-index 50');

    assert.ok(microCss.includes('.focient-drop-placeholder'), 'Must define .focient-drop-placeholder');
    assert.ok(microCss.includes('border: 2px dashed var(--color-secondary-action-base, #0D9488)'), 'Drop placeholder is 2px dashed Teal');
    assert.ok(microCss.includes('background-color: var(--color-secondary-bg-subtle, #F0FDFA)'), 'Drop placeholder bg is #F0FDFA');
    assert.ok(microCss.includes('min-height: 48px'), 'Drop placeholder min-height is 48px');
  });

  await t.test('6. Microinteraction E & 4: Ripple Reorder Auto-Shift', () => {
    assert.ok(microCss.includes('.focient-timeline-slot'), 'Must define .focient-timeline-slot');
    assert.ok(microCss.includes('transition: transform var(--duration-moderate, 250ms) var(--ease-fluid)'), 'Ripple shift transition is 250ms ease-fluid');
  });

  await t.test('7. Microinteraction G & 5: Overlay & Mobile Bottom Sheet Transition', () => {
    assert.ok(microCss.includes('.focient-modal-backdrop'), 'Must define .focient-modal-backdrop');
    assert.ok(microCss.includes('background-color: rgba(15, 23, 42, 0.4)'), 'Modal backdrop scrim is rgba(15, 23, 42, 0.4)');
    assert.ok(microCss.includes('.focient-modal-content'), 'Must define .focient-modal-content');
    assert.ok(microCss.includes('.focient-modal--enter'), 'Must define .focient-modal--enter');
    assert.ok(microCss.includes('transform: translateY(0)'), 'Modal enter translates to 0');
    assert.ok(microCss.includes('.focient-modal--exit'), 'Must define .focient-modal--exit');
    assert.ok(microCss.includes('transform: translateY(16px)'), 'Modal exit translates to 16px');
    assert.ok(microCss.includes('.focient-bottom-sheet'), 'Must define .focient-bottom-sheet');
    assert.ok(microCss.includes('transform: translateY(100%)'), 'Bottom sheet initial is translateY(100%)');
  });

  await t.test('8. Microinteraction H & 6: Accordion Expand & Collapse (CSS Grid)', async () => {
    assert.ok(microCss.includes('.focient-accordion'), 'Must define .focient-accordion');
    assert.ok(microCss.includes('grid-template-rows: 0fr'), 'Accordion closed has grid-template-rows: 0fr');
    assert.ok(microCss.includes('grid-template-rows: 1fr'), 'Accordion expanded has grid-template-rows: 1fr');
    assert.ok(microCss.includes('transform: rotate(180deg)'), 'Chevron rotates 180deg when expanded');

    const accordionTsx = await readFile(new URL('../src/component/molecule/Accordion.tsx', import.meta.url), 'utf8');
    assert.ok(accordionTsx.includes('data-expanded={isExpanded}'), 'Accordion sets data-expanded attribute');
    assert.ok(accordionTsx.includes('aria-expanded={isExpanded}'), 'Accordion has aria-expanded accessibility');
    assert.ok(accordionTsx.includes('role="region"'), 'Accordion content has role="region"');
  });

  await t.test('9. Microinteraction I & 7: Dynamic Workload Thresholding (Capacity Meter)', async () => {
    assert.ok(microCss.includes('.focient-capacity-fill'), 'Must define .focient-capacity-fill');
    assert.ok(microCss.includes('font-variant-numeric: tabular-nums'), 'Capacity meter must use tabular figures');
    assert.ok(microCss.includes('transition: width var(--duration-deliberate, 400ms) var(--ease-fluid)'), 'Fill transition is 400ms deliberate');

    // Threshold attributes
    assert.ok(microCss.includes('.focient-capacity-fill[data-threshold="light"]'), 'Must support light threshold');
    assert.ok(microCss.includes('.focient-capacity-fill[data-threshold="optimal"]'), 'Must support optimal threshold');
    assert.ok(microCss.includes('.focient-capacity-fill[data-threshold="near"]'), 'Must support near threshold');
    assert.ok(microCss.includes('.focient-capacity-fill[data-threshold="overload"]'), 'Must support overload threshold');

    // Anti-Accusatory Rule: Overload MUST use Amber #D97706, strictly NO red!
    assert.ok(
      microCss.includes('.focient-capacity-fill[data-threshold="overload"] {\n  background-color: var(--color-warning-action-base, #D97706);\n}'),
      'Overload threshold must use Amber #D97706 and never red'
    );

    const capacityTsx = await readFile(new URL('../src/component/organism/DailyCapacityMeter.tsx', import.meta.url), 'utf8');
    assert.ok(capacityTsx.includes('data-threshold='), 'DailyCapacityMeter must render data-threshold attribute');
  });

  await t.test('10. WCAG 2.1 AAA: Prefers-Reduced-Motion Compliance', () => {
    assert.ok(microCss.includes('@media (prefers-reduced-motion: reduce)'), 'Must include prefers-reduced-motion media query');
    assert.ok(microCss.includes('animation-duration: 0.01ms !important;'), 'Reduced motion reduces animation duration to 0.01ms');
    assert.ok(microCss.includes('transition-duration: 0.01ms !important;'), 'Reduced motion reduces transition duration to 0.01ms');
    assert.ok(microCss.includes('transform: none !important;'), 'Reduced motion disables physical transforms');
  });

  await t.test('11. Dual-Directory Parity (src/component vs src/components)', async () => {
    const compMicroCss = await readFile(new URL('../src/component/microinteractions.css', import.meta.url), 'utf8');
    const compsMicroCss = await readFile(new URL('../src/components/microinteractions.css', import.meta.url), 'utf8');
    assert.equal(compMicroCss, compsMicroCss, 'microinteractions.css must be identical in both directories');

    const compAccordion = await readFile(new URL('../src/component/molecule/Accordion.tsx', import.meta.url), 'utf8');
    const compsAccordion = await readFile(new URL('../src/components/molecule/Accordion.tsx', import.meta.url), 'utf8');
    assert.equal(compAccordion, compsAccordion, 'Accordion.tsx must be identical in both directories');
  });
});
