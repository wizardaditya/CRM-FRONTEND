import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Save, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/ui/PageHeader';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { fetchSettings, saveSettings } from '../api/financeApi';

export default function FinanceSettings() {
  const qc = useQueryClient();
  const { data: settings, isLoading } = useQuery({ queryKey: ['finance-settings'], queryFn: fetchSettings });

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (k === 'logo' && v?.[0]) { fd.append('logo', v[0]); }
        else if (k === 'bankAccounts') { fd.append(k, JSON.stringify(v)); }
        else if (v !== undefined && v !== null) { fd.append(k, v); }
      });
      return saveSettings(fd);
    },
    onSuccess: () => { qc.invalidateQueries(['finance-settings']); toast.success('Settings saved'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error saving settings'),
  });

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <PageHeader title="Finance Settings" subtitle="Configure company, tax, and invoice settings" />

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
        {/* Company Details */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={16} className="text-primary-400" />
            <h3 className="text-sm font-semibold text-slate-200">Company Details</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Company Name</label><input {...register('companyName')} className="input" /></div>
            <div><label className="label">Phone</label><input {...register('companyPhone')} className="input" /></div>
            <div><label className="label">Email</label><input {...register('companyEmail')} type="email" className="input" /></div>
            <div><label className="label">Website</label><input {...register('companyWebsite')} className="input" /></div>
            <div className="col-span-2"><label className="label">Address</label><textarea {...register('companyAddress')} className="input h-16 resize-none" /></div>
            <div><label className="label">GSTIN</label><input {...register('gstin')} className="input" placeholder="22AAAAA0000A1Z5" /></div>
            <div><label className="label">PAN</label><input {...register('pan')} className="input" /></div>
            <div><label className="label">Company Logo</label><input {...register('logo')} type="file" accept="image/*" className="input py-2" /></div>
          </div>
        </div>

        {/* Invoice Settings */}
        <div className="card space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Invoice & Prefix Settings</h3>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Invoice Prefix</label><input {...register('invoicePrefix')} className="input" placeholder="INV" /></div>
            <div><label className="label">Quotation Prefix</label><input {...register('quotationPrefix')} className="input" placeholder="QT" /></div>
            <div><label className="label">PO Prefix</label><input {...register('purchaseOrderPrefix')} className="input" placeholder="PO" /></div>
            <div><label className="label">Currency</label><input {...register('currency')} className="input" placeholder="INR" /></div>
            <div><label className="label">Currency Symbol</label><input {...register('currencySymbol')} className="input" placeholder="₹" /></div>
            <div>
              <label className="label">Financial Year Start (Month)</label>
              <select {...register('financialYearStart')} className="input">
                {['01','02','03','04','05','06','07','08','09','10','11','12'].map((m, i) => (
                  <option key={m} value={m}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tax Settings */}
        <div className="card space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Tax / GST Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Default GST Type</label>
              <select {...register('gstType')} className="input">
                <option value="CGST_SGST">CGST + SGST</option>
                <option value="IGST">IGST</option>
                <option value="EXEMPT">Exempt</option>
              </select>
            </div>
            <div><label className="label">Default Tax Rate (%)</label><input {...register('defaultTaxRate')} type="number" step="0.01" className="input" /></div>
            <div><label className="label">CGST Rate (%)</label><input {...register('cgstRate')} type="number" step="0.01" className="input" /></div>
            <div><label className="label">SGST Rate (%)</label><input {...register('sgstRate')} type="number" step="0.01" className="input" /></div>
            <div><label className="label">IGST Rate (%)</label><input {...register('igstRate')} type="number" step="0.01" className="input" /></div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={mutation.isPending} className="btn-primary px-6">
            {mutation.isPending ? <LoadingSpinner size="sm" /> : <><Save size={16} /> Save Settings</>}
          </button>
        </div>
      </form>
    </div>
  );
}
