import { describe, it, expect, vi } from 'vitest';
import { mapOWMCondition, mapWAPICondition } from './weatherService';

describe('Weather Normalization', () => {
  describe('mapOWMCondition', () => {
    it('should return stormy for 200 codes', () => {
      expect(mapOWMCondition(201)).toBe('stormy');
      expect(mapOWMCondition(299)).toBe('stormy');
    });

    it('should return rainy for 300-599 codes', () => {
      expect(mapOWMCondition(305)).toBe('rainy');
      expect(mapOWMCondition(500)).toBe('rainy');
    });

    it('should return snowy for 600-699 codes', () => {
      expect(mapOWMCondition(600)).toBe('snowy');
      expect(mapOWMCondition(611)).toBe('snowy');
    });

    it('should return clear for 800 code', () => {
      expect(mapOWMCondition(800)).toBe('clear');
    });

    it('should return cloudy for unknown or OWM atmosphere codes', () => {
      expect(mapOWMCondition(701)).toBe('cloudy');
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

    it('should return snowy for 1210', () => {
      expect(mapWAPICondition(1210)).toBe('snowy');
    });

    it('should return stormy for 1087', () => {
      expect(mapWAPICondition(1087)).toBe('stormy');
    });

    it('should return cloudy fallback for unknown codes', () => {
      expect(mapWAPICondition(9999)).toBe('cloudy');
    });
  });
});
