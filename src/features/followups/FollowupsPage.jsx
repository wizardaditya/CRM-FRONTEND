import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Phone, Mail, MessageCircle, Globe, MapPin, User,
  Plus, Pencil, Trash2, Clock, AlertCircle, Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { isToday, isTomorrow, isThisWeek, isPast, parseISO } from 'date-fns';
import followupService from '@/services/followupService';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FollowupFormModal } from './FollowupFormModal';
import { formatDateTime } from '@/utils';

const TYPE_ICONS = {
  CALL: Phone, EMAIL: Mail, WHATSAPP: MessageCircle,
  MEETING: User, DEMO: Globe, VISIT: MapPin,
};

const TYPE_COLORS = {
  CALL:      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  EMAIL:     'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
  WHATSAPP:  'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  MEETING:   'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  DEMO:      'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400',
  VISIT:     'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
};

const GROUP_CONFIG = [
  {
    key: 'overdue',
    label: 'Overdue',
    icon: AlertCircle,
    iconClass: 'text-red-500',
    // Followup status enum: PENDING | DONE | CANCELLED
    // Overdue = not DONE and past due date (excluding today)
    filter: (fu) => fu.status !== 'DONE' && isPast(parseISO(fu.scheduledAt)) && !isToday(parseISO(fu.scheduledAt)),
  },
  {
    key: 'today',
    label: 'Today',
    icon: Clock,
    iconClass: 'text-amber-500',
    filter: (fu) => isToday(parseISO(fu.scheduledAt)),
  },
  {
    key: 'tomorrow',
    label: 'Tomorrow',
    icon: Calendar,
    iconClass: 'text-blue-500',
    filter: (fu) => isTomorrow(parseISO(fu.scheduledAt)),
  },
  {
    key: 'week',
    label: 'This Week',
    icon: Calendar,
    iconClass: 'text-green-500',
    filter: (fu) =>
      isThisWeek(parseISO(fu.scheduledAt), { weekStartsOn: 1 }) &&
      !isToday(parseISO(fu.scheduledAt)) &&
      !isTomorrow(parseISO(fu.scheduledAt)),
  },
];

const FollowupCard = ({ followup, onEdit, onDelete }) => {
  const Icon = TYPE_ICONS[followup.type] || Phone;
  const colorClass = TYPE_COLORS[followup.type] || 'bg-slate-100 text-slate-600';

  // Status badge: PENDING (amber), DONE (green), CANCELLED (red)
  const statusColor = 
    followup.status === 'DONE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
    followup.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';

  return (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-sm transition-all">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
          {followup.lead?.organization || 'Unknown Lead'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {followup.type} · {formatDateTime(followup.scheduledAt)}
        </p>
        {followup.notes && (
          <p className="text-xs text-slate-400 truncate mt-0.5">{followup.notes}</p>
        )}
      </div>
      <span className={`badge text-xs flex-shrink-0 ${statusColor}`}>
        {followup.status}
      </span>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onEdit(followup)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(followup)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

export const FollowupsPage = () => {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editFollowup, setEditFollowup] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['followups'],
    queryFn: () => followupService.getAll({ limit: 200 }).then((r) => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => followupService.delete(id),
    onSuccess: () => {
      toast.success('Follow-up deleted');
      qc.invalidateQueries({ queryKey: ['followups'] });
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  const followups = data || [];

  const grouped = GROUP_CONFIG.map((g) => ({
    ...g,
    items: followups.filter(g.filter),
  }));

  // "Upcoming" bucket for everything else
  const bucketed = new Set(grouped.flatMap((g) => g.items.map((f) => f.id)));
  const upcoming = followups.filter((f) => !bucketed.has(f.id));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Follow-ups</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {followups.length} follow-ups total
          </p>
        </div>
        <Button onClick={() => { setEditFollowup(null); setFormOpen(true); }}>
          <Plus size={16} /> Schedule Follow-up
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : isError ? (
        <div className="text-center text-sm text-red-500 py-10">Failed to load follow-ups.</div>
      ) : followups.length === 0 ? (
        <EmptyState
          icon={Phone}
          title="No follow-ups"
          description="Schedule your first follow-up to stay on top of leads."
          action={() => setFormOpen(true)}
          actionLabel="Schedule"
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(({ key, label, icon: GroupIcon, iconClass, items }) =>
            items.length > 0 ? (
              <div key={key}>
                <div className="flex items-center gap-2 mb-3">
                  <GroupIcon size={15} className={iconClass} />
                  <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {label}
                  </h2>
                  <span className="text-xs text-slate-400 font-semibold">({items.length})</span>
                </div>
                <div className="space-y-2">
                  {items.map((fu) => (
                    <FollowupCard
                      key={fu.id}
                      followup={fu}
                      onEdit={(f) => { setEditFollowup(f); setFormOpen(true); }}
                      onDelete={(f) => setDeleteTarget(f)}
                    />
                  ))}
                </div>
              </div>
            ) : null
          )}

          {upcoming.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={15} className="text-slate-400" />
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">Upcoming</h2>
                <span className="text-xs text-slate-400 font-semibold">({upcoming.length})</span>
              </div>
              <div className="space-y-2">
                {upcoming.map((fu) => (
                  <FollowupCard
                    key={fu.id}
                    followup={fu}
                    onEdit={(f) => { setEditFollowup(f); setFormOpen(true); }}
                    onDelete={(f) => setDeleteTarget(f)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <FollowupFormModal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditFollowup(null); }}
        followup={editFollowup}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.id)}
        loading={deleteMutation.isPending}
        title="Delete Follow-up"
        message="Are you sure you want to delete this follow-up?"
        confirmLabel="Delete"
      />
    </div>
  );
};
