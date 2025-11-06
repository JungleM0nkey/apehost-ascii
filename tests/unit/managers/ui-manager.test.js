import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UIManager } from '../../../public/js/managers/ui-manager.js';

describe('UIManager', () => {
    let uiManager;
    let mockElements;

    beforeEach(() => {
        // Create mock DOM elements
        mockElements = new Map();

        const createMockElement = () => ({
            textContent: '',
            className: '',
            classList: {
                add: vi.fn(),
                remove: vi.fn(),
                toggle: vi.fn(),
                contains: vi.fn()
            },
            setAttribute: vi.fn(),
            style: {},
            disabled: false
        });

        mockElements.set('status', createMockElement());
        mockElements.set('output', createMockElement());
        mockElements.set('charCounter', createMockElement());
        mockElements.set('loader', {
            ...createMockElement(),
            querySelector: vi.fn(() => ({ textContent: '' }))
        });
        mockElements.set('progressBar', {
            ...createMockElement(),
            style: {}
        });

        uiManager = new UIManager(mockElements);
    });

    describe('updateStatus', () => {
        it('should update status element with message', () => {
            uiManager.updateStatus('Test message', 'info');

            const status = mockElements.get('status');
            expect(status.textContent).toBe('Test message');
            expect(status.className).toBe('status status--info');
        });

        it('should handle different message types', () => {
            const types = ['info', 'success', 'error', 'warning'];

            types.forEach(type => {
                uiManager.updateStatus('Test', type);
                const status = mockElements.get('status');
                expect(status.className).toBe(`status status--${type}`);
            });
        });

        it('should use default type if not specified', () => {
            uiManager.updateStatus('Test message');

            const status = mockElements.get('status');
            expect(status.className).toBe('status status--info');
        });
    });

    describe('showError', () => {
        it('should display error message', () => {
            vi.spyOn(uiManager, 'showToast');

            uiManager.showError('Error occurred');

            expect(mockElements.get('status').textContent).toBe('Error occurred');
            expect(uiManager.showToast).toHaveBeenCalledWith('Error occurred', 'error');
        });
    });

    describe('showSuccess', () => {
        it('should display success message', () => {
            vi.spyOn(uiManager, 'showToast');

            uiManager.showSuccess('Success!');

            expect(mockElements.get('status').textContent).toBe('Success!');
            expect(uiManager.showToast).toHaveBeenCalledWith('Success!', 'success');
        });
    });

    describe('updateOutput', () => {
        it('should update output element with content', () => {
            const content = 'ASCII art content';
            uiManager.updateOutput(content);

            expect(mockElements.get('output').textContent).toBe(content);
        });
    });

    describe('clearOutput', () => {
        it('should clear output element', () => {
            mockElements.get('output').textContent = 'Some content';
            uiManager.clearOutput();

            expect(mockElements.get('output').textContent).toBe('');
        });
    });

    describe('updateCharCounter', () => {
        it('should update character counter', () => {
            uiManager.updateCharCounter(50, 100);

            const counter = mockElements.get('charCounter');
            expect(counter.textContent).toBe('50/100');
        });

        it('should add warning class when near limit', () => {
            uiManager.updateCharCounter(95, 100);

            const counter = mockElements.get('charCounter');
            expect(counter.classList.add).toHaveBeenCalledWith('char-counter--warning');
        });

        it('should remove warning class when below threshold', () => {
            uiManager.updateCharCounter(50, 100);

            const counter = mockElements.get('charCounter');
            expect(counter.classList.remove).toHaveBeenCalledWith('char-counter--warning');
        });
    });

    describe('setLoading', () => {
        it('should show loading indicator', () => {
            uiManager.setLoading(true, 'Processing...');

            const loader = mockElements.get('loader');
            expect(loader.classList.add).toHaveBeenCalledWith('loader--visible');
        });

        it('should hide loading indicator', () => {
            uiManager.setLoading(false);

            const loader = mockElements.get('loader');
            expect(loader.classList.remove).toHaveBeenCalledWith('loader--visible');
        });
    });

    describe('setButtonEnabled', () => {
        it('should enable button', () => {
            const button = { disabled: true };
            mockElements.set('testBtn', button);

            uiManager.setButtonEnabled('testBtn', true);

            expect(button.disabled).toBe(false);
        });

        it('should disable button', () => {
            const button = { disabled: false };
            mockElements.set('testBtn', button);

            uiManager.setButtonEnabled('testBtn', false);

            expect(button.disabled).toBe(true);
        });
    });

    describe('updateButtonText', () => {
        it('should update button text', () => {
            const button = { textContent: 'Old Text' };
            mockElements.set('testBtn', button);

            uiManager.updateButtonText('testBtn', 'New Text');

            expect(button.textContent).toBe('New Text');
        });
    });

    describe('toggleElement', () => {
        it('should show element', () => {
            const element = {
                classList: {
                    add: vi.fn(),
                    remove: vi.fn()
                }
            };
            mockElements.set('testEl', element);

            uiManager.toggleElement('testEl', true);

            expect(element.classList.remove).toHaveBeenCalledWith('hidden');
        });

        it('should hide element', () => {
            const element = {
                classList: {
                    add: vi.fn(),
                    remove: vi.fn()
                }
            };
            mockElements.set('testEl', element);

            uiManager.toggleElement('testEl', false);

            expect(element.classList.add).toHaveBeenCalledWith('hidden');
        });
    });

    describe('updateProgress', () => {
        it('should update progress bar', () => {
            uiManager.updateProgress(75);

            const progressBar = mockElements.get('progressBar');
            expect(progressBar.style.width).toBe('75%');
            expect(progressBar.setAttribute).toHaveBeenCalledWith('aria-valuenow', 75);
        });

        it('should handle 0% progress', () => {
            uiManager.updateProgress(0);

            const progressBar = mockElements.get('progressBar');
            expect(progressBar.style.width).toBe('0%');
        });

        it('should handle 100% progress', () => {
            uiManager.updateProgress(100);

            const progressBar = mockElements.get('progressBar');
            expect(progressBar.style.width).toBe('100%');
        });
    });
});
