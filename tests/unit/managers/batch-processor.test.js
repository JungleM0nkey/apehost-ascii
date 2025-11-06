import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BatchProcessor } from '../../../public/js/managers/batch-processor.js';

describe('BatchProcessor', () => {
    let batchProcessor;

    beforeEach(() => {
        batchProcessor = new BatchProcessor();
    });

    describe('addFiles', () => {
        it('should add files to queue', () => {
            const files = [
                { name: 'file1.txt' },
                { name: 'file2.txt' }
            ];
            const settings = { option: 'value' };

            batchProcessor.addFiles(files, settings);

            expect(batchProcessor.queue).toHaveLength(2);
            expect(batchProcessor.queue[0].file).toBe(files[0]);
            expect(batchProcessor.queue[0].status).toBe('pending');
        });

        it('should store settings with each file', () => {
            const files = [{ name: 'file1.txt' }];
            const settings = { mode: 'test' };

            batchProcessor.addFiles(files, settings);

            expect(batchProcessor.queue[0].settings).toBe(settings);
        });
    });

    describe('addTexts', () => {
        it('should add texts to queue', () => {
            const texts = ['text1', 'text2', 'text3'];
            const settings = { option: 'value' };

            batchProcessor.addTexts(texts, settings);

            expect(batchProcessor.queue).toHaveLength(3);
            expect(batchProcessor.queue[0].text).toBe('text1');
            expect(batchProcessor.queue[0].index).toBe(0);
        });
    });

    describe('process', () => {
        it('should process all items in queue', async () => {
            batchProcessor.addTexts(['text1', 'text2']);

            const processor = vi.fn(async (item) => {
                return `processed: ${item.text}`;
            });

            const results = await batchProcessor.process(processor);

            expect(processor).toHaveBeenCalledTimes(2);
            expect(results).toHaveLength(2);
            expect(results[0].success).toBe(true);
        });

        it('should call progress callback', async () => {
            batchProcessor.addTexts(['text1', 'text2']);

            const processor = vi.fn(async () => 'result');
            const onProgress = vi.fn();
            batchProcessor.onProgress = onProgress;

            await batchProcessor.process(processor);

            expect(onProgress).toHaveBeenCalledTimes(2);
            expect(onProgress).toHaveBeenCalledWith(
                expect.objectContaining({
                    current: 1,
                    total: 2,
                    percent: 50
                })
            );
        });

        it('should handle processing errors', async () => {
            batchProcessor.addTexts(['text1', 'text2']);

            const processor = vi.fn(async (item) => {
                if (item.index === 0) {
                    throw new Error('Processing failed');
                }
                return 'success';
            });

            const onError = vi.fn();
            batchProcessor.onError = onError;

            const results = await batchProcessor.process(processor);

            expect(results[0].success).toBe(false);
            expect(results[1].success).toBe(true);
            expect(onError).toHaveBeenCalledTimes(1);
        });

        it('should call complete callback', async () => {
            batchProcessor.addTexts(['text1']);

            const processor = vi.fn(async () => 'result');
            const onComplete = vi.fn();
            batchProcessor.onComplete = onComplete;

            await batchProcessor.process(processor);

            expect(onComplete).toHaveBeenCalledWith(batchProcessor.results);
        });

        it('should throw if already processing', async () => {
            batchProcessor.addTexts(['text1']);
            batchProcessor.processing = true;

            await expect(
                batchProcessor.process(async () => 'result')
            ).rejects.toThrow('already in progress');
        });
    });

    describe('processParallel', () => {
        it('should process items in parallel', async () => {
            batchProcessor.addTexts(['text1', 'text2', 'text3', 'text4']);

            const processor = vi.fn(async (item) => {
                return `processed: ${item.text}`;
            });

            const results = await batchProcessor.processParallel(processor, 2);

            expect(results).toHaveLength(4);
            expect(results.every(r => r.success)).toBe(true);
        });

        it('should respect concurrency limit', async () => {
            batchProcessor.addTexts(['t1', 't2', 't3', 't4', 't5', 't6']);

            let concurrent = 0;
            let maxConcurrent = 0;

            const processor = vi.fn(async () => {
                concurrent++;
                maxConcurrent = Math.max(maxConcurrent, concurrent);
                await new Promise(resolve => setTimeout(resolve, 10));
                concurrent--;
                return 'result';
            });

            await batchProcessor.processParallel(processor, 2);

            expect(maxConcurrent).toBeLessThanOrEqual(2);
        });
    });

    describe('getStatus', () => {
        it('should return processing status', () => {
            batchProcessor.addTexts(['text1', 'text2', 'text3']);
            batchProcessor.queue[0].status = 'completed';
            batchProcessor.queue[1].status = 'processing';
            batchProcessor.queue[2].status = 'pending';

            const status = batchProcessor.getStatus();

            expect(status.total).toBe(3);
            expect(status.completed).toBe(1);
            expect(status.processing).toBe(1);
            expect(status.pending).toBe(1);
            expect(status.percent).toBe(33); // 1/3 = 33%
        });

        it('should return 0% for empty queue', () => {
            const status = batchProcessor.getStatus();

            expect(status.percent).toBe(0);
        });
    });

    describe('clear', () => {
        it('should clear queue and results', () => {
            batchProcessor.addTexts(['text1', 'text2']);
            batchProcessor.results = [{ success: true }];
            batchProcessor.processing = true;

            batchProcessor.clear();

            expect(batchProcessor.queue).toHaveLength(0);
            expect(batchProcessor.results).toHaveLength(0);
            expect(batchProcessor.processing).toBe(false);
        });
    });

    describe('cancel', () => {
        it('should cancel processing', () => {
            batchProcessor.addTexts(['text1', 'text2']);
            batchProcessor.processing = true;

            batchProcessor.cancel();

            expect(batchProcessor.processing).toBe(false);
            expect(batchProcessor.queue.every(item =>
                item.status === 'cancelled' || item.status === 'pending'
            )).toBe(true);
        });
    });

    describe('retryFailed', () => {
        it('should retry only failed items', async () => {
            batchProcessor.addTexts(['text1', 'text2', 'text3']);
            batchProcessor.queue[0].status = 'completed';
            batchProcessor.queue[1].status = 'failed';
            batchProcessor.queue[2].status = 'failed';

            const processor = vi.fn(async () => 'result');

            await batchProcessor.retryFailed(processor);

            expect(processor).toHaveBeenCalledTimes(2);
        });

        it('should return empty array if no failed items', async () => {
            batchProcessor.addTexts(['text1']);
            batchProcessor.queue[0].status = 'completed';

            const processor = vi.fn(async () => 'result');
            const results = await batchProcessor.retryFailed(processor);

            expect(results).toHaveLength(0);
        });
    });

    describe('chunkArray', () => {
        it('should chunk array into smaller arrays', () => {
            const array = [1, 2, 3, 4, 5, 6, 7];
            const chunks = batchProcessor.chunkArray(array, 3);

            expect(chunks).toHaveLength(3);
            expect(chunks[0]).toEqual([1, 2, 3]);
            expect(chunks[1]).toEqual([4, 5, 6]);
            expect(chunks[2]).toEqual([7]);
        });

        it('should handle empty array', () => {
            const chunks = batchProcessor.chunkArray([], 3);

            expect(chunks).toHaveLength(0);
        });
    });

    describe('parseCSV', () => {
        it('should parse CSV file', async () => {
            const csvContent = 'value1,extra\nvalue2,extra\nvalue3,extra';
            const file = new Blob([csvContent], { type: 'text/csv' });
            file.text = async () => csvContent;

            const texts = await batchProcessor.parseCSV(file);

            expect(texts).toEqual(['value1', 'value2', 'value3']);
        });

        it('should filter empty lines', async () => {
            const csvContent = 'value1\n\nvalue2\n\n';
            const file = new Blob([csvContent], { type: 'text/csv' });
            file.text = async () => csvContent;

            const texts = await batchProcessor.parseCSV(file);

            expect(texts).toEqual(['value1', 'value2']);
        });
    });

    describe('parseTextFile', () => {
        it('should parse text file with delimiter', async () => {
            const content = 'entry1\n---\nentry2\n---\nentry3';
            const file = new Blob([content], { type: 'text/plain' });
            file.text = async () => content;

            const texts = await batchProcessor.parseTextFile(file);

            expect(texts).toEqual(['entry1', 'entry2', 'entry3']);
        });

        it('should use custom delimiter', async () => {
            const content = 'entry1|||entry2|||entry3';
            const file = new Blob([content], { type: 'text/plain' });
            file.text = async () => content;

            const texts = await batchProcessor.parseTextFile(file, '|||');

            expect(texts).toEqual(['entry1', 'entry2', 'entry3']);
        });
    });
});
