import { useQuery } from '@tanstack/react-query';
import {
  Users, Phone, Clock, UserCheck, CheckCircle2,
  DollarSign, TrendingUp, CheckSquare, Calendar,
} from 'lucide-react';
import dashboardService from '@/services/dashboardService';
import { KpiCard } from '@/components/ui/KpiCard';
import { KpiSkeleton } from '@/components/ui/Skeleton';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { LeadSourceChart } from '@/components/charts/LeadSourceChart';
import { PipelineChart } from '@/components/charts/PipelineChart';
import { timeAgo, formatShortCurrency } from '@/utils';
import { Avatar } from '@/components/ui/Avatar';

const KPI_CONFIG = [
  { key: 'totalLeads',         label: 'Total Leads',         icon: Users,        color: 'blue' },
  { key: 'todayFollowups',     label: "Today's Follow-ups",  icon: Phone,        color: 'indigo' },
  { key: 'overdueFollowups',   label: 'Overdue Follow-ups',  icon: Clock,        color: 'red' },
  { key: 'totalContacts',      label: 'Total Contacts',      icon: UserCheck,    color: 'teal' },
  { key: 'confirmedClients',   label: 'Confirmed Clients',   icon: CheckCircle2, color: 'green' },
  { key: 'expectedRevenue',    label: 'Expected Revenue',    icon: DollarSign,   color: 'amber' },
  { key: 'closedRevenue',      label: 'Closed Revenue',      icon: TrendingUp,   color: 'purple' },
  { key: 'pendingTasks',       label: 'Pending Tasks',       icon: CheckSquare,  color: 'pink' },
  { key: 'upcomingMeetings',   label: 'Upcoming Meetings',   icon: Calendar,     color: 'blue' },
];

const formatKpiValue = (key, raw) => {
  if (key === 'expectedRevenue' || key === 'closedRevenue') return formatShortCurrency(raw);
  return raw ?? 0;
};

export const DashboardPage = () => {
  const { data: kpisData, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => dashboardService.getKpis().then((r) => r.data.data),
  });

  const { data: revenueData } = useQuery({
    queryKey: ['dashboard-revenue'],
    queryFn: () => dashboardService.getRevenueChart().then((r) => r.data.data),
  });

  const { data: sourcesData } = useQuery({
    queryKey: ['dashboard-sources'],
    queryFn: () => dashboardService.getLeadSources().then((r) => r.data.data),
  });

  const { data: pipelineData } = useQuery({
    queryKey: ['dashboard-pipeline'],
    queryFn: () => dashboardService.getPipelineSummary().then((r) => r.data.data),
  });

  const { data: activitiesData } = useQuery({
    queryKey: ['dashboard-activities'],
    queryFn: () => dashboardService.getRecentActivities().then((r) => r.data.data),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Welcome back — here's what's happening today.
        </p>
      </div>

      {/* KPI Cards */}
      {kpisLoading ? (
        <KpiSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {KPI_CONFIG.map(({ key, label, icon, color }) => (
            <KpiCard
              key={key}
              title={label}
              value={formatKpiValue(key, kpisData?.[key])}
              icon={icon}
              color={color}
            />
          ))}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RevenueChart data={revenueData ?? []} />
        <LeadSourceChart data={sourcesData ?? []} />
      </div>

      {/* Pipeline + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <PipelineChart data={pipelineData ?? []} />
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Recent Activity</h3>
          {!activitiesData?.length ? (
            <p className="text-xs text-slate-400 text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activitiesData.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <Avatar
                    name={activity.user ? activity.user.name : 'System'}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-snug">
                      {activity.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(activity.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
