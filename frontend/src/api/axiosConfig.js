import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('quickkart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally — logout user
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're on the login/signup request to avoid clearing error state
      const isAuthRequest = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/signup');
      
      if (!isAuthRequest) {
        localStorage.removeItem('quickkart_token');
        localStorage.removeItem('quickkart_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
