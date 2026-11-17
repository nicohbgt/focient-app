import React, { useState } from 'react';
import { useFoCientI18n } from '../i18n/I18nContext.js';
import { InputField } from '../primitive/InputField.js';
import { Button } from '../primitive/Button.js';
import { Chip } from '../primitive/Chip.js';
import { TIME_24H_REGEX, OnboardingSetupSchema } from '@focient/contracts';

export interface OnboardingValidationFormProps {
  initialWorkHoursLimit?: number;
  initialStartWorkTime?: string;
  initialEndWorkTime?: string;
  initialCategories?: string[];
  availableCategories?: string[];
  onSubmit?: (data: {
    workHoursLimit: number;
    startWorkTime: string;
    endWorkTime: string;
    selectedCategories: string[];
  }) => void;
  className?: string;
}

const DEFAULT_CATEGORIES = [
  'Pekerjaan Inti',
  'Pembelajaran Mandiri',
  'Kesehatan & Istirahat',
  'Pengembangan Karir',
  'Manajemen Pribadi',
  'Eksplorasi Kreatif',
];

/**
 * Onboarding / Setup Validation Form
 * Implements FoCient Validation Specification:
 * - workHoursLimit: 1 - 16 hours (0.5 step), isInvalid: true on error
 * - startWorkTime & endWorkTime: 24h format HH:mm, endWorkTime > startWorkTime
 * - selectedCategories: 1 to 5 categories, chip group warning
 */
export const OnboardingValidationForm: React.FC<OnboardingValidationFormProps> = ({
  initialWorkHoursLimit = 8,
  initialStartWorkTime = '09:00',
  initialEndWorkTime = '17:00',
  initialCategories = ['Pekerjaan Inti'],
  availableCategories = DEFAULT_CATEGORIES,
  onSubmit,
  className = '',
}) => {
  const { copywriting } = useFoCientI18n();

  const [workHoursLimit, setWorkHoursLimit] = useState(String(initialWorkHoursLimit));
  const [startWorkTime, setStartWorkTime] = useState(initialStartWorkTime);
  const [endWorkTime, setEndWorkTime] = useState(initialEndWorkTime);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // 1. workHoursLimit validation
  const numLimit = Number(workHoursLimit);
  const isLimitValid =
    !isNaN(numLimit) &&
    numLimit >= 1 &&
    numLimit <= 16 &&
    Number.isInteger(numLimit * 2);
  const isLimitInvalid = touched.workHoursLimit && !isLimitValid;
  const limitError = isLimitInvalid ? copywriting.validations.workHoursLimit : undefined;

  // 2. startWorkTime & endWorkTime validation
  const isStartFormatValid = TIME_24H_REGEX.test(startWorkTime);
  const isEndFormatValid = TIME_24H_REGEX.test(endWorkTime);

  let isTimeRangeValid = true;
  if (isStartFormatValid && isEndFormatValid) {
    const [startH, startM] = startWorkTime.split(':').map(Number);
    const [endH, endM] = endWorkTime.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;
    isTimeRangeValid = endMins > startMins;
  }

  const isStartTimeInvalid = touched.startWorkTime && !isStartFormatValid;
  const isEndTimeInvalid =
    touched.endWorkTime && (!isEndFormatValid || !isTimeRangeValid);

  const startError = isStartTimeInvalid ? copywriting.validations.workHoursFormat : undefined;
  const endError = isEndTimeInvalid
    ? !isEndFormatValid
      ? copywriting.validations.workHoursFormat
      : copywriting.validations.workHoursRange
    : undefined;

  // 3. selectedCategories validation (1 to 5 categories)
  const isCategoriesEmpty = selectedCategories.length < 1;
  const isCategoriesOverMax = selectedCategories.length > 5;
  const isCategoriesInvalid = touched.categories && (isCategoriesEmpty || isCategoriesOverMax);
  const categoriesWarning = isCategoriesInvalid
    ? isCategoriesEmpty
      ? copywriting.validations.selectedCategories
      : 'Maksimal 5 kategori kerja untuk menjaga kesederhanaan fokus awal.'
    : undefined;

  const toggleCategory = (cat: string) => {
    setTouched((prev) => ({ ...prev, categories: true }));
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      workHoursLimit: true,
      startWorkTime: true,
      endWorkTime: true,
      categories: true,
    });

    if (isLimitValid && isStartFormatValid && isEndFormatValid && isTimeRangeValid && !isCategoriesEmpty && !isCategoriesOverMax) {
      onSubmit?.({
        workHoursLimit: numLimit,
        startWorkTime,
        endWorkTime,
        selectedCategories,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`focient-onboarding-validation-form ${className}`}
      noValidate
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '560px',
        backgroundColor: 'var(--color-neutral-surface-card, #FFFFFF)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid var(--color-neutral-border-subtle, #CBD5E1)',
      }}
    >
      <div>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
          Setup Ritme & Batasan Kerja
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-neutral-text-muted, #64748B)' }}>
          Tentukan batasan jam kerja yang sehat dan realistis tanpa rasa bersalah.
        </p>
      </div>

      {/* Field 1: Work Hours Limit */}
      <InputField
        id="onboarding-work-hours"
        label="Batas Jam Kerja Harian"
        variant="numeric"
        unit={copywriting.capacity.hoursShort}
        step="0.5"
        min="1"
        max="16"
        value={workHoursLimit}
        onChange={(e) => {
          setWorkHoursLimit(e.target.value);
          setTouched((prev) => ({ ...prev, workHoursLimit: true }));
        }}
        onBlur={() => setTouched((prev) => ({ ...prev, workHoursLimit: true }))}
        isInvalid={isLimitInvalid}
        error={limitError}
        helperText={!limitError ? 'Direkomendasikan: 6 hingga 8 jam untuk keseimbangan optimal.' : undefined}
      />

      {/* Field 2 & 3: Work Time Window (Start & End) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <InputField
          id="onboarding-start-time"
          label="Jam Mulai Kerja"
          placeholder="09:00"
          value={startWorkTime}
          onChange={(e) => {
            setStartWorkTime(e.target.value);
            setTouched((prev) => ({ ...prev, startWorkTime: true }));
          }}
          onBlur={() => setTouched((prev) => ({ ...prev, startWorkTime: true }))}
          isInvalid={isStartTimeInvalid}
          error={startError}
        />

        <InputField
          id="onboarding-end-time"
          label="Jam Selesai Kerja"
          placeholder="17:00"
          value={endWorkTime}
          onChange={(e) => {
            setEndWorkTime(e.target.value);
            setTouched((prev) => ({ ...prev, endWorkTime: true }));
          }}
          onBlur={() => setTouched((prev) => ({ ...prev, endWorkTime: true }))}
          isInvalid={isEndTimeInvalid}
          error={endError}
        />
      </div>

      {/* Field 4: Selected Categories (Chip Group) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="focient-input-label">Pilar Kategori Kerja (1 - 5 Kategori)</label>
          <span
            className="focient-tnum"
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: isCategoriesOverMax
                ? 'var(--color-danger-text-bold, #9F1239)'
                : 'var(--color-neutral-text-muted, #64748B)',
            }}
          >
            {selectedCategories.length} / 5 dipilih
          </span>
        </div>

        <div
          role="group"
          aria-label="Pilar Kategori Kerja"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '12px',
            borderRadius: '8px',
            border: isCategoriesInvalid
              ? '2px solid var(--color-warning-border, #F59E0B)'
              : '1px solid var(--color-neutral-border-subtle, #E2E8F0)',
            backgroundColor: isCategoriesInvalid
              ? 'var(--color-warning-surface-subtle, #FFFBEB)'
              : 'var(--color-neutral-surface-subtle, #F8FAFC)',
          }}
        >
          {availableCategories.map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <Chip
                key={cat}
                label={cat}
                selected={isSelected}
                onClick={() => toggleCategory(cat)}
              />
            );
          })}
        </div>

        {categoriesWarning && (
          <div
            role="alert"
            style={{
              fontSize: '12px',
              color: 'var(--color-warning-text-bold, #B45309)',
              fontWeight: 500,
            }}
          >
            {categoriesWarning}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
        <Button type="submit" variant="primary">
          Simpan Preferensi Ritme
        </Button>
      </div>
    </form>
  );
};
