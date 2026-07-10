import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Bell, CheckCheck, BellOff } from 'lucide-react';
import toast from 'react-hot-toast';
import notificationService from '@/services/notificationService';
import { useNotificationStore } from '@/store/notificationStore';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { timeAgo } from '@/utils';

export const NotificationsPage = () => {
  const {
    notifications: storeNotifications,
    setNotifications,
    markRead: storeMarkRead,
    markAllRead: storeMarkAllRead,
    unreadCount,
  } = useNotificationStore();

  // API response shape:
  //   axios r.data = { success, message, data: { notifications: [], unreadCount: N } }
  // So queryFn returns r.data  →  data = { success, message, data: { notifications, unreadCount } }
  // We then read data.data.notifications and data.data.unreadCount
  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getAll({ limit: 100 }).then((r) => r.data),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationService.markRead(id),
    onMutate: (id) => {
      storeMarkRead(id);
    },
    onError: () => toast.error('Failed to mark as read'),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onMutate: () => storeMarkAllRead(),
    onError: () => toast.error('Failed to mark all as read'),
  });

  // Sync server data into the notification store on load
  useEffect(() => {
    if (data?.data) {
      // data.data = { notifications: [], unreadCount: N }
      const items = data.data.notifications || [];
      const unread = data.data.unreadCount ?? items.filter((n) => !n.isRead).length;
      setNotifications(items, unread);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const notifications = storeNotifications;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllMutation.mutate()}
            loading={markAllMutation.isPending}
          >
            <CheckCheck size={15} />
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : isError ? (
        <div className="text-center text-sm text-red-500 py-10">Failed to load notifications.</div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="No notifications"
          description="You're all caught up! Notifications will appear here."
        />
      ) : (
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markReadMutation.mutate(n.id)}
              className={`flex items-start gap-3 px-5 py-4 transition-colors ${
                !n.isRead
                  ? 'bg-brand-50/50 dark:bg-brand-900/10 cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-900/20'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                !n.isRead
                  ? 'bg-brand-100 dark:bg-brand-900/40'
                  : 'bg-slate-100 dark:bg-slate-800'
              }`}>
                <Bell size={14} className={!n.isRead ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${
                  !n.isRead
                    ? 'font-semibold text-slate-800 dark:text-slate-200'
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {n.message}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.isRead && (
                <div className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
