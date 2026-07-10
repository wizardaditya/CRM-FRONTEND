import { classNames } from '@/utils';
import {
  LEAD_STATUS_LABELS, LEAD_STATUS_COLORS,
  PRIORITY_COLORS, TASK_STATUS_COLORS,
} from '@/constants';

export const StatusBadge = ({ status }) => (
  <span className={classNames('badge', LEAD_STATUS_COLORS[status] || 'bg-slate-100 text-slate-600')}>
    <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
    {LEAD_STATUS_LABELS[status] || status}
  </span>
);

export const PriorityBadge = ({ priority }) => (
  <span className={classNames('badge', PRIORITY_COLORS[priority] || 'bg-slate-100 text-slate-600')}>
    {priority}
  </span>
);

export const TaskStatusBadge = ({ status }) => (
  <span className={classNames('badge', TASK_STATUS_COLORS[status] || 'bg-slate-100 text-slate-600')}>
    {status?.replace('_', ' ')}
  </span>
);
