import { describe, it, expect } from 'vitest';
import {
  calculateStrengthsWeaknesses,
  calculateWiscV,
  calculateWaisIV,
} from '../../core';

describe('Tier 3 - Ipsative Scatter, Strengths & Weaknesses', () => {
  describe('Uniform Normative Profile (No F or D)', () => {
    it('classifies all 10 subtests as Promedio when all scores are equal to 10', () => {
      const results = calculateStrengthsWeaknesses({
        S: 10, V: 10, C: 10, PV: 10, M: 10, B: 10, D: 10, SD: 10, CL: 10, BS: 10,
      });
      expect(results).toHaveLength(10);
      for (const item of results) {
        expect(item.difference).toBe(0);
        expect(item.classification).toBe('Promedio');
      }
    });

    it('classifies all subtests as Promedio when all scores are uniformly high (15)', () => {
      const results = calculateStrengthsWeaknesses({
        S: 15, V: 15, C: 15, PV: 15, M: 15,
      });
      for (const item of results) {
        expect(item.difference).toBe(0);
        expect(item.classification).toBe('Promedio');
      }
    });
  });

  describe('Identification of Personal Strengths (Fortaleza / F)', () => {
    it('flags subtest with score +3.0 above subject mean as Fortaleza', () => {
      // Scores: 14, 10, 10, 10, 10 -> sum = 54, mean = 10.8 -> 14 - 10.8 = +3.2 >= 2.5
      const results = calculateStrengthsWeaknesses({
        S: 14, V: 10, C: 10, M: 10, B: 10,
      });
      const s = results.find((r) => r.subtestId === 'S');
      expect(s).toBeDefined();
      expect(s?.difference).toBeGreaterThanOrEqual(2.5);
      expect(s?.classification).toBe('Fortaleza');
    });

    it('flags multiple strengths in high aptitude subtests', () => {
      const results = calculateStrengthsWeaknesses({
        S: 18, V: 17, C: 11, M: 10, B: 10, D: 10, CL: 10,
      });
      // sum = 86, mean = 12.3 -> S diff: 18 - 12.3 = 5.7; V diff: 17 - 12.3 = 4.7
      const str = results.filter((r) => r.classification === 'Fortaleza');
      expect(str).toHaveLength(2);
      expect(str.map((s) => s.subtestId)).toEqual(expect.arrayContaining(['S', 'V']));
    });

    it('does not flag subtest when difference is below critical threshold (+2.0 < 2.5)', () => {
      // Mean = 10, Score = 12 -> diff = +2.0 < 2.5 -> Promedio
      const results = calculateStrengthsWeaknesses(
        { S: 12, V: 10, C: 10, M: 10, B: 8 },
        2.5
      );
      const s = results.find((r) => r.subtestId === 'S');
      expect(s?.difference).toBe(2);
      expect(s?.classification).toBe('Promedio');
    });
  });

  describe('Identification of Personal Weaknesses (Debilidad / D)', () => {
    it('flags subtest with score -3.0 below subject mean as Debilidad', () => {
      // Scores: 6, 12, 12, 12, 12 -> sum = 54, mean = 10.8 -> 6 - 10.8 = -4.8 <= -2.5
      const results = calculateStrengthsWeaknesses({
        CL: 6, S: 12, V: 12, C: 12, M: 12,
      });
      const cl = results.find((r) => r.subtestId === 'CL');
      expect(cl).toBeDefined();
      expect(cl?.difference).toBeLessThanOrEqual(-2.5);
      expect(cl?.classification).toBe('Debilidad');
    });

    it('flags severe psychomotor/memory weaknesses in ADHD clinical profile', () => {
      // Profile: High verbal/fluid (12-13), low speed/memory (5-6)
      const res = calculateWiscV({
        C: 11, S: 13, M: 12, D: 6, CL: 5, V: 12, B: 11, PV: 10, SD: 7, BS: 6,
      });
      // Mean = (11+13+12+6+5+12+11+10+7+6) / 10 = 9.3
      // CL (5): 5 - 9.3 = -4.3 -> Debilidad
      // D (6): 6 - 9.3 = -3.3 -> Debilidad
      // BS (6): 6 - 9.3 = -3.3 -> Debilidad
      const weaknesses = res.strengthsWeaknesses.filter((r) => r.classification === 'Debilidad');
      expect(weaknesses.length).toBeGreaterThanOrEqual(2);
      const weakIds = weaknesses.map((w) => w.subtestId);
      expect(weakIds).toContain('CL');
      expect(weakIds).toContain('D');
    });

    it('does not flag subtest when negative difference is above critical threshold (-2.0 > -2.5)', () => {
      const results = calculateStrengthsWeaknesses(
        { S: 8, V: 10, C: 10, M: 10, B: 12 },
        2.5
      );
      const s = results.find((r) => r.subtestId === 'S');
      expect(s?.difference).toBe(-2);
      expect(s?.classification).toBe('Promedio');
    });
  });

  describe('Integration & Custom Thresholds', () => {
    it('supports custom critical difference threshold (e.g. 3.0 points)', () => {
      // Score = 13, Mean = 10 -> diff = 3.0
      // With threshold 3.5 -> Promedio. With threshold 2.5 -> Fortaleza.
      const resStrict = calculateStrengthsWeaknesses(
        { S: 13, V: 10, C: 10, M: 10, B: 7 }, // sum=50, mean=10
        3.5
      );
      const sStrict = resStrict.find((r) => r.subtestId === 'S');
      expect(sStrict?.classification).toBe('Promedio');

      const resLenient = calculateStrengthsWeaknesses(
        { S: 13, V: 10, C: 10, M: 10, B: 7 },
        2.5
      );
      const sLenient = resLenient.find((r) => r.subtestId === 'S');
      expect(sLenient?.classification).toBe('Fortaleza');
    });

    it('returns empty array when no valid subtests are provided', () => {
      const emptyRes = calculateStrengthsWeaknesses({});
      expect(emptyRes).toEqual([]);
    });

    it('filters out invalid / corrupt subtest entries from scatter calculation', () => {
      const results = calculateStrengthsWeaknesses({
        S: 10,
        V: 10,
        C: -5 as unknown as number,
        M: 99 as unknown as number,
      });
      expect(results).toHaveLength(2);
      expect(results.map((r) => r.subtestId)).toEqual(['S', 'V']);
    });
  });
});
