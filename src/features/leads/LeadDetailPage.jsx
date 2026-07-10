import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Phone, Mail, MessageCircle, Globe, Pencil,
  MapPin, User, DollarSign, Calendar, FileText, Trash2,
  Upload, Download, CheckSquare, PhoneCall, Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import leadService from '@/services/leadService';
import taskService from '@/services/taskService';
import followupService from '@/services/followupService';
import fileService from '@/services/fileService';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LeadFormModal } from './LeadFormModal';
import { TaskFormModal } from '@/features/tasks/TaskFormModal';
import { FollowupFormModal } from '@/features/followups/FollowupFormModal';
import { formatDate, formatCurrency, timeAgo } from '@/utils';
import { FOLLOWUP_TYPES } from '@/constants';

const TABS = [
  { key: 'timeline',  label: 'Timeline',   icon: Clock },
  { key: 'tasks',     label: 'Tasks',      icon: CheckSquare },
  { key: 'followups', label: 'Follow-ups', icon: PhoneCall },
  { key: 'files',     label: 'Files',      icon: FileText },
];

const FOLLOWUP_ICONS = {
  CALL: PhoneCall, MEETING: User, DEMO: Globe,
  EMAIL: Mail, WHATSAPP: MessageCircle, VISIT: MapPin,
};

export const LeadDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState('timeline');
  const [editOpen, setEditOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [followupOpen, setFollowupOpen] = useState(false);
  const [deleteFileTarget, setDeleteFileTarget] = useState(null);

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadService.getById(id).then((r) => r.data.data),
  });

  const { data: tasksData } = useQuery({
    queryKey: ['lead-tasks', id],
    queryFn: () => taskService.getAll({ leadId: id }).then((r) => r.data.data),
    enabled: activeTab === 'tasks',
  });

  const { data: followupsData } = useQuery({
    queryKey: ['lead-followups', id],
    queryFn: () => followupService.getAll({ leadId: id }).then((r) => r.data.data),
    enabled: activeTab === 'followups',
  });

  const { data: filesData } = useQuery({
    queryKey: ['lead-files', id],
    queryFn: () => fileService.getByLead(id).then((r) => r.data.data),
    enabled: activeTab === 'files',
  });

  const deleteFileMutation = useMutation({
    mutationFn: (fileId) => fileService.delete(fileId),
    onSuccess: () => {
      toast.success('File deleted');
      qc.invalidateQueries({ queryKey: ['lead-files', id] });
      setDeleteFileTarget(null);
    },
    onError: () => toast.error('Failed to delete file'),
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('leadId', id);
    try {
      await fileService.upload(fd);
      toast.success('File uploaded');
      qc.invalidateQueries({ queryKey: ['lead-files', id] });
    } catch {
      toast.error('Upload failed');
    }
    e.target.value = '';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-60 col-span-1" />
          <Skeleton className="h-60 col-span-2" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Lead not found.</p>
        <Button variant="ghost" onClick={() => navigate('/leads')} className="mt-4">
          <ArrowLeft size={14} /> Back to Leads
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/leads')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors mt-0.5"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{lead.organization}</h1>
              <StatusBadge status={lead.status} />
              <PriorityBadge priority={lead.priority} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {lead.leadNumber} · {lead.contactPerson || 'No contact'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {lead.mobile && (
            <a href={`tel:${lead.mobile}`}>
              <Button variant="ghost" size="sm"><Phone size={14} /> Call</Button>
            </a>
          )}
          {lead.whatsapp && (
            <a href={`https://wa.me/${lead.whatsapp?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
              <Button variant="ghost" size="sm"><MessageCircle size={14} /> WhatsApp</Button>
            </a>
          )}
          {lead.email && (
            <a href={`mailto:${lead.email}`}>
              <Button variant="ghost" size="sm"><Mail size={14} /> Email</Button>
            </a>
          )}
          <Button size="sm" onClick={() => setEditOpen(true)}>
            <Pencil size={14} /> Edit
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Info */}
        <div className="space-y-4">
          {/* Contact info */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Contact</h3>
            {[
              { icon: User, label: lead.contactPerson },
              { icon: Phone, label: lead.mobile },
              { icon: Mail, label: lead.email },
              { icon: Globe, label: lead.website },
              { icon: MapPin, label: [lead.city, lead.state, lead.country].filter(Boolean).join(', ') },
            ].map(({ icon: Icon, label }) =>
              label ? (
                <div key={label} className="flex items-center gap-2.5">
                  <Icon size={13} className="text-slate-400 flex-shrink-0" />
                  <span className="text-xs text-slate-600 dark:text-slate-300 truncate">{label}</span>
                </div>
              ) : null
            )}
          </div>

          {/* Deal info */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Deal</h3>
            {[
              { icon: DollarSign, label: 'Expected Value', value: formatCurrency(lead.expectedValue) },
              { icon: Calendar, label: 'Close Date', value: formatDate(lead.expectedCloseDate) },
              { icon: FileText, label: 'Source', value: lead.source },
              { icon: Globe, label: 'Service', value: lead.interestedService },
            ].map(({ icon: Icon, label, value }) =>
              value ? (
                <div key={label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Icon size={13} className="text-slate-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{value}</span>
                </div>
              ) : null
            )}
            {lead.probability != null && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Probability</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{lead.probability}%</span>
                </div>
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all"
                    style={{ width: `${lead.probability}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Assigned */}
          {lead.assignedTo && (
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Assigned To</h3>
              <div className="flex items-center gap-3">
                <Avatar name={lead.assignedTo?.name || 'User'} size="md" />
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {lead.assignedTo?.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{lead.assignedTo.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Tabs */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === key
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          <div className="p-5 min-h-[320px]">
            {/* Timeline */}
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                {!lead.activities?.length ? (
                  <p className="text-sm text-slate-400 text-center py-8">No activity yet.</p>
                ) : (
                  lead.activities.map((a) => (
                    <div key={a.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock size={14} className="text-brand-600 dark:text-brand-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{a.description}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{timeAgo(a.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tasks */}
            {activeTab === 'tasks' && (
              <div>
                <div className="flex justify-end mb-3">
                  <Button size="sm" onClick={() => setTaskOpen(true)}>
                    <CheckSquare size={14} /> Add Task
                  </Button>
                </div>
                {!tasksData?.length ? (
                  <p className="text-sm text-slate-400 text-center py-8">No tasks yet.</p>
                ) : (
                  <div className="space-y-2">
                    {tasksData.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{task.title}</p>
                          <p className="text-xs text-slate-400">{formatDate(task.dueDate)}</p>
                        </div>
                        <span className={`badge text-xs ${
                          task.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                        }`}>
                          {task.status?.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Follow-ups */}
            {activeTab === 'followups' && (
              <div>
                <div className="flex justify-end mb-3">
                  <Button size="sm" onClick={() => setFollowupOpen(true)}>
                    <PhoneCall size={14} /> Add Follow-up
                  </Button>
                </div>
                {!followupsData?.length ? (
                  <p className="text-sm text-slate-400 text-center py-8">No follow-ups yet.</p>
                ) : (
                  <div className="space-y-2">
                    {followupsData.map((fu) => {
                      const FIcon = FOLLOWUP_ICONS[fu.type] || Phone;
                      return (
                        <div key={fu.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                          <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FIcon size={14} className="text-brand-600 dark:text-brand-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{fu.type}</p>
                            <p className="text-xs text-slate-400">{formatDate(fu.scheduledAt)}</p>
                            {fu.notes && <p className="text-xs text-slate-500 truncate">{fu.notes}</p>}
                          </div>
                          <span className={`badge text-xs ${
                            fu.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {fu.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Files */}
            {activeTab === 'files' && (
              <div>
                <div className="flex justify-end mb-3">
                  <label className="cursor-pointer">
                    <Button size="sm" as="span">
                      <Upload size={14} /> Upload File
                    </Button>
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                {!filesData?.length ? (
                  <p className="text-sm text-slate-400 text-center py-8">No files uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {filesData.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText size={14} className="text-slate-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{f.originalName}</p>
                            <p className="text-xs text-slate-400">{timeAgo(f.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <a href={f.url} target="_blank" rel="noreferrer" download>
                            <button className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                              <Download size={14} />
                            </button>
                          </a>
                          <button
                            onClick={() => setDeleteFileTarget(f)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <LeadFormModal isOpen={editOpen} onClose={() => setEditOpen(false)} lead={lead} />

      <TaskFormModal
        isOpen={taskOpen}
        onClose={() => setTaskOpen(false)}
        defaultLeadId={id}
      />

      <FollowupFormModal
        isOpen={followupOpen}
        onClose={() => setFollowupOpen(false)}
        defaultLeadId={id}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteFileTarget)}
        onClose={() => setDeleteFileTarget(null)}
        onConfirm={() => deleteFileMutation.mutate(deleteFileTarget?.id)}
        loading={deleteFileMutation.isPending}
        title="Delete File"
        message={`Delete "${deleteFileTarget?.originalName}"?`}
        confirmLabel="Delete"
      />
    </div>
  );
};
