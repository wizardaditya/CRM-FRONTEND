import { forwardRef } from 'react';
import { classNames } from '@/utils';

export const Input = forwardRef(({ label, error, className = '', ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}
      </label>
    )}
    <input
      ref={ref}
      className={classNames(
        'input-base',
        error && 'border-red-500 focus:ring-red-500/30 focus:border-red-500',
        className
      )}
      {...props}
    />
    {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
  </div>
));
Input.displayName = 'Input';

export const Select = forwardRef(({ label, error, children, className = '', ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}
      </label>
    )}
    <select
      ref={ref}
      className={classNames(
        'input-base',
        error && 'border-red-500 focus:ring-red-500/30 focus:border-red-500',
        className
      )}
      {...props}
    >
      {children}
    </select>
    {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
  </div>
));
Select.displayName = 'Select';

export const Textarea = forwardRef(({ label, error, className = '', ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}
      </label>
    )}
    <textarea
      ref={ref}
      className={classNames(
        'input-base resize-none',
        error && 'border-red-500 focus:ring-red-500/30 focus:border-red-500',
        className
      )}
      {...props}
    />
    {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
  </div>
));
Textarea.displayName = 'Textarea';
