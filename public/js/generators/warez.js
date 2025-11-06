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
            },
            cyber: {
                name: 'Cyber',
                topLeft: '◢',
                topRight: '◣',
                bottomLeft: '◥',
                bottomRight: '◤',
                horizontal: '▬',
                vertical: '▐',
                topJunction: '▼',
                bottomJunction: '▲',
                decoration: '▓▒░▒▓',
                separator: '▬'
            },
            neon: {
                name: 'Neon',
                topLeft: '╒',
                topRight: '╕',
                bottomLeft: '╘',
                bottomRight: '╛',
                horizontal: '═',
                vertical: '│',
                topJunction: '╤',
                bottomJunction: '╧',
                decoration: '▓▓░░▓▓',
                separator: '━'
            },
            oldschool: {
                name: 'Old School',
                topLeft: '#',
                topRight: '#',
                bottomLeft: '#',
                bottomRight: '#',
                horizontal: '=',
                vertical: '#',
                topJunction: '#',
                bottomJunction: '#',
                decoration: '-=-',
                separator: '-'
            },
            diamond: {
                name: 'Diamond',
                topLeft: '◆',
                topRight: '◆',
                bottomLeft: '◆',
                bottomRight: '◆',
                horizontal: '◇',
                vertical: '◆',
                topJunction: '◆',
                bottomJunction: '◆',
                decoration: '◇◆◇',
                separator: '◇'
            },
            shadow: {
                name: 'Shadow',
                topLeft: '┏',
                topRight: '┓',
                bottomLeft: '┗',
                bottomRight: '┛',
                horizontal: '━',
                vertical: '┃',
                topJunction: '┳',
                bottomJunction: '┻',
                decoration: '▓▓▒▒░░',
                separator: '─'
            },
            block: {
                name: 'Block',
                topLeft: '█',
                topRight: '█',
                bottomLeft: '█',
                bottomRight: '█',
                horizontal: '█',
                vertical: '█',
                topJunction: '█',
                bottomJunction: '█',
                decoration: '▓▒░',
                separator: '▀'
            },
            wave: {
                name: 'Wave',
                topLeft: '╔',
                topRight: '╗',
                bottomLeft: '╚',
                bottomRight: '╝',
                horizontal: '═',
                vertical: '║',
                topJunction: '╦',
                bottomJunction: '╩',
                decoration: '≈∼≈∼≈',
                separator: '≈'
            },
            star: {
                name: 'Star',
                topLeft: '★',
                topRight: '★',
                bottomLeft: '★',
                bottomRight: '★',
                horizontal: '─',
                vertical: '│',
                topJunction: '★',
                bottomJunction: '★',
                decoration: '★·★·★',
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
                multiline = false,
                textEffect = 'uppercase'
            } = options;

            // Validate input
            const validation = this.validateInput(text, textEffect);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Validate credits text if provided
            if (addCredits && credits) {
                const maxCreditsLength = this.bannerWidth - 4;
                if (credits.length > maxCreditsLength) {
                    throw new Error(`Credits text too long (max ${maxCreditsLength} characters)`);
                }
            }

            // Get style data
            const styleData = this.styles[style] || this.styles.classic;

            // Auto-detect multiline if text contains pipe or newline
            const hasMultilineMarkers = text.includes('|') || text.includes('\n');
            const shouldSplit = multiline || hasMultilineMarkers;

            // Process text (split into lines if multiline)
            const textLines = shouldSplit ? this.splitIntoLines(text) : [text];

            // Build banner
            const banner = this.buildBanner(textLines, styleData, {
                addCredits,
                credits,
                addDate,
                textEffect
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
     * @param {string} textEffect - Text effect to be applied
     * @returns {Object} Validation result
     */
    validateInput(text, textEffect = 'uppercase') {
        if (!text || text.trim().length === 0) {
            return {
                valid: false,
                error: 'Banner text cannot be empty'
            };
        }

        // Calculate maximum text length based on banner width minus borders
        const maxLength = this.bannerWidth - 4; // 2 for borders, 2 for padding

        // For spaced text effect, the effective length is doubled
        let effectiveLength = text.trim().length;
        if (textEffect === 'spaced') {
            effectiveLength = text.trim().length * 2 - 1; // Account for spaces between chars
        }

        if (effectiveLength > maxLength) {
            return {
                valid: false,
                error: `Banner text too long (max ${maxLength} characters${textEffect === 'spaced' ? ' without spacing' : ''})`
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
        // Split by common separators (pipe or newline)
        const lines = text.split(/[|\n]/)
            .map(line => line.trim())
            .filter(line => line.length > 0);

        // Fallback: if all lines are empty after filtering, return original text trimmed
        if (lines.length === 0) {
            const trimmed = text.trim();
            return trimmed.length > 0 ? [trimmed] : ['EMPTY'];
        }

        return lines;
    }

    /**
     * Wrap text to fit within maximum width
     * @param {string} text - Input text
     * @param {number} maxWidth - Maximum width per line
     * @returns {Array<string>} Wrapped text lines
     */
    wrapText(text, maxWidth) {
        if (text.length <= maxWidth) {
            return [text];
        }

        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
            // If adding this word would exceed maxWidth
            if (currentLine.length > 0 && (currentLine + ' ' + word).length > maxWidth) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine += (currentLine.length > 0 ? ' ' : '') + word;
            }
        });

        // Add remaining text
        if (currentLine.length > 0) {
            lines.push(currentLine);
        }

        return lines.length > 0 ? lines : [text];
    }

    /**
     * Apply text effect transformation
     * @param {string} text - Input text
     * @param {string} effect - Effect type
     * @returns {string} Transformed text
     */
    applyTextEffect(text, effect = 'uppercase') {
        switch(effect) {
            case 'leetspeak':
                // Convert to 1337 speak
                return text
                    .replace(/[aA]/g, '4')
                    .replace(/[eE]/g, '3')
                    .replace(/[iI]/g, '1')
                    .replace(/[oO]/g, '0')
                    .replace(/[sS]/g, '5')
                    .replace(/[tT]/g, '7')
                    .toUpperCase();

            case 'alternating':
                // aLtErNaTiNg CaSe
                return text.split('').map((char, index) =>
                    index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
                ).join('');

            case 'spaced':
                // S P A C E D
                return text.toUpperCase().split('').join(' ');

            case 'wide':
                // Full-width characters (Ｗ Ｉ Ｄ Ｅ)
                return text.toUpperCase().split('').map(char => {
                    const code = char.charCodeAt(0);
                    // Convert ASCII to full-width
                    if (code >= 33 && code <= 126) {
                        return String.fromCharCode(code + 65248);
                    }
                    return char;
                }).join('');

            case 'normal':
                // Keep original case
                return text;

            case 'uppercase':
            default:
                // Standard uppercase (default behavior)
                return text.toUpperCase();
        }
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
        const textEffect = options.textEffect || 'uppercase';

        // Top border
        lines.push(this.createTopBorder(style));

        // Decorative header
        lines.push(this.createDecorativeLine(style, true));

        // Empty line for spacing
        lines.push(this.createEmptyLine(style));

        // Main text lines
        textLines.forEach((textLine, index) => {
            lines.push(this.createTextLine(textLine, style, false, textEffect));
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
            lines.push(this.createTextLine(options.credits, style, true, textEffect)); // Small text
            if (options.addDate) {
                const dateStr = new Date().toISOString().split('T')[0];
                lines.push(this.createTextLine(dateStr, style, true, 'normal')); // Keep date normal
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
     * @param {string} textEffect - Text effect to apply
     * @returns {string} Text line
     */
    createTextLine(text, style, isSmall = false, textEffect = 'uppercase') {
        const innerWidth = this.bannerWidth - 2;

        // Apply text effect
        const cleanText = this.applyTextEffect(text.trim(), textEffect);

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
