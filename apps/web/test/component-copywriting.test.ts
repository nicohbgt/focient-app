import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  dictionaries,
  idCopywriting,
  enCopywriting,
  formatMinutesLocalized,
} from '../src/component/i18n/copywriting.ts';

test('1. Guilt-Free Vocabulary Compliance in Indonesian and English', () => {
  const punitiveWords = [
    'terlambat',
    'telat',
    'late',
    'overdue',
    'gagal',
    'failed',
    'hukuman',
    'penalty',
  ];

  for (const [locale, dict] of Object.entries(dictionaries)) {
    // Check all user-facing strings (values) in the dictionary
    const valuesToCheck: string[] = [];
    const extractStrings = (obj: Record<string, unknown>) => {
      for (const val of Object.values(obj)) {
        if (typeof val === 'string') valuesToCheck.push(val);
        else if (typeof val === 'object' && val !== null) extractStrings(val as Record<string, unknown>);
      }
    };
    extractStrings(dict as unknown as Record<string, unknown>);

    for (const val of valuesToCheck) {
      for (const word of punitiveWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        assert.ok(
          !regex.test(val),
          `Guilt-free violation: Dictionary '${locale}' contains punitive word "${word}" in "${val}"!`
        );
      }
    }
  }

  // Indonesian checks
  assert.equal(idCopywriting.adaptive.rescheduleNotice, 'Perlu Penyesuaian Jadwal');
  assert.equal(idCopywriting.actions.applyAdjustment, 'Terapkan Penyesuaian');
  assert.equal(idCopywriting.actions.shiftToNextSlot, 'Geser ke Jam Berikutnya');

  // English checks
  assert.equal(enCopywriting.adaptive.rescheduleNotice, 'Schedule Adjustment Needed');
  assert.equal(enCopywriting.actions.applyAdjustment, 'Apply Adjustment');
  assert.equal(enCopywriting.actions.shiftToNextSlot, 'Shift to Next Slot');
});

test('2. Multi-language dictionary structure and formatting integrity', () => {
  const locales = ['id', 'en'] as const;

  for (const loc of locales) {
    const dict = dictionaries[loc];
    assert.ok(dict, `Dictionary for ${loc} must exist`);

    assert.ok(dict.actions, 'actions subtree exists');
    assert.ok(dict.status, 'status subtree exists');
    assert.ok(dict.adaptive, 'adaptive subtree exists');
    assert.ok(dict.capacity, 'capacity subtree exists');
    assert.ok(dict.navigation, 'navigation subtree exists');
    assert.ok(dict.cards, 'cards subtree exists');
    assert.ok(dict.forms, 'forms subtree exists');
    assert.ok(dict.dialogs, 'dialogs subtree exists');
    assert.ok(dict.toasts, 'toasts subtree exists');
    assert.ok(dict.keyboard, 'keyboard subtree exists');
  }

  // Localized minutes formatting check
  assert.equal(formatMinutesLocalized(90, idCopywriting), '1j 30m');
  assert.equal(formatMinutesLocalized(45, idCopywriting), '45mnt');
  assert.equal(formatMinutesLocalized(120, idCopywriting), '2j');

  assert.equal(formatMinutesLocalized(90, enCopywriting), '1h 30m');
  assert.equal(formatMinutesLocalized(45, enCopywriting), '45min');
  assert.equal(formatMinutesLocalized(120, enCopywriting), '2h');
});

test('3. CSS Specification & Guardrails Verification', async () => {
  const css = await readFile(new URL('../src/component/components.css', import.meta.url), 'utf8');

  // Tabular figures
  assert.ok(css.includes('tabular-nums'), 'CSS must include tabular-nums');
  assert.ok(css.includes('tnum'), 'CSS must include tnum');

  // Focus-visible ring
  assert.ok(css.includes(':focus-visible'), 'CSS must define :focus-visible rules');
  assert.ok(css.includes('#BFDBFE'), 'CSS must use #BFDBFE focus ring');

  // Reduced motion support
  assert.ok(css.includes('prefers-reduced-motion: reduce'), 'CSS must support prefers-reduced-motion');

  // Hit target verification
  assert.ok(css.includes('min-height: 48px'), 'CSS must specify 48px touch targets');
  assert.ok(css.includes('min-width: 48px'), 'CSS must specify 48px touch targets');

  // Guilt-free reschedule styling
  assert.ok(css.includes('.focient-card--reschedule'), 'CSS has reschedule card class');
  assert.ok(css.includes('#FFFBEB'), 'Reschedule card uses gentle amber background');
  assert.ok(css.includes('#FDE68A'), 'Reschedule card uses gentle amber border');

  // Virtual Keyboard styling & touch safety
  assert.ok(css.includes('.focient-keyboard'), 'CSS has .focient-keyboard');
  assert.ok(css.includes('.focient-keyboard-sheet'), 'CSS has .focient-keyboard-sheet for mobile');
  assert.ok(css.includes('.focient-key--num'), 'CSS has .focient-key--num');
  assert.ok(css.includes('.focient-key--letter'), 'CSS has .focient-key--letter');
});

test('4. Component Structure and Export Verification', async () => {
  // Read index.ts and primitive / organism files directly to verify exports
  const indexTs = await readFile(new URL('../src/component/index.ts', import.meta.url), 'utf8');
  const primitiveTs = await readFile(new URL('../src/component/primitive/index.ts', import.meta.url), 'utf8');
  const organismTs = await readFile(new URL('../src/component/organism/index.ts', import.meta.url), 'utf8');

  // Primitives
  const requiredPrimitives = [
    'Button',
    'InputField',
    'Checkbox',
    'Badge',
    'Tag',
    'Chip',
    'Radio',
    'Toggle',
    'Tooltip',
    'Keyboard',
  ];
  for (const prim of requiredPrimitives) {
    assert.ok(primitiveTs.includes(prim), `Primitive index must export ${prim}`);
  }

  // Keyboard Component Specific Exports
  const keyboardTs = await readFile(new URL('../src/component/primitive/Keyboard.tsx', import.meta.url), 'utf8');
  assert.ok(keyboardTs.includes('export const Keyboard'), 'Keyboard.tsx must export Keyboard');
  assert.ok(keyboardTs.includes('export const NumericKeyboard'), 'Keyboard.tsx must export NumericKeyboard');
  assert.ok(keyboardTs.includes('export const GeneralKeyboard'), 'Keyboard.tsx must export GeneralKeyboard');
  assert.ok(keyboardTs.includes('export const MobileKeyboardBottomSheet'), 'Keyboard.tsx must export MobileKeyboardBottomSheet');

  // Organisms
  const requiredOrganisms = ['TaskCard', 'DailyCapacityMeter', 'RescheduleAlert', 'NavBar', 'Toast', 'Modal'];
  for (const org of requiredOrganisms) {
    assert.ok(organismTs.includes(org), `Organism index must export ${org}`);
  }

  // All 7 Card Suite exports in TaskCard.tsx
  const taskCardTs = await readFile(new URL('../src/component/organism/TaskCard.tsx', import.meta.url), 'utf8');
  const requiredCards = [
    'FocusTaskCard',
    'Top3PriorityCard',
    'TimelineTaskCard',
    'AdaptiveRescheduleCard',
    'BacklogTaskCard',
    'CompletedTaskCard',
  ];
  for (const card of requiredCards) {
    assert.ok(taskCardTs.includes(`export const ${card}`), `TaskCard.tsx must export ${card}`);
  }

  // DailyCapacityMeterCard in DailyCapacityMeter.tsx
  const capacityTs = await readFile(new URL('../src/component/organism/DailyCapacityMeter.tsx', import.meta.url), 'utf8');
  assert.ok(capacityTs.includes('export const DailyCapacityMeterCard'), 'DailyCapacityMeter.tsx must export DailyCapacityMeterCard');

  // ComponentShowcase
  assert.ok(indexTs.includes('ComponentShowcase'), 'Root index must export ComponentShowcase');
});

test('5. Lucide Icon System and Token Assets Verification', async () => {
  const iconsIndexTs = await readFile(new URL('../src/component/icons/index.ts', import.meta.url), 'utf8');
  assert.ok(iconsIndexTs.includes('Icon'), 'icons/index.ts must export Icon');
  assert.ok(iconsIndexTs.includes('named-icons'), 'icons/index.ts must export named-icons');

  const namedIconsTs = await readFile(new URL('../src/component/icons/named-icons.tsx', import.meta.url), 'utf8');
  const expectedNamedIcons = [
    'CheckIcon',
    'CheckCircleIcon',
    'CircleIcon',
    'ClockIcon',
    'CalendarIcon',
    'CalendarClockIcon',
    'TargetIcon',
    'SparklesIcon',
    'RotateCcwIcon',
    'PlayIcon',
    'PauseIcon',
    'PencilIcon',
    'TrashIcon',
    'PlusIcon',
    'PlusCircleIcon',
    'XIcon',
    'XCircleIcon',
    'ChevronDownIcon',
    'ChevronUpIcon',
    'ChevronRightIcon',
    'ChevronLeftIcon',
    'ArrowRightIcon',
    'ArrowLeftIcon',
    'SearchIcon',
    'FilterIcon',
    'TagIcon',
    'AlertTriangleIcon',
    'AlertCircleIcon',
    'InfoIcon',
    'BarChartIcon',
    'TrendingUpIcon',
    'SunIcon',
    'MoonIcon',
    'BellIcon',
    'GripVerticalIcon',
    'LayoutDashboardIcon',
  ];

  for (const iconName of expectedNamedIcons) {
    assert.ok(namedIconsTs.includes(`export const ${iconName}`), `named-icons.tsx must export ${iconName}`);
  }

  // Verify SVG icon assets in ui-token package
  const tokenIconsDir = new URL('../../../packages/ui-token/assets/icons/outline/', import.meta.url);
  const sampleIcon = await readFile(new URL('clock.svg', tokenIconsDir), 'utf8');
  assert.ok(sampleIcon.includes('viewBox="0 0 24 24"'), 'Lucide clock.svg must have 24x24 viewBox');
  assert.ok(sampleIcon.includes('stroke="currentColor"'), 'Lucide clock.svg must use stroke="currentColor"');
  assert.ok(sampleIcon.includes('fill="none"'), 'Lucide clock.svg outline must use fill="none"');

  const filledIconsDir = new URL('../../../packages/ui-token/assets/icons/filled/', import.meta.url);
  const sampleFilledIcon = await readFile(new URL('sparkles.svg', filledIconsDir), 'utf8');
  assert.ok(sampleFilledIcon.includes('viewBox="0 0 24 24"'), 'Lucide sparkles.svg must have 24x24 viewBox');
  assert.ok(sampleFilledIcon.includes('fill="currentColor"'), 'Filled sparkles.svg must have fill="currentColor"');
});
