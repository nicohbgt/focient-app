import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { animationTokens } from '../src/animation-token.js';
import { colorDarkTokens } from '../src/color-dark-token.js';
import { colorTokens } from '../src/color-token.js';
import { iconTokens } from '../src/icon-token.js';
import { shadowTokens } from '../src/shadow-token.js';
import { spacingTokens } from '../src/spacing-token.js';
import { typographyTokens } from '../src/typography-token.js';

const packageUrl = new URL('../', import.meta.url);

function flattenTokens(node, prefix, path = [], tokens = {}, nameForPath = (segments) => `${prefix}-${segments.join('-')}`) {
  if ('$value' in node) {
    tokens[nameForPath(path)] = node.$value;
    return tokens;
  }

  for (const [name, value] of Object.entries(node)) {
    if (!name.startsWith('$')) flattenTokens(value, prefix, [...path, name], tokens, nameForPath);
  }
  return tokens;
}

function toRem(value) {
  return `${Number.parseFloat(value) / 16}rem`;
}

function toDartName(tokenName, removePrefix = false) {
  const name = removePrefix ? tokenName.replace(/^[a-z]+-/, '') : tokenName;
  return name.replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());
}

function toDartNumber(value) {
  return Number.isInteger(value) ? `${value}.0` : String(Number(value.toFixed(4)));
}

function typographyOutput(source) {
  const typography = source.typography;
  return {
    fontFamily: typography.font.family.$value,
    fontWeight: Object.fromEntries(Object.entries(typography.font.weight).map(([name, value]) => [name, value.$value])),
    tabularFigures: typography.feature.tabularFigures.$value,
    mobile: Object.fromEntries(Object.entries(typography.scale).map(([name, values]) => [name, values.mobile.$value])),
    desktop: Object.fromEntries(Object.entries(typography.scale).map(([name, values]) => [name, values.desktop.$value])),
  };
}

function contrastRatio(foreground, background) {
  const relativeLuminance = (hex) => {
    const channels = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
    const linearChannels = channels.map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
    return 0.2126 * linearChannels[0] + 0.7152 * linearChannels[1] + 0.0722 * linearChannels[2];
  };

  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

test('web and JavaScript artifacts contain the canonical token values', async () => {
  const source = JSON.parse(await readFile(new URL('tokens/color-token.json', packageUrl), 'utf8'));
  const expected = flattenTokens(source.color, 'color');
  const css = await readFile(new URL('src/color-token.css', packageUrl), 'utf8');
  const cssTokens = Object.fromEntries([...css.matchAll(/--(color-[a-z-]+): (#[A-F0-9]{6});/g)].map(([, name, value]) => [name, value]));

  assert.deepEqual(colorTokens, expected);
  assert.deepEqual(cssTokens, expected);
});

test('Flutter artifact contains every canonical ARGB token', async () => {
  const source = JSON.parse(await readFile(new URL('tokens/color-token.json', packageUrl), 'utf8'));
  const dart = await readFile(new URL('lib/color_token.dart', packageUrl), 'utf8');

  for (const [name, hex] of Object.entries(flattenTokens(source.color, 'color'))) {
    const dartName = toDartName(name, true);
    assert.match(dart, new RegExp(`static const Color ${dartName} = Color\\(0xFF${hex.slice(1)}\\);`));
  }
});

test('spacing web and JavaScript artifacts derive from the canonical 4-point scale', async () => {
  const source = JSON.parse(await readFile(new URL('tokens/spacing-token.json', packageUrl), 'utf8'));
  const expected = flattenTokens(source.spacing, 'space');
  const css = await readFile(new URL('src/spacing-token.css', packageUrl), 'utf8');
  const cssTokens = Object.fromEntries([...css.matchAll(/--(space-[a-z0-9-]+): ([0-9.]+rem);/g)].map(([, name, value]) => [name, value]));
  const expectedCss = Object.fromEntries(Object.entries(expected).map(([name, value]) => [name, toRem(value)]));

  assert.deepEqual(spacingTokens, expected);
  assert.deepEqual(cssTokens, expectedCss);
  const numberedScale = Object.fromEntries(Object.entries(expected).filter(([name]) => /^space-\d+$/.test(name)));
  assert.deepEqual(Object.values(numberedScale), Array.from({ length: 24 }, (_, index) => `${(index + 1) * 4}px`));
  assert.equal(expected['space-tight-2'], expected['space-2']);
});

test('Flutter spacing artifact exposes every token as a logical-pixel double', async () => {
  const source = JSON.parse(await readFile(new URL('tokens/spacing-token.json', packageUrl), 'utf8'));
  const dart = await readFile(new URL('lib/spacing_token.dart', packageUrl), 'utf8');

  for (const [name, value] of Object.entries(flattenTokens(source.spacing, 'space'))) {
    const dartName = toDartName(name);
    assert.match(dart, new RegExp(`static const double ${dartName} = ${Number.parseInt(value, 10)}\\.0;`));
  }
});

test('icon artifacts preserve the size, stroke, style, and spacing handoff', async () => {
  const source = JSON.parse(await readFile(new URL('tokens/icon-token.json', packageUrl), 'utf8'));
  const expected = flattenTokens(source.icon, 'icon');
  const css = await readFile(new URL('src/icon-token.css', packageUrl), 'utf8');
  const dart = await readFile(new URL('lib/icon_token.dart', packageUrl), 'utf8');
  const cssTokens = Object.fromEntries([...css.matchAll(/--(icon-[a-z0-9-]+): ([^;]+);/g)].map(([, name, value]) => [name, value]));
  const expectedCss = Object.fromEntries(Object.entries(expected).map(([name, value]) => [name, /^icon-(size|spacing)-/.test(name) ? toRem(value) : value]));

  assert.deepEqual(iconTokens, expected);
  assert.deepEqual(cssTokens, expectedCss);

  for (const [name, value] of Object.entries(expected)) {
    const dartName = toDartName(name, true);
    const line = /^icon-style-/.test(name)
      ? `static const String ${dartName} = '${value}';`
      : `static const double ${dartName} = ${toDartNumber(Number.parseFloat(value))};`;
    assert.match(dart, new RegExp(line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('typography artifacts preserve responsive scale, weights, and tabular-figures support', async () => {
  const source = JSON.parse(await readFile(new URL('tokens/typography-token.json', packageUrl), 'utf8'));
  const expected = typographyOutput(source);
  const css = await readFile(new URL('src/typography-token.css', packageUrl), 'utf8');
  const dart = await readFile(new URL('lib/typography_token.dart', packageUrl), 'utf8');

  assert.deepEqual(typographyTokens, expected);
  assert.match(css, /--typography-font-family-sans: "Inter", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;/);
  assert.match(css, /--typography-feature-tabular-figures: "tnum";/);
  assert.match(css, /@media \(min-width: 64rem\)/);
  assert.match(dart, /static const String featureTabularFigures = 'tnum';/);
  assert.doesNotMatch(dart, /static const \w+ [A-Za-z0-9]*-[A-Za-z0-9]* =/);

  for (const [breakpoint, styles] of [['Mobile', expected.mobile], ['Desktop', expected.desktop]]) {
    for (const [name, style] of Object.entries(styles)) {
      const prefix = `${toDartName(name)}${breakpoint}`;
      const fontSize = Number.parseFloat(style.fontSize);
      const lineHeight = Number.parseFloat(style.lineHeight);
      const letterSpacing = Number.parseFloat(style.letterSpacing) * fontSize;
      assert.match(dart, new RegExp(`static const double ${prefix}FontSize = ${toDartNumber(fontSize)};`));
      assert.match(dart, new RegExp(`static const double ${prefix}LineHeight = ${toDartNumber(lineHeight)};`));
      assert.match(dart, new RegExp(`static const double ${prefix}LetterSpacing = ${toDartNumber(letterSpacing)};`));
      assert.match(dart, new RegExp(`static const int ${prefix}FontWeight = ${style.fontWeight};`));
    }
  }
});

test('non-warning bold text over subtle backgrounds meets the WCAG AAA 7:1 contrast requirement', () => {
  const contrastPairs = ['primary', 'secondary', 'accent', 'success', 'danger', 'info'];

  for (const category of contrastPairs) {
    const ratio = contrastRatio(colorTokens[`color-${category}-text-bold`], colorTokens[`color-${category}-bg-subtle`]);
    assert.ok(ratio >= 7, `${category} contrast was ${ratio.toFixed(2)}:1; expected at least 7:1`);
  }
});

test('the supplied warning pair is retained and flagged as below its stated AAA target', () => {
  const ratio = contrastRatio(colorTokens['color-warning-text-bold'], colorTokens['color-warning-bg-subtle']);

  assert.ok(ratio >= 4.5, `warning contrast was ${ratio.toFixed(2)}:1; expected at least WCAG AA`);
  assert.ok(ratio < 7, 'warning contrast now meets AAA; remove the documented exception from the token contract');
});

test('animation artifacts contain canonical durations, easing curves, and Flutter types', async () => {
  const source = JSON.parse(await readFile(new URL('tokens/animation-token.json', packageUrl), 'utf8'));
  const expected = flattenTokens(source.animation, 'animation', [], {}, (path) => path.join('-'));
  const css = await readFile(new URL('src/animation-token.css', packageUrl), 'utf8');
  const dart = await readFile(new URL('lib/animation_token.dart', packageUrl), 'utf8');

  assert.deepEqual(animationTokens, expected);

  // Verify durations in CSS
  assert.match(css, /--duration-fast: 150ms;/);
  assert.match(css, /--duration-normal: 200ms;/);
  assert.match(css, /--duration-moderate: 250ms;/);
  assert.match(css, /--duration-slow: 300ms;/);
  assert.match(css, /--duration-deliberate: 400ms;/);

  // Verify easings in CSS
  assert.match(css, /--ease-fluid: cubic-bezier\(0\.4, 0, 0\.2, 1\);/);
  assert.match(css, /--ease-decelerate: cubic-bezier\(0\.0, 0, 0\.2, 1\);/);
  assert.match(css, /--ease-accelerate: cubic-bezier\(0\.4, 0, 1, 1\);/);

  // Verify Dart durations and curves
  assert.match(dart, /static const Duration durationFast = Duration\(milliseconds: 150\);/);
  assert.match(dart, /static const int durationFastMs = 150;/);
  assert.match(dart, /static const Duration durationNormal = Duration\(milliseconds: 200\);/);
  assert.match(dart, /static const int durationNormalMs = 200;/);
  assert.match(dart, /static const Duration durationModerate = Duration\(milliseconds: 250\);/);
  assert.match(dart, /static const int durationModerateMs = 250;/);
  assert.match(dart, /static const Duration durationSlow = Duration\(milliseconds: 300\);/);
  assert.match(dart, /static const int durationSlowMs = 300;/);
  assert.match(dart, /static const Duration durationDeliberate = Duration\(milliseconds: 400\);/);
  assert.match(dart, /static const int durationDeliberateMs = 400;/);

  assert.match(dart, /static const Curve easeFluid = Cubic\(0\.4, 0\.0, 0\.2, 1\.0\);/);
  assert.match(dart, /static const Curve easeDecelerate = Cubic\(0\.0, 0\.0, 0\.2, 1\.0\);/);
  assert.match(dart, /static const Curve easeAccelerate = Cubic\(0\.4, 0\.0, 1\.0, 1\.0\);/);
});

test('shadow artifacts preserve the 2-layer composite formula and exponential scaling', async () => {
  const source = JSON.parse(await readFile(new URL('tokens/shadow-token.json', packageUrl), 'utf8'));
  const expected = flattenTokens(source.shadow, 'shadow', [], {}, (path) => `shadow-${path.join('-')}`);
  const css = await readFile(new URL('src/shadow-token.css', packageUrl), 'utf8');
  const dart = await readFile(new URL('lib/shadow_token.dart', packageUrl), 'utf8');

  assert.deepEqual(shadowTokens, expected);

  // CSS variables match the exact DTCG tokens
  assert.match(css, /--shadow-0: none;/);
  assert.match(css, /--shadow-1: 0px 1px 2px 0px rgba\(0, 0, 0, 0\.30\), 0px 1px 3px 1px rgba\(0, 0, 0, 0\.20\);/);
  assert.match(css, /--shadow-2: 0px 1px 2px 0px rgba\(0, 0, 0, 0\.30\), 0px 2px 6px 2px rgba\(0, 0, 0, 0\.20\);/);
  assert.match(css, /--shadow-3: 0px 1px 2px 0px rgba\(0, 0, 0, 0\.30\), 0px 4px 12px 4px rgba\(0, 0, 0, 0\.20\);/);
  assert.match(css, /--shadow-4: 0px 1px 2px 0px rgba\(0, 0, 0, 0\.30\), 0px 8px 24px 8px rgba\(0, 0, 0, 0\.20\);/);

  // Dart BoxShadow definitions
  assert.match(dart, /static const List<BoxShadow> shadow0 = <BoxShadow>\[\];/);
  assert.match(dart, /static const List<BoxShadow> shadow1 = <BoxShadow>\[/);
  assert.match(dart, /static const List<BoxShadow> shadow2 = <BoxShadow>\[/);
  assert.match(dart, /static const List<BoxShadow> shadow3 = <BoxShadow>\[/);
  assert.match(dart, /static const List<BoxShadow> shadow4 = <BoxShadow>\[/);

  // Constant Ambient Layer across elevated levels (Color(0x4D000000) = rgba(0, 0, 0, 0.30))
  const ambientMatches = dart.match(/color: Color\(0x4D000000\),\s*offset: Offset\(0\.0, 1\.0\),\s*blurRadius: 2\.0,\s*spreadRadius: 0\.0/g);
  assert.equal(ambientMatches?.length, 4, 'Ambient layer must be present across levels 1 through 4');

  // Exponential Key Layer progression (x2 scaling on Y, Blur, Spread)
  assert.match(dart, /offset: Offset\(0\.0, 1\.0\),\s*blurRadius: 3\.0,\s*spreadRadius: 1\.0/);
  assert.match(dart, /offset: Offset\(0\.0, 2\.0\),\s*blurRadius: 6\.0,\s*spreadRadius: 2\.0/);
  assert.match(dart, /offset: Offset\(0\.0, 4\.0\),\s*blurRadius: 12\.0,\s*spreadRadius: 4\.0/);
  assert.match(dart, /offset: Offset\(0\.0, 8\.0\),\s*blurRadius: 24\.0,\s*spreadRadius: 8\.0/);
});

test('dark mode color artifacts contain canonical tokens and match contrast requirements', async () => {
  const source = JSON.parse(await readFile(new URL('tokens/color-dark-token.json', packageUrl), 'utf8'));
  const expected = flattenTokens(source.color, 'color');
  const css = await readFile(new URL('src/color-dark-token.css', packageUrl), 'utf8');
  const dart = await readFile(new URL('lib/color_dark_token.dart', packageUrl), 'utf8');
  const cssTokens = Object.fromEntries([...css.matchAll(/--(color-[a-z-]+): (#[A-F0-9]{6});/g)].map(([, name, value]) => [name, value]));

  assert.deepEqual(colorDarkTokens, expected);
  assert.deepEqual(cssTokens, expected);

  // Selector targets dark mode theme data attributes and classes
  assert.match(css, /:root\[data-theme="dark"\], \[data-theme="dark"\], \.dark/);

  // Flutter Dark tokens are exported
  for (const [name, hex] of Object.entries(expected)) {
    const dartName = toDartName(name, true);
    assert.match(dart, new RegExp(`static const Color ${dartName} = Color\\(0xFF${hex.slice(1)}\\);`));
  }

  // Check WCAG AAA contrast in Dark Mode (text-bold on bg-subtle >= 7:1)
  const categories = ['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info'];
  for (const category of categories) {
    const ratio = contrastRatio(colorDarkTokens[`color-${category}-text-bold`], colorDarkTokens[`color-${category}-bg-subtle`]);
    assert.ok(ratio >= 7, `${category} dark mode contrast was ${ratio.toFixed(2)}:1; expected at least 7:1`);
  }
});
