import axios from 'axios';
import { API_CONFIG } from '@/config/api';

const client = axios.create({
  baseURL: API_CONFIG.SUPABASE_URL,
  headers: {
    ...API_CONFIG.getHeaders(),
  },
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message,
    });
    return Promise.reject(error);
  }
);

export default client;
