/**
 * Unit tests for WarezGenerator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WarezGenerator } from '../../../public/js/generators/warez.js';

describe('WarezGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new WarezGenerator();
  });

  describe('generate()', () => {
    it('should generate a banner from text', async () => {
      const result = await generator.generate('TEST', { style: 'classic' });

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toContain('TEST');
      expect(result).toContain('╔');
      expect(result).toContain('╗');
    });

    it('should handle multiline banners', async () => {
      const result = await generator.generate('LINE1|LINE2', { style: 'classic', multiline: true });

      expect(result).toContain('LINE1');
      expect(result).toContain('LINE2');
    });

    it('should apply different styles', async () => {
      const classic = await generator.generate('TEST', { style: 'classic' });
      const elite = await generator.generate('TEST', { style: 'elite' });
      const minimal = await generator.generate('TEST', { style: 'minimal' });

      expect(classic).toContain('╔');
      expect(elite).toContain('┌');
      expect(minimal).toContain('+');
    });

    it('should add credits when requested', async () => {
      const result = await generator.generate('TEST', {
        style: 'classic',
        addCredits: true,
        credits: 'MY CREW'
      });

      expect(result).toContain('MY CREW');
    });

    it('should add date when requested', async () => {
      const result = await generator.generate('TEST', {
        style: 'classic',
        addCredits: true,
        addDate: true
      });

      const datePattern = /\d{4}-\d{2}-\d{2}/;
      expect(datePattern.test(result)).toBe(true);
    });

    it('should apply text effects', async () => {
      const leetspeak = await generator.generate('TEST', {
        style: 'classic',
        textEffect: 'leetspeak'
      });

      expect(leetspeak).toContain('7357'); // TEST in leetspeak
    });

    it('should throw error for empty text', async () => {
      await expect(generator.generate('')).rejects.toThrow('Banner text cannot be empty');
    });

    it('should throw error for too long text', async () => {
      const longText = 'a'.repeat(100);
      await expect(generator.generate(longText)).rejects.toThrow('too long');
    });
  });

  describe('validateInput()', () => {
    it('should validate correct input', () => {
      const result = generator.validateInput('HELLO');

      expect(result.valid).toBe(true);
    });

    it('should reject empty input', () => {
      const result = generator.validateInput('');

      expect(result.valid).toBe(false);
    });

    it('should reject too long input', () => {
      const longText = 'a'.repeat(100);
      const result = generator.validateInput(longText);

      expect(result.valid).toBe(false);
    });
  });

  describe('applyTextEffect()', () => {
    it('should convert to uppercase by default', () => {
      const result = generator.applyTextEffect('hello', 'uppercase');

      expect(result).toBe('HELLO');
    });

    it('should apply leetspeak', () => {
      const result = generator.applyTextEffect('ELITE', 'leetspeak');

      expect(result).toContain('3'); // E -> 3
      expect(result).toContain('1'); // I -> 1
      expect(result).toContain('7'); // T -> 7
    });

    it('should apply alternating case', () => {
      const result = generator.applyTextEffect('test', 'alternating');

      expect(result).toBe('TeSt');
    });

    it('should apply spaced effect', () => {
      const result = generator.applyTextEffect('HI', 'spaced');

      expect(result).toBe('H I');
    });

    it('should apply wide (full-width) effect', () => {
      const result = generator.applyTextEffect('A', 'wide');

      expect(result.charCodeAt(0)).toBeGreaterThan(127);
    });

    it('should preserve normal case', () => {
      const result = generator.applyTextEffect('Hello', 'normal');

      expect(result).toBe('Hello');
    });
  });

  describe('splitIntoLines()', () => {
    it('should split text by pipe', () => {
      const result = generator.splitIntoLines('LINE1|LINE2|LINE3');

      expect(result).toEqual(['LINE1', 'LINE2', 'LINE3']);
    });

    it('should split text by newline', () => {
      const result = generator.splitIntoLines('LINE1\nLINE2\nLINE3');

      expect(result).toEqual(['LINE1', 'LINE2', 'LINE3']);
    });

    it('should trim whitespace', () => {
      const result = generator.splitIntoLines('  LINE1  |  LINE2  ');

      expect(result).toEqual(['LINE1', 'LINE2']);
    });

    it('should filter empty lines', () => {
      const result = generator.splitIntoLines('LINE1||LINE2');

      expect(result).toEqual(['LINE1', 'LINE2']);
    });

    it('should return single line for text without separators', () => {
      const result = generator.splitIntoLines('SINGLE LINE');

      expect(result).toEqual(['SINGLE LINE']);
    });
  });

  describe('getAvailableStyles()', () => {
    it('should return list of available styles', () => {
      const styles = generator.getAvailableStyles();

      expect(Array.isArray(styles)).toBe(true);
      expect(styles.length).toBeGreaterThan(0);
    });

    it('should include all 13 styles', () => {
      const styles = generator.getAvailableStyles();

      expect(styles.length).toBe(13);
      expect(styles).toContain('classic');
      expect(styles).toContain('elite');
      expect(styles).toContain('minimal');
      expect(styles).toContain('graffiti');
      expect(styles).toContain('matrix');
      expect(styles).toContain('cyber');
      expect(styles).toContain('neon');
      expect(styles).toContain('oldschool');
      expect(styles).toContain('diamond');
      expect(styles).toContain('shadow');
      expect(styles).toContain('block');
      expect(styles).toContain('wave');
      expect(styles).toContain('star');
    });
  });

  describe('getStyleInfo()', () => {
    it('should return style information', () => {
      const info = generator.getStyleInfo('classic');

      expect(info).toBeTruthy();
      expect(info).toHaveProperty('name');
      expect(info).toHaveProperty('preview');
    });

    it('should return null for unknown style', () => {
      const info = generator.getStyleInfo('nonexistent');

      expect(info).toBeNull();
    });
  });
});
