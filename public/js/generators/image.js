/**
 * ASCII Art Studio - Image Generator
 * Converts images to ASCII art using pixel luminance analysis
 */

import { Config } from '../config.js';

export class ImageGenerator {
    constructor() {
        this.densityRamps = {
            minimal: [' ', '.', ':', ';', '=', '#'],
            simple: [' ', '.', '-', '=', '#', '@'],
            detailed: [' ', '.', ':', ';', '+', '=', 'c', 'o', 'a', 'A', '@', '#'],
            extended: [' ', '.', "'", '`', '^', '"', ',', ':', ';', 'I', 'l', '!', 'i', '>', '<', '~', '+', '_', '-', '?', ']', '[', '}', '{', '1', ')', '(', '|', '\\', '/', 't', 'f', 'j', 'r', 'x', 'n', 'u', 'v', 'c', 'z', 'X', 'Y', 'U', 'J', 'C', 'L', 'Q', '0', 'O', 'Z', 'm', 'w', 'q', 'p', 'd', 'b', 'k', 'h', 'a', 'o', '*', '#', 'M', 'W', '&', '8', '%', 'B', '@', '$']
        };
    }

    /**
     * Generate ASCII art from image
     * @param {File|HTMLImageElement} imageSource - Image source
     * @param {Object} options - Generation options
     * @returns {Promise<string>} ASCII art
     */
    async generate(imageSource, options = {}) {
        try {
            const {
                width = 80,
                density = 'detailed',
                edgeDetection = false,
                dithering = false
            } = options;

            // Load image
            const image = await this.loadImage(imageSource);
            
            // Convert to canvas
            const canvas = this.createCanvas(image, width);
            const imageData = this.getImageData(canvas);
            
            // Process pixels
            let pixels = this.extractPixels(imageData);
            
            if (edgeDetection) {
                pixels = this.applyEdgeDetection(pixels, canvas.width, canvas.height);
            }
            
            if (dithering) {
                pixels = this.applyFloydSteinbergDithering(pixels, canvas.width, canvas.height);
            }
            
            // Convert to ASCII
            const asciiArt = this.pixelsToAscii(pixels, canvas.width, canvas.height, density);
            
            return asciiArt;
        } catch (error) {
            console.error('Image generation failed:', error);
            throw error;
        }
    }

    /**
     * Load image from various sources
     * @param {File|HTMLImageElement|string} source - Image source
     * @returns {Promise<HTMLImageElement>} Loaded image
     */
    async loadImage(source) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));
            
            if (source instanceof File) {
                const reader = new FileReader();
                reader.onload = (e) => img.src = e.target.result;
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsDataURL(source);
            } else if (typeof source === 'string') {
                img.src = source;
            } else if (source instanceof HTMLImageElement) {
                resolve(source);
            } else {
                reject(new Error('Invalid image source'));
            }
        });
    }

    /**
     * Create canvas from image with target width
     * @param {HTMLImageElement} image - Source image
     * @param {number} targetWidth - Target ASCII width
     * @returns {HTMLCanvasElement} Canvas with resized image
     */
    createCanvas(image, targetWidth) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate aspect ratio
        const aspectRatio = image.height / image.width;
        const targetHeight = Math.floor(targetWidth * aspectRatio * 0.5); // 0.5 for character aspect ratio
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        // Draw image to canvas
        ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
        
        return canvas;
    }

    /**
     * Get image data from canvas
     * @param {HTMLCanvasElement} canvas - Source canvas
     * @returns {ImageData} Image data
     */
    getImageData(canvas) {
        const ctx = canvas.getContext('2d');
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    /**
     * Extract pixel luminance values
     * @param {ImageData} imageData - Image data
     * @returns {Array<number>} Luminance values (0-255)
     */
    extractPixels(imageData) {
        const pixels = [];
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Calculate luminance using standard weights
            const luminance = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
            pixels.push(luminance);
        }
        
        return pixels;
    }

    /**
     * Apply Sobel edge detection
     * @param {Array<number>} pixels - Pixel luminance values
     * @param {number} width - Image width
     * @param {number} height - Image height
     * @returns {Array<number>} Edge-detected pixels
     */
    applyEdgeDetection(pixels, width, height) {
        const result = new Array(pixels.length).fill(0);
        
        // Sobel kernels
        const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
        const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let gx = 0, gy = 0;
                
                // Apply Sobel kernels
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = (y + ky) * width + (x + kx);
                        const pixel = pixels[idx];
                        gx += pixel * sobelX[ky + 1][kx + 1];
                        gy += pixel * sobelY[ky + 1][kx + 1];
                    }
                }
                
                // Calculate gradient magnitude
                const magnitude = Math.sqrt(gx * gx + gy * gy);
                result[y * width + x] = Math.min(255, magnitude);
            }
        }
        
        return result;
    }

    /**
     * Apply Floyd-Steinberg dithering
     * @param {Array<number>} pixels - Pixel luminance values
     * @param {number} width - Image width
     * @param {number} height - Image height
     * @returns {Array<number>} Dithered pixels
     */
    applyFloydSteinbergDithering(pixels, width, height) {
        const result = [...pixels];
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                const oldPixel = result[idx];
                const newPixel = oldPixel < 128 ? 0 : 255;
                result[idx] = newPixel;
                
                const error = oldPixel - newPixel;
                
                // Distribute error to neighboring pixels
                if (x + 1 < width) {
                    result[idx + 1] += error * 7 / 16;
                }
                if (y + 1 < height) {
                    if (x > 0) {
                        result[(y + 1) * width + (x - 1)] += error * 3 / 16;
                    }
                    result[(y + 1) * width + x] += error * 5 / 16;
                    if (x + 1 < width) {
                        result[(y + 1) * width + (x + 1)] += error * 1 / 16;
                    }
                }
            }
        }
        
        return result;
    }

    /**
     * Convert pixels to ASCII characters
     * @param {Array<number>} pixels - Pixel luminance values
     * @param {number} width - Image width
     * @param {number} height - Image height
     * @param {string} densityType - Density ramp type
     * @returns {string} ASCII art
     */
    pixelsToAscii(pixels, width, height, densityType) {
        const ramp = this.densityRamps[densityType] || this.densityRamps.detailed;
        const lines = [];
        
        for (let y = 0; y < height; y++) {
            let line = '';
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                const pixel = pixels[idx];
                
                // Map pixel to character
                const charIndex = Math.floor((pixel / 255) * (ramp.length - 1));
                line += ramp[ramp.length - 1 - charIndex]; // Invert for dark on light
            }
            lines.push(line);
        }
        
        return lines.join('\n');
    }

    /**
     * Validate image file
     * @param {File} file - Image file
     * @returns {Object} Validation result
     */
    validateImageFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        
        if (!file) {
            return { valid: false, error: 'No file provided' };
        }
        
        if (file.size > maxSize) {
            return { valid: false, error: 'File size exceeds 10MB limit' };
        }
        
        if (!allowedTypes.includes(file.type)) {
            return { valid: false, error: 'Invalid file type. Please use JPG, PNG, GIF, or WebP' };
        }
        
        return { valid: true };
    }

    /**
     * Get supported density types
     * @returns {Array<string>} Supported density types
     */
    getSupportedDensities() {
        return Object.keys(this.densityRamps);
    }

    /**
     * Generate preview with default settings
     * @param {File} file - Image file
     * @returns {Promise<string>} Preview ASCII art
     */
    async generatePreview(file) {
        return this.generate(file, {
            width: 40,
            density: 'simple'
        });
    }
}