import api from './api';

export const course_api = {
    getAll: () => api.get('/courses'),
    create: (courseData) => api.post('/courses', courseData),
    getById: (id) => api.get(`/courses/${id}`),
    getMyCourses: () => api.get('/courses/my-courses'), // <--- NOVO
    updateStatus: (id, status) => api.put(`/courses/${id}/status`, { status })
};