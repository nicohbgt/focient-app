import React from 'react';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * FoCient Input Field (<InputField/>)
 *
 * For fast forms, task titles, and durations.
 * Clean, uncluttered input with 2px primary focus state.
 */
export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="focient-input-container">
      {label && (
        <label htmlFor={inputId} className="focient-input-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'focient-input',
          error ? 'focient-input--error' : '',
          className,
        ].filter(Boolean).join(' ')}
        {...props}
      />
      {error && (
        <span style={{ fontSize: '12px', color: 'var(--color-danger-action-base, #E11D48)' }}>
          {error}
        </span>
      )}
    </div>
  );
};
