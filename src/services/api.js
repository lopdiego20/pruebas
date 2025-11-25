import axios from 'axios';
import config from '../config/api';
import logger from '../utils/logger';

const api = axios.create({
  baseURL: config.API_BASE_URL,
});

/**
 * Parsea JSON de forma segura
 * @param {string} jsonString - String JSON a parsear
 * @param {any} defaultValue - Valor por defecto si falla el parseo
 * @returns {any} - Objeto parseado o valor por defecto
 */
const safeJSONParse = (jsonString, defaultValue = {}) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    logger.error('Error parsing JSON from localStorage', error);
    return defaultValue;
  }
};

// Interceptor para agregar el token a las solicitudes
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  const user = safeJSONParse(localStorage.getItem('user') || '{}', {});

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Log solo en desarrollo
  logger.request(config);

  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor para manejar respuestas y errores de autenticación
api.interceptors.response.use(
  response => {
    logger.response(response);
    return response;
  },
  error => {
    logger.apiError(error);

    if (error.response?.status === 401 || error.response?.status === 403) {
      logger.warn('Error de autenticación detectado', {
        status: error.response.status,
        message: error.response.data?.message
      });

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