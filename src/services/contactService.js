import api from '@/api/axios';

const contactService = {
  getAll:  (params)   => api.get('/contacts', { params }),
  getById: (id)       => api.get(`/contacts/${id}`),
  create:  (data)     => api.post('/contacts', data),
  update:  (id, data) => api.put(`/contacts/${id}`, data),
  delete:  (id)       => api.delete(`/contacts/${id}`),
};

export default contactService;
