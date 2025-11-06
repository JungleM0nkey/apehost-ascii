/**
 * AI Manager
 * AI-powered features for ASCII art generation
 * Implements Issue #20 - AI Features
 */

export class AIManager {
    constructor(config = {}) {
        this.config = {
            provider: config.provider || 'openai',
            apiKey: config.apiKey || null,
            endpoint: config.endpoint || null,
            model: config.model || 'gpt-4-vision-preview',
            ...config
        };

        this.providers = {
            openai: {
                endpoint: 'https://api.openai.com/v1',
                models: {
                    vision: 'gpt-4-vision-preview',
                    text: 'gpt-4',
                    imageGen: 'dall-e-3'
                }
            },
            anthropic: {
                endpoint: 'https://api.anthropic.com/v1',
                models: {
                    vision: 'claude-3-opus-20240229',
                    text: 'claude-3-opus-20240229'
                }
            },
            local: {
                endpoint: config.endpoint || 'http://localhost:11434',
                models: {
                    vision: 'llava',
                    text: 'llama2'
                }
            }
        };
    }

    /**
     * Suggest best font for text content
     * @param {string} text - Input text
     * @param {Object} context - Additional context
     * @returns {Promise<Object>} Font suggestion
     */
    async suggestFont(text, context = {}) {
        const prompt = this.buildFontSuggestionPrompt(text, context);

        try {
            const response = await this.callAI({
                prompt,
                maxTokens: 200,
                type: 'text'
            });

            return this.parseFontSuggestion(response);
        } catch (error) {
            console.error('Font suggestion failed:', error);
            return this.getFallbackFontSuggestion(text);
        }
    }

    /**
     * Enhance image before ASCII conversion
     * @param {string} imageData - Base64 image data
     * @param {Object} options - Enhancement options
     * @returns {Promise<string>} Enhanced image data
     */
    async enhanceImage(imageData, options = {}) {
        const {
            brightness = 0,
            contrast = 0,
            sharpness = 0,
            autoEnhance = true
        } = options;

        if (!autoEnhance) {
            return imageData;
        }

        try {
            const analysis = await this.analyzeImage(imageData);
            const enhancements = this.calculateEnhancements(analysis);

            // Note: In production, use actual image processing library
            // For now, return original with suggestions
            return {
                data: imageData,
                suggestions: enhancements,
                analysis
            };
        } catch (error) {
            console.error('Image enhancement failed:', error);
            return imageData;
        }
    }

    /**
     * Analyze image and suggest best ASCII settings
     * @param {string} imageData - Base64 image data
     * @returns {Promise<Object>} Analysis and suggestions
     */
    async analyzeImage(imageData) {
        try {
            const prompt = 'Analyze this image and describe: 1) Main subject, 2) Contrast level (high/medium/low), 3) Detail level (high/medium/low), 4) Best ASCII art approach (detailed/simplified/outline)';

            const response = await this.callAI({
                prompt,
                image: imageData,
                maxTokens: 300,
                type: 'vision'
            });

            return this.parseImageAnalysis(response);
        } catch (error) {
            console.error('Image analysis failed:', error);
            return this.getDefaultAnalysis();
        }
    }

    /**
     * Smart crop image to focus on main subject
     * @param {string} imageData - Base64 image data
     * @returns {Promise<Object>} Crop coordinates
     */
    async smartCrop(imageData) {
        try {
            const prompt = 'Identify the main subject in this image and provide crop coordinates as percentages (x, y, width, height) that would create the best composition.';

            const response = await this.callAI({
                prompt,
                image: imageData,
                maxTokens: 150,
                type: 'vision'
            });

            return this.parseCropCoordinates(response);
        } catch (error) {
            console.error('Smart crop failed:', error);
            return { x: 0, y: 0, width: 100, height: 100 };
        }
    }

    /**
     * Generate image from text prompt
     * @param {string} prompt - Text prompt
     * @param {Object} options - Generation options
     * @returns {Promise<string>} Generated image URL
     */
    async generateImage(prompt, options = {}) {
        const {
            size = '1024x1024',
            quality = 'standard',
            style = 'vivid'
        } = options;

        try {
            if (this.config.provider === 'openai') {
                return await this.generateImageOpenAI(prompt, options);
            } else {
                throw new Error(`Image generation not supported for provider: ${this.config.provider}`);
            }
        } catch (error) {
            console.error('Image generation failed:', error);
            throw error;
        }
    }

    /**
     * Text-to-image-to-ASCII pipeline
     * @param {string} prompt - Text prompt
     * @param {Function} asciiGenerator - ASCII generator function
     * @param {Object} options - Pipeline options
     * @returns {Promise<string>} ASCII art
     */
    async textToAscii(prompt, asciiGenerator, options = {}) {
        try {
            // Generate image from text
            const imageUrl = await this.generateImage(prompt, options.imageOptions);

            // Analyze and optimize
            const analysis = await this.analyzeImage(imageUrl);

            // Generate ASCII with optimized settings
            const ascii = await asciiGenerator(imageUrl, {
                ...options.asciiOptions,
                ...analysis.recommendations
            });

            return ascii;
        } catch (error) {
            console.error('Text-to-ASCII pipeline failed:', error);
            throw error;
        }
    }

    /**
     * Call AI API
     * @param {Object} params - Request parameters
     * @returns {Promise<string>} AI response
     */
    async callAI(params) {
        const { prompt, image, maxTokens = 500, type = 'text' } = params;

        // Check for API key
        if (!this.config.apiKey && this.config.provider !== 'local') {
            throw new Error(`API key required for provider: ${this.config.provider}`);
        }

        // Build request based on provider
        const request = this.buildRequest(prompt, image, maxTokens, type);

        // Make API call
        const response = await fetch(request.url, {
            method: 'POST',
            headers: request.headers,
            body: JSON.stringify(request.body)
        });

        if (!response.ok) {
            throw new Error(`AI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return this.extractResponse(data);
    }

    /**
     * Build AI request for provider
     * @param {string} prompt - Prompt text
     * @param {string} image - Optional image data
     * @param {number} maxTokens - Max tokens
     * @param {string} type - Request type
     * @returns {Object} Request object
     */
    buildRequest(prompt, image, maxTokens, type) {
        const provider = this.providers[this.config.provider];
        const model = this.config.model || provider.models[type];

        if (this.config.provider === 'openai') {
            const messages = [{
                role: 'user',
                content: image
                    ? [
                        { type: 'text', text: prompt },
                        { type: 'image_url', image_url: { url: image } }
                    ]
                    : prompt
            }];

            return {
                url: `${provider.endpoint}/chat/completions`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: {
                    model,
                    messages,
                    max_tokens: maxTokens
                }
            };
        } else if (this.config.provider === 'anthropic') {
            const content = image
                ? [
                    { type: 'text', text: prompt },
                    { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } }
                ]
                : [{ type: 'text', text: prompt }];

            return {
                url: `${provider.endpoint}/messages`,
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.config.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: {
                    model,
                    messages: [{ role: 'user', content }],
                    max_tokens: maxTokens
                }
            };
        } else if (this.config.provider === 'local') {
            return {
                url: `${provider.endpoint}/api/generate`,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: {
                    model,
                    prompt,
                    images: image ? [image] : undefined
                }
            };
        }

        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }

    /**
     * Extract response from AI API
     * @param {Object} data - API response data
     * @returns {string} Response text
     */
    extractResponse(data) {
        if (this.config.provider === 'openai') {
            return data.choices[0].message.content;
        } else if (this.config.provider === 'anthropic') {
            return data.content[0].text;
        } else if (this.config.provider === 'local') {
            return data.response;
        }
        return '';
    }

    /**
     * Generate image using OpenAI DALL-E
     * @param {string} prompt - Image prompt
     * @param {Object} options - Generation options
     * @returns {Promise<string>} Image URL
     */
    async generateImageOpenAI(prompt, options = {}) {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
                model: 'dall-e-3',
                prompt,
                n: 1,
                size: options.size || '1024x1024',
                quality: options.quality || 'standard',
                style: options.style || 'vivid'
            })
        });

        if (!response.ok) {
            throw new Error(`Image generation failed: ${response.status}`);
        }

        const data = await response.json();
        return data.data[0].url;
    }

    /**
     * Build font suggestion prompt
     * @param {string} text - Input text
     * @param {Object} context - Context
     * @returns {string} Prompt
     */
    buildFontSuggestionPrompt(text, context) {
        return `Suggest the best ASCII art font for this text: "${text}". Consider: style, readability, impact. Available fonts: standard, banner, small, figlet-standard, figlet-banner, figlet-small. Respond with JSON: {"font": "name", "reason": "explanation"}`;
    }

    /**
     * Parse font suggestion from AI response
     * @param {string} response - AI response
     * @returns {Object} Parsed suggestion
     */
    parseFontSuggestion(response) {
        try {
            const match = response.match(/\{[^}]+\}/);
            if (match) {
                return JSON.parse(match[0]);
            }
        } catch (error) {
            // Fallback parsing
        }

        return { font: 'standard', reason: 'Default choice' };
    }

    /**
     * Get fallback font suggestion
     * @param {string} text - Input text
     * @returns {Object} Suggestion
     */
    getFallbackFontSuggestion(text) {
        const length = text.length;

        if (length <= 5) {
            return { font: 'banner', reason: 'Short text works well with banner style' };
        } else if (length <= 15) {
            return { font: 'standard', reason: 'Medium text suits standard font' };
        } else {
            return { font: 'small', reason: 'Long text better with compact font' };
        }
    }

    /**
     * Parse image analysis response
     * @param {string} response - AI response
     * @returns {Object} Analysis
     */
    parseImageAnalysis(response) {
        // Simple parsing - in production use more robust parsing
        return {
            subject: 'Unknown',
            contrast: 'medium',
            detail: 'medium',
            approach: 'detailed',
            recommendations: {
                width: 80,
                height: 60,
                invert: false
            },
            raw: response
        };
    }

    /**
     * Get default image analysis
     * @returns {Object} Default analysis
     */
    getDefaultAnalysis() {
        return {
            subject: 'Unknown',
            contrast: 'medium',
            detail: 'medium',
            approach: 'detailed',
            recommendations: {
                width: 80,
                height: 60,
                invert: false
            }
        };
    }

    /**
     * Calculate enhancements from analysis
     * @param {Object} analysis - Image analysis
     * @returns {Object} Enhancement settings
     */
    calculateEnhancements(analysis) {
        const enhancements = {
            brightness: 0,
            contrast: 0,
            sharpness: 0
        };

        if (analysis.contrast === 'low') {
            enhancements.contrast = 20;
        } else if (analysis.contrast === 'high') {
            enhancements.contrast = -10;
        }

        if (analysis.detail === 'low') {
            enhancements.sharpness = 15;
        }

        return enhancements;
    }

    /**
     * Parse crop coordinates from response
     * @param {string} response - AI response
     * @returns {Object} Crop coordinates
     */
    parseCropCoordinates(response) {
        // Try to extract coordinates from response
        const numbers = response.match(/\d+/g);

        if (numbers && numbers.length >= 4) {
            return {
                x: parseInt(numbers[0]),
                y: parseInt(numbers[1]),
                width: parseInt(numbers[2]),
                height: parseInt(numbers[3])
            };
        }

        return { x: 0, y: 0, width: 100, height: 100 };
    }

    /**
     * Check if AI features are available
     * @returns {boolean} Availability
     */
    isAvailable() {
        if (this.config.provider === 'local') {
            return true; // Assume local is always available
        }

        return !!this.config.apiKey;
    }

    /**
     * Get provider info
     * @returns {Object} Provider information
     */
    getProviderInfo() {
        return {
            provider: this.config.provider,
            hasApiKey: !!this.config.apiKey,
            models: this.providers[this.config.provider]?.models || {},
            features: this.getSupportedFeatures()
        };
    }

    /**
     * Get supported features for current provider
     * @returns {Array} Supported features
     */
    getSupportedFeatures() {
        const features = [
            'fontSuggestion',
            'imageAnalysis',
            'smartCrop'
        ];

        if (this.config.provider === 'openai') {
            features.push('imageGeneration', 'textToAscii');
        }

        return features;
    }
}
