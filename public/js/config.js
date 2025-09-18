/**
 * ASCII Art Studio - Configuration
 * Centralized configuration for the entire application
 */

export const Config = {
    // Application Info
    VERSION: '2.0.0',
    APP_NAME: 'ASCII Art Studio',
    
    // Performance Limits
    LIMITS: {
        BANNER_WIDTH: 78,
        CHAR_ASPECT_RATIO: 0.5,
        MAX_IMAGE_SIZE: 200,
        MAX_MEMORY: 50 * 1024 * 1024, // 50MB
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        CHUNK_SIZE: 50,
        DEBOUNCE_DELAY: 300,
        MAX_INPUT_LENGTH: 1000,
        MAX_OUTPUT_SIZE: 100000, // characters
    },
    
    // Image Processing
    IMAGE: {
        DITHER_MATRIX: [7/16, 3/16, 5/16, 1/16],
        LUMINANCE_WEIGHTS: { R: 0.299, G: 0.587, B: 0.114 },
        DEFAULT_WIDTH: 80,
        MIN_WIDTH: 20,
        MAX_WIDTH: 200,
        SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    },
    
    // ASCII Generation
    ASCII: {
        DEFAULT_FONT: 'standard',
        DEFAULT_DENSITY: 'detailed',
        LINE_HEIGHT_MULTIPLIER: 1.1,
        LETTER_SPACING: 0.02,
    },
    
    // UI Settings
    UI: {
        ANIMATION_DURATION: 300,
        TOAST_DURATION: 3000,
        MODAL_ESCAPE_KEY: 'Escape',
        AUTO_SAVE_DELAY: 1000,
        PREVIEW_UPDATE_DELAY: 500,
    },
    
    // Storage Keys
    STORAGE_KEYS: {
        PALETTE: 'ascii-studio-palette',
        SETTINGS: 'ascii-studio-settings',
        RECENT_INPUTS: 'ascii-studio-recent',
        USER_PREFERENCES: 'ascii-studio-prefs',
    },
    
    // Theme Configuration
    THEMES: {
        DEFAULT: 'orange',
        AVAILABLE: ['orange', 'green', 'blue', 'purple', 'red', 'amber'],
    },
    
    // Export Formats
    EXPORT_FORMATS: {
        TXT: { extension: '.txt', mimeType: 'text/plain' },
        HTML: { extension: '.html', mimeType: 'text/html' },
        JSON: { extension: '.json', mimeType: 'application/json' },
        MD: { extension: '.md', mimeType: 'text/markdown' },
        DISCORD: { extension: '.txt', mimeType: 'text/plain' },
    },
    
    // Error Messages
    ERRORS: {
        INVALID_INPUT: 'Invalid input provided',
        FILE_TOO_LARGE: 'File size exceeds maximum limit',
        UNSUPPORTED_FORMAT: 'File format not supported',
        GENERATION_FAILED: 'ASCII art generation failed',
        EXPORT_FAILED: 'Export operation failed',
        NETWORK_ERROR: 'Network connection error',
        STORAGE_ERROR: 'Local storage operation failed',
    },
    
    // Success Messages
    SUCCESS: {
        COPIED: 'Copied to clipboard!',
        EXPORTED: 'File exported successfully!',
        SETTINGS_SAVED: 'Settings saved!',
        THEME_CHANGED: 'Theme updated!',
    },
    
    // Generation Modes
    MODES: {
        TEXT: {
            id: 'text',
            name: 'Text to ASCII',
            icon: '[T]',
            description: 'Convert text to stylized ASCII art fonts',
            defaultOptions: {
                font: 'standard',
                spacing: 'normal',
            }
        },
        IMAGE: {
            id: 'image',
            name: 'Image to ASCII',
            icon: '[I]',
            description: 'Transform images into ASCII art representations',
            defaultOptions: {
                width: 80,
                density: 'detailed',
                edgeDetection: false,
                dithering: false,
            }
        },
        BANNER: {
            id: 'banner',
            name: 'Warez Banner',
            icon: '[B]',
            description: 'Create retro-style warez scene banners',
            defaultOptions: {
                style: 'classic',
                width: 78,
            }
        },
        FIGLET: {
            id: 'figlet',
            name: 'FIGlet Text',
            icon: '[F]',
            description: 'Generate FIGlet-style text art with various fonts',
            defaultOptions: {
                font: 'big',
                kerning: true,
            }
        }
    },
    
    // Density Character Sets for Image Conversion
    DENSITY_SETS: {
        minimal: ['  ', '░░', '▒▒', '██'],
        simple: [' ', '.', '-', '=', '#'],
        detailed: [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'],
        extended: [' ', '`', '.', '^', '"', ',', ':', ';', 'I', 'l', '!', 'i', '>', '<', '~', '+', '_', '-', '?', ']', '[', '}', '{', '1', ')', '(', '|', '\\', '/', 't', 'f', 'j', 'r', 'x', 'n', 'u', 'v', 'c', 'z', 'X', 'Y', 'U', 'J', 'C', 'L', 'Q', '0', 'O', 'Z', 'm', 'w', 'q', 'p', 'd', 'b', 'k', 'h', 'a', 'o', '*', '#', 'M', 'W', '&', '8', '%', 'B', '@', '$']
    },
    
    // Validation Rules
    VALIDATION: {
        TEXT_INPUT: {
            minLength: 1,
            maxLength: 100,
            allowedChars: /^[a-zA-Z0-9\s\-_.!?'"()[\]{}]+$/
        },
        IMAGE_UPLOAD: {
            maxSize: 10 * 1024 * 1024, // 10MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            maxDimensions: { width: 2000, height: 2000 }
        },
        BANNER_INPUT: {
            minLength: 1,
            maxLength: 50,
            allowedChars: /^[a-zA-Z0-9\s\-_.!]+$/
        }
    },
    
    // Feature Flags
    FEATURES: {
        BATCH_PROCESSING: true,
        BACKGROUND_GENERATION: true,
        REAL_TIME_PREVIEW: true,
        EXPORT_HISTORY: true,
        KEYBOARD_SHORTCUTS: true,
        DRAG_AND_DROP: true,
        AUTO_SAVE: true,
        PERFORMANCE_MONITORING: false, // Enable for debugging
    },
    
    // Development Settings
    DEV: {
        DEBUG_MODE: false,
        VERBOSE_LOGGING: false,
        PERFORMANCE_METRICS: false,
        ERROR_REPORTING: true,
    }
};

// Color Palette Definitions
export const ColorPalettes = {
    orange: {
        name: 'ORANGE FIRE',
        primary: '#ff9500',
        secondary: '#ffcc00',
        accent: '#ff6600',
        background: '#0d0d0d',
        surface: '#1a1a1a',
        text: '#ffcc99',
        muted: '#cc9966',
        gradient: 'linear-gradient(45deg, #ff9500, #ffb84d)'
    },
    green: {
        name: 'MATRIX GREEN',
        primary: '#00ff00',
        secondary: '#00cc00',
        accent: '#00aa00',
        background: '#0d0d0d',
        surface: '#1a1a1a',
        text: '#ccffcc',
        muted: '#66cc66',
        gradient: 'linear-gradient(45deg, #00ff00, #33ff33)'
    },
    blue: {
        name: 'CYBER BLUE',
        primary: '#00aaff',
        secondary: '#0088cc',
        accent: '#0066aa',
        background: '#0d0d0d',
        surface: '#1a1a1a',
        text: '#ccddff',
        muted: '#6699cc',
        gradient: 'linear-gradient(45deg, #00d4ff, #40e0ff)'
    },
    purple: {
        name: 'NEON PURPLE',
        primary: '#cc44ff',
        secondary: '#aa22dd',
        accent: '#8800bb',
        background: '#0d0d0d',
        surface: '#1a1a1a',
        text: '#eeccff',
        muted: '#aa66cc',
        gradient: 'linear-gradient(45deg, #9146ff, #b070ff)'
    },
    red: {
        name: 'TERMINAL RED',
        primary: '#ff4444',
        secondary: '#cc2222',
        accent: '#aa0000',
        background: '#0d0d0d',
        surface: '#1a1a1a',
        text: '#ffcccc',
        muted: '#cc6666',
        gradient: 'linear-gradient(45deg, #ff3030, #ff6060)'
    },
    amber: {
        name: 'RETRO AMBER',
        primary: '#ffaa00',
        secondary: '#dd8800',
        accent: '#bb6600',
        background: '#0d0d0d',
        surface: '#1a1a1a',
        text: '#ffddaa',
        muted: '#cc9944',
        gradient: 'linear-gradient(45deg, #ffb000, #ffd700)'
    }
};

// ASCII Font Configuration
export const FontConfig = {
    standard: { height: 6, spacing: 1 },
    big: { height: 8, spacing: 1 },
    small: { height: 4, spacing: 0 },
    '3d': { height: 7, spacing: 2 },
    shadow: { height: 6, spacing: 1 },
    graffiti: { height: 8, spacing: 2 },
    dotmatrix: { height: 6, spacing: 1 },
    banner: { height: 8, spacing: 1 },
};

// Default export for main config
export default Config;