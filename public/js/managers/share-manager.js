/**
 * Share Manager
 * URL sharing functionality
 * Implements Issue #15 - URL Sharing
 */

export class ShareManager {
    /**
     * Generate a shareable URL
     * @param {string} content - ASCII content
     * @param {Object} metadata - Generation metadata
     * @returns {string} Shareable URL
     */
    generateShareUrl(content, metadata) {
        try {
            const compressed = this.compress(content);
            const params = new URLSearchParams({
                v: '1', // Version
                m: metadata.mode || 'text',
                d: compressed,
                s: btoa(JSON.stringify({
                    font: metadata.font,
                    spacing: metadata.spacing,
                    palette: metadata.palette,
                    style: metadata.style,
                    width: metadata.width
                }))
            });

            return `${window.location.origin}${window.location.pathname}?${params}`;
        } catch (error) {
            console.error('Failed to generate share URL:', error);
            return null;
        }
    }

    /**
     * Load from URL parameters
     * @returns {Object|null} Shared data
     */
    loadFromUrl() {
        try {
            const params = new URLSearchParams(window.location.search);

            if (!params.has('d')) {
                return null;
            }

            const content = this.decompress(params.get('d'));
            const mode = params.get('m') || 'text';
            const settingsB64 = params.get('s');
            const settings = settingsB64 ? JSON.parse(atob(settingsB64)) : {};

            return {
                content,
                mode,
                settings
            };
        } catch (error) {
            console.error('Failed to load from URL:', error);
            return null;
        }
    }

    /**
     * Compress content for URL
     * @param {string} text - Text to compress
     * @returns {string} Compressed and encoded
     */
    compress(text) {
        // Simple base64 encoding (in production, use LZ-string or similar)
        return btoa(encodeURIComponent(text));
    }

    /**
     * Decompress content from URL
     * @param {string} compressed - Compressed data
     * @returns {string} Original text
     */
    decompress(compressed) {
        return decodeURIComponent(atob(compressed));
    }

    /**
     * Copy share URL to clipboard
     * @param {string} url - URL to copy
     * @returns {Promise<boolean>} Success status
     */
    async copyShareUrl(url) {
        try {
            await navigator.clipboard.writeText(url);
            return true;
        } catch (error) {
            console.error('Failed to copy URL:', error);
            return false;
        }
    }

    /**
     * Generate QR code data URL for share link
     * @param {string} url - URL to encode
     * @returns {string} QR code API URL
     */
    generateQRCode(url) {
        // Using a free QR code API
        const encoded = encodeURIComponent(url);
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}`;
    }
}
