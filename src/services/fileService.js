import api from '@/api/axios';

const fileService = {
  upload: (formData) =>
    api.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getByLead: (leadId) => api.get(`/files/lead/${leadId}`),
  delete:    (id)     => api.delete(`/files/${id}`),
};

export default fileService;
