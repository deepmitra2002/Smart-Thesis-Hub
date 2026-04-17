import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Handle token expiry globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('sth_refresh_token');
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          localStorage.setItem('sth_token', data.token);
          localStorage.setItem('sth_refresh_token', data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        localStorage.removeItem('sth_token');
        localStorage.removeItem('sth_refresh_token');
        localStorage.removeItem('sth_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── AUTH ─────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// ── SUPERVISORS ───────────────────────────────────────────
export const supervisorAPI = {
  getAll: (params) => api.get('/supervisors', { params }),
  getById: (id) => api.get(`/supervisors/${id}`),
  update: (id, data) => api.patch(`/supervisors/${id}`, data),
  getStudents: (id) => api.get(`/supervisors/${id}/students`),
  rateStudent: (data) => api.post('/supervisors/rate-student', data),
};

// ── STUDENTS ─────────────────────────────────────────────
export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getMe: () => api.get('/students/me'),
  updateMe: (data) => api.patch('/students/me', data),
  toggleSaveProject: (projectId) => api.post(`/students/me/save-project/${projectId}`),
  getById: (id) => api.get(`/students/${id}`),
};

// ── REQUESTS ─────────────────────────────────────────────
export const requestAPI = {
  create: (data) => api.post('/requests', data),
  getAll: (params) => api.get('/requests', { params }),
  updateStatus: (id, data) => api.patch(`/requests/${id}/status`, data),
  withdraw: (id) => api.delete(`/requests/${id}`),
};

// ── PROJECTS ─────────────────────────────────────────────
export const projectAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.patch(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

// ── NOTIFICATIONS ─────────────────────────────────────────
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  readAll: () => api.patch('/notifications/read-all'),
  readOne: (id) => api.patch(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ── VIDEOS ───────────────────────────────────────────────
export const videoAPI = {
  getAll: (params) => api.get('/videos', { params }),
  addView: (id) => api.patch(`/videos/${id}/view`),
  create: (data) => api.post('/videos', data),
  delete: (id) => api.delete(`/videos/${id}`),
};

// ── FEEDBACK ─────────────────────────────────────────────
export const feedbackAPI = {
  submit: (data) => api.post('/feedback', data),
  getAll: (params) => api.get('/feedback', { params }),
  respond: (id, data) => api.patch(`/feedback/${id}`, data),
};

// ── CATEGORIES ───────────────────────────────────────────
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.patch(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ── RECOMMENDATIONS ──────────────────────────────────────
export const recommendationAPI = {
  get: () => api.get('/recommendations'),
};

// ── ADMIN ────────────────────────────────────────────────
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getActivityLog: () => api.get('/admin/activity-log'),
  createUser: (data) => api.post('/admin/create-user', data),
  getUsers: (params) => api.get('/users', { params }),
  toggleActive: (id) => api.patch(`/users/${id}/toggle-active`),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export default api;
