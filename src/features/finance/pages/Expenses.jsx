import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, Edit, CheckCircle, XCircle, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/ui/PageHeader';
import Modal from '../../../components/ui/Modal';
import StatusBadge from '../../../components/ui/StatusBadge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { fetchExpenses, createExpense, approveExpense, rejectExpense, deleteExpense } from '../api/financeApi';

const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);
const CATEGORIES = ['TRAVEL', 'SALARY', 'MARKETING', 'HOSTING', 'OFFICE_RENT', 'ELECTRICITY', 'EQUIPMENT', 'FOOD', 'MISC'];

function ExpenseForm({ onClose }) {
  const qc = useQueryClient();
  const { register, handleSubmit } = useForm({
    defaultValues: { title: '', description: '', amount: '', category: 'MISC', expenseDate: new Date().toISOString().split('T')[0], notes: '' },
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (k !== 'bill') fd.append(k, v); });
      if (data.bill?.[0]) fd.append('bill', data.bill[0]);
      return createExpense(fd);
    },
    onSuccess: () => { qc.invalidateQueries(['expenses']); toast.success('Expense submitted'); onClose(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Title *</label><input {...register('title', { required: true })} className="input" /></div>
        <div>
          <label className="label">Category</label>
          <select {...register('category')} className="input">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div><label className="label">Amount *</label><input {...register('amount', { required: true })} type="number" step="0.01" className="input" /></div>
        <div><label className="label">Date</label><input {...register('expenseDate')} type="date" className="input" /></div>
      </div>
      <div><label className="label">Description</label><textarea {...register('description')} className="input h-16 resize-none" /></div>
      <div>
        <label className="label">Bill / Receipt</label>
        <input {...register('bill')} type="file" accept="image/*,.pdf" className="input py-2" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? <LoadingSpinner size="sm" /> : 'Submit Expense'}
        </button>
      </div>
    </form>
  );
}

export default function Expenses() {
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', search, statusFilter, catFilter],
    queryFn: () => fetchExpenses({ search, status: statusFilter || undefined, category: catFilter || undefined, limit: 50 }),
  });

  const approveMutation = useMutation({
    mutationFn: approveExpense,
    onSuccess: () => { qc.invalidateQueries(['expenses']); toast.success('Approved'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => rejectExpense(id, 'Rejected by CFO'),
    onSuccess: () => { qc.invalidateQueries(['expenses']); toast.success('Rejected'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => { qc.invalidateQueries(['expenses']); toast.success('Deleted'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const expenses = data?.data || [];

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        title="Expenses"
        subtitle={`${data?.pagination?.total || 0} expenses`}
        actions={
          <button onClick={() => setModal(true)} className="btn-primary">
            <Plus size={16} /> Add Expense
          </button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search expenses..." className="input pl-9" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-40">
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="input w-44">
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Submitted By</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Bill</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-slate-500">No expenses found</td></tr>
                ) : expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="font-medium">{e.title}</td>
                    <td><span className="badge badge-blue">{e.category.replace('_', ' ')}</span></td>
                    <td>{e.submittedBy?.name}</td>
                    <td className="text-slate-400">{new Date(e.expenseDate).toLocaleDateString('en-IN')}</td>
                    <td className="font-semibold">{fmt(e.amount)}</td>
                    <td>
                      {e.billUrl ? (
                        <a href={e.billUrl} target="_blank" rel="noreferrer" className="text-primary-400 hover:underline text-xs flex items-center gap-1">
                          <Upload size={12} /> View
                        </a>
                      ) : <span className="text-slate-500">—</span>}
                    </td>
                    <td><StatusBadge status={e.status} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        {e.status === 'PENDING' && (
                          <>
                            <button onClick={() => approveMutation.mutate(e.id)} className="p-1.5 hover:bg-emerald-500/10 rounded-lg text-slate-400 hover:text-emerald-400" title="Approve"><CheckCircle size={13} /></button>
                            <button onClick={() => rejectMutation.mutate(e.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400" title="Reject"><XCircle size={13} /></button>
                          </>
                        )}
                        <button onClick={() => { if (window.confirm('Delete?')) deleteMutation.mutate(e.id); }} className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400" title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Expense" size="md">
        <ExpenseForm onClose={() => setModal(false)} />
      </Modal>
    </div>
  );
}
