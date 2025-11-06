import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AIConfig } from '../../../public/js/utils/ai-config.js';

describe('AIConfig', () => {
    let aiConfig;

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        aiConfig = new AIConfig();
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('constructor', () => {
        it('should initialize with default config', () => {
            expect(aiConfig.config).toBeDefined();
            expect(aiConfig.config.provider).toBe('local');
        });

        it('should load config from localStorage if exists', () => {
            const savedConfig = { provider: 'openai', apiKey: 'test-key' };
            localStorage.setItem('ascii_art_ai_config', JSON.stringify(savedConfig));

            const newConfig = new AIConfig();

            expect(newConfig.config.provider).toBe('openai');
            expect(newConfig.config.apiKey).toBe('test-key');
        });
    });

    describe('getDefaultConfig', () => {
        it('should return default configuration', () => {
            const defaultConfig = aiConfig.getDefaultConfig();

            expect(defaultConfig.provider).toBe('local');
            expect(defaultConfig.apiKey).toBeNull();
            expect(defaultConfig.features).toBeDefined();
            expect(defaultConfig.privacy).toBeDefined();
            expect(defaultConfig.limits).toBeDefined();
        });
    });

    describe('saveConfig', () => {
        it('should save config to localStorage', () => {
            aiConfig.saveConfig({ provider: 'openai', apiKey: 'new-key' });

            const saved = JSON.parse(localStorage.getItem('ascii_art_ai_config'));
            expect(saved.provider).toBe('openai');
            expect(saved.apiKey).toBe('new-key');
        });

        it('should merge with existing config', () => {
            aiConfig.config.provider = 'local';
            aiConfig.config.apiKey = 'old-key';

            aiConfig.saveConfig({ apiKey: 'new-key' });

            expect(aiConfig.config.provider).toBe('local');
            expect(aiConfig.config.apiKey).toBe('new-key');
        });
    });

    describe('getConfig', () => {
        it('should return copy of config', () => {
            const config = aiConfig.getConfig();

            expect(config).toEqual(aiConfig.config);
            expect(config).not.toBe(aiConfig.config); // Should be a copy
        });
    });

    describe('setProvider', () => {
        it('should set provider with settings', () => {
            aiConfig.setProvider('openai', { apiKey: 'key123', model: 'gpt-4' });

            expect(aiConfig.config.provider).toBe('openai');
            expect(aiConfig.config.apiKey).toBe('key123');
            expect(aiConfig.config.model).toBe('gpt-4');
        });
    });

    describe('setApiKey', () => {
        it('should set API key', () => {
            aiConfig.setApiKey('new-api-key');

            expect(aiConfig.config.apiKey).toBe('new-api-key');
        });
    });

    describe('setFeature', () => {
        it('should enable feature', () => {
            aiConfig.setFeature('imageGeneration', true);

            expect(aiConfig.config.features.imageGeneration).toBe(true);
        });

        it('should disable feature', () => {
            aiConfig.setFeature('fontSuggestion', false);

            expect(aiConfig.config.features.fontSuggestion).toBe(false);
        });
    });

    describe('isFeatureEnabled', () => {
        it('should return feature enabled state', () => {
            aiConfig.config.features.fontSuggestion = true;

            expect(aiConfig.isFeatureEnabled('fontSuggestion')).toBe(true);
        });

        it('should return false for disabled feature', () => {
            aiConfig.config.features.imageGeneration = false;

            expect(aiConfig.isFeatureEnabled('imageGeneration')).toBe(false);
        });

        it('should return false for unknown feature', () => {
            expect(aiConfig.isFeatureEnabled('unknownFeature')).toBe(false);
        });
    });

    describe('consent', () => {
        it('should load consent from localStorage', () => {
            const consent = { given: true, timestamp: '2024-01-01', version: '1.0' };
            localStorage.setItem('ascii_art_ai_consent', JSON.stringify(consent));

            const newConfig = new AIConfig();

            expect(newConfig.consent.given).toBe(true);
        });

        it('should save consent', () => {
            aiConfig.saveConsent(true, '1.0');

            expect(aiConfig.consent.given).toBe(true);
            expect(aiConfig.consent.version).toBe('1.0');
            expect(aiConfig.consent.timestamp).toBeDefined();
        });

        it('should check if consent is given', () => {
            aiConfig.consent.given = true;

            expect(aiConfig.hasConsent()).toBe(true);
        });

        it('should return consent info', () => {
            aiConfig.consent = { given: true, timestamp: '2024-01-01', version: '1.0' };

            const info = aiConfig.getConsent();

            expect(info.given).toBe(true);
            expect(info.timestamp).toBe('2024-01-01');
        });

        it('should revoke consent', () => {
            aiConfig.consent.given = true;

            aiConfig.revokeConsent();

            expect(aiConfig.consent.given).toBe(false);
        });
    });

    describe('clearData', () => {
        it('should clear all AI-related data', () => {
            aiConfig.saveConfig({ provider: 'openai' });
            aiConfig.saveConsent(true);

            aiConfig.clearData();

            expect(localStorage.getItem('ascii_art_ai_config')).toBeNull();
            expect(localStorage.getItem('ascii_art_ai_consent')).toBeNull();
            expect(aiConfig.config.provider).toBe('local');
            expect(aiConfig.consent.given).toBe(false);
        });
    });

    describe('validateConfig', () => {
        it('should validate valid config', () => {
            aiConfig.config.provider = 'local';
            aiConfig.config.endpoint = 'http://localhost:11434';

            const result = aiConfig.validateConfig();

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect invalid provider', () => {
            aiConfig.config.provider = 'invalid';

            const result = aiConfig.validateConfig();

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Invalid provider: invalid');
        });

        it('should require API key for non-local providers', () => {
            aiConfig.config.provider = 'openai';
            aiConfig.config.apiKey = null;

            const result = aiConfig.validateConfig();

            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('API key required'))).toBe(true);
        });

        it('should require endpoint for local provider', () => {
            aiConfig.config.provider = 'local';
            aiConfig.config.endpoint = null;

            const result = aiConfig.validateConfig();

            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('Endpoint required'))).toBe(true);
        });
    });

    describe('getProviderRecommendations', () => {
        it('should return provider recommendations', () => {
            const recommendations = aiConfig.getProviderRecommendations();

            expect(recommendations).toHaveLength(3);
            expect(recommendations[0].provider).toBe('local');
            expect(recommendations[1].provider).toBe('openai');
            expect(recommendations[2].provider).toBe('anthropic');
        });

        it('should include pros and cons', () => {
            const recommendations = aiConfig.getProviderRecommendations();

            expect(recommendations[0].pros).toBeDefined();
            expect(recommendations[0].cons).toBeDefined();
            expect(recommendations[0].cost).toBeDefined();
            expect(recommendations[0].privacy).toBeDefined();
        });
    });

    describe('estimateCosts', () => {
        it('should estimate costs for OpenAI', () => {
            const estimate = aiConfig.estimateCosts('openai', {
                fontSuggestions: 10,
                imageAnalysis: 5,
                imageGeneration: 2
            });

            expect(estimate.provider).toBe('openai');
            expect(estimate.total).toBeDefined();
            expect(parseFloat(estimate.total)).toBeGreaterThan(0);
        });

        it('should show zero cost for local', () => {
            const estimate = aiConfig.estimateCosts('local', {
                fontSuggestions: 100,
                imageAnalysis: 50
            });

            expect(estimate.total).toBe('0.0000');
        });

        it('should include breakdown', () => {
            const estimate = aiConfig.estimateCosts('openai', {
                fontSuggestions: 10,
                imageAnalysis: 5
            });

            expect(estimate.breakdown).toBeDefined();
            expect(estimate.breakdown.fontSuggestions).toBeDefined();
            expect(estimate.breakdown.imageAnalysis).toBeDefined();
        });
    });

    describe('getPrivacyInfo', () => {
        it('should return privacy information', () => {
            const privacyInfo = aiConfig.getPrivacyInfo();

            expect(privacyInfo.dataCollection).toBeDefined();
            expect(privacyInfo.dataRetention).toBeDefined();
            expect(privacyInfo.thirdParty).toBeDefined();
            expect(privacyInfo.userRights).toBeDefined();
        });

        it('should include info for all providers', () => {
            const privacyInfo = aiConfig.getPrivacyInfo();

            expect(privacyInfo.dataCollection.local).toBeDefined();
            expect(privacyInfo.dataCollection.openai).toBeDefined();
            expect(privacyInfo.dataCollection.anthropic).toBeDefined();
        });
    });

    describe('exportConfig', () => {
        it('should export config and consent', () => {
            aiConfig.saveConfig({ provider: 'openai' });
            aiConfig.saveConsent(true);

            const exported = aiConfig.exportConfig();

            expect(exported.config).toBeDefined();
            expect(exported.consent).toBeDefined();
            expect(exported.exportedAt).toBeDefined();
        });
    });

    describe('importConfig', () => {
        it('should import config successfully', () => {
            const data = {
                config: { provider: 'openai', apiKey: 'imported-key' },
                consent: { given: true, timestamp: '2024-01-01', version: '1.0' }
            };

            const result = aiConfig.importConfig(data);

            expect(result).toBe(true);
            expect(aiConfig.config.provider).toBe('openai');
            expect(aiConfig.consent.given).toBe(true);
        });

        it('should handle partial import', () => {
            const data = {
                config: { provider: 'anthropic' }
            };

            const result = aiConfig.importConfig(data);

            expect(result).toBe(true);
            expect(aiConfig.config.provider).toBe('anthropic');
        });

        it('should handle import errors gracefully', () => {
            const invalidData = null;

            const result = aiConfig.importConfig(invalidData);

            expect(result).toBe(false);
        });
    });
});
