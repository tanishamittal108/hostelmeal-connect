import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/api/auth/refresh-token', { refreshToken });
        const newToken = data.data.token;
        localStorage.setItem('token', newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Typed API functions
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => api.post(`/auth/verify-email/${token}`),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

export const menuAPI = {
  getTodayMenus: () => api.get('/menu/today'),
  getMenu: (id) => api.get(`/menu/${id}`),
  getMyMenus: () => api.get('/menu/provider/my'),
  createMenu: (data) => api.post('/menu/create', data),
  updateMenu: (id, data) => api.put(`/menu/${id}`, data),
  publishMenu: (id) => api.put(`/menu/${id}/publish`),
  deleteMenu: (id) => api.delete(`/menu/${id}`),
};

export const voteAPI = {
  getTodayMenus: () => api.get('/votes/today'),
  getMenuVotes: (menuId) => api.get(`/votes/menu/${menuId}`),
  castVote: (data) => api.post('/votes/cast', data),
  finalizeVoting: (menuId) => api.post(`/votes/finalize/${menuId}`),
};

export const orderAPI = {
  createOrder: (data) => api.post('/orders/create', data),
  getMyOrders: (params) => api.get('/orders/my', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  cancelOrder: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
  verifyDelivery: (id, otp) => api.post(`/orders/${id}/verify-delivery`, { otp }),
  getProviderOrders: (params) => api.get('/orders/provider/active', { params }),
};

export const providerAPI = {
  getAll: (params) => api.get('/providers', { params }),
  getOne: (id) => api.get(`/providers/${id}`),
  updateProfile: (data) => api.put('/providers/profile', data),
  uploadKitchenPhotos: (formData) => api.post('/providers/kitchen-photos', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadDocuments: (formData) => api.post('/providers/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getByProvider: (providerId) => api.get(`/reviews/provider/${providerId}`),
};

export const walletAPI = {
  get: () => api.get('/wallet'),
  topUp: (amount) => api.post('/wallet/topup', { amount }),
  confirmTopUp: (data) => api.post('/wallet/topup/confirm', data),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAllRead: () => api.put('/notifications/read-all'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
};

export const subscriptionAPI = {
  create: (data) => api.post('/subscriptions', data),
  getMy: () => api.get('/subscriptions/my'),
  pause: (id, reason) => api.put(`/subscriptions/${id}/pause`, { reason }),
  resume: (id) => api.put(`/subscriptions/${id}/resume`),
};

export const analyticsAPI = {
  getAdmin: (range) => api.get('/analytics/admin', { params: { range } }),
  getProvider: (range) => api.get('/analytics/provider', { params: { range } }),
};

export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  banUser: (id, reason) => api.put(`/admin/users/${id}/ban`, { reason }),
  unbanUser: (id) => api.put(`/admin/users/${id}/unban`),
  getPendingProviders: () => api.get('/admin/providers/pending'),
  approveProvider: (id) => api.put(`/admin/providers/${id}/approve`),
  rejectProvider: (id, reason) => api.put(`/admin/providers/${id}/reject`, { reason }),
};

export const couponAPI = {
  validate: (code) => api.get(`/coupons/validate/${code}`),
  create: (data) => api.post('/coupons', data),
  getAll: () => api.get('/coupons'),
};

export const chatAPI = {
  getChats: () => api.get('/chat'),
  getMessages: (chatId) => api.get(`/chat/${chatId}/messages`),
  sendMessage: (data) => api.post('/chat/send', data),
};

export const deliveryAPI = {
  getActive: () => api.get('/delivery/active'),
  getEarnings: () => api.get('/delivery/earnings'),
  updateLocation: (lat, lng) => api.put('/delivery/location', { lat, lng }),
};
