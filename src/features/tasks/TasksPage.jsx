import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import taskService from '@/services/taskService';
import userService from '@/services/userService';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { TaskStatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TaskFormModal } from './TaskFormModal';
import { formatDate } from '@/utils';

const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const PRIORITIES    = ['HIGH', 'MEDIUM', 'LOW'];

export const TasksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const page         = Number(searchParams.get('page') || 1);
  const search       = searchParams.get('search') || '';
  const status       = searchParams.get('status') || '';
  const priority     = searchParams.get('priority') || '';
  const assignedToId = searchParams.get('assignedToId') || '';

  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  // API: paginated → r.data = { success, message, data: [], meta: {} }
  const { data, isLoading, isError } = useQuery({
    queryKey: ['tasks', { page, search, status, priority, assignedToId }],
    queryFn: () =>
      taskService.getAll({ page, limit: 20, search, status, priority, assignedToId }).then((r) => r.data),
    keepPreviousData: true,
  });

  const { data: usersData } = useQuery({
    queryKey: ['users-dropdown'],
    queryFn: () => userService.getDropdown().then((r) => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => taskService.delete(id),
    onSuccess: () => {
      toast.success('Task deleted');
      qc.invalidateQueries({ queryKey: ['tasks'] });
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete task'),
  });

  // data.data = array of tasks, data.meta = pagination meta
  const tasks      = data?.data || [];
  const total      = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 1;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Tasks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{total} total tasks</p>
        </div>
        <Button onClick={() => { setEditTask(null); setFormOpen(true); }}>
          <Plus size={16} /> Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SearchInput
          value={search}
          onChange={(v) => setParam('search', v)}
          placeholder="Search tasks…"
          className="w-56"
        />
        <select value={status} onChange={(e) => setParam('status', e.target.value)} className="input-base w-40">
          <option value="">All Statuses</option>
          {TASK_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select value={priority} onChange={(e) => setParam('priority', e.target.value)} className="input-base w-36">
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={assignedToId} onChange={(e) => setParam('assignedToId', e.target.value)} className="input-base w-44">
          <option value="">All Assignees</option>
          {usersData?.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="p-5"><TableSkeleton rows={7} cols={6} /></div>
        ) : isError ? (
          <div className="p-10 text-center text-sm text-red-500">Failed to load tasks.</div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks found"
            description="Add a task to track your work."
            action={() => { setEditTask(null); setFormOpen(true); }}
            actionLabel="Add Task"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                  {['Title', 'Lead', 'Assigned To', 'Priority', 'Status', 'Due Date', ''].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-slate-400 truncate max-w-[200px]">{task.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {task.lead ? (
                        <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[130px] block">
                          {task.lead.organization}
                        </span>
                      ) : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {task.assignedTo ? (
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {task.assignedTo.name}
                        </span>
                      ) : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                    <td className="px-4 py-3"><TaskStatusBadge status={task.status} /></td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(task.dueDate)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditTask(task); setFormOpen(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(task)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={20}
        onPageChange={(p) => {
          const next = new URLSearchParams(searchParams);
          next.set('page', p);
          setSearchParams(next);
        }}
      />

      <TaskFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} task={editTask} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.id)}
        loading={deleteMutation.isPending}
        title="Delete Task"
        message={`Delete task "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
      />
    </div>
  );
};
