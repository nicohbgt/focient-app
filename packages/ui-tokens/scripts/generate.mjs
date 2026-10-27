import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const isCheck = process.argv.includes('--check');
const packageRoot = fileURLToPath(new URL('../', import.meta.url));

const domains = [
  {
    name: 'color-token',
    sourceGroup: 'color',
    prefix: 'color',
    javaScriptExport: 'colorTokens',
    typeName: 'ColorTokenName',
    dartFile: 'color_token.dart',
    dartClass: 'FocientColorTokens',
    dartImports: ["import 'package:flutter/widgets.dart';"],
    dartDocumentation: ['/// Shared semantic color tokens for FoCient Flutter applications.', '///', '/// Use these semantic names instead of hex literals in widgets.'],
    cssValue: (value) => value,
    removePrefixForDart: true,
    dartLine: (name, value, domain) => `  static const Color ${toDartName(name, domain.removePrefixForDart)} = Color(0xFF${value.slice(1)});`,
  },
  {
    name: 'color-dark-token',
    sourceGroup: 'color',
    prefix: 'color',
    javaScriptExport: 'colorDarkTokens',
    typeName: 'ColorDarkTokenName',
    dartFile: 'color_dark_token.dart',
    dartClass: 'FocientColorDarkTokens',
    dartImports: ["import 'package:flutter/widgets.dart';"],
    dartDocumentation: [
      '/// Shared semantic dark-mode color tokens for FoCient Flutter applications.',
      '///',
      '/// Deep Slate and Obsidian palette designed for anti-glare and focus.',
    ],
    cssSelector: ':root[data-theme="dark"], [data-theme="dark"], .dark',
    cssValue: (value) => value,
    removePrefixForDart: true,
    dartLine: (name, value, domain) => `  static const Color ${toDartName(name, domain.removePrefixForDart)} = Color(0xFF${value.slice(1)});`,
  },
  {
    name: 'spacing-token',
    sourceGroup: 'spacing',
    prefix: 'space',
    javaScriptExport: 'spacingTokens',
    typeName: 'SpacingTokenName',
    dartFile: 'spacing_token.dart',
    dartClass: 'FocientSpacingTokens',
    dartImports: [],
    dartDocumentation: ['/// Shared 4-point spacing tokens in Flutter logical pixels.', '///', '/// Use these values for padding, gaps, margins, and layout dimensions.'],
    cssValue: toRem,
    removePrefixForDart: false,
    dartLine: (name, value, domain) => `  static const double ${toDartName(name, domain.removePrefixForDart)} = ${toDartDouble(value)};`,
  },
  {
    name: 'icon-token',
    sourceGroup: 'icon',
    prefix: 'icon',
    javaScriptExport: 'iconTokens',
    typeName: 'IconTokenName',
    dartFile: 'icon_token.dart',
    dartClass: 'FocientIconTokens',
    dartImports: [],
    dartDocumentation: ['/// Shared icon size, stroke, spacing, and visual-style tokens.', '///', '/// Icon style values identify the required outline or filled asset variant.'],
    cssValue: (value, name) => (/^icon-(size|spacing)-/.test(name) ? toRem(value) : value),
    removePrefixForDart: true,
    dartLine: (name, value, domain) => (/^icon-style-/.test(name)
      ? `  static const String ${toDartName(name, domain.removePrefixForDart)} = '${value}';`
      : `  static const double ${toDartName(name, domain.removePrefixForDart)} = ${toDartDouble(value)};`),
  },
  {
    name: 'layout-token',
    sourceGroup: 'layout',
    prefix: 'layout',
    nameForPath: (path) => (path[0] === 'grid' ? path.join('-') : `layout-${path.join('-')}`),
    javaScriptExport: 'layoutTokens',
    typeName: 'LayoutTokenName',
    javaScriptValueType: 'string | number',
    dartFile: 'layout_token.dart',
    dartClass: 'FocientLayoutTokens',
    dartImports: [],
    dartDocumentation: ['/// Shared responsive grid, container, modal, and navigation layout tokens.', '///', '/// Percentage and viewport values remain strings for resolution against the current Flutter constraints.'],
    cssValue: (value) => (typeof value === 'string' && /^(\d+(?:\.\d+)?)px$/.test(value) ? toRem(value) : value),
    removePrefixForDart: false,
    dartLine: (name, value, domain) => createDartPrimitiveLine(name, value, domain),
  },
  {
    name: 'border-radius-token',
    sourceGroup: 'border',
    prefix: 'border',
    nameForPath: (path) => path.join('-'),
    javaScriptExport: 'borderRadiusTokens',
    typeName: 'BorderRadiusTokenName',
    dartFile: 'border_radius_token.dart',
    dartClass: 'FocientBorderRadiusTokens',
    dartImports: [],
    dartDocumentation: ['/// Shared corner-radius and border-stroke tokens in Flutter logical pixels.'],
    cssValue: (value) => value,
    removePrefixForDart: false,
    dartLine: (name, value, domain) => `  static const double ${toDartName(name, domain.removePrefixForDart)} = ${toDartDouble(value)};`,
  },
  {
    name: 'animation-token',
    sourceGroup: 'animation',
    prefix: 'animation',
    nameForPath: (path) => path.join('-'),
    javaScriptExport: 'animationTokens',
    typeName: 'AnimationTokenName',
    dartFile: 'animation_token.dart',
    dartClass: 'FocientAnimationTokens',
    dartImports: ["import 'package:flutter/widgets.dart';"],
    dartDocumentation: [
      '/// Shared animation timing, duration, and easing tokens for FoCient Flutter applications.',
      '///',
      '/// Use [Duration] tokens for transition durations and [Curve] tokens for easing curves.',
    ],
    cssValue: (value) => value,
    removePrefixForDart: false,
    dartLine: (name, value, domain) => createDartAnimationLine(name, value, domain),
  },
  {
    name: 'shadow-token',
    sourceGroup: 'shadow',
    prefix: 'shadow',
    nameForPath: (path) => `shadow-${path.join('-')}`,
    javaScriptExport: 'shadowTokens',
    typeName: 'ShadowTokenName',
    dartFile: 'shadow_token.dart',
    dartClass: 'FocientShadowTokens',
    dartImports: ["import 'package:flutter/widgets.dart';"],
    dartDocumentation: [
      '/// Shared elevation and box-shadow tokens for FoCient Flutter applications.',
      '///',
      '/// Built using the FoCient 2-layer composite formula (ambient grounding + dynamic elevation).',
    ],
    cssValue: (value) => value,
    removePrefixForDart: false,
    dartLine: (name, value, domain) => createDartShadowLine(name, value, domain),
  },
  {
    name: 'error-token',
    sourceGroup: 'error',
    prefix: 'error',
    javaScriptExport: 'errorTokens',
    typeName: 'ErrorTokenName',
    dartFile: 'error_token.dart',
    dartClass: 'FocientErrorTokens',
    dartImports: ["import 'package:flutter/widgets.dart';"],
    dartDocumentation: [
      '/// Shared semantic error, fail, and conflict tokens for FoCient Flutter applications.',
      '///',
      '/// Encapsulates multi-sensory feedback, zero layout shift, and anti-accusatory visual specifications.',
    ],
    cssValue: (value) => value,
    removePrefixForDart: true,
    dartLine: (name, value, domain) => createDartErrorLine(name, value, domain),
  },
  {
    name: 'empty-token',
    sourceGroup: 'empty',
    prefix: 'empty',
    javaScriptExport: 'emptyTokens',
    typeName: 'EmptyTokenName',
    dartFile: 'empty_token.dart',
    dartClass: 'FocientEmptyTokens',
    dartImports: ["import 'package:flutter/widgets.dart';"],
    dartDocumentation: [
      '/// Shared semantic empty state tokens for FoCient Flutter applications.',
      '///',
      '/// Supports calm whitespace, reflective validation, and zero-decision-fatigue single actions.',
    ],
    cssValue: (value) => value,
    removePrefixForDart: true,
    dartLine: (name, value, domain) => createDartEmptyLine(name, value, domain),
  },
  {
    name: 'loading-token',
    sourceGroup: 'loading',
    prefix: 'loading',
    javaScriptExport: 'loadingTokens',
    typeName: 'LoadingTokenName',
    dartFile: 'loading_token.dart',
    dartClass: 'FocientLoadingTokens',
    dartImports: ["import 'package:flutter/widgets.dart';"],
    dartDocumentation: [
      '/// Shared semantic loading, skeleton shimmer, and sync tokens for FoCient Flutter applications.',
      '///',
      '/// Supports zero layout shift, tactile button feedback, and calm background sync.',
    ],
    cssValue: (value) => value,
    removePrefixForDart: true,
    dartLine: (name, value, domain) => createDartLoadingLine(name, value, domain),
  },
  {
    name: 'success-token',
    sourceGroup: 'success',
    prefix: 'success',
    javaScriptExport: 'successTokens',
    typeName: 'SuccessTokenName',
    dartFile: 'success_token.dart',
    dartClass: 'FocientSuccessTokens',
    dartImports: ["import 'package:flutter/widgets.dart';"],
    dartDocumentation: [
      '/// Shared semantic success state tokens for FoCient Flutter applications.',
      '///',
      '/// Supports calm affirmation, task completion micro-interactions, and reversibility buffers.',
    ],
    cssValue: (value) => value,
    removePrefixForDart: true,
    dartLine: (name, value, domain) => createDartSuccessLine(name, value, domain),
  },
];

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

function parsePixels(value) {
  const match = /^(\d+(?:\.\d+)?)px$/.exec(value);
  if (!match) throw new Error(`Expected a pixel dimension, received: ${value}`);
  return Number(match[1]);
}

function toRem(value) {
  return `${parsePixels(value) / 16}rem`;
}

function toDartDouble(value) {
  const pixels = parsePixels(value);
  return Number.isInteger(pixels) ? `${pixels}.0` : String(pixels);
}

function createDartPrimitiveLine(name, value, domain) {
  const dartName = toDartName(name, domain.removePrefixForDart);
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? `  static const int ${dartName} = ${value};`
      : `  static const double ${dartName} = ${value};`;
  }
  if (/^(\d+(?:\.\d+)?)px$/.test(value)) {
    return `  static const double ${dartName} = ${toDartDouble(value)};`;
  }
  return `  static const String ${dartName} = '${value}';`;
}

function createDartAnimationLine(name, value, domain) {
  const dartName = toDartName(name, domain.removePrefixForDart);
  if (/^(\d+)ms$/.test(value)) {
    const ms = Number.parseInt(value, 10);
    return [
      `  static const Duration ${dartName} = Duration(milliseconds: ${ms});`,
      `  static const int ${dartName}Ms = ${ms};`,
    ].join('\n');
  }
  if (value.startsWith('cubic-bezier')) {
    const match = /cubic-bezier\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\s*\)/.exec(value);
    if (match) {
      const [, a, b, c, d] = match;
      const toFloat = (numStr) => (numStr.includes('.') ? numStr : `${numStr}.0`);
      return `  static const Curve ${dartName} = Cubic(${toFloat(a)}, ${toFloat(b)}, ${toFloat(c)}, ${toFloat(d)});`;
    }
  }
  return `  static const String ${dartName} = '${value}';`;
}

function createDartShadowLine(name, value, domain) {
  const dartName = toDartName(name, domain.removePrefixForDart);
  if (value === 'none') {
    return `  static const List<BoxShadow> ${dartName} = <BoxShadow>[];`;
  }

  const layerRegex = /(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/g;
  const layers = [];
  let match;
  while ((match = layerRegex.exec(value)) !== null) {
    const [, x, y, blur, spread, r, g, b, a] = match;
    const alphaInt = Math.round(Number.parseFloat(a) * 255);
    const alphaHex = alphaInt.toString(16).toUpperCase().padStart(2, '0');
    const rHex = Number.parseInt(r, 10).toString(16).toUpperCase().padStart(2, '0');
    const gHex = Number.parseInt(g, 10).toString(16).toUpperCase().padStart(2, '0');
    const bHex = Number.parseInt(b, 10).toString(16).toUpperCase().padStart(2, '0');
    const colorHex = `0x${alphaHex}${rHex}${gHex}${bHex}`;

    const toDoubleStr = (val) => {
      const num = Number.parseFloat(val);
      return Number.isInteger(num) ? `${num}.0` : String(num);
    };

    layers.push([
      '    BoxShadow(',
      `      color: Color(${colorHex}),`,
      `      offset: Offset(${toDoubleStr(x)}, ${toDoubleStr(y)}),`,
      `      blurRadius: ${toDoubleStr(blur)},`,
      `      spreadRadius: ${toDoubleStr(spread)},`,
      '    ),',
    ].join('\n'));
  }

  if (layers.length === 0) {
    return `  static const String ${dartName} = '${value}';`;
  }

  return [
    `  static const List<BoxShadow> ${dartName} = <BoxShadow>[`,
    layers.join('\n'),
    '  ];',
  ].join('\n');
}

function createDartErrorLine(name, value, domain) {
  const dartName = toDartName(name, domain.removePrefixForDart);
  if (typeof value === 'string' && value.startsWith('#')) {
    return `  static const Color ${dartName} = Color(0xFF${value.slice(1)});`;
  }
  if (typeof value === 'string' && /^(\d+)ms$/.test(value)) {
    const ms = Number.parseInt(value, 10);
    return [
      `  static const Duration ${dartName} = Duration(milliseconds: ${ms});`,
      `  static const int ${dartName}Ms = ${ms};`,
    ].join('\n');
  }
  if (typeof value === 'string' && /^(\d+(?:\.\d+)?)px$/.test(value)) {
    return `  static const double ${dartName} = ${toDartDouble(value)};`;
  }
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? `  static const int ${dartName} = ${value};`
      : `  static const double ${dartName} = ${value};`;
  }
  return `  static const String ${dartName} = '${value}';`;
}

function createDartEmptyLine(name, value, domain) {
  const dartName = toDartName(name, domain.removePrefixForDart);
  if (typeof value === 'string' && value.startsWith('#')) {
    return `  static const Color ${dartName} = Color(0xFF${value.slice(1)});`;
  }
  if (typeof value === 'string' && /^(\d+(?:\.\d+)?)px$/.test(value)) {
    return `  static const double ${dartName} = ${toDartDouble(value)};`;
  }
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? `  static const int ${dartName} = ${value};`
      : `  static const double ${dartName} = ${value};`;
  }
  return `  static const String ${dartName} = '${value}';`;
}

function createDartLoadingLine(name, value, domain) {
  const dartName = toDartName(name, domain.removePrefixForDart);
  if (typeof value === 'string' && value.startsWith('#')) {
    return `  static const Color ${dartName} = Color(0xFF${value.slice(1)});`;
  }
  if (typeof value === 'string' && value.startsWith('rgba')) {
    const match = /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/.exec(value);
    if (match) {
      const [, r, g, b, a] = match;
      const alphaHex = Math.round(Number.parseFloat(a) * 255).toString(16).toUpperCase().padStart(2, '0');
      const rHex = Number.parseInt(r, 10).toString(16).toUpperCase().padStart(2, '0');
      const gHex = Number.parseInt(g, 10).toString(16).toUpperCase().padStart(2, '0');
      const bHex = Number.parseInt(b, 10).toString(16).toUpperCase().padStart(2, '0');
      return `  static const Color ${dartName} = Color(0x${alphaHex}${rHex}${gHex}${bHex});`;
    }
  }
  if (typeof value === 'string' && /^(\d+)ms$/.test(value)) {
    const ms = Number.parseInt(value, 10);
    return [
      `  static const Duration ${dartName} = Duration(milliseconds: ${ms});`,
      `  static const int ${dartName}Ms = ${ms};`,
    ].join('\n');
  }
  if (typeof value === 'string' && /^(\d+(?:\.\d+)?)px$/.test(value)) {
    return `  static const double ${dartName} = ${toDartDouble(value)};`;
  }
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? `  static const int ${dartName} = ${value};`
      : `  static const double ${dartName} = ${value};`;
  }
  return `  static const String ${dartName} = '${value}';`;
}

function createDartSuccessLine(name, value, domain) {
  const dartName = toDartName(name, domain.removePrefixForDart);
  if (typeof value === 'string' && value.startsWith('#')) {
    return `  static const Color ${dartName} = Color(0xFF${value.slice(1)});`;
  }
  if (typeof value === 'string' && /^(\d+)ms$/.test(value)) {
    const ms = Number.parseInt(value, 10);
    return [
      `  static const Duration ${dartName} = Duration(milliseconds: ${ms});`,
      `  static const int ${dartName}Ms = ${ms};`,
    ].join('\n');
  }
  if (typeof value === 'string' && /^(\d+(?:\.\d+)?)px$/.test(value)) {
    return `  static const double ${dartName} = ${toDartDouble(value)};`;
  }
  if (typeof value === 'number') {
    const isFloatingMetric = dartName.toLowerCase().includes('scale') || dartName.toLowerCase().includes('opacity');
    if (isFloatingMetric) {
      return `  static const double ${dartName} = ${Number.isInteger(value) ? `${value}.0` : String(value)};`;
    }
    return Number.isInteger(value)
      ? `  static const int ${dartName} = ${value};`
      : `  static const double ${dartName} = ${value};`;
  }
  return `  static const String ${dartName} = '${value}';`;
}

function toDartName(tokenName, removePrefix) {
  const name = removePrefix ? tokenName.replace(/^[a-z]+-/, '') : tokenName;
  return name
    .split('-')
    .map((part, index) => (index === 0 ? part : `${part[0].toUpperCase()}${part.slice(1)}`))
    .join('');
}

function sourceComment(domain) {
  return `../tokens/${domain.name}.json`;
}

function createCss(domain, entries) {
  const selector = domain.cssSelector ?? ':root';
  return [
    '/**',
    ` * GENERATED FILE. Source: ${sourceComment(domain)}`,
    ' * Import this file once at the web application entry point.',
    ' */',
    `${selector} {`,
    ...entries.map(([name, value]) => `  --${name}: ${domain.cssValue(value, name)};`),
    '}',
    '',
  ].join('\n');
}

function createJavaScript(domain, entries) {
  return [
    `/** GENERATED FILE. Source: ${sourceComment(domain)} */`,
    `export const ${domain.javaScriptExport} = Object.freeze(`,
    `  ${JSON.stringify(Object.fromEntries(entries), null, 2)},`,
    ');',
    '',
  ].join('\n');
}

function createTypes(domain, entries) {
  const names = entries.map(([name]) => `  | '${name}'`).join('\n');
  return [
    `/** GENERATED FILE. Source: ${sourceComment(domain)} */`,
    `export type ${domain.typeName} =`,
    `${names};`,
    '',
    `export declare const ${domain.javaScriptExport}: Readonly<Record<${domain.typeName}, ${domain.javaScriptValueType ?? 'string'}>>;`,
    '',
  ].join('\n');
}

function createDart(domain, entries) {
  return [
    `// GENERATED FILE. Source: ${sourceComment(domain)}`,
    ...domain.dartImports,
    ...(domain.dartImports.length ? [''] : []),
    ...domain.dartDocumentation,
    `abstract final class ${domain.dartClass} {`,
    ...entries.map(([name, value]) => domain.dartLine(name, value, domain)),
    '}',
    '',
  ].join('\n');
}

const outputs = [];
for (const domain of domains) {
  const sourcePath = new URL(`../tokens/${domain.name}.json`, import.meta.url);
  const source = JSON.parse(await readFile(sourcePath, 'utf8'));
  const entries = Object.entries(flattenTokens(source[domain.sourceGroup], domain.prefix, [], {}, domain.nameForPath));

  outputs.push(
    [new URL(`../src/${domain.name}.css`, import.meta.url), createCss(domain, entries)],
    [new URL(`../src/${domain.name}.js`, import.meta.url), createJavaScript(domain, entries)],
    [new URL(`../src/${domain.name}.d.ts`, import.meta.url), createTypes(domain, entries)],
    [new URL(`../lib/${domain.dartFile}`, import.meta.url), createDart(domain, entries)],
  );
}

const typographySourcePath = new URL('../tokens/typography-token.json', import.meta.url);
const typography = JSON.parse(await readFile(typographySourcePath, 'utf8')).typography;
outputs.push(...createTypographyOutputs(typography));

if (!isCheck) {
  await Promise.all([
    mkdir(new URL('../src/', import.meta.url), { recursive: true }),
    mkdir(new URL('../lib/', import.meta.url), { recursive: true }),
  ]);
}

let isCurrent = true;
for (const [path, content] of outputs) {
  let existing = '';
  try {
    existing = await readFile(path, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  if (existing !== content) {
    isCurrent = false;
    if (!isCheck) await writeFile(path, content, 'utf8');
  }
}

if (!isCurrent && isCheck) {
  throw new Error(`Generated token artifacts are stale. Run: node ${packageRoot}scripts/generate.mjs`);
}

function createTypographyOutputs(source) {
  const sourcePath = '../tokens/typography-token.json';
  const mobileStyles = Object.fromEntries(Object.entries(source.scale).map(([name, values]) => [name, values.mobile.$value]));
  const desktopStyles = Object.fromEntries(Object.entries(source.scale).map(([name, values]) => [name, values.desktop.$value]));
  const fontFamily = source.font.family.$value;
  const fontWeight = Object.fromEntries(Object.entries(source.font.weight).map(([name, value]) => [name, value.$value]));
  const tabularFigures = source.feature.tabularFigures.$value;
  const output = {
    fontFamily,
    fontWeight,
    tabularFigures,
    mobile: mobileStyles,
    desktop: desktopStyles,
  };
  const css = [
    '/**',
    ` * GENERATED FILE. Source: ${sourcePath}`,
    ' * Mobile values are the default; desktop values activate at 64rem (1024px at the 16px base).',
    ' */',
    ':root {',
    `  --typography-font-family-sans: ${fontFamily.map(toCssFontFamily).join(', ')};`,
    ...Object.entries(fontWeight).map(([name, value]) => `  --typography-font-weight-${name}: ${value};`),
    `  --typography-feature-tabular-figures: "${tabularFigures}";`,
    ...createTypographyCssVariables(mobileStyles),
    '}',
    '',
    '@media (min-width: 64rem) {',
    '  :root {',
    ...createTypographyCssVariables(desktopStyles, '    '),
    '  }',
    '}',
    '',
  ].join('\n');
  const javaScript = [
    `/** GENERATED FILE. Source: ${sourcePath} */`,
    'export const typographyTokens = Object.freeze(',
    `  ${JSON.stringify(output, null, 2)},`,
    ');',
    '',
  ].join('\n');
  const types = [
    `/** GENERATED FILE. Source: ${sourcePath} */`,
    `export type TypographyStyleName = ${Object.keys(mobileStyles).map((name) => `'${name}'`).join(' | ')};`,
    "export type TypographyBreakpoint = 'mobile' | 'desktop';",
    'export interface TypographyStyle {',
    '  readonly fontSize: string;',
    '  readonly lineHeight: string;',
    '  readonly letterSpacing: string;',
    '  readonly fontWeight: number;',
    '}',
    'export interface TypographyTokens {',
    '  readonly fontFamily: readonly string[];',
    '  readonly fontWeight: Readonly<Record<string, number>>;',
    '  readonly tabularFigures: string;',
    '  readonly mobile: Readonly<Record<TypographyStyleName, TypographyStyle>>;',
    '  readonly desktop: Readonly<Record<TypographyStyleName, TypographyStyle>>;',
    '}',
    'export declare const typographyTokens: Readonly<TypographyTokens>;',
    '',
  ].join('\n');
  const dart = [
    `// GENERATED FILE. Source: ${sourcePath}`,
    '/// Responsive type-scale primitives for FoCient Flutter applications.',
    '///',
    '/// Font assets are supplied by each consuming application; this package does not bundle font files.',
    'abstract final class FocientTypographyTokens {',
    `  static const String fontFamily = '${fontFamily[0]}';`,
    `  static const List<String> fontFamilyFallbacks = <String>[${fontFamily.slice(1, 2).map((family) => `'${family}'`).join(', ')}];`,
    ...Object.entries(fontWeight).map(([name, value]) => `  static const int fontWeight${capitalize(name)} = ${value};`),
    `  static const String featureTabularFigures = '${tabularFigures}';`,
    ...createTypographyDartVariables(mobileStyles, 'Mobile'),
    ...createTypographyDartVariables(desktopStyles, 'Desktop'),
    '}',
    '',
  ].join('\n');

  return [
    [new URL('../src/typography-token.css', import.meta.url), css],
    [new URL('../src/typography-token.js', import.meta.url), javaScript],
    [new URL('../src/typography-token.d.ts', import.meta.url), types],
    [new URL('../lib/typography_token.dart', import.meta.url), dart],
  ];
}

function toCssFontFamily(family) {
  return ['ui-sans-serif', 'system-ui', 'sans-serif'].includes(family) ? family : `"${family}"`;
}

function createTypographyCssVariables(styles, indent = '  ') {
  return Object.entries(styles).flatMap(([name, style]) => [
    `${indent}--typography-${name}-font-size: ${toRem(style.fontSize)};`,
    `${indent}--typography-${name}-line-height: ${toRem(style.lineHeight)};`,
    `${indent}--typography-${name}-letter-spacing: ${style.letterSpacing};`,
    `${indent}--typography-${name}-font-weight: ${style.fontWeight};`,
  ]);
}

function createTypographyDartVariables(styles, breakpoint) {
  return Object.entries(styles).flatMap(([name, style]) => {
    const prefix = `${toDartName(name, false)}${breakpoint}`;
    const fontSize = parsePixels(style.fontSize);
    const lineHeight = parsePixels(style.lineHeight);
    const letterSpacing = Number.parseFloat(style.letterSpacing) * fontSize;
    return [
      `  static const double ${prefix}FontSize = ${toDartNumber(fontSize)};`,
      `  static const double ${prefix}LineHeight = ${toDartNumber(lineHeight)};`,
      `  static const double ${prefix}LineHeightFactor = ${toDartNumber(lineHeight / fontSize)};`,
      `  static const double ${prefix}LetterSpacing = ${toDartNumber(letterSpacing)};`,
      `  static const int ${prefix}FontWeight = ${style.fontWeight};`,
    ];
  });
}

function toDartNumber(value) {
  return Number.isInteger(value) ? `${value}.0` : String(Number(value.toFixed(4)));
}

function capitalize(value) {
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}
