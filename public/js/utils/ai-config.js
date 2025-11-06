/**
 * AI Configuration
 * Manage AI settings, privacy, and user consent
 * Part of Issue #20 - AI Features
 */

export class AIConfig {
    constructor() {
        this.storageKey = 'ascii_art_ai_config';
        this.consentKey = 'ascii_art_ai_consent';
        this.config = this.loadConfig();
        this.consent = this.loadConsent();
    }

    /**
     * Load configuration from localStorage
     * @returns {Object} Configuration
     */
    loadConfig() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load AI config:', error);
        }

        return this.getDefaultConfig();
    }

    /**
     * Get default configuration
     * @returns {Object} Default config
     */
    getDefaultConfig() {
        return {
            provider: 'local',
            apiKey: null,
            endpoint: 'http://localhost:11434',
            model: null,
            features: {
                fontSuggestion: true,
                imageAnalysis: true,
                imageEnhancement: false,
                smartCrop: true,
                imageGeneration: false,
                textToAscii: false
            },
            privacy: {
                shareData: false,
                storeHistory: false,
                allowTelemetry: false
            },
            limits: {
                maxRequestsPerHour: 100,
                maxImageSize: 5 * 1024 * 1024, // 5MB
                timeout: 30000 // 30 seconds
            }
        };
    }

    /**
     * Save configuration
     * @param {Object} config - Configuration to save
     */
    saveConfig(config) {
        this.config = { ...this.config, ...config };
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.config));
        } catch (error) {
            console.error('Failed to save AI config:', error);
        }
    }

    /**
     * Get configuration
     * @returns {Object} Current config
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Update provider settings
     * @param {string} provider - Provider name
     * @param {Object} settings - Provider settings
     */
    setProvider(provider, settings = {}) {
        this.saveConfig({
            provider,
            ...settings
        });
    }

    /**
     * Set API key for provider
     * @param {string} apiKey - API key
     */
    setApiKey(apiKey) {
        this.saveConfig({ apiKey });
    }

    /**
     * Enable/disable feature
     * @param {string} feature - Feature name
     * @param {boolean} enabled - Enable state
     */
    setFeature(feature, enabled) {
        this.saveConfig({
            features: {
                ...this.config.features,
                [feature]: enabled
            }
        });
    }

    /**
     * Check if feature is enabled
     * @param {string} feature - Feature name
     * @returns {boolean} Enabled state
     */
    isFeatureEnabled(feature) {
        return this.config.features[feature] || false;
    }

    /**
     * Load consent from localStorage
     * @returns {Object} Consent state
     */
    loadConsent() {
        try {
            const stored = localStorage.getItem(this.consentKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load AI consent:', error);
        }

        return {
            given: false,
            timestamp: null,
            version: null
        };
    }

    /**
     * Save consent
     * @param {boolean} given - Consent given
     * @param {string} version - Privacy policy version
     */
    saveConsent(given, version = '1.0') {
        this.consent = {
            given,
            timestamp: new Date().toISOString(),
            version
        };

        try {
            localStorage.setItem(this.consentKey, JSON.stringify(this.consent));
        } catch (error) {
            console.error('Failed to save AI consent:', error);
        }
    }

    /**
     * Check if consent is given
     * @returns {boolean} Consent state
     */
    hasConsent() {
        return this.consent.given;
    }

    /**
     * Get consent info
     * @returns {Object} Consent information
     */
    getConsent() {
        return { ...this.consent };
    }

    /**
     * Revoke consent
     */
    revokeConsent() {
        this.saveConsent(false);
        this.clearData();
    }

    /**
     * Clear all AI-related data
     */
    clearData() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.consentKey);
            this.config = this.getDefaultConfig();
            this.consent = { given: false, timestamp: null, version: null };
        } catch (error) {
            console.error('Failed to clear AI data:', error);
        }
    }

    /**
     * Validate provider configuration
     * @returns {Object} Validation result
     */
    validateConfig() {
        const errors = [];

        // Check provider
        const validProviders = ['openai', 'anthropic', 'local'];
        if (!validProviders.includes(this.config.provider)) {
            errors.push(`Invalid provider: ${this.config.provider}`);
        }

        // Check API key for non-local providers
        if (this.config.provider !== 'local' && !this.config.apiKey) {
            errors.push(`API key required for provider: ${this.config.provider}`);
        }

        // Check endpoint for local provider
        if (this.config.provider === 'local' && !this.config.endpoint) {
            errors.push('Endpoint required for local provider');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Get provider recommendations
     * @param {Object} context - User context
     * @returns {Array} Provider recommendations
     */
    getProviderRecommendations(context = {}) {
        const recommendations = [];

        recommendations.push({
            provider: 'local',
            name: 'Local Model (Ollama)',
            pros: [
                'Free to use',
                'Privacy-focused (no data leaves device)',
                'No API limits',
                'Works offline'
            ],
            cons: [
                'Requires local installation',
                'May be slower',
                'Limited model selection'
            ],
            requirements: [
                'Install Ollama',
                'Download models (llava, llama2)'
            ],
            cost: 'Free',
            privacy: 'Excellent'
        });

        recommendations.push({
            provider: 'openai',
            name: 'OpenAI (GPT-4, DALL-E)',
            pros: [
                'Best quality results',
                'Image generation support',
                'Fast processing',
                'Extensive features'
            ],
            cons: [
                'Requires API key',
                'Pay per use',
                'Data sent to OpenAI',
                'Rate limits apply'
            ],
            requirements: [
                'OpenAI account',
                'API key',
                'Credit balance'
            ],
            cost: 'Paid (per request)',
            privacy: 'Moderate'
        });

        recommendations.push({
            provider: 'anthropic',
            name: 'Anthropic (Claude)',
            pros: [
                'High quality vision',
                'Good privacy practices',
                'Detailed analysis',
                'Fast processing'
            ],
            cons: [
                'Requires API key',
                'Pay per use',
                'No image generation',
                'Rate limits apply'
            ],
            requirements: [
                'Anthropic account',
                'API key',
                'Credit balance'
            ],
            cost: 'Paid (per request)',
            privacy: 'Good'
        });

        return recommendations;
    }

    /**
     * Estimate API costs
     * @param {string} provider - Provider name
     * @param {Object} usage - Expected usage
     * @returns {Object} Cost estimate
     */
    estimateCosts(provider, usage = {}) {
        const {
            fontSuggestions = 10,
            imageAnalysis = 5,
            imageGeneration = 0,
            textToAscii = 0
        } = usage;

        const costs = {
            openai: {
                fontSuggestion: 0.01, // GPT-4 text
                imageAnalysis: 0.03, // GPT-4 Vision
                imageGeneration: 0.04, // DALL-E 3 standard
                textToAscii: 0.07 // Combined
            },
            anthropic: {
                fontSuggestion: 0.008,
                imageAnalysis: 0.024,
                imageGeneration: 0,
                textToAscii: 0
            },
            local: {
                fontSuggestion: 0,
                imageAnalysis: 0,
                imageGeneration: 0,
                textToAscii: 0
            }
        };

        const providerCosts = costs[provider] || costs.local;

        const total =
            (fontSuggestions * providerCosts.fontSuggestion) +
            (imageAnalysis * providerCosts.imageAnalysis) +
            (imageGeneration * providerCosts.imageGeneration) +
            (textToAscii * providerCosts.textToAscii);

        return {
            provider,
            usage,
            breakdown: {
                fontSuggestions: fontSuggestions * providerCosts.fontSuggestion,
                imageAnalysis: imageAnalysis * providerCosts.imageAnalysis,
                imageGeneration: imageGeneration * providerCosts.imageGeneration,
                textToAscii: textToAscii * providerCosts.textToAscii
            },
            total: total.toFixed(4),
            currency: 'USD',
            period: 'month'
        };
    }

    /**
     * Get privacy information
     * @returns {Object} Privacy info
     */
    getPrivacyInfo() {
        return {
            dataCollection: {
                local: 'No data leaves your device',
                openai: 'Prompts and images sent to OpenAI servers',
                anthropic: 'Prompts and images sent to Anthropic servers'
            },
            dataRetention: {
                local: 'All data stays on your device',
                openai: '30 days per OpenAI policy',
                anthropic: 'Not used for training per Anthropic policy'
            },
            thirdParty: {
                local: 'None',
                openai: 'OpenAI',
                anthropic: 'Anthropic'
            },
            encryption: 'All API calls use HTTPS',
            userRights: [
                'Request data deletion',
                'Revoke consent anytime',
                'Export your data',
                'Disable AI features'
            ]
        };
    }

    /**
     * Export configuration
     * @returns {Object} Exportable config
     */
    exportConfig() {
        return {
            config: this.getConfig(),
            consent: this.getConsent(),
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Import configuration
     * @param {Object} data - Configuration data
     * @returns {boolean} Success state
     */
    importConfig(data) {
        try {
            if (data.config) {
                this.saveConfig(data.config);
            }

            if (data.consent) {
                this.consent = data.consent;
                localStorage.setItem(this.consentKey, JSON.stringify(this.consent));
            }

            return true;
        } catch (error) {
            console.error('Failed to import config:', error);
            return false;
        }
    }
}
