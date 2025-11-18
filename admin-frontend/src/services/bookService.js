import api from '../config/api';

export const bookService = {
    getAll: (params) => api.get('/Book', { params }),
    getById: (id) => api.get(`/Book/${id}`),
    create: (data) => api.post('/Book', data),
    update: (id, data) => api.put(`/Book/${id}`, data),
    delete: (id) => api.delete(`/Book/${id}`),
    search: (searchTerm) => api.get('/Book/search', { params: { searchTerm } }),
};

export const categoryService = {
    getAll: (params) => api.get('/Category', { params }),
    getById: (id) => api.get(`/Category/${id}`),
    create: (data) => api.post('/Category', data),
    update: (id, data) => api.put(`/Category/${id}`, data),
    delete: (id) => api.delete(`/Category/${id}`),
};

export const authorService = {
    getAll: (params) => api.get('/Author', { params }),
    getById: (id) => api.get(`/Author/${id}`),
    create: (data) => api.post('/Author', data),
    update: (id, data) => api.put(`/Author/${id}`, data),
    delete: (id) => api.delete(`/Author/${id}`),
};

export const publisherService = {
    getAll: (params) => api.get('/Publisher', { params }),
    getById: (id) => api.get(`/Publisher/${id}`),
    create: (data) => api.post('/Publisher', data),
    update: (id, data) => api.put(`/Publisher/${id}`, data),
    delete: (id) => api.delete(`/Publisher/${id}`),
};

export const orderService = {
    getAll: (params) => api.get('/Order', { params }),
    getById: (id) => api.get(`/Order/${id}`),
    updateStatus: (id, status) => api.patch(`/Order/${id}/status`, { status }),
};

export const userService = {
    getAll: (params) => api.get('/User', { params }),
    getById: (id) => api.get(`/User/${id}`),
    create: (data) => api.post('/User', data),
    update: (id, data) => api.put(`/User/${id}`, data),
    delete: (id) => api.delete(`/User/${id}`),
};

export const stockService = {
    getAll: (params) => api.get('/Stock', { params }),
    update: (id, data) => api.put(`/Stock/${id}`, data),
};

export const reviewService = {
    getAll: (params) => api.get('/Review', { params }),
    approve: (id) => api.patch(`/Review/${id}/approve`),
    reject: (id) => api.patch(`/Review/${id}/reject`),
    delete: (id) => api.delete(`/Review/${id}`),
};
