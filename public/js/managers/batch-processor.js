/**
 * Batch Processor
 * Process multiple files in batch mode
 * Implements Issue #18 - Batch Processing
 */

export class BatchProcessor {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.results = [];
        this.onProgress = null;
        this.onComplete = null;
        this.onError = null;
    }

    /**
     * Add files to batch queue
     * @param {Array<File>} files - Files to process
     * @param {Object} settings - Processing settings
     */
    addFiles(files, settings) {
        const items = Array.from(files).map(file => ({
            file,
            settings,
            status: 'pending',
            result: null,
            error: null
        }));

        this.queue.push(...items);
    }

    /**
     * Add texts to batch queue
     * @param {Array<string>} texts - Texts to process
     * @param {Object} settings - Processing settings
     */
    addTexts(texts, settings) {
        const items = texts.map((text, index) => ({
            text,
            index,
            settings,
            status: 'pending',
            result: null,
            error: null
        }));

        this.queue.push(...items);
    }

    /**
     * Start batch processing
     * @param {Function} processor - Processing function
     * @returns {Promise<Array>} Processing results
     */
    async process(processor) {
        if (this.processing) {
            throw new Error('Batch processing already in progress');
        }

        this.processing = true;
        this.results = [];

        const total = this.queue.length;

        for (let i = 0; i < this.queue.length; i++) {
            const item = this.queue[i];
            item.status = 'processing';

            try {
                // Process item
                const result = await processor(item);
                item.result = result;
                item.status = 'completed';
                this.results.push({ index: i, success: true, result });

                // Progress callback
                if (this.onProgress) {
                    this.onProgress({
                        current: i + 1,
                        total,
                        percent: Math.round(((i + 1) / total) * 100),
                        item
                    });
                }
            } catch (error) {
                item.error = error;
                item.status = 'failed';
                this.results.push({ index: i, success: false, error });

                // Error callback
                if (this.onError) {
                    this.onError({ item, error });
                }
            }

            // Small delay to prevent UI freezing
            await this.delay(10);
        }

        this.processing = false;

        // Complete callback
        if (this.onComplete) {
            this.onComplete(this.results);
        }

        return this.results;
    }

    /**
     * Process with parallel workers
     * @param {Function} processor - Processing function
     * @param {number} concurrency - Number of concurrent processes
     * @returns {Promise<Array>} Processing results
     */
    async processParallel(processor, concurrency = 3) {
        if (this.processing) {
            throw new Error('Batch processing already in progress');
        }

        this.processing = true;
        this.results = [];

        const total = this.queue.length;
        let completed = 0;

        // Process in chunks
        const chunks = this.chunkArray(this.queue, concurrency);

        for (const chunk of chunks) {
            // Process chunk in parallel
            const promises = chunk.map(async (item, localIndex) => {
                const globalIndex = completed + localIndex;
                item.status = 'processing';

                try {
                    const result = await processor(item);
                    item.result = result;
                    item.status = 'completed';

                    return { index: globalIndex, success: true, result };
                } catch (error) {
                    item.error = error;
                    item.status = 'failed';

                    if (this.onError) {
                        this.onError({ item, error });
                    }

                    return { index: globalIndex, success: false, error };
                }
            });

            const chunkResults = await Promise.all(promises);
            this.results.push(...chunkResults);

            completed += chunk.length;

            // Progress callback
            if (this.onProgress) {
                this.onProgress({
                    current: completed,
                    total,
                    percent: Math.round((completed / total) * 100)
                });
            }
        }

        this.processing = false;

        if (this.onComplete) {
            this.onComplete(this.results);
        }

        return this.results;
    }

    /**
     * Export batch results as ZIP
     * @param {Array} results - Processing results
     * @param {string} format - Export format (txt, svg, html)
     * @returns {Promise<Blob>} ZIP blob
     */
    async exportAsZip(results, format = 'txt') {
        // Note: In production, use JSZip library
        // For now, we'll create a simple implementation
        const zip = await this.createZip(results, format);
        return zip;
    }

    /**
     * Create ZIP file (simplified implementation)
     * @param {Array} results - Processing results
     * @param {string} format - Export format
     * @returns {Promise<Blob>} ZIP blob
     */
    async createZip(results, format) {
        // This is a placeholder - in production use JSZip
        // For now, return a text file with all results
        const combined = results
            .filter(r => r.success)
            .map((r, i) => `\n\n========== File ${i + 1} ==========\n\n${r.result}`)
            .join('\n');

        return new Blob([combined], { type: 'text/plain' });
    }

    /**
     * Download batch results
     * @param {Blob} blob - Data blob
     * @param {string} filename - Download filename
     */
    download(blob, filename = 'batch-results.zip') {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    /**
     * Get processing status
     * @returns {Object} Status object
     */
    getStatus() {
        const pending = this.queue.filter(item => item.status === 'pending').length;
        const processing = this.queue.filter(item => item.status === 'processing').length;
        const completed = this.queue.filter(item => item.status === 'completed').length;
        const failed = this.queue.filter(item => item.status === 'failed').length;

        return {
            total: this.queue.length,
            pending,
            processing,
            completed,
            failed,
            percent: this.queue.length > 0
                ? Math.round((completed / this.queue.length) * 100)
                : 0
        };
    }

    /**
     * Clear queue and results
     */
    clear() {
        this.queue = [];
        this.results = [];
        this.processing = false;
    }

    /**
     * Cancel processing
     */
    cancel() {
        this.processing = false;
        this.queue.forEach(item => {
            if (item.status === 'pending' || item.status === 'processing') {
                item.status = 'cancelled';
            }
        });
    }

    /**
     * Retry failed items
     * @param {Function} processor - Processing function
     * @returns {Promise<Array>} Retry results
     */
    async retryFailed(processor) {
        const failed = this.queue.filter(item => item.status === 'failed');

        if (failed.length === 0) {
            return [];
        }

        // Reset failed items
        failed.forEach(item => {
            item.status = 'pending';
            item.error = null;
        });

        // Create temporary processor for failed items
        const tempProcessor = new BatchProcessor();
        tempProcessor.queue = failed;
        tempProcessor.onProgress = this.onProgress;
        tempProcessor.onComplete = this.onComplete;
        tempProcessor.onError = this.onError;

        return await tempProcessor.process(processor);
    }

    /**
     * Helper: Delay execution
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Helper: Chunk array into smaller arrays
     * @param {Array} array - Array to chunk
     * @param {number} size - Chunk size
     * @returns {Array<Array>} Chunked array
     */
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    /**
     * Parse CSV file for batch text processing
     * @param {File} file - CSV file
     * @returns {Promise<Array<string>>} Array of texts
     */
    async parseCSV(file) {
        const text = await file.text();
        const lines = text.split('\n');

        // Simple CSV parsing (first column only)
        return lines
            .map(line => line.split(',')[0].trim())
            .filter(line => line.length > 0);
    }

    /**
     * Parse text file with multiple entries
     * @param {File} file - Text file
     * @param {string} delimiter - Entry delimiter
     * @returns {Promise<Array<string>>} Array of texts
     */
    async parseTextFile(file, delimiter = '\n---\n') {
        const text = await file.text();
        return text
            .split(delimiter)
            .map(entry => entry.trim())
            .filter(entry => entry.length > 0);
    }
}
