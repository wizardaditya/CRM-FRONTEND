import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import {
  format, parse, startOfWeek, getDay,
  startOfMonth, endOfMonth, addMonths, subMonths,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Phone, Mail, MessageCircle, Globe, MapPin, User, X } from 'lucide-react';
import followupService from '@/services/followupService';
import { useThemeStore } from '@/store/themeStore';
import { formatDateTime } from '@/utils';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const TYPE_COLORS = {
  CALL:      { bg: '#3B82F6', text: '#fff' },
  EMAIL:     { bg: '#8B5CF6', text: '#fff' },
  WHATSAPP:  { bg: '#22C55E', text: '#fff' },
  MEETING:   { bg: '#F59E0B', text: '#fff' },
  DEMO:      { bg: '#EC4899', text: '#fff' },
  VISIT:     { bg: '#14B8A6', text: '#fff' },
};

const TYPE_ICONS = {
  CALL: Phone, EMAIL: Mail, WHATSAPP: MessageCircle,
  MEETING: User, DEMO: Globe, VISIT: MapPin,
};

const EventDetailModal = ({ event, onClose }) => {
  if (!event) return null;
  const fu = event.resource;
  const Icon = TYPE_ICONS[fu?.type] || Phone;
  const color = TYPE_COLORS[fu?.type] || { bg: '#3B82F6', text: '#fff' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-700 p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
        >
          <X size={16} />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color.bg }}>
            <Icon size={18} style={{ color: color.text }} />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">{fu?.type}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{fu?.lead?.organization}</p>
          </div>
        </div>
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <p><span className="font-semibold text-slate-500">Time:</span> {formatDateTime(fu?.scheduledAt)}</p>
          <p><span className="font-semibold text-slate-500">Status:</span> {fu?.status}</p>
          {fu?.notes && <p><span className="font-semibold text-slate-500">Notes:</span> {fu.notes}</p>}
        </div>
      </div>
    </div>
  );
};

export const CalendarPage = () => {
  const { isDark } = useThemeStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const rangeStart = startOfMonth(subMonths(currentDate, 1));
  const rangeEnd   = endOfMonth(addMonths(currentDate, 1));

  const { data: followups = [], isLoading } = useQuery({
    queryKey: ['calendar', rangeStart.toISOString(), rangeEnd.toISOString()],
    queryFn: () =>
      followupService
        .getCalendar({ start: rangeStart.toISOString(), end: rangeEnd.toISOString() })
        .then((r) => r.data.data),
  });

  const events = followups.map((fu) => {
    const color = TYPE_COLORS[fu.type] || { bg: '#3B82F6', text: '#fff' };
    return {
      id: fu.id,
      title: `${fu.type}: ${fu.lead?.organization || 'Unknown'}`,
      start: new Date(fu.scheduledAt),
      end: new Date(fu.scheduledAt),
      allDay: false,
      resource: fu,
      color: color.bg,
    };
  });

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.color,
      borderRadius: '6px',
      border: 'none',
      color: '#fff',
      fontSize: '11px',
      fontWeight: 600,
      padding: '1px 6px',
    },
  });

  const handleNavigate = useCallback((date) => setCurrentDate(date), []);
  const handleViewChange = useCallback((v) => setView(v), []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Calendar</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">View all follow-ups and meetings.</p>
      </div>

      {/* Type legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(TYPE_COLORS).map(([type, { bg }]) => (
          <span key={type} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: bg }} />
            {type}
          </span>
        ))}
      </div>

      <div
        className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        style={{ height: '640px' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            view={view}
            date={currentDate}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => setSelectedEvent(event)}
            style={{ height: '100%', padding: '12px' }}
          />
        )}
      </div>

      {selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
};
