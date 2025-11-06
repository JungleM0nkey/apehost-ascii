# Project Issues & Improvements Tracker

This document tracks all identified issues, improvements, and feature requests for the ASCII Art Studio project. Use this as a reference for creating GitHub issues.

**Last Updated**: 2025-11-06
**Status**: 🟢 Active Tracking

---

## 🔴 Critical Priority Issues

### Issue #1: Testing Infrastructure - ✅ COMPLETED
**Status**: ✅ Resolved  
**Priority**: Critical  
**Effort**: 8 hours  
**Assignee**: TBD

**Description**: No automated testing infrastructure existed

**Resolution**:
- ✅ Installed Vitest with @vitest/ui
- ✅ Created vitest.config.js
- ✅ Set up test directory structure
- ✅ Created setup.js with mocks
- ✅ Written unit tests for TextGenerator
- ✅ Written unit tests for WarezGenerator
- ✅ Written unit tests for ClipboardManager
- ✅ Added npm scripts for testing

---

### Issue #2: Code Quality Tools - ✅ COMPLETED
**Status**: ✅ Resolved  
**Priority**: Critical  
**Effort**: 2 hours

**Description**: No linting or formatting tools configured

**Resolution**:
- ✅ Installed ESLint with @eslint/js
- ✅ Installed Prettier with eslint-config-prettier
- ✅ Created eslint.config.js
- ✅ Created .prettierrc and .prettierignore
- ✅ Added npm scripts for linting and formatting

---

### Issue #3: Memory Leaks - ✅ COMPLETED
**Status**: ✅ Resolved  
**Priority**: Critical  
**Effort**: 4 hours

**Bugs Fixed**:
1. ✅ Modal event listeners never removed (app.js:1170-1182)
2. ✅ URL.createObjectURL never revoked (app.js:577)
3. ✅ Image loading race condition (image.js:66-86)

**Changes Made**:
- Added boundModalMouseMove and boundModalMouseUp properties
- Properly remove listeners in closeModal()
- Revoke blob URLs after image loads
- Fixed HTMLImageElement loading race condition

---

## 🟠 High Priority Issues

### Issue #4: CI/CD Pipeline - ✅ COMPLETED
**Status**: ✅ Resolved  
**Priority**: High  
**Effort**: 3 hours  
**Labels**: DevOps, Infrastructure

**Description**: No automated deployment pipeline

**Resolution**:
- ✅ Created .github/workflows/ci.yml
- ✅ Created .github/workflows/deploy.yml
- ✅ Configured for Node 18.x and 20.x
- ✅ Integrated linting, testing, and security audit
- ✅ Added Cloudflare Workers deployment

**Required Secrets**:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

---

### Issue #5: CSP Security Issue
**Status**: 🔴 Open  
**Priority**: High  
**Effort**: 4 hours  
**Labels**: Security, Enhancement

**Description**: Content Security Policy uses `'unsafe-inline'` for scripts and styles

**Location**: `public/index.html:6-18`

**Current CSP**:
```html
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline' ...;
```

**Proposed Solutions**:
1. Use nonces for inline scripts
2. Move inline scripts to external files
3. Implement CSP nonce generation in Worker

**Acceptance Criteria**:
- [ ] Remove 'unsafe-inline' from CSP
- [ ] Implement nonce generation
- [ ] Update all inline scripts with nonces
- [ ] Test CSP in production
- [ ] Security score improves to 90+

---

### Issue #6: FIGlet Mode Not Implemented
**Status**: 🔴 Open  
**Priority**: High  
**Effort**: 12 hours  
**Labels**: Feature, Enhancement

**Description**: FIGlet mode is visible in UI but disabled

**Location**: `public/index.html:107-111`

**Implementation Plan**:
1. Create `FigletGenerator` class
2. Load FIGlet fonts (10+ fonts)
3. Implement font parsing logic
4. Add kerning algorithm
5. Wire up UI event handlers
6. Write unit tests (80%+ coverage)

**Acceptance Criteria**:
- [ ] FigletGenerator class created
- [ ] 10+ FIGlet fonts available
- [ ] UI enabled and functional
- [ ] Unit tests passing
- [ ] Documentation updated

---

### Issue #7: Image Processing Blocks Main Thread
**Status**: 🔴 Open  
**Priority**: High  
**Effort**: 12 hours  
**Labels**: Performance, Enhancement

**Description**: Image processing freezes UI

**Location**: `public/js/generators/image.js:24-59`

**Proposed Solution**: Implement Web Workers

**Implementation Plan**:
1. Create `image-worker.js`
2. Move pixel processing to worker
3. Implement worker communication
4. Add fallback for unsupported browsers
5. Update ImageGenerator to use worker

**Acceptance Criteria**:
- [ ] Web Worker implemented
- [ ] UI remains responsive during processing
- [ ] Performance tests pass
- [ ] Browser compatibility verified

---

### Issue #8: No Error Tracking
**Status**: 🔴 Open  
**Priority**: High  
**Effort**: 2 hours  
**Labels**: Monitoring, Infrastructure

**Description**: No error tracking or monitoring in production

**Proposed Solution**: Integrate Sentry

**Implementation Plan**:
```bash
npm install @sentry/browser @sentry/tracing
```

**Acceptance Criteria**:
- [ ] Sentry installed and configured
- [ ] Error tracking operational
- [ ] Performance monitoring enabled
- [ ] Alerts configured
- [ ] Privacy-safe (no PII logged)

---

## 🟡 Medium Priority Issues

### Issue #9: No Build Pipeline
**Status**: 🔴 Open  
**Priority**: Medium  
**Effort**: 8 hours  
**Labels**: Infrastructure, Enhancement

**Description**: No minification, bundling, or optimization

**Current**:
```json
"build": "echo 'No build step required for static assets'"
```

**Proposed Solution**: Add Vite

**Implementation Plan**:
```bash
npm install --save-dev vite @vitejs/plugin-legacy
```

**Benefits**:
- 40-60% smaller bundle size
- Code splitting
- Tree shaking
- Source maps
- TypeScript support path

**Acceptance Criteria**:
- [ ] Vite configured
- [ ] Build produces optimized bundles
- [ ] Source maps generated
- [ ] Code splitting working
- [ ] Bundle size reduced by 40%+

---

### Issue #10: Large app.js File (God Object)
**Status**: 🔴 Open  
**Priority**: Medium  
**Effort**: 12 hours  
**Labels**: Refactoring, Technical Debt

**Description**: app.js is 1,280 lines - too large

**Location**: `public/js/app.js`

**Proposed Refactoring**:
```
AsciiArtApp (200 lines)
├── StateManager (150 lines)
├── UIManager (200 lines)
├── EventManager (250 lines)
├── ModalManager (200 lines)
└── GeneratorManager (150 lines)
```

**Acceptance Criteria**:
- [ ] Split into 5+ focused classes
- [ ] Each class < 250 lines
- [ ] All tests still passing
- [ ] No functionality broken
- [ ] Documentation updated

---

### Issue #11: Code Duplication
**Status**: 🔴 Open  
**Priority**: Medium  
**Effort**: 2 hours  
**Labels**: Refactoring, Technical Debt

**Description**: `optimizeForDiscord()` duplicated in clipboard.js and export.js

**Location**:
- `public/js/utils/clipboard.js:239-255`
- `public/js/utils/export.js:227-243`

**Proposed Solution**:
```javascript
// Create public/js/utils/discord-formatter.js
export class DiscordFormatter {
    static optimize(content) { ... }
}
```

**Acceptance Criteria**:
- [ ] Create DiscordFormatter utility
- [ ] Update clipboard.js to use it
- [ ] Update export.js to use it
- [ ] Tests updated
- [ ] No functionality broken

---

### Issue #12: No Image Size Validation
**Status**: 🔴 Open  
**Priority**: Medium  
**Effort**: 4 hours  
**Labels**: Bug, Enhancement

**Description**: Large images not validated or resized

**Location**: `public/js/generators/image.js:66`

**Risk**: Memory issues, browser crashes

**Proposed Solution**:
```javascript
async loadImage(source) {
    const img = await this.loadImageElement(source);

    // Check dimensions
    const MAX_DIMENSION = 2000;
    if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
        return this.resizeImage(img, MAX_DIMENSION);
    }

    return img;
}
```

**Acceptance Criteria**:
- [ ] Image size validation added
- [ ] Auto-resize for large images
- [ ] User notified of resizing
- [ ] Tests for edge cases
- [ ] Performance improved

---

## 🟢 Low Priority / Nice to Have

### Issue #13: Real-Time Preview
**Status**: 🔴 Open  
**Priority**: Low  
**Effort**: 8 hours  
**Labels**: Feature, Enhancement

**Description**: Show ASCII art preview as user types

**Implementation**:
```javascript
this.elements.get('textInput').addEventListener('input',
    this.debounce(() => this.generateText(), 500)
);
```

**Acceptance Criteria**:
- [ ] Debounced preview (500ms)
- [ ] Toggle preview on/off
- [ ] Performance optimized
- [ ] Tests written

---

### Issue #14: Preset System
**Status**: 🔴 Open  
**Priority**: Low  
**Effort**: 12 hours  
**Labels**: Feature, Enhancement

**Description**: Allow users to save favorite settings

**Features**:
- Save/load presets
- Default preset library
- Import/export presets
- Search/filter presets

**Acceptance Criteria**:
- [ ] PresetManager class created
- [ ] UI for managing presets
- [ ] 5+ default presets included
- [ ] Tests written
- [ ] Documentation added

---

### Issue #15: URL Sharing
**Status**: 🔴 Open  
**Priority**: Low  
**Effort**: 6 hours  
**Labels**: Feature, Enhancement

**Description**: Share ASCII art via URL

**Implementation**:
```javascript
class ShareManager {
    generateShareUrl(content, metadata) {
        // Compress and encode content
        // Return shareable URL
    }
}
```

**Acceptance Criteria**:
- [ ] Generate share URLs
- [ ] Parse URL on load
- [ ] "Share" button in UI
- [ ] QR code generation
- [ ] Social media optimization

---

### Issue #16: Undo/Redo System
**Status**: 🔴 Open  
**Priority**: Low  
**Effort**: 8 hours  
**Labels**: Feature, Enhancement

**Description**: Track generation history

**Features**:
- Undo (Ctrl+Z)
- Redo (Ctrl+Y)
- History limit (50 items)
- Session persistence

**Acceptance Criteria**:
- [ ] HistoryManager class
- [ ] Undo/Redo UI buttons
- [ ] Keyboard shortcuts
- [ ] Tests written
- [ ] Max 50 items in history

---

### Issue #17: SVG Export
**Status**: 🔴 Open  
**Priority**: Low  
**Effort**: 8 hours  
**Labels**: Feature, Enhancement

**Description**: Export ASCII art as SVG

**Benefits**:
- Scalable output
- Embedded fonts
- Smaller file sizes
- Better for printing

**Acceptance Criteria**:
- [ ] SVG generator created
- [ ] Styling options
- [ ] Embedded font support
- [ ] File size optimized
- [ ] Tests written

---

### Issue #18: Batch Processing
**Status**: 🔴 Open  
**Priority**: Low  
**Effort**: 12 hours  
**Labels**: Feature, Enhancement

**Description**: Process multiple files at once

**Features**:
- Upload CSV/TXT for batch text
- Upload multiple images
- Parallel processing
- ZIP download

**Acceptance Criteria**:
- [ ] Batch UI created
- [ ] Queue system implemented
- [ ] Progress tracking
- [ ] ZIP export working
- [ ] Tests written

---

### Issue #19: Animation Support
**Status**: 🔴 Open  
**Priority**: Low  
**Effort**: 20 hours  
**Labels**: Feature, Innovation

**Description**: Create animated ASCII art

**Features**:
- Frame-by-frame editor
- Video to ASCII conversion
- Live webcam mode
- GIF/MP4 export

**Acceptance Criteria**:
- [ ] Animation editor created
- [ ] Video conversion working
- [ ] Webcam integration
- [ ] Export as GIF/MP4
- [ ] Performance optimized

---

### Issue #20: AI Features
**Status**: 🔴 Open  
**Priority**: Low  
**Effort**: 24 hours  
**Labels**: Feature, Innovation, AI

**Description**: AI-powered enhancements

**Features**:
- Auto font suggestions
- Image enhancement
- Smart cropping
- Text-to-image-to-ASCII

**Requirements**:
- OpenAI API or similar
- Budget for API calls
- Privacy considerations

**Acceptance Criteria**:
- [ ] AI integration working
- [ ] 3+ AI features implemented
- [ ] Privacy policy updated
- [ ] Costs reasonable
- [ ] User consent obtained

---

## 📊 Issue Statistics

### By Priority
- 🔴 Critical: 3 (3 completed, 0 open)
- 🟠 High: 5 (1 completed, 4 open)
- 🟡 Medium: 4 (0 completed, 4 open)
- 🟢 Low: 8 (0 completed, 8 open)

### By Status
- ✅ Completed: 4
- 🔴 Open: 16
- 🟡 In Progress: 0
- 🔵 Blocked: 0

### By Label
- Feature: 9
- Enhancement: 8
- Bug: 3
- Security: 1
- Performance: 1
- Infrastructure: 3
- Refactoring: 2
- DevOps: 1
- Monitoring: 1

---

## 🎯 Sprint Planning

### Sprint 1 (Week 1-2) - Foundation ✅
- [x] Testing infrastructure
- [x] Linting and formatting
- [x] Bug fixes (memory leaks)
- [x] CI/CD pipeline

### Sprint 2 (Week 3-4) - Security & Features
- [ ] #5: CSP Security
- [ ] #6: FIGlet Mode
- [ ] #8: Error Tracking
- [ ] #9: Build Pipeline

### Sprint 3 (Week 5-6) - Core Features
- [ ] #13: Real-Time Preview
- [ ] #14: Preset System
- [ ] #15: URL Sharing
- [ ] #17: SVG Export

### Sprint 4 (Week 7-8) - Performance
- [ ] #7: Web Workers
- [ ] #10: Refactor app.js
- [ ] #11: Code Duplication
- [ ] #12: Image Validation

### Sprint 5 (Week 9-10) - Advanced Features
- [ ] #16: Undo/Redo
- [ ] #18: Batch Processing
- [ ] Additional enhancements

### Sprint 6 (Week 11+) - Innovation
- [ ] #19: Animation Support
- [ ] #20: AI Features
- [ ] Polish and optimization

---

## 📝 Notes

### Creating GitHub Issues
Use this template when creating issues:

```markdown
## Description
[Brief description]

## Priority
[Critical / High / Medium / Low]

## Effort
[Estimated hours]

## Location
[File paths and line numbers]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Labels
[bug, feature, enhancement, security, etc.]
```

### Contribution Guidelines
1. Pick an issue from this list
2. Create a feature branch: `feature/issue-#`
3. Implement changes
4. Write tests (80%+ coverage)
5. Update documentation
6. Create pull request
7. Get code review
8. Merge to main

---

**Maintained by**: Development Team  
**Review Frequency**: Weekly  
**Last Review**: 2025-11-06
