import { classNames } from '@/utils';

export const Skeleton = ({ className = '' }) => (
  <div className={classNames('skeleton', className)} />
);

export const KpiSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
    {Array.from({ length: 9 }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
        <Skeleton className="w-9 h-9 rounded-xl mb-3" />
        <Skeleton className="h-7 w-20 mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 6, cols = 6 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: cols }).map((__, j) => (
          <Skeleton key={j} className="h-10 flex-1 rounded-xl" />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3">
    <Skeleton className="h-5 w-40" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-3/4" />
  </div>
);
