import { describe, it, expect } from 'vitest';
import {
  calculateWiscV,
  calculateWaisIV,
  validateScaledScore,
  SubtestId,
} from '../../core';

describe('Tier 2 - Degenerate & Malformed Inputs', () => {
  describe('Negative & Out-of-Bounds Numbers', () => {
    it('rejects negative scaled scores (-1, -10, -999)', () => {
      expect(validateScaledScore(-1).isValid).toBe(false);
      expect(validateScaledScore(-10).isValid).toBe(false);
      expect(validateScaledScore(-999).isValid).toBe(false);
    });

    it('rejects numbers above upper limit 19 (20, 50, 999)', () => {
      expect(validateScaledScore(20).isValid).toBe(false);
      expect(validateScaledScore(50).isValid).toBe(false);
      expect(validateScaledScore(999).isValid).toBe(false);
    });

    it('ignores negative score in calculateWiscV and does not compute index', () => {
      const res = calculateWiscV({ S: -5, V: 10 });
      expect(res.primaryIndices.ICV).toBeNull();
    });

    it('ignores score > 19 in calculateWaisIV and does not compute index', () => {
      const res = calculateWaisIV({ WAIS_S: 25, WAIS_V: 10, WAIS_I: 10 });
      expect(res.primaryIndices.ICV).toBeNull();
    });

    it('rejects positive and negative Infinity', () => {
      expect(validateScaledScore(Infinity).isValid).toBe(false);
      expect(validateScaledScore(-Infinity).isValid).toBe(false);
    });
  });

  describe('Non-Numeric Strings & Injection Payloads', () => {
    it('rejects arbitrary alphabetic strings ("abc", "text")', () => {
      expect(validateScaledScore('abc').isValid).toBe(false);
      expect(validateScaledScore('text').isValid).toBe(false);
    });

    it('rejects punctuation and placeholders ("--", "N/A", "?")', () => {
      expect(validateScaledScore('--').isValid).toBe(false);
      expect(validateScaledScore('N/A').isValid).toBe(false);
      expect(validateScaledScore('?').isValid).toBe(false);
    });

    it('rejects string "NaN" and string "null"', () => {
      expect(validateScaledScore('NaN').isValid).toBe(false);
      expect(validateScaledScore('null').isValid).toBe(false);
    });

    it('rejects HTML / script tag strings without executing or crashing', () => {
      expect(validateScaledScore('<script>alert(1)</script>').isValid).toBe(false);
      expect(validateScaledScore('<b>10</b>').isValid).toBe(false);
    });

    it('rejects whitespace-only strings', () => {
      expect(validateScaledScore('   ').isValid).toBe(false);
      expect(validateScaledScore('\t\n').isValid).toBe(false);
    });
  });

  describe('NaN, Null, Undefined & Non-Number Types', () => {
    it('rejects actual NaN value', () => {
      expect(validateScaledScore(NaN).isValid).toBe(false);
    });

    it('rejects null value', () => {
      expect(validateScaledScore(null).isValid).toBe(false);
    });

    it('rejects undefined value', () => {
      expect(validateScaledScore(undefined).isValid).toBe(false);
    });

    it('rejects boolean values true and false', () => {
      expect(validateScaledScore(true).isValid).toBe(false);
      expect(validateScaledScore(false).isValid).toBe(false);
    });

    it('rejects objects and arrays as scores', () => {
      expect(validateScaledScore({ score: 10 }).isValid).toBe(false);
      expect(validateScaledScore([10]).isValid).toBe(false);
    });
  });

  describe('Decimals & Floating Point Numbers', () => {
    it('rejects typical fractional scaled scores (10.5, 8.25)', () => {
      expect(validateScaledScore(10.5).isValid).toBe(false);
      expect(validateScaledScore(8.25).isValid).toBe(false);
    });

    it('rejects small epsilon deviations (10.0001, 9.9999)', () => {
      expect(validateScaledScore(10.0001).isValid).toBe(false);
      expect(validateScaledScore(9.9999).isValid).toBe(false);
    });

    it('rejects decimal numbers passed to engine without computing corrupt sums', () => {
      const res = calculateWiscV({ S: 10.5 as unknown as number, V: 10 });
      expect(res.primaryIndices.ICV).toBeNull();
    });

    it('rejects negative floats (-3.14)', () => {
      expect(validateScaledScore(-3.14).isValid).toBe(false);
    });

    it('rejects irrational mathematical constants (Math.SQRT2, Math.E)', () => {
      expect(validateScaledScore(Math.SQRT2).isValid).toBe(false);
      expect(validateScaledScore(Math.E).isValid).toBe(false);
    });
  });

  describe('Incomplete Input States & Partial Records', () => {
    it('handles completely empty input object gracefully without throwing in WISC-V', () => {
      const res = calculateWiscV({});
      expect(res.primaryIndices.ICV).toBeNull();
      expect(res.primaryIndices.IVE).toBeNull();
      expect(res.primaryIndices.IRF).toBeNull();
      expect(res.primaryIndices.IMT).toBeNull();
      expect(res.primaryIndices.IVP).toBeNull();
      expect(res.cit).toBeNull();
      expect(res.isCompleteCit).toBe(false);
      expect(res.discrepancies).toEqual([]);
      expect(res.strengthsWeaknesses).toEqual([]);
    });

    it('handles completely empty input object gracefully without throwing in WAIS-IV', () => {
      const res = calculateWaisIV({});
      expect(res.primaryIndices.ICV).toBeNull();
      expect(res.primaryIndices.IRP).toBeNull();
      expect(res.primaryIndices.IMT).toBeNull();
      expect(res.primaryIndices.IVP).toBeNull();
      expect(res.cit).toBeNull();
      expect(res.isCompleteCit).toBe(false);
      expect(res.discrepancies).toEqual([]);
      expect(res.strengthsWeaknesses).toEqual([]);
    });

    it('does not calculate CIT when only 1 of 7 required subtests is provided', () => {
      const res = calculateWiscV({ S: 10 });
      expect(res.cit).toBeNull();
      expect(res.isCompleteCit).toBe(false);
    });

    it('does not calculate CIT when 6 of 7 required subtests are provided without substitution', () => {
      const res = calculateWiscV({
        S: 10, V: 10, C: 10, M: 10, B: 10, D: 10, // CL missing
      });
      expect(res.cit).toBeNull();
      expect(res.isCompleteCit).toBe(false);
    });

    it('ignores unknown rogue keys without corrupting valid calculations', () => {
      const input = {
        S: 10,
        V: 10,
        ROGUE_KEY_X: 999 as unknown as number,
      } as Partial<Record<SubtestId, number>>;
      const res = calculateWiscV(input);
      expect(res.primaryIndices.ICV).not.toBeNull();
      expect(res.primaryIndices.ICV?.compositeScore).toBe(100);
    });
  });
});
