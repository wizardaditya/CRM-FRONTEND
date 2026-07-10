import api from '@/api/axios';

const userService = {
  getAll:      (params)   => api.get('/users', { params }),
  getDropdown: ()         => api.get('/users/dropdown'),
  getById:     (id)       => api.get(`/users/${id}`),
  update:      (id, data) => api.put(`/users/${id}`, data),
  deactivate:  (id)       => api.patch(`/users/${id}/deactivate`),
};

export default userService;
