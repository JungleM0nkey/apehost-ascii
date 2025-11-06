/**
 * History Manager
 * Undo/Redo functionality for ASCII generation
 * Implements Issue #16 - Undo/Redo System
 */

export class HistoryManager {
    constructor(maxSize = 50) {
        this.history = [];
        this.currentIndex = -1;
        this.maxSize = maxSize;
    }

    /**
     * Push a new state to history
     * @param {Object} state - State to save
     */
    push(state) {
        // Remove any "future" history
        this.history = this.history.slice(0, this.currentIndex + 1);

        // Add new state
        this.history.push({
            ...state,
            timestamp: Date.now()
        });

        // Limit size
        if (this.history.length > this.maxSize) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }
    }

    /**
     * Undo to previous state
     * @returns {Object|null} Previous state
     */
    undo() {
        if (this.canUndo()) {
            this.currentIndex--;
            return this.history[this.currentIndex];
        }
        return null;
    }

    /**
     * Redo to next state
     * @returns {Object|null} Next state
     */
    redo() {
        if (this.canRedo()) {
            this.currentIndex++;
            return this.history[this.currentIndex];
        }
        return null;
    }

    /**
     * Check if undo is available
     * @returns {boolean}
     */
    canUndo() {
        return this.currentIndex > 0;
    }

    /**
     * Check if redo is available
     * @returns {boolean}
     */
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    /**
     * Get current state
     * @returns {Object|null}
     */
    getCurrentState() {
        if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
            return this.history[this.currentIndex];
        }
        return null;
    }

    /**
     * Clear all history
     */
    clear() {
        this.history = [];
        this.currentIndex = -1;
    }

    /**
     * Get history size
     * @returns {number}
     */
    size() {
        return this.history.length;
    }
}
