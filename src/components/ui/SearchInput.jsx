import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { classNames } from '@/utils';

export const SearchInput = ({
  value: externalValue = '',
  onChange,
  placeholder = 'Search…',
  className = '',
}) => {
  const [localValue, setLocalValue] = useState(externalValue);
  const debounced = useDebounce(localValue, 350);

  // Sync external value changes into local state (e.g. reset from parent)
  useEffect(() => {
    setLocalValue(externalValue);
  }, [externalValue]);

  // Fire onChange with debounced value whenever it settles
  useEffect(() => {
    if (debounced !== externalValue) {
      onChange?.(debounced);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className={classNames('relative flex items-center', className)}>
      <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="input-base pl-9 pr-8"
      />
      {localValue && (
        <button
          type="button"
          onClick={() => {
            setLocalValue('');
            onChange?.('');
          }}
          className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
