/**
 * Modal Manager
 * Handles modal dialogs, drag, and resize functionality
 * Part of Issue #10 - app.js refactoring
 */

export class ModalManager {
    constructor(elements, eventManager) {
        this.elements = elements;
        this.eventManager = eventManager;
        this.modalState = {
            isDragging: false,
            isResizing: false,
            dragOffset: { x: 0, y: 0 },
            originalSize: { width: 0, height: 0 }
        };
        this.setupModalInteractions();
    }

    /**
     * Open modal with content
     * @param {string} content - Content to display
     */
    open(content) {
        const modal = this.elements.get('fullscreenModal');
        const body = this.elements.get('modalBody');

        if (!modal || !body) return;

        body.textContent = content;
        modal.classList.add('modal--visible');
        modal.setAttribute('aria-hidden', 'false');

        // Focus close button for accessibility
        const closeBtn = this.elements.get('closeModal');
        if (closeBtn) {
            closeBtn.focus();
        }

        // Trigger custom event
        this.eventManager.trigger(modal, 'modal:opened', { content });
    }

    /**
     * Close modal
     */
    close() {
        const modal = this.elements.get('fullscreenModal');
        const modalContent = this.elements.get('modalContent');

        if (!modal) return;

        // Reset modal state
        this.modalState.isDragging = false;
        this.modalState.isResizing = false;

        // Reset modal appearance
        if (modalContent) {
            modalContent.style.position = '';
            modalContent.style.left = '';
            modalContent.style.top = '';
            modalContent.style.width = '';
            modalContent.style.height = '';
            modalContent.style.margin = '';
            modalContent.style.cursor = '';
            modalContent.classList.remove('modal__content--dragging', 'modal__content--resizing');
        }

        modal.classList.remove('modal--visible');
        modal.setAttribute('aria-hidden', 'true');

        // Trigger custom event
        this.eventManager.trigger(modal, 'modal:closed');
    }

    /**
     * Setup modal drag and resize interactions
     */
    setupModalInteractions() {
        const modalHeader = this.elements.get('modalHeader');
        const resizeHandle = this.elements.get('resizeHandle');
        const closeBtn = this.elements.get('closeModal');

        // Header dragging
        if (modalHeader) {
            this.eventManager.on(modalHeader, 'mousedown', (e) => {
                if (e.target === closeBtn) return;
                this.startDragging(e);
            });
        }

        // Resize handle
        if (resizeHandle) {
            this.eventManager.on(resizeHandle, 'mousedown', (e) => {
                this.startResizing(e);
            });
        }

        // Close button
        if (closeBtn) {
            this.eventManager.on(closeBtn, 'click', () => this.close());
        }

        // Global mouse events for dragging/resizing
        this.eventManager.on(document, 'mousemove', (e) => {
            if (this.modalState.isDragging) {
                this.handleDragging(e);
            } else if (this.modalState.isResizing) {
                this.handleResizing(e);
            }
        });

        this.eventManager.on(document, 'mouseup', () => {
            this.stopDragging();
            this.stopResizing();
        });

        // Keyboard shortcuts
        this.eventManager.on(document, 'keydown', (e) => {
            const modal = this.elements.get('fullscreenModal');
            if (modal && modal.classList.contains('modal--visible')) {
                if (e.key === 'Escape') {
                    this.close();
                }
            }
        });
    }

    /**
     * Start dragging modal
     * @param {MouseEvent} e - Mouse event
     */
    startDragging(e) {
        this.modalState.isDragging = true;
        const modalContent = this.elements.get('modalContent');

        if (!modalContent) return;

        const rect = modalContent.getBoundingClientRect();

        this.modalState.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        modalContent.classList.add('modal__content--dragging');
        modalContent.style.position = 'fixed';
        modalContent.style.left = rect.left + 'px';
        modalContent.style.top = rect.top + 'px';
        modalContent.style.margin = '0';

        e.preventDefault();
    }

    /**
     * Handle dragging modal
     * @param {MouseEvent} e - Mouse event
     */
    handleDragging(e) {
        if (!this.modalState.isDragging) return;

        const modalContent = this.elements.get('modalContent');
        if (!modalContent) return;

        const newX = e.clientX - this.modalState.dragOffset.x;
        const newY = e.clientY - this.modalState.dragOffset.y;

        // Keep modal within viewport
        const maxX = window.innerWidth - modalContent.offsetWidth;
        const maxY = window.innerHeight - modalContent.offsetHeight;

        modalContent.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
        modalContent.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
    }

    /**
     * Stop dragging modal
     */
    stopDragging() {
        if (!this.modalState.isDragging) return;

        this.modalState.isDragging = false;
        const modalContent = this.elements.get('modalContent');

        if (modalContent) {
            modalContent.classList.remove('modal__content--dragging');
        }
    }

    /**
     * Start resizing modal
     * @param {MouseEvent} e - Mouse event
     */
    startResizing(e) {
        this.modalState.isResizing = true;
        const modalContent = this.elements.get('modalContent');

        if (!modalContent) return;

        this.modalState.originalSize = {
            width: modalContent.offsetWidth,
            height: modalContent.offsetHeight,
            mouseX: e.clientX,
            mouseY: e.clientY
        };

        modalContent.classList.add('modal__content--resizing');
        e.preventDefault();
    }

    /**
     * Handle resizing modal
     * @param {MouseEvent} e - Mouse event
     */
    handleResizing(e) {
        if (!this.modalState.isResizing) return;

        const modalContent = this.elements.get('modalContent');
        if (!modalContent) return;

        const deltaX = e.clientX - this.modalState.originalSize.mouseX;
        const deltaY = e.clientY - this.modalState.originalSize.mouseY;

        const newWidth = Math.max(400, this.modalState.originalSize.width + deltaX);
        const newHeight = Math.max(300, this.modalState.originalSize.height + deltaY);

        modalContent.style.width = newWidth + 'px';
        modalContent.style.height = newHeight + 'px';
    }

    /**
     * Stop resizing modal
     */
    stopResizing() {
        if (!this.modalState.isResizing) return;

        this.modalState.isResizing = false;
        const modalContent = this.elements.get('modalContent');

        if (modalContent) {
            modalContent.classList.remove('modal__content--resizing');
        }
    }

    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        const modalContent = this.elements.get('modalContent');
        if (!modalContent) return;

        modalContent.classList.toggle('modal__content--fullscreen');
    }
}
