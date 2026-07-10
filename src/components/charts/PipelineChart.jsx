import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { useThemeStore } from '@/store/themeStore';
import { LEAD_STATUS_LABELS } from '@/constants';
import { formatShortCurrency } from '@/utils';

const BAR_COLORS = [
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7',
  '#EC4899', '#F97316', '#F59E0B', '#22C55E', '#EF4444', '#14B8A6',
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-xl text-xs space-y-1">
      <p className="font-bold text-slate-700 dark:text-slate-200">
        {LEAD_STATUS_LABELS[label] || label}
      </p>
      <p className="text-slate-500 dark:text-slate-400">{d.count} leads</p>
      {d.value !== undefined && (
        <p className="text-green-600 dark:text-green-400 font-semibold">
          Value: {formatShortCurrency(d.value)}
        </p>
      )}
    </div>
  );
};

export const PipelineChart = ({ data = [] }) => {
  const { isDark } = useThemeStore();
  const gridColor = isDark ? '#232C42' : '#E2E8F0';
  const tickColor = isDark ? '#9AA6C0' : '#64748B';

  const chartData = data.map((d) => ({
    ...d,
    label: LEAD_STATUS_LABELS[d.status] || d.status,
  }));

  return (
    <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Pipeline Summary</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: tickColor }}
            tickLine={false}
            axisLine={{ stroke: gridColor }}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: tickColor }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
