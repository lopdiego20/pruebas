import axios from 'axios';
import config from '../config/api';

const api = axios.create({
  baseURL: config.API_BASE_URL,
});

// Interceptor para agregar el token a las solicitudes
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default api;