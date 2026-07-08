import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/ui/PageHeader';
import Modal from '../../../components/ui/Modal';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { fetchPayrolls, createPayroll, markPayrollPaid, deletePayroll, fetchEmployees } from '../api/financeApi';

const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function PayrollForm({ onClose }) {
  const qc = useQueryClient();
  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: fetchEmployees });
  const now = new Date();

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      employeeId: '', month: now.getMonth() + 1, year: now.getFullYear(),
      basicSalary: 0, hra: 0, allowances: 0, commission: 0, bonus: 0,
      pf: 0, esi: 0, tds: 0, otherDeductions: 0, notes: '',
    },
  });

  const vals = watch();
  const gross = (parseFloat(vals.basicSalary) || 0) + (parseFloat(vals.hra) || 0) + (parseFloat(vals.allowances) || 0) + (parseFloat(vals.commission) || 0) + (parseFloat(vals.bonus) || 0);
  const deductions = (parseFloat(vals.pf) || 0) + (parseFloat(vals.esi) || 0) + (parseFloat(vals.tds) || 0) + (parseFloat(vals.otherDeductions) || 0);
  const net = gross - deductions;

  const mutation = useMutation({
    mutationFn: (data) => createPayroll({
      ...data,
      basicSalary: parseFloat(data.basicSalary),
      hra: parseFloat(data.hra) || 0,
      allowances: parseFloat(data.allowances) || 0,
      commission: parseFloat(data.commission) || 0,
      bonus: parseFloat(data.bonus) || 0,
      pf: parseFloat(data.pf) || 0,
      esi: parseFloat(data.esi) || 0,
      tds: parseFloat(data.tds) || 0,
      otherDeductions: parseFloat(data.otherDeductions) || 0,
      month: parseInt(data.month),
      year: parseInt(data.year),
    }),
    onSuccess: () => { qc.invalidateQueries(['payrolls']); toast.success('Payroll created'); onClose(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-3">
          <label className="label">Employee *</label>
          <select {...register('employeeId', { required: true })} className="input">
            <option value="">Select employee</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.role})</option>)}
          </select>
        </div>
        <div>
          <label className="label">Month</label>
          <select {...register('month')} className="input">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div><label className="label">Year</label><input {...register('year')} type="number" className="input" /></div>
        <div><label className="label">Basic Salary</label><input {...register('basicSalary')} type="number" step="0.01" className="input" /></div>
        <div><label className="label">HRA</label><input {...register('hra')} type="number" step="0.01" className="input" /></div>
        <div><label className="label">Allowances</label><input {...register('allowances')} type="number" step="0.01" className="input" /></div>
        <div><label className="label">Commission</label><input {...register('commission')} type="number" step="0.01" className="input" /></div>
        <div><label className="label">Bonus</label><input {...register('bonus')} type="number" step="0.01" className="input" /></div>
        <div><label className="label">PF</label><input {...register('pf')} type="number" step="0.01" className="input" /></div>
        <div><label className="label">ESI</label><input {...register('esi')} type="number" step="0.01" className="input" /></div>
        <div><label className="label">TDS</label><input {...register('tds')} type="number" step="0.01" className="input" /></div>
        <div><label className="label">Other Deductions</label><input {...register('otherDeductions')} type="number" step="0.01" className="input" /></div>
      </div>

      <div className="bg-dark-900 rounded-xl p-4 space-y-1.5 text-sm">
        <div className="flex justify-between text-slate-400"><span>Gross Salary</span><span>{fmt(gross)}</span></div>
        <div className="flex justify-between text-slate-400"><span>Total Deductions</span><span>- {fmt(deductions)}</span></div>
        <div className="flex justify-between font-bold text-white border-t border-white/10 pt-1.5"><span>Net Salary</span><span className="text-emerald-400">{fmt(net)}</span></div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? <LoadingSpinner size="sm" /> : 'Create Payroll'}
        </button>
      </div>
    </form>
  );
}

export default function Payroll() {
  const [modal, setModal] = useState(false);
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['payrolls', monthFilter, yearFilter],
    queryFn: () => fetchPayrolls({ month: monthFilter || undefined, year: yearFilter, limit: 100 }),
  });

  const markPaidMutation = useMutation({
    mutationFn: markPayrollPaid,
    onSuccess: () => { qc.invalidateQueries(['payrolls']); toast.success('Marked as paid'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePayroll,
    onSuccess: () => { qc.invalidateQueries(['payrolls']); toast.success('Deleted'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const payrolls = data?.data || [];

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        title="Payroll"
        subtitle={`${data?.pagination?.total || 0} records`}
        actions={
          <button onClick={() => setModal(true)} className="btn-primary">
            <Plus size={16} /> Add Payroll
          </button>
        }
      />

      <div className="flex gap-3">
        <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="input w-36">
          <option value="">All Months</option>
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <input value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} type="number" placeholder="Year" className="input w-28" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Month/Year</th>
                  <th>Gross</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-500">No payroll records</td></tr>
                ) : payrolls.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div>
                        <p className="font-medium">{p.employee?.name}</p>
                        <p className="text-xs text-slate-500">{p.employee?.role}</p>
                      </div>
                    </td>
                    <td>{MONTHS[p.month - 1]} {p.year}</td>
                    <td>{fmt(p.grossSalary)}</td>
                    <td className="text-red-400">- {fmt(p.totalDeductions)}</td>
                    <td className="font-bold text-emerald-400">{fmt(p.netSalary)}</td>
                    <td>
                      {p.isPaid ? (
                        <span className="badge badge-green">Paid</span>
                      ) : (
                        <span className="badge badge-yellow">Pending</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        {!p.isPaid && (
                          <button onClick={() => markPaidMutation.mutate(p.id)} className="p-1.5 hover:bg-emerald-500/10 rounded-lg text-slate-400 hover:text-emerald-400" title="Mark Paid">
                            <CheckCircle size={13} />
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

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Create Payroll" size="lg">
        <PayrollForm onClose={() => setModal(false)} />
      </Modal>
    </div>
  );
}
