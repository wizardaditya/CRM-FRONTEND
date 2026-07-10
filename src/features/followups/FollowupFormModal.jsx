import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import followupService from '@/services/followupService';
import { FOLLOWUP_TYPES } from '@/constants';

// Must match the FollowupStatus enum in schema.prisma: PENDING | DONE | CANCELLED
const FOLLOWUP_STATUSES = ['PENDING', 'DONE', 'CANCELLED'];

export const FollowupFormModal = ({ isOpen, onClose, followup, defaultLeadId }) => {
  const qc = useQueryClient();
  const isEdit = Boolean(followup);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      type: 'CALL',
      scheduledAt: '',
      notes: '',
      leadId: defaultLeadId || '',
      status: 'PENDING',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (followup) {
        reset({
          ...followup,
          scheduledAt: followup.scheduledAt ? followup.scheduledAt.slice(0, 16) : '',
          leadId: followup.leadId || followup.lead?.id || '',
        });
      } else {
        reset({
          type: 'CALL', scheduledAt: '', notes: '',
          leadId: defaultLeadId || '', status: 'PENDING',
        });
      }
    }
  }, [isOpen, followup, defaultLeadId, reset]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? followupService.update(followup.id, data) : followupService.create(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Follow-up updated!' : 'Follow-up scheduled!');
      qc.invalidateQueries({ queryKey: ['followups'] });
      qc.invalidateQueries({ queryKey: ['lead-followups'] });
      qc.invalidateQueries({ queryKey: ['calendar'] });
      onClose();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    },
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      scheduledAt: data.scheduledAt || undefined,
      leadId: data.leadId || undefined,
    };
    mutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Follow-up' : 'Schedule Follow-up'} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select label="Type" {...register('type')}>
          {FOLLOWUP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>

        <Input
          label="Scheduled At *"
          type="datetime-local"
          error={errors.scheduledAt?.message}
          {...register('scheduledAt', { required: 'Please set a date and time' })}
        />

        <Select label="Status" {...register('status')}>
          {FOLLOWUP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>

        <Textarea
          label="Notes"
          placeholder="Notes or agenda for this follow-up…"
          rows={3}
          {...register('notes')}
        />

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>
            {isEdit ? 'Save Changes' : 'Schedule'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
