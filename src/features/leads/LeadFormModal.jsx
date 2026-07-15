import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import leadService from '@/services/leadService';
import userService from '@/services/userService';
import {
  LEAD_STATUSES, LEAD_STATUS_LABELS, LEAD_SOURCES, SERVICES,
} from '@/constants';

const INDUSTRIES = ['Education', 'Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Real Estate', 'Other'];
const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];
const BOARDS = ['CBSE', 'ICSE', 'MP Board', 'UP Board', 'Bihar Board', 'Gujarat Board', 'Maharashtra Board', 'Karnataka Board', 'Tamil Nadu Board', 'West Bengal Board', 'Rajasthan Board', 'Other'];

export const LeadFormModal = ({ isOpen, onClose, lead }) => {
  const qc = useQueryClient();
  const isEdit = Boolean(lead);

  const { data: usersData } = useQuery({
    queryKey: ['users-dropdown'],
    queryFn: () => userService.getDropdown().then((r) => r.data.data),
    enabled: isOpen,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      organization: '', contactPerson: '', designation: '', mobile: '',
      whatsapp: '', email: '', website: '', address: '', city: '',
      state: '', country: 'India', industry: '', source: '',
      interestedService: '', boards: '', status: 'NEW_LEAD', priority: 'MEDIUM',
      expectedValue: '', probability: '', expectedCloseDate: '',
      proposalSent: false, demoDone: false, decisionMaker: false,
      assignedToId: '', remarks: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (lead) {
        reset({
          ...lead,
          assignedToId: lead.assignedToId || lead.assignedTo?.id || '',
          expectedCloseDate: lead.expectedCloseDate ? lead.expectedCloseDate.slice(0, 10) : '',
        });
      } else {
        reset({
          organization: '', contactPerson: '', designation: '', mobile: '',
          whatsapp: '', email: '', website: '', address: '', city: '',
          state: '', country: 'India', industry: '', source: '',
          interestedService: '', boards: '', status: 'NEW_LEAD', priority: 'MEDIUM',
          expectedValue: '', probability: '', expectedCloseDate: '',
          proposalSent: false, demoDone: false, decisionMaker: false,
          assignedToId: '', remarks: '',
        });
      }
    }
  }, [isOpen, lead, reset]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? leadService.update(lead.id, data) : leadService.create(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Lead updated!' : 'Lead created!');
      qc.invalidateQueries({ queryKey: ['leads'] });
      if (isEdit) qc.invalidateQueries({ queryKey: ['lead', lead.id] });
      onClose();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    },
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      expectedValue: data.expectedValue ? Number(data.expectedValue) : undefined,
      probability: data.probability ? Number(data.probability) : undefined,
      expectedCloseDate: data.expectedCloseDate || undefined,
      assignedToId: data.assignedToId || undefined,
    };
    mutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Lead' : 'Add New Lead'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Section: Organization */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Organization</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Organization"
              placeholder="Company name"
              {...register('organization')}
            />
            <Input label="Contact Person" placeholder="Full name" {...register('contactPerson')} />
            <Input label="Designation" placeholder="e.g. Principal" {...register('designation')} />
            <Select label="Industry" {...register('industry')}>
              <option value="">Select industry</option>
              {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
            </Select>
          </div>
        </div>

        {/* Section: Contact Details */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Contact Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Mobile"
              placeholder="+91 98765 43210"
              {...register('mobile')}
            />
            <Input label="WhatsApp" placeholder="Same as mobile or different" {...register('whatsapp')} />
            <Input label="Email" type="email" placeholder="email@company.com" {...register('email')} />
            <Input label="Website" placeholder="https://example.com" {...register('website')} />
          </div>
        </div>

        {/* Section: Location */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Location</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-3">
              <Input label="Address" placeholder="Street address" {...register('address')} />
            </div>
            <Input label="City" placeholder="City" {...register('city')} />
            <Input label="State" placeholder="State" {...register('state')} />
            <Input label="Country" placeholder="Country" {...register('country')} />
          </div>
        </div>

        {/* Section: Lead Info */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Lead Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select label="Source" {...register('source')}>
              <option value="">Select source</option>
              {LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}
            </Select>
            <Select label="Interested Service" {...register('interestedService')}>
              <option value="">Select service</option>
              {SERVICES.map((s) => <option key={s}>{s}</option>)}
            </Select>
            <Select label="Educational Board" {...register('boards')}>
              <option value="">Select board</option>
              {BOARDS.map((b) => <option key={b} value={b}>{b}</option>)}
            </Select>
            <Select label="Status" {...register('status')}>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>
              ))}
            </Select>
            <Select label="Priority" {...register('priority')}>
              {['HIGH', 'MEDIUM', 'LOW'].map((p) => <option key={p}>{p}</option>)}
            </Select>
            <Input
              label="Expected Value (₹)"
              type="number"
              placeholder="e.g. 500000"
              {...register('expectedValue')}
            />
            <Input
              label="Probability (%)"
              type="number"
              min="0"
              max="100"
              placeholder="0–100"
              {...register('probability')}
            />
            <Input
              label="Expected Close Date"
              type="date"
              {...register('expectedCloseDate')}
            />
            <Select label="Assigned To" {...register('assignedToId')}>
              <option value="">Unassigned</option>
              {usersData?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-4 mt-3">
            {[
              { name: 'proposalSent', label: 'Proposal Sent' },
              { name: 'demoDone', label: 'Demo Done' },
              { name: 'decisionMaker', label: 'Decision Maker Contacted' },
            ].map(({ name, label }) => (
              <label key={name} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  {...register(name)}
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Remarks */}
        <Textarea
          label="Remarks"
          placeholder="Any additional notes…"
          rows={3}
          {...register('remarks')}
        />

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>
            {isEdit ? 'Save Changes' : 'Create Lead'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
