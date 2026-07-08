import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, Edit, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/ui/PageHeader';
import Modal from '../../../components/ui/Modal';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { fetchVendors, createVendor, updateVendor, deleteVendor } from '../api/financeApi';

function VendorForm({ onClose, editing }) {
  const qc = useQueryClient();
  const { register, handleSubmit } = useForm({
    defaultValues: editing || {
      name: '', email: '', phone: '', company: '', address: '',
      city: '', state: '', country: 'India', pincode: '',
      gstin: '', pan: '', bankName: '', bankAccount: '', bankIfsc: '', notes: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => editing ? updateVendor(editing.id, data) : createVendor(data),
    onSuccess: () => { qc.invalidateQueries(['vendors']); toast.success(editing ? 'Vendor updated' : 'Vendor created'); onClose(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Name *</label><input {...register('name', { required: true })} className="input" /></div>
        <div><label className="label">Company</label><input {...register('company')} className="input" /></div>
        <div><label className="label">Email</label><input {...register('email')} type="email" className="input" /></div>
        <div><label className="label">Phone</label><input {...register('phone')} className="input" /></div>
        <div className="col-span-2"><label className="label">Address</label><input {...register('address')} className="input" /></div>
        <div><label className="label">City</label><input {...register('city')} className="input" /></div>
        <div><label className="label">State</label><input {...register('state')} className="input" /></div>
        <div><label className="label">GSTIN</label><input {...register('gstin')} className="input" placeholder="22AAAAA0000A1Z5" /></div>
        <div><label className="label">PAN</label><input {...register('pan')} className="input" /></div>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Bank Details</p>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="label">Bank Name</label><input {...register('bankName')} className="input" /></div>
          <div><label className="label">Account No.</label><input {...register('bankAccount')} className="input" /></div>
          <div><label className="label">IFSC</label><input {...register('bankIfsc')} className="input" /></div>
        </div>
      </div>
      <div><label className="label">Notes</label><textarea {...register('notes')} className="input h-16 resize-none" /></div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? <LoadingSpinner size="sm" /> : (editing ? 'Update' : 'Create Vendor')}
        </button>
      </div>
    </form>
  );
}

export default function Vendors() {
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['vendors', search],
    queryFn: () => fetchVendors({ search, limit: 50 }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => { qc.invalidateQueries(['vendors']); toast.success('Deleted'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const vendors = data?.data || [];

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        title="Vendors"
        subtitle={`${data?.pagination?.total || 0} vendors`}
        actions={
          <button onClick={() => setModal('create')} className="btn-primary">
            <Plus size={16} /> Add Vendor
          </button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendors..." className="input pl-9" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Company</th><th>Email</th><th>Phone</th><th>GSTIN</th><th>POs</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {vendors.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-500">No vendors found</td></tr>
                ) : vendors.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary-600/20 flex items-center justify-center"><Building2 size={13} className="text-primary-400" /></div>
                        <span className="font-medium">{v.name}</span>
                      </div>
                    </td>
                    <td>{v.company || '—'}</td>
                    <td className="text-slate-400">{v.email || '—'}</td>
                    <td className="text-slate-400">{v.phone || '—'}</td>
                    <td className="font-mono text-xs">{v.gstin || '—'}</td>
                    <td><span className="badge badge-blue">{v._count?.purchaseOrders || 0}</span></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setSelected(v); setModal('edit'); }} className="p-1.5 hover:bg-white/[0.06] rounded-lg text-slate-400 hover:text-slate-200"><Edit size={13} /></button>
                        <button onClick={() => { if (window.confirm('Delete?')) deleteMutation.mutate(v.id); }} className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="Add Vendor" size="lg">
        <VendorForm onClose={() => setModal(null)} />
      </Modal>
      <Modal isOpen={modal === 'edit'} onClose={() => { setModal(null); setSelected(null); }} title="Edit Vendor" size="lg">
        {selected && <VendorForm onClose={() => { setModal(null); setSelected(null); }} editing={selected} />}
      </Modal>
    </div>
  );
}
