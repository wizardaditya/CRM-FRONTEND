import { format, formatDistanceToNow, isToday, isPast } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'dd MMM yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'dd MMM yyyy, hh:mm a');
};

export const timeAgo = (date) => {
  if (!date) return '—';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatCurrency = (n) => {
  const num = Number(n) || 0;
  return new Intl.NumberFormat('en-IN', {
    style:    'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatShortCurrency = (n) => {
  const num = Number(n) || 0;
  if (num >= 1_00_00_000) return `₹${(num / 1_00_00_000).toFixed(1)}Cr`;
  if (num >= 1_00_000)    return `₹${(num / 1_00_000).toFixed(1)}L`;
  if (num >= 1_000)       return `₹${(num / 1_000).toFixed(0)}K`;
  return `₹${num}`;
};

export const isOverdue = (date) => date && isPast(new Date(date)) && !isToday(new Date(date));
export const isDueToday = (date) => date && isToday(new Date(date));

export const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

export const classNames = (...classes) => classes.filter(Boolean).join(' ');

export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const buildQueryString = (params) =>
  Object.entries(params)
    .filter(([, v]) => v !== '' && v !== null && v !== undefined)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
