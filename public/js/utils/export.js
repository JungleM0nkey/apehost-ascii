/**
 * ASCII Art Studio - Export Utilities
 * Handles various export formats and file downloads
 */

import { Config, ColorPalettes } from '../config.js';

export class ExportManager {
    constructor() {
        this.supportedFormats = Config.EXPORT_FORMATS;
    }

    /**
     * Download ASCII art in specified format
     * @param {string} content - ASCII art content
     * @param {string} format - Export format (txt, html, json, md)
     * @param {Object} metadata - Generation metadata
     */
    async download(content, format, metadata = {}) {
        try {
            if (!content || content.trim() === '') {
                throw new Error(Config.ERRORS.INVALID_INPUT);
            }

            const formatConfig = this.supportedFormats[format.toUpperCase()];
            if (!formatConfig) {
                throw new Error(Config.ERRORS.UNSUPPORTED_FORMAT);
            }

            const filename = this.generateFilename(format, metadata);
            const blob = await this.createBlob(content, format, metadata);
            
            this.downloadBlob(blob, filename);
            
            return { success: true, filename };
        } catch (error) {
            console.error('Export failed:', error);
            throw new Error(Config.ERRORS.EXPORT_FAILED);
        }
    }

    /**
     * Create blob for specific format
     * @param {string} content - ASCII content
     * @param {string} format - Export format
     * @param {Object} metadata - Generation metadata
     * @returns {Blob}
     */
    async createBlob(content, format, metadata) {
        switch (format.toLowerCase()) {
            case 'txt':
                return this.createTextBlob(content);
            case 'html':
                return this.createHtmlBlob(content, metadata);
            case 'json':
                return this.createJsonBlob(content, metadata);
            case 'md':
                return this.createMarkdownBlob(content, metadata);
            case 'discord':
                return this.createDiscordBlob(content, metadata);
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }

    /**
     * Create plain text blob
     * @param {string} content - ASCII content
     * @returns {Blob}
     */
    createTextBlob(content) {
        return new Blob([content], { 
            type: this.supportedFormats.TXT.mimeType 
        });
    }

    /**
     * Create HTML blob with styling
     * @param {string} content - ASCII content
     * @param {Object} metadata - Generation metadata
     * @returns {Blob}
     */
    createHtmlBlob(content, metadata) {
        const palette = ColorPalettes[metadata.palette] || ColorPalettes.orange;
        const mode = metadata.mode || 'unknown';
        const timestamp = metadata.timestamp || new Date().toISOString();

        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ASCII Art - ${mode.toUpperCase()}</title>
    <style>
        body {
            font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
            background: ${palette.background};
            color: ${palette.text};
            margin: 0;
            padding: 20px;
            white-space: pre-wrap;
            overflow-x: auto;
            line-height: 1.1;
        }
        .ascii-container {
            background: ${palette.surface};
            padding: 30px;
            border-radius: 8px;
            border: 2px solid ${palette.primary};
            box-shadow: 0 0 20px ${palette.primary}40;
            position: relative;
            overflow-x: auto;
        }
        .ascii-art {
            font-size: 12px;
            line-height: 1.1;
            color: ${palette.primary};
            letter-spacing: 0.02em;
            font-weight: 500;
        }
        .metadata {
            font-size: 11px;
            color: ${palette.muted};
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid ${palette.muted}40;
            opacity: 0.8;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .title {
            color: ${palette.primary};
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 5px;
        }
        .subtitle {
            color: ${palette.muted};
            font-size: 12px;
        }
        @media print {
            body { background: white; color: black; }
            .ascii-container { border-color: black; box-shadow: none; }
            .ascii-art { color: black; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">ApeHost ASCII</div>
        <div class="subtitle">Generated ASCII Art</div>
    </div>
    <div class="ascii-container">
        <div class="metadata">
            Generated: ${new Date(timestamp).toLocaleString()} | 
            Mode: ${mode.toUpperCase()} | 
            Theme: ${palette.name}
            ${metadata.font ? ` | Font: ${metadata.font}` : ''}
            ${metadata.width ? ` | Width: ${metadata.width}px` : ''}
        </div>
        <div class="ascii-art">${this.escapeHtml(content)}</div>
    </div>
</body>
</html>`;

        return new Blob([htmlContent], { 
            type: this.supportedFormats.HTML.mimeType 
        });
    }

    /**
     * Create JSON blob with structured data
     * @param {string} content - ASCII content
     * @param {Object} metadata - Generation metadata
     * @returns {Blob}
     */
    createJsonBlob(content, metadata) {
        const jsonData = {
            ascii_art: content,
            metadata: {
                ...metadata,
                generator: 'ApeHost',
                version: Config.VERSION,
                generated_at: metadata.timestamp || new Date().toISOString(),
                character_count: content.length,
                line_count: content.split('\n').length,
            }
        };

        return new Blob([JSON.stringify(jsonData, null, 2)], { 
            type: this.supportedFormats.JSON.mimeType 
        });
    }

    /**
     * Create Discord-optimized blob with proper formatting
     * @param {string} content - ASCII content
     * @param {Object} metadata - Generation metadata
     * @returns {Blob}
     */
    createDiscordBlob(content, metadata) {
        const mode = metadata.mode || 'ascii';
        const timestamp = new Date(metadata.timestamp || Date.now()).toLocaleString();
        
        // Discord formatting techniques for ASCII art preservation
        const discordContent = `**ASCII Art - ${mode.toUpperCase()}** (Generated: ${timestamp})
\`\`\`
${this.optimizeForDiscord(content)}
\`\`\`

*Generated with ApeHost*`;

        return new Blob([discordContent], { 
            type: this.supportedFormats.DISCORD.mimeType 
        });
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
     * Create Markdown blob with documentation
     * @param {string} content - ASCII content
     * @param {Object} metadata - Generation metadata
     * @returns {Blob}
     */
    createMarkdownBlob(content, metadata) {
        const mode = metadata.mode || 'unknown';
        const timestamp = metadata.timestamp || new Date().toISOString();
        const palette = ColorPalettes[metadata.palette] || ColorPalettes.orange;

        const markdownContent = `# ASCII Art - ${mode.toUpperCase()}

Generated using **ApeHost** v${Config.VERSION}

## Details

- **Generated**: ${new Date(timestamp).toLocaleString()}
- **Mode**: ${mode.toUpperCase()}
- **Theme**: ${palette.name}
${metadata.font ? `- **Font**: ${metadata.font}` : ''}
${metadata.width ? `- **Width**: ${metadata.width}px` : ''}
${metadata.input ? `- **Input**: "${metadata.input}"` : ''}

## ASCII Art

\`\`\`
${content}
\`\`\`

## Technical Details

\`\`\`json
${JSON.stringify({
    character_count: content.length,
    line_count: content.split('\n').length,
    generation_settings: metadata,
    export_timestamp: new Date().toISOString()
}, null, 2)}
\`\`\`

---

*Generated with [ApeHost](https://apehost.net)*
`;

        return new Blob([markdownContent], { 
            type: this.supportedFormats.MD.mimeType 
        });
    }

    /**
     * Generate filename with timestamp
     * @param {string} format - Export format
     * @param {Object} metadata - Generation metadata
     * @returns {string}
     */
    generateFilename(format, metadata) {
        const timestamp = Date.now();
        const mode = metadata.mode || 'ascii';
        const extension = this.supportedFormats[format.toUpperCase()].extension;
        
        return `ascii-art-${mode}-${timestamp}${extension}`;
    }

    /**
     * Download blob as file
     * @param {Blob} blob - File blob
     * @param {string} filename - File name
     */
    downloadBlob(blob, filename) {
        try {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up URL after a short delay
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (error) {
            console.error('Download failed:', error);
            throw new Error(Config.ERRORS.EXPORT_FAILED);
        }
    }

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string}
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get available export formats
     * @returns {Array}
     */
    getAvailableFormats() {
        return Object.keys(this.supportedFormats).map(key => ({
            id: key.toLowerCase(),
            name: key,
            extension: this.supportedFormats[key].extension,
            mimeType: this.supportedFormats[key].mimeType
        }));
    }

    /**
     * Validate export parameters
     * @param {string} content - ASCII content
     * @param {string} format - Export format
     * @returns {boolean}
     */
    validate(content, format) {
        if (!content || content.trim().length === 0) {
            return { valid: false, error: 'Content cannot be empty' };
        }

        if (content.length > Config.LIMITS.MAX_OUTPUT_SIZE) {
            return { valid: false, error: 'Content exceeds maximum size limit' };
        }

        if (!this.supportedFormats[format.toUpperCase()]) {
            return { valid: false, error: 'Unsupported export format' };
        }

        return { valid: true };
    }
}