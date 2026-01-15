import api from './api';

export const auth_api = {
    // Sada prima jedan objekat (credentials), a ne dva odvojena stringa
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    // Preimenovano iz 'getMe' u 'me' da se poklopi sa AuthContext-om
    me: () => api.get('/auth/me'),
    register: (userData) => api.post('/auth/register', userData)
};