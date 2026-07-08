import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/ui/PageHeader';
import Modal from '../../../components/ui/Modal';
import StatusBadge from '../../../components/ui/StatusBadge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { fetchPurchaseOrders, createPurchaseOrder, deletePurchaseOrder, fetchVendors } from '../api/financeApi';

const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);
const defaultItem = { description: '', quantity: 1, unitPrice: 0, taxRate: 18 };
const STATUSES = ['DRAFT', 'SENT', 'APPROVED', 'DELIVERED', 'CANCELLED'];

function POForm({ onClose }) {
  const qc = useQueryClient();
  const { data: vendorsRes } = useQuery({ queryKey: ['vendors-list'], queryFn: () => fetchVendors({ limit: 100 }) });
  const vendors = vendorsRes?.data || [];

  const { register, control, handleSubmit, watch } = useForm({
    defaultValues: { vendorId: '', expectedDelivery: '', notes: '', items: [defaultItem] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = watch('items');

  const subtotal = items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0), 0);
  const taxAmount = items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0) * ((parseFloat(i.taxRate) || 0) / 100), 0);

  const mutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      fd.append('vendorId', data.vendorId);
      fd.append('expectedDelivery', data.expectedDelivery);
      fd.append('notes', data.notes || '');
      fd.append('items', JSON.stringify(data.items));
      if (data.invoice?.[0]) fd.append('invoice', data.invoice[0]);
      return createPurchaseOrder(fd);
    },
    onSuccess: () => { qc.invalidateQueries(['purchase-orders']); toast.success('Purchase order created'); onClose(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Vendor *</label>
          <select {...register('vendorId', { required: true })} className="input">
            <option value="">Select vendor</option>
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.name} {v.company ? `(${v.company})` : ''}</option>)}
          </select>
        </div>
        <div><label className="label">Expected Delivery</label><input {...register('expectedDelivery')} type="date" className="input" /></div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-slate-300">Items</label>
          <button type="button" onClick={() => append(defaultItem)} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"><Plus size={12} /> Add</button>
        </div>
        <div className="space-y-2">
          {fields.map((f, i) => (
            <div key={f.id} className="grid grid-cols-12 gap-2 items-center bg-dark-900 p-3 rounded-xl">
              <input {...register(`items.${i}.description`, { required: true })} placeholder="Description" className="input col-span-5 text-xs" />
              <input {...register(`items.${i}.quantity`)} type="number" placeholder="Qty" className="input col-span-2 text-xs" />
              <input {...register(`items.${i}.unitPrice`)} type="number" placeholder="Price" className="input col-span-2 text-xs" />
              <input {...register(`items.${i}.taxRate`)} type="number" placeholder="Tax%" className="input col-span-2 text-xs" />
              <button type="button" onClick={() => remove(i)} className="col-span-1 text-red-400 hover:text-red-300 flex justify-center"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-dark-900 rounded-xl p-4 space-y-1.5 text-sm">
        <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
        <div className="flex justify-between text-slate-400"><span>Tax</span><span>{fmt(taxAmount)}</span></div>
        <div className="flex justify-between font-bold text-white border-t border-white/10 pt-1.5"><span>Grand Total</span><span>{fmt(subtotal + taxAmount)}</span></div>
      </div>

      <div><label className="label">Invoice Attachment</label><input {...register('invoice')} type="file" accept="image/*,.pdf" className="input py-2" /></div>
      <div><label className="label">Notes</label><textarea {...register('notes')} className="input h-16 resize-none" /></div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? <LoadingSpinner size="sm" /> : 'Create PO'}
        </button>
      </div>
    </form>
  );
}

export default function PurchaseOrders() {
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders', search, statusFilter],
    queryFn: () => fetchPurchaseOrders({ search, status: statusFilter || undefined, limit: 50 }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePurchaseOrder,
    onSuccess: () => { qc.invalidateQueries(['purchase-orders']); toast.success('Deleted'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const pos = data?.data || [];

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        title="Purchase Orders"
        subtitle={`${data?.pagination?.total || 0} orders`}
        actions={<button onClick={() => setModal(true)} className="btn-primary"><Plus size={16} /> New PO</button>}
      />
      <div className="flex gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="input pl-9" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-40">
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>PO #</th><th>Vendor</th><th>Issue Date</th><th>Delivery</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {pos.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-500">No purchase orders</td></tr>
                ) : pos.map((po) => (
                  <tr key={po.id}>
                    <td className="font-mono text-xs text-primary-400">{po.poNumber}</td>
                    <td>{po.vendor?.name}</td>
                    <td className="text-slate-400">{new Date(po.issueDate).toLocaleDateString('en-IN')}</td>
                    <td className="text-slate-400">{po.expectedDelivery ? new Date(po.expectedDelivery).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="font-semibold">{fmt(po.grandTotal)}</td>
                    <td><StatusBadge status={po.status} /></td>
                    <td>
                      <button onClick={() => { if (window.confirm('Delete?')) deleteMutation.mutate(po.id); }} className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400"><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title="New Purchase Order" size="xl">
        <POForm onClose={() => setModal(false)} />
      </Modal>
    </div>
  );
}
