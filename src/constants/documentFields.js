/**
 * Constantes para campos de documentos
 * Centraliza los nombres de campos para evitar magic strings
 */

export const DOCUMENT_FIELDS = [
    'certificateOfCompliance',
    'signedCertificateOfCompliance',
    'activityReport',
    'taxQualityCertificate',
    'socialSecurity',
    'rut',
    'rit',
    'trainings',
    'initiationRecord',
    'accountCertification'
];

/**
 * Convierte un campo camelCase a formato legible
 * @param {string} field - Campo en camelCase
 * @returns {string} - Campo formateado
 */
export const formatFieldName = (field) => {
    return field
        .replaceAll(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
};
