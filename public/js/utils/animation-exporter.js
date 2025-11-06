/**
 * Animation Exporter
 * Export ASCII animations as GIF/MP4/APNG
 * Part of Issue #19 - Animation Support
 */

export class AnimationExporter {
    constructor() {
        this.canvas = null;
        this.ctx = null;
    }

    /**
     * Export animation as GIF
     * @param {Array} frames - Array of frame objects
     * @param {Object} options - Export options
     * @returns {Promise<Blob>} GIF blob
     */
    async exportAsGIF(frames, options = {}) {
        const {
            fps = 10,
            width = 800,
            height = 600,
            fontFamily = 'Courier New, monospace',
            fontSize = 12,
            backgroundColor = '#000000',
            textColor = '#00ff00'
        } = options;

        // Note: In production, use gif.js or similar library
        // For now, return animated text file
        console.warn('GIF export requires gif.js library. Falling back to text export.');

        const textContent = frames
            .map((frame, i) => `\n=== Frame ${i + 1}/${frames.length} ===\n${frame.content}`)
            .join('\n\n');

        return new Blob([textContent], { type: 'text/plain' });
    }

    /**
     * Export animation as APNG (Animated PNG)
     * @param {Array} frames - Array of frame objects
     * @param {Object} options - Export options
     * @returns {Promise<Blob>} APNG blob
     */
    async exportAsAPNG(frames, options = {}) {
        const {
            fps = 10,
            width = 800,
            height = 600,
            fontFamily = 'Courier New, monospace',
            fontSize = 12,
            backgroundColor = '#000000',
            textColor = '#00ff00'
        } = options;

        // Create canvas
        this.setupCanvas(width, height, fontFamily, fontSize, backgroundColor, textColor);

        // Render all frames as images
        const frameImages = [];
        for (const frame of frames) {
            const imageData = await this.renderFrameToImage(frame.content, options);
            frameImages.push(imageData);
        }

        // Note: APNG encoding requires upng-js or similar
        console.warn('APNG export requires upng-js library. Falling back to frame sequence.');

        // Return first frame for now
        return this.canvasToBlob(this.canvas);
    }

    /**
     * Export animation as WebM video
     * @param {Array} frames - Array of frame objects
     * @param {Object} options - Export options
     * @returns {Promise<Blob>} WebM video blob
     */
    async exportAsWebM(frames, options = {}) {
        const {
            fps = 10,
            width = 800,
            height = 600,
            fontFamily = 'Courier New, monospace',
            fontSize = 12,
            backgroundColor = '#000000',
            textColor = '#00ff00'
        } = options;

        // Check MediaRecorder support
        if (!window.MediaRecorder) {
            throw new Error('MediaRecorder not supported in this browser');
        }

        // Create canvas
        this.setupCanvas(width, height, fontFamily, fontSize, backgroundColor, textColor);

        // Capture canvas stream
        const stream = this.canvas.captureStream(fps);
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp8'
        });

        const chunks = [];
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };

        return new Promise((resolve, reject) => {
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                resolve(blob);
            };

            mediaRecorder.onerror = (e) => {
                reject(new Error('MediaRecorder error: ' + e.error));
            };

            // Start recording
            mediaRecorder.start();

            // Render frames
            this.renderFramesSequence(frames, fps).then(() => {
                mediaRecorder.stop();
            }).catch(reject);
        });
    }

    /**
     * Export as frame sequence (ZIP of images)
     * @param {Array} frames - Array of frame objects
     * @param {Object} options - Export options
     * @returns {Promise<Blob>} ZIP blob
     */
    async exportAsFrameSequence(frames, options = {}) {
        const {
            format = 'png',
            width = 800,
            height = 600,
            fontFamily = 'Courier New, monospace',
            fontSize = 12,
            backgroundColor = '#000000',
            textColor = '#00ff00'
        } = options;

        this.setupCanvas(width, height, fontFamily, fontSize, backgroundColor, textColor);

        // Render each frame
        const frameData = [];
        for (let i = 0; i < frames.length; i++) {
            const blob = await this.renderFrameToBlob(frames[i].content, options);
            frameData.push({
                name: `frame_${String(i).padStart(4, '0')}.${format}`,
                blob
            });
        }

        // Note: ZIP creation requires jszip or similar
        // For now, return concatenated text
        console.warn('ZIP export requires jszip library. Falling back to text export.');

        const textContent = frames
            .map((frame, i) => `=== frame_${String(i).padStart(4, '0')}.txt ===\n${frame.content}`)
            .join('\n\n');

        return new Blob([textContent], { type: 'text/plain' });
    }

    /**
     * Setup canvas for rendering
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {string} fontFamily - Font family
     * @param {number} fontSize - Font size
     * @param {string} backgroundColor - Background color
     * @param {string} textColor - Text color
     */
    setupCanvas(width, height, fontFamily, fontSize, backgroundColor, textColor) {
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
        }

        this.canvas.width = width;
        this.canvas.height = height;

        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, width, height);

        this.ctx.font = `${fontSize}px ${fontFamily}`;
        this.ctx.fillStyle = textColor;
        this.ctx.textBaseline = 'top';
    }

    /**
     * Render ASCII frame to canvas
     * @param {string} content - ASCII content
     * @param {Object} options - Render options
     * @returns {Promise<ImageData>}
     */
    async renderFrameToImage(content, options = {}) {
        const {
            fontSize = 12,
            backgroundColor = '#000000',
            textColor = '#00ff00',
            padding = 10
        } = options;

        // Clear canvas
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render text
        this.ctx.fillStyle = textColor;
        const lines = content.split('\n');
        const lineHeight = fontSize * 1.2;

        lines.forEach((line, index) => {
            const y = padding + (index * lineHeight);
            this.ctx.fillText(line, padding, y);
        });

        return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Render frame to blob
     * @param {string} content - ASCII content
     * @param {Object} options - Render options
     * @returns {Promise<Blob>}
     */
    async renderFrameToBlob(content, options = {}) {
        await this.renderFrameToImage(content, options);
        return this.canvasToBlob(this.canvas);
    }

    /**
     * Render frames in sequence with timing
     * @param {Array} frames - Frame objects
     * @param {number} fps - Frames per second
     * @returns {Promise<void>}
     */
    async renderFramesSequence(frames, fps) {
        const frameDelay = 1000 / fps;

        for (const frame of frames) {
            await this.renderFrameToImage(frame.content);
            await this.delay(frameDelay);
        }
    }

    /**
     * Convert canvas to blob
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {string} type - Blob type
     * @returns {Promise<Blob>}
     */
    canvasToBlob(canvas, type = 'image/png') {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create blob from canvas'));
                }
            }, type);
        });
    }

    /**
     * Delay helper
     * @param {number} ms - Milliseconds
     * @returns {Promise<void>}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Export as animated text file
     * @param {Array} frames - Frame objects
     * @param {Object} options - Export options
     * @returns {Blob} Text blob
     */
    exportAsText(frames, options = {}) {
        const { includeMetadata = true } = options;

        let content = '';

        if (includeMetadata) {
            content += `ASCII Animation\n`;
            content += `Frames: ${frames.length}\n`;
            content += `Generated: ${new Date().toISOString()}\n`;
            content += `${'='.repeat(60)}\n\n`;
        }

        frames.forEach((frame, i) => {
            content += `Frame ${i + 1}/${frames.length}\n`;
            content += `${'-'.repeat(60)}\n`;
            content += frame.content + '\n\n';
        });

        return new Blob([content], { type: 'text/plain' });
    }

    /**
     * Get supported export formats
     * @returns {Array} Supported formats
     */
    static getSupportedFormats() {
        const formats = [
            { id: 'text', name: 'Text File', extension: 'txt', available: true },
            { id: 'frames', name: 'Frame Sequence', extension: 'zip', available: true }
        ];

        // Check WebM support
        if (window.MediaRecorder) {
            const types = ['video/webm;codecs=vp8', 'video/webm;codecs=vp9'];
            for (const type of types) {
                if (MediaRecorder.isTypeSupported(type)) {
                    formats.push({
                        id: 'webm',
                        name: 'WebM Video',
                        extension: 'webm',
                        available: true
                    });
                    break;
                }
            }
        }

        // Note: GIF and APNG require external libraries
        formats.push(
            { id: 'gif', name: 'Animated GIF', extension: 'gif', available: false, requiresLibrary: 'gif.js' },
            { id: 'apng', name: 'Animated PNG', extension: 'png', available: false, requiresLibrary: 'upng-js' }
        );

        return formats;
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.canvas = null;
        this.ctx = null;
    }
}
