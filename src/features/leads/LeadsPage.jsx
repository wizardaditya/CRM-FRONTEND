import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useReactTable, getCoreRowModel, flexRender,
} from '@tanstack/react-table';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import leadService from '@/services/leadService';
import userService from '@/services/userService';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LeadFormModal } from './LeadFormModal';
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from '@/constants';
import { formatCurrency, formatDate } from '@/utils';

const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];

export const LeadsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const page     = Number(searchParams.get('page') || 1);
  const search   = searchParams.get('search') || '';
  const status   = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const assignedToId = searchParams.get('assignedToId') || '';

  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['leads', { page, search, status, priority, assignedToId }],
    queryFn: () =>
      leadService.getAll({ page, limit: 20, search, status, priority, assignedToId }).then((r) => r.data),
    staleTime: 30000, // 30 seconds cache
  });

  const { data: usersData } = useQuery({
    queryKey: ['users-dropdown'],
    queryFn: () => userService.getDropdown().then((r) => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => leadService.delete(id),
    onSuccess: () => {
      toast.success('Lead deleted');
      qc.invalidateQueries({ queryKey: ['leads'] });
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete lead'),
  });

  const leads = data?.data || [];
  const total = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 1;

  const columns = [
    {
      accessorKey: 'leadNumber',
      header: 'Lead #',
      cell: ({ row }) => (
        <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
          {row.original.leadNumber}
        </span>
      ),
    },
    {
      accessorKey: 'organization',
      header: 'Organization',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
            {row.original.organization}
          </p>
          <p className="text-xs text-slate-400 truncate max-w-[160px]">{row.original.contactPerson}</p>
        </div>
      ),
    },
    {
      accessorKey: 'mobile',
      header: 'Mobile',
      cell: ({ getValue }) => <span className="text-xs text-slate-600 dark:text-slate-400">{getValue()}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ getValue }) => <PriorityBadge priority={getValue()} />,
    },
    {
      accessorKey: 'expectedValue',
      header: 'Exp. Value',
      cell: ({ getValue }) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {formatCurrency(getValue())}
        </span>
      ),
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned To',
      cell: ({ getValue }) => {
        const u = getValue();
        return u ? (
          <span className="text-xs text-slate-600 dark:text-slate-400">{u.name}</span>
        ) : <span className="text-xs text-slate-400">—</span>;
      },
    },
    {
      accessorKey: 'nextFollowup',
      header: 'Next Follow-up',
      cell: ({ getValue }) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(getValue?.()?.scheduledAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/leads/${row.original.id}`)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
            title="View"
          >
            <ExternalLink size={14} />
          </button>
          <button
            onClick={() => { setEditLead(row.original); setFormOpen(true); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setDeleteTarget(row.original)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({ data: leads, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Leads</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{total} total leads</p>
        </div>
        <Button onClick={() => { setEditLead(null); setFormOpen(true); }}>
          <Plus size={16} />
          Add Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SearchInput
          value={search}
          onChange={(v) => setParam('search', v)}
          placeholder="Search leads…"
          className="w-60"
        />
        <select
          value={status}
          onChange={(e) => setParam('status', e.target.value)}
          className="input-base w-44"
        >
          <option value="">All Statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setParam('priority', e.target.value)}
          className="input-base w-36"
        >
          <option value="">All Priorities</option>
          {['HIGH', 'MEDIUM', 'LOW'].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={assignedToId}
          onChange={(e) => setParam('assignedToId', e.target.value)}
          className="input-base w-44"
        >
          <option value="">All Assignees</option>
          {usersData?.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="p-5"><TableSkeleton rows={8} cols={8} /></div>
        ) : isError ? (
          <div className="p-10 text-center text-sm text-red-500">Failed to load leads.</div>
        ) : leads.length === 0 ? (
          <EmptyState
            title="No leads found"
            description="Try adjusting your filters or add a new lead."
            action={() => { setEditLead(null); setFormOpen(true); }}
            actionLabel="Add Lead"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap"
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => navigate(`/leads/${row.original.id}`)}
                    className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
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

      <LeadFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        lead={editLead}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.id)}
        loading={deleteMutation.isPending}
        title="Delete Lead"
        message={`Are you sure you want to delete "${deleteTarget?.organization}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
};
