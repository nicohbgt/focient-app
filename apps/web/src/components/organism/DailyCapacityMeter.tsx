import React, { useMemo } from 'react';
import { useFoCientI18n } from '../i18n/I18nContext.js';
import { TrendingUpIcon, AlertTriangleIcon, ClockIcon } from '../icons/index.js';

export interface DailyCapacityMeterProps {
  allocatedMinutes: number;
  totalCapacityMinutes: number;
  onOverloadDetected?: (allocated: number, capacity: number) => void;
  showAdviceOnOverload?: boolean;
  className?: string;
}

/**
 * FoCient Daily Capacity Meter (<DailyCapacityMeter/>)
 *
 * Visualizes daily work rhythm with calm transitions and zero-guilt color feedback.
 * Uses exact DTCG threshold tracks:
 * - < 50%: Light (#99F6E4)
 * - 50%–75%: Optimal (#0D9488)
 * - 76%–90%: Near Capacity (#D97706 Amber)
 * - > 90%: Overload (Friendly Amber #D97706 triggering adaptive suggestions, strictly zero red)
 */
export const DailyCapacityMeter: React.FC<DailyCapacityMeterProps> = ({
  allocatedMinutes,
  totalCapacityMinutes,
  onOverloadDetected,
  showAdviceOnOverload = true,
  className = '',
}) => {
  const { copywriting, formatMinutes } = useFoCientI18n();

  const percentage = Math.min(
    100,
    Math.max(0, Math.round((allocatedMinutes / Math.max(1, totalCapacityMinutes)) * 100))
  );

  const { color, label, isOverload } = useMemo(() => {
    if (percentage < 50) {
      return {
        color: 'var(--color-secondary-track-base, #99F6E4)',
        label: copywriting.status.light,
        isOverload: false,
      };
    }
    if (percentage <= 75) {
      return {
        color: 'var(--color-secondary-action-base, #0D9488)',
        label: copywriting.status.optimal,
        isOverload: false,
      };
    }
    if (percentage <= 90) {
      return {
        color: 'var(--color-warning-action-base, #D97706)',
        label: copywriting.status.nearCapacity,
        isOverload: false,
      };
    }
    return {
      color: 'var(--color-warning-action-base, #D97706)',
      label: copywriting.status.fullCapacity,
      isOverload: true,
    };
  }, [percentage, copywriting]);

  React.useEffect(() => {
    if (isOverload) {
      onOverloadDetected?.(allocatedMinutes, totalCapacityMinutes);
    }
  }, [isOverload, allocatedMinutes, totalCapacityMinutes, onOverloadDetected]);

  return (
    <div className={['focient-capacity-meter', className].filter(Boolean).join(' ')}>
      <div className="focient-capacity-header">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          {isOverload ? (
            <AlertTriangleIcon size="xs" color="var(--color-warning, #D97706)" />
          ) : (
            <TrendingUpIcon size="xs" />
          )}
          <span>
            {copywriting.capacity.dailyWorkload} ({label})
          </span>
        </span>
        <span className="focient-capacity-figures focient-tnum" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ClockIcon size={13} />
          {copywriting.capacity.allocatedVsTotal(
            formatMinutes(allocatedMinutes),
            formatMinutes(totalCapacityMinutes),
            percentage
          )}
        </span>
      </div>

      <div
        className={[
          'focient-capacity-track',
          percentage < 50 ? 'focient-capacity-track--light' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={copywriting.capacity.dailyWorkload}
      >
        <div
          className="focient-capacity-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>

      {isOverload && showAdviceOnOverload && (
        <div className="focient-capacity-advice" role="note">
          {copywriting.adaptive.overloadAdvice}
        </div>
      )}
    </div>
  );
};

export interface DailyCapacityMeterCardProps extends DailyCapacityMeterProps {
  cardTitle?: string;
}

/**
 * Card Suite Variant 7: Daily Capacity Meter & Analytics Card
 */
export const DailyCapacityMeterCard: React.FC<DailyCapacityMeterCardProps> = ({
  cardTitle,
  ...props
}) => {
  const { copywriting } = useFoCientI18n();

  return (
    <div className="focient-capacity-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--color-text-main, #0F172A)' }}>
          {cardTitle || copywriting.cards.capacityTitle}
        </h4>
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748B)' }}>
          FoCient Analytics
        </span>
      </div>
      <DailyCapacityMeter {...props} />
    </div>
  );
};
