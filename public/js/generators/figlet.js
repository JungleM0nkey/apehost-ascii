/**
 * ASCII Art Studio - FIGlet Generator
 * Generates FIG

let-style text art with various fonts
 */

import { Config } from '../config.js';

export class FigletGenerator {
    constructor() {
        this.fonts = new Map();
        this.loadBuiltInFonts();
    }

    /**
     * Generate FIGlet art from text
     * @param {string} text - Input text
     * @param {Object} options - Generation options
     * @returns {Promise<string>} FIGlet art
     */
    async generate(text, options = {}) {
        try {
            const {
                font = 'standard',
                horizontalLayout = 'default',
                verticalLayout = 'default'
            } = options;

            // Validate input
            const validation = this.validateInput(text);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Get font data
            const fontData = this.fonts.get(font);
            if (!fontData) {
                throw new Error(`Font '${font}' not found`);
            }

            // Convert text to FIGlet
            const figletArt = this.convertTextToFiglet(text, fontData, options);

            return figletArt;
        } catch (error) {
            console.error('FIGlet generation failed:', error);
            throw error;
        }
    }

    /**
     * Convert text to FIGlet using font data
     * @param {string} text - Input text
     * @param {Object} fontData - Font character data
     * @param {Object} options - Generation options
     * @returns {string} FIGlet art
     */
    convertTextToFiglet(text, fontData, options) {
        const cleanText = text.toUpperCase().trim();
        const lines = Array(fontData.height).fill('');

        for (let i = 0; i < cleanText.length; i++) {
            const char = cleanText[i];
            const charLines = this.getCharacterLines(char, fontData);

            // Add character to each line with optional kerning
            for (let lineIdx = 0; lineIdx < fontData.height; lineIdx++) {
                if (i > 0 && options.horizontalLayout !== 'full') {
                    // Apply kerning between characters
                    const overlap = this.calculateKerning(
                        lines[lineIdx],
                        charLines[lineIdx],
                        fontData
                    );
                    if (overlap > 0) {
                        lines[lineIdx] = lines[lineIdx].slice(0, -overlap);
                    }
                }
                lines[lineIdx] += charLines[lineIdx];
            }
        }

        return lines.join('\n');
    }

    /**
     * Get character lines from font
     * @param {string} char - Character
     * @param {Object} fontData - Font data
     * @returns {Array<string>} Character lines
     */
    getCharacterLines(char, fontData) {
        if (char === ' ') {
            return Array(fontData.height).fill('  ');
        }

        if (fontData.chars[char]) {
            return fontData.chars[char];
        }

        // Fallback to question mark
        if (fontData.chars['?']) {
            return fontData.chars['?'];
        }

        // Ultimate fallback
        return Array(fontData.height).fill('█ ');
    }

    /**
     * Calculate kerning between two character lines
     * @param {string} leftLine - Left character line
     * @param {string} rightLine - Right character line
     * @param {Object} fontData - Font data
     * @returns {number} Overlap amount
     */
    calculateKerning(leftLine, rightLine, fontData) {
        const hardblank = fontData.hardblank || '$';
        let maxOverlap = 0;

        // Try different overlap amounts
        for (let overlap = 1; overlap <= 2; overlap++) {
            if (overlap >= rightLine.length) break;

            const leftEnd = leftLine.slice(-overlap);
            const rightStart = rightLine.slice(0, overlap);

            // Check if overlap is safe (no collision)
            let canOverlap = true;
            for (let i = 0; i < overlap; i++) {
                const leftChar = leftEnd[i];
                const rightChar = rightStart[i];

                // Don't overlap if both positions have visible characters
                if (leftChar !== ' ' && leftChar !== hardblank &&
                    rightChar !== ' ' && rightChar !== hardblank) {
                    canOverlap = false;
                    break;
                }
            }

            if (canOverlap) {
                maxOverlap = overlap;
            }
        }

        return maxOverlap;
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
            height: this.fonts.get(id).height
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
     * Load built-in FIGlet fonts
     */
    loadBuiltInFonts() {
        // Standard FIGlet font
        this.fonts.set('standard', {
            height: 6,
            hardblank: '$',
            chars: {
                'A': [
                    '    ___    ',
                    '   /   \\   ',
                    '  / ___ \\  ',
                    ' / /   \\ \\ ',
                    '/_/     \\_\\',
                    '           '
                ],
                'B': [
                    ' ____  ',
                    '|  _ \\ ',
                    '| |_) |',
                    '|  _ < ',
                    '| |_) |',
                    '|____/ '
                ],
                'C': [
                    '  ____ ',
                    ' / ___|',
                    '| |    ',
                    '| |    ',
                    '| |___ ',
                    ' \\____|'
                ],
                'D': [
                    ' ____  ',
                    '|  _ \\ ',
                    '| | | |',
                    '| | | |',
                    '| |_| |',
                    '|____/ '
                ],
                'E': [
                    ' _____ ',
                    '| ____|',
                    '|  _|  ',
                    '| |___ ',
                    '|_____|',
                    '       '
                ],
                'F': [
                    ' _____ ',
                    '|  ___|',
                    '| |_   ',
                    '|  _|  ',
                    '| |    ',
                    '|_|    '
                ],
                'G': [
                    '  ____ ',
                    ' / ___|',
                    '| |  _ ',
                    '| |_| |',
                    ' \\____|',
                    '       '
                ],
                'H': [
                    ' _   _ ',
                    '| | | |',
                    '| |_| |',
                    '|  _  |',
                    '| | | |',
                    '|_| |_|'
                ],
                'I': [
                    ' ___ ',
                    '|_ _|',
                    ' | | ',
                    ' | | ',
                    '|___|',
                    '     '
                ],
                'J': [
                    '     _ ',
                    '    | |',
                    '    | |',
                    ' _  | |',
                    '| |_| |',
                    ' \\___/ '
                ],
                'K': [
                    ' _  __',
                    '| |/ /',
                    '| \' / ',
                    '| . \\ ',
                    '| |\\  \\',
                    '|_| \\_|'
                ],
                'L': [
                    ' _     ',
                    '| |    ',
                    '| |    ',
                    '| |    ',
                    '| |___ ',
                    '|_____|'
                ],
                'M': [
                    ' __  __ ',
                    '|  \\/  |',
                    '| |\\/| |',
                    '| |  | |',
                    '| |  | |',
                    '|_|  |_|'
                ],
                'N': [
                    ' _   _ ',
                    '| \\ | |',
                    '|  \\| |',
                    '| |\\  |',
                    '| | \\ |',
                    '|_|  \\_|'
                ],
                'O': [
                    '  ___  ',
                    ' / _ \\ ',
                    '| | | |',
                    '| | | |',
                    '| |_| |',
                    ' \\___/ '
                ],
                'P': [
                    ' ____  ',
                    '|  _ \\ ',
                    '| |_) |',
                    '|  __/ ',
                    '| |    ',
                    '|_|    '
                ],
                'Q': [
                    '  ___  ',
                    ' / _ \\ ',
                    '| | | |',
                    '| |_| |',
                    ' \\__  |',
                    '    |_|'
                ],
                'R': [
                    ' ____  ',
                    '|  _ \\ ',
                    '| |_) |',
                    '|  _ < ',
                    '| | \\ \\',
                    '|_|  \\_|'
                ],
                'S': [
                    ' ____  ',
                    '/ ___| ',
                    '\\___ \\ ',
                    ' ___) |',
                    '|____/ ',
                    '       '
                ],
                'T': [
                    ' _____ ',
                    '|_   _|',
                    '  | |  ',
                    '  | |  ',
                    '  | |  ',
                    '  |_|  '
                ],
                'U': [
                    ' _   _ ',
                    '| | | |',
                    '| | | |',
                    '| | | |',
                    '| |_| |',
                    ' \\___/ '
                ],
                'V': [
                    '__     __',
                    '\\ \\   / /',
                    ' \\ \\ / / ',
                    '  \\ V /  ',
                    '   \\_/   ',
                    '         '
                ],
                'W': [
                    '__        __',
                    '\\ \\      / /',
                    ' \\ \\ /\\ / / ',
                    '  \\ V  V /  ',
                    '   \\_/\\_/   ',
                    '            '
                ],
                'X': [
                    '__  __',
                    '\\ \\/ /',
                    ' \\  / ',
                    ' /  \\ ',
                    '/_/\\_\\',
                    '      '
                ],
                'Y': [
                    '__   __',
                    '\\ \\ / /',
                    ' \\ V / ',
                    '  | |  ',
                    '  | |  ',
                    '  |_|  '
                ],
                'Z': [
                    ' _____',
                    '|__  /',
                    '  / / ',
                    ' / /_ ',
                    '/____|',
                    '      '
                ],
                '0': [
                    '  ___  ',
                    ' / _ \\ ',
                    '| | | |',
                    '| | | |',
                    '| |_| |',
                    ' \\___/ '
                ],
                '1': [
                    ' _ ',
                    '/ |',
                    '| |',
                    '| |',
                    '| |',
                    '|_|'
                ],
                '2': [
                    ' ____  ',
                    '|___ \\ ',
                    '  __) |',
                    ' / __/ ',
                    '|_____|',
                    '       '
                ],
                '3': [
                    ' _____',
                    '|___ /',
                    '  |_ \\',
                    ' ___) |',
                    '|____/',
                    '      '
                ],
                '4': [
                    ' _  _   ',
                    '| || |  ',
                    '| || |_ ',
                    '|__   _|',
                    '   |_|  ',
                    '        '
                ],
                '5': [
                    ' ____  ',
                    '| ___| ',
                    '|___ \\ ',
                    ' ___) |',
                    '|____/ ',
                    '       '
                ],
                '6': [
                    '  __   ',
                    ' / /_  ',
                    '| \'_ \\ ',
                    '| (_) |',
                    ' \\___/ ',
                    '       '
                ],
                '7': [
                    ' _____ ',
                    '|___  |',
                    '   / / ',
                    '  / /  ',
                    ' /_/   ',
                    '       '
                ],
                '8': [
                    '  ___  ',
                    ' ( _ ) ',
                    ' / _ \\ ',
                    '| (_) |',
                    ' \\___/ ',
                    '       '
                ],
                '9': [
                    '  ___  ',
                    ' / _ \\ ',
                    '| (_) |',
                    ' \\__, |',
                    '   /_/ ',
                    '       '
                ],
                '!': [
                    ' _ ',
                    '| |',
                    '| |',
                    '|_|',
                    '(_)',
                    '   '
                ],
                '?': [
                    ' ___  ',
                    '|__ \\ ',
                    '  / / ',
                    ' |_|  ',
                    ' (_)  ',
                    '      '
                ],
                '.': [
                    '   ',
                    '   ',
                    '   ',
                    '   ',
                    ' _ ',
                    '(_)'
                ],
                ' ': [
                    '  ',
                    '  ',
                    '  ',
                    '  ',
                    '  ',
                    '  '
                ]
            }
        });

        // Banner font - wider and more decorative
        this.fonts.set('banner', {
            height: 7,
            hardblank: '$',
            chars: {
                'A': [
                    '   ###   ',
                    '  ## ##  ',
                    ' ##   ## ',
                    '##     ##',
                    '#########',
                    '##     ##',
                    '##     ##'
                ],
                'B': [
                    '########  ',
                    '##     ## ',
                    '##     ## ',
                    '########  ',
                    '##     ## ',
                    '##     ## ',
                    '########  '
                ],
                'C': [
                    ' ######  ',
                    '##    ## ',
                    '##       ',
                    '##       ',
                    '##       ',
                    '##    ## ',
                    ' ######  '
                ],
                'D': [
                    '########  ',
                    '##     ## ',
                    '##     ## ',
                    '##     ## ',
                    '##     ## ',
                    '##     ## ',
                    '########  '
                ],
                'E': [
                    '######## ',
                    '##       ',
                    '##       ',
                    '######   ',
                    '##       ',
                    '##       ',
                    '######## '
                ],
                'F': [
                    '######## ',
                    '##       ',
                    '##       ',
                    '######   ',
                    '##       ',
                    '##       ',
                    '##       '
                ],
                'G': [
                    ' ######  ',
                    '##    ## ',
                    '##       ',
                    '##   ####',
                    '##    ## ',
                    '##    ## ',
                    ' ######  '
                ],
                'H': [
                    '##     ##',
                    '##     ##',
                    '##     ##',
                    '#########',
                    '##     ##',
                    '##     ##',
                    '##     ##'
                ],
                'I': [
                    '####',
                    ' ## ',
                    ' ## ',
                    ' ## ',
                    ' ## ',
                    ' ## ',
                    '####'
                ],
                'J': [
                    '   ######',
                    '      ## ',
                    '      ## ',
                    '      ## ',
                    '##    ## ',
                    '##    ## ',
                    ' ######  '
                ],
                'K': [
                    '##    ##',
                    '##   ## ',
                    '##  ##  ',
                    '#####   ',
                    '##  ##  ',
                    '##   ## ',
                    '##    ##'
                ],
                'L': [
                    '##       ',
                    '##       ',
                    '##       ',
                    '##       ',
                    '##       ',
                    '##       ',
                    '######## '
                ],
                'M': [
                    '##     ##',
                    '###   ###',
                    '#### ####',
                    '## ### ##',
                    '##     ##',
                    '##     ##',
                    '##     ##'
                ],
                'N': [
                    '##    ##',
                    '###   ##',
                    '####  ##',
                    '## ## ##',
                    '##  ####',
                    '##   ###',
                    '##    ##'
                ],
                'O': [
                    ' #######  ',
                    '##     ## ',
                    '##     ## ',
                    '##     ## ',
                    '##     ## ',
                    '##     ## ',
                    ' #######  '
                ],
                'P': [
                    '########  ',
                    '##     ## ',
                    '##     ## ',
                    '########  ',
                    '##        ',
                    '##        ',
                    '##        '
                ],
                'Q': [
                    ' #######  ',
                    '##     ## ',
                    '##     ## ',
                    '##     ## ',
                    '##  ## ## ',
                    '##    ##  ',
                    ' ###### ##'
                ],
                'R': [
                    '########  ',
                    '##     ## ',
                    '##     ## ',
                    '########  ',
                    '##   ##   ',
                    '##    ##  ',
                    '##     ## '
                ],
                'S': [
                    ' ######  ',
                    '##    ## ',
                    '##       ',
                    ' ######  ',
                    '      ## ',
                    '##    ## ',
                    ' ######  '
                ],
                'T': [
                    '########',
                    '   ##   ',
                    '   ##   ',
                    '   ##   ',
                    '   ##   ',
                    '   ##   ',
                    '   ##   '
                ],
                'U': [
                    '##     ##',
                    '##     ##',
                    '##     ##',
                    '##     ##',
                    '##     ##',
                    '##     ##',
                    ' ####### '
                ],
                'V': [
                    '##     ##',
                    '##     ##',
                    '##     ##',
                    ' ##   ## ',
                    '  ## ##  ',
                    '   ###   ',
                    '    #    '
                ],
                'W': [
                    '##      ##',
                    '##  ##  ##',
                    '##  ##  ##',
                    '##  ##  ##',
                    '##  ##  ##',
                    '##  ##  ##',
                    ' ###  ### '
                ],
                'X': [
                    '##    ##',
                    ' ##  ## ',
                    '  ####  ',
                    '   ##   ',
                    '  ####  ',
                    ' ##  ## ',
                    '##    ##'
                ],
                'Y': [
                    '##    ##',
                    ' ##  ## ',
                    '  ####  ',
                    '   ##   ',
                    '   ##   ',
                    '   ##   ',
                    '   ##   '
                ],
                'Z': [
                    '########',
                    '     ## ',
                    '    ##  ',
                    '   ##   ',
                    '  ##    ',
                    ' ##     ',
                    '########'
                ],
                ' ': [
                    '   ',
                    '   ',
                    '   ',
                    '   ',
                    '   ',
                    '   ',
                    '   '
                ]
            }
        });

        // Small font
        this.fonts.set('small', {
            height: 5,
            hardblank: '$',
            chars: {
                'A': [' ___ ', '| _ |', '|___|', '|   |', '|   |'],
                'B': ['___ ', '|  \\', '|__/', '|  \\', '|__/'],
                'C': [' ___', '/ __', '\\__ ', '(   ', ' \\_|'],
                'D': ['___ ', '| _\\', '| | ', '| | ', '|_|_'],
                'E': ['____', '| __', '| _|', '| |_', '|___|'],
                'F': ['____', '| __', '| _|', '|_|  ', '     '],
                'G': [' ___', '/ __|', '| (_ ', '\\_|_ ', '    '],
                'H': ['_  _', '| || |', '|__ |', '   | |', '   |_|'],
                'I': ['___', '|_ |', ' | |', ' | |', '|___|'],
                'J': ['  __', ' | |', ' | |', '_| |', '\\__|'],
                'K': ['_  _', '| |/', '| < ', '| |\\', '|_| \\'],
                'L': ['_   ', '| |  ', '| |__', '|____|', '      '],
                'M': ['_   _', '| \\_/ |', '| | | |', '|_| |_|', '       '],
                'N': ['_  _', '|\\ |', '| \\|', '|  |', '|__|'],
                'O': [' ___ ', '/ _ \\', '| (_) |', '\\___/', '     '],
                'P': ['___ ', '| _ |', '|  _|', '|_|  ', '     '],
                'Q': [' ___ ', '/ _ \\', '| (_)|', '\\__/|', '    '],
                'R': ['___', '| _ \\', '|   /', '|_|_\\', '     '],
                'S': [' ___', '/ __|', '\\__ \\', '|___/', '    '],
                'T': ['___', '_|_', ' | ', ' |_', '   '],
                'U': ['_  _', '| || |', '| \\/ |', '\\_/ /', '    '],
                'V': ['_  _', '\\ \\/ /', ' \\  / ', '  \\/  ', '      '],
                'W': ['_    _', '\\ \\/\\/ /', ' \\ /  / ', '  \\/\\/  ', '        '],
                'X': ['_  _', '\\ \\/ /', ' >  < ', '/_/\\_\\', '      '],
                'Y': ['_  _', '\\ \\/ /', ' \\  / ', '  \\/  ', '      '],
                'Z': ['___', ' / /', '/ _ ', '\\__|', '   '],
                ' ': ['  ', '  ', '  ', '  ', '  ']
            }
        });
    }
}
