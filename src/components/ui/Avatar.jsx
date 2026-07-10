import { getInitials } from '@/utils';

const COLOR_MAP = [
  'bg-blue-500', 'bg-violet-500', 'bg-green-500', 'bg-amber-500',
  'bg-rose-500', 'bg-indigo-500', 'bg-teal-500', 'bg-pink-500',
  'bg-orange-500', 'bg-cyan-500',
];

const getColorForName = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLOR_MAP[Math.abs(hash) % COLOR_MAP.length];
};

const SIZES = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
};

export const Avatar = ({ name = '', src, size = 'md' }) => {
  const sizeClass = SIZES[size] || SIZES.md;
  const colorClass = getColorForName(name);
  const initials = getInitials(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 ring-2 ring-white dark:ring-slate-800`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${colorClass} rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold ring-2 ring-white dark:ring-slate-800`}
      title={name}
    >
      {initials || '?'}
    </div>
  );
};
