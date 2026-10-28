# FoCient UI design tokens

Each design-token domain has one canonical file: `color-token.json`, `spacing-token.json`, `icon-token.json`, `typography-token.json`, `layout-token.json`, `border-radius-token.json`, `animation-token.json`, and `shadow-token.json`. New domains follow the same pattern without combining unrelated concerns.

CSS, JavaScript, TypeScript, and Flutter files are generated from these sources so mobile and web/desktop share exactly the same values.

## Web and desktop

Import the stylesheets once in the application entry point:

```ts
import '@focient/ui-tokens/color-token.css';
import '@focient/ui-tokens/spacing-token.css';
import '@focient/ui-tokens/icon-token.css';
import '@focient/ui-tokens/typography-token.css';
import '@focient/ui-tokens/border-radius-token.css';
import '@focient/ui-tokens/animation-token.css';
import '@focient/ui-tokens/shadow-token.css';
```

Use a semantic CSS custom property in components. Do not place a hex color literal in a component.

```css
.focus-card {
  background: var(--color-primary-bg-subtle);
  border-color: var(--color-primary-border-subtle);
  color: var(--color-primary-text-bold);
  box-shadow: var(--shadow-1);
  transition: transform var(--duration-normal) var(--ease-fluid),
              box-shadow var(--duration-normal) var(--ease-fluid);
}

.focus-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-2);
}
```

For typed token maps:
```ts
import { colorTokens } from '@focient/ui-tokens/color-token';
import { animationTokens } from '@focient/ui-tokens/animation-token';
import { shadowTokens } from '@focient/ui-tokens/shadow-token';
```

Use spacing variables instead of literal margins, padding, or gaps:

```css
.task-card {
  padding: var(--space-4);
  gap: var(--space-3);
}
```

For a typed spacing map, import `@focient/ui-tokens/spacing-token`.

Use the typography tokens for a responsive type scale. Mobile values are the default; desktop values apply at 64rem (1024px with the 16px base):

```css
.page-title {
  font-family: var(--typography-font-family-sans);
  font-size: var(--typography-h1-font-size);
  line-height: var(--typography-h1-line-height);
  letter-spacing: var(--typography-h1-letter-spacing);
  font-weight: var(--typography-h1-font-weight);
}
```

For numbers that update live, enable the supplied tabular-figures token:

```css
.focus-timer {
  font-feature-settings: var(--typography-feature-tabular-figures);
}
```

Use `--icon-size-*`, `--icon-stroke-*`, and `--icon-spacing-*` for icon dimensions. `--icon-style-outline` and `--icon-style-filled` identify which asset variant should be rendered; they do not draw or replace the icon itself.

## Flutter mobile

Add the local package to the mobile app while the monorepo is in development:

```yaml
dependencies:
  focient_ui_tokens:
    path: ../../packages/ui-tokens
```

Then use the semantic token directly in widgets:

```dart
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
// Or import domain files individually:
import 'package:focient_ui_tokens/animation_token.dart';
import 'package:focient_ui_tokens/color_token.dart';
import 'package:focient_ui_tokens/icon_token.dart';
import 'package:focient_ui_tokens/shadow_token.dart';
import 'package:focient_ui_tokens/spacing_token.dart';
import 'package:focient_ui_tokens/typography_token.dart';

const Color background = FocientColorTokens.primaryBgSubtle;
const double cardPadding = FocientSpacingTokens.space4;
const double taskIconSize = FocientIconTokens.sizeSm;
const double titleSize = FocientTypographyTokens.h1MobileFontSize;
const List<BoxShadow> cardShadow = FocientShadowTokens.shadow1;
const Duration transitionTime = FocientAnimationTokens.durationFast;
const Curve transitionCurve = FocientAnimationTokens.easeFluid;
```

## Color-use rules

- `primary` is reserved for the single-task focus and highest-priority actions.
- `secondary` communicates adaptive rescheduling and capacity balancing.
- `accent` is for project categories and comparative analytics, not primary actions.
- `neutral` is the default interface canvas and surface palette.
- Use `warning` for postponed or rescheduled work. `danger` is only for technical failures and destructive actions.
- `text-bold` / `bg-subtle` pairings are contract-tested for WCAG AAA (7:1 or higher), except the supplied warning pair. `#92400E` on `#FFFBEB` measures 6.84:1 (AA, but not AAA), so it is explicitly flagged in the test suite and has not been silently changed from the handoff.

## Spacing-use rules

- The scale uses a 4-point grid from `--space-1` (4px / 0.25rem) through `--space-24` (96px / 6rem).
- `--space-tight-2` is the explicit 8px semantic alias for compact icon-to-label gaps and dense micro-content.
- CSS values use `rem` at a 16px basis; Flutter values are logical pixels. Both derive from the same pixel source value.
- Mobile touch targets should be at least `--space-12` (48px). Desktop mouse targets typically use `--space-9` to `--space-10` (36px–40px).
- Prefer `--space-5` mobile canvas margins and `--space-8` desktop margins; use `--space-4` mobile and `--space-6` desktop gutters as the default responsive baseline.

## Typography-use rules

- The web stack prefers Inter, then Plus Jakarta Sans. Applications are responsible for bundling or loading either font; this token package does not download or include font files.
- Weights are regular (400), medium (500), semibold (600), and the handoff-specified bold display treatment (700). Do not introduce heavier instruction or reminder text.
- `display`, `h1`, `h2`, `h3`, `body-lg`, `body-md`, `caption`, and `micro` have mobile and desktop values. Use the responsive CSS custom properties rather than hardcoded text dimensions.
- Apply `font-feature-settings: var(--typography-feature-tabular-figures)` to timers, schedules, percentages, and analytics figures so changing numbers do not shift the layout.

## Icon-use rules

- Icon boxes use 4px-aligned sizes from 16px (`--icon-size-xs`) to 64px (`--icon-size-4xl`); use the paired stroke token for consistent optical weight.
- Render outline assets for default/rest states and filled assets for active, selected, focused, or successful states.
- Use `--icon-spacing-*` rather than literal gaps around icons. The scale aligns with the shared spacing system.

## Animation & Motion rules

- All motions support product pillars: **Focus** (instant visual feedback with zero cognitive distraction) and **Efficient** (frictionless flow without sluggish animations).
- The 5 discrete durations are:
  - `--duration-fast` (150ms / `duration-150`): Micro-interactions, button hover/press (`scale(0.98)`), focus rings, toggle switch, task completion pop.
  - `--duration-normal` (200ms / `duration-200`): Component transitions, focus card hover elevation (`translateY(-2px)`), dropdown & tooltip open/close.
  - `--duration-moderate` (250ms / `duration-250`): Structural layout shifts, ripple reschedule timeline block movements, tab indicators.
  - `--duration-slow` (300ms / `duration-300`): Surface & modal overlays, Adaptive Reschedule Modal, mobile bottom sheet, backdrop scrim fade.
  - `--duration-deliberate` (400ms / `duration-400`): Expansive content and alerts, task accordion expand/collapse, capacity meter fill, system banners.
- Standard easing curves:
  - `--ease-fluid` (`cubic-bezier(0.4, 0, 0.2, 1)` / `Cubic(0.4, 0.0, 0.2, 1.0)`): Default two-way transitions, colors, borders, and general interactive motion.
  - `--ease-decelerate` (`cubic-bezier(0.0, 0, 0.2, 1)` / `Cubic(0.0, 0.0, 0.2, 1.0)`): Entry transitions when elements land on screen.
  - `--ease-accelerate` (`cubic-bezier(0.4, 0, 1, 1)` / `Cubic(0.4, 0.0, 1.0, 1.0)`): Exit transitions when elements dismiss or leave the screen.

## Shadow & Elevation rules

- Box-shadows adhere to the **2-layer composite formula**:
  - **Layer 1 (Ambient / Grounding Layer)**: Constant `0px 1px 2px 0px rgba(0, 0, 0, 0.30)` anchoring elements to the base canvas.
  - **Layer 2 (Elevation Key Layer)**: Dynamic exponential ($\times 2$) scaling across Y offset, blur, and spread:
    - Level 1: `0px 1px 3px 1px rgba(0, 0, 0, 0.20)`
    - Level 2: `0px 2px 6px 2px rgba(0, 0, 0, 0.20)`
    - Level 3: `0px 4px 12px 4px rgba(0, 0, 0, 0.20)`
    - Level 4: `0px 8px 24px 8px rgba(0, 0, 0, 0.20)`
- Semantic elevation roles:
  - `--shadow-0` (`none`): Flat canvas, idle inputs, flat timeline grid slots (relative z-index: `z-0`).
  - `--shadow-1`: Subtle resting state for regular timeline cards, summary cards, status badges (relative z-index: `z-1`).
  - `--shadow-2`: Raised state for timeline card hover (`translateY(-2px)`), dropdown menus, pressed buttons, active tabs (relative z-index: `z-10`).
  - `--shadow-3`: Floating focus for single-task focus card, sticky time sessions, FABs, toast notifications (relative z-index: `z-20` / `z-30`).
  - `--shadow-4`: Modal overlay for Adaptive Reschedule Modal, bottom sheet, critical action dialogs (relative z-index: `z-40` / `z-50`).

## Maintaining tokens

After changing a file in `tokens/`, regenerate the platform artifacts and run the contract tests:

```sh
npm run generate
npm test
```
