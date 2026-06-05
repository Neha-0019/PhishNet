import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  // Replace this URL with your actual live Render Backend URL once you create the Web Service
  baseURL: 'https://phishnet-backend-api.onrender.com/api',
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An unexpected error occurred';
    toast.error(message, {
      style: {
        background: '#1e293b',
        color: '#f8fafc',
        border: '1px solid #ef4444'
      }
    });
    return Promise.reject(error);
  }
);

export default api;