import api from './api';

export const auth_api = {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    me: () => api.get('/auth/me'),
    register: (userData) => api.post('/auth/register', userData)
};