import React, { useMemo } from 'react';

export interface DailyCapacityMeterProps {
  allocatedMinutes: number;
  totalCapacityMinutes: number;
  onOverloadDetected?: (allocated: number, capacity: number) => void;
  className?: string;
}

/**
 * FoCient Daily Capacity Meter (<DailyCapacityMeter/>)
 *
 * Visualizes daily rhythm with calm transitions and zero-guilt color feedback.
 */
export const DailyCapacityMeter: React.FC<DailyCapacityMeterProps> = ({
  allocatedMinutes,
  totalCapacityMinutes,
  onOverloadDetected,
  className = '',
}) => {
  const percentage = Math.min(
    100,
    Math.max(0, Math.round((allocatedMinutes / Math.max(1, totalCapacityMinutes)) * 100))
  );

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}j`;
    return `${hours}j ${mins}m`;
  };

  // Status Logika Warna Semantik FoCient:
  // < 50%: Light (#99F6E4)
  // 50% – 75%: Optimal (#0D9488)
  // 76% – 90%: Near Capacity (#D97706 Amber)
  // > 90%: Overload (Aksen Amber #D97706 ramah pengguna tanpa merah agresif)
  const { color, label } = useMemo(() => {
    if (percentage < 50) {
      return {
        color: 'var(--color-secondary-track-base, #99F6E4)',
        label: 'Ringan (Light)',
      };
    }
    if (percentage <= 75) {
      return {
        color: 'var(--color-secondary-action-base, #0D9488)',
        label: 'Optimal',
      };
    }
    if (percentage <= 90) {
      return {
        color: 'var(--color-warning, #D97706)',
        label: 'Mendekati Kapasitas (Near Capacity)',
      };
    }
    return {
      color: 'var(--color-warning, #D97706)',
      label: 'Kapasitas Penuh (Overload)',
    };
  }, [percentage]);

  React.useEffect(() => {
    if (percentage > 90) {
      onOverloadDetected?.(allocatedMinutes, totalCapacityMinutes);
    }
  }, [percentage, allocatedMinutes, totalCapacityMinutes, onOverloadDetected]);

  return (
    <div className={['focient-capacity-meter', className].filter(Boolean).join(' ')}>
      <div className="focient-capacity-header">
        <span>Beban Kerja Harian ({label})</span>
        <span className="focient-capacity-figures">
          {formatHours(allocatedMinutes)} / {formatHours(totalCapacityMinutes)} ({percentage}%)
        </span>
      </div>

      <div
        className="focient-capacity-track"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Kapasitas harian"
      >
        <div
          className="focient-capacity-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
};
