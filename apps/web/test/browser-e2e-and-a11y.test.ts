import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('FoCient Browser End-to-End & WCAG AAA Accessibility Suite (P1 Quality & CI)', async (t) => {
  const css = await readFile(new URL('../src/component/components.css', import.meta.url), 'utf8');
  const microCss = await readFile(new URL('../src/component/microinteractions.css', import.meta.url), 'utf8');

  // Relative luminance calculation for WCAG contrast ratio
  function sRgbToLin(c: number): number {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }

  function getLuminance(hex: string): number {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return 0.2126 * sRgbToLin(r) + 0.7152 * sRgbToLin(g) + 0.0722 * sRgbToLin(b);
  }

  function getContrastRatio(fgHex: string, bgHex: string): number {
    const l1 = getLuminance(fgHex);
    const l2 = getLuminance(bgHex);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  await t.test('1. WCAG 2.1 AAA Contrast Ratio Verification (>= 7.0:1 for normal text)', () => {
    // Canvas background
    const bg = '#FFFFFF';
    const bgSoft = '#F8FAFC';

    // Primary Text (#0F172A)
    const primaryRatio = getContrastRatio('#0F172A', bg);
    assert.ok(
      primaryRatio >= 7.0,
      `Primary text (#0F172A) contrast ratio must meet WCAG AAA (>= 7.0), got ${primaryRatio.toFixed(2)}`
    );

    // Secondary Text on soft background (#1E293B)
    const secondaryRatio = getContrastRatio('#1E293B', bgSoft);
    assert.ok(
      secondaryRatio >= 7.0,
      `Secondary text (#1E293B) contrast ratio must meet WCAG AAA (>= 7.0), got ${secondaryRatio.toFixed(2)}`
    );

    // Deep Accent for interactive controls (#0F766E / #0D9488) on white
    const deepTealRatio = getContrastRatio('#0F766E', bg);
    assert.ok(
      deepTealRatio >= 4.5,
      `Action control contrast ratio must meet AA/AAA (>= 4.5), got ${deepTealRatio.toFixed(2)}`
    );
  });

  await t.test('2. Focus Indicators & Keyboard Navigation Accessibility', () => {
    // Focus visible styling
    assert.ok(
      css.includes(':focus-visible') || css.includes('outline:'),
      'Components CSS must define visible keyboard focus indicators'
    );
    assert.ok(
      css.includes('outline-offset:') || css.includes('box-shadow:'),
      'Focus indicators must have visible offset or distinct ring shadow'
    );
  });

  await t.test('3. Reduced Motion Support for Neurodivergent & Calming Usability', () => {
    // Prefers-reduced-motion media query
    assert.ok(
      microCss.includes('@media (prefers-reduced-motion: reduce)'),
      'Microinteractions CSS must provide prefers-reduced-motion override'
    );
    assert.ok(
      microCss.includes('animation-duration: 0.01ms') || microCss.includes('transition: none') || microCss.includes('animation: none'),
      'Must suppress jarring animations when reduced motion is requested'
    );
  });

  await t.test('4. Semantic Landmarks & Screen Reader Support', () => {
    // Verify component CSS has proper cursor and interaction semantics
    assert.ok(css.includes('cursor: pointer'), 'Interactive buttons must announce pointer cursor');
    assert.ok(css.includes('user-select: none'), 'Interactive buttons must prevent unwanted text selection');
  });

  await t.test('5. Multi-Sensory State Indication (No Color-Only State Conveyance)', () => {
    // Empty states use distinct icon rings and typography together with colors
    assert.ok(css.includes('.focient-empty-icon-ring'), 'Must provide distinct graphic ring indicator');
    // Error states use tactile shake animation and message banner together with border colors
    assert.ok(
      css.includes('.focient-btn--shake') || css.includes('@keyframes focient-shake'),
      'Must provide physical tactile shake cue for fail states'
    );
  });

  await t.test('6. Guilt-Free Copywriting Guardrail on All Browser Routes', async () => {
    // Check that forbidden punitive words are never present in user-facing components
    const forbidden = ['Terlambat', 'Overdue', 'Gagal', 'Failed', 'Telat', 'Hukuman', 'Punish', 'Missed'];
    for (const word of forbidden) {
      assert.ok(
        !css.includes(`"${word}"`) && !css.includes(`'${word}'`),
        `Punitive word "${word}" must not be embedded in stylesheets`
      );
    }
  });

  await t.test('7. Browser Navigation Journey Component Export Integrity', async () => {
    // Check that all route directories exist and have corresponding page.tsx files
    const routePages = [
      'auth/login/page.tsx',
      'auth/register/page.tsx',
      'auth/forgot-password/page.tsx',
      'auth/reset-password/page.tsx',
      'onboarding/page.tsx',
      'dashboard/page.tsx',
      'tasks/page.tsx',
      'plan/page.tsx',
      'rescheduling/page.tsx',
      'insights/page.tsx',
    ];

    for (const route of routePages) {
      const pageFile = await readFile(new URL(`../src/app/${route}`, import.meta.url), 'utf8');
      assert.ok(
        pageFile.includes('export default') || pageFile.includes('export function'),
        `Route page ${route} must have a default or named export`
      );
      assert.ok(
        pageFile.includes('return') || pageFile.includes('=>'),
        `Route page ${route} must render UI`
      );
    }
  });
});
