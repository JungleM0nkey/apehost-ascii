/**
 * Unit tests for ClipboardManager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClipboardManager } from '../../../public/js/utils/clipboard.js';

describe('ClipboardManager', () => {
  let clipboard;

  beforeEach(() => {
    clipboard = new ClipboardManager();
  });

  describe('checkSupport()', () => {
    it('should detect clipboard API support', () => {
      const supported = clipboard.checkSupport();

      expect(typeof supported).toBe('boolean');
    });
  });

  describe('copy()', () => {
    it('should copy text to clipboard', async () => {
      const text = 'Test ASCII Art';

      await clipboard.copy(text);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
    });

    it('should throw error for empty text', async () => {
      await expect(clipboard.copy('')).rejects.toThrow('No content to copy');
    });

    it('should handle whitespace-only text', async () => {
      await expect(clipboard.copy('   ')).rejects.toThrow('No content to copy');
    });
  });

  describe('validateCopyContent()', () => {
    it('should validate correct content', () => {
      const result = clipboard.validateCopyContent('Valid content');

      expect(result.valid).toBe(true);
    });

    it('should reject empty content', () => {
      const result = clipboard.validateCopyContent('');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('No content');
    });

    it('should reject whitespace-only content', () => {
      const result = clipboard.validateCopyContent('   ');

      expect(result.valid).toBe(false);
    });

    it('should reject content exceeding max size', () => {
      const largeContent = 'a'.repeat(100001);
      const result = clipboard.validateCopyContent(largeContent);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('too large');
    });
  });

  describe('optimizeForDiscord()', () => {
    it('should replace formatting characters', () => {
      const content = 'Test * _ ~ content';
      const result = clipboard.optimizeForDiscord(content);

      expect(result).not.toContain('*');
      expect(result).not.toContain('_');
      expect(result).not.toContain('~');
    });

    it('should preserve structure', () => {
      const content = 'Line1\nLine2\nLine3';
      const result = clipboard.optimizeForDiscord(content);
      const lines = result.split('\n');

      expect(lines.length).toBe(3);
    });

    it('should limit consecutive empty lines', () => {
      const content = 'Line1\n\n\n\n\nLine2';
      const result = clipboard.optimizeForDiscord(content);

      expect(result).not.toContain('\n\n\n');
    });

    it('should trim line endings', () => {
      const content = 'Line1     \nLine2     ';
      const result = clipboard.optimizeForDiscord(content);

      expect(result).toBe('Line1\nLine2');
    });
  });

  describe('copyForDiscord()', () => {
    it('should format content for Discord', async () => {
      const content = 'ASCII Art';
      const metadata = { mode: 'text' };

      await clipboard.copyForDiscord(content, metadata);

      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      const copiedText = navigator.clipboard.writeText.mock.calls[0][0];

      expect(copiedText).toContain('**ASCII Art - TEXT**');
      expect(copiedText).toContain('```');
      expect(copiedText).toContain('ApeHost');
    });
  });

  describe('generateHeader()', () => {
    it('should generate header with mode and timestamp', () => {
      const metadata = { mode: 'text' };
      const header = clipboard.generateHeader(metadata);

      expect(header).toContain('TEXT');
      expect(header).toContain('Generated');
    });
  });

  describe('generateFooter()', () => {
    it('should generate footer with branding', () => {
      const footer = clipboard.generateFooter();

      expect(footer).toContain('ApeHost');
    });
  });
});
