import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, CreditCard,
  AlertCircle, Clock, FileText, Users, Wallet,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { fetchDashboard } from '../api/financeApi';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import PageHeader from '../../../components/ui/PageHeader';

const fmt = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

const COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];

const KPICard = ({ title, value, icon: Icon, color, trend, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="card group hover:border-white/[0.12] transition-all duration-300"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {trend !== undefined && (
          <p className={`text-xs mt-1.5 flex items-center gap-1 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}% vs last month
          </p>
        )}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
  </motion.div>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-800 border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function CFODashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['cfo-dashboard'],
    queryFn: fetchDashboard,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (error) return (
    <div className="p-6 text-red-400">Failed to load dashboard: {error.message}</div>
  );

  const { kpis = {}, charts = {}, recentActivity = [] } = data || {};

  const kpiCards = [
    { title: 'Total Revenue (YTD)',   value: fmt(kpis.totalRevenue),     icon: DollarSign,  color: 'bg-blue-600' },
    { title: 'Monthly Revenue',       value: fmt(kpis.monthlyRevenue),   icon: TrendingUp,  color: 'bg-emerald-600' },
    { title: 'Total Expenses (YTD)',  value: fmt(kpis.totalExpenses),    icon: TrendingDown, color: 'bg-red-600' },
    { title: 'Net Profit',            value: fmt(kpis.profit),           icon: Wallet,      color: kpis.profit >= 0 ? 'bg-emerald-600' : 'bg-red-600' },
    { title: 'Pending Payments',      value: fmt(kpis.pendingPayments),  icon: Clock,       color: 'bg-yellow-600' },
    { title: 'Overdue Invoices',      value: `${kpis.overdueCount || 0} (${fmt(kpis.overdueAmount)})`, icon: AlertCircle, color: 'bg-red-600' },
    { title: 'Outstanding Invoices',  value: fmt(kpis.outstandingInvoices), icon: FileText, color: 'bg-orange-600' },
    { title: 'Payroll Due',           value: fmt(kpis.payrollDue),       icon: Users,       color: 'bg-violet-600' },
    { title: 'Cash Balance',          value: fmt(kpis.cashBalance),      icon: CreditCard,  color: 'bg-cyan-600' },
  ];

  const monthlyData = (charts.monthlyRevenue || []).map((r, i) => ({
    month: r.month,
    Revenue: parseFloat(r.revenue) || 0,
    Expenses: parseFloat((charts.monthlyExpenses || [])[i]?.expenses) || 0,
  }));

  const clientData = (charts.revenueByClient || []).map((r) => ({
    name: r.client,
    value: parseFloat(r.revenue) || 0,
  }));

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Finance Dashboard"
        subtitle="Real-time financial overview"
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((card, i) => (
          <KPICard key={card.title} {...card} index={i} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expense Chart */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Revenue vs Expenses (6 months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="Revenue" stroke="#3b82f6" fill="url(#revGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Client */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Revenue by Client (Top 5)</h3>
          {clientData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={clientData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#475569', strokeWidth: 1 }}>
                  {clientData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-52 text-slate-500 text-sm">No revenue data yet</div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Recent Payments</h3>
        {recentActivity.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment #</th>
                  <th>Client</th>
                  <th>Invoice</th>
                  <th>Mode</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((p) => (
                  <tr key={p.id}>
                    <td className="font-mono text-xs text-primary-400">{p.paymentNumber}</td>
                    <td>{p.invoice?.contact?.name || '—'}</td>
                    <td className="font-mono text-xs">{p.invoice?.invoiceNumber || '—'}</td>
                    <td>{p.paymentMode}</td>
                    <td className="text-slate-400">{new Date(p.paymentDate).toLocaleDateString('en-IN')}</td>
                    <td className="font-semibold text-emerald-400">{fmt(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-8">No payments recorded yet</p>
        )}
      </div>
    </div>
  );
}
