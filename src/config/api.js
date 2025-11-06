// Configuración centralizada de la API
const config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  API_HOST: process.env.REACT_APP_API_HOST || 'localhost',
  API_PORT: process.env.REACT_APP_API_PORT || '5000',
};

export default config;