import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5000';
export const API_URL = `${API_BASE_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to get full image URL
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '/placeholder.svg';
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};

// Format price in EGP
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export default api;
