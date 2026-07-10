import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const COLOR_CLASSES = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',     icon: 'bg-blue-500',   text: 'text-blue-600 dark:text-blue-400' },
  green:  { bg: 'bg-green-50 dark:bg-green-900/20',   icon: 'bg-green-500',  text: 'text-green-600 dark:text-green-400' },
  red:    { bg: 'bg-red-50 dark:bg-red-900/20',       icon: 'bg-red-500',    text: 'text-red-600 dark:text-red-400' },
  amber:  { bg: 'bg-amber-50 dark:bg-amber-900/20',   icon: 'bg-amber-500',  text: 'text-amber-600 dark:text-amber-400' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', icon: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400' },
  teal:   { bg: 'bg-teal-50 dark:bg-teal-900/20',     icon: 'bg-teal-500',   text: 'text-teal-600 dark:text-teal-400' },
  pink:   { bg: 'bg-pink-50 dark:bg-pink-900/20',     icon: 'bg-pink-500',   text: 'text-pink-600 dark:text-pink-400' },
};

export const KpiCard = ({ title, value, icon: Icon, color = 'blue', trend }) => {
  const c = COLOR_CLASSES[color] || COLOR_CLASSES.blue;
  const isPositive = trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`${c.bg} rounded-2xl p-5 border border-white/60 dark:border-white/5 backdrop-blur-sm relative overflow-hidden group hover:shadow-lg transition-shadow`}
    >
      {/* Decorative circle */}
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 bg-current" />

      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center shadow-sm flex-shrink-0`}
        >
          <Icon size={20} className="text-white" />
        </div>
        {trend !== undefined && trend !== null && (
          <div
            className={`flex items-center gap-1 text-xs font-bold ${
              isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
            }`}
          >
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
          {value ?? '—'}
        </p>
        <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {title}
        </p>
      </div>
    </motion.div>
  );
};
