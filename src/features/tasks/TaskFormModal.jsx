import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import taskService from '@/services/taskService';
import userService from '@/services/userService';

const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const PRIORITIES    = ['HIGH', 'MEDIUM', 'LOW'];

export const TaskFormModal = ({ isOpen, onClose, task, defaultLeadId }) => {
  const qc = useQueryClient();
  const isEdit = Boolean(task);

  const { data: usersData } = useQuery({
    queryKey: ['users-dropdown'],
    queryFn: () => userService.getDropdown().then((r) => r.data.data),
    enabled: isOpen,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '', description: '', status: 'TODO', priority: 'MEDIUM',
      dueDate: '', reminder: '', assignedToId: '', leadId: defaultLeadId || '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (task) {
        reset({
          ...task,
          dueDate:      task.dueDate   ? task.dueDate.slice(0, 16)   : '',
          reminder:     task.reminder  ? task.reminder.slice(0, 16)  : '',
          assignedToId: task.assignedToId || task.assignedTo?.id || '',
          leadId:       task.leadId    || task.lead?.id              || '',
        });
      } else {
        reset({
          title: '', description: '', status: 'TODO', priority: 'MEDIUM',
          dueDate: '', reminder: '', assignedToId: '', leadId: defaultLeadId || '',
        });
      }
    }
  }, [isOpen, task, defaultLeadId, reset]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? taskService.update(task.id, data) : taskService.create(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Task updated!' : 'Task created!');
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['lead-tasks'] });
      onClose();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    },
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      dueDate:      data.dueDate      || undefined,
      reminder:     data.reminder     || undefined,
      assignedToId: data.assignedToId || undefined,
      leadId:       data.leadId       || undefined,
    };
    mutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Task' : 'New Task'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Title *"
          placeholder="Task title"
          error={errors.title?.message}
          {...register('title', { required: 'Title is required' })}
        />
        <Textarea
          label="Description"
          placeholder="Task details…"
          rows={3}
          {...register('description')}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Status" {...register('status')}>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </Select>
          <Select label="Priority" {...register('priority')}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
          <Input label="Due Date" type="datetime-local" {...register('dueDate')} />
          <Input label="Reminder" type="datetime-local" {...register('reminder')} />
        </div>
        <Select label="Assigned To" {...register('assignedToId')}>
          <option value="">Unassigned</option>
          {usersData?.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </Select>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>
            {isEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
