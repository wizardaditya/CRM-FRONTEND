import api from '@/api/axios';

const taskService = {
  getAll:     (params)      => api.get('/tasks', { params }),
  getById:    (id)          => api.get(`/tasks/${id}`),
  create:     (data)        => api.post('/tasks', data),
  update:     (id, data)    => api.put(`/tasks/${id}`, data),
  delete:     (id)          => api.delete(`/tasks/${id}`),
  addComment: (id, content) => api.post(`/tasks/${id}/comments`, { content }),
};

export default taskService;
