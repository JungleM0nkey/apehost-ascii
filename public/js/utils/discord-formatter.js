/**
 * Discord Formatter Utility
 * Shared formatting for Discord-optimized ASCII art
 * Fixes Issue #11 - Code Duplication
 */

export class DiscordFormatter {
    /**
     * Optimize ASCII content for Discord display
     * @param {string} content - Original ASCII content
     * @returns {string} Discord-optimized content
     */
    static optimize(content) {
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
     * Wrap content in Discord code block
     * @param {string} content - ASCII content
     * @param {Object} metadata - Optional metadata
     * @returns {string} Discord-formatted message
     */
    static wrapInCodeBlock(content, metadata = {}) {
        const mode = metadata.mode || 'ascii';
        const timestamp = new Date().toLocaleString();

        return `**ASCII Art - ${mode.toUpperCase()}** (${timestamp})
\`\`\`
${this.optimize(content)}
\`\`\`

*Generated with ApeHost*`;
    }
}
