import axios from 'axios';
import config from '../config/api';

const api = axios.create({
  baseURL: config.API_BASE_URL,
});

// Interceptor para agregar el token a las solicitudes
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log detallado para requests específicos
  console.log('🚀 [API REQUEST]', {
    method: config.method?.toUpperCase(),
    url: config.url,
    fullURL: `${config.baseURL}${config.url}`,
    headers: config.headers,
    data: config.data,
    params: config.params,
    userInfo: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
  
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor para manejar respuestas y errores de autenticación
api.interceptors.response.use(
  response => {
    console.log('✅ [API RESPONSE]', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('❌ [API ERROR]', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.response?.data?.message || error.response?.data?.mesaage,
      fullError: error.response?.data
    });
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Solo limpiar localStorage si es un error de autenticación no esperado
      console.warn('⚠️ [API] Error de autenticación:', error.response.status, error.response.data?.message);
      
      // No cerrar sesión automáticamente, dejar que el componente maneje el error
      // localStorage.removeItem('token');
      // localStorage.removeItem('user');
      // localStorage.removeItem('role');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;