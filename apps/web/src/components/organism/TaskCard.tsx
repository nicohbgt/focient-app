import React from 'react';
import { useFoCientI18n } from '../i18n/I18nContext.js';
import { Button } from '../primitive/Button.js';
import { Checkbox } from '../primitive/Checkbox.js';
import { Badge } from '../primitive/Badge.js';
import { Tag } from '../primitive/Tag.js';
import {
  ClockIcon,
  PlayIcon,
  PauseIcon,
  CheckIcon,
  RotateCcwIcon,
  PlusIcon,
  PencilIcon,
} from '../icons/index.js';

export type TaskCardVariant =
  | 'single-focus'
  | 'top-3'
  | 'scheduled'
  | 'reschedule'
  | 'backlog'
  | 'completed'
  | 'standard';

export interface TaskCardProps {
  id: string;
  title: string;
  variant?: TaskCardVariant;
  notes?: string;
  duration?: string; // e.g. "45m"
  timeSlot?: string; // e.g. "09:00 - 09:45"
  priorityRank?: number; // 1, 2, or 3 for Top 3 Priority
  projectCategory?: string;
  projectColor?: 'blue' | 'teal' | 'purple' | 'amber' | 'emerald' | 'gray';
  progressPercentage?: number; // for single-task focus card (0-100)
  timerDisplay?: string; // for single-task focus card (e.g. "24:18")
  isPaused?: boolean;
  completed?: boolean;
  isDragging?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onAdjust?: (id: string) => void;
  onShiftNextSlot?: (id: string) => void;
  onAddToToday?: (id: string) => void;
  onPauseResume?: (id: string, isPaused: boolean) => void;
  onEdit?: (id: string) => void;
  className?: string;
}

/**
 * FoCient Master Task Card (<TaskCard/>)
 *
 * Implements the complete 7-variant Cards Suite according to FoCient design specs:
 * 1. Single-Task Focus Card (Active focus session with timer & progress)
 * 2. Top 3 Priority Card (High cognitive clarity with rank pill & tag)
 * 3. Timeline / Scheduled Task Card (Real-world time slot with quick adjust)
 * 4. Guilt-Free Adaptive Reschedule Card (Anti-toxic reschedule prompt)
 * 5. Backlog Task Card (Unscheduled queue with silent auto-placement)
 * 6. Completed Task Card (History with micro-fade & strikethrough)
 * 7. Daily Capacity Meter Card (Exported separately as DailyCapacityMeterCard)
 */
export const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  variant = 'standard',
  notes,
  duration,
  timeSlot,
  priorityRank,
  projectCategory,
  projectColor = 'blue',
  progressPercentage = 45,
  timerDisplay = '24:18',
  isPaused = false,
  completed = false,
  isDragging,
  draggable = false,
  onDragStart,
  onDragEnd,
  onToggleComplete,
  onAdjust,
  onShiftNextSlot,
  onAddToToday,
  onPauseResume,
  onEdit,
  className = '',
}) => {
  const { copywriting } = useFoCientI18n();
  const [internalDragging, setInternalDragging] = React.useState(false);
  const activeDragging = isDragging ?? internalDragging;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setInternalDragging(true);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        /* ignore */
      }
    }
    onDragStart?.(e);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setInternalDragging(false);
    onDragEnd?.(e);
  };

  // Automatic completed style if completed prop is true
  const activeVariant = completed ? 'completed' : variant;

  /* =========================================================================
     VARIANT 1: SINGLE-TASK FOCUS CARD (Top of interface, active focus)
     ========================================================================= */
  if (activeVariant === 'single-focus') {
    return (
      <div
        draggable={draggable}
        onDragStart={draggable ? handleDragStart : undefined}
        onDragEnd={draggable ? handleDragEnd : undefined}
        className={[
          'focient-task-card',
          'focient-card--single-focus',
          activeDragging ? 'focient-task-card--dragging' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Top Header: Badge [SEDANG BERJALAN] + Timer */}
        <div className="focient-focus-top-bar">
          <Badge variant="focus" size="sm">
            ⚡ {copywriting.status.inProgress}
          </Badge>
          <span className="focient-tnum" style={{ fontWeight: 700, fontSize: '15px', color: '#1E3A8A' }}>
            {timerDisplay}
          </span>
        </div>

        {/* Task Title & Notes */}
        <div>
          <h3 className="focient-task-card-title" style={{ fontSize: '17px' }}>
            {title}
          </h3>
          {notes && <p className="focient-task-card-notes">{notes}</p>}
        </div>

        {/* 6px Progress Bar */}
        <div
          className="focient-focus-progress-track"
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="focient-focus-progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Footer Actions: Project Tag, Pause/Resume, Complete */}
        <div className="focient-focus-footer">
          <div>
            {projectCategory && (
              <Tag label={projectCategory} variant={projectColor} />
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {onPauseResume && (
              <Button
                variant="ghost"
                size="sm"
                leadingIcon={isPaused ? <PlayIcon size="xs" /> : <PauseIcon size="xs" />}
                onClick={() => onPauseResume(id, !isPaused)}
              >
                {isPaused ? copywriting.actions.resume : copywriting.actions.pause}
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              leadingIcon={<CheckIcon size="xs" />}
              onClick={() => onToggleComplete?.(id, true)}
            >
              {copywriting.actions.complete}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     VARIANT 4: GUILT-FREE ADAPTIVE / RESCHEDULE CARD
     Strictly avoids "Terlambat" / "Late" or red color!
     ========================================================================= */
  if (activeVariant === 'reschedule') {
    return (
      <div
        draggable={draggable}
        onDragStart={draggable ? handleDragStart : undefined}
        onDragEnd={draggable ? handleDragEnd : undefined}
        className={[
          'focient-task-card',
          'focient-card--reschedule',
          activeDragging ? 'focient-task-card--dragging' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Checkbox
          checked={false}
          needsAdjustment={true}
          onChange={() => onShiftNextSlot?.(id)}
          aria-label={copywriting.adaptive.rescheduleNotice}
        />

        <div className="focient-task-card-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <Badge variant="warning" size="xs">
              {copywriting.adaptive.rescheduleNotice}
            </Badge>
            {duration && (
              <span className="focient-tnum" style={{ fontSize: '11px', color: '#92400E' }}>
                {duration}
              </span>
            )}
          </div>
          <h4 className="focient-task-card-title" style={{ color: '#92400E' }}>
            {title}
          </h4>
          <p className="focient-task-card-notes" style={{ color: '#B45309' }}>
            {copywriting.adaptive.rescheduleDescription}
          </p>
        </div>

        <div className="focient-task-card-actions">
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<RotateCcwIcon size="xs" />}
            onClick={() => onShiftNextSlot?.(id)}
          >
            {copywriting.actions.shiftToNextSlot}
          </Button>
        </div>
      </div>
    );
  }

  /* =========================================================================
     VARIANT 2, 3, 5, 6 & STANDARD
     ========================================================================= */
  const cardClasses = [
    'focient-task-card',
    activeVariant === 'top-3' ? 'focient-card--top-3' : '',
    activeVariant === 'scheduled' ? 'focient-card--scheduled' : '',
    activeVariant === 'backlog' ? 'focient-card--backlog' : '',
    activeVariant === 'completed' ? 'focient-card--completed' : '',
    activeDragging ? 'focient-task-card--dragging' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      onDragEnd={draggable ? handleDragEnd : undefined}
      className={cardClasses}
    >
      {/* Checkbox (or Rank Indicator for Top 3) */}
      <Checkbox
        checked={completed}
        onChange={(checkedVal) => onToggleComplete?.(id, checkedVal)}
        aria-label={
          completed
            ? copywriting.status.markIncomplete(title)
            : copywriting.status.markCompleted(title)
        }
      />

      <div className="focient-task-card-content">
        {/* Time slot for scheduled variant */}
        {timeSlot && activeVariant === 'scheduled' && (
          <div className="focient-card-time-slot focient-tnum">
            {timeSlot}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Priority Rank (#1, #2, #3) */}
          {priorityRank && (
            <Badge variant="focus" size="xs">
              #{priorityRank}
            </Badge>
          )}

          <h4 className="focient-task-card-title">{title}</h4>
        </div>

        {notes && <p className="focient-task-card-notes">{notes}</p>}
      </div>

      <div className="focient-task-card-actions">
        {projectCategory && (
          <Tag label={projectCategory} variant={projectColor} />
        )}

        {duration && (
          <Badge variant={priorityRank ? 'focus' : 'neutral'} size="xs">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <ClockIcon size={12} />
              {duration}
            </span>
          </Badge>
        )}

        {/* Backlog action: [+ Hari Ini / + Today] */}
        {activeVariant === 'backlog' && onAddToToday && (
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={<PlusIcon size="xs" />}
            onClick={() => onAddToToday(id)}
            aria-label={`${copywriting.actions.addToToday} (${title})`}
          >
            {copywriting.actions.addToToday}
          </Button>
        )}

        {/* Scheduled action: [Sesuaikan / Adjust] */}
        {activeVariant === 'scheduled' && onAdjust && (
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={<RotateCcwIcon size="xs" />}
            onClick={() => onAdjust(id)}
            aria-label={`${copywriting.actions.adjust} (${title})`}
          >
            {copywriting.actions.adjust}
          </Button>
        )}

        {/* Standard edit button */}
        {onEdit && activeVariant !== 'scheduled' && activeVariant !== 'backlog' && (
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={<PencilIcon size="xs" />}
            onClick={() => onEdit(id)}
            aria-label={`${copywriting.actions.edit} (${title})`}
          >
            {copywriting.actions.edit}
          </Button>
        )}
      </div>
    </div>
  );
};

/* Convenience Named Wrappers for Semantic Cleanliness */
export const FocusTaskCard: React.FC<Omit<TaskCardProps, 'variant'>> = (props) => (
  <TaskCard {...props} variant="single-focus" />
);

export const Top3PriorityCard: React.FC<Omit<TaskCardProps, 'variant'>> = (props) => (
  <TaskCard {...props} variant="top-3" />
);

export const TimelineTaskCard: React.FC<Omit<TaskCardProps, 'variant'>> = (props) => (
  <TaskCard {...props} variant="scheduled" />
);

export const AdaptiveRescheduleCard: React.FC<Omit<TaskCardProps, 'variant'>> = (props) => (
  <TaskCard {...props} variant="reschedule" />
);

export const BacklogTaskCard: React.FC<Omit<TaskCardProps, 'variant'>> = (props) => (
  <TaskCard {...props} variant="backlog" />
);

export const CompletedTaskCard: React.FC<Omit<TaskCardProps, 'variant'>> = (props) => (
  <TaskCard {...props} variant="completed" completed={true} />
);
