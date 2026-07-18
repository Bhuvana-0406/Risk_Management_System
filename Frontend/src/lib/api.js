import axios from 'axios';

// Determine the API URL based on environment
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (import.meta.env.PROD) {
    return '/api';
  }
  
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();
console.log('🔧 API_URL configured as:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`📤 Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with better refresh token handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response received from: ${response.config.url}`, response.status);
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message
    });

    // Handle 401 errors with refresh token retry
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {
      originalRequest._retry = true;

      try {
        console.log('🔄 Attempting to refresh access token...');
        const response = await api.post('/auth/refresh-token', {});
        console.log('✅ Access token refreshed successfully');
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Refresh token failed:', refreshError.response?.data?.message);
        
        // Clear any stored user data and redirect to login
        localStorage.removeItem('user');
        window.location.href = '/login';
        
        throw new Error('Session expired. Please log in again.');
      }
    }

    const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
    throw new Error(errorMessage);
  }
);

// API functions
export const adminLogin = async (data) => {
  console.log('🔐 Attempting admin login...');
  const response = await api.post('/auth/login', data);
  console.log('🍪 Cookies after login:', document.cookie);
  return response;
};

export const refreshAccessToken = async () => {
  console.log('🔄 Refreshing access token...');
  return api.post('/auth/refresh-token', {});
};

export const logout = async () => {
  console.log('🚪 Logging out...');
  return api.post('/auth/logout', {});
};

// Other API functions...
export const registerAdmin = async (data) => api.post('/auth/register', data);
export const getDashboardData = async () => api.get('/dashboard');
export const getCustomers = async (params) => api.get('/customers', { params });
export const getCustomerById = async (id) => api.get(`/customers/${id}`);
export const getReturnStats = async () => api.get('/returns/stats');
export const getReturns = async (params) => api.get('/returns', { params });
export const getReturnById = async (id) => api.get(`/returns/${id}`);
export const getAnalyticsData = async (period = '12months') => api.get('/analytics', { params: { period } });

export default api;