import api from './api';

export const course_api = {
    getAll: () => api.get('/courses'),
    create: (courseData) => api.post('/courses', courseData),
    getById: (id) => api.get(`/courses/${id}`),
    getMyCourses: () => api.get('/courses/my-courses'),
    updateStatus: (id, status) => api.put(`/courses/${id}/status`, { status }),
    
    // --- NOVO ---
    updateDetails: (id, data) => api.put(`/courses/${id}/details`, data),
    uploadMaterial: (id, formData) => api.post(`/courses/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    addStudent: (id, email) => api.post(`/courses/${id}/students`, { email }),
    // URL za download (nije funkcija nego string)
    getDownloadUrl: (filename) => `http://localhost:5000/api/courses/download/${filename}`,
    // ... ostale funkcije ...
    getStudentCourses: () => api.get('/courses/student-courses'), // <--- NOVO
    // ...
};