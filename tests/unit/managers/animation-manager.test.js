import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AnimationManager } from '../../../public/js/managers/animation-manager.js';

describe('AnimationManager', () => {
    let animationManager;
    let mockElements;
    let mockEventManager;

    beforeEach(() => {
        vi.useFakeTimers();

        mockElements = new Map();
        mockEventManager = {
            on: vi.fn(),
            trigger: vi.fn()
        };

        animationManager = new AnimationManager(mockElements, mockEventManager);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe('addFrame', () => {
        it('should add frame to animation', () => {
            animationManager.addFrame('frame content', { name: 'Frame 1' });

            expect(animationManager.frames).toHaveLength(1);
            expect(animationManager.frames[0].content).toBe('frame content');
            expect(animationManager.frames[0].name).toBe('Frame 1');
        });

        it('should add timestamp to frame', () => {
            animationManager.addFrame('content');

            expect(animationManager.frames[0].timestamp).toBeDefined();
        });
    });

    describe('removeFrame', () => {
        it('should remove frame at index', () => {
            animationManager.addFrame('frame1');
            animationManager.addFrame('frame2');
            animationManager.addFrame('frame3');

            animationManager.removeFrame(1);

            expect(animationManager.frames).toHaveLength(2);
            expect(animationManager.frames[0].content).toBe('frame1');
            expect(animationManager.frames[1].content).toBe('frame3');
        });

        it('should adjust current frame if needed', () => {
            animationManager.addFrame('frame1');
            animationManager.addFrame('frame2');
            animationManager.currentFrame = 1;

            animationManager.removeFrame(1);

            expect(animationManager.currentFrame).toBe(0);
        });

        it('should handle invalid index', () => {
            animationManager.addFrame('frame1');

            expect(() => {
                animationManager.removeFrame(5);
            }).not.toThrow();
        });
    });

    describe('updateFrame', () => {
        it('should update frame content', () => {
            animationManager.addFrame('original content');

            animationManager.updateFrame(0, 'updated content');

            expect(animationManager.frames[0].content).toBe('updated content');
            expect(animationManager.frames[0].modified).toBeDefined();
        });

        it('should handle invalid index', () => {
            expect(() => {
                animationManager.updateFrame(5, 'content');
            }).not.toThrow();
        });
    });

    describe('getFrame', () => {
        it('should return frame at index', () => {
            animationManager.addFrame('frame content');

            const frame = animationManager.getFrame(0);

            expect(frame.content).toBe('frame content');
        });

        it('should return null for invalid index', () => {
            const frame = animationManager.getFrame(5);

            expect(frame).toBeNull();
        });
    });

    describe('getCurrentFrame', () => {
        it('should return current frame', () => {
            animationManager.addFrame('frame1');
            animationManager.addFrame('frame2');
            animationManager.currentFrame = 1;

            const frame = animationManager.getCurrentFrame();

            expect(frame.content).toBe('frame2');
        });
    });

    describe('setCurrentFrame', () => {
        it('should set current frame', () => {
            animationManager.addFrame('frame1');
            animationManager.addFrame('frame2');

            animationManager.setCurrentFrame(1);

            expect(animationManager.currentFrame).toBe(1);
        });

        it('should call onFrameChange callback', () => {
            animationManager.addFrame('frame1');
            animationManager.addFrame('frame2');

            const callback = vi.fn();
            animationManager.onFrameChange = callback;

            animationManager.setCurrentFrame(1);

            expect(callback).toHaveBeenCalledWith(animationManager.frames[1], 1);
        });

        it('should not set invalid frame index', () => {
            animationManager.addFrame('frame1');
            animationManager.currentFrame = 0;

            animationManager.setCurrentFrame(5);

            expect(animationManager.currentFrame).toBe(0);
        });
    });

    describe('nextFrame', () => {
        it('should advance to next frame', () => {
            animationManager.addFrame('frame1');
            animationManager.addFrame('frame2');
            animationManager.currentFrame = 0;

            animationManager.nextFrame();

            expect(animationManager.currentFrame).toBe(1);
        });

        it('should loop back to first frame', () => {
            animationManager.addFrame('frame1');
            animationManager.addFrame('frame2');
            animationManager.currentFrame = 1;

            animationManager.nextFrame();

            expect(animationManager.currentFrame).toBe(0);
        });
    });

    describe('previousFrame', () => {
        it('should go to previous frame', () => {
            animationManager.addFrame('frame1');
            animationManager.addFrame('frame2');
            animationManager.currentFrame = 1;

            animationManager.previousFrame();

            expect(animationManager.currentFrame).toBe(0);
        });

        it('should loop to last frame', () => {
            animationManager.addFrame('frame1');
            animationManager.addFrame('frame2');
            animationManager.currentFrame = 0;

            animationManager.previousFrame();

            expect(animationManager.currentFrame).toBe(1);
        });
    });

    describe('play', () => {
        it('should start animation playback', () => {
            animationManager.addFrame('frame1');
            animationManager.addFrame('frame2');

            animationManager.play();

            expect(animationManager.isPlaying).toBe(true);
        });

        it('should advance frames automatically', () => {
            animationManager.addFrame('frame1');
            animationManager.addFrame('frame2');
            animationManager.addFrame('frame3');

            animationManager.play();

            vi.advanceTimersByTime(100); // 10 fps = 100ms per frame
            expect(animationManager.currentFrame).toBe(1);

            vi.advanceTimersByTime(100);
            expect(animationManager.currentFrame).toBe(2);
        });

        it('should not play if already playing', () => {
            animationManager.addFrame('frame1');
            animationManager.isPlaying = true;

            animationManager.play();

            expect(animationManager.animationTimer).toBeNull();
        });
    });

    describe('pause', () => {
        it('should pause animation playback', () => {
            animationManager.addFrame('frame1');
            animationManager.addFrame('frame2');

            animationManager.play();
            animationManager.pause();

            expect(animationManager.isPlaying).toBe(false);
        });

        it('should clear animation timer', () => {
            animationManager.addFrame('frame1');
            animationManager.play();

            animationManager.pause();

            expect(animationManager.animationTimer).toBeNull();
        });
    });

    describe('stop', () => {
        it('should stop and reset to first frame', () => {
            animationManager.addFrame('frame1');
            animationManager.addFrame('frame2');

            animationManager.play();
            vi.advanceTimersByTime(100);

            animationManager.stop();

            expect(animationManager.isPlaying).toBe(false);
            expect(animationManager.currentFrame).toBe(0);
        });
    });

    describe('setFPS', () => {
        it('should set frames per second', () => {
            animationManager.setFPS(30);

            expect(animationManager.fps).toBe(30);
        });

        it('should clamp FPS to valid range', () => {
            animationManager.setFPS(0);
            expect(animationManager.fps).toBe(1);

            animationManager.setFPS(100);
            expect(animationManager.fps).toBe(60);
        });

        it('should restart playback if playing', () => {
            animationManager.addFrame('frame1');
            animationManager.play();

            animationManager.setFPS(20);

            expect(animationManager.isPlaying).toBe(true);
        });
    });

    describe('getDuration', () => {
        it('should calculate animation duration', () => {
            animationManager.addFrame('frame1');
            animationManager.addFrame('frame2');
            animationManager.addFrame('frame3');
            animationManager.fps = 10;

            const duration = animationManager.getDuration();

            expect(duration).toBe(0.3); // 3 frames at 10 fps = 0.3 seconds
        });
    });

    describe('clear', () => {
        it('should clear all frames', () => {
            animationManager.addFrame('frame1');
            animationManager.addFrame('frame2');
            animationManager.play();

            animationManager.clear();

            expect(animationManager.frames).toHaveLength(0);
            expect(animationManager.currentFrame).toBe(0);
            expect(animationManager.isPlaying).toBe(false);
        });
    });

    describe('getStatus', () => {
        it('should return animation status', () => {
            animationManager.addFrame('frame1');
            animationManager.addFrame('frame2');
            animationManager.currentFrame = 1;
            animationManager.fps = 15;

            const status = animationManager.getStatus();

            expect(status.frameCount).toBe(2);
            expect(status.currentFrame).toBe(1);
            expect(status.isPlaying).toBe(false);
            expect(status.fps).toBe(15);
            expect(status.duration).toBeCloseTo(0.133, 2);
        });
    });

    describe('duplicateFrame', () => {
        it('should duplicate frame', () => {
            animationManager.addFrame('original frame');

            animationManager.duplicateFrame(0);

            expect(animationManager.frames).toHaveLength(2);
            expect(animationManager.frames[1].content).toBe('original frame');
            expect(animationManager.frames[1].duplicatedFrom).toBe(0);
        });
    });

    describe('reverseFrames', () => {
        it('should reverse frame order', () => {
            animationManager.addFrame('frame1');
            animationManager.addFrame('frame2');
            animationManager.addFrame('frame3');
            animationManager.currentFrame = 1;

            animationManager.reverseFrames();

            expect(animationManager.frames[0].content).toBe('frame3');
            expect(animationManager.frames[1].content).toBe('frame2');
            expect(animationManager.frames[2].content).toBe('frame1');
            expect(animationManager.currentFrame).toBe(1); // Adjusted position
        });
    });

    describe('exportFrames', () => {
        it('should export frames array', () => {
            animationManager.addFrame('frame1');
            animationManager.addFrame('frame2');

            const exported = animationManager.exportFrames();

            expect(exported).toHaveLength(2);
            expect(exported[0].content).toBe('frame1');
            expect(exported[0].timestamp).toBeDefined();
        });
    });

    describe('importFrames', () => {
        it('should import frames array', () => {
            const frames = [
                { content: 'frame1', timestamp: Date.now() },
                { content: 'frame2', timestamp: Date.now() }
            ];

            animationManager.importFrames(frames);

            expect(animationManager.frames).toHaveLength(2);
            expect(animationManager.frames[0].content).toBe('frame1');
        });

        it('should clear existing frames', () => {
            animationManager.addFrame('existing');

            const frames = [
                { content: 'imported', timestamp: Date.now() }
            ];

            animationManager.importFrames(frames);

            expect(animationManager.frames).toHaveLength(1);
            expect(animationManager.frames[0].content).toBe('imported');
        });
    });

    describe('getFrameThumbnail', () => {
        it('should return first few lines of frame', () => {
            const content = 'line1\nline2\nline3\nline4\nline5';
            animationManager.addFrame(content);

            const thumbnail = animationManager.getFrameThumbnail(0, 3);

            expect(thumbnail).toBe('line1\nline2\nline3...');
        });
    });

    describe('clone', () => {
        it('should clone animation state', () => {
            animationManager.addFrame('frame1');
            animationManager.addFrame('frame2');
            animationManager.currentFrame = 1;
            animationManager.fps = 20;

            const cloned = animationManager.clone();

            expect(cloned.frames).toHaveLength(2);
            expect(cloned.currentFrame).toBe(1);
            expect(cloned.fps).toBe(20);
        });
    });

    describe('restore', () => {
        it('should restore animation state', () => {
            const state = {
                frames: [
                    { content: 'frame1', timestamp: Date.now() },
                    { content: 'frame2', timestamp: Date.now() }
                ],
                currentFrame: 1,
                fps: 20
            };

            animationManager.restore(state);

            expect(animationManager.frames).toHaveLength(2);
            expect(animationManager.currentFrame).toBe(1);
            expect(animationManager.fps).toBe(20);
        });

        it('should pause playback before restoring', () => {
            animationManager.addFrame('frame1');
            animationManager.play();

            const state = {
                frames: [{ content: 'new frame', timestamp: Date.now() }],
                currentFrame: 0,
                fps: 10
            };

            animationManager.restore(state);

            expect(animationManager.isPlaying).toBe(false);
        });
    });
});
