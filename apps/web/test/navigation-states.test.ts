import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { idCopywriting, enCopywriting } from '../src/components/i18n/copywriting.ts';

test('FoCient Navigation Component & Data-Driven State Specification Compliance', async (t) => {
  const css = await readFile(new URL('../src/components/components.css', import.meta.url), 'utf8');

  await t.test('1. Responsive Breakpoint Strategy & Geometry Tokens', () => {
    // Desktop >= 1024px expanded sidebar 260px
    assert.ok(css.includes('.focient-side-nav--expanded'), 'Expanded sidebar class must exist');
    assert.ok(css.includes('width: 260px'), 'Canonical desktop sidebar width must be 260px');

    // Tablet 600px-1023px collapsed rail 72px
    assert.ok(css.includes('.focient-side-nav--collapsed'), 'Collapsed sidebar rail class must exist');
    assert.ok(css.includes('width: 72px'), 'Tablet rail width must be 72px');

    // Mobile BottomNav <= 600px
    assert.ok(css.includes('.focient-bottom-nav'), 'Bottom nav container must exist');
    assert.ok(css.includes('height: 64px') || css.includes('height: 60px'), 'Bottom nav height specification');
    assert.ok(css.includes('padding-bottom: env(safe-area-inset-bottom)'), 'Bottom nav must protect safe area inset');
  });

  await t.test('2. Scrolled Header Elevation & Zero Layout Shift', () => {
    // Top nav resting sticky & scrolled backdrop-blur
    assert.ok(css.includes('.focient-top-nav--scrolled'), 'Scrolled header elevation class must exist');
    assert.ok(css.includes('backdrop-filter: blur(8px)'), 'Scrolled header must apply backdrop-filter blur 8px');
    assert.ok(css.includes('rgba(255, 255, 255, 0.95)'), 'Scrolled header must use high-opacity white background');
    assert.ok(css.includes('position: sticky'), 'Top navigation must be sticky');
    assert.ok(css.includes('top: 0'), 'Sticky top nav positioned at 0');
  });

  await t.test('3. Date Navigator / Timeline Switcher Specs', () => {
    assert.ok(css.includes('.focient-date-navigator'), 'Date navigator container must exist');
    assert.ok(css.includes('.focient-date-nav-btn'), 'Date navigator button class must exist');
    assert.ok(css.includes('.focient-date-nav-pill'), 'Date navigator center pill class must exist');
  });

  await t.test('4. Sidebar Interactive States & 3px Active Indicator', () => {
    // Hover: #F1F5F9, 150ms
    assert.ok(css.includes('.focient-nav-item:hover'), 'Nav item hover selector must exist');
    assert.ok(css.includes('#F1F5F9'), 'Nav item hover uses calming neutral surface #F1F5F9');

    // Active: #EFF6FF bg, #1E3A8A text, 3px solid #2563EB vertical bar on left edge
    assert.ok(css.includes('.focient-nav-item--active'), 'Active nav item class must exist');
    assert.ok(css.includes('#EFF6FF'), 'Active nav item uses subtle cobalt background #EFF6FF');
    assert.ok(css.includes('#1E3A8A'), 'Active nav item uses bold primary text #1E3A8A');
    assert.ok(css.includes('border-left: 3px solid var(--color-primary-action-base, #2563EB)'), 'Active item must feature 3px solid #2563EB indicator bar');

    // Focus-Visible: 2px solid #BFDBFE, offset 2px
    assert.ok(css.includes('.focient-nav-item:focus-visible'), 'Nav item focus-visible state must exist');
    assert.ok(css.includes('outline: 2px solid #BFDBFE'), 'Nav item focus ring must be 2px solid #BFDBFE');
    assert.ok(css.includes('outline-offset: 2px'), 'Nav item focus offset must be 2px');

    // Micro-badge with tabular nums
    assert.ok(css.includes('.focient-nav-item-badge'), 'Micro-badge class must exist');
    assert.ok(css.includes('tabular-nums'), 'Micro-badge must use tabular-nums font variant');
  });

  await t.test('5. Tablet Rail Anti-Flicker Tooltip (300ms delay)', () => {
    assert.ok(css.includes('[data-tooltip]::after'), 'Tooltip pseudo-element selector must exist');
    assert.ok(css.includes('300ms'), 'Tooltip must use 300ms transition delay to prevent flickering');
    assert.ok(css.includes('pointer-events: none'), 'Tooltip must not steal pointer events');
  });

  await t.test('6. Mobile Bottom Nav Touch-Safety, 4px Active Dot & Keyboard Auto-Hide', () => {
    // Touch target >= 48px
    assert.ok(css.includes('min-width: 48px'), 'Bottom nav item min-width must be >= 48px');
    assert.ok(css.includes('min-height: 48px'), 'Bottom nav item min-height must be >= 48px');

    // Active 4px micro-dot below label
    assert.ok(css.includes('.focient-bottom-nav-dot'), 'Bottom nav 4px active micro-dot class must exist');
    assert.ok(css.includes('width: 4px'), 'Active dot width must be 4px');
    assert.ok(css.includes('height: 4px'), 'Active dot height must be 4px');

    // Tactile scale feedback
    assert.ok(css.includes('.focient-bottom-nav-item:active'), 'Bottom nav active touch feedback must exist');
    assert.ok(css.includes('scale(0.95)'), 'Bottom nav active item scales down to 0.95');

    // Keyboard Auto-Hide translation
    assert.ok(css.includes('.focient-bottom-nav--hidden'), 'Keyboard auto-hide class must exist');
    assert.ok(css.includes('transform: translateY(100%)'), 'Auto-hide must translate bottom nav by 100%');
  });

  await t.test('7. Command Palette Modal Specification', () => {
    assert.ok(css.includes('.focient-command-palette-backdrop'), 'Command palette backdrop must exist');
    assert.ok(css.includes('.focient-command-palette'), 'Command palette modal container must exist');
    assert.ok(css.includes('max-width: 580px'), 'Command palette max-width specification');
    assert.ok(css.includes('.focient-command-palette-search'), 'Command palette search bar must exist');
    assert.ok(css.includes('.focient-command-palette-item--selected'), 'Command palette selected item class must exist');
  });

  await t.test('8. Guilt-Free Context Preservation Dialog Specification', () => {
    assert.ok(css.includes('.focient-preservation-backdrop'), 'Context preservation backdrop must exist');
    assert.ok(css.includes('.focient-preservation-dialog'), 'Context preservation dialog container must exist');
    assert.ok(css.includes('.focient-preservation-actions'), 'Context preservation actions container must exist');
  });

  await t.test('9. Canonical Organism Exports Verification', async () => {
    const navBarTs = await readFile(new URL('../src/components/organism/NavBar.tsx', import.meta.url), 'utf8');
    assert.ok(navBarTs.includes('export const TopNavBar'), 'NavBar.tsx must export TopNavBar');
    assert.ok(navBarTs.includes('export const SideNavBar'), 'NavBar.tsx must export SideNavBar');
    assert.ok(navBarTs.includes('export const BottomNavBar'), 'NavBar.tsx must export BottomNavBar');

    const cmdPaletteTs = await readFile(new URL('../src/components/organism/CommandPalette.tsx', import.meta.url), 'utf8');
    assert.ok(cmdPaletteTs.includes('export const CommandPalette'), 'CommandPalette.tsx must export CommandPalette');

    const preservationTs = await readFile(new URL('../src/components/organism/ContextPreservationDialog.tsx', import.meta.url), 'utf8');
    assert.ok(preservationTs.includes('export const ContextPreservationDialog'), 'ContextPreservationDialog.tsx must export ContextPreservationDialog');

    const indexTs = await readFile(new URL('../src/components/organism/index.ts', import.meta.url), 'utf8');
    assert.ok(indexTs.includes("export * from './NavBar.js'"), 'organism/index.ts must export NavBar');
    assert.ok(indexTs.includes("export * from './CommandPalette.js'"), 'organism/index.ts must export CommandPalette');
    assert.ok(indexTs.includes("export * from './ContextPreservationDialog.js'"), 'organism/index.ts must export ContextPreservationDialog');
  });

  await t.test('10. Bilingual Copywriting Integrity & Zero Punitive Vocabulary', () => {
    const navId = idCopywriting.navigation;
    const navEn = enCopywriting.navigation;

    // Check key parity
    assert.ok(navId.dashboard && navEn.dashboard, 'Dashboard key must exist in ID and EN');
    assert.ok(navId.reschedule && navEn.reschedule, 'Reschedule key must exist in ID and EN');
    assert.ok(navId.dateToday && navEn.dateToday, 'DateToday key must exist in ID and EN');
    assert.ok(navId.commandPaletteTitle && navEn.commandPaletteTitle, 'CommandPaletteTitle key must exist in ID and EN');
    assert.ok(navId.commandPalettePlaceholder && navEn.commandPalettePlaceholder, 'CommandPalettePlaceholder key must exist in ID and EN');
    assert.ok(navId.draftPreservationTitle && navEn.draftPreservationTitle, 'DraftPreservationTitle key must exist in ID and EN');
    assert.ok(navId.draftPreservationMessage && navEn.draftPreservationMessage, 'DraftPreservationMessage key must exist in ID and EN');
    assert.ok(navId.draftPreservationSave && navEn.draftPreservationSave, 'DraftPreservationSave key must exist in ID and EN');
    assert.ok(navId.draftPreservationDiscard && navEn.draftPreservationDiscard, 'DraftPreservationDiscard key must exist in ID and EN');
    assert.ok(navId.draftPreservationCancel && navEn.draftPreservationCancel, 'DraftPreservationCancel key must exist in ID and EN');

    // Check zero punitive words
    const allNavTexts = [
      ...Object.values(navId).filter((v) => typeof v === 'string'),
      ...Object.values(navEn).filter((v) => typeof v === 'string'),
    ].join(' ').toLowerCase();

    assert.ok(!allNavTexts.includes('terlambat'), 'Zero punitive word "terlambat"');
    assert.ok(!allNavTexts.includes('gagal'), 'Zero punitive word "gagal"');
    assert.ok(!allNavTexts.includes('hukuman'), 'Zero punitive word "hukuman"');
    assert.ok(!allNavTexts.includes('punish'), 'Zero punitive word "punish"');
    assert.ok(!allNavTexts.includes('late'), 'Zero punitive word "late"');
    assert.ok(!allNavTexts.includes('failed'), 'Zero punitive word "failed"');
  });
});
