/**
 * ASCII Art Studio - Validation Utilities
 * Input validation and error handling utilities
 */

import { Config } from '../config.js';

export class ValidationError extends Error {
    constructor(message, field = null, code = null) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
        this.code = code;
    }
}

export class InputValidator {
    /**
     * Validate text input
     * @param {string} text - Text to validate
     * @returns {Object} Validation result
     */
    static validateText(text) {
        if (!text || typeof text !== 'string') {
            return {
                valid: false,
                error: 'Text must be a non-empty string',
                field: 'text'
            };
        }

        const trimmed = text.trim();
        
        if (trimmed.length === 0) {
            return {
                valid: false,
                error: 'Text cannot be empty',
                field: 'text'
            };
        }

        if (trimmed.length < Config.VALIDATION.TEXT_INPUT.minLength) {
            return {
                valid: false,
                error: `Text must be at least ${Config.VALIDATION.TEXT_INPUT.minLength} character(s)`,
                field: 'text'
            };
        }

        if (trimmed.length > Config.VALIDATION.TEXT_INPUT.maxLength) {
            return {
                valid: false,
                error: `Text cannot exceed ${Config.VALIDATION.TEXT_INPUT.maxLength} characters`,
                field: 'text'
            };
        }

        if (!Config.VALIDATION.TEXT_INPUT.allowedChars.test(trimmed)) {
            return {
                valid: false,
                error: 'Text contains invalid characters. Only letters, numbers, and basic punctuation allowed.',
                field: 'text'
            };
        }

        return { valid: true, value: trimmed };
    }

    /**
     * Validate image file
     * @param {File} file - Image file to validate
     * @returns {Object} Validation result
     */
    static validateImageFile(file) {
        if (!file) {
            return {
                valid: false,
                error: 'No file selected',
                field: 'image'
            };
        }

        if (!(file instanceof File)) {
            return {
                valid: false,
                error: 'Invalid file object',
                field: 'image'
            };
        }

        // Check file size
        if (file.size > Config.VALIDATION.IMAGE_UPLOAD.maxSize) {
            const maxSizeMB = Math.round(Config.VALIDATION.IMAGE_UPLOAD.maxSize / (1024 * 1024));
            return {
                valid: false,
                error: `File size (${Math.round(file.size / (1024 * 1024))}MB) exceeds maximum limit of ${maxSizeMB}MB`,
                field: 'image'
            };
        }

        // Check file type
        if (!Config.VALIDATION.IMAGE_UPLOAD.allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: 'Unsupported file format. Please use JPG, PNG, GIF, or WebP images.',
                field: 'image'
            };
        }

        return { valid: true, value: file };
    }

    /**
     * Validate banner input
     * @param {string} text - Banner text to validate
     * @returns {Object} Validation result
     */
    static validateBannerText(text) {
        if (!text || typeof text !== 'string') {
            return {
                valid: false,
                error: 'Banner text must be a non-empty string',
                field: 'banner'
            };
        }

        const trimmed = text.trim();
        
        if (trimmed.length === 0) {
            return {
                valid: false,
                error: 'Banner text cannot be empty',
                field: 'banner'
            };
        }

        if (trimmed.length < Config.VALIDATION.BANNER_INPUT.minLength) {
            return {
                valid: false,
                error: `Banner text must be at least ${Config.VALIDATION.BANNER_INPUT.minLength} character(s)`,
                field: 'banner'
            };
        }

        if (trimmed.length > Config.VALIDATION.BANNER_INPUT.maxLength) {
            return {
                valid: false,
                error: `Banner text cannot exceed ${Config.VALIDATION.BANNER_INPUT.maxLength} characters`,
                field: 'banner'
            };
        }

        if (!Config.VALIDATION.BANNER_INPUT.allowedChars.test(trimmed)) {
            return {
                valid: false,
                error: 'Banner text contains invalid characters',
                field: 'banner'
            };
        }

        return { valid: true, value: trimmed };
    }

    /**
     * Validate numeric range
     * @param {number} value - Value to validate
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @param {string} field - Field name for error reporting
     * @returns {Object} Validation result
     */
    static validateRange(value, min, max, field = 'value') {
        if (typeof value !== 'number' || isNaN(value)) {
            return {
                valid: false,
                error: `${field} must be a valid number`,
                field
            };
        }

        if (value < min) {
            return {
                valid: false,
                error: `${field} cannot be less than ${min}`,
                field
            };
        }

        if (value > max) {
            return {
                valid: false,
                error: `${field} cannot be greater than ${max}`,
                field
            };
        }

        return { valid: true, value };
    }

    /**
     * Validate export format
     * @param {string} format - Export format
     * @returns {Object} Validation result
     */
    static validateExportFormat(format) {
        if (!format || typeof format !== 'string') {
            return {
                valid: false,
                error: 'Export format must be specified',
                field: 'format'
            };
        }

        const supportedFormats = Object.keys(Config.EXPORT_FORMATS).map(f => f.toLowerCase());
        const lowerFormat = format.toLowerCase();

        if (!supportedFormats.includes(lowerFormat)) {
            return {
                valid: false,
                error: `Unsupported export format. Supported formats: ${supportedFormats.join(', ')}`,
                field: 'format'
            };
        }

        return { valid: true, value: lowerFormat };
    }

    /**
     * Validate color palette
     * @param {string} palette - Palette identifier
     * @returns {Object} Validation result
     */
    static validatePalette(palette) {
        if (!palette || typeof palette !== 'string') {
            return {
                valid: false,
                error: 'Palette must be specified',
                field: 'palette'
            };
        }

        if (!Config.THEMES.AVAILABLE.includes(palette)) {
            return {
                valid: false,
                error: `Invalid palette. Available palettes: ${Config.THEMES.AVAILABLE.join(', ')}`,
                field: 'palette'
            };
        }

        return { valid: true, value: palette };
    }

    /**
     * Sanitize HTML content
     * @param {string} content - Content to sanitize
     * @returns {string} Sanitized content
     */
    static sanitizeHtml(content) {
        if (typeof content !== 'string') {
            return '';
        }

        // Basic HTML escaping
        return content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    }

    /**
     * Validate batch operation
     * @param {Array} items - Items to validate
     * @param {Function} validator - Validation function
     * @returns {Object} Batch validation result
     */
    static validateBatch(items, validator) {
        if (!Array.isArray(items)) {
            return {
                valid: false,
                error: 'Items must be an array',
                field: 'batch'
            };
        }

        if (items.length === 0) {
            return {
                valid: false,
                error: 'Batch cannot be empty',
                field: 'batch'
            };
        }

        const results = [];
        const errors = [];

        for (let i = 0; i < items.length; i++) {
            const result = validator(items[i], i);
            results.push(result);
            
            if (!result.valid) {
                errors.push({
                    index: i,
                    error: result.error,
                    field: result.field
                });
            }
        }

        return {
            valid: errors.length === 0,
            results,
            errors,
            field: 'batch'
        };
    }
}

/**
 * Error reporter utility
 */
export class ErrorReporter {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
    }

    /**
     * Report an error
     * @param {Error|string} error - Error to report
     * @param {Object} context - Additional context
     */
    report(error, context = {}) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            message: error.message || error,
            type: error.name || 'Error',
            context,
            stack: error.stack || null
        };

        this.errors.unshift(errorEntry);
        
        // Limit error history
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(0, this.maxErrors);
        }

        // Log to console in development
        if (Config.DEV.VERBOSE_LOGGING) {
            console.error('Error reported:', errorEntry);
        }
    }

    /**
     * Get recent errors
     * @param {number} count - Number of errors to return
     * @returns {Array} Recent errors
     */
    getRecentErrors(count = 10) {
        return this.errors.slice(0, count);
    }

    /**
     * Clear error history
     */
    clear() {
        this.errors = [];
    }

    /**
     * Get error statistics
     * @returns {Object} Error statistics
     */
    getStats() {
        const types = {};
        this.errors.forEach(error => {
            types[error.type] = (types[error.type] || 0) + 1;
        });

        return {
            total: this.errors.length,
            types,
            recent: this.getRecentErrors(5)
        };
    }
}

// Create singleton error reporter
export const errorReporter = new ErrorReporter();