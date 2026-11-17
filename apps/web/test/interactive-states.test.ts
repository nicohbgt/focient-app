import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Interactive & Responsive States Specification Compliance', async (t) => {
  const css = await readFile(new URL('../src/components/components.css', import.meta.url), 'utf8');

  await t.test('1. Platform Rules & Interaction Foundations', () => {
    // Area Sentuh (Hit-Target): Mobile >= 48px, Desktop 36px-40px
    assert.ok(css.includes('min-height: 48px'), 'Mobile hit target must be >= 48px min-height');
    assert.ok(css.includes('min-width: 48px'), 'Mobile hit target must be >= 48px min-width');
    assert.ok(css.includes('min-height: 36px') || css.includes('min-height: 40px'), 'Desktop hit target must support 36px-40px');

    // Status Hover: Scoped to pointer devices to avoid sticky mobile hover
    assert.ok(css.includes('@media (hover: hover) and (pointer: fine)'), 'Desktop hover must be protected with media query');

    // Status Tekan (Active/Pressed): transform scale(0.98)
    assert.ok(css.includes('scale(0.98)'), 'Active pressed state requires scale(0.98)');

    // Navigasi Keyboard (Focus-Visible): Double focus ring 2px solid #BFDBFE with 2px offset
    assert.ok(css.includes(':focus-visible'), 'Interactive controls must define :focus-visible');
    assert.ok(css.includes('outline: 2px solid #BFDBFE'), 'Focus-visible ring must use 2px solid #BFDBFE');
    assert.ok(css.includes('outline-offset: 2px'), 'Focus-visible ring must specify 2px offset');

    // Transisi Durasi & Easing: Reduced motion fallback
    assert.ok(css.includes('prefers-reduced-motion: reduce'), 'Must include reduced motion override');
  });

  await t.test('2. Primitives: Button States', () => {
    // Primary idle & hover & active
    assert.ok(css.includes('.focient-btn--primary'), 'Primary button class exists');
    assert.ok(css.includes('#2563EB'), 'Primary default uses #2563EB');
    assert.ok(css.includes('#1D4ED8'), 'Primary hover uses #1D4ED8');
    assert.ok(css.includes('#1E40AF'), 'Primary active reaches highest contrast #1E40AF');

    // Secondary idle & hover & active
    assert.ok(css.includes('.focient-btn--secondary'), 'Secondary button class exists');
    assert.ok(css.includes('#0D9488'), 'Secondary default uses #0D9488');
    assert.ok(css.includes('#0F766E'), 'Secondary hover uses #0F766E');
    assert.ok(css.includes('#115E59'), 'Secondary active reaches highest contrast #115E59');

    // Outline / Ghost
    assert.ok(css.includes('.focient-btn--outline'), 'Outline button class exists');
    assert.ok(css.includes('.focient-btn--ghost'), 'Ghost button class exists');

    // Disabled & Loading
    assert.ok(css.includes('cursor: not-allowed'), 'Disabled button uses cursor: not-allowed');
    assert.ok(css.includes('pointer-events: none'), 'Disabled button disables pointer events');
    assert.ok(css.includes('.focient-btn--loading'), 'Loading button class exists');
    assert.ok(css.includes('cursor: wait'), 'Loading button uses cursor: wait');
  });

  await t.test('3. Primitives: InputField States', () => {
    // Blinking blue caret
    assert.ok(css.includes('caret-color: var(--color-primary-action-base, #2563EB)'), 'InputField has blue caret-color');

    // Hover bolder border
    assert.ok(css.includes('var(--color-neutral-border-bold, #94A3B8)'), 'InputField hover uses bolder border #94A3B8');

    // Focus state 2px solid #2563EB
    assert.ok(css.includes('2px solid var(--color-primary-action-base, #2563EB)'), 'InputField focus has 2px solid #2563EB');

    // Error state & Helper text
    assert.ok(css.includes('.focient-input--error'), 'InputField error class exists');
    assert.ok(css.includes('var(--color-danger-action-base, #E11D48)'), 'InputField error border uses #E11D48');
    assert.ok(css.includes('.focient-input-helper--error'), 'Error helper class exists');
    assert.ok(css.includes('var(--color-danger-text-bold, #9F1239)'), 'Error helper text uses #9F1239');
  });

  await t.test('4. Primitives: Checkbox States', () => {
    // Visual 20x20
    assert.ok(css.includes('width: 20px') && css.includes('height: 20px'), 'Checkbox visual is 20px x 20px');

    // Hover halo
    assert.ok(css.includes('0 0 0 4px rgba(37, 99, 235, 0.12)'), 'Checkbox desktop hover has faded halo ring');

    // Active pressed scale(0.92)
    assert.ok(css.includes('scale(0.92)'), 'Checkbox active state uses scale(0.92)');

    // Checked pop-in scale(0.7) -> scale(1.0)
    assert.ok(css.includes('scale(0.7)'), 'Checkbox icon initial scale is 0.7');
    assert.ok(css.includes('scale(1.0)'), 'Checkbox icon checked scale is 1.0');

    // Strikethrough label
    assert.ok(css.includes('.focient-checkbox-label--strikethrough'), 'Checkbox has strikethrough label class');

    // Needs adjustment guilt-free state
    assert.ok(css.includes('.focient-checkbox-box--needs-adjustment'), 'Needs adjustment checkbox class exists');
    assert.ok(css.includes('var(--color-warning-action-base, #D97706)'), 'Needs adjustment uses Amber #D97706');
  });

  await t.test('5. Primitives: Chip, Radio & Toggle States', () => {
    // Chip
    assert.ok(css.includes('.focient-chip--selected'), 'Chip selected class exists');
    assert.ok(css.includes('.focient-chip-dismiss-btn'), 'Chip dismiss button exists');

    // Radio
    assert.ok(css.includes('.focient-radio-circle'), 'Radio circle class exists');
    assert.ok(css.includes('.focient-radio-dot'), 'Radio dot class exists');
    assert.ok(css.includes('.focient-radio-card--selected'), 'Radio card row selected class exists');

    // Toggle
    assert.ok(css.includes('.focient-toggle-track--checked'), 'Toggle track checked class exists');
    assert.ok(css.includes('width: 24px'), 'Toggle elastic thumb stretches to 24px on press');
  });

  await t.test('6. Primitives: Tooltip Calm UI States', () => {
    assert.ok(css.includes('.focient-tooltip-bubble'), 'Tooltip bubble class exists');
    assert.ok(css.includes('300ms'), 'Tooltip includes 300ms hover delay');
    assert.ok(css.includes('@media (hover: none)'), 'Tooltip is suppressed on mobile touch screens');
  });

  await t.test('7. Content & Organisms: TaskCard States', () => {
    // Hover lift & shadow level 2
    assert.ok(css.includes('translateY(-2px)'), 'TaskCard lifts -2px on desktop hover');
    assert.ok(css.includes('--shadow-2'), 'TaskCard uses shadow-2 on hover');

    // Ongoing focus state
    assert.ok(css.includes('.focient-card--single-focus'), 'Single focus card class exists');

    // Completed task card state (opacity 0.6 & strikethrough)
    assert.ok(css.includes('.focient-card--completed'), 'Completed task card class exists');
    assert.ok(css.includes('opacity: 0.6'), 'Completed card opacity drops to 0.6');

    // Adaptive reschedule card
    assert.ok(css.includes('.focient-card--reschedule'), 'Reschedule card class exists');

    // Dragging / Reorder state (cursor grabbing, scale 1.02, shadow 3)
    assert.ok(css.includes('.focient-task-card--dragging'), 'Dragging card class exists');
    assert.ok(css.includes('cursor: grabbing'), 'Dragging card uses cursor: grabbing');
    assert.ok(css.includes('scale(1.02)'), 'Dragging card micro-enlarges to scale(1.02)');
    assert.ok(css.includes('--shadow-3'), 'Dragging card uses floating shadow level 3');
  });

  await t.test('8. Content & Organisms: Daily Capacity Meter States', () => {
    assert.ok(css.includes('.focient-capacity-track'), 'Capacity track class exists');
    assert.ok(css.includes('.focient-capacity-track--light'), 'Capacity track light state class exists');
    assert.ok(css.includes('--duration-deliberate, 400ms'), 'Capacity fill transition uses 400ms duration');
  });

  await t.test('9. Content & Organisms: Modal & BottomSheet Enter / Exit Animations', () => {
    // Scrim enter & exit
    assert.ok(css.includes('.focient-modal-backdrop'), 'Modal backdrop class exists');
    assert.ok(css.includes('.focient-modal-backdrop--exiting'), 'Modal backdrop exiting class exists');
    assert.ok(css.includes('backdrop-filter: blur(4px)'), 'Scrim has 4px blur filter');

    // Desktop Centered Dialog
    assert.ok(css.includes('.focient-modal-dialog'), 'Desktop dialog class exists');
    assert.ok(css.includes('.focient-modal-dialog--exiting'), 'Desktop dialog exiting class exists');

    // Mobile Bottom Sheet
    assert.ok(css.includes('.focient-bottom-sheet'), 'Mobile bottom sheet class exists');
    assert.ok(css.includes('.focient-bottom-sheet--exiting'), 'Mobile bottom sheet exiting class exists');
    assert.ok(css.includes('.focient-bottom-sheet-handle'), 'Bottom sheet drag handle exists');
  });
});
