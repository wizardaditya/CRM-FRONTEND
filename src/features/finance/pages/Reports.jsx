import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart2, TrendingUp, TrendingDown, FileText, DollarSign, Users, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import PageHeader from '../../../components/ui/PageHeader';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { fetchProfitLoss, fetchCashFlow, fetchOutstanding, fetchRevenueReport, fetchExpenseReport } from '../api/financeApi';

const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

const TAB_LIST = [
  { id: 'pl', label: 'P&L', icon: BarChart2 },
  { id: 'cashflow', label: 'Cash Flow', icon: TrendingUp },
  { id: 'outstanding', label: 'Outstanding', icon: AlertTriangle },
  { id: 'revenue', label: 'Revenue', icon: DollarSign },
  { id: 'expenses', label: 'Expenses', icon: TrendingDown },
];

function DateFilter({ from, to, setFrom, setTo }) {
  return (
    <div className="flex gap-3 items-center">
      <div>
        <label className="label text-xs">From</label>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input text-sm" />
      </div>
      <div>
        <label className="label text-xs">To</label>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input text-sm" />
      </div>
    </div>
  );
}

function ProfitLossTab({ from, to }) {
  const { data, isLoading } = useQuery({ queryKey: ['pl', from, to], queryFn: () => fetchProfitLoss({ from, to }) });
  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;

  const chartData = [
    { name: 'Revenue', value: data?.revenue || 0, fill: '#22c55e' },
    { name: 'Expenses', value: data?.expenses || 0, fill: '#ef4444' },
    { name: 'Profit', value: data?.profit || 0, fill: data?.profit >= 0 ? '#3b82f6' : '#f97316' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-xs text-slate-400 mb-1">Revenue</p>
          <p className="text-2xl font-bold text-emerald-400">{fmt(data?.revenue)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-400 mb-1">Expenses</p>
          <p className="text-2xl font-bold text-red-400">{fmt(data?.expenses)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-400 mb-1">Net Profit</p>
          <p className={`text-2xl font-bold ${data?.profit >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>{fmt(data?.profit)}</p>
          <p className="text-xs text-slate-500 mt-1">Margin: {data?.profitMargin}%</p>
        </div>
      </div>
      <div className="card">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CashFlowTab({ from, to }) {
  const { data, isLoading } = useQuery({ queryKey: ['cashflow', from, to], queryFn: () => fetchCashFlow({ from, to }) });
  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-xs text-slate-400 mb-1">Total Inflow</p>
          <p className="text-2xl font-bold text-emerald-400">{fmt(data?.totalInflow)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-400 mb-1">Total Outflow</p>
          <p className="text-2xl font-bold text-red-400">{fmt(data?.totalOutflow)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-400 mb-1">Net Cash Flow</p>
          <p className={`text-2xl font-bold ${data?.netCashFlow >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>{fmt(data?.netCashFlow)}</p>
        </div>
      </div>
    </div>
  );
}

function OutstandingTab() {
  const { data, isLoading } = useQuery({ queryKey: ['outstanding'], queryFn: fetchOutstanding });
  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <p className="text-xs text-slate-400 mb-1">Total Outstanding</p>
          <p className="text-2xl font-bold text-yellow-400">{fmt(data?.total)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-400 mb-1">Overdue Amount</p>
          <p className="text-2xl font-bold text-red-400">{fmt(data?.overdueTotal)}</p>
          <p className="text-xs text-slate-500 mt-1">{data?.overdueCount} invoices overdue</p>
        </div>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Invoice #</th><th>Client</th><th>Due Date</th><th>Balance Due</th><th>Status</th></tr></thead>
            <tbody>
              {(data?.invoices || []).map((inv) => (
                <tr key={inv.id}>
                  <td className="font-mono text-xs text-primary-400">{inv.invoiceNumber}</td>
                  <td>{inv.contact?.name}</td>
                  <td className={new Date(inv.dueDate) < new Date() ? 'text-red-400' : 'text-slate-400'}>
                    {new Date(inv.dueDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="font-semibold text-yellow-400">{fmt(inv.balanceDue)}</td>
                  <td><span className={`badge ${inv.status === 'OVERDUE' ? 'badge-red' : 'badge-yellow'}`}>{inv.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const [tab, setTab] = useState('pl');
  const now = new Date();
  const [from, setFrom] = useState(new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [to, setTo] = useState(now.toISOString().split('T')[0]);

  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Financial Reports" subtitle="Comprehensive financial analysis" />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex gap-1 bg-dark-800 p-1 rounded-xl border border-white/[0.06]">
          {TAB_LIST.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>
        {tab !== 'outstanding' && <DateFilter from={from} to={to} setFrom={setFrom} setTo={setTo} />}
      </div>

      <div>
        {tab === 'pl' && <ProfitLossTab from={from} to={to} />}
        {tab === 'cashflow' && <CashFlowTab from={from} to={to} />}
        {tab === 'outstanding' && <OutstandingTab />}
        {tab === 'revenue' && <div className="card"><p className="text-slate-400 text-sm">Revenue detail table — query: fetchRevenueReport</p></div>}
        {tab === 'expenses' && <div className="card"><p className="text-slate-400 text-sm">Expense detail table — query: fetchExpenseReport</p></div>}
      </div>
    </div>
  );
}
