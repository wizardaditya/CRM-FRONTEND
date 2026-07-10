import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import leadService from '@/services/leadService';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PIPELINE_STAGES, LEAD_STATUS_LABELS } from '@/constants';
import { formatShortCurrency } from '@/utils';

const STAGE_COLORS = {
  NEW_LEAD:       'border-blue-400',
  CONTACTED:      'border-indigo-400',
  IN_DISCUSSION:  'border-violet-400',
  DEMO_SCHEDULED: 'border-fuchsia-400',
  PROPOSAL_SENT:  'border-orange-400',
  NEGOTIATION:    'border-amber-400',
  CONFIRMED:      'border-green-400',
  LOST:           'border-red-400',
};

const STAGE_HEADER_COLORS = {
  NEW_LEAD:       'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  CONTACTED:      'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400',
  IN_DISCUSSION:  'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400',
  DEMO_SCHEDULED: 'bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-400',
  PROPOSAL_SENT:  'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
  NEGOTIATION:    'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  CONFIRMED:      'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  LOST:           'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
};

const LeadCard = ({ lead, onDragStart, onClick }) => (
  <div
    draggable
    onDragStart={onDragStart}
    onClick={onClick}
    className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-all select-none"
  >
    <p className="text-xs font-mono text-slate-400 mb-1">{lead.leadNumber}</p>
    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug mb-1 truncate">
      {lead.organization}
    </p>
    {lead.contactPerson && (
      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">{lead.contactPerson}</p>
    )}
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <PriorityBadge priority={lead.priority} />
      {lead.expectedValue > 0 && (
        <span className="text-xs font-semibold text-green-600 dark:text-green-400">
          {formatShortCurrency(lead.expectedValue)}
        </span>
      )}
    </div>
  </div>
);

export const PipelinePage = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [dragging, setDragging] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['pipeline'],
    queryFn: () => leadService.getPipeline().then((r) => r.data.data),
  });

  // Organise leads by stage
  const [optimisticData, setOptimisticData] = useState(null);
  const stageMap = (optimisticData || data) ?? {};

  const handleDragStart = (lead, fromStage) => {
    setDragging({ lead, fromStage });
  };

  const handleDragOver = (e, stage) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDrop = async (e, toStage) => {
    e.preventDefault();
    setDragOverStage(null);
    if (!dragging || dragging.fromStage === toStage) {
      setDragging(null);
      return;
    }

    const { lead, fromStage } = dragging;
    setDragging(null);

    // Optimistic update
    const prev = JSON.parse(JSON.stringify(stageMap));
    setOptimisticData((m) => {
      const next = JSON.parse(JSON.stringify(m || data));
      next[fromStage] = (next[fromStage] || []).filter((l) => l.id !== lead.id);
      next[toStage] = [{ ...lead, status: toStage }, ...(next[toStage] || [])];
      return next;
    });

    try {
      await leadService.moveStage(lead.id, toStage);
      qc.invalidateQueries({ queryKey: ['pipeline'] });
      qc.invalidateQueries({ queryKey: ['leads'] });
      setOptimisticData(null);
      toast.success(`Moved to ${LEAD_STATUS_LABELS[toStage]}`);
    } catch {
      setOptimisticData(prev);
      toast.error('Failed to move lead');
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((s) => (
          <div key={s} className="flex-shrink-0 w-64">
            <Skeleton className="h-8 mb-2" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Pipeline</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Drag cards to move leads between stages.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 lg:-mx-6 px-4 lg:px-6">
        {PIPELINE_STAGES.map((stage) => {
          const leads = stageMap[stage] || [];
          const isOver = dragOverStage === stage;
          const borderColor = STAGE_COLORS[stage] || 'border-slate-400';
          const headerColor = STAGE_HEADER_COLORS[stage] || 'bg-slate-100 text-slate-600';

          return (
            <div
              key={stage}
              className={`flex-shrink-0 w-64 flex flex-col rounded-2xl border-2 ${borderColor} ${
                isOver ? 'ring-2 ring-offset-1 ring-brand-400' : ''
              } transition-all`}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={(e) => handleDrop(e, stage)}
            >
              {/* Column header */}
              <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl ${headerColor}`}>
                <span className="text-xs font-bold">{LEAD_STATUS_LABELS[stage]}</span>
                <span className="text-xs font-bold bg-white/60 dark:bg-black/20 rounded-full px-1.5 py-0.5">
                  {leads.length}
                </span>
              </div>

              {/* Cards */}
              <div
                className={`flex-1 p-2 space-y-2 min-h-[200px] rounded-b-xl ${
                  isOver ? 'bg-brand-50/50 dark:bg-brand-900/10' : 'bg-slate-50 dark:bg-slate-800/30'
                }`}
              >
                {leads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onDragStart={() => handleDragStart(lead, stage)}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                  />
                ))}
                {leads.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-xs text-slate-400">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
