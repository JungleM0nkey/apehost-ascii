/**
 * Event Manager
 * Centralized event handling and delegation
 * Part of Issue #10 - app.js refactoring
 */

export class EventManager {
    constructor() {
        this.listeners = new Map();
        this.delegatedListeners = new Map();
    }

    /**
     * Add event listener
     * @param {HTMLElement} element - Target element
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    on(element, event, handler, options = {}) {
        if (!element) return;

        element.addEventListener(event, handler, options);

        // Track for cleanup
        const key = this.getListenerKey(element, event);
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push({ handler, options });
    }

    /**
     * Remove event listener
     * @param {HTMLElement} element - Target element
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    off(element, event, handler) {
        if (!element) return;

        element.removeEventListener(event, handler);

        // Remove from tracking
        const key = this.getListenerKey(element, event);
        if (this.listeners.has(key)) {
            const listeners = this.listeners.get(key);
            const index = listeners.findIndex(l => l.handler === handler);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Add delegated event listener
     * @param {HTMLElement} parent - Parent element
     * @param {string} selector - Child selector
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    delegate(parent, selector, event, handler) {
        if (!parent) return;

        const delegatedHandler = (e) => {
            const target = e.target.closest(selector);
            if (target && parent.contains(target)) {
                handler.call(target, e);
            }
        };

        parent.addEventListener(event, delegatedHandler);

        // Track for cleanup
        const key = `${this.getListenerKey(parent, event)}:${selector}`;
        this.delegatedListeners.set(key, delegatedHandler);
    }

    /**
     * Remove delegated event listener
     * @param {HTMLElement} parent - Parent element
     * @param {string} selector - Child selector
     * @param {string} event - Event name
     */
    undelegate(parent, selector, event) {
        if (!parent) return;

        const key = `${this.getListenerKey(parent, event)}:${selector}`;
        const handler = this.delegatedListeners.get(key);

        if (handler) {
            parent.removeEventListener(event, handler);
            this.delegatedListeners.delete(key);
        }
    }

    /**
     * Add one-time event listener
     * @param {HTMLElement} element - Target element
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    once(element, event, handler) {
        if (!element) return;

        const onceHandler = (e) => {
            handler(e);
            this.off(element, event, onceHandler);
        };

        this.on(element, event, onceHandler);
    }

    /**
     * Trigger custom event
     * @param {HTMLElement} element - Target element
     * @param {string} eventName - Event name
     * @param {Object} detail - Event detail data
     */
    trigger(element, eventName, detail = {}) {
        if (!element) return;

        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });

        element.dispatchEvent(event);
    }

    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in ms
     * @returns {Function} Throttled function
     */
    throttle(func, limit = 300) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Get unique key for listener tracking
     * @param {HTMLElement} element - Element
     * @param {string} event - Event name
     * @returns {string} Unique key
     */
    getListenerKey(element, event) {
        // Use element's data attribute or create one
        if (!element.dataset.eventId) {
            element.dataset.eventId = `evt_${Date.now()}_${Math.random()}`;
        }
        return `${element.dataset.eventId}:${event}`;
    }

    /**
     * Remove all listeners from an element
     * @param {HTMLElement} element - Target element
     */
    removeAllListeners(element) {
        if (!element) return;

        // Remove tracked listeners
        for (const [key, listeners] of this.listeners.entries()) {
            if (key.startsWith(element.dataset.eventId)) {
                const [, event] = key.split(':');
                listeners.forEach(({ handler }) => {
                    element.removeEventListener(event, handler);
                });
                this.listeners.delete(key);
            }
        }

        // Remove delegated listeners
        for (const [key, handler] of this.delegatedListeners.entries()) {
            if (key.startsWith(element.dataset.eventId)) {
                const [, event] = key.split(':')[0].split(':');
                element.removeEventListener(event, handler);
                this.delegatedListeners.delete(key);
            }
        }
    }

    /**
     * Clean up all event listeners
     */
    destroy() {
        // Remove all listeners
        for (const [key, listeners] of this.listeners.entries()) {
            const [elementId, event] = key.split(':');
            const element = document.querySelector(`[data-event-id="${elementId}"]`);
            if (element) {
                listeners.forEach(({ handler }) => {
                    element.removeEventListener(event, handler);
                });
            }
        }

        // Remove all delegated listeners
        for (const [key, handler] of this.delegatedListeners.entries()) {
            const [elementId, event] = key.split(':');
            const element = document.querySelector(`[data-event-id="${elementId}"]`);
            if (element) {
                element.removeEventListener(event, handler);
            }
        }

        this.listeners.clear();
        this.delegatedListeners.clear();
    }
}
