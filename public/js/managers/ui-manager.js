/**
 * UI Manager
 * Handles all UI updates and DOM manipulations
 * Part of Issue #10 - app.js refactoring
 */

export class UIManager {
    constructor(elements) {
        this.elements = elements;
    }

    /**
     * Update status message
     * @param {string} message - Status message
     * @param {string} type - Message type (info, success, error, warning)
     */
    updateStatus(message, type = 'info') {
        const statusElement = this.elements.get('status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status status--${type}`;
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        this.updateStatus(message, 'error');

        // Also show as toast notification
        this.showToast(message, 'error');
    }

    /**
     * Show success message
     * @param {string} message - Success message
     */
    showSuccess(message) {
        this.updateStatus(message, 'success');
        this.showToast(message, 'success');
    }

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Toast type (success, error, info, warning)
     */
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;

        // Add to document
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add('toast--visible'), 10);

        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('toast--visible');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Update output display
     * @param {string} content - ASCII art content
     */
    updateOutput(content) {
        const outputElement = this.elements.get('output');
        if (outputElement) {
            outputElement.textContent = content;
        }
    }

    /**
     * Clear output
     */
    clearOutput() {
        this.updateOutput('');
    }

    /**
     * Update character counter
     * @param {number} current - Current character count
     * @param {number} max - Maximum allowed
     */
    updateCharCounter(current, max) {
        const counter = this.elements.get('charCounter');
        if (counter) {
            counter.textContent = `${current}/${max}`;

            // Add warning class if near limit
            if (current > max * 0.9) {
                counter.classList.add('char-counter--warning');
            } else {
                counter.classList.remove('char-counter--warning');
            }
        }
    }

    /**
     * Show/hide loading indicator
     * @param {boolean} show - Whether to show loading
     * @param {string} message - Optional loading message
     */
    setLoading(show, message = 'Generating...') {
        const loader = this.elements.get('loader');
        if (loader) {
            if (show) {
                loader.classList.add('loader--visible');
                const loaderText = loader.querySelector('.loader__text');
                if (loaderText) {
                    loaderText.textContent = message;
                }
            } else {
                loader.classList.remove('loader--visible');
            }
        }
    }

    /**
     * Enable/disable button
     * @param {string} buttonId - Button element ID
     * @param {boolean} enabled - Whether button should be enabled
     */
    setButtonEnabled(buttonId, enabled) {
        const button = this.elements.get(buttonId);
        if (button) {
            button.disabled = !enabled;
        }
    }

    /**
     * Update button text
     * @param {string} buttonId - Button element ID
     * @param {string} text - New button text
     */
    updateButtonText(buttonId, text) {
        const button = this.elements.get(buttonId);
        if (button) {
            button.textContent = text;
        }
    }

    /**
     * Show/hide element
     * @param {string} elementId - Element ID
     * @param {boolean} show - Whether to show element
     */
    toggleElement(elementId, show) {
        const element = this.elements.get(elementId);
        if (element) {
            if (show) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    }

    /**
     * Update mode UI
     * @param {string} mode - Active mode
     */
    updateModeUI(mode) {
        // Update mode cards
        document.querySelectorAll('.mode-card').forEach(card => {
            const isActive = card.dataset.mode === mode;
            card.classList.toggle('mode-card--active', isActive);
            card.setAttribute('aria-selected', isActive.toString());
        });

        // Show/hide mode-specific panels
        document.querySelectorAll('.mode-panel').forEach(panel => {
            panel.classList.toggle('hidden', panel.dataset.mode !== mode);
        });
    }

    /**
     * Update palette UI
     * @param {string} palette - Active palette
     */
    updatePaletteUI(palette) {
        document.querySelectorAll('.palette-card').forEach(card => {
            const isActive = card.dataset.palette === palette;
            card.classList.toggle('palette-card--active', isActive);
            card.setAttribute('aria-pressed', isActive.toString());
        });

        // Apply CSS variables for theme
        this.applyPaletteStyles(palette);
    }

    /**
     * Apply palette styles to document
     * @param {string} paletteName - Palette name
     */
    applyPaletteStyles(paletteName) {
        const root = document.documentElement;

        // Palette colors would come from config
        const palettes = {
            orange: { primary: '#ff9500', secondary: '#ffcc00' },
            green: { primary: '#00ff00', secondary: '#00cc00' },
            blue: { primary: '#00aaff', secondary: '#0088cc' },
            purple: { primary: '#cc44ff', secondary: '#aa22dd' },
            red: { primary: '#ff4444', secondary: '#cc2222' },
            amber: { primary: '#ffaa00', secondary: '#dd8800' }
        };

        const colors = palettes[paletteName] || palettes.orange;
        root.style.setProperty('--primary', colors.primary);
        root.style.setProperty('--secondary', colors.secondary);
    }

    /**
     * Update progress bar
     * @param {number} percent - Progress percentage (0-100)
     */
    updateProgress(percent) {
        const progressBar = this.elements.get('progressBar');
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
            progressBar.setAttribute('aria-valuenow', percent);
        }
    }

    /**
     * Show modal
     * @param {string} modalId - Modal element ID
     */
    showModal(modalId) {
        const modal = this.elements.get(modalId);
        if (modal) {
            modal.classList.add('modal--visible');
            modal.setAttribute('aria-hidden', 'false');
        }
    }

    /**
     * Hide modal
     * @param {string} modalId - Modal element ID
     */
    hideModal(modalId) {
        const modal = this.elements.get(modalId);
        if (modal) {
            modal.classList.remove('modal--visible');
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Animate element
     * @param {string} elementId - Element ID
     * @param {string} animation - Animation class name
     */
    animate(elementId, animation) {
        const element = this.elements.get(elementId);
        if (element) {
            element.classList.add(animation);
            setTimeout(() => element.classList.remove(animation), 600);
        }
    }
}
