/**
 * Video Processor
 * Convert video files to ASCII animation frames
 * Part of Issue #19 - Animation Support
 */

export class VideoProcessor {
    constructor(imageGenerator) {
        this.imageGenerator = imageGenerator;
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.onProgress = null;
        this.onComplete = null;
        this.onError = null;
    }

    /**
     * Process video file to ASCII frames
     * @param {File} videoFile - Video file
     * @param {Object} options - Processing options
     * @returns {Promise<Array>} Array of ASCII frames
     */
    async processVideo(videoFile, options = {}) {
        const {
            maxFrames = 100,
            fps = 10,
            width = 80,
            height = 40
        } = options;

        try {
            // Create video element
            this.video = document.createElement('video');
            this.video.src = URL.createObjectURL(videoFile);
            this.video.muted = true;

            // Wait for video to load
            await this.waitForVideoLoad();

            // Calculate frame extraction
            const duration = this.video.duration;
            const totalFrames = Math.min(maxFrames, Math.floor(duration * fps));
            const frameInterval = duration / totalFrames;

            const frames = [];

            // Extract frames
            for (let i = 0; i < totalFrames; i++) {
                const time = i * frameInterval;
                const frame = await this.extractFrame(time, width, height);

                frames.push({
                    content: frame,
                    timestamp: time,
                    index: i
                });

                // Progress callback
                if (this.onProgress) {
                    this.onProgress({
                        current: i + 1,
                        total: totalFrames,
                        percent: Math.round(((i + 1) / totalFrames) * 100)
                    });
                }
            }

            // Cleanup
            URL.revokeObjectURL(this.video.src);

            if (this.onComplete) {
                this.onComplete(frames);
            }

            return frames;
        } catch (error) {
            if (this.onError) {
                this.onError(error);
            }
            throw error;
        }
    }

    /**
     * Wait for video to load
     * @returns {Promise<void>}
     */
    waitForVideoLoad() {
        return new Promise((resolve, reject) => {
            this.video.addEventListener('loadedmetadata', () => {
                resolve();
            });

            this.video.addEventListener('error', () => {
                reject(new Error('Failed to load video'));
            });
        });
    }

    /**
     * Extract frame at specific time
     * @param {number} time - Time in seconds
     * @param {number} width - Output width
     * @param {number} height - Output height
     * @returns {Promise<string>} ASCII frame
     */
    async extractFrame(time, width, height) {
        // Seek to time
        this.video.currentTime = time;
        await this.waitForSeek();

        // Create canvas if needed
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
        }

        // Set canvas size to video dimensions
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        // Draw video frame to canvas
        this.ctx.drawImage(this.video, 0, 0);

        // Convert to ASCII using ImageGenerator
        const ascii = await this.imageGenerator.generate(this.canvas, {
            width,
            height
        });

        return ascii;
    }

    /**
     * Wait for video seek to complete
     * @returns {Promise<void>}
     */
    waitForSeek() {
        return new Promise((resolve) => {
            const onSeeked = () => {
                this.video.removeEventListener('seeked', onSeeked);
                // Small delay to ensure frame is ready
                setTimeout(resolve, 50);
            };
            this.video.addEventListener('seeked', onSeeked);
        });
    }

    /**
     * Get video metadata
     * @param {File} videoFile - Video file
     * @returns {Promise<Object>} Video metadata
     */
    async getVideoMetadata(videoFile) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(videoFile);
        video.muted = true;

        return new Promise((resolve, reject) => {
            video.addEventListener('loadedmetadata', () => {
                const metadata = {
                    duration: video.duration,
                    width: video.videoWidth,
                    height: video.videoHeight,
                    aspectRatio: video.videoWidth / video.videoHeight
                };

                URL.revokeObjectURL(video.src);
                resolve(metadata);
            });

            video.addEventListener('error', () => {
                URL.revokeObjectURL(video.src);
                reject(new Error('Failed to load video metadata'));
            });
        });
    }

    /**
     * Validate video file
     * @param {File} file - File to validate
     * @returns {Object} Validation result
     */
    validateVideo(file) {
        const MAX_SIZE = 100 * 1024 * 1024; // 100MB
        const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

        if (!ALLOWED_TYPES.includes(file.type)) {
            return {
                valid: false,
                error: `Invalid video type. Allowed: ${ALLOWED_TYPES.join(', ')}`
            };
        }

        if (file.size > MAX_SIZE) {
            return {
                valid: false,
                error: `Video too large. Maximum size: ${MAX_SIZE / 1024 / 1024}MB`
            };
        }

        return { valid: true };
    }

    /**
     * Cancel processing
     */
    cancel() {
        if (this.video) {
            this.video.pause();
            if (this.video.src) {
                URL.revokeObjectURL(this.video.src);
            }
        }
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.cancel();
        this.video = null;
        this.canvas = null;
        this.ctx = null;
    }
}
