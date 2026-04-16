import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lcc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const requestPath = err.config?.url || '';
      const isAuthAttempt = requestPath.includes('/auth/login') || requestPath.includes('/auth/register');

      if (!isAuthAttempt) {
        localStorage.removeItem('lcc_token');
        localStorage.removeItem('lcc_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Products
export const productApi = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getMeta: () => api.get('/products/meta'),
  uploadImages: (formData) => api.post('/products/upload-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
  toggleWishlist: (id) => api.put(`/products/${id}/wishlist`),
};

// Orders
export const orderApi = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getOne: (id) => api.get(`/orders/${id}`),
  track: (orderNumber) => api.get('/orders/track', { params: { orderNumber } }),
  requestReturn: (id, reason) => api.put(`/orders/${id}/return`, { reason }),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

// Payments
export const paymentApi = {
  createIntent: (data) => api.post('/payments/create-intent', data),
  confirm: (data) => api.post('/payments/confirm', data),
  refund: (id) => api.post(`/payments/refund/${id}`),
};

// Reviews
export const reviewApi = {
  getAll: (params) => api.get('/reviews', { params }),
  create: (data) => api.post('/reviews', data),
  markHelpful: (id) => api.put(`/reviews/${id}/helpful`),
};

// Users / Garage
export const userApi = {
  addToGarage: (data) => api.post('/users/garage', data),
  removeFromGarage: (vehicleId) => api.delete(`/users/garage/${vehicleId}`),
  setPrimary: (vehicleId) => api.put(`/users/garage/${vehicleId}/primary`),
  addAddress: (data) => api.post('/users/addresses', data),
  removeAddress: (addressId) => api.delete(`/users/addresses/${addressId}`),
};

// Vehicles (VIN/make/model)
export const vehicleApi = {
  getMakes: () => api.get('/vehicles/makes'),
  getModels: (make, year) => api.get('/vehicles/models', { params: { make, year } }),
  getYears: () => api.get('/vehicles/years'),
  vinLookup: (vin) => api.post('/vehicles/vin', { vin }),
};

// Bundles
export const bundleApi = {
  getAll: () => api.get('/bundles'),
  getOne: (id) => api.get(`/bundles/${id}`),
  create: (data) => api.post('/bundles', data),
  update: (id, data) => api.put(`/bundles/${id}`, data),
  remove: (id) => api.delete(`/bundles/${id}`),
};

// Admin
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  updateInventory: (id, data) => api.put(`/admin/inventory/${id}`, data),
};
