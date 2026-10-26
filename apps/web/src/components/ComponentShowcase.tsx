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
} from './primitive/index.js';
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

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([
    {
      id: '1',
      message: copywriting.toasts.taskCompleted('Riset Token DTCG FoCient'),
      actionLabel: copywriting.actions.undo,
      duration: 6000,
    },
  ]);

  const addToast = (message: string, actionLabel?: string) => {
    setToasts((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        message,
        actionLabel,
        duration: actionLabel ? 6000 : 4000,
      },
    ]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, sans-serif' }}>
      {/* Top Navigation */}
      <TopNavBar
        workloadPercentage={72}
        onSearchClick={() => addToast('Quick search activated (Cmd+K)')}
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
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
              6. Desktop SideNavBar & Mobile BottomNavBar Suites
            </h3>
            <p style={{ margin: 0, color: '#64748B', fontSize: '13px' }}>
              Full Lucide icon navigation integration • Responsive layout transitions • Direct quick actions
            </p>
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
