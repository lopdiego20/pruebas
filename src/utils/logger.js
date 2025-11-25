/**
 * Utilidad de logging condicional
 * Solo registra logs en ambiente de desarrollo para prevenir
 * exposición de información sensible en producción
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Sanitiza información sensible antes de loguear
 * @param {any} data - Datos a sanitizar
 * @returns {any} - Datos sanitizados
 */
const sanitize = (data) => {
    if (!data || typeof data !== 'object') return data;

    const sanitized = { ...data };
    const sensitiveKeys = ['token', 'password', 'authorization', 'secret', 'apiKey'];

    Object.keys(sanitized).forEach(key => {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
            sanitized[key] = '[REDACTED]';
        }
    });

    return sanitized;
};

const logger = {
    log: (...args) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },

    info: (message, data) => {
        if (isDevelopment) {
            console.log(`ℹ️ [INFO] ${message}`, data ? sanitize(data) : '');
        }
    },

    warn: (message, data) => {
        if (isDevelopment) {
            console.warn(`⚠️ [WARN] ${message}`, data ? sanitize(data) : '');
        }
    },

    error: (message, error) => {
        if (isDevelopment) {
            console.error(`❌ [ERROR] ${message}`, error);
        }
    },

    request: (config) => {
        if (isDevelopment) {
            console.log('🚀 [API REQUEST]', {
                method: config.method?.toUpperCase(),
                url: config.url,
                fullURL: `${config.baseURL}${config.url}`,
                headers: sanitize(config.headers),
                data: config.data,
                params: config.params
            });
        }
    },

    response: (response) => {
        if (isDevelopment) {
            console.log('✅ [API RESPONSE]', {
                status: response.status,
                url: response.config.url,
                data: response.data
            });
        }
    },

    apiError: (error) => {
        if (isDevelopment) {
            console.error('❌ [API ERROR]', {
                status: error.response?.status,
                url: error.config?.url,
                method: error.config?.method?.toUpperCase(),
                message: error.response?.data?.message || error.response?.data?.mesaage,
                fullError: error.response?.data
            });
        }
    }
};

export default logger;
