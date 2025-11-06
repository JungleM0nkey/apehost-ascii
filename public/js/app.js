/**
 * ASCII Art Studio - Main Application
 * Main application controller and initialization
 */

import { Config, ColorPalettes } from './config.js';
import { TextGenerator } from './generators/text.js';
import { ImageGenerator } from './generators/image.js';
import { WarezGenerator } from './generators/warez.js';
import { ExportManager } from './utils/export.js';
import { clipboard } from './utils/clipboard.js';

class AsciiArtApp {
    constructor() {
        this.state = {
            currentMode: 'text',
            currentPalette: 'orange',
            isGenerating: false,
            lastGenerated: null,
            generators: new Map(),
            saveToolOpen: false,
            lastSaveFormat: 'txt',
        };

        this.elements = new Map();
        this.exportManager = new ExportManager();
        
        // Modal interaction state
        this.modalState = {
            isDragging: false,
            isResizing: false,
            dragOffset: { x: 0, y: 0 },
            originalPosition: { x: 0, y: 0 },
            originalSize: { width: 0, height: 0 }
        };
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        await this.initializeNavbar();
        try {
            console.log(`${Config.APP_NAME} v${Config.VERSION} initializing...`);
            
            // Initialize generators
            await this.initializeGenerators();
            
            // Cache DOM elements
            this.cacheElements();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load saved settings
            this.loadSettings();
            
            // Initialize UI state
            this.initializeUI();
            
            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Application initialization failed:', error);
            this.showError('Failed to initialize application');
        }
    }

    /**
     * Initialize all generators
     */
    async initializeGenerators() {
        try {
            // Text generator
            this.state.generators.set('text', new TextGenerator());

            // Image generator
            this.state.generators.set('image', new ImageGenerator());

            // Warez banner generator
            this.state.generators.set('banner', new WarezGenerator());

            // Other generators can be loaded dynamically when needed
            console.log('Generators initialized');
        } catch (error) {
            console.error('Failed to initialize generators:', error);
            throw error;
        }
    }

    /**
     * Cache frequently used DOM elements
     */
    cacheElements() {
        const selectors = {
            // Mode selection
            modeCards: '.mode-card',
            modeContents: '.mode-content',
            
            // Palette selection (now handled by palette cards)
            
            // Text mode
            textInput: '#textInput',
            fontSelect: '#fontSelect',
            spacingSelect: '#spacingSelect',
            generateTextBtn: '#generateTextBtn',
            
            // Image mode
            imageInput: '#imageInput',
            imageUploadZone: '#imageUploadZone',
            previewImage: '#previewImage',
            widthInput: '#widthInput',
            widthValue: '#widthValue',
            densitySelect: '#densitySelect',
            edgeDetection: '#edgeDetection',
            dithering: '#dithering',
            generateImageBtn: '#generateImageBtn',
            
            // Banner mode
            bannerInput: '#bannerInput',
            bannerStyle: '#bannerStyle',
            bannerTextEffect: '#bannerTextEffect',
            bannerAddCredits: '#bannerAddCredits',
            bannerAddDate: '#bannerAddDate',
            bannerCredits: '#bannerCredits',
            bannerCreditsGroup: '#bannerCreditsGroup',
            bannerStylePreviewContent: '#bannerStylePreviewContent',
            generateBannerBtn: '#generateBannerBtn',
            
            // FIGlet mode
            figletInput: '#figletInput',
            figletFont: '#figletFont',
            generateFigletBtn: '#generateFigletBtn',
            
            // Output
            asciiOutput: '#asciiOutput',
            outputStatus: '#outputStatus',
            copyBtn: '#copyBtn',
            copyDiscordBtn: '#copyDiscordBtn',
            expandBtn: '#expandBtn',
            
            // Save Tool
            saveToolContainer: '#saveToolContainer',
            saveToolBtn: '#saveToolBtn',
            saveToolMenu: '#saveToolMenu',
            saveToolClose: '#saveToolClose',
            saveToolOptions: '.save-tool__option',
            saveToolPulse: '#saveToolPulse',
            saveToolLastFormatName: '#saveToolLastFormatName',
            
            // Character count
            characterCount: '#characterCount',
            
            // Modal
            fullscreenModal: '#fullscreenModal',
            modalContent: '#modalContent',
            modalHeader: '#modalHeader',
            modalBody: '#modalBody',
            modalCopyBtn: '#modalCopyBtn',
            closeModal: '#closeModal',
            modalBackdrop: '#modalBackdrop',
            resizeHandle: '#resizeHandle',
        };

        for (const [key, selector] of Object.entries(selectors)) {
            if (selector.startsWith('.')) {
                this.elements.set(key, document.querySelectorAll(selector));
            } else {
                this.elements.set(key, document.querySelector(selector));
            }
        }
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Mode selection
        this.elements.get('modeCards').forEach(card => {
            card.addEventListener('click', (e) => this.handleModeChange(e));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleModeChange(e);
                }
            });
        });

        // Palette selection is now handled by palette cards in initializePaletteCards()

        // Text generation
        this.elements.get('generateTextBtn').addEventListener('click', () => {
            this.generateText();
        });

        this.elements.get('textInput').addEventListener('input', () => {
            this.validateTextInput();
            this.updateCharacterCount();
        });

        // Image generation
        this.elements.get('generateImageBtn').addEventListener('click', () => {
            this.generateImage();
        });

        // Banner generation
        this.elements.get('generateBannerBtn').addEventListener('click', () => {
            this.generateBanner();
        });

        // Banner options
        this.elements.get('bannerAddCredits').addEventListener('change', (e) => {
            this.toggleBannerCredits(e.target.checked);
        });

        // Banner style preview
        this.elements.get('bannerStyle').addEventListener('change', () => {
            this.updateBannerStylePreview();
        });

        this.elements.get('bannerTextEffect').addEventListener('change', () => {
            this.updateBannerStylePreview();
        });

        // FIGlet generation
        this.elements.get('generateFigletBtn').addEventListener('click', () => {
            this.generateFiglet();
        });

        // Image upload
        this.elements.get('imageInput').addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });

        this.elements.get('imageUploadZone').addEventListener('click', () => {
            this.elements.get('imageInput').click();
        });

        // Drag and drop
        this.setupDragAndDrop();

        // Width slider
        this.elements.get('widthInput').addEventListener('input', (e) => {
            this.elements.get('widthValue').textContent = `${e.target.value} characters`;
        });

        // Output actions
        this.elements.get('copyBtn').addEventListener('click', () => {
            this.copyToClipboard();
        });

        this.elements.get('copyDiscordBtn').addEventListener('click', () => {
            this.copyToDiscord();
        });

        this.elements.get('expandBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Save Tool
        this.elements.get('saveToolBtn').addEventListener('click', () => {
            this.toggleSaveTool();
        });

        this.elements.get('saveToolClose').addEventListener('click', () => {
            this.closeSaveTool();
        });

        this.elements.get('saveToolOptions').forEach(option => {
            option.addEventListener('click', (e) => this.handleSaveToolOption(e));
        });

        // Close save tool when clicking outside
        document.addEventListener('click', (e) => {
            if (this.state.saveToolOpen && 
                !this.elements.get('saveToolContainer').contains(e.target)) {
                this.closeSaveTool();
            }
        });

        // Modal
        this.elements.get('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        this.elements.get('modalBackdrop').addEventListener('click', () => {
            this.closeModal();
        });

        this.elements.get('modalCopyBtn').addEventListener('click', () => {
            this.copyToClipboard();
        });

        // Modal interactions
        this.setupModalInteractions();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Window events
        window.addEventListener('beforeunload', () => {
            this.saveSettings();
        });
    }

    /**
     * Set up drag and drop for image upload
     */
    setupDragAndDrop() {
        const zone = this.elements.get('imageUploadZone');

        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('upload-zone--dragover');
        });

        zone.addEventListener('dragleave', (e) => {
            if (!zone.contains(e.relatedTarget)) {
                zone.classList.remove('upload-zone--dragover');
            }
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('upload-zone--dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleImageFile(files[0]);
            }
        });
    }

    /**
     * Handle mode change
     */
    handleModeChange(event) {
        const card = event.currentTarget;
        
        // Prevent interaction with disabled modes
        if (card.classList.contains('mode-card--disabled')) {
            return;
        }
        
        const mode = card.dataset.mode;
        this.setMode(mode);
    }

    /**
     * Set active mode
     */
    setMode(mode) {
        // Don't switch to disabled modes
        const modeCard = document.querySelector(`[data-mode="${mode}"]`);
        if (modeCard && modeCard.classList.contains('mode-card--disabled')) {
            return;
        }
        
        this.state.currentMode = mode;

        // Update mode cards
        this.elements.get('modeCards').forEach(card => {
            const isActive = card.dataset.mode === mode && !card.classList.contains('mode-card--disabled');
            card.classList.toggle('mode-card--active', isActive);
            card.setAttribute('aria-selected', isActive);
        });

        // Update mode content panels
        this.elements.get('modeContents').forEach(content => {
            const contentMode = content.id.replace('-panel', '');
            content.classList.toggle('hidden', contentMode !== mode);
        });

        // Clear output when switching modes
        this.clearOutput();
    }

    // Palette dropdown methods removed - now using palette cards

    /**
     * Set color palette
     */
    setPalette(paletteId) {
        const palette = ColorPalettes[paletteId];
        if (!palette) return;

        this.state.currentPalette = paletteId;
        
        // Update document attribute for CSS
        document.documentElement.setAttribute('data-palette', paletteId);
        
        // UI is updated through palette cards
        
        // Save to localStorage
        localStorage.setItem(Config.STORAGE_KEYS.PALETTE, paletteId);
    }

    /**
     * Validate text input
     */
    validateTextInput() {
        const input = this.elements.get('textInput');
        const text = input.value.trim();
        const isValid = text.length > 0 && text.length <= Config.VALIDATION.TEXT_INPUT.maxLength;
        
        this.elements.get('generateTextBtn').disabled = !isValid;
        
        // Enforce character limit
        if (text.length > Config.VALIDATION.TEXT_INPUT.maxLength) {
            input.value = text.substring(0, Config.VALIDATION.TEXT_INPUT.maxLength);
        }
    }

    /**
     * Update character count display
     */
    updateCharacterCount() {
        const input = this.elements.get('textInput');
        const characterCount = this.elements.get('characterCount');
        
        if (characterCount) {
            const currentLength = input.value.length;
            const maxLength = input.getAttribute('maxlength') || 100;
            characterCount.textContent = `${currentLength}/${maxLength}`;
            
            // Visual feedback for approaching limit
            if (currentLength > maxLength * 0.8) {
                characterCount.style.color = 'var(--secondary)';
            } else {
                characterCount.style.color = 'var(--muted-color)';
            }
        }
    }

    /**
     * Generate text ASCII art
     */
    async generateText() {
        try {
            this.setGenerating(true);
            
            const text = this.elements.get('textInput').value.trim();
            const font = this.elements.get('fontSelect').value;
            const spacing = this.elements.get('spacingSelect').value;
            
            if (!text) {
                throw new Error('Please enter some text');
            }
            
            const generator = this.state.generators.get('text');
            const result = await generator.generate(text, { font, spacing });
            
            this.displayOutput(result);
            this.updateStatus('Text generated successfully');
            
        } catch (error) {
            console.error('Text generation failed:', error);
            this.showError(error.message);
        } finally {
            this.setGenerating(false);
        }
    }

    /**
     * Generate image ASCII art
     */
    async generateImage() {
        try {
            this.setGenerating(true);
            
            const previewImage = this.elements.get('previewImage');
            if (!previewImage.src || previewImage.src === window.location.href) {
                throw new Error('Please select an image first');
            }
            
            const width = parseInt(this.elements.get('widthInput').value) || 80;
            const density = this.elements.get('densitySelect').value || 'detailed';
            const edgeDetection = this.elements.get('edgeDetection').checked;
            const dithering = this.elements.get('dithering').checked;
            
            const generator = this.state.generators.get('image');
            const result = await generator.generate(previewImage.src, {
                width,
                density,
                edgeDetection,
                dithering
            });
            
            this.displayOutput(result);
            this.updateStatus('Image converted to ASCII successfully');
            
        } catch (error) {
            console.error('Image generation failed:', error);
            this.showError(error.message);
        } finally {
            this.setGenerating(false);
        }
    }

    /**
     * Generate banner ASCII art
     */
    async generateBanner() {
        try {
            this.setGenerating(true);

            const text = this.elements.get('bannerInput').value.trim();
            const style = this.elements.get('bannerStyle').value;
            const textEffect = this.elements.get('bannerTextEffect').value;
            const addCredits = this.elements.get('bannerAddCredits').checked;
            const addDate = this.elements.get('bannerAddDate').checked;
            const credits = this.elements.get('bannerCredits').value.trim() || 'ASCII ART STUDIO';

            if (!text) {
                throw new Error('Please enter banner text');
            }

            const generator = this.state.generators.get('banner');
            const result = await generator.generate(text, {
                style,
                textEffect,
                addCredits,
                addDate,
                credits,
                multiline: text.includes('|')
            });

            this.displayOutput(result);
            this.updateStatus('Banner generated successfully');

        } catch (error) {
            console.error('Banner generation failed:', error);
            this.showError(error.message);
        } finally {
            this.setGenerating(false);
        }
    }

    /**
     * Generate FIGlet ASCII art
     */
    async generateFiglet() {
        try {
            this.setGenerating(true);
            this.updateStatus('FIGlet generation coming soon!');
            this.showError('FIGlet generator is not yet implemented. Coming soon!');
        } catch (error) {
            console.error('FIGlet generation failed:', error);
            this.showError(error.message);
        } finally {
            this.setGenerating(false);
        }
    }

    /**
     * Handle image upload
     */
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.handleImageFile(file);
        }
    }

    /**
     * Handle image file
     */
    async handleImageFile(file) {
        try {
            // Validate file
            if (!this.validateImageFile(file)) {
                return;
            }
            
            // Show preview
            const url = URL.createObjectURL(file);
            const preview = this.elements.get('previewImage');
            preview.src = url;
            preview.classList.remove('hidden');
            
            // Enable generate button
            this.elements.get('generateImageBtn').disabled = false;
            
            this.updateStatus('Image loaded - ready to generate');
            
        } catch (error) {
            console.error('Image handling failed:', error);
            this.showError('Failed to load image');
        }
    }

    /**
     * Validate image file
     */
    validateImageFile(file) {
        if (!file) {
            this.showError('No file selected');
            return false;
        }

        if (file.size > Config.VALIDATION.IMAGE_UPLOAD.maxSize) {
            this.showError('File size exceeds 10MB limit');
            return false;
        }

        if (!Config.VALIDATION.IMAGE_UPLOAD.allowedTypes.includes(file.type)) {
            this.showError('File type not supported. Use JPG, PNG, GIF, or WebP');
            return false;
        }

        return true;
    }

    /**
     * Toggle banner credits input visibility
     */
    toggleBannerCredits(show) {
        const creditsGroup = this.elements.get('bannerCreditsGroup');
        if (show) {
            creditsGroup.classList.remove('hidden');
        } else {
            creditsGroup.classList.add('hidden');
        }
    }

    /**
     * Update banner style preview
     */
    updateBannerStylePreview() {
        try {
            const generator = this.state.generators.get('banner');
            if (!generator) return;

            const style = this.elements.get('bannerStyle').value;
            const styleInfo = generator.getStyleInfo(style);

            if (styleInfo && styleInfo.preview) {
                const previewContent = this.elements.get('bannerStylePreviewContent');
                if (previewContent) {
                    previewContent.textContent = styleInfo.preview;
                }
            }
        } catch (error) {
            console.error('Failed to update style preview:', error);
        }
    }

    /**
     * Display generated output
     */
    displayOutput(content) {
        const output = this.elements.get('asciiOutput');
        
        if (!content || content.trim() === '') {
            output.innerHTML = `
                <div class="output-placeholder">
                    <div class="placeholder-icon">[!]</div>
                    <div class="placeholder-text">No content generated</div>
                </div>
            `;
            output.classList.add('ascii-output--empty');
            output.classList.remove('ascii-output--filled');
            this.setActionButtonsEnabled(false);
            return;
        }
        
        output.textContent = content;
        output.classList.remove('ascii-output--empty');
        output.classList.add('ascii-output--filled');
        this.state.lastGenerated = content;
        this.setActionButtonsEnabled(true);
    }

    /**
     * Clear output
     */
    clearOutput() {
        const output = this.elements.get('asciiOutput');
        output.innerHTML = `
            <div class="output-placeholder">
                <div class="placeholder-icon">[#]</div>
                <div class="placeholder-text">Your ASCII art will appear here</div>
            </div>
        `;
        output.classList.add('ascii-output--empty');
        this.state.lastGenerated = null;
        this.setActionButtonsEnabled(false);
        this.updateStatus('Ready');
    }

    /**
     * Set action buttons enabled state
     */
    setActionButtonsEnabled(enabled) {
        this.elements.get('copyBtn').disabled = !enabled;
        this.elements.get('copyDiscordBtn').disabled = !enabled;
        this.elements.get('expandBtn').disabled = !enabled;
        this.elements.get('saveToolBtn').disabled = !enabled;
        
        // Show/hide save tool
        const saveToolContainer = this.elements.get('saveToolContainer');
        if (enabled) {
            saveToolContainer.classList.remove('save-tool--hidden');
            saveToolContainer.setAttribute('aria-hidden', 'false');
            this.showSaveToolPulse();
        } else {
            saveToolContainer.classList.add('save-tool--hidden');
            saveToolContainer.setAttribute('aria-hidden', 'true');
            this.closeSaveTool();
        }
    }

    /**
     * Copy to clipboard
     */
    async copyToClipboard() {
        if (!this.state.lastGenerated) {
            this.showError('Nothing to copy');
            return;
        }

        try {
            await clipboard.copyWithFeedback(
                this.state.lastGenerated,
                this.elements.get('copyBtn')
            );
            this.updateStatus('Copied to clipboard!');
        } catch (error) {
            console.error('Copy failed:', error);
            this.showError('Failed to copy to clipboard');
        }
    }

    /**
     * Copy optimized for Discord
     */
    async copyToDiscord() {
        if (!this.state.lastGenerated) {
            this.showError('Nothing to copy');
            return;
        }

        try {
            const metadata = this.getCurrentMetadata();
            await clipboard.copyForDiscord(
                this.state.lastGenerated,
                metadata
            );
            
            // Show feedback on Discord button
            clipboard.showCopyFeedback(this.elements.get('copyDiscordBtn'));
            this.updateStatus('Copied for Discord! Ready to paste in chat.');
        } catch (error) {
            console.error('Discord copy failed:', error);
            this.showError('Failed to copy for Discord');
        }
    }

    /**
     * Toggle save tool menu
     */
    toggleSaveTool() {
        if (this.state.saveToolOpen) {
            this.closeSaveTool();
        } else {
            this.openSaveTool();
        }
    }

    /**
     * Open save tool menu
     */
    openSaveTool() {
        if (!this.state.lastGenerated) {
            this.showError('Nothing to save');
            return;
        }

        this.state.saveToolOpen = true;
        const menu = this.elements.get('saveToolMenu');
        menu.classList.add('save-tool__menu--visible');
        
        // Hide pulse animation when menu is open
        this.hideSaveToolPulse();
    }

    /**
     * Close save tool menu
     */
    closeSaveTool() {
        this.state.saveToolOpen = false;
        const menu = this.elements.get('saveToolMenu');
        menu.classList.remove('save-tool__menu--visible');
    }

    /**
     * Handle save tool option selection
     */
    async handleSaveToolOption(event) {
        const format = event.currentTarget.dataset.format;
        
        if (!this.state.lastGenerated) {
            this.showError('Nothing to save');
            return;
        }

        try {
            // Save the format preference
            this.state.lastSaveFormat = format;
            localStorage.setItem('lastSaveFormat', format);
            
            // Update last format display
            this.updateLastFormatDisplay(format);
            
            // Perform the save
            const metadata = this.getCurrentMetadata();
            await this.exportManager.download(this.state.lastGenerated, format, metadata);
            this.updateStatus(`Saved as ${format.toUpperCase()}`);
            
            // Close the menu
            this.closeSaveTool();
            
        } catch (error) {
            console.error('Save failed:', error);
            this.showError('Failed to save file');
        }
    }

    /**
     * Show save tool pulse animation
     */
    showSaveToolPulse() {
        const pulse = this.elements.get('saveToolPulse');
        if (pulse) {
            pulse.classList.add('save-tool__pulse--active');
            // Auto-hide after a few seconds
            setTimeout(() => {
                this.hideSaveToolPulse();
            }, 3000);
        }
    }

    /**
     * Hide save tool pulse animation
     */
    hideSaveToolPulse() {
        const pulse = this.elements.get('saveToolPulse');
        if (pulse) {
            pulse.classList.remove('save-tool__pulse--active');
        }
    }

    /**
     * Update last format display
     */
    updateLastFormatDisplay(format) {
        const lastFormatName = this.elements.get('saveToolLastFormatName');
        if (lastFormatName) {
            lastFormatName.textContent = format.toUpperCase();
        }
    }

    /**
     * Get current generation metadata
     */
    getCurrentMetadata() {
        const metadata = {
            mode: this.state.currentMode,
            palette: this.state.currentPalette,
            timestamp: new Date().toISOString(),
        };

        // Add mode-specific metadata
        switch (this.state.currentMode) {
            case 'text':
                metadata.font = this.elements.get('fontSelect').value;
                metadata.spacing = this.elements.get('spacingSelect').value;
                metadata.input = this.elements.get('textInput').value;
                break;
                
            case 'image':
                metadata.width = this.elements.get('widthInput').value;
                metadata.density = this.elements.get('densitySelect').value;
                metadata.edgeDetection = this.elements.get('edgeDetection').checked;
                metadata.dithering = this.elements.get('dithering').checked;
                break;
                
            case 'banner':
                metadata.style = this.elements.get('bannerStyle').value;
                metadata.input = this.elements.get('bannerInput').value;
                break;
                
            case 'figlet':
                metadata.font = this.elements.get('figletFont').value;
                metadata.input = this.elements.get('figletInput').value;
                break;
        }

        return metadata;
    }

    /**
     * Open fullscreen modal
     */
    openModal() {
        if (!this.state.lastGenerated) return;

        const modal = this.elements.get('fullscreenModal');
        const body = this.elements.get('modalBody');
        
        body.textContent = this.state.lastGenerated;
        modal.classList.add('modal--visible');
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus management
        this.elements.get('closeModal').focus();
    }

    /**
     * Close modal
     */
    closeModal() {
        const modal = this.elements.get('fullscreenModal');
        const modalContent = this.elements.get('modalContent');
        
        // Reset modal state
        this.modalState.isDragging = false;
        this.modalState.isResizing = false;
        
        // Reset modal appearance
        modalContent.style.position = '';
        modalContent.style.left = '';
        modalContent.style.top = '';
        modalContent.style.width = '';
        modalContent.style.height = '';
        modalContent.style.margin = '';
        modalContent.style.cursor = '';
        modalContent.classList.remove('modal__content--dragging', 'modal__content--resizing');
        
        modal.classList.remove('modal--visible');
        modal.setAttribute('aria-hidden', 'true');
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        // Close modal with Escape
        if (event.key === 'Escape') {
            this.closeModal();
            return;
        }

        // Skip if user is typing in an input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        // Keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch (event.key.toLowerCase()) {
                case 'c':
                    event.preventDefault();
                    this.copyToClipboard();
                    break;
                case 'g':
                    event.preventDefault();
                    this.generateCurrent();
                    break;
            }
        }
    }

    /**
     * Generate current mode
     */
    generateCurrent() {
        switch (this.state.currentMode) {
            case 'text':
                this.generateText();
                break;
            // Add other modes when implemented
        }
    }

    /**
     * Set generating state
     */
    setGenerating(isGenerating) {
        this.state.isGenerating = isGenerating;
        
        // Disable generate buttons during generation
        this.elements.get('generateTextBtn').disabled = isGenerating;
        // Add other generate buttons as needed
        
        // Update status
        if (isGenerating) {
            this.updateStatus('Generating...');
        }
    }

    /**
     * Update status message
     */
    updateStatus(message) {
        this.elements.get('outputStatus').textContent = message;
    }

    /**
     * Show error message
     */
    showError(message) {
        this.updateStatus(`Error: ${message}`);
        console.error(message);
    }

    /**
     * Load saved settings
     */
    loadSettings() {
        try {
            // Load palette
            const savedPalette = localStorage.getItem(Config.STORAGE_KEYS.PALETTE);
            if (savedPalette && ColorPalettes[savedPalette]) {
                this.setPalette(savedPalette);
            }

            // Load last save format
            const lastSaveFormat = localStorage.getItem('lastSaveFormat');
            if (lastSaveFormat) {
                this.state.lastSaveFormat = lastSaveFormat;
                this.updateLastFormatDisplay(lastSaveFormat);
            }

            // Load other settings as needed
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }

    /**
     * Save current settings
     */
    saveSettings() {
        try {
            localStorage.setItem(Config.STORAGE_KEYS.PALETTE, this.state.currentPalette);
            localStorage.setItem('lastSaveFormat', this.state.lastSaveFormat);
            // Save other settings as needed
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }

    /**
     * Initialize UI state
     */
    initializeUI() {
        // Set initial mode
        this.setMode('text');

        // Set initial palette if not loaded from storage
        if (!localStorage.getItem(Config.STORAGE_KEYS.PALETTE)) {
            this.setPalette('orange');
        }

        // Clear output
        this.clearOutput();

        // Validate initial inputs
        this.validateTextInput();
        this.updateCharacterCount();

        // Initialize banner style preview
        this.updateBannerStylePreview();
    }

    /**
     * Initialize navbar functionality
     */
    async initializeNavbar() {
        // Set dark mode permanently
        document.documentElement.setAttribute('data-theme', 'dark');
        
        // Initialize palette cards
        this.initializePaletteCards();
    }

    /**
     * Initialize palette card functionality
     */
    initializePaletteCards() {
        const paletteCards = document.querySelectorAll('.palette-card');
        
        paletteCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const palette = card.dataset.palette;
                this.setPalette(palette);
                this.updateActivePaletteCard(palette);
                
                // Remove focus to prevent blue border
                card.blur();
                e.preventDefault();
            });

            // Keyboard accessibility
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const palette = card.dataset.palette;
                    this.setPalette(palette);
                    this.updateActivePaletteCard(palette);
                    
                    // Brief delay before blur for keyboard users
                    setTimeout(() => card.blur(), 100);
                }
            });
        });

        // Set initial palette from storage or default
        const savedPalette = localStorage.getItem(Config.STORAGE_KEYS.PALETTE) || 'orange';
        this.updateActivePaletteCard(savedPalette);
    }

    /**
     * Update active palette card visual state
     */
    updateActivePaletteCard(activePalette) {
        const paletteCards = document.querySelectorAll('.palette-card');
        
        paletteCards.forEach(card => {
            const isActive = card.dataset.palette === activePalette;
            card.classList.toggle('palette-card--active', isActive);
            card.setAttribute('aria-pressed', isActive.toString());
        });
    }

    /**
     * Setup modal drag and resize interactions
     */
    setupModalInteractions() {
        const modalContent = this.elements.get('modalContent');
        const modalHeader = this.elements.get('modalHeader');
        const resizeHandle = this.elements.get('resizeHandle');

        // Header dragging
        modalHeader.addEventListener('mousedown', (e) => {
            if (e.target === this.elements.get('closeModal')) {
                return;
            }
            this.startDragging(e);
        });

        // Resize handle
        resizeHandle.addEventListener('mousedown', (e) => {
            this.startResizing(e);
        });

        // Global mouse events
        document.addEventListener('mousemove', (e) => {
            if (this.modalState.isDragging) {
                this.handleDragging(e);
            } else if (this.modalState.isResizing) {
                this.handleResizing(e);
            }
        });

        document.addEventListener('mouseup', () => {
            this.stopDragging();
            this.stopResizing();
        });
    }

    /**
     * Start dragging modal
     */
    startDragging(e) {
        this.modalState.isDragging = true;
        const modalContent = this.elements.get('modalContent');
        const rect = modalContent.getBoundingClientRect();
        
        this.modalState.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        modalContent.classList.add('modal__content--dragging');
        modalContent.style.position = 'fixed';
        modalContent.style.left = rect.left + 'px';
        modalContent.style.top = rect.top + 'px';
        modalContent.style.margin = '0';
        
        e.preventDefault();
    }

    /**
     * Handle dragging modal
     */
    handleDragging(e) {
        if (!this.modalState.isDragging) return;

        const modalContent = this.elements.get('modalContent');
        const newX = e.clientX - this.modalState.dragOffset.x;
        const newY = e.clientY - this.modalState.dragOffset.y;

        // Keep modal within viewport
        const maxX = window.innerWidth - modalContent.offsetWidth;
        const maxY = window.innerHeight - modalContent.offsetHeight;

        modalContent.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
        modalContent.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
    }

    /**
     * Stop dragging modal
     */
    stopDragging() {
        if (!this.modalState.isDragging) return;

        this.modalState.isDragging = false;
        const modalContent = this.elements.get('modalContent');
        modalContent.classList.remove('modal__content--dragging');
    }

    /**
     * Start resizing modal
     */
    startResizing(e) {
        this.modalState.isResizing = true;
        const modalContent = this.elements.get('modalContent');
        const rect = modalContent.getBoundingClientRect();
        
        this.modalState.originalPosition = {
            x: e.clientX,
            y: e.clientY
        };
        
        this.modalState.originalSize = {
            width: rect.width,
            height: rect.height
        };

        modalContent.classList.add('modal__content--resizing');
        e.preventDefault();
    }

    /**
     * Handle resizing modal
     */
    handleResizing(e) {
        if (!this.modalState.isResizing) return;

        const modalContent = this.elements.get('modalContent');
        const deltaX = e.clientX - this.modalState.originalPosition.x;
        const deltaY = e.clientY - this.modalState.originalPosition.y;

        const newWidth = Math.max(400, this.modalState.originalSize.width + deltaX);
        const newHeight = Math.max(300, this.modalState.originalSize.height + deltaY);

        modalContent.style.width = newWidth + 'px';
        modalContent.style.height = newHeight + 'px';
    }

    /**
     * Stop resizing modal
     */
    stopResizing() {
        if (!this.modalState.isResizing) return;

        this.modalState.isResizing = false;
        const modalContent = this.elements.get('modalContent');
        modalContent.classList.remove('modal__content--resizing');
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.asciiApp = new AsciiArtApp();
});

// Export for debugging
export default AsciiArtApp;