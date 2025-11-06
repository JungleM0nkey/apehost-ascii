/**
 * Animation Manager
 * Handles animated ASCII art creation and playback
 * Implements Issue #19 - Animation Support
 */

export class AnimationManager {
    constructor(elements, eventManager) {
        this.elements = elements;
        this.eventManager = eventManager;

        this.frames = [];
        this.currentFrame = 0;
        this.isPlaying = false;
        this.fps = 10;
        this.animationTimer = null;
        this.onFrameChange = null;
    }

    /**
     * Add frame to animation
     * @param {string} content - Frame content
     * @param {Object} metadata - Frame metadata
     */
    addFrame(content, metadata = {}) {
        this.frames.push({
            content,
            timestamp: Date.now(),
            ...metadata
        });
    }

    /**
     * Remove frame at index
     * @param {number} index - Frame index
     */
    removeFrame(index) {
        if (index >= 0 && index < this.frames.length) {
            this.frames.splice(index, 1);
            if (this.currentFrame >= this.frames.length) {
                this.currentFrame = Math.max(0, this.frames.length - 1);
            }
        }
    }

    /**
     * Update frame at index
     * @param {number} index - Frame index
     * @param {string} content - New content
     */
    updateFrame(index, content) {
        if (index >= 0 && index < this.frames.length) {
            this.frames[index].content = content;
            this.frames[index].modified = Date.now();
        }
    }

    /**
     * Get frame at index
     * @param {number} index - Frame index
     * @returns {Object|null} Frame object
     */
    getFrame(index) {
        return this.frames[index] || null;
    }

    /**
     * Get current frame
     * @returns {Object|null} Current frame
     */
    getCurrentFrame() {
        return this.getFrame(this.currentFrame);
    }

    /**
     * Set current frame
     * @param {number} index - Frame index
     */
    setCurrentFrame(index) {
        if (index >= 0 && index < this.frames.length) {
            this.currentFrame = index;
            if (this.onFrameChange) {
                this.onFrameChange(this.getCurrentFrame(), index);
            }
        }
    }

    /**
     * Go to next frame
     */
    nextFrame() {
        const next = (this.currentFrame + 1) % this.frames.length;
        this.setCurrentFrame(next);
    }

    /**
     * Go to previous frame
     */
    previousFrame() {
        const prev = this.currentFrame === 0 ? this.frames.length - 1 : this.currentFrame - 1;
        this.setCurrentFrame(prev);
    }

    /**
     * Start animation playback
     */
    play() {
        if (this.isPlaying || this.frames.length === 0) return;

        this.isPlaying = true;
        const frameDelay = 1000 / this.fps;

        this.animationTimer = setInterval(() => {
            this.nextFrame();
        }, frameDelay);
    }

    /**
     * Pause animation playback
     */
    pause() {
        if (!this.isPlaying) return;

        this.isPlaying = false;
        if (this.animationTimer) {
            clearInterval(this.animationTimer);
            this.animationTimer = null;
        }
    }

    /**
     * Stop animation and reset to first frame
     */
    stop() {
        this.pause();
        this.setCurrentFrame(0);
    }

    /**
     * Set frames per second
     * @param {number} fps - Frames per second (1-60)
     */
    setFPS(fps) {
        const wasPlaying = this.isPlaying;
        if (wasPlaying) this.pause();

        this.fps = Math.max(1, Math.min(60, fps));

        if (wasPlaying) this.play();
    }

    /**
     * Get animation duration in seconds
     * @returns {number} Duration in seconds
     */
    getDuration() {
        return this.frames.length / this.fps;
    }

    /**
     * Clear all frames
     */
    clear() {
        this.pause();
        this.frames = [];
        this.currentFrame = 0;
    }

    /**
     * Get animation status
     * @returns {Object} Status object
     */
    getStatus() {
        return {
            frameCount: this.frames.length,
            currentFrame: this.currentFrame,
            isPlaying: this.isPlaying,
            fps: this.fps,
            duration: this.getDuration()
        };
    }

    /**
     * Duplicate frame
     * @param {number} index - Frame to duplicate
     */
    duplicateFrame(index) {
        const frame = this.getFrame(index);
        if (frame) {
            const duplicate = {
                ...frame,
                timestamp: Date.now(),
                duplicatedFrom: index
            };
            this.frames.splice(index + 1, 0, duplicate);
        }
    }

    /**
     * Reverse frame order
     */
    reverseFrames() {
        this.frames.reverse();
        this.currentFrame = this.frames.length - 1 - this.currentFrame;
    }

    /**
     * Export frames as array
     * @returns {Array} Frames array
     */
    exportFrames() {
        return this.frames.map(frame => ({
            content: frame.content,
            timestamp: frame.timestamp
        }));
    }

    /**
     * Import frames from array
     * @param {Array} frames - Frames to import
     */
    importFrames(frames) {
        this.clear();
        frames.forEach(frame => {
            this.addFrame(frame.content, { timestamp: frame.timestamp });
        });
    }

    /**
     * Get frame thumbnail (first few lines)
     * @param {number} index - Frame index
     * @param {number} lines - Number of lines
     * @returns {string} Thumbnail text
     */
    getFrameThumbnail(index, lines = 3) {
        const frame = this.getFrame(index);
        if (!frame) return '';

        return frame.content
            .split('\n')
            .slice(0, lines)
            .join('\n') + '...';
    }

    /**
     * Clone animation manager state
     * @returns {Object} Cloned state
     */
    clone() {
        return {
            frames: [...this.frames],
            currentFrame: this.currentFrame,
            fps: this.fps
        };
    }

    /**
     * Restore animation manager state
     * @param {Object} state - Saved state
     */
    restore(state) {
        this.pause();
        this.frames = [...state.frames];
        this.currentFrame = state.currentFrame;
        this.fps = state.fps;
    }
}
