import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, Download, Eye, FileText, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/ui/PageHeader';
import Modal from '../../../components/ui/Modal';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { fetchDocuments, uploadDocument, deleteDocument } from '../api/financeApi';

const DOC_TYPES = ['INVOICE', 'BILL', 'CONTRACT', 'SALARY_SLIP', 'GST_FILE', 'PURCHASE_ORDER', 'OTHER'];
const TYPE_COLORS = { INVOICE: 'badge-blue', BILL: 'badge-yellow', CONTRACT: 'badge-purple', SALARY_SLIP: 'badge-green', GST_FILE: 'badge-orange', PURCHASE_ORDER: 'badge-cyan', OTHER: 'badge-gray' };

function UploadForm({ onClose }) {
  const qc = useQueryClient();
  const { register, handleSubmit } = useForm({ defaultValues: { title: '', type: 'OTHER', description: '' } });

  const mutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      fd.append('title', data.title);
      fd.append('type', data.type);
      fd.append('description', data.description || '');
      if (data.file?.[0]) fd.append('file', data.file[0]);
      return uploadDocument(fd);
    },
    onSuccess: () => { qc.invalidateQueries(['documents']); toast.success('Document uploaded'); onClose(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Upload failed'),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Title</label><input {...register('title')} className="input" placeholder="Document title" /></div>
        <div>
          <label className="label">Type</label>
          <select {...register('type')} className="input">
            {DOC_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>
      <div><label className="label">Description</label><textarea {...register('description')} className="input h-16 resize-none" /></div>
      <div>
        <label className="label">File *</label>
        <input {...register('file', { required: true })} type="file" className="input py-2" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? <LoadingSpinner size="sm" /> : <><Upload size={15} /> Upload</>}
        </button>
      </div>
    </form>
  );
}

export default function Documents() {
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['documents', search, typeFilter],
    queryFn: () => fetchDocuments({ search, type: typeFilter || undefined, limit: 50 }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => { qc.invalidateQueries(['documents']); toast.success('Deleted'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const docs = data?.data || [];

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        title="Documents"
        subtitle={`${data?.pagination?.total || 0} files`}
        actions={
          <button onClick={() => setModal(true)} className="btn-primary">
            <Upload size={16} /> Upload Document
          </button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents..." className="input pl-9" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input w-44">
          <option value="">All Types</option>
          {DOC_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {docs.length === 0 ? (
            <div className="col-span-full text-center py-16 text-slate-500">No documents uploaded</div>
          ) : docs.map((doc) => (
            <div key={doc.id} className="card hover:border-white/[0.12] transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-600/10 border border-primary-600/20 flex items-center justify-center">
                  <FileText size={18} className="text-primary-400" />
                </div>
                <span className={`badge ${TYPE_COLORS[doc.type] || 'badge-gray'}`}>{doc.type.replace('_', ' ')}</span>
              </div>
              <p className="font-medium text-slate-200 text-sm truncate mb-1">{doc.title}</p>
              <p className="text-xs text-slate-500 mb-3">{formatSize(doc.fileSize)} · {new Date(doc.createdAt).toLocaleDateString('en-IN')}</p>
              <p className="text-xs text-slate-400 truncate mb-3">{doc.description || 'No description'}</p>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="btn-secondary py-1.5 px-3 text-xs">
                  <Eye size={12} /> View
                </a>
                <a href={doc.fileUrl} download className="btn-secondary py-1.5 px-3 text-xs">
                  <Download size={12} /> Download
                </a>
                <button onClick={() => { if (window.confirm('Delete this document?')) deleteMutation.mutate(doc.id); }} className="btn-danger py-1.5 px-3 text-xs">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Upload Document" size="md">
        <UploadForm onClose={() => setModal(false)} />
      </Modal>
    </div>
  );
}
