import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import contactService from '@/services/contactService';

export const ContactFormModal = ({ isOpen, onClose, contact, defaultLeadId }) => {
  const qc = useQueryClient();
  const isEdit = Boolean(contact);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      firstName: '', lastName: '', email: '', mobile: '',
      whatsapp: '', designation: '', department: '',
      leadId: defaultLeadId || '', isPrimary: false, notes: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (contact) {
        reset({
          ...contact,
          leadId: contact.leadId || contact.lead?.id || '',
        });
      } else {
        reset({
          firstName: '', lastName: '', email: '', mobile: '',
          whatsapp: '', designation: '', department: '',
          leadId: defaultLeadId || '', isPrimary: false, notes: '',
        });
      }
    }
  }, [isOpen, contact, defaultLeadId, reset]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? contactService.update(contact.id, data) : contactService.create(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Contact updated!' : 'Contact created!');
      qc.invalidateQueries({ queryKey: ['contacts'] });
      onClose();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    },
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      leadId: data.leadId || undefined,
    };
    mutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Contact' : 'New Contact'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name *"
            placeholder="First name"
            error={errors.firstName?.message}
            {...register('firstName', { required: 'First name is required' })}
          />
          <Input label="Last Name" placeholder="Last name" {...register('lastName')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Email" type="email" placeholder="email@example.com" {...register('email')} />
          <Input label="Mobile" placeholder="+91 98765 43210" {...register('mobile')} />
          <Input label="WhatsApp" placeholder="Same as mobile or different" {...register('whatsapp')} />
          <Input label="Designation" placeholder="e.g. Principal" {...register('designation')} />
          <Input label="Department" placeholder="e.g. Admin" {...register('department')} />
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            {...register('isPrimary')}
          />
          <span className="text-sm text-slate-600 dark:text-slate-400">Primary contact</span>
        </label>

        <Textarea label="Notes" placeholder="Any notes about this contact…" rows={3} {...register('notes')} />

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>
            {isEdit ? 'Save Changes' : 'Create Contact'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
