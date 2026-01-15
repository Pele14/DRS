import api from './api';

export const user_api = {
    getAll: () => api.get('/users'),
    deleteUser: (id) => api.delete(`/users/${id}`)
};