import React, { useState } from 'react';
import {
  FoCientI18nProvider,
  useFoCientI18n,
  LanguageSwitcher,
} from './i18n/index.js';
import {
  Button,
  InputField,
  Checkbox,
  Badge,
  Tag,
  Chip,
  Radio,
  RadioCard,
  Toggle,
  Tooltip,
  Keyboard,
  NumericKeyboard,
  GeneralKeyboard,
  MobileKeyboardBottomSheet,
  Skeleton,
} from './primitive/index.js';
import { Accordion } from './molecule/index.js';
import {
  TaskCard,
  FocusTaskCard,
  Top3PriorityCard,
  TimelineTaskCard,
  AdaptiveRescheduleCard,
  BacklogTaskCard,
  CompletedTaskCard,
  DailyCapacityMeter,
  DailyCapacityMeterCard,
  RescheduleAlert,
  TopNavBar,
  SideNavBar,
  BottomNavBar,
  Alert,
  ToastContainer,
  ToastMessage,
  BottomSheet,
  AdaptiveRescheduleModal,
  QuickTaskEntryModal,
  DestructiveModal,
  TaskValidationForm,
  OnboardingValidationForm,
  AdaptiveScheduleConfirmModal,
  InlineModuleFail,
  SyncConflictAlert,
  FullViewError,
  EmptyState,
  EmptyStateVariant,
  TaskCardSkeleton,
  CapacityMeterSkeleton,
  AdaptiveSyncBadge,
  TopProgressBar,
  DailySuccessBanner,
  CommandPalette,
  ContextPreservationDialog,
} from './organism/index.js';
import {
  Icon,
  IconName,
  IconSize,
  IconVariant,
  CalendarIcon,
  ClockIcon,
  SparklesIcon,
  BarChartIcon,
  LayoutDashboardIcon,
  CheckIcon,
  TargetIcon,
  TagIcon,
  BellIcon,
  PlayIcon,
  SearchIcon,
  FilterIcon,
  PlusIcon,
} from './icons/index.js';

const ALL_ICONS: { name: IconName; category: 'action' | 'navigation' | 'feedback' | 'time' | 'utility' }[] = [
  { name: 'check', category: 'action' },
  { name: 'check-circle', category: 'action' },
  { name: 'circle', category: 'action' },
  { name: 'plus', category: 'action' },
  { name: 'plus-circle', category: 'action' },
  { name: 'x', category: 'action' },
  { name: 'x-circle', category: 'action' },
  { name: 'pencil', category: 'action' },
  { name: 'trash-2', category: 'action' },
  { name: 'play', category: 'action' },
  { name: 'pause', category: 'action' },
  { name: 'rotate-ccw', category: 'action' },
  { name: 'clock', category: 'time' },
  { name: 'calendar', category: 'time' },
  { name: 'calendar-clock', category: 'time' },
  { name: 'target', category: 'time' },
  { name: 'layout-dashboard', category: 'navigation' },
  { name: 'chevron-down', category: 'navigation' },
  { name: 'chevron-up', category: 'navigation' },
  { name: 'chevron-right', category: 'navigation' },
  { name: 'chevron-left', category: 'navigation' },
  { name: 'arrow-right', category: 'navigation' },
  { name: 'arrow-left', category: 'navigation' },
  { name: 'grip-vertical', category: 'navigation' },
  { name: 'alert-triangle', category: 'feedback' },
  { name: 'alert-circle', category: 'feedback' },
  { name: 'info', category: 'feedback' },
  { name: 'trending-up', category: 'feedback' },
  { name: 'bar-chart-2', category: 'feedback' },
  { name: 'search', category: 'utility' },
  { name: 'filter', category: 'utility' },
  { name: 'tag', category: 'utility' },
  { name: 'bell', category: 'utility' },
  { name: 'sparkles', category: 'utility' },
  { name: 'sun', category: 'utility' },
  { name: 'moon', category: 'utility' },
];

export const ComponentShowcaseInner: React.FC = () => {
  const { locale, setLocale, copywriting } = useFoCientI18n();

  // State for interactive primitive controls
  const [btnLoading, setBtnLoading] = useState(false);
  const [inputText, setInputText] = useState('Merancang Arsitektur FoCient');
  const [inputDuration, setInputDuration] = useState('45');
  const [inputError, setInputError] = useState('');
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(true);
  const [checkbox3, setCheckbox3] = useState(false);
  const [selectedChip, setSelectedChip] = useState('semua');
  const [selectedRadio, setSelectedRadio] = useState('focus-25');
  const [toggleState, setToggleState] = useState(true);
  const [sideNavCollapsed, setSideNavCollapsed] = useState(false);

  // Dynamic capacity & interactive states playground
  const [capacityMinutes, setCapacityMinutes] = useState(260); // 260m / 360m = ~72%
  const [isSimulatedDragging, setIsSimulatedDragging] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  // Virtual Keyboard state
  const [testNumberValue, setTestNumberValue] = useState('45');
  const [testTextValue, setTestTextValue] = useState('Sesi Fokus FoCient');
  const [mobileKeyboardOpen, setMobileKeyboardOpen] = useState(false);
  const [mobileKeyboardMode, setMobileKeyboardMode] = useState<'number' | 'general'>('number');

  // Modals state
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [quickTaskModalOpen, setQuickTaskModalOpen] = useState(false);
  const [destructiveModalOpen, setDestructiveModalOpen] = useState(false);
  const [adaptiveValidationModalOpen, setAdaptiveValidationModalOpen] = useState(false);

  // Lucide Icon Gallery State
  const [iconSearch, setIconSearch] = useState('');
  const [galleryIconSize, setGalleryIconSize] = useState<IconSize>('sm');
  const [galleryIconVariant, setGalleryIconVariant] = useState<IconVariant>('outline');

  const filteredIcons = ALL_ICONS.filter((item) =>
    item.name.toLowerCase().includes(iconSearch.trim().toLowerCase())
  );

  // Reschedule Alert banner state
  const [alertOpen, setAlertOpen] = useState(true);

  // Error & Fail States interactive state
  const [btnShake, setBtnShake] = useState(false);
  const [microFailLoading, setMicroFailLoading] = useState(false);
  const [showFullViewPreview, setShowFullViewPreview] = useState(false);
  const [fullViewType, setFullViewType] = useState<'offline' | 'server'>('offline');
  const [inlineModuleRetrying, setInlineModuleRetrying] = useState(false);
  const [interactiveErrorField, setInteractiveErrorField] = useState('45xx');
  const [interactiveErrorActive, setInteractiveErrorActive] = useState(true);

  // Empty State interactive playground
  const [selectedEmptyVariant, setSelectedEmptyVariant] = useState<EmptyStateVariant>('onboarding');

  // Loading State interactive playground
  const [topBarLoading, setTopBarLoading] = useState(false);
  const [simulatedCardLoading, setSimulatedCardLoading] = useState(false);
  const [simulatedCapacityLoading, setSimulatedCapacityLoading] = useState(false);

  // Success State interactive playground
  const [successBtnLoading, setSuccessBtnLoading] = useState(false);
  const [successBtnDone, setSuccessBtnDone] = useState(false);
  const [demoTaskCompleted, setDemoTaskCompleted] = useState(false);
  const [dailyBannerDismissed, setDailyBannerDismissed] = useState(false);

  // Microinteraction interactive playground
  const [interactiveWorkload, setInteractiveWorkload] = useState(65);
  const [rippleShiftActive, setRippleShiftActive] = useState(false);
  const [accordionDemoExpanded, setAccordionDemoExpanded] = useState(false);

  // Navigation Interactive Playground State
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [preservationDialogOpen, setPreservationDialogOpen] = useState(false);
  const [showcaseDate, setShowcaseDate] = useState('Hari Ini, 24 Okt');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([
    {
      id: '1',
      message: copywriting.toasts.taskCompleted('Riset Token DTCG FoCient'),
      actionLabel: copywriting.actions.undo,
      duration: 6000,
    },
  ]);

  const addToast = (
    message: string,
    actionLabel?: string,
    variant: 'default' | 'danger' | 'success' = 'default',
    onAction?: () => void
  ) => {
    setToasts((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        message,
        variant,
        actionLabel,
        onAction,
        duration: variant === 'danger' ? 7000 : actionLabel ? 6000 : 4000,
      },
    ]);
  };

  const triggerMicroActionFail = () => {
    setMicroFailLoading(true);
    setBtnShake(false);
    setTimeout(() => {
      setMicroFailLoading(false);
      setBtnShake(true);
      setTimeout(() => setBtnShake(false), 300);
      addToast(
        copywriting.errorStates.microFailToast,
        copywriting.errorStates.retryAction,
        'danger',
        () => triggerMicroActionFail()
      );
    }, 600);
  };

  const handleSimulateButtonSave = () => {
    setSuccessBtnLoading(true);
    setSuccessBtnDone(false);
    setTimeout(() => {
      setSuccessBtnLoading(false);
      setSuccessBtnDone(true);
      addToast(
        copywriting.successStates.savedSuccess,
        copywriting.successStates.undoAction,
        'success',
        () => {
          setSuccessBtnDone(false);
          addToast('Perubahan dibatalkan');
        }
      );
      setTimeout(() => {
        setSuccessBtnDone(false);
      }, 2500);
    }, 700);
  };

  const handleToggleDemoTask = (checked: boolean) => {
    setDemoTaskCompleted(checked);
    if (checked) {
      addToast(
        copywriting.successStates.taskCompletedUndo('Sesi Fokus Mendalam FoCient'),
        copywriting.successStates.undoAction,
        'success',
        () => {
          setDemoTaskCompleted(false);
        }
      );
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, sans-serif' }}>
      {/* Global Top Micro Progress Bar */}
      <TopProgressBar loading={topBarLoading} />

      {/* Top Navigation */}
      <TopNavBar
        workloadPercentage={72}
        dateLabel={showcaseDate}
        showDateNavigator={true}
        onNavigateDate={(dir) => {
          if (dir === 'today') {
            setShowcaseDate(locale === 'id' ? 'Hari Ini, 24 Okt' : 'Today, Oct 24');
            addToast(locale === 'id' ? 'Kembali ke Hari Ini' : 'Jumped to Today');
          } else if (dir === 'prev') {
            setShowcaseDate(locale === 'id' ? 'Kemarin, 23 Okt' : 'Yesterday, Oct 23');
            addToast(locale === 'id' ? 'Melihat Hari Sebelumnya' : 'Viewing Previous Day');
          } else if (dir === 'next') {
            setShowcaseDate(locale === 'id' ? 'Besok, 25 Okt' : 'Tomorrow, Oct 25');
            addToast(locale === 'id' ? 'Melihat Hari Berikutnya' : 'Viewing Next Day');
          }
        }}
        onSearchClick={() => setCommandPaletteOpen(true)}
        onNotificationsClick={() => setRescheduleModalOpen(true)}
      />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
        
        {/* Header Hero & Language Switcher Banner */}
        <section style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '24px' }}>⚡</span>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#1E3A8A' }}>
                FoCient Living Component System & Showcase
              </h2>
            </div>
            <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>
              DTCG Semantic Tokens • 4-Point Grid • WCAG 2.1 AAA • Multi-Language (ID / EN) • Guilt-Free UX
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
              {copywriting.navigation.switchLanguage}:
            </span>
            <LanguageSwitcher />
          </div>
        </section>

        {/* Guilt-Free Reschedule Alert Banner */}
        <section>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '12px' }}>
            Adaptive System Feedback (Banner & Alert)
          </h3>
          <RescheduleAlert
            open={alertOpen}
            onApply={() => {
              setRescheduleModalOpen(true);
            }}
            onDismiss={() => {
              setAlertOpen(false);
              addToast(copywriting.adaptive.gentleReminder);
            }}
          />
        </section>

        {/* Section 2: Form Controls & Atomic Primitives */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ borderBottom: '2px solid #E2E8F0', paddingBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
              2. Form Controls & Atomic Primitives
            </h3>
          </div>

          {/* Buttons Suite */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>A. Button Variants & Sizes</h4>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              <Button size="lg" variant="primary">
                Large Primary (48px)
              </Button>
              <Button size="md" variant="primary">
                Medium CTA (40px)
              </Button>
              <Button size="sm" variant="primary">
                Small (32px)
              </Button>
              <Button size="md" variant="secondary">
                {copywriting.actions.applyAdjustment} (Secondary #0D9488)
              </Button>
              <Button size="md" variant="outline">
                Outline Border (#CBD5E1)
              </Button>
              <Button size="md" variant="ghost">
                {copywriting.actions.adjust} (Ghost)
              </Button>
              <Button size="md" variant="destructive" onClick={() => setDestructiveModalOpen(true)}>
                {copywriting.actions.delete} (Destructive)
              </Button>
              <Button size="md" variant="subtle-primary">
                Subtle Primary
              </Button>
              <Button size="md" variant="subtle-secondary">
                Subtle Secondary
              </Button>
              <Button
                size="md"
                variant="primary"
                loading={btnLoading}
                onClick={() => {
                  setBtnLoading(true);
                  setTimeout(() => setBtnLoading(false), 1500);
                }}
              >
                {btnLoading ? 'Loading...' : 'Click to Test Loading'}
              </Button>
              <Button size="md" variant="primary" disabled>
                Disabled Button
              </Button>
            </div>
          </div>

          {/* Input Fields */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>B. InputField Variants</h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <InputField
                label={copywriting.forms.taskTitleLabel}
                placeholder={copywriting.forms.taskTitlePlaceholder}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                clearable
                onClear={() => setInputText('')}
                helperText="Clean 2px cobalt focus state"
              />

              <InputField
                label="Search Task (with Leading Icon)"
                variant="search"
                placeholder={copywriting.navigation.searchPlaceholder}
              />

              <InputField
                label={copywriting.forms.durationLabel}
                variant="numeric"
                unit={copywriting.capacity.minutesShort}
                value={inputDuration}
                onChange={(e) => setInputDuration(e.target.value)}
                helperText={copywriting.forms.realisticDurationHelper}
              />

              <InputField
                label="Password / Masked"
                variant="password"
                placeholder="••••••••"
                defaultValue="supersecret"
              />

              <InputField
                label="Dropdown / Select"
                variant="select"
                options={[
                  { value: 'p1', label: 'Pilar 1: Pekerjaan Inti' },
                  { value: 'p2', label: 'Pilar 2: Pembelajaran Mandiri' },
                  { value: 'p3', label: 'Pilar 3: Kebugaran & Istirahat' },
                ]}
              />

              <InputField
                label="Solutive Non-Punitive Error"
                value="Data tidak sesuai"
                error={inputError || copywriting.forms.requiredHelper}
                onChange={() => setInputError('')}
              />
            </div>

            <InputField
              label={copywriting.forms.notesLabel}
              variant="textarea"
              placeholder={copywriting.forms.notesPlaceholder}
              defaultValue="Fokus mendalam 45 menit tanpa gangguan notifikasi eksternal."
            />
          </div>

          {/* Checkboxes, Badges, Tags, Chips, Radios & Toggles */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {/* Checkbox States */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>C. Checkbox States</h4>
              <Checkbox
                checked={checkbox1}
                onChange={setCheckbox1}
                label="Unchecked / Default"
              />
              <Checkbox
                checked={checkbox2}
                onChange={setCheckbox2}
                strikethroughOnChecked
                label="Checked with Strikethrough"
              />
              <Checkbox
                checked={true}
                variant="success"
                onChange={() => {}}
                label="Checked Success (#059669)"
              />
              <Checkbox
                checked={false}
                indeterminate={true}
                onChange={() => {}}
                label="Indeterminate Subtask"
              />
              <Checkbox
                checked={false}
                needsAdjustment={true}
                onChange={() => {}}
                label={copywriting.status.needsAdjustment + " (Amber Icon, Zero Red)"}
              />
              <Checkbox
                checked={false}
                disabled
                onChange={() => {}}
                label="Disabled State"
              />
            </div>

            {/* Badges, Tags, & Chips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>D. Badges, Tags & Chips</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <Badge variant="focus">#TopPriority</Badge>
                <Badge variant="neutral">45mnt</Badge>
                <Badge variant="accent">Pilar Khusus</Badge>
                <Badge variant="warning">⚡ 92% Kapasitas</Badge>
                <Badge variant="success">Selesai</Badge>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <Tag label="Engineering" variant="blue" />
                <Tag label="Design System" variant="teal" />
                <Tag label="Strategic Planning" variant="purple" />
                <Tag label="Personal Health" variant="emerald" />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <Chip
                  label="Semua (Filter)"
                  selected={selectedChip === 'semua'}
                  onClick={() => setSelectedChip('semua')}
                />
                <Chip
                  label="Hari Ini"
                  selected={selectedChip === 'hari-ini'}
                  onClick={() => setSelectedChip('hari-ini')}
                />
                <Chip
                  label="Dismissible Tag"
                  onDismiss={() => addToast('Tag removed')}
                />
              </div>
            </div>

            {/* Radios & Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>E & F. Radio, Card & Toggle</h4>
              <Radio
                value="opt-1"
                checked={selectedRadio === 'opt-1'}
                onChange={setSelectedRadio}
                label="Standard Focus (Cobalt #2563EB)"
              />
              <Radio
                value="opt-2"
                variant="adaptive"
                checked={selectedRadio === 'opt-2'}
                onChange={setSelectedRadio}
                label="Adaptive Option (Teal #0D9488)"
              />

              <div style={{ marginTop: '4px' }}>
                <RadioCard
                  value="focus-25"
                  checked={selectedRadio === 'focus-25'}
                  onChange={setSelectedRadio}
                  title="25 Menit (Sprint Pomodoro)"
                  subtitle="Ideal untuk tugas cepat tanpa distraksi"
                  trailingBadge={<Badge variant="focus">25m</Badge>}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                <Toggle
                  checked={toggleState}
                  onChange={setToggleState}
                  label="Elastic Toggle"
                />
                <Toggle
                  size="compact"
                  checked={toggleState}
                  onChange={setToggleState}
                  label="Compact (Desktop)"
                />
              </div>
            </div>

            {/* Tooltips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>G. Calm UI Soft Light Tooltip</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <Tooltip content={copywriting.adaptive.focusGuidance} variant="neutral">
                  <Button variant="ghost" size="sm">Hover Neutral Tooltip</Button>
                </Tooltip>
                <Tooltip content={copywriting.adaptive.rescheduleGuidance} variant="adaptive">
                  <Button variant="ghost" size="sm">Hover Adaptive Tooltip</Button>
                </Tooltip>
                <Tooltip content={copywriting.adaptive.capacityWarning} variant="info">
                  <Button variant="ghost" size="sm">Hover Info Tooltip</Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Mobile Virtual Keyboard (Number & General) */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                3. Mobile Virtual Keyboard (Number & General String Inputs)
              </h3>
              <p style={{ margin: 0, color: '#64748B', fontSize: '13px' }}>
                Touch-safe ($\ge 48$px), tabular-nums, tactile active press, multi-language (ID/EN)
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setMobileKeyboardMode('number');
                  setMobileKeyboardOpen(true);
                }}
              >
                📱 Open Mobile Number Sheet
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setMobileKeyboardMode('general');
                  setMobileKeyboardOpen(true);
                }}
              >
                📱 Open Mobile Text Sheet
              </Button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            
            {/* Number Keyboard (Integer input e.g. duration) */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>
                  A. Number Keyboard (Int / Duration)
                </h4>
                <Badge variant="focus">Integer Mode</Badge>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                Mendukung preset cepat (+15m, +30m, dll.), angka tabular `tnum`, dan tombol hapus/bersihkan.
              </p>

              <NumericKeyboard
                value={testNumberValue}
                previewLabel="Estimasi Durasi (Menit)"
                onChange={setTestNumberValue}
                onSubmit={(val) => addToast(`Durasi tersimpan: ${val} ${copywriting.capacity.minutesShort}`)}
              />
            </div>

            {/* General Keyboard (String input e.g. task title) */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>
                  B. General Keyboard (String / QWERTY)
                </h4>
                <Badge variant="neutral">String Mode</Badge>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                Mendukung tombol Shift (Kapital), simbol ?123, spasi, dan aksi Selesai/Done.
              </p>

              <GeneralKeyboard
                value={testTextValue}
                previewLabel="Judul Tugas Baru"
                onChange={setTestTextValue}
                onSubmit={(val) => addToast(`Teks disimpan: "${val}"`)}
              />
            </div>

          </div>

          {/* Integrated InputField with Virtual Keyboard */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
              C. Integrated InputField + Auto Virtual Keyboard Trigger
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
              Klik ikon keyboard di sisi kanan kolom input untuk membuka keyboard virtual bawah (mobile bottom sheet):
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <InputField
                label="Durasi Tugas (Klik Ikon Keyboard)"
                variant="numeric"
                unit={copywriting.capacity.minutesShort}
                value={testNumberValue}
                onChange={(e) => setTestNumberValue(e.target.value)}
                enableVirtualKeyboard={true}
                virtualKeyboardMode="number"
                helperText="Menampilkan Number Keyboard Bottom Sheet"
              />
              <InputField
                label="Judul Tugas (Klik Ikon Keyboard)"
                value={testTextValue}
                onChange={(e) => setTestTextValue(e.target.value)}
                enableVirtualKeyboard={true}
                virtualKeyboardMode="general"
                helperText="Menampilkan General QWERTY Keyboard Bottom Sheet"
              />
            </div>
          </div>
        </section>

        {/* Section 4: All 7 Cards Suite */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
              4. The Complete Cards Suite (All 7 Variants)
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button
                size="sm"
                variant={isSimulatedDragging ? 'primary' : 'ghost'}
                onClick={() => setIsSimulatedDragging((prev) => !prev)}
              >
                {isSimulatedDragging ? '🖐️ Matikan Simulasi Drag' : '🖐️ Uji Dragging (Scale 1.02 & Shadow 3)'}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setMobileSheetOpen(true)}>
                📱 Uji Mobile BottomSheet
              </Button>
              <Button size="sm" variant="primary" onClick={() => setQuickTaskModalOpen(true)}>
                + {copywriting.actions.saveToTimeline}
              </Button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            
            {/* Card 1: Single-Task Focus Card */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                1. Single-Task Focus Card (Active Session)
              </div>
              <FocusTaskCard
                id="c1"
                title="Menyusun Dokumen Arsitektur FoCient"
                notes="Fokus penuh 45 menit tanpa multitasking."
                projectCategory="Core Architecture"
                projectColor="blue"
                progressPercentage={62}
                timerDisplay="18:42"
                onPauseResume={(_, isPaused) => addToast(isPaused ? 'Sesi fokus dijeda' : 'Sesi fokus dilanjutkan')}
                onToggleComplete={(_, completed) => addToast(copywriting.toasts.taskCompleted('Dokumen Arsitektur'))}
              />
            </div>

            {/* Card 2: Top 3 Priority Card */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                2. Top 3 Priority Card
              </div>
              <Top3PriorityCard
                id="c2"
                priorityRank={1}
                title="Integrasi Token DTCG & WCAG AAA"
                duration="30mnt"
                projectCategory="Design System"
                projectColor="teal"
                notes="Verifikasi kontras teks bold dan rasio 7:1"
                isDragging={isSimulatedDragging}
                onToggleComplete={(_, completed) => addToast('Status tugas diperbarui')}
              />
            </div>

            {/* Card 3: Timeline / Scheduled Task Card */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                3. Timeline / Scheduled Task Card
              </div>
              <TimelineTaskCard
                id="c3"
                timeSlot="10:30 - 11:15"
                title="Sinkronisasi Jadwal dengan Tim Engineering"
                duration="45m"
                projectCategory="Coordination"
                projectColor="purple"
                onAdjust={() => setRescheduleModalOpen(true)}
              />
            </div>

            {/* Card 4: Guilt-Free Adaptive / Reschedule Card */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                4. Guilt-Free Adaptive / Reschedule Card (Zero Red / Non-punitive)
              </div>
              <AdaptiveRescheduleCard
                id="c4"
                title="Review Kode Pull Request #42"
                duration="30m"
                onShiftNextSlot={() => {
                  addToast(copywriting.toasts.taskAdjusted);
                }}
              />
            </div>

            {/* Card 5: Backlog / Unscheduled Task Card */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                5. Backlog / Unscheduled Task Card
              </div>
              <BacklogTaskCard
                id="c5"
                title="Membaca Dokumentasi Prisma 5 Engine"
                duration="20mnt"
                onAddToToday={() => addToast(copywriting.toasts.taskAdded('Prisma 5 Engine'))}
              />
            </div>

            {/* Card 6: Completed Task Card */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                6. Completed Task Card
              </div>
              <CompletedTaskCard
                id="c6"
                title="Inisialisasi Token Warna Baku FoCient"
                duration="15mnt"
                onToggleComplete={() => addToast('Tugas dipindahkan kembali ke aktif')}
              />
            </div>

            {/* Card 7: Daily Capacity Meter & Analytics Card */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                7. Daily Capacity Meter & Analytics Card
              </div>
              <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <Button size="sm" variant={capacityMinutes < 180 ? 'primary' : 'ghost'} onClick={() => setCapacityMinutes(120)}>
                    Ringan (&lt;50%): 120m
                  </Button>
                  <Button size="sm" variant={capacityMinutes >= 180 && capacityMinutes <= 270 ? 'primary' : 'ghost'} onClick={() => setCapacityMinutes(240)}>
                    Optimal (50-75%): 240m
                  </Button>
                  <Button size="sm" variant={capacityMinutes > 270 && capacityMinutes <= 324 ? 'primary' : 'ghost'} onClick={() => setCapacityMinutes(300)}>
                    Mendekati (76-90%): 300m
                  </Button>
                  <Button size="sm" variant={capacityMinutes > 324 ? 'secondary' : 'ghost'} onClick={() => setCapacityMinutes(345)}>
                    Overload (&gt;90%): 345m
                  </Button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={capacityMinutes}
                  onChange={(e) => setCapacityMinutes(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0D9488' }}
                  aria-label="Alokasi Menit Beban Kerja Harian"
                />
              </div>
              <DailyCapacityMeterCard
                allocatedMinutes={capacityMinutes}
                totalCapacityMinutes={360}
                onOverloadDetected={() => {}}
              />
            </div>
          </div>
        </section>

        {/* Section 5: Lucide Icon Assets & Token System */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                5. Lucide Icon Assets & Token Scale System
              </h3>
              <p style={{ margin: 0, color: '#64748B', fontSize: '13px' }}>
                Canonical Lucide 24×24 geometry • 8 DTCG token sizes (16px–64px) • Outline & Filled active variants • Zero-guilt color inheritance
              </p>
            </div>
            <Badge variant="focus" size="sm">
              36 Outline + 6 Filled SVGs
            </Badge>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Interactive Filter Toolbar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: '1 1 260px', maxWidth: '360px' }}>
                <InputField
                  placeholder="Cari ikon (cth: clock, check, tag)..."
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  variant="search"
                  clearable
                  onClear={() => setIconSearch('')}
                />
              </div>

              {/* Size Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Ukuran:</span>
                {(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] as IconSize[]).map((sz) => (
                  <button
                    key={String(sz)}
                    type="button"
                    onClick={() => setGalleryIconSize(sz)}
                    className={[
                      'focient-btn',
                      'focient-btn--sm',
                      galleryIconSize === sz ? 'focient-btn--primary' : 'focient-btn--ghost',
                    ].join(' ')}
                    style={{ padding: '4px 10px', fontSize: '12px', height: '28px' }}
                  >
                    {sz}
                  </button>
                ))}
              </div>

              {/* Variant Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Style:</span>
                <button
                  type="button"
                  onClick={() => setGalleryIconVariant('outline')}
                  className={[
                    'focient-btn',
                    'focient-btn--sm',
                    galleryIconVariant === 'outline' ? 'focient-btn--primary' : 'focient-btn--ghost',
                  ].join(' ')}
                  style={{ padding: '4px 12px', fontSize: '12px', height: '28px' }}
                >
                  Outline (Resting)
                </button>
                <button
                  type="button"
                  onClick={() => setGalleryIconVariant('filled')}
                  className={[
                    'focient-btn',
                    'focient-btn--sm',
                    galleryIconVariant === 'filled' ? 'focient-btn--primary' : 'focient-btn--ghost',
                  ].join(' ')}
                  style={{ padding: '4px 12px', fontSize: '12px', height: '28px' }}
                >
                  Filled (Active)
                </button>
              </div>
            </div>

            {/* Token Scale Visual Ruler */}
            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                Token Size Scale Reference:
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>
                {[
                  { sz: 'xs' as const, px: '16px', label: 'xs (16px)' },
                  { sz: 'sm' as const, px: '24px', label: 'sm (24px Grid)' },
                  { sz: 'md' as const, px: '32px', label: 'md (32px)' },
                  { sz: 'lg' as const, px: '36px', label: 'lg (36px)' },
                  { sz: 'xl' as const, px: '40px', label: 'xl (40px)' },
                  { sz: '2xl' as const, px: '48px', label: '2xl (48px)' },
                  { sz: '3xl' as const, px: '56px', label: '3xl (56px)' },
                  { sz: '4xl' as const, px: '64px', label: '4xl (64px)' },
                ].map((item) => (
                  <div key={item.sz} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '64px', color: '#1E3A8A' }}>
                      <Icon name="sparkles" size={item.sz} variant={galleryIconVariant} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Grid of Icons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
              {filteredIcons.map((iconItem) => {
                const isFilledAvailable = ['check-circle', 'target', 'sparkles', 'play', 'tag', 'bell'].includes(iconItem.name);
                const activeVariant = galleryIconVariant === 'filled' && isFilledAvailable ? 'filled' : 'outline';

                return (
                  <button
                    key={iconItem.name}
                    type="button"
                    onClick={() => {
                      const codeSnippet = `<Icon name="${iconItem.name}" size="${galleryIconSize}" />`;
                      navigator.clipboard?.writeText(codeSnippet);
                      addToast(`Disalin: ${codeSnippet}`);
                    }}
                    title={`Klik untuk menyalin kode: <Icon name="${iconItem.name}" />`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '16px 8px',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      color: '#1E293B',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3B82F6';
                      e.currentTarget.style.backgroundColor = '#EFF6FF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    <div style={{ minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E3A8A' }}>
                      <Icon name={iconItem.name} size={galleryIconSize} variant={activeVariant} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: '#334155', textAlign: 'center', wordBreak: 'break-word', fontFamily: 'monospace' }}>
                      {iconItem.name}
                    </span>
                    {isFilledAvailable && (
                      <span style={{ fontSize: '9px', background: '#DBEAFE', color: '#1E40AF', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                        Outline + Fill
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {filteredIcons.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                Tidak ada ikon yang sesuai dengan kata kunci "{iconSearch}".
              </div>
            )}
          </div>
        </section>

        {/* Section 6: Navigation Suites (Desktop SideNavBar & Mobile BottomNavBar) */}
        <section style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
                6. Desktop SideNavBar & Mobile BottomNavBar Suites
              </h3>
              <p style={{ margin: 0, color: '#64748B', fontSize: '13px' }}>
                Full Lucide icon navigation integration • Responsive layout transitions • Direct quick actions
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button size="sm" variant="primary" onClick={() => setCommandPaletteOpen(true)}>
                ⌘K Buka Command Palette
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setPreservationDialogOpen(true)}>
                🛡️ Uji Context Preservation
              </Button>
            </div>
          </div>

          <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden', height: '360px', display: 'flex' }}>
            <SideNavBar
              collapsed={sideNavCollapsed}
              onToggleCollapse={() => setSideNavCollapsed((prev) => !prev)}
              allocatedMinutes={260}
              totalCapacityMinutes={360}
              items={[
                {
                  id: 'today',
                  label: copywriting.navigation.todayPlan,
                  active: true,
                  icon: <CalendarIcon size="sm" />,
                },
                {
                  id: 'timeline',
                  label: copywriting.navigation.timeline,
                  icon: <ClockIcon size="sm" />,
                },
                {
                  id: 'inbox',
                  label: copywriting.navigation.inbox,
                  icon: <SparklesIcon size="sm" />,
                },
                {
                  id: 'insights',
                  label: copywriting.navigation.insights,
                  icon: <BarChartIcon size="sm" />,
                },
                {
                  id: 'settings',
                  label: copywriting.navigation.settings,
                  icon: <LayoutDashboardIcon size="sm" />,
                },
              ]}
            />
            <div style={{ flex: 1, padding: '24px', backgroundColor: '#F8FAFC', overflowY: 'auto' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 600 }}>Content Area (Simulated Desktop View)</h4>
              <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '16px' }}>
                Side navigation maintains 240px–260px expanded width or 72px collapsed width, with integrated Daily Capacity Meter widget.
              </p>
              <Alert variant="adaptive" title="Adaptive Rhythm Status">
                Semua jadwal berjalan optimal dan seimbang tanpa beban berlebih.
              </Alert>
            </div>
          </div>

          {/* Mobile BottomNavBar Preview Container */}
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#334155' }}>
              Mobile View Simulation (BottomNavBar with Touch-Safe 48px targets & Central CTA)
            </h4>
            <div style={{ maxWidth: '420px', width: '100%', border: '1px solid #CBD5E1', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', backgroundColor: '#FFFFFF' }}>
              <div style={{ padding: '16px', minHeight: '100px', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#64748B', fontSize: '13px', textAlign: 'center' }}>
                <span>Area Konten Aplikasi Mobile</span>
                <span style={{ fontSize: '11px', marginTop: '4px' }}>Sentuh tombol (+) di tengah untuk membuka modal entri tugas cepat</span>
              </div>
              <BottomNavBar
                onAddClick={() => setQuickTaskModalOpen(true)}
                items={[
                  {
                    id: 'm-today',
                    label: copywriting.navigation.todayPlan,
                    active: true,
                    icon: <CalendarIcon size="sm" />,
                    onClick: () => addToast('Navigasi: Hari Ini'),
                  },
                  {
                    id: 'm-timeline',
                    label: copywriting.navigation.timeline,
                    icon: <ClockIcon size="sm" />,
                    onClick: () => addToast('Navigasi: Timeline'),
                  },
                  {
                    id: 'm-rhythm',
                    label: copywriting.navigation.insights,
                    icon: <BarChartIcon size="sm" />,
                    onClick: () => addToast('Navigasi: Ritme'),
                  },
                  {
                    id: 'm-settings',
                    label: copywriting.navigation.settings,
                    icon: <LayoutDashboardIcon size="sm" />,
                    onClick: () => addToast('Navigasi: Pengaturan'),
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {/* Section 7: FoCient Guilt-Free Validation & Contract Standards */}
        <section style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px' }}>🛡️</span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                7. FoCient Guilt-Free Validation & Contract Standards (Client & Server)
              </h3>
            </div>
            <p style={{ margin: 0, color: '#64748B', fontSize: '13px' }}>
              Zero punitive vocabulary • Auto-calculated endTime (endTime=startTime+durationMinutes) • Tabular figures (tnum) • Top 3 focus quota • WCAG 2.1 AAA aria-invalid states
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {/* Task Management Validation Form */}
            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600, color: '#1E293B' }}>
                A. Task Management Form Contract
              </h4>
              <TaskValidationForm
                onSubmit={(taskData) => {
                  addToast(`Tugas tervalidasi: "${taskData.title}" (${taskData.durationMinutes}m)`);
                }}
              />
            </div>

            {/* Onboarding / Setup Validation Form */}
            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600, color: '#1E293B' }}>
                B. Onboarding / Setup Form Contract
              </h4>
              <OnboardingValidationForm
                onSubmit={(setupData) => {
                  addToast(`Preferensi tersimpan: ${setupData.workHoursLimit} jam (${setupData.startWorkTime} - ${setupData.endWorkTime})`);
                }}
              />
            </div>
          </div>

          {/* Adaptive Scheduling Slot Helper Dialog */}
          <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                C. Adaptive Scheduling Confirmation Helper (Past Time Slot Guard)
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                Memastikan tugas adaptif hari ini tidak dijadwalkan pada slot masa lalu, dengan respons kesalahan empatik tanpa rasa bersalah.
              </div>
            </div>
            <Button
              variant="subtle-primary"
              onClick={() => setAdaptiveValidationModalOpen(true)}
            >
              Buka Konfirmasi Slot Adaptif
            </Button>
          </div>
        </section>

        {/* Section 10: Error & Fail State System Matrix */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ borderBottom: '2px solid #E2E8F0', paddingBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
              10. Error & Fail State System Matrix (DTCG Tokens, Anti-Accusatory, Zero Layout Shift)
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
              Pemisahan tegas System Failure vs Task Dynamics: Merah murni untuk kendala teknis fatal/validasi format; jadwal terlewat dialihkan ke Soft Teal/Warm Amber. Seluruh pesan bebas stigma dengan pemulihan sekali sentuh.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Level 1: Micro Action Fail */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#E11D48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Level 1: Micro Action Fail
                </span>
                <h4 style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 600 }}>
                  Tombol Aksi Lokal Gagal Simpan
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  Tombol kembali dari Loading ke Default disertai mikro goyang 4px (200ms) + Toast Danger Subtle (7000ms) tanpa menghilangkan draf lokal.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <Button
                  variant="primary"
                  loading={microFailLoading}
                  shake={btnShake}
                  onClick={triggerMicroActionFail}
                >
                  Simpan Draf (Simulasi Gagal)
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBtnShake(true);
                    setTimeout(() => setBtnShake(false), 250);
                  }}
                >
                  Uji Goyang 4px Manual
                </Button>
              </div>
            </div>

            {/* Level 2: Field-Level Validation Error */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#E11D48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Level 2: Form Field Error
                </span>
                <h4 style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 600 }}>
                  Multi-Sensory Feedback & Zero Layout Shift
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  Border 2px (#E11D48) + Ikon trailing 16px AlertCircle + Teks panduan konkret (#9F1239 WCAG AAA) + Container bantuan min-height 20px.
                </p>
              </div>

              <InputField
                label="Estimasi Durasi Sesi Fokus"
                value={interactiveErrorField}
                onChange={(e) => setInteractiveErrorField(e.target.value)}
                hasError={interactiveErrorActive}
                error={
                  interactiveErrorActive
                    ? 'Format durasi belum pas, contoh: 45m atau 1h 30m'
                    : undefined
                }
                helperText="Durasi realistis menjaga stamina fokusmu tetap optimal"
                unit="mnt"
              />

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setInteractiveErrorActive((prev) => !prev)}
                >
                  {interactiveErrorActive ? 'Simulasikan Input Valid' : 'Simulasikan Input Invalid'}
                </Button>
              </div>
            </div>
          </div>

          {/* Level 3: Module / Component Inline Fail */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#E11D48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Level 3: Module / Component Inline Fail
              </span>
              <h4 style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 600 }}>
                Kartu Kegagalan Modul Terisolasi
              </h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                Latar #FFF1F2, garis tepi 1px #FECDD3, ikon 28px AlertOctagon/RefreshCcw #E11D48, dan tombol muat ulang sekali klik tanpa menghambat kartu lainnya.
              </p>
            </div>

            <InlineModuleFail
              icon="octagon"
              loading={inlineModuleRetrying}
              onRetry={() => {
                setInlineModuleRetrying(true);
                setTimeout(() => {
                  setInlineModuleRetrying(false);
                  addToast('Modul analitik berhasil dimuat ulang!');
                }, 800);
              }}
            />
          </div>

          {/* Level 4: Data Conflict / Sync Fail */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Level 4: Data Conflict / Sync Fail
              </span>
              <h4 style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 600 }}>
                Banner Persisten Benturan Penjadwalan Lintas Perangkat
              </h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                Menggunakan token Warm Amber (#FFFBEB / #FDE68A / #D97706), strictly tanpa warna merah guna mencegah kepanikan kognitif, dilengkapi tombol pemulihan ganda.
              </p>
            </div>

            <SyncConflictAlert
              onUseLatest={() => {
                addToast('Linimasa diperbarui ke versi cloud terkini.');
              }}
              onKeepDraft={() => {
                addToast('Draf lokal dipertahankan dan disinkronkan kembali.');
              }}
            />
          </div>

          {/* Level 5: Full-View / Page-Level Error */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Level 5: Full-View / Page-Level System Fail
                </span>
                <h4 style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 600 }}>
                  Layar Penuh Pemulihan Sistem (Offline / Server 500)
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  Layout terpusat, ikon garis halus 64px #64748B, copywriting menenangkan tanpa rasa bersalah, dan tombol CTA besar 48px.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFullViewType('offline');
                    setShowFullViewPreview((prev) => !prev);
                  }}
                >
                  {showFullViewPreview && fullViewType === 'offline' ? 'Tutup Pratinjau' : 'Pratinjau Mode Offline (CloudOff)'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFullViewType('server');
                    setShowFullViewPreview(true);
                  }}
                >
                  Pratinjau Server 500 (ServerCrash)
                </Button>
              </div>
            </div>

            {showFullViewPreview && (
              <div style={{ border: '2px dashed #CBD5E1', borderRadius: '12px', backgroundColor: '#F8FAFC' }}>
                <FullViewError
                  type={fullViewType}
                  onRetry={() => {
                    addToast('Koneksi sistem berhasil dipulihkan.');
                    setShowFullViewPreview(false);
                  }}
                />
              </div>
            )}
          </div>
        </section>

        {/* Section 11: Empty State System (Calm Whitespace & Reflective Validation) */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ borderBottom: '2px solid #E2E8F0', paddingBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
              11. Empty State System (Calm Whitespace & Reflective Validation)
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
              Jeda reflektif dan validasi afirmatif tanpa selebrasi berisik atau tuntutan instan. Menggunakan jarak makro (--space-14 hingga --space-24) dan satu jalur tindakan yang jelas.
            </p>
          </div>

          {/* Interactive Variant Switcher */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              size="sm"
              variant={selectedEmptyVariant === 'onboarding' ? 'primary' : 'outline'}
              onClick={() => setSelectedEmptyVariant('onboarding')}
            >
              1. First-Time / Onboarding
            </Button>
            <Button
              size="sm"
              variant={selectedEmptyVariant === 'all-completed' ? 'primary' : 'outline'}
              onClick={() => setSelectedEmptyVariant('all-completed')}
            >
              2. All Tasks Completed (Zero Inbox)
            </Button>
            <Button
              size="sm"
              variant={selectedEmptyVariant === 'search-empty' ? 'primary' : 'outline'}
              onClick={() => setSelectedEmptyVariant('search-empty')}
            >
              3. Filter / Search Zero Results
            </Button>
            <Button
              size="sm"
              variant={selectedEmptyVariant === 'rest-day' ? 'primary' : 'outline'}
              onClick={() => setSelectedEmptyVariant('rest-day')}
            >
              4. Analytics & Rest Day State
            </Button>
          </div>

          {/* Empty State Component Live Canvas */}
          <div style={{ border: '1px solid #CBD5E1', borderRadius: '16px', overflow: 'hidden' }}>
            {selectedEmptyVariant === 'onboarding' && (
              <EmptyState
                variant="onboarding"
                onAction={() => addToast('Membuka modal tambah tugas pertama.')}
              />
            )}

            {selectedEmptyVariant === 'all-completed' && (
              <EmptyState
                variant="all-completed"
                onAction={() => addToast('Membuka ringkasan capaian fokus hari ini.')}
                onSecondaryAction={() => addToast('Membuka evaluasi dan analitik mingguan.')}
              />
            )}

            {selectedEmptyVariant === 'search-empty' && (
              <EmptyState
                variant="search-empty"
                onAction={() => addToast('Filter pencarian telah direset.')}
              />
            )}

            {selectedEmptyVariant === 'rest-day' && (
              <EmptyState
                variant="rest-day"
                onAction={() => addToast('Membuka kalender penataan hari berikutnya.')}
              />
            )}
          </div>
        </section>

        {/* Section 12: Loading & Skeleton Shimmer State System */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ borderBottom: '2px solid #E2E8F0', paddingBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
              12. Loading & Skeleton Shimmer System (Anti-Anxiety, CLS = 0, Double-Submit Guard)
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
              Pencegahan aksi ganda otomatis (pointer-events: none, cursor: wait), replikasi geometris presisi untuk Zero Layout Shift (CLS), dan animasi shimmer halus (1600ms).
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Level A: Micro Button Loading */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Micro Action Loading
                </span>
                <h4 style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 600 }}>
                  Pencegahan Submit Ganda & Kursor Tunggu
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  Label memudar digantikan circular spinner 20px (md/lg) atau 16px (sm) dengan warna currentColor dan cursor: wait.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <Button
                  variant="primary"
                  size="md"
                  loading={btnLoading}
                  onClick={() => {
                    setBtnLoading(true);
                    setTimeout(() => setBtnLoading(false), 2000);
                  }}
                >
                  {btnLoading ? 'Menyimpan...' : 'Klik Uji Loading 2 Detik'}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  loading={btnLoading}
                  onClick={() => {
                    setBtnLoading(true);
                    setTimeout(() => setBtnLoading(false), 2000);
                  }}
                >
                  Small (16px Spinner)
                </Button>
              </div>
            </div>

            {/* Level C: Background Sync Adaptive Indicator */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Background Sync
                </span>
                <h4 style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 600 }}>
                  Indikator Penyesuaian AI Non-Intrusif
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  Pill mikro dengan putaran tenang 1500ms dan copywriting suportif tanpa kepanikan kognitif.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <AdaptiveSyncBadge />
                <AdaptiveSyncBadge label="Menyimpan preferensi fokus..." />
              </div>

              <div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTopBarLoading(true);
                    setTimeout(() => setTopBarLoading(false), 2500);
                  }}
                >
                  {topBarLoading ? 'Garis Progres Aktif...' : 'Simulasi Global Top Progress Bar'}
                </Button>
              </div>
            </div>
          </div>

          {/* Level B: Structural Shimmer Zero Layout Shift Demo */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Structural Shimmer Wave
                </span>
                <h4 style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 600 }}>
                  Replikasi Geometris Zero Layout Shift (CLS = 0)
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  Perbandingan sisi demi sisi antara skeleton shimmer dan komponen nyata. Dimensi dan padding 100% presisi.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  size="sm"
                  variant={simulatedCardLoading ? 'primary' : 'outline'}
                  onClick={() => setSimulatedCardLoading((prev) => !prev)}
                >
                  {simulatedCardLoading ? 'Tampilkan Konten Nyata' : 'Simulasi TaskCard Shimmer'}
                </Button>
                <Button
                  size="sm"
                  variant={simulatedCapacityLoading ? 'primary' : 'outline'}
                  onClick={() => setSimulatedCapacityLoading((prev) => !prev)}
                >
                  {simulatedCapacityLoading ? 'Tampilkan Konten Nyata' : 'Simulasi Capacity Shimmer'}
                </Button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* TaskCard vs Skeleton */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                  {simulatedCardLoading ? 'Status: Skeleton Shimmer Loading' : 'Status: Kartu Tugas Aktif'}
                </div>

                {simulatedCardLoading ? (
                  <TaskCardSkeleton count={2} />
                ) : (
                  <>
                    <TaskCard
                      id="loaded-card-1"
                      title="Sesi Fokus Mendalam FoCient"
                      duration="45m"
                      timeSlot="09:00 - 09:45"
                      projectCategory="Arsitektur"
                      projectColor="blue"
                    />
                    <TaskCard
                      id="loaded-card-2"
                      title="Evaluasi Kapasitas Harian Tim"
                      duration="30m"
                      timeSlot="10:00 - 10:30"
                      projectCategory="Strategi"
                      projectColor="teal"
                    />
                  </>
                )}
              </div>

              {/* CapacityMeter vs Skeleton */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                  {simulatedCapacityLoading ? 'Status: Skeleton Shimmer Loading' : 'Status: Capacity Meter Nyata'}
                </div>

                {simulatedCapacityLoading ? (
                  <CapacityMeterSkeleton />
                ) : (
                  <DailyCapacityMeterCard
                    allocatedMinutes={240}
                    totalCapacityMinutes={360}
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 13: Success State System (Calm Affirmation & Reversibility Buffer) */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px' }}>🌱</span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#065F46' }}>
                Section 13: Success State System (Calm Affirmation & Reversibility Buffer)
              </h3>
            </div>
            <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>
              4 UI Levels • Anti-Hyper-Gamified (No screen-blocking confetti) • Emerald Tokens (#059669) • Reversibility Buffer (&quot;Urungkan&quot;)
            </p>
          </div>

          {/* Level 3: Module & Inline Success Card (Daily Rhythm Completed Banner) */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Level 3 • Module &amp; Inline Success Card
                </span>
                <h4 style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 600 }}>
                  Banner Capaian Target Harian (Top 3 Priorities Tuntas)
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  Muncul di atas linimasa Today Plan saat 3 prioritas inti berhasil diselesaikan secara seimbang tanpa beban berlebih.
                </p>
              </div>

              {dailyBannerDismissed && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDailyBannerDismissed(false)}
                >
                  Tampilkan Kembali Banner Capaian
                </Button>
              )}
            </div>

            {!dailyBannerDismissed && (
              <DailySuccessBanner
                onDismiss={() => setDailyBannerDismissed(true)}
                action={
                  <Button
                    size="sm"
                    variant="ghost"
                    style={{ color: '#065F46', fontWeight: 600, padding: '0 8px' }}
                    onClick={() => addToast('Membuka ringkasan capaian fokus')}
                  >
                    Tinjau Ringkasan Hari Ini →
                  </Button>
                }
              />
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {/* Level 1: Micro-Interactive Checkmark Pop Scale */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Level 1 • Micro-Interactive Checkmark
                </span>
                <h4 style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 600 }}>
                  Pop Scale 0.7 → 1.0 (150ms Decelerate) + Strikethrough #94A3B8
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  Klik checkbox untuk mencoba mikro-animasi letupan halus, label coret, transisi opasitas 0.6, dan toast &quot;Urungkan&quot;.
                </p>
              </div>

              <div style={{ padding: '8px 0' }}>
                <TaskCard
                  id="demo-success-task-1"
                  title="Sesi Fokus Mendalam FoCient"
                  duration="45m"
                  timeSlot="09:00 - 09:45"
                  projectCategory="Arsitektur"
                  projectColor="emerald"
                  completed={demoTaskCompleted}
                  onToggleComplete={(_, checked) => handleToggleDemoTask(checked)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Checkbox
                  checked={demoTaskCompleted}
                  variant="success"
                  label={demoTaskCompleted ? 'Status: Tugas Selesai (Opacity 0.6)' : 'Status: Tugas Aktif'}
                  strikethroughOnChecked={true}
                  onChange={(checked) => handleToggleDemoTask(checked)}
                />
              </div>
            </div>

            {/* Level 2 & 4: Transient Toast with Undo + Button Success Transformation */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Level 2 &amp; 4 • Transient Toast &amp; Button Feedback
                </span>
                <h4 style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 600 }}>
                  Transformasi Tombol 600ms &amp; Toast Reversibilitas (4 Detik)
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  Simulasikan proses simpan: Tombol bertransisi dari loading ke status Tersimpan (#059669), diikuti Toast sukses berlatar #ECFDF5 dengan buffer &quot;Urungkan&quot;.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <Button
                  loading={successBtnLoading}
                  success={successBtnDone}
                  successLabel={copywriting.successStates.savedSuccess}
                  onClick={handleSimulateButtonSave}
                >
                  Simpan Jadwal Linimasa
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    addToast(
                      copywriting.successStates.scheduleUpdated,
                      copywriting.successStates.undoAction,
                      'success',
                      () => addToast('Penyesuaian jadwal dibatalkan')
                    );
                  }}
                >
                  Picu Toast Sukses + Urungkan
                </Button>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', fontSize: '12.5px', color: '#065F46' }}>
                <strong>Prinsip Anti-Hyper-Gamified:</strong> Tidak ada konfeti satu layar penuh, suara dering keras, atau popup mengganggu. Penegasan sukses berlangsung tenang dan selalu dapat diurungkan (reversibel).
              </div>
            </div>
          </div>
        </section>

        {/* Section 14: Microinteraction & Scalable Motion Token Matrix */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px' }}>✨</span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1E3A8A' }}>
                Section 14: Microinteraction &amp; Scalable Motion Token Matrix
              </h3>
            </div>
            <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>
              9 Core Microinteractions • DTCG Motion Tokens • Tactile Scale(0.98) • Smooth Ripple Shift • Anti-Accusatory Capacity States
            </p>
          </div>

          {/* Microinteraction Suite Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            
            {/* A & C: Tactile Press, Focus-Visible & Current Time Dot Breathe */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Microinteraction A &amp; C
                </span>
                <h4 style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 600 }}>
                  Taktil Hover, Press (scale 0.98) &amp; Breathe Indicator
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  Respon instan 100ms hover, 150ms press scale, ring ganda fokus keyboard (2px #BFDBFE), dan titik waktu bernapas tenang 3000ms.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <Button className="focient-interactive" onClick={() => addToast('Tombol ditekan dengan umpan balik taktil')}>
                  Uji Taktil scale(0.98)
                </Button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#F0FDFA', border: '1px solid #CCFBF1', borderRadius: '8px' }}>
                  <span className="focient-current-time-dot" aria-hidden="true" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F766E' }}>
                    Sesi Berjalan (Breathe 3s)
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '12.5px', color: '#475569', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                Tekan tombol Tab untuk menguji cincin fokus ganda (<code>outline: 2px solid #BFDBFE</code> dengan <code>offset: 2px</code>) yang ramah aksesibilitas keyboard (WCAG 2.1 AAA).
              </div>
            </div>

            {/* D & E: Drag-and-Drop Lift & Ripple Shift Reorder */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Microinteraction D &amp; E
                  </span>
                  <h4 style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 600 }}>
                    Drag Lift (scale 1.02) &amp; Ripple Shift (250ms)
                  </h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                    Tekan tahan 150ms untuk mengangkat kartu (shadow-3, opacity 0.92) dan simulasi pergeseran slot bergelombang tanpa collision.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  size="sm"
                  variant={rippleShiftActive ? 'primary' : 'outline'}
                  onClick={() => setRippleShiftActive((prev) => !prev)}
                >
                  {rippleShiftActive ? 'Kembalikan Slot Jadwal' : 'Simulasi Ripple Auto-Shift (250ms)'}
                </Button>
              </div>

              {/* Slot and Drop Placeholder Demo */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div
                  className="focient-timeline-slot"
                  style={{
                    transform: rippleShiftActive ? 'translateY(12px)' : 'translateY(0)',
                    transition: 'transform var(--duration-moderate, 250ms) var(--ease-fluid)',
                  }}
                >
                  <TaskCard
                    id="drag-demo-1"
                    title="Analisis Kebutuhan Arsitektur Sistem"
                    duration="45m"
                    timeSlot="13:00 - 13:45"
                    projectCategory="Sistem"
                    projectColor="blue"
                  />
                </div>

                {rippleShiftActive && (
                  <div className="focient-drop-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '12.5px', color: '#0D9488', fontWeight: 600 }}>
                      + Area Target Penempatan Otomatis (Dashed Teal)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* H: Accordion Detail Disclosure */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Microinteraction H
                </span>
                <h4 style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 600 }}>
                  Detail Disclosure (Grid 0fr → 1fr &amp; Chevron 180°)
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  Buka-tutup informasi tambahan tugas dalam 200ms (--duration-normal, --ease-fluid) tanpa layout shift mendadak.
                </p>
              </div>

              <Accordion
                title="Catatan Tambahan &amp; Sub-Tugas Prioritas"
                badge={<Badge size="xs" variant="neutral">3 Sub-item</Badge>}
                expanded={accordionDemoExpanded}
                onToggle={(val) => setAccordionDemoExpanded(val)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Checkbox checked={true} variant="success" onChange={() => {}} />
                    <span style={{ textDecoration: 'line-through', color: '#94A3B8' }}>Audit design token W3C DTCG</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Checkbox checked={true} variant="success" onChange={() => {}} />
                    <span style={{ textDecoration: 'line-through', color: '#94A3B8' }}>Implementasi kurva easing Fluid</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Checkbox checked={false} onChange={() => {}} />
                    <span>Verifikasi aksesibilitas keyboard dan prefers-reduced-motion</span>
                  </div>
                </div>
              </Accordion>
            </div>

            {/* I: Dynamic Workload Thresholding (Capacity Meter State) */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Microinteraction I
                </span>
                <h4 style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 600 }}>
                  Dynamic Workload Thresholding (Zero-Guilt Amber)
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  Geser slider untuk melihat transisi warna bilah (Light &lt;50%, Optimal 50-75%, Near 76-90%, Overload &gt;90%). Dilarang keras memakai merah panik.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                  <span>Simulasi Beban Harian:</span>
                  <span className="focient-tnum" style={{ color: interactiveWorkload > 75 ? '#D97706' : '#0D9488' }}>
                    {interactiveWorkload}% ({Math.round(interactiveWorkload * 4.8)}m / 480m)
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={interactiveWorkload}
                  onChange={(e) => setInteractiveWorkload(Number(e.target.value))}
                  style={{ width: '100%', accentColor: interactiveWorkload > 75 ? '#D97706' : '#0D9488' }}
                />
              </div>

              <DailyCapacityMeter
                allocatedMinutes={Math.round(interactiveWorkload * 4.8)}
                totalCapacityMinutes={480}
              />
            </div>

          </div>
        </section>

      </div>

      {/* Modals & Dialogs */}
      <AdaptiveScheduleConfirmModal
        open={adaptiveValidationModalOpen}
        onClose={() => setAdaptiveValidationModalOpen(false)}
        taskTitle="Sesi Fokus Mendalam FoCient"
        durationMinutes={45}
        initialStartTime={new Date(Date.now() - 3600000).toISOString()} // 1 hour ago to demonstrate past slot helper
        onConfirm={(confirmedTime) => {
          addToast(`Slot waktu dikonfirmasi: ${new Date(confirmedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
        }}
      />
      <AdaptiveRescheduleModal
        open={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        onApplyNewSchedule={() => {
          setRescheduleModalOpen(false);
          addToast(copywriting.toasts.taskAdjusted);
        }}
        onBalanceRhythm={() => {
          setRescheduleModalOpen(false);
          addToast('Ritme kerja telah diseimbangkan otomatis.');
        }}
        taskTitle="Review Kode Pull Request #42"
        recommendedTime="14:00 - 14:45"
      />

      <QuickTaskEntryModal
        open={quickTaskModalOpen}
        onClose={() => setQuickTaskModalOpen(false)}
        onSave={(t) => {
          addToast(copywriting.toasts.taskAdded(t.title));
        }}
      />

      <DestructiveModal
        open={destructiveModalOpen}
        onClose={() => setDestructiveModalOpen(false)}
        taskTitle="Hapus tugas percobaan permanen"
        onConfirmDelete={() => addToast('Tugas dihapus permanen.')}
      />

      {/* Mobile Bottom Sheet Demo */}
      <BottomSheet
        open={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        title="Detail Penataan Jadwal Adaptif"
        actions={
          <>
            <Button variant="ghost" onClick={() => setMobileSheetOpen(false)}>
              {copywriting.actions.cancel}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setMobileSheetOpen(false);
                addToast(copywriting.toasts.taskAdjusted);
              }}
            >
              {copywriting.actions.applyAdjustment}
            </Button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>
          Jendela ini berjalan dalam mode <strong>Mobile Bottom Sheet</strong> dengan transisi slide-up 300ms, drag handle sentuh di bagian atas, backdrop blur 4px, dan restorasi fokus kursor otomatis ke tombol pemicu saat ditutup.
        </p>
      </BottomSheet>

      {/* Mobile Virtual Keyboard Sheet Overlay */}
      <MobileKeyboardBottomSheet
        open={mobileKeyboardOpen}
        onClose={() => setMobileKeyboardOpen(false)}
        mode={mobileKeyboardMode}
        value={mobileKeyboardMode === 'number' ? testNumberValue : testTextValue}
        previewLabel={mobileKeyboardMode === 'number' ? 'Durasi Tugas (Menit)' : 'Judul Tugas'}
        onChange={(val) => {
          if (mobileKeyboardMode === 'number') setTestNumberValue(val);
          else setTestTextValue(val);
        }}
        onSubmit={(val) => {
          setMobileKeyboardOpen(false);
          addToast(`Input tersimpan: "${val}"`);
        }}
      />

      {/* Command Palette Overlay */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />

      {/* Guilt-Free Context Preservation Dialog */}
      <ContextPreservationDialog
        isOpen={preservationDialogOpen}
        draftTitle="Pengaturan Sesi Fokus 45m"
        onSave={() => {
          addToast('Draf berhasil disimpan dengan aman');
          setPreservationDialogOpen(false);
        }}
        onDiscard={() => {
          addToast('Perubahan draf dibatalkan');
          setPreservationDialogOpen(false);
        }}
        onCancel={() => {
          setPreservationDialogOpen(false);
        }}
      />

      {/* Toast Notifications Overlay */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export const ComponentShowcase: React.FC = () => {
  return (
    <FoCientI18nProvider initialLocale="id">
      <ComponentShowcaseInner />
    </FoCientI18nProvider>
  );
};

export default ComponentShowcase;
