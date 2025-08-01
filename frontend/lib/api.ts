import axios from 'axios';
import Cookies from 'js-cookie';

// Get API base URL from environment
const raw = process.env.NEXT_PUBLIC_API_URL;
const API_BASE_URL = (raw ? raw.replace(/\/$/, '') : 'http://localhost:8000') + '/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => config);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      Cookies.remove('auth-token');
      localStorage.removeItem('auth-token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;