import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import contactService from '@/services/contactService';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Avatar } from '@/components/ui/Avatar';
import { ContactFormModal } from './ContactFormModal';

export const ContactsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const page   = Number(searchParams.get('page') || 1);
  const search = searchParams.get('search') || '';

  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  // API: paginated → r.data = { success, message, data: [], meta: {} }
  const { data, isLoading, isError } = useQuery({
    queryKey: ['contacts', { page, search }],
    queryFn: () => contactService.getAll({ page, limit: 20, search }).then((r) => r.data),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => contactService.delete(id),
    onSuccess: () => {
      toast.success('Contact deleted');
      qc.invalidateQueries({ queryKey: ['contacts'] });
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete contact'),
  });

  // data.data = array of contacts, data.meta = pagination meta
  const contacts   = data?.data || [];
  const total      = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 1;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Contacts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{total} total contacts</p>
        </div>
        <Button onClick={() => { setEditContact(null); setFormOpen(true); }}>
          <Plus size={16} /> Add Contact
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <SearchInput
          value={search}
          onChange={(v) => setParam('search', v)}
          placeholder="Search contacts…"
          className="w-60"
        />
      </div>

      <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="p-5"><TableSkeleton rows={8} cols={6} /></div>
        ) : isError ? (
          <div className="p-10 text-center text-sm text-red-500">Failed to load contacts.</div>
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No contacts found"
            description="Add your first contact to get started."
            action={() => { setEditContact(null); setFormOpen(true); }}
            actionLabel="Add Contact"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                  {['Name', 'Email', 'Mobile', 'Designation', 'Company / Lead', ''].map((h) => (
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
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          name={`${contact.firstName} ${contact.lastName}`}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {contact.firstName} {contact.lastName}
                          </p>
                          {contact.isPrimary && (
                            <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400">
                              Primary
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                      {contact.email || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                      {contact.mobile || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                      {contact.designation || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                      {contact.lead?.organization || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditContact(contact); setFormOpen(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(contact)}
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

      <ContactFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} contact={editContact} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.id)}
        loading={deleteMutation.isPending}
        title="Delete Contact"
        message={`Delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}?`}
        confirmLabel="Delete"
      />
    </div>
  );
};
