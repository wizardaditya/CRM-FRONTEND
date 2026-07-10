import { Loader2 } from 'lucide-react';
import { classNames } from '@/utils';

const variants = {
  primary: 'btn-primary',
  ghost:   'btn-ghost',
  danger:  'btn-danger',
  outline: 'inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-600 text-brand-600 hover:bg-brand-50 text-sm font-semibold transition-all',
};

export const Button = ({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false, className = '', ...props
}) => {
  const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-6 py-3 text-base' : '';
  return (
    <button
      className={classNames(variants[variant], sizeClass, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
};
