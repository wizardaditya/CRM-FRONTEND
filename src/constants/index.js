export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'A5X CRM';

export const LEAD_STATUSES = [
  'NEW_LEAD', 'CONTACTED', 'IN_DISCUSSION', 'MEETING_SCHEDULED',
  'DEMO_SCHEDULED', 'DEMO_COMPLETED', 'PROPOSAL_SENT', 'NEGOTIATION',
  'WAITING_APPROVAL', 'CONFIRMED', 'LOST', 'FUTURE_OPPORTUNITY',
];

export const LEAD_STATUS_LABELS = {
  NEW_LEAD: 'New Lead', CONTACTED: 'Contacted', IN_DISCUSSION: 'In Discussion',
  MEETING_SCHEDULED: 'Meeting Scheduled', DEMO_SCHEDULED: 'Demo Scheduled',
  DEMO_COMPLETED: 'Demo Completed', PROPOSAL_SENT: 'Proposal Sent',
  NEGOTIATION: 'Negotiation', WAITING_APPROVAL: 'Waiting Approval',
  CONFIRMED: 'Confirmed', LOST: 'Lost', FUTURE_OPPORTUNITY: 'Future Opportunity',
};

export const LEAD_STATUS_COLORS = {
  NEW_LEAD: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CONTACTED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  IN_DISCUSSION: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  MEETING_SCHEDULED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  DEMO_SCHEDULED: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
  DEMO_COMPLETED: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  PROPOSAL_SENT: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  NEGOTIATION: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  WAITING_APPROVAL: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  CONFIRMED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  LOST: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  FUTURE_OPPORTUNITY: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
};

export const PRIORITY_COLORS = {
  HIGH:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  LOW:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export const TASK_STATUS_COLORS = {
  TODO:        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  COMPLETED:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED:   'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

export const FOLLOWUP_TYPES = ['CALL','MEETING','DEMO','EMAIL','WHATSAPP','VISIT'];

export const LEAD_SOURCES = [
  'LinkedIn','Website','Referral','Cold Call','School Visit',
  'Instagram','Facebook','WhatsApp','Email','Event','Other',
];

export const SERVICES = [
  '4 Days Workshop', '7 Days Workshop',
  'Coding Program', 'AI ML Course', 'Website Development', 'Mobile App',
  'Software Development', 'School Lab Setup', 'Corporate Training', 'Other',
];

export const ROLES = ['ADMIN','CEO','CFO','SALES_MANAGER','SALES_EXECUTIVE','MARKETING_MANAGER','MARKETING_EXECUTIVE','SUPPORT','HR'];

export const PIPELINE_STAGES = [
  'NEW_LEAD','CONTACTED','IN_DISCUSSION','DEMO_SCHEDULED',
  'PROPOSAL_SENT','NEGOTIATION','CONFIRMED','LOST',
];
