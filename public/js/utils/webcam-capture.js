/**
 * Webcam Capture
 * Capture live webcam feed and convert to ASCII
 * Part of Issue #19 - Animation Support
 */

export class WebcamCapture {
    constructor(imageGenerator) {
        this.imageGenerator = imageGenerator;
        this.stream = null;
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.isCapturing = false;
        this.captureTimer = null;
        this.onFrame = null;
        this.onError = null;
    }

    /**
     * Start webcam capture
     * @param {Object} options - Capture options
     * @returns {Promise<void>}
     */
    async start(options = {}) {
        const {
            fps = 10,
            width = 80,
            height = 40,
            facingMode = 'user' // 'user' or 'environment'
        } = options;

        try {
            // Request webcam access
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode,
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },
                audio: false
            });

            // Create video element
            this.video = document.createElement('video');
            this.video.srcObject = this.stream;
            this.video.autoplay = true;
            this.video.muted = true;

            // Wait for video to start
            await this.waitForVideoReady();

            // Start capturing frames
            this.isCapturing = true;
            const frameDelay = 1000 / fps;

            this.captureTimer = setInterval(async () => {
                try {
                    const frame = await this.captureFrame(width, height);
                    if (this.onFrame) {
                        this.onFrame(frame);
                    }
                } catch (error) {
                    console.error('Frame capture error:', error);
                }
            }, frameDelay);

        } catch (error) {
            const errorMessage = this.getErrorMessage(error);
            if (this.onError) {
                this.onError(new Error(errorMessage));
            }
            throw new Error(errorMessage);
        }
    }

    /**
     * Stop webcam capture
     */
    stop() {
        this.isCapturing = false;

        // Stop capture timer
        if (this.captureTimer) {
            clearInterval(this.captureTimer);
            this.captureTimer = null;
        }

        // Stop video stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        // Clear video element
        if (this.video) {
            this.video.srcObject = null;
            this.video = null;
        }
    }

    /**
     * Capture single frame from webcam
     * @param {number} width - ASCII width
     * @param {number} height - ASCII height
     * @returns {Promise<string>} ASCII frame
     */
    async captureFrame(width, height) {
        if (!this.video || !this.isCapturing) {
            throw new Error('Webcam not active');
        }

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

        // Convert to ASCII
        const ascii = await this.imageGenerator.generate(this.canvas, {
            width,
            height
        });

        return ascii;
    }

    /**
     * Wait for video to be ready
     * @returns {Promise<void>}
     */
    waitForVideoReady() {
        return new Promise((resolve, reject) => {
            const checkReady = () => {
                if (this.video.readyState >= 2) { // HAVE_CURRENT_DATA
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };

            this.video.addEventListener('error', () => {
                reject(new Error('Video element error'));
            });

            checkReady();
        });
    }

    /**
     * Check if webcam is available
     * @returns {Promise<boolean>}
     */
    static async isAvailable() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            return false;
        }

        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.some(device => device.kind === 'videoinput');
        } catch (error) {
            return false;
        }
    }

    /**
     * Get available cameras
     * @returns {Promise<Array>} Array of camera devices
     */
    static async getCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices
                .filter(device => device.kind === 'videoinput')
                .map(device => ({
                    id: device.deviceId,
                    label: device.label || `Camera ${device.deviceId.slice(0, 8)}`
                }));
        } catch (error) {
            return [];
        }
    }

    /**
     * Get error message from media error
     * @param {Error} error - Error object
     * @returns {string} User-friendly error message
     */
    getErrorMessage(error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            return 'Camera access denied. Please allow camera permission.';
        }
        if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            return 'No camera found. Please connect a camera.';
        }
        if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            return 'Camera is already in use by another application.';
        }
        if (error.name === 'OverconstrainedError') {
            return 'Camera does not support requested settings.';
        }
        return 'Failed to access camera: ' + error.message;
    }

    /**
     * Take snapshot (single frame)
     * @param {Object} options - Capture options
     * @returns {Promise<string>} ASCII snapshot
     */
    async takeSnapshot(options = {}) {
        const { width = 80, height = 40 } = options;

        // Start temporarily if not capturing
        const wasCapturing = this.isCapturing;
        if (!wasCapturing) {
            await this.start({ ...options, fps: 1 });
        }

        // Capture frame
        const frame = await this.captureFrame(width, height);

        // Stop if we started temporarily
        if (!wasCapturing) {
            this.stop();
        }

        return frame;
    }

    /**
     * Get capture status
     * @returns {Object} Status object
     */
    getStatus() {
        return {
            isCapturing: this.isCapturing,
            hasStream: !!this.stream,
            videoReady: this.video && this.video.readyState >= 2
        };
    }

    /**
     * Pause capture (without stopping stream)
     */
    pause() {
        if (this.captureTimer) {
            clearInterval(this.captureTimer);
            this.captureTimer = null;
        }
        this.isCapturing = false;
    }

    /**
     * Resume capture
     * @param {number} fps - Frames per second
     */
    resume(fps = 10) {
        if (!this.stream || this.isCapturing) return;

        this.isCapturing = true;
        const frameDelay = 1000 / fps;

        this.captureTimer = setInterval(async () => {
            try {
                const frame = await this.captureFrame(80, 40);
                if (this.onFrame) {
                    this.onFrame(frame);
                }
            } catch (error) {
                console.error('Frame capture error:', error);
            }
        }, frameDelay);
    }
}
