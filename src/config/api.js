// Configuración centralizada de la API
const config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://192.168.10.15:5000/api',
  API_HOST: process.env.REACT_APP_API_HOST || '192.168.10.15',
  API_PORT: process.env.REACT_APP_API_PORT || '5000',
};

export default config;