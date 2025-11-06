/**
 * Unit tests for TextGenerator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TextGenerator } from '../../../public/js/generators/text.js';

describe('TextGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new TextGenerator();
  });

  describe('generate()', () => {
    it('should generate ASCII art from text', async () => {
      const result = await generator.generate('TEST', { font: 'standard' });

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('█');
    });

    it('should handle lowercase text', async () => {
      const result = await generator.generate('hello', { font: 'standard' });

      expect(result).toBeTruthy();
      expect(result).toContain('█');
    });

    it('should handle numbers', async () => {
      const result = await generator.generate('123', { font: 'standard' });

      expect(result).toBeTruthy();
      expect(result).toContain('█');
    });

    it('should handle special characters', async () => {
      const result = await generator.generate('HI!', { font: 'standard' });

      expect(result).toBeTruthy();
    });

    it('should apply spacing options', async () => {
      const narrow = await generator.generate('AB', { font: 'standard', spacing: 'narrow' });
      const normal = await generator.generate('AB', { font: 'standard', spacing: 'normal' });
      const wide = await generator.generate('AB', { font: 'standard', spacing: 'wide' });

      expect(wide.split('\n')[0].length).toBeGreaterThan(normal.split('\n')[0].length);
      expect(normal.split('\n')[0].length).toBeGreaterThan(narrow.split('\n')[0].length);
    });

    it('should use different fonts', async () => {
      const standard = await generator.generate('A', { font: 'standard' });
      const small = await generator.generate('A', { font: 'small' });
      const big = await generator.generate('A', { font: 'big' });

      expect(standard.split('\n').length).toBe(6);
      expect(small.split('\n').length).toBe(4);
      expect(big.split('\n').length).toBe(8);
    });

    it('should throw error for empty text', async () => {
      await expect(generator.generate('')).rejects.toThrow('Input cannot be empty');
    });

    it('should throw error for text exceeding max length', async () => {
      const longText = 'a'.repeat(101);
      await expect(generator.generate(longText)).rejects.toThrow('maximum length');
    });
  });

  describe('validateInput()', () => {
    it('should validate correct input', () => {
      const result = generator.validateInput('Hello World');

      expect(result.valid).toBe(true);
    });

    it('should reject empty input', () => {
      const result = generator.validateInput('');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject whitespace-only input', () => {
      const result = generator.validateInput('   ');

      expect(result.valid).toBe(false);
    });

    it('should reject too long input', () => {
      const result = generator.validateInput('a'.repeat(101));

      expect(result.valid).toBe(false);
      expect(result.error).toContain('maximum length');
    });

    it('should reject invalid characters', () => {
      const result = generator.validateInput('Hello 你好');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('invalid characters');
    });

    it('should accept numbers and punctuation', () => {
      const result = generator.validateInput('Test 123!?.');

      expect(result.valid).toBe(true);
    });
  });

  describe('convertTextToAscii()', () => {
    it('should convert text to ASCII lines', () => {
      const fontData = generator.fonts.get('standard');
      const result = generator.convertTextToAscii('AB', fontData, 'normal');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(fontData.height);
      expect(result.every(line => typeof line === 'string')).toBe(true);
    });

    it('should handle spaces', () => {
      const fontData = generator.fonts.get('standard');
      const result = generator.convertTextToAscii('A B', fontData, 'normal');

      expect(result.every(line => line.includes('   '))).toBe(true);
    });
  });

  describe('getCharacterData()', () => {
    it('should get character data from font', () => {
      const fontData = generator.fonts.get('standard');
      const charData = generator.getCharacterData('A', fontData);

      expect(Array.isArray(charData)).toBe(true);
      expect(charData.length).toBe(fontData.height);
    });

    it('should return space for space character', () => {
      const fontData = generator.fonts.get('standard');
      const charData = generator.getCharacterData(' ', fontData);

      expect(charData.every(line => line === '   ')).toBe(true);
    });

    it('should return fallback for unknown character', () => {
      const fontData = generator.fonts.get('standard');
      const charData = generator.getCharacterData('©', fontData);

      expect(Array.isArray(charData)).toBe(true);
      expect(charData.length).toBe(fontData.height);
    });
  });

  describe('getAvailableFonts()', () => {
    it('should return list of available fonts', () => {
      const fonts = generator.getAvailableFonts();

      expect(Array.isArray(fonts)).toBe(true);
      expect(fonts.length).toBeGreaterThan(0);
      expect(fonts[0]).toHaveProperty('id');
      expect(fonts[0]).toHaveProperty('name');
      expect(fonts[0]).toHaveProperty('height');
    });

    it('should include standard, small, and big fonts', () => {
      const fonts = generator.getAvailableFonts();
      const fontIds = fonts.map(f => f.id);

      expect(fontIds).toContain('standard');
      expect(fontIds).toContain('small');
      expect(fontIds).toContain('big');
    });
  });

  describe('addFont() and removeFont()', () => {
    it('should add custom font', () => {
      const customFont = {
        height: 3,
        chars: {
          'A': ['AAA', 'A A', 'AAA']
        }
      };

      generator.addFont('custom', customFont);

      expect(generator.fonts.has('custom')).toBe(true);
    });

    it('should throw error for invalid font data', () => {
      expect(() => generator.addFont('invalid', {})).toThrow('Invalid font data');
    });

    it('should remove custom font', () => {
      const customFont = {
        height: 3,
        chars: {
          'A': ['AAA', 'A A', 'AAA']
        }
      };

      generator.addFont('custom', customFont);
      generator.removeFont('custom');

      expect(generator.fonts.has('custom')).toBe(false);
    });

    it('should not remove standard font', () => {
      expect(() => generator.removeFont('standard')).toThrow('Cannot remove standard font');
    });
  });
});
