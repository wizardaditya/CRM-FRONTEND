import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Edit, Eye, ArrowRight, RefreshCw } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/ui/PageHeader';
import Modal from '../../../components/ui/Modal';
import StatusBadge from '../../../components/ui/StatusBadge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import {
  fetchQuotations, createQuotation, updateQuotation, deleteQuotation,
  updateQuotationStatus, convertQuotation, fetchContacts,
} from '../api/financeApi';

const fmt = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

const STATUSES = ['DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED'];

const defaultItem = { description: '', quantity: 1, unitPrice: 0, discountPct: 0, taxRate: 0 };

function QuotationForm({ onClose, editing }) {
  const qc = useQueryClient();
  const { data: contactsRes } = useQuery({ queryKey: ['contacts-list'], queryFn: () => fetchContacts({ limit: 100 }) });
  const contacts = contactsRes?.data || [];

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: editing || {
      title: '', contactId: '', expiryDate: '', gstType: 'CGST_SGST',
      discountType: 'percentage', discountValue: 0,
      cgstRate: 9, sgstRate: 9, igstRate: 18, notes: '', terms: '',
      items: [defaultItem],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const mutation = useMutation({
    mutationFn: (data) => editing ? updateQuotation(editing.id, data) : createQuotation(data),
    onSuccess: () => {
      qc.invalidateQueries(['quotations']);
      toast.success(editing ? 'Quotation updated' : 'Quotation created');
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const items = watch('items');
  const gstType = watch('gstType');
  const discountType = watch('discountType');
  const discountValue = parseFloat(watch('discountValue')) || 0;
  const cgstRate = parseFloat(watch('cgstRate')) || 9;
  const sgstRate = parseFloat(watch('sgstRate')) || 9;
  const igstRate = parseFloat(watch('igstRate')) || 18;

  const subtotal = items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0) * (1 - (parseFloat(i.discountPct) || 0) / 100), 0);
  const discountAmount = discountType === 'percentage' ? (subtotal * discountValue) / 100 : discountValue;
  const taxable = subtotal - discountAmount;
  const taxAmount = gstType === 'CGST_SGST' ? (taxable * (cgstRate + sgstRate)) / 100 : (taxable * igstRate) / 100;
  const grand = taxable + taxAmount;

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Title</label>
          <input {...register('title', { required: true })} className="input" placeholder="Quotation title" />
        </div>
        <div>
          <label className="label">Client</label>
          <select {...register('contactId', { required: true })} className="input">
            <option value="">Select client</option>
            {contacts.map((c) => <option key={c.id} value={c.id}>{c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim()} {c.company ? `(${c.company})` : ''}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Expiry Date</label>
          <input {...register('expiryDate', { required: true })} type="date" className="input" />
        </div>
        <div>
          <label className="label">GST Type</label>
          <select {...register('gstType')} className="input">
            <option value="CGST_SGST">CGST + SGST</option>
            <option value="IGST">IGST</option>
            <option value="EXEMPT">Exempt</option>
          </select>
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-slate-300">Line Items</label>
          <button type="button" onClick={() => append(defaultItem)} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
            <Plus size={12} /> Add Item
          </button>
        </div>
        <div className="space-y-2">
          {fields.map((field, i) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 items-center bg-dark-900 p-3 rounded-xl">
              <input {...register(`items.${i}.description`, { required: true })} placeholder="Description" className="input col-span-4 text-xs" />
              <input {...register(`items.${i}.quantity`)} type="number" placeholder="Qty" className="input col-span-1 text-xs" />
              <input {...register(`items.${i}.unitPrice`)} type="number" placeholder="Price" className="input col-span-2 text-xs" />
              <input {...register(`items.${i}.discountPct`)} type="number" placeholder="Disc%" className="input col-span-2 text-xs" />
              <input {...register(`items.${i}.taxRate`)} type="number" placeholder="Tax%" className="input col-span-2 text-xs" />
              <button type="button" onClick={() => remove(i)} className="col-span-1 text-red-400 hover:text-red-300 flex justify-center">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-dark-900 rounded-xl p-4 space-y-1.5 text-sm">
        <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
        <div className="flex justify-between text-slate-400"><span>Discount</span><span>- {fmt(discountAmount)}</span></div>
        <div className="flex justify-between text-slate-400"><span>Tax</span><span>{fmt(taxAmount)}</span></div>
        <div className="flex justify-between font-bold text-white border-t border-white/10 pt-1.5"><span>Grand Total</span><span>{fmt(grand)}</span></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Notes</label>
          <textarea {...register('notes')} className="input h-20 resize-none" placeholder="Notes..." />
        </div>
        <div>
          <label className="label">Terms</label>
          <textarea {...register('terms')} className="input h-20 resize-none" placeholder="Terms & conditions..." />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? <LoadingSpinner size="sm" /> : (editing ? 'Update' : 'Create Quotation')}
        </button>
      </div>
    </form>
  );
}

export default function Quotations() {
  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'view'
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['quotations', search, statusFilter],
    queryFn: () => fetchQuotations({ search, status: statusFilter || undefined, limit: 50 }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuotation,
    onSuccess: () => { qc.invalidateQueries(['quotations']); toast.success('Deleted'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const convertMutation = useMutation({
    mutationFn: ({ id, dueDate }) => convertQuotation(id, { dueDate }),
    onSuccess: () => { qc.invalidateQueries(['quotations']); toast.success('Converted to invoice!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Cannot convert'),
  });

  const quotations = data?.data || [];

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        title="Quotations"
        subtitle={`${data?.pagination?.total || 0} quotations`}
        actions={
          <button onClick={() => setModal('create')} className="btn-primary">
            <Plus size={16} /> New Quotation
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quotations..."
            className="input pl-9"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-40">
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Quotation #</th>
                  <th>Title</th>
                  <th>Client</th>
                  <th>Issue Date</th>
                  <th>Expiry</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-slate-500">No quotations found</td></tr>
                ) : quotations.map((q) => (
                  <tr key={q.id}>
                    <td className="font-mono text-xs text-primary-400">{q.quotationNumber}</td>
                    <td className="font-medium">{q.title}</td>
                    <td>{q.contact?.name || `${q.contact?.firstName || ''} ${q.contact?.lastName || ''}`.trim() || '—'}</td>
                    <td className="text-slate-400">{new Date(q.issueDate).toLocaleDateString('en-IN')}</td>
                    <td className="text-slate-400">{new Date(q.expiryDate).toLocaleDateString('en-IN')}</td>
                    <td className="font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(q.grandTotal)}</td>
                    <td><StatusBadge status={q.status} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setSelected(q); setModal('edit'); }}
                          className="p-1.5 hover:bg-white/[0.06] rounded-lg text-slate-400 hover:text-slate-200"
                          title="Edit"
                        >
                          <Edit size={13} />
                        </button>
                        {q.status === 'ACCEPTED' && !q.convertedToInvoice && (
                          <button
                            onClick={() => convertMutation.mutate({ id: q.id, dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] })}
                            className="p-1.5 hover:bg-blue-500/10 rounded-lg text-blue-400"
                            title="Convert to Invoice"
                          >
                            <ArrowRight size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => { if (window.confirm('Delete this quotation?')) deleteMutation.mutate(q.id); }}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="New Quotation" size="xl">
        <QuotationForm onClose={() => setModal(null)} />
      </Modal>
      <Modal isOpen={modal === 'edit'} onClose={() => { setModal(null); setSelected(null); }} title="Edit Quotation" size="xl">
        {selected && <QuotationForm onClose={() => { setModal(null); setSelected(null); }} editing={selected} />}
      </Modal>
    </div>
  );
}
