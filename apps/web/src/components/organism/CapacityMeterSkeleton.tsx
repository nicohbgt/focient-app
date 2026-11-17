import React from 'react';
import { Skeleton } from '../primitive/Skeleton.js';

export interface CapacityMeterSkeletonProps {
  className?: string;
}

/**
 * FoCient Daily Capacity Meter Shimmer Skeleton (<CapacityMeterSkeleton/>)
 *
 * Implements strict Zero Layout Shift (CLS = 0) by matching the exact container dimensions,
 * track height (10px), and legend typography of DailyCapacityMeter.
 */
export const CapacityMeterSkeleton: React.FC<CapacityMeterSkeletonProps> = ({
  className = '',
}) => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat kapasitas harian..."
      className={['focient-capacity-card', className].filter(Boolean).join(' ')}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #CBD5E1',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxSizing: 'border-box',
        width: '100%',
        cursor: 'wait',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="title" width={160} height={18} />
        <Skeleton variant="badge" width={64} height={20} />
      </div>

      <Skeleton width="100%" height={10} borderRadius={9999} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="text" width={110} height={14} />
        <Skeleton variant="text" width={48} height={14} />
      </div>
    </div>
  );
};
