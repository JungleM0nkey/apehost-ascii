/**
 * ASCII Art Studio - Clipboard Utilities
 * Handles copying ASCII art to clipboard with fallback methods
 */

import { Config } from '../config.js';

export class ClipboardManager {
    constructor() {
        this.isSupported = this.checkSupport();
    }

    /**
     * Check if clipboard API is supported
     * @returns {boolean}
     */
    checkSupport() {
        return !!(navigator.clipboard && navigator.clipboard.writeText);
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>}
     */
    async copy(text) {
        if (!text || text.trim() === '') {
            throw new Error('No content to copy');
        }

        try {
            if (this.isSupported) {
                await this.copyWithClipboardAPI(text);
            } else {
                await this.copyWithFallback(text);
            }
            return true;
        } catch (error) {
            console.error('Copy failed:', error);
            // Try fallback method if modern API fails
            try {
                await this.copyWithFallback(text);
                return true;
            } catch (fallbackError) {
                console.error('Fallback copy failed:', fallbackError);
                throw new Error('Failed to copy to clipboard');
            }
        }
    }

    /**
     * Copy using modern Clipboard API
     * @param {string} text - Text to copy
     */
    async copyWithClipboardAPI(text) {
        await navigator.clipboard.writeText(text);
    }

    /**
     * Copy using fallback method (document.execCommand)
     * @param {string} text - Text to copy
     */
    async copyWithFallback(text) {
        return new Promise((resolve, reject) => {
            // Create temporary textarea element
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            textArea.style.opacity = '0';
            textArea.setAttribute('readonly', '');
            textArea.setAttribute('aria-hidden', 'true');

            document.body.appendChild(textArea);

            try {
                // Select and copy the text
                textArea.focus();
                textArea.select();
                textArea.setSelectionRange(0, text.length);

                const success = document.execCommand('copy');
                if (!success) {
                    throw new Error('execCommand copy failed');
                }

                resolve();
            } catch (error) {
                reject(error);
            } finally {
                // Clean up
                document.body.removeChild(textArea);
            }
        });
    }

    /**
     * Copy with visual feedback
     * @param {string} text - Text to copy
     * @param {HTMLElement} button - Button element for feedback
     * @returns {Promise<void>}
     */
    async copyWithFeedback(text, button = null) {
        try {
            await this.copy(text);
            
            if (button) {
                this.showCopyFeedback(button);
            }
            
            return { success: true, message: Config.SUCCESS.COPIED };
        } catch (error) {
            console.error('Copy with feedback failed:', error);
            throw error;
        }
    }

    /**
     * Show visual feedback on button
     * @param {HTMLElement} button - Button element
     */
    showCopyFeedback(button) {
        if (!button) return;

        const originalText = button.textContent;
        const originalDisabled = button.disabled;

        // Update button appearance
        button.textContent = '[✓] COPIED';
        button.disabled = true;
        button.style.borderColor = 'var(--secondary)';
        button.style.color = 'var(--secondary)';

        // Reset after delay
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = originalDisabled;
            button.style.borderColor = '';
            button.style.color = '';
        }, Config.UI.TOAST_DURATION);
    }

    /**
     * Check if text can be copied (length validation)
     * @param {string} text - Text to validate
     * @returns {Object}
     */
    validateCopyContent(text) {
        if (!text || text.trim().length === 0) {
            return {
                valid: false,
                error: 'No content to copy'
            };
        }

        if (text.length > Config.LIMITS.MAX_OUTPUT_SIZE) {
            return {
                valid: false,
                error: 'Content too large to copy'
            };
        }

        return { valid: true };
    }

    /**
     * Get clipboard permissions status
     * @returns {Promise<string>}
     */
    async getPermissionStatus() {
        if (!navigator.permissions || !navigator.permissions.query) {
            return 'unknown';
        }

        try {
            const permission = await navigator.permissions.query({ name: 'clipboard-write' });
            return permission.state; // 'granted', 'denied', or 'prompt'
        } catch (error) {
            console.warn('Could not check clipboard permissions:', error);
            return 'unknown';
        }
    }

    /**
     * Request clipboard permissions
     * @returns {Promise<boolean>}
     */
    async requestPermissions() {
        try {
            const status = await this.getPermissionStatus();
            
            if (status === 'granted') {
                return true;
            }
            
            if (status === 'denied') {
                return false;
            }

            // Try to trigger permission prompt by attempting a copy
            await navigator.clipboard.writeText('');
            return true;
        } catch (error) {
            console.warn('Clipboard permission request failed:', error);
            return false;
        }
    }

    /**
     * Copy ASCII art optimized for Discord
     * @param {string} content - ASCII content
     * @param {Object} metadata - Generation metadata
     * @returns {Promise<void>}
     */
    async copyForDiscord(content, metadata = {}) {
        const mode = metadata.mode || 'ascii';
        const timestamp = new Date().toLocaleString();
        
        // Apply Discord optimizations
        const optimizedContent = this.optimizeForDiscord(content);
        
        // Format with Discord markdown
        const discordContent = `**ASCII Art - ${mode.toUpperCase()}** (${timestamp})
\`\`\`
${optimizedContent}
\`\`\`

*Generated with ApeHost*`;

        return this.copy(discordContent);
    }

    /**
     * Optimize ASCII content for Discord display
     * @param {string} content - Original ASCII content
     * @returns {string} Discord-optimized content
     */
    optimizeForDiscord(content) {
        return content
            // Preserve empty lines with zero-width space
            .replace(/^\s*$/gm, '\u200B')
            // Prevent Discord auto-formatting of certain characters
            .replace(/\*/g, '∗')  // Replace asterisks with similar Unicode
            .replace(/_/g, '＿')   // Replace underscores with full-width
            .replace(/~/g, '∼')   // Replace tildes with similar
            // Ensure consistent line endings
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            // Trim excessive whitespace but preserve structure
            .split('\n')
            .map(line => line.trimEnd())
            .join('\n')
            .replace(/\n{3,}/g, '\n\n'); // Limit to max 2 consecutive empty lines
    }

    /**
     * Copy formatted ASCII art with metadata
     * @param {string} content - ASCII content
     * @param {Object} metadata - Generation metadata
     * @returns {Promise<void>}
     */
    async copyFormatted(content, metadata = {}) {
        let formattedContent = content;

        if (metadata.includeHeader) {
            const header = this.generateHeader(metadata);
            formattedContent = `${header}\n\n${content}`;
        }

        if (metadata.includeFooter) {
            const footer = this.generateFooter();
            formattedContent = `${formattedContent}\n\n${footer}`;
        }

        return this.copy(formattedContent);
    }

    /**
     * Generate header for formatted copy
     * @param {Object} metadata - Generation metadata
     * @returns {string}
     */
    generateHeader(metadata) {
        const mode = metadata.mode || 'ASCII Art';
        const timestamp = new Date().toLocaleString();
        
        return `/* ${mode.toUpperCase()} - Generated ${timestamp} */`;
    }

    /**
     * Generate footer for formatted copy
     * @returns {string}
     */
    generateFooter() {
        return `/* Generated with ApeHost v${Config.VERSION} */`;
    }

    /**
     * Copy selection of ASCII art
     * @param {string} content - Full ASCII content
     * @param {number} startLine - Start line number (0-based)
     * @param {number} endLine - End line number (0-based)
     * @returns {Promise<void>}
     */
    async copySelection(content, startLine, endLine) {
        const lines = content.split('\n');
        const selectedLines = lines.slice(startLine, endLine + 1);
        const selection = selectedLines.join('\n');
        
        return this.copy(selection);
    }
}

// Create singleton instance
export const clipboard = new ClipboardManager();