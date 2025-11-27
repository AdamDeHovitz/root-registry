import { describe, it, expect } from 'vitest';
import { parseOCRText } from '../parser';

describe('parseOCRText - Unit Tests', () => {
  describe('Faction Matching', () => {
    it('should match exact faction names', () => {
      const text = 'Eyrie 30\nMarquise de Cat 25\nWoodland Alliance 20';
      const result = parseOCRText(text);

      expect(result.players).toHaveLength(3);
      expect(result.players[0].faction).toBe('Eyrie');
      expect(result.players[0].score).toBe(30);
      expect(result.players[1].faction).toBe('Marquise de Cat');
      expect(result.players[2].faction).toBe('Woodland Alliance');
    });

    it('should match faction aliases (English)', () => {
      const text = 'birds 30\ncat 25\nalliance 20';
      const result = parseOCRText(text);

      expect(result.players).toHaveLength(3);
      expect(result.players[0].faction).toBe('Eyrie');
      expect(result.players[1].faction).toBe('Marquise de Cat');
      expect(result.players[2].faction).toBe('Woodland Alliance');
    });

    it('should match French faction names', () => {
      const text = 'Canopée 32\nMarquis 14';
      const result = parseOCRText(text);

      expect(result.players).toHaveLength(2);
      expect(result.players[0].faction).toBe('Eyrie');
      expect(result.players[1].faction).toBe('Marquise de Cat');
    });

    it('should match expansion factions', () => {
      const text = 'Lizard Cult 25\nRiverfolk Company 22\nCorvid Conspiracy 18';
      const result = parseOCRText(text);

      expect(result.players).toHaveLength(3);
      expect(result.players[0].faction).toBe('Lizard Cult');
      expect(result.players[1].faction).toBe('Riverfolk Company');
      expect(result.players[2].faction).toBe('Corvid Conspiracy');
    });

    it('should match expansion faction aliases', () => {
      const text = 'otters 22\ncrows 18\nrats 30';
      const result = parseOCRText(text);

      expect(result.players).toHaveLength(3);
      expect(result.players[0].faction).toBe('Riverfolk Company');
      expect(result.players[1].faction).toBe('Corvid Conspiracy');
      expect(result.players[2].faction).toBe('Lord of the Hundreds');
    });
  });

  describe('Score Extraction', () => {
    it('should extract scores from end of line', () => {
      const text = 'Eyrie 30\nMarquise de Cat 25';
      const result = parseOCRText(text);

      expect(result.players[0].score).toBe(30);
      expect(result.players[1].score).toBe(25);
    });

    it('should handle single-digit scores', () => {
      const text = 'Eyrie 9\nMarquise de Cat 5';
      const result = parseOCRText(text);

      expect(result.players[0].score).toBe(9);
      expect(result.players[1].score).toBe(5);
    });

    it('should handle no score (dominance victory)', () => {
      const text = 'Eyrie\nMarquise de Cat 25';
      const result = parseOCRText(text);

      expect(result.players[0].faction).toBe('Eyrie');
      expect(result.players[0].score).toBeUndefined();
      expect(result.players[1].score).toBe(25);
    });
  });

  describe('Map Matching', () => {
    it('should match exact map names', () => {
      const text = 'Fall\nEyrie 30';
      const result = parseOCRText(text);

      expect(result.map).toBe('Fall');
    });

    it('should match map aliases', () => {
      const text = 'autumn\nEyrie 30';
      const result = parseOCRText(text);

      expect(result.map).toBe('Fall');
    });

    it('should match French map names', () => {
      const text = 'automne\nEyrie 30';
      const result = parseOCRText(text);

      expect(result.map).toBe('Fall');
    });

    it('should not set map if not found', () => {
      const text = 'Eyrie 30\nMarquise de Cat 25';
      const result = parseOCRText(text);

      expect(result.map).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input', () => {
      const text = '';
      const result = parseOCRText(text);

      expect(result.players).toHaveLength(0);
      expect(result.map).toBeUndefined();
    });

    it('should handle whitespace-only input', () => {
      const text = '   \n   \n   ';
      const result = parseOCRText(text);

      expect(result.players).toHaveLength(0);
    });

    it('should ignore lines with no recognized factions', () => {
      const text = 'Some random text\nEyrie 30\nMore random text\nMarquise de Cat 25';
      const result = parseOCRText(text);

      expect(result.players).toHaveLength(2);
      expect(result.players[0].faction).toBe('Eyrie');
      expect(result.players[1].faction).toBe('Marquise de Cat');
    });

    it('should handle mixed case', () => {
      const text = 'EYRIE 30\nmarquise de cat 25';
      const result = parseOCRText(text);

      expect(result.players).toHaveLength(2);
      expect(result.players[0].faction).toBe('Eyrie');
      expect(result.players[1].faction).toBe('Marquise de Cat');
    });

    it('should handle extra whitespace', () => {
      const text = '  Eyrie   30  \n  Marquise de Cat   25  ';
      const result = parseOCRText(text);

      expect(result.players).toHaveLength(2);
      expect(result.players[0].score).toBe(30);
      expect(result.players[1].score).toBe(25);
    });
  });

  describe('Complex Scenarios', () => {
    it('should parse a typical 4-player game', () => {
      const text = `
        Fall
        Eyrie 30
        Woodland Alliance 25
        Marquise de Cat 20
        Vagabond 15
      `;
      const result = parseOCRText(text);

      expect(result.map).toBe('Fall');
      expect(result.players).toHaveLength(4);
      expect(result.players[0].faction).toBe('Eyrie');
      expect(result.players[1].faction).toBe('Woodland Alliance');
      expect(result.players[2].faction).toBe('Marquise de Cat');
      expect(result.players[3].faction).toBe('Vagabond');
    });

    it('should handle partial matches in faction names', () => {
      const text = 'Eyrie Dynasty 30\nWoodland 25';
      const result = parseOCRText(text);

      expect(result.players).toHaveLength(2);
      expect(result.players[0].faction).toBe('Eyrie');
      expect(result.players[1].faction).toBe('Woodland Alliance');
    });
  });
});
