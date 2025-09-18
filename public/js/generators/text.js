/**
 * ASCII Art Studio - Text Generator
 * Converts text to ASCII art using various font styles
 */

import { Config, FontConfig } from '../config.js';

export class TextGenerator {
    constructor() {
        this.fonts = new Map();
        this.loadBuiltInFonts();
    }

    /**
     * Generate ASCII art from text
     * @param {string} text - Input text
     * @param {Object} options - Generation options
     * @returns {string} ASCII art
     */
    async generate(text, options = {}) {
        try {
            const {
                font = 'standard',
                spacing = 'normal',
                width = null,
                alignment = 'left'
            } = options;

            // Validate input
            const validation = this.validateInput(text);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Get font data
            const fontData = this.fonts.get(font) || this.fonts.get('standard');
            if (!fontData) {
                throw new Error(`Font '${font}' not found`);
            }

            // Convert text to ASCII
            const lines = this.convertTextToAscii(text, fontData, spacing);
            
            // Apply formatting
            const formatted = this.formatOutput(lines, { width, alignment });
            
            return formatted;
        } catch (error) {
            console.error('Text generation failed:', error);
            throw error;
        }
    }

    /**
     * Convert text to ASCII using font data
     * @param {string} text - Input text
     * @param {Object} fontData - Font character data
     * @param {string} spacing - Character spacing
     * @returns {Array<string>} ASCII lines
     */
    convertTextToAscii(text, fontData, spacing) {
        const cleanText = text.toUpperCase().trim();
        const spaceWidth = spacing === 'wide' ? 2 : spacing === 'narrow' ? 0 : 1;
        const result = [];

        // Initialize result array with empty strings for each line of the font
        for (let i = 0; i < fontData.height; i++) {
            result[i] = '';
        }

        // Process each character
        for (let charIndex = 0; charIndex < cleanText.length; charIndex++) {
            const char = cleanText[charIndex];
            const charData = this.getCharacterData(char, fontData);

            // Add character to each line
            for (let lineIndex = 0; lineIndex < fontData.height; lineIndex++) {
                if (charIndex > 0) {
                    // Add spacing between characters
                    result[lineIndex] += ' '.repeat(spaceWidth);
                }
                result[lineIndex] += charData[lineIndex] || ' '.repeat(charData[0]?.length || 7);
            }
        }

        return result;
    }

    /**
     * Get character data from font, with fallback
     * @param {string} char - Character to get
     * @param {Object} fontData - Font data
     * @returns {Array<string>} Character ASCII lines
     */
    getCharacterData(char, fontData) {
        if (char === ' ') {
            return Array(fontData.height).fill('   '); // 3-space width for space character
        }

        if (fontData.chars[char]) {
            return fontData.chars[char];
        }

        // Fallback to a simple block representation
        return this.createFallbackChar(fontData.height);
    }

    /**
     * Create fallback character representation
     * @param {number} height - Font height
     * @returns {Array<string>} Fallback character
     */
    createFallbackChar(height) {
        const width = 7;
        const result = [];
        
        for (let i = 0; i < height; i++) {
            if (i === 0 || i === height - 1) {
                result[i] = '█'.repeat(width);
            } else {
                result[i] = '█' + ' '.repeat(width - 2) + '█';
            }
        }
        
        return result;
    }

    /**
     * Format output with width and alignment
     * @param {Array<string>} lines - ASCII lines
     * @param {Object} options - Formatting options
     * @returns {string} Formatted ASCII art
     */
    formatOutput(lines, options) {
        const { width, alignment } = options;
        let formattedLines = [...lines];

        if (width && width > 0) {
            formattedLines = this.applyWidth(formattedLines, width);
        }

        if (alignment && alignment !== 'left') {
            formattedLines = this.applyAlignment(formattedLines, alignment, width);
        }

        return formattedLines.join('\n');
    }

    /**
     * Apply width constraints to lines
     * @param {Array<string>} lines - ASCII lines
     * @param {number} width - Target width
     * @returns {Array<string>} Width-constrained lines
     */
    applyWidth(lines, width) {
        return lines.map(line => {
            if (line.length > width) {
                return line.substring(0, width);
            }
            return line;
        });
    }

    /**
     * Apply text alignment
     * @param {Array<string>} lines - ASCII lines
     * @param {string} alignment - Alignment type
     * @param {number} width - Container width
     * @returns {Array<string>} Aligned lines
     */
    applyAlignment(lines, alignment, width) {
        if (!width) {
            return lines; // Can't align without width
        }

        return lines.map(line => {
            const padding = width - line.length;
            if (padding <= 0) return line;

            switch (alignment) {
                case 'center':
                    const leftPad = Math.floor(padding / 2);
                    const rightPad = padding - leftPad;
                    return ' '.repeat(leftPad) + line + ' '.repeat(rightPad);
                case 'right':
                    return ' '.repeat(padding) + line;
                default:
                    return line;
            }
        });
    }

    /**
     * Validate input text
     * @param {string} text - Input text
     * @returns {Object} Validation result
     */
    validateInput(text) {
        if (!text || typeof text !== 'string') {
            return { valid: false, error: 'Input must be a non-empty string' };
        }

        if (text.trim().length === 0) {
            return { valid: false, error: 'Input cannot be empty' };
        }

        if (text.length > Config.VALIDATION.TEXT_INPUT.maxLength) {
            return { valid: false, error: `Input exceeds maximum length of ${Config.VALIDATION.TEXT_INPUT.maxLength}` };
        }

        if (!Config.VALIDATION.TEXT_INPUT.allowedChars.test(text)) {
            return { valid: false, error: 'Input contains invalid characters' };
        }

        return { valid: true };
    }

    /**
     * Get available fonts
     * @returns {Array} Available font list
     */
    getAvailableFonts() {
        return Array.from(this.fonts.keys()).map(id => ({
            id,
            name: this.formatFontName(id),
            height: this.fonts.get(id).height,
            preview: this.generatePreview(id)
        }));
    }

    /**
     * Format font name for display
     * @param {string} fontId - Font identifier
     * @returns {string} Formatted name
     */
    formatFontName(fontId) {
        return fontId.charAt(0).toUpperCase() + fontId.slice(1).replace(/[_-]/g, ' ');
    }

    /**
     * Generate font preview
     * @param {string} fontId - Font identifier
     * @returns {string} Preview text
     */
    generatePreview(fontId) {
        try {
            return this.generate('ABC', { font: fontId });
        } catch (error) {
            return 'Preview unavailable';
        }
    }

    /**
     * Load built-in fonts
     */
    loadBuiltInFonts() {
        // Standard font - compact and readable
        this.fonts.set('standard', {
            height: 6,
            chars: {
                'A': [
                    '  ███  ',
                    ' █   █ ',
                    '███████',
                    '█     █',
                    '█     █',
                    '█     █'
                ],
                'B': [
                    '██████ ',
                    '█     █',
                    '██████ ',
                    '█     █',
                    '█     █',
                    '██████ '
                ],
                'C': [
                    ' ██████',
                    '█      ',
                    '█      ',
                    '█      ',
                    '█      ',
                    ' ██████'
                ],
                'D': [
                    '██████ ',
                    '█     █',
                    '█     █',
                    '█     █',
                    '█     █',
                    '██████ '
                ],
                'E': [
                    '███████',
                    '█      ',
                    '██████ ',
                    '█      ',
                    '█      ',
                    '███████'
                ],
                'F': [
                    '███████',
                    '█      ',
                    '██████ ',
                    '█      ',
                    '█      ',
                    '█      '
                ],
                'G': [
                    ' ██████',
                    '█      ',
                    '█  ████',
                    '█     █',
                    '█     █',
                    ' ██████'
                ],
                'H': [
                    '█     █',
                    '█     █',
                    '███████',
                    '█     █',
                    '█     █',
                    '█     █'
                ],
                'I': [
                    '███████',
                    '   █   ',
                    '   █   ',
                    '   █   ',
                    '   █   ',
                    '███████'
                ],
                'J': [
                    '███████',
                    '      █',
                    '      █',
                    '      █',
                    '█     █',
                    ' █████ '
                ],
                'K': [
                    '█     █',
                    '█   █  ',
                    '█ █    ',
                    '██     ',
                    '█ █    ',
                    '█   █  '
                ],
                'L': [
                    '█      ',
                    '█      ',
                    '█      ',
                    '█      ',
                    '█      ',
                    '███████'
                ],
                'M': [
                    '█     █',
                    '██   ██',
                    '█ █ █ █',
                    '█  █  █',
                    '█     █',
                    '█     █'
                ],
                'N': [
                    '█     █',
                    '██    █',
                    '█ █   █',
                    '█  █  █',
                    '█   █ █',
                    '█    ██'
                ],
                'O': [
                    ' █████ ',
                    '█     █',
                    '█     █',
                    '█     █',
                    '█     █',
                    ' █████ '
                ],
                'P': [
                    '██████ ',
                    '█     █',
                    '██████ ',
                    '█      ',
                    '█      ',
                    '█      '
                ],
                'Q': [
                    ' █████ ',
                    '█     █',
                    '█     █',
                    '█   █ █',
                    '█    █ ',
                    ' ████ █'
                ],
                'R': [
                    '██████ ',
                    '█     █',
                    '██████ ',
                    '█   █  ',
                    '█    █ ',
                    '█     █'
                ],
                'S': [
                    ' ██████',
                    '█      ',
                    ' █████ ',
                    '      █',
                    '      █',
                    '██████ '
                ],
                'T': [
                    '███████',
                    '   █   ',
                    '   █   ',
                    '   █   ',
                    '   █   ',
                    '   █   '
                ],
                'U': [
                    '█     █',
                    '█     █',
                    '█     █',
                    '█     █',
                    '█     █',
                    ' █████ '
                ],
                'V': [
                    '█     █',
                    '█     █',
                    '█     █',
                    ' █   █ ',
                    '  █ █  ',
                    '   █   '
                ],
                'W': [
                    '█     █',
                    '█     █',
                    '█  █  █',
                    '█ █ █ █',
                    '██   ██',
                    '█     █'
                ],
                'X': [
                    '█     █',
                    ' █   █ ',
                    '  █ █  ',
                    '   █   ',
                    '  █ █  ',
                    ' █   █ '
                ],
                'Y': [
                    '█     █',
                    ' █   █ ',
                    '  █ █  ',
                    '   █   ',
                    '   █   ',
                    '   █   '
                ],
                'Z': [
                    '███████',
                    '     █ ',
                    '    █  ',
                    '   █   ',
                    '  █    ',
                    '███████'
                ],
                '0': [
                    ' █████ ',
                    '█     █',
                    '█    ██',
                    '█  █  █',
                    '██    █',
                    ' █████ '
                ],
                '1': [
                    '   █   ',
                    '  ██   ',
                    '   █   ',
                    '   █   ',
                    '   █   ',
                    ' █████ '
                ],
                '2': [
                    ' █████ ',
                    '█     █',
                    '     █ ',
                    '   ██  ',
                    ' █     ',
                    '███████'
                ],
                '3': [
                    ' █████ ',
                    '█     █',
                    '   ███ ',
                    '      █',
                    '█     █',
                    ' █████ '
                ],
                '4': [
                    '█     █',
                    '█     █',
                    '███████',
                    '      █',
                    '      █',
                    '      █'
                ],
                '5': [
                    '███████',
                    '█      ',
                    '██████ ',
                    '      █',
                    '█     █',
                    ' █████ '
                ],
                '6': [
                    ' █████ ',
                    '█      ',
                    '██████ ',
                    '█     █',
                    '█     █',
                    ' █████ '
                ],
                '7': [
                    '███████',
                    '      █',
                    '     █ ',
                    '    █  ',
                    '   █   ',
                    '  █    '
                ],
                '8': [
                    ' █████ ',
                    '█     █',
                    ' █████ ',
                    '█     █',
                    '█     █',
                    ' █████ '
                ],
                '9': [
                    ' █████ ',
                    '█     █',
                    ' ██████',
                    '      █',
                    '      █',
                    ' █████ '
                ],
                '!': [
                    '   █   ',
                    '   █   ',
                    '   █   ',
                    '   █   ',
                    '       ',
                    '   █   '
                ],
                '?': [
                    ' █████ ',
                    '█     █',
                    '    ██ ',
                    '   █   ',
                    '       ',
                    '   █   '
                ],
                '.': [
                    '       ',
                    '       ',
                    '       ',
                    '       ',
                    '       ',
                    '   █   '
                ],
                ',': [
                    '       ',
                    '       ',
                    '       ',
                    '       ',
                    '   █   ',
                    '  █    '
                ]
            }
        });

        // Small font - compact version
        this.fonts.set('small', {
            height: 4,
            chars: {
                'A': [' ██ ', '█  █', '████', '█  █'],
                'B': ['███ ', '█  █', '███ ', '█  █'],
                'C': ['████', '█   ', '█   ', '████'],
                'D': ['███ ', '█  █', '█  █', '███ '],
                'E': ['████', '█   ', '███ ', '████'],
                'F': ['████', '█   ', '███ ', '█   '],
                'G': ['████', '█   ', '█ ██', '████'],
                'H': ['█  █', '█  █', '████', '█  █'],
                'I': ['███ ', ' █  ', ' █  ', '███ '],
                'J': ['████', '   █', '█  █', '███ '],
                'K': ['█  █', '█ █ ', '██  ', '█ █ '],
                'L': ['█   ', '█   ', '█   ', '████'],
                'M': ['█  █', '████', '█  █', '█  █'],
                'N': ['█  █', '██ █', '█ ██', '█  █'],
                'O': ['███ ', '█  █', '█  █', '███ '],
                'P': ['███ ', '█  █', '███ ', '█   '],
                'Q': ['███ ', '█  █', '█ ██', '████'],
                'R': ['███ ', '█  █', '███ ', '█  █'],
                'S': ['████', '█   ', ' ███', '████'],
                'T': ['███ ', ' █  ', ' █  ', ' █  '],
                'U': ['█  █', '█  █', '█  █', '███ '],
                'V': ['█  █', '█  █', '█  █', ' ██ '],
                'W': ['█  █', '█  █', '████', '█  █'],
                'X': ['█  █', ' ██ ', ' ██ ', '█  █'],
                'Y': ['█  █', ' ██ ', ' █  ', ' █  '],
                'Z': ['████', '  █ ', ' █  ', '████'],
                '0': ['███ ', '█  █', '█  █', '███ '],
                '1': [' █  ', '██  ', ' █  ', '███ '],
                '2': ['███ ', '  █ ', ' █  ', '████'],
                '3': ['███ ', ' ██ ', '  █ ', '███ '],
                '4': ['█  █', '████', '   █', '   █'],
                '5': ['████', '███ ', '  █ ', '███ '],
                '6': ['███ ', '█   ', '███ ', '███ '],
                '7': ['████', '  █ ', ' █  ', '█   '],
                '8': ['███ ', '███ ', '█  █', '███ '],
                '9': ['███ ', '███ ', '  █ ', '███ '],
                '!': [' █  ', ' █  ', '    ', ' █  '],
                '?': ['███ ', ' ██ ', '    ', ' █  '],
                '.': ['    ', '    ', '    ', ' █  '],
                ',': ['    ', '    ', ' █  ', '█   ']
            }
        });

        // Big font - larger version
        this.fonts.set('big', {
            height: 8,
            chars: {
                'A': ['    ███    ', '   █   █   ', '  █     █  ', ' █       █ ', '███████████', '█         █', '█         █', '█         █'],
                'B': ['██████████ ', '█         █', '█         █', '██████████ ', '██████████ ', '█         █', '█         █', '██████████ '],
                'C': [' ██████████', '█          ', '█          ', '█          ', '█          ', '█          ', '█          ', ' ██████████'],
                'D': ['██████████ ', '█         █', '█         █', '█         █', '█         █', '█         █', '█         █', '██████████ '],
                'E': ['███████████', '█          ', '█          ', '███████████', '███████████', '█          ', '█          ', '███████████'],
                'F': ['███████████', '█          ', '█          ', '███████████', '███████████', '█          ', '█          ', '█          '],
                'G': [' ██████████', '█          ', '█          ', '█    ███████', '█         █', '█         █', '█         █', ' ██████████'],
                'H': ['█         █', '█         █', '█         █', '███████████', '███████████', '█         █', '█         █', '█         █'],
                'I': ['███████████', '     █     ', '     █     ', '     █     ', '     █     ', '     █     ', '     █     ', '███████████'],
                'J': ['███████████', '          █', '          █', '          █', '          █', '█         █', '█         █', ' █████████ '],
                'K': ['█         █', '█       █  ', '█     █    ', '█   █      ', '█ █        ', '█   █      ', '█     █    ', '█       █  '],
                'L': ['█          ', '█          ', '█          ', '█          ', '█          ', '█          ', '█          ', '███████████'],
                'M': ['█         █', '██       ██', '█ █     █ █', '█  █   █  █', '█   █ █   █', '█    █    █', '█         █', '█         █'],
                'N': ['█         █', '██        █', '█ █       █', '█  █      █', '█   █     █', '█    █    █', '█     █   █', '█      █  █'],
                'O': [' █████████ ', '█         █', '█         █', '█         █', '█         █', '█         █', '█         █', ' █████████ '],
                'P': ['██████████ ', '█         █', '█         █', '██████████ ', '█          ', '█          ', '█          ', '█          '],
                'Q': [' █████████ ', '█         █', '█         █', '█         █', '█       █ █', '█        █ ', '█         █', ' ████████ █'],
                'R': ['██████████ ', '█         █', '█         █', '██████████ ', '█       █  ', '█        █ ', '█         █', '█         █'],
                'S': [' ██████████', '█          ', '█          ', ' █████████ ', '          █', '          █', '          █', '██████████ '],
                'T': ['███████████', '     █     ', '     █     ', '     █     ', '     █     ', '     █     ', '     █     ', '     █     '],
                'U': ['█         █', '█         █', '█         █', '█         █', '█         █', '█         █', '█         █', ' █████████ '],
                'V': ['█         █', '█         █', '█         █', ' █       █ ', '  █     █  ', '   █   █   ', '    █ █    ', '     █     '],
                'W': ['█         █', '█         █', '█    █    █', '█   █ █   █', '█  █   █  █', '█ █     █ █', '██       ██', '█         █'],
                'X': ['█         █', ' █       █ ', '  █     █  ', '   █   █   ', '    █ █    ', '   █   █   ', '  █     █  ', ' █       █ '],
                'Y': ['█         █', ' █       █ ', '  █     █  ', '   █   █   ', '    █ █    ', '     █     ', '     █     ', '     █     '],
                'Z': ['███████████', '         █ ', '        █  ', '      █    ', '    █      ', '  █        ', ' █         ', '███████████'],
                '0': [' █████████ ', '█         █', '█        ██', '█      █  █', '█    █    █', '█  █      █', '██        █', ' █████████ '],
                '1': ['     █     ', '    ██     ', '     █     ', '     █     ', '     █     ', '     █     ', '     █     ', ' █████████ '],
                '2': [' █████████ ', '█         █', '          █', '        ██ ', '      █    ', '    █      ', '  █        ', '███████████'],
                '3': [' █████████ ', '█         █', '          █', '     ██████', '          █', '          █', '█         █', ' █████████ '],
                '4': ['█         █', '█         █', '█         █', '███████████', '          █', '          █', '          █', '          █'],
                '5': ['███████████', '█          ', '█          ', '██████████ ', '          █', '          █', '█         █', ' █████████ '],
                '6': [' █████████ ', '█         █', '█          ', '██████████ ', '█         █', '█         █', '█         █', ' █████████ '],
                '7': ['███████████', '          █', '         █ ', '        █  ', '      █    ', '    █      ', '  █        ', ' █         '],
                '8': [' █████████ ', '█         █', '█         █', ' █████████ ', '█         █', '█         █', '█         █', ' █████████ '],
                '9': [' █████████ ', '█         █', '█         █', ' ██████████', '          █', '          █', '          █', ' █████████ '],
                '!': ['     █     ', '     █     ', '     █     ', '     █     ', '     █     ', '           ', '           ', '     █     '],
                '?': [' █████████ ', '█         █', '          █', '       ███ ', '     █     ', '           ', '           ', '     █     '],
                '.': ['           ', '           ', '           ', '           ', '           ', '           ', '           ', '     █     '],
                ',': ['           ', '           ', '           ', '           ', '           ', '     █     ', '    █      ', '           ']
            }
        });
    }

    /**
     * Add custom font
     * @param {string} id - Font identifier
     * @param {Object} fontData - Font data
     */
    addFont(id, fontData) {
        if (!fontData.height || !fontData.chars) {
            throw new Error('Invalid font data format');
        }
        this.fonts.set(id, fontData);
    }

    /**
     * Remove font
     * @param {string} id - Font identifier
     */
    removeFont(id) {
        if (id === 'standard') {
            throw new Error('Cannot remove standard font');
        }
        return this.fonts.delete(id);
    }
}