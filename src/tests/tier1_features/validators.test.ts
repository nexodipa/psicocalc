import { describe, it, expect } from 'vitest';
import {
  validateScaledScore,
  calculateChronologicalAge,
  validateAgeAndBattery,
} from '../../core';

describe('Tier 1 - Validation Rules', () => {
  describe('Rule 1: Subtest Range [1..19]', () => {
    it('accepts the absolute lower boundary 1', () => {
      const res = validateScaledScore(1);
      expect(res.isValid).toBe(true);
      expect(res.errorMessage).toBeUndefined();
    });

    it('accepts the absolute upper boundary 19', () => {
      const res = validateScaledScore(19);
      expect(res.isValid).toBe(true);
      expect(res.errorMessage).toBeUndefined();
    });

    it('accepts normative mean score 10', () => {
      const res = validateScaledScore(10);
      expect(res.isValid).toBe(true);
    });

    it('rejects values below the lower boundary (0)', () => {
      const res = validateScaledScore(0);
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toContain('mínima');
    });

    it('rejects values above the upper boundary (20)', () => {
      const res = validateScaledScore(20);
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toContain('superior a 19');
    });

    it('rejects negative scaled scores (-3)', () => {
      const res = validateScaledScore(-3);
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toBeDefined();
    });
  });

  describe('Rule 2: Integer Enforcement', () => {
    it('accepts valid integer numbers', () => {
      expect(validateScaledScore(7).isValid).toBe(true);
      expect(validateScaledScore(12).isValid).toBe(true);
      expect(validateScaledScore(18).isValid).toBe(true);
    });

    it('rejects fractional decimals (10.5)', () => {
      const res = validateScaledScore(10.5);
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toContain('entero');
    });

    it('rejects lower boundary fractional decimals (1.1)', () => {
      const res = validateScaledScore(1.1);
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toContain('entero');
    });

    it('rejects upper boundary fractional decimals (18.99)', () => {
      const res = validateScaledScore(18.99);
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toContain('entero');
    });

    it('rejects irrational and float inputs (Math.PI)', () => {
      const res = validateScaledScore(Math.PI);
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toContain('entero');
    });
  });

  describe('Rule 3: Chronological Age Calculation', () => {
    it('calculates exact integer difference without borrowing (DOB: 2010-05-15, Test: 2020-05-15 -> 10y 0m 0d)', () => {
      const age = calculateChronologicalAge('2010-05-15', '2020-05-15');
      expect(age.isValid).toBe(true);
      expect(age.years).toBe(10);
      expect(age.months).toBe(0);
      expect(age.days).toBe(0);
    });

    it('handles day borrowing correctly from previous month', () => {
      // May 10 - May 20 -> borrows April days (30 days)
      const age = calculateChronologicalAge('2010-05-20', '2020-05-10');
      expect(age.isValid).toBe(true);
      expect(age.years).toBe(9);
      expect(age.months).toBe(11);
      expect(age.days).toBe(20);
    });

    it('handles month borrowing correctly from previous year', () => {
      const age = calculateChronologicalAge('2010-08-15', '2020-03-15');
      expect(age.isValid).toBe(true);
      expect(age.years).toBe(9);
      expect(age.months).toBe(7);
      expect(age.days).toBe(0);
    });

    it('handles leap year birthdays accurately (DOB: 2004-02-29, Test: 2016-02-29 -> 12y 0m 0d)', () => {
      const age = calculateChronologicalAge('2004-02-29', '2016-02-29');
      expect(age.isValid).toBe(true);
      expect(age.years).toBe(12);
      expect(age.months).toBe(0);
      expect(age.days).toBe(0);
    });

    it('rejects evaluation date earlier than date of birth', () => {
      const age = calculateChronologicalAge('2020-01-01', '2019-01-01');
      expect(age.isValid).toBe(false);
      expect(age.errorMessage).toContain('anterior');
    });

    it('rejects malformed date formats', () => {
      const age = calculateChronologicalAge('invalid-date', '2020-01-01');
      expect(age.isValid).toBe(false);
      expect(age.errorMessage).toContain('inválida');
    });
  });

  describe('Rule 4: Battery Compatibility & Age Cutoffs', () => {
    it('accepts child in WISC-V normative range (Age 10:4:0)', () => {
      const res = validateAgeAndBattery('2010-01-01', '2020-05-01', 'WISC-V');
      expect(res.isValid).toBe(true);
      expect(res.years).toBe(10);
      expect(res.months).toBe(4);
    });

    it('rejects underage for WISC-V (< 6:0:0) and recommends WPPSI-IV', () => {
      const res = validateAgeAndBattery('2014-06-01', '2020-05-01', 'WISC-V'); // 5y 11m
      expect(res.isValid).toBe(false);
      expect(res.years).toBe(5);
      expect(res.errorMessage).toContain('WPPSI-IV');
    });

    it('rejects overage for WISC-V (>= 17:0:0) and recommends WAIS-IV', () => {
      const res = validateAgeAndBattery('2003-01-01', '2020-01-01', 'WISC-V'); // 17y 0m
      expect(res.isValid).toBe(false);
      expect(res.years).toBe(17);
      expect(res.errorMessage).toContain('WAIS-IV');
    });

    it('accepts adult in WAIS-IV normative range (Age 25:0:0)', () => {
      const res = validateAgeAndBattery('1995-01-01', '2020-01-01', 'WAIS-IV');
      expect(res.isValid).toBe(true);
      expect(res.years).toBe(25);
    });

    it('rejects underage for WAIS-IV (< 16:0:0)', () => {
      const res = validateAgeAndBattery('2005-06-01', '2020-05-01', 'WAIS-IV'); // 14y 11m
      expect(res.isValid).toBe(false);
      expect(res.years).toBe(14);
      expect(res.errorMessage).toContain('WISC-V');
    });

    it('rejects overage for WAIS-IV (> 90:11)', () => {
      const res = validateAgeAndBattery('1928-01-01', '2020-01-01', 'WAIS-IV'); // 92y 0m
      expect(res.isValid).toBe(false);
      expect(res.years).toBe(92);
      expect(res.errorMessage).toContain('90 años y 11 meses');
    });

    it('accepts overlapping age 16:5:0 in BOTH batteries and sets isOverlappingAge flag', () => {
      const wiscRes = validateAgeAndBattery('2003-07-01', '2020-01-01', 'WISC-V'); // 16y 6m
      const waisRes = validateAgeAndBattery('2003-07-01', '2020-01-01', 'WAIS-IV'); // 16y 6m
      expect(wiscRes.isValid).toBe(true);
      expect(wiscRes.isOverlappingAge).toBe(true);
      expect(waisRes.isValid).toBe(true);
      expect(waisRes.isOverlappingAge).toBe(true);
    });
  });
});
