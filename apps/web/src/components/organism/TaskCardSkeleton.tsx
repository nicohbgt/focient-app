import React from 'react';
import { Skeleton } from '../primitive/Skeleton.js';

export interface TaskCardSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * FoCient TaskCard Shimmer Skeleton (<TaskCardSkeleton/>)
 *
 * Implements strict Zero Layout Shift (CLS = 0) by matching the exact padding (16px),
 * gap (12px), border-radius (12px), border (1px), and layout dimensions of TaskCard.
 */
export const TaskCardSkeleton: React.FC<TaskCardSkeletonProps> = ({
  count = 1,
  className = '',
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          role="status"
          aria-busy="true"
          aria-label="Memuat kartu tugas..."
          className={['focient-task-card', 'focient-task-card--skeleton', className].filter(Boolean).join(' ')}
          style={{ cursor: 'wait' }}
        >
          {/* Checkbox Placeholder (20px x 20px) */}
          <Skeleton circle width={20} height={20} style={{ flexShrink: 0 }} />

          {/* Text Content Column */}
          <div className="focient-task-card-content" style={{ gap: '6px' }}>
            <Skeleton variant="text" width={`${60 + (index % 3) * 15}%`} height={16} />
            <Skeleton variant="text" width={`${35 + (index % 2) * 12}%`} height={12} />
          </div>

          {/* Trailing Duration & Badge Placeholder */}
          <div className="focient-task-card-actions" style={{ gap: '8px' }}>
            <Skeleton variant="badge" width={48} height={20} />
          </div>
        </div>
      ))}
    </>
  );
};
