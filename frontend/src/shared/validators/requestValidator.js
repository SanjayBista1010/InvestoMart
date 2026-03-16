/**
 * Centralized Request Validation Helper
 * 
 * This module can be used to validate outgoing request payloads or form data
 * before sending to the backend, adhering to the "request validation" requirement.
 * 
 * If a schema library like Zod or Yup is added later, it will be integrated here.
 */

export const validatePayload = (payload, requiredFields = []) => {
    const errors = {};
    
    requiredFields.forEach(field => {
        if (!payload[field] || payload[field].toString().trim() === '') {
            errors[field] = `${field} is required.`;
        }
    });

    if (Object.keys(errors).length > 0) {
        throw {
            name: 'ValidationError',
            message: 'Validation failed',
            fields: errors
        };
    }
    
    return true;
};
