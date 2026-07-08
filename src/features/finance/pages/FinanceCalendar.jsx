import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enIN } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import PageHeader from '../../../components/ui/PageHeader';

const locales = { 'en-IN': enIN };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// Sample static finance events — replace with API data
const SAMPLE_EVENTS = [
  { title: '📊 GST Filing Due', start: new Date(2026, 6, 20), end: new Date(2026, 6, 20), type: 'gst' },
  { title: '💰 Salary Disbursement', start: new Date(2026, 6, 31), end: new Date(2026, 6, 31), type: 'salary' },
  { title: '🏦 Vendor Payment - ABC Ltd', start: new Date(2026, 6, 15), end: new Date(2026, 6, 15), type: 'vendor' },
  { title: '📄 Invoice INV-2026-0012 Due', start: new Date(2026, 6, 18), end: new Date(2026, 6, 18), type: 'invoice' },
];

const EVENT_COLORS = { gst: '#f59e0b', salary: '#8b5cf6', vendor: '#06b6d4', invoice: '#ef4444', default: '#3b82f6' };

export default function FinanceCalendar() {
  const [events] = useState(SAMPLE_EVENTS);

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: EVENT_COLORS[event.type] || EVENT_COLORS.default,
      borderRadius: '8px',
      border: 'none',
      fontSize: '12px',
      padding: '2px 6px',
    },
  });

  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Finance Calendar" subtitle="Track all financial deadlines and schedules" />

      <div className="flex gap-3 flex-wrap">
        {[
          { color: EVENT_COLORS.gst, label: 'GST Filing' },
          { color: EVENT_COLORS.salary, label: 'Salary' },
          { color: EVENT_COLORS.vendor, label: 'Vendor Payments' },
          { color: EVENT_COLORS.invoice, label: 'Invoice Due' },
          { color: EVENT_COLORS.default, label: 'Other' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-400">
            <div className="w-3 h-3 rounded-sm" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>

      <div className="card p-4 finance-calendar">
        <style>{`
          .finance-calendar .rbc-calendar { color: #cbd5e1; }
          .finance-calendar .rbc-toolbar { margin-bottom: 16px; }
          .finance-calendar .rbc-toolbar button { color: #94a3b8; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 6px 12px; font-size: 13px; }
          .finance-calendar .rbc-toolbar button:hover { background: #334155; color: #f1f5f9; }
          .finance-calendar .rbc-toolbar button.rbc-active { background: #2563eb; color: #fff; border-color: #2563eb; }
          .finance-calendar .rbc-header { color: #64748b; font-size: 12px; border-bottom: 1px solid #1e293b; padding: 8px; }
          .finance-calendar .rbc-month-view { border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; }
          .finance-calendar .rbc-day-bg { border-left: 1px solid #1e293b; }
          .finance-calendar .rbc-row { border-bottom: 1px solid #1e293b; }
          .finance-calendar .rbc-off-range-bg { background: #0f172a; }
          .finance-calendar .rbc-today { background: #1d2d44; }
          .finance-calendar .rbc-date-cell { padding: 4px 8px; font-size: 12px; color: #94a3b8; }
          .finance-calendar .rbc-date-cell.rbc-now { color: #3b82f6; font-weight: bold; }
        `}</style>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 580 }}
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day']}
          defaultView="month"
        />
      </div>
    </div>
  );
}
