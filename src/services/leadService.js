import api from '@/api/axios';

const leadService = {
  getAll:     (params) => api.get('/leads', { params }),
  getById:    (id)     => api.get(`/leads/${id}`),
  create:     (data)   => api.post('/leads', data),
  update:     (id, data) => api.put(`/leads/${id}`, data),
  delete:     (id)     => api.delete(`/leads/${id}`),
  moveStage:  (id, status) => api.patch(`/leads/${id}/stage`, { status }),
  addNote:    (id, note)   => api.post(`/leads/${id}/notes`, { note }),
  getPipeline: ()      => api.get('/leads/pipeline'),
};

export default leadService;
