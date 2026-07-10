import { Inbox } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({ icon: Icon = Inbox, title = 'Nothing here yet', description = '', action, actionLabel }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
      <Icon size={28} className="text-slate-400" />
    </div>
    <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">{title}</h3>
    {description && <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{description}</p>}
    {action && <Button onClick={action} className="mt-2">{actionLabel}</Button>}
  </div>
);
