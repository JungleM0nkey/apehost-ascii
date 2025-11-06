import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventManager } from '../../../public/js/managers/event-manager.js';

describe('EventManager', () => {
    let eventManager;
    let mockElement;

    beforeEach(() => {
        eventManager = new EventManager();

        // Create mock element with dataset
        mockElement = {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dataset: {},
            contains: vi.fn(() => true),
            closest: vi.fn()
        };
    });

    describe('on', () => {
        it('should add event listener to element', () => {
            const handler = vi.fn();

            eventManager.on(mockElement, 'click', handler);

            expect(mockElement.addEventListener).toHaveBeenCalledWith('click', handler, {});
        });

        it('should track listener for cleanup', () => {
            const handler = vi.fn();

            eventManager.on(mockElement, 'click', handler);

            expect(eventManager.listeners.size).toBeGreaterThan(0);
        });

        it('should handle options', () => {
            const handler = vi.fn();
            const options = { once: true };

            eventManager.on(mockElement, 'click', handler, options);

            expect(mockElement.addEventListener).toHaveBeenCalledWith('click', handler, options);
        });

        it('should handle null element gracefully', () => {
            expect(() => {
                eventManager.on(null, 'click', vi.fn());
            }).not.toThrow();
        });
    });

    describe('off', () => {
        it('should remove event listener from element', () => {
            const handler = vi.fn();

            eventManager.on(mockElement, 'click', handler);
            eventManager.off(mockElement, 'click', handler);

            expect(mockElement.removeEventListener).toHaveBeenCalledWith('click', handler);
        });

        it('should handle null element gracefully', () => {
            expect(() => {
                eventManager.off(null, 'click', vi.fn());
            }).not.toThrow();
        });
    });

    describe('once', () => {
        it('should add one-time event listener', () => {
            const handler = vi.fn();
            mockElement.addEventListener = vi.fn((event, fn) => {
                // Simulate event firing
                fn({ type: event });
            });

            eventManager.once(mockElement, 'click', handler);

            expect(handler).toHaveBeenCalledTimes(1);
        });
    });

    describe('trigger', () => {
        it('should dispatch custom event', () => {
            mockElement.dispatchEvent = vi.fn();

            eventManager.trigger(mockElement, 'custom:event', { data: 'test' });

            expect(mockElement.dispatchEvent).toHaveBeenCalled();
        });

        it('should include detail in custom event', () => {
            let capturedEvent;
            mockElement.dispatchEvent = vi.fn((event) => {
                capturedEvent = event;
            });

            const detail = { data: 'test' };
            eventManager.trigger(mockElement, 'custom:event', detail);

            expect(capturedEvent.detail).toEqual(detail);
        });

        it('should handle null element gracefully', () => {
            expect(() => {
                eventManager.trigger(null, 'custom:event');
            }).not.toThrow();
        });
    });

    describe('debounce', () => {
        it('should debounce function calls', async () => {
            const fn = vi.fn();
            const debounced = eventManager.debounce(fn, 100);

            debounced();
            debounced();
            debounced();

            expect(fn).not.toHaveBeenCalled();

            await new Promise(resolve => setTimeout(resolve, 150));

            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should pass arguments to debounced function', async () => {
            const fn = vi.fn();
            const debounced = eventManager.debounce(fn, 50);

            debounced('arg1', 'arg2');

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
        });
    });

    describe('throttle', () => {
        it('should throttle function calls', async () => {
            const fn = vi.fn();
            const throttled = eventManager.throttle(fn, 100);

            throttled();
            throttled();
            throttled();

            expect(fn).toHaveBeenCalledTimes(1);

            await new Promise(resolve => setTimeout(resolve, 150));

            throttled();
            expect(fn).toHaveBeenCalledTimes(2);
        });
    });

    describe('getListenerKey', () => {
        it('should generate unique key for element', () => {
            const key1 = eventManager.getListenerKey(mockElement, 'click');
            const key2 = eventManager.getListenerKey(mockElement, 'click');

            expect(key1).toBe(key2);
            expect(key1).toContain('click');
        });

        it('should create eventId if not exists', () => {
            eventManager.getListenerKey(mockElement, 'click');

            expect(mockElement.dataset.eventId).toBeDefined();
        });
    });

    describe('removeAllListeners', () => {
        it('should remove all listeners from element', () => {
            const handler1 = vi.fn();
            const handler2 = vi.fn();

            eventManager.on(mockElement, 'click', handler1);
            eventManager.on(mockElement, 'keydown', handler2);

            eventManager.removeAllListeners(mockElement);

            expect(mockElement.removeEventListener).toHaveBeenCalledTimes(2);
        });

        it('should handle null element gracefully', () => {
            expect(() => {
                eventManager.removeAllListeners(null);
            }).not.toThrow();
        });
    });

    describe('delegate', () => {
        it('should add delegated event listener', () => {
            const handler = vi.fn();

            eventManager.delegate(mockElement, '.child', 'click', handler);

            expect(mockElement.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        it('should track delegated listener', () => {
            const handler = vi.fn();

            eventManager.delegate(mockElement, '.child', 'click', handler);

            expect(eventManager.delegatedListeners.size).toBeGreaterThan(0);
        });
    });

    describe('undelegate', () => {
        it('should remove delegated event listener', () => {
            const handler = vi.fn();

            eventManager.delegate(mockElement, '.child', 'click', handler);
            eventManager.undelegate(mockElement, '.child', 'click');

            expect(mockElement.removeEventListener).toHaveBeenCalled();
        });
    });

    describe('destroy', () => {
        it('should clean up all listeners', () => {
            const handler = vi.fn();
            eventManager.on(mockElement, 'click', handler);

            eventManager.destroy();

            expect(eventManager.listeners.size).toBe(0);
            expect(eventManager.delegatedListeners.size).toBe(0);
        });
    });
});
