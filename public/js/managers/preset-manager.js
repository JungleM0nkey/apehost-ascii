/**
 * Preset Manager
 * Save and load user presets for ASCII generation
 * Implements Issue #14 - Preset System
 */

export class PresetManager {
    constructor() {
        this.storageKey = 'ascii-studio-presets';
        this.defaultPresets = this.loadDefaultPresets();
    }

    /**
     * Save a preset
     * @param {string} name - Preset name
     * @param {Object} settings - Settings to save
     * @returns {boolean} Success status
     */
    savePreset(name, settings) {
        try {
            const presets = this.getAllPresets();
            presets[name] = {
                ...settings,
                savedAt: new Date().toISOString(),
                custom: true
            };
            localStorage.setItem(this.storageKey, JSON.stringify(presets));
            return true;
        } catch (error) {
            console.error('Failed to save preset:', error);
            return false;
        }
    }

    /**
     * Load a preset
     * @param {string} name - Preset name
     * @returns {Object|null} Preset settings
     */
    loadPreset(name) {
        const presets = this.getAllPresets();
        return presets[name] || null;
    }

    /**
     * Delete a preset
     * @param {string} name - Preset name
     * @returns {boolean} Success status
     */
    deletePreset(name) {
        try {
            const presets = this.getAllPresets();
            // Don't allow deletion of default presets
            if (presets[name] && !presets[name].custom) {
                return false;
            }
            delete presets[name];
            localStorage.setItem(this.storageKey, JSON.stringify(presets));
            return true;
        } catch (error) {
            console.error('Failed to delete preset:', error);
            return false;
        }
    }

    /**
     * Get all presets (including defaults)
     * @returns {Object} All presets
     */
    getAllPresets() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            const customPresets = stored ? JSON.parse(stored) : {};
            return { ...this.defaultPresets, ...customPresets };
        } catch (error) {
            console.error('Failed to load presets:', error);
            return this.defaultPresets;
        }
    }

    /**
     * Export presets as JSON
     * @returns {string} JSON string of presets
     */
    exportPresets() {
        const presets = this.getAllPresets();
        // Only export custom presets
        const customPresets = {};
        for (const [name, preset] of Object.entries(presets)) {
            if (preset.custom) {
                customPresets[name] = preset;
            }
        }
        return JSON.stringify(customPresets, null, 2);
    }

    /**
     * Import presets from JSON
     * @param {string} json - JSON string of presets
     * @returns {boolean} Success status
     */
    importPresets(json) {
        try {
            const imported = JSON.parse(json);
            const current = this.getAllPresets();
            const merged = { ...current, ...imported };
            localStorage.setItem(this.storageKey, JSON.stringify(merged));
            return true;
        } catch (error) {
            console.error('Failed to import presets:', error);
            return false;
        }
    }

    /**
     * Load default presets
     * @returns {Object} Default presets
     */
    loadDefaultPresets() {
        return {
            'Classic Banner': {
                mode: 'banner',
                settings: {
                    style: 'classic',
                    textEffect: 'uppercase',
                    addCredits: false
                },
                custom: false
            },
            'Retro Text': {
                mode: 'text',
                settings: {
                    font: 'standard',
                    spacing: 'normal'
                },
                custom: false
            },
            'Big & Bold': {
                mode: 'text',
                settings: {
                    font: 'big',
                    spacing: 'wide'
                },
                custom: false
            },
            'Elite Warez': {
                mode: 'banner',
                settings: {
                    style: 'elite',
                    textEffect: 'leetspeak',
                    addCredits: true
                },
                custom: false
            },
            'Image Detailed': {
                mode: 'image',
                settings: {
                    width: 80,
                    density: 'detailed',
                    edgeDetection: false,
                    dithering: false
                },
                custom: false
            }
        };
    }
}
