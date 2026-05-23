import { describe, it, expect, vi } from 'vitest';
import { mapOWMCondition, mapWAPICondition } from './weatherService';

describe('Weather Normalization', () => {
  describe('mapOWMCondition', () => {
    it('should return stormy for 200 codes', () => {
      expect(mapOWMCondition(201)).toBe('stormy');
    });

    it('should return clear for 800 code', () => {
      expect(mapOWMCondition(800)).toBe('clear');
    });

    it('should return cloudy for unknown codes', () => {
      expect(mapOWMCondition(999)).toBe('cloudy');
    });
  });

  describe('mapWAPICondition', () => {
    it('should return clear for 1000', () => {
      expect(mapWAPICondition(1000)).toBe('clear');
    });

    it('should return rainy for 1063', () => {
      expect(mapWAPICondition(1063)).toBe('rainy');
    });
  });
});
