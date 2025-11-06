/**
 * ASCII Art Studio - Warez Banner Generator
 * Creates retro-style warez scene banners with borders and decorative elements
 */

import { Config } from '../config.js';

export class WarezGenerator {
    constructor() {
        this.bannerWidth = Config.LIMITS.BANNER_WIDTH || 78;
        this.styles = this.initializeStyles();
    }

    /**
     * Initialize banner styles with border characters and decorations
     */
    initializeStyles() {
        return {
            classic: {
                name: 'Classic',
                topLeft: '╔',
                topRight: '╗',
                bottomLeft: '╚',
                bottomRight: '╝',
                horizontal: '═',
                vertical: '║',
                topJunction: '╦',
                bottomJunction: '╩',
                decoration: '░▒▓',
                separator: '═'
            },
            elite: {
                name: 'Elite',
                topLeft: '┌',
                topRight: '┐',
                bottomLeft: '└',
                bottomRight: '┘',
                horizontal: '─',
                vertical: '│',
                topJunction: '┬',
                bottomJunction: '┴',
                decoration: '─═─',
                separator: '─'
            },
            minimal: {
                name: 'Minimal',
                topLeft: '+',
                topRight: '+',
                bottomLeft: '+',
                bottomRight: '+',
                horizontal: '-',
                vertical: '|',
                topJunction: '+',
                bottomJunction: '+',
                decoration: '-*-',
                separator: '-'
            },
            graffiti: {
                name: 'Graffiti',
                topLeft: '▄',
                topRight: '▄',
                bottomLeft: '▀',
                bottomRight: '▀',
                horizontal: '▀',
                vertical: '█',
                topJunction: '▄',
                bottomJunction: '▀',
                decoration: '▓▒░',
                separator: '▀'
            },
            matrix: {
                name: 'Matrix',
                topLeft: '╭',
                topRight: '╮',
                bottomLeft: '╰',
                bottomRight: '╯',
                horizontal: '─',
                vertical: '│',
                topJunction: '┬',
                bottomJunction: '┴',
                decoration: '...',
                separator: '·'
            }
        };
    }

    /**
     * Generate a warez banner
     * @param {string} text - Banner text
     * @param {Object} options - Generation options
     * @returns {Promise<string>} ASCII banner
     */
    async generate(text, options = {}) {
        try {
            const {
                style = 'classic',
                addCredits = false,
                credits = 'ASCII ART STUDIO',
                addDate = false,
                multiline = false
            } = options;

            // Validate input
            const validation = this.validateInput(text);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Get style data
            const styleData = this.styles[style] || this.styles.classic;

            // Process text (split into lines if multiline)
            const textLines = multiline ? this.splitIntoLines(text) : [text];

            // Build banner
            const banner = this.buildBanner(textLines, styleData, {
                addCredits,
                credits,
                addDate
            });

            return banner;
        } catch (error) {
            console.error('Warez banner generation failed:', error);
            throw error;
        }
    }

    /**
     * Validate banner input
     * @param {string} text - Input text
     * @returns {Object} Validation result
     */
    validateInput(text) {
        if (!text || text.trim().length === 0) {
            return {
                valid: false,
                error: 'Banner text cannot be empty'
            };
        }

        if (text.length > 50) {
            return {
                valid: false,
                error: 'Banner text too long (max 50 characters)'
            };
        }

        return { valid: true };
    }

    /**
     * Split text into multiple lines (for multiline banners)
     * @param {string} text - Input text
     * @returns {Array<string>} Text lines
     */
    splitIntoLines(text) {
        // Split by common separators
        const lines = text.split(/[|\n]/).map(line => line.trim()).filter(line => line.length > 0);
        return lines.length > 0 ? lines : [text];
    }

    /**
     * Build the complete banner
     * @param {Array<string>} textLines - Lines of text
     * @param {Object} style - Style data
     * @param {Object} options - Additional options
     * @returns {string} Complete banner
     */
    buildBanner(textLines, style, options) {
        const lines = [];
        const innerWidth = this.bannerWidth - 2; // Account for border characters

        // Top border
        lines.push(this.createTopBorder(style));

        // Decorative header
        lines.push(this.createDecorativeLine(style, true));

        // Empty line for spacing
        lines.push(this.createEmptyLine(style));

        // Main text lines
        textLines.forEach((textLine, index) => {
            lines.push(this.createTextLine(textLine, style));
            // Add spacing between multiple lines
            if (index < textLines.length - 1) {
                lines.push(this.createEmptyLine(style));
            }
        });

        // Empty line for spacing
        lines.push(this.createEmptyLine(style));

        // Credits section if enabled
        if (options.addCredits && options.credits) {
            lines.push(this.createSeparatorLine(style));
            lines.push(this.createTextLine(options.credits, style, true)); // Small text
            if (options.addDate) {
                const dateStr = new Date().toISOString().split('T')[0];
                lines.push(this.createTextLine(dateStr, style, true));
            }
            lines.push(this.createEmptyLine(style));
        }

        // Decorative footer
        lines.push(this.createDecorativeLine(style, false));

        // Bottom border
        lines.push(this.createBottomBorder(style));

        return lines.join('\n');
    }

    /**
     * Create top border line
     * @param {Object} style - Style data
     * @returns {string} Border line
     */
    createTopBorder(style) {
        const innerWidth = this.bannerWidth - 2;
        return style.topLeft + style.horizontal.repeat(innerWidth) + style.topRight;
    }

    /**
     * Create bottom border line
     * @param {Object} style - Style data
     * @returns {string} Border line
     */
    createBottomBorder(style) {
        const innerWidth = this.bannerWidth - 2;
        return style.bottomLeft + style.horizontal.repeat(innerWidth) + style.bottomRight;
    }

    /**
     * Create decorative line
     * @param {Object} style - Style data
     * @param {boolean} isTop - Is this the top decoration
     * @returns {string} Decorative line
     */
    createDecorativeLine(style, isTop = true) {
        const innerWidth = this.bannerWidth - 2;
        const decoration = style.decoration;

        // Create repeating pattern
        let pattern = '';
        while (pattern.length < innerWidth) {
            pattern += decoration;
        }
        pattern = pattern.substring(0, innerWidth);

        return style.vertical + pattern + style.vertical;
    }

    /**
     * Create separator line
     * @param {Object} style - Style data
     * @returns {string} Separator line
     */
    createSeparatorLine(style) {
        const innerWidth = this.bannerWidth - 2;
        return style.vertical + style.separator.repeat(innerWidth) + style.vertical;
    }

    /**
     * Create empty line with borders
     * @param {Object} style - Style data
     * @returns {string} Empty line
     */
    createEmptyLine(style) {
        const innerWidth = this.bannerWidth - 2;
        return style.vertical + ' '.repeat(innerWidth) + style.vertical;
    }

    /**
     * Create text line with centered text
     * @param {string} text - Text content
     * @param {Object} style - Style data
     * @param {boolean} isSmall - Use smaller text
     * @returns {string} Text line
     */
    createTextLine(text, style, isSmall = false) {
        const innerWidth = this.bannerWidth - 2;
        const cleanText = text.trim().toUpperCase();

        // Center the text
        const padding = Math.max(0, Math.floor((innerWidth - cleanText.length) / 2));
        const rightPadding = Math.max(0, innerWidth - cleanText.length - padding);

        const centeredText = ' '.repeat(padding) + cleanText + ' '.repeat(rightPadding);

        return style.vertical + centeredText + style.vertical;
    }

    /**
     * Get available styles
     * @returns {Array<string>} Style names
     */
    getAvailableStyles() {
        return Object.keys(this.styles);
    }

    /**
     * Get style info
     * @param {string} styleName - Style name
     * @returns {Object} Style information
     */
    getStyleInfo(styleName) {
        const style = this.styles[styleName];
        if (!style) return null;

        return {
            name: style.name,
            preview: this.createPreview(style)
        };
    }

    /**
     * Create a small preview of a style
     * @param {Object} style - Style data
     * @returns {string} Preview
     */
    createPreview(style) {
        const width = 30;
        const innerWidth = width - 2;
        const lines = [];

        lines.push(style.topLeft + style.horizontal.repeat(innerWidth) + style.topRight);
        lines.push(style.vertical + ' '.repeat(innerWidth) + style.vertical);
        lines.push(style.bottomLeft + style.horizontal.repeat(innerWidth) + style.bottomRight);

        return lines.join('\n');
    }
}
