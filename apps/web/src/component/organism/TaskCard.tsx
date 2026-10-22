import React from 'react';
import { Button } from '../primitive/Button.js';
import { Checkbox } from '../primitive/Checkbox.js';
import { Badge } from '../primitive/Badge.js';

export interface TaskCardProps {
  id: string;
  title: string;
  notes?: string;
  duration?: string;
  completed?: boolean;
  isFocusTop3?: boolean;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onEdit?: (id: string) => void;
  className?: string;
}

/**
 * FoCient Task Card (<TaskCard/>)
 *
 * Core timeline and backlog component.
 * Features 200ms translateY(-2px) elevation hover and 150ms completed micro-fade.
 */
export const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  notes,
  duration,
  completed = false,
  isFocusTop3 = false,
  onToggleComplete,
  onEdit,
  className = '',
}) => {
  return (
    <div
      className={[
        'focient-task-card',
        completed ? 'focient-task-card--completed' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      <Checkbox
        checked={completed}
        onChange={(checked) => onToggleComplete?.(id, checked)}
        aria-label={`Tandai "${title}" sebagai ${completed ? 'belum tuntas' : 'tuntas'}`}
      />

      <div className="focient-task-card-content">
        <h4 className="focient-task-card-title">{title}</h4>
        {notes && <p className="focient-task-card-notes">{notes}</p>}
      </div>

      <div className="focient-task-card-actions">
        {duration && (
          <Badge variant={isFocusTop3 ? 'focus' : 'neutral'}>
            {duration}
          </Badge>
        )}
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(id)}
            aria-label={`Ubah jadwal tugas ${title}`}
          >
            Ubah
          </Button>
        )}
      </div>
    </div>
  );
};
