import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, RotateCcw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/ui/PageHeader';
import Modal from '../../../components/ui/Modal';
import StatusBadge from '../../../components/ui/StatusBadge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { fetchPayments, createPayment, refundPayment, deletePayment, fetchInvoices } from '../api/financeApi';

const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);
const MODES = ['CASH', 'UPI', 'CARD', 'NEFT', 'RTGS', 'CHEQUE'];

function PaymentForm({ onClose }) {
  const qc = useQueryClient();
  const { data: invoicesRes } = useQuery({ queryKey: ['invoices-list'], queryFn: () => fetchInvoices({ status: 'SENT', limit: 100 }) });
  const invoices = (invoicesRes?.data || []).filter((i) => i.balanceDue > 0);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { invoiceId: '', amount: '', paymentDate: new Date().toISOString().split('T')[0], paymentMode: 'CASH', reference: '', notes: '' },
  });

  const mutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => { qc.invalidateQueries(['payments']); qc.invalidateQueries(['invoices']); toast.success('Payment recorded'); onClose(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate({ ...d, amount: parseFloat(d.amount) }))} className="p-6 space-y-4">
      <div>
        <label className="label">Invoice *</label>
        <select {...register('invoiceId', { required: true })} className="input">
          <option value="">Select invoice</option>
          {invoices.map((i) => <option key={i.id} value={i.id}>{i.invoiceNumber} — {i.contact?.name} — Balance: {fmt(i.balanceDue)}</option>)}
        </select>
        {errors.invoiceId && <p className="text-xs text-red-400 mt-1">Invoice is required</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Amount *</label>
          <input {...register('amount', { required: true, min: 0.01 })} type="number" step="0.01" className="input" placeholder="0.00" />
        </div>
        <div>
          <label className="label">Payment Date</label>
          <input {...register('paymentDate')} type="date" className="input" />
        </div>
        <div>
          <label className="label">Payment Mode</label>
          <select {...register('paymentMode')} className="input">
            {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Reference / Transaction ID</label>
          <input {...register('reference')} className="input" placeholder="Ref no..." />
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea {...register('notes')} className="input h-16 resize-none" placeholder="Notes..." />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? <LoadingSpinner size="sm" /> : 'Record Payment'}
        </button>
      </div>
    </form>
  );
}

export default function Payments() {
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['payments', search, modeFilter],
    queryFn: () => fetchPayments({ search, paymentMode: modeFilter || undefined, limit: 50 }),
  });

  const refundMutation = useMutation({
    mutationFn: refundPayment,
    onSuccess: () => { qc.invalidateQueries(['payments']); toast.success('Refunded'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePayment,
    onSuccess: () => { qc.invalidateQueries(['payments']); toast.success('Deleted'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const payments = data?.data || [];

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        title="Payments"
        subtitle={`${data?.pagination?.total || 0} payments`}
        actions={
          <button onClick={() => setModal(true)} className="btn-primary">
            <Plus size={16} /> Record Payment
          </button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search payments..." className="input pl-9" />
        </div>
        <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)} className="input w-40">
          <option value="">All Modes</option>
          {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
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
                  <th>Payment #</th>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Mode</th>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-slate-500">No payments recorded</td></tr>
                ) : payments.map((p) => (
                  <tr key={p.id}>
                    <td className="font-mono text-xs text-primary-400">{p.paymentNumber}</td>
                    <td className="font-mono text-xs">{p.invoice?.invoiceNumber}</td>
                    <td>{p.invoice?.contact ? `${p.invoice.contact.firstName || ''} ${p.invoice.contact.lastName || ''}`.trim() : '—'}</td>
                    <td><span className="badge badge-blue">{p.paymentMode}</span></td>
                    <td className="text-slate-400 text-xs">{p.reference || '—'}</td>
                    <td className="text-slate-400">{new Date(p.paymentDate).toLocaleDateString('en-IN')}</td>
                    <td className="font-semibold text-emerald-400">{fmt(p.amount)}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        {p.status === 'PAID' && (
                          <button onClick={() => { if (window.confirm('Refund this payment?')) refundMutation.mutate(p.id); }} className="p-1.5 hover:bg-orange-500/10 rounded-lg text-slate-400 hover:text-orange-400" title="Refund">
                            <RotateCcw size={13} />
                          </button>
                        )}
                        <button onClick={() => { if (window.confirm('Delete?')) deleteMutation.mutate(p.id); }} className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400" title="Delete">
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

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Record Payment" size="md">
        <PaymentForm onClose={() => setModal(false)} />
      </Modal>
    </div>
  );
}
