const { body } = require('express-validator');
const mongoose = require('mongoose');

// Valid service names enum
const validServiceNames = ['birthday', 'anniversary', 'engagement', 'wedding', 'corporate-party', 'family-function', 'other'];

// Service creation validation
const serviceValidation = [
    body('venueId')
        .notEmpty()
        .withMessage('Venue ID is required')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid venue ID format');
            }
            return true;
        }),

    body('name')
        .notEmpty()
        .withMessage('Service name is required')
        .isIn(validServiceNames)
        .withMessage(`Service name must be one of: ${validServiceNames.join(', ')}`),

    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string')
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),

    body('price')
        .notEmpty()
        .withMessage('Price is required')
        .isNumeric()
        .withMessage('Price must be a number')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),

    body('duration')
        .optional()
        .isString()
        .withMessage('Duration must be a string')
        .isLength({ max: 50 })
        .withMessage('Duration cannot exceed 50 characters'),

    body('inclusions')
        .optional()
        .isArray()
        .withMessage('Inclusions must be an array')
        .custom((value) => {
            if (value && value.length > 0) {
                // Check if all items in array are strings
                const allStrings = value.every(item => typeof item === 'string');
                if (!allStrings) {
                    throw new Error('All inclusions must be strings');
                }
                // Check if any string exceeds length limit
                const validLength = value.every(item => item.length <= 100);
                if (!validLength) {
                    throw new Error('Each inclusion cannot exceed 100 characters');
                }
            }
            return true;
        })
];

// Service update validation (same as creation but all fields optional except those that shouldn't change)
const updateServiceValidation = [
    body('venueId')
        .if(body('venueId').exists())
        .custom(() => {
            throw new Error('Venue ID cannot be changed');
        }),

    body('name')
        .optional()
        .isIn(validServiceNames)
        .withMessage(`Service name must be one of: ${validServiceNames.join(', ')}`),

    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string')
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),

    body('price')
        .optional()
        .isNumeric()
        .withMessage('Price must be a number')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),

    body('duration')
        .optional()
        .isString()
        .withMessage('Duration must be a string')
        .isLength({ max: 50 })
        .withMessage('Duration cannot exceed 50 characters'),

    body('inclusions')
        .optional()
        .isArray()
        .withMessage('Inclusions must be an array')
        .custom((value) => {
            if (value && value.length > 0) {
                // Check if all items in array are strings
                const allStrings = value.every(item => typeof item === 'string');
                if (!allStrings) {
                    throw new Error('All inclusions must be strings');
                }
                // Check if any string exceeds length limit
                const validLength = value.every(item => item.length <= 100);
                if (!validLength) {
                    throw new Error('Each inclusion cannot exceed 100 characters');
                }
            }
            return true;
        })
];

module.exports = {
    serviceValidation,
    updateServiceValidation,
    validServiceNames
};