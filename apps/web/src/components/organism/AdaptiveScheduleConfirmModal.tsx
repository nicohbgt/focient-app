import React, { useState } from 'react';
import { useFoCientI18n } from '../i18n/I18nContext.js';
import { Modal } from './Modal.js';
import { InputField } from '../primitive/InputField.js';
import { Button } from '../primitive/Button.js';
import { Badge } from '../primitive/Badge.js';
import { ClockIcon } from '../icons/index.js';

export interface AdaptiveScheduleConfirmModalProps {
  open: boolean;
  onClose: () => void;
  taskTitle: string;
  durationMinutes: number;
  initialStartTime?: string;
  onConfirm?: (confirmedStartTime: string) => void;
}

/**
 * Adaptive Scheduling Confirmation Modal / Sheet
 * Implements FoCient Validation Standards:
 * - confirmedStartTime: ISO 8601 format, cannot be in the past for today
 * - Solutive Dialog helper: "Slot waktu ini sudah terlewat. Pilih jam saat ini atau slot berikutnya."
 */
export const AdaptiveScheduleConfirmModal: React.FC<AdaptiveScheduleConfirmModalProps> = ({
  open,
  onClose,
  taskTitle,
  durationMinutes,
  initialStartTime = new Date().toISOString(),
  onConfirm,
}) => {
  const { copywriting } = useFoCientI18n();

  const [confirmedTime, setConfirmedTime] = useState(initialStartTime);
  const [touched, setTouched] = useState(false);

  // Time validation: Cannot be in the past (with a 60s buffer)
  const timeDate = new Date(confirmedTime);
  const isTimeValid = !isNaN(timeDate.getTime());
  const isPastTime = isTimeValid && timeDate.getTime() < Date.now() - 60000;

  const helperWarning =
    touched && isPastTime
      ? copywriting.validations.confirmedStartTime
      : undefined;

  const handleUseNow = () => {
    const nowIso = new Date().toISOString();
    setConfirmedTime(nowIso);
    setTouched(true);
  };

  const handleConfirm = () => {
    setTouched(true);
    if (isTimeValid && !isPastTime) {
      onConfirm?.(confirmedTime);
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Konfirmasi Slot Waktu Adaptif"
      actions={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
          <Button variant="ghost" onClick={onClose}>
            {copywriting.actions.cancel}
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isPastTime || !isTimeValid}
          >
            {copywriting.actions.applyNewSchedule}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--color-neutral-surface-subtle, #F8FAFC)',
            borderRadius: '8px',
            border: '1px solid var(--color-neutral-border-subtle, #E2E8F0)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-neutral-text-bold, #0F172A)' }}>
              {taskTitle}
            </span>
            <Badge variant="neutral">{durationMinutes}mnt</Badge>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-neutral-text-muted, #64748B)', marginTop: '4px' }}>
            {copywriting.adaptive.rescheduleDescription}
          </div>
        </div>

        <div>
          <InputField
            id="adaptive-confirmed-start"
            label="Slot Jam Mulai (ISO 8601)"
            value={confirmedTime}
            onChange={(e) => {
              setConfirmedTime(e.target.value);
              setTouched(true);
            }}
            onBlur={() => setTouched(true)}
            isWarning={Boolean(helperWarning)}
            warning={helperWarning}
          />

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <Button
              size="sm"
              variant="subtle-primary"
              onClick={handleUseNow}
              leadingIcon={<ClockIcon size={14} />}
            >
              Gunakan Jam Saat Ini
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
