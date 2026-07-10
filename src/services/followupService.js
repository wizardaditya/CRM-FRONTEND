import api from '@/api/axios';

const followupService = {
  getAll:      (params)   => api.get('/followups', { params }),
  getById:     (id)       => api.get(`/followups/${id}`),
  create:      (data)     => api.post('/followups', data),
  update:      (id, data) => api.put(`/followups/${id}`, data),
  delete:      (id)       => api.delete(`/followups/${id}`),
  getCalendar: (params)   => api.get('/followups/calendar', { params }),
};

export default followupService;
