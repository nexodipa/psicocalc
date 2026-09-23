import { describe, it, expect } from 'vitest';
import {
  calculateChronologicalAge,
  validateAgeAndBattery,
} from '../../core';

describe('Tier 2 - Edge Ages & Cutoff Boundaries', () => {
  describe('WISC-V Minimum Age Cutoff (6:0:0 vs 5:11:x)', () => {
    it('accepts exact 6:0:0 on birthday for WISC-V', () => {
      const res = validateAgeAndBattery('2014-06-15', '2020-06-15', 'WISC-V');
      expect(res.isValid).toBe(true);
      expect(res.years).toBe(6);
      expect(res.months).toBe(0);
      expect(res.days).toBe(0);
    });

    it('rejects 5 years 11 months 29 days for WISC-V and recommends WPPSI-IV', () => {
      // 1 day before 6th birthday
      const res = validateAgeAndBattery('2014-06-15', '2020-06-14', 'WISC-V');
      expect(res.isValid).toBe(false);
      expect(res.years).toBe(5);
      expect(res.months).toBe(11);
      expect(res.errorMessage).toContain('WPPSI-IV');
    });

    it('rejects 5 years 0 months 0 days for WISC-V', () => {
      const res = validateAgeAndBattery('2015-06-15', '2020-06-15', 'WISC-V');
      expect(res.isValid).toBe(false);
      expect(res.years).toBe(5);
      expect(res.errorMessage).toContain('WPPSI-IV');
    });

    it('rejects toddler / infant ages (< 3 years)', () => {
      const res = validateAgeAndBattery('2018-01-01', '2020-01-01', 'WISC-V');
      expect(res.isValid).toBe(false);
      expect(res.years).toBe(2);
    });

    it('verifies 6:0:1 (6 years, 0 months, 1 day) is valid for WISC-V', () => {
      const res = validateAgeAndBattery('2014-06-15', '2020-06-16', 'WISC-V');
      expect(res.isValid).toBe(true);
      expect(res.years).toBe(6);
      expect(res.days).toBe(1);
    });
  });

  describe('WISC-V and WAIS-IV Transition & Overlap (16:0 to 17:0)', () => {
    it('accepts exact 16:0:0 for both WISC-V and WAIS-IV', () => {
      const wisc = validateAgeAndBattery('2004-05-20', '2020-05-20', 'WISC-V');
      const wais = validateAgeAndBattery('2004-05-20', '2020-05-20', 'WAIS-IV');
      expect(wisc.isValid).toBe(true);
      expect(wisc.years).toBe(16);
      expect(wisc.months).toBe(0);
      expect(wisc.isOverlappingAge).toBe(true);

      expect(wais.isValid).toBe(true);
      expect(wais.years).toBe(16);
      expect(wais.months).toBe(0);
      expect(wais.isOverlappingAge).toBe(true);
    });

    it('rejects 15:11:29 for WAIS-IV (must be >= 16:0:0)', () => {
      // 1 day before 16th birthday
      const res = validateAgeAndBattery('2004-05-20', '2020-05-19', 'WAIS-IV');
      expect(res.isValid).toBe(false);
      expect(res.years).toBe(15);
      expect(res.months).toBe(11);
      expect(res.errorMessage).toContain('WISC-V');
    });

    it('accepts exact 16:11:25 for both WISC-V and WAIS-IV', () => {
      const wisc = validateAgeAndBattery('2003-06-25', '2020-06-20', 'WISC-V');
      const wais = validateAgeAndBattery('2003-06-25', '2020-06-20', 'WAIS-IV');
      expect(wisc.isValid).toBe(true);
      expect(wisc.years).toBe(16);
      expect(wisc.months).toBe(11);
      expect(wais.isValid).toBe(true);
      expect(wais.years).toBe(16);
      expect(wais.months).toBe(11);
    });

    it('rejects exact 17:0:0 for WISC-V and recommends WAIS-IV', () => {
      const res = validateAgeAndBattery('2003-05-20', '2020-05-20', 'WISC-V');
      expect(res.isValid).toBe(false);
      expect(res.years).toBe(17);
      expect(res.errorMessage).toContain('WAIS-IV');
    });

    it('accepts exact 17:0:0 for WAIS-IV', () => {
      const res = validateAgeAndBattery('2003-05-20', '2020-05-20', 'WAIS-IV');
      expect(res.isValid).toBe(true);
      expect(res.years).toBe(17);
      expect(res.months).toBe(0);
      expect(res.isOverlappingAge).toBe(false);
    });
  });

  describe('WAIS-IV Upper Age Boundary (90:11 vs 91:0)', () => {
    it('accepts 90 years 11 months 10 days for WAIS-IV', () => {
      const res = validateAgeAndBattery('1929-06-15', '2020-05-25', 'WAIS-IV');
      expect(res.isValid).toBe(true);
      expect(res.years).toBe(90);
      expect(res.months).toBe(11);
    });

    it('rejects exact 91 years 0 months 0 days for WAIS-IV as out of standardization', () => {
      const res = validateAgeAndBattery('1929-05-20', '2020-05-20', 'WAIS-IV');
      expect(res.isValid).toBe(false);
      expect(res.years).toBe(91);
      expect(res.errorMessage).toContain('90 años y 11 meses');
    });

    it('rejects 95 years old for WAIS-IV', () => {
      const res = validateAgeAndBattery('1925-01-01', '2020-01-01', 'WAIS-IV');
      expect(res.isValid).toBe(false);
      expect(res.years).toBe(95);
    });

    it('rejects centenarians (100+ years) for both batteries', () => {
      const wisc = validateAgeAndBattery('1920-01-01', '2020-01-01', 'WISC-V');
      const wais = validateAgeAndBattery('1920-01-01', '2020-01-01', 'WAIS-IV');
      expect(wisc.isValid).toBe(false);
      expect(wais.isValid).toBe(false);
    });

    it('accepts 89 years 11 months for WAIS-IV', () => {
      const res = validateAgeAndBattery('1930-06-01', '2020-05-01', 'WAIS-IV');
      expect(res.isValid).toBe(true);
      expect(res.years).toBe(89);
      expect(res.months).toBe(11);
    });
  });

  describe('Leap Years, Calendar Anomalies & Inverted Dates', () => {
    it('calculates chronological age for leap year birth (2008-02-29 to 2020-02-29 -> 12y 0m 0d)', () => {
      const age = calculateChronologicalAge('2008-02-29', '2020-02-29');
      expect(age.isValid).toBe(true);
      expect(age.years).toBe(12);
      expect(age.months).toBe(0);
      expect(age.days).toBe(0);
    });

    it('calculates chronological age for leap year test date (2010-01-15 to 2020-02-29)', () => {
      const age = calculateChronologicalAge('2010-01-15', '2020-02-29');
      expect(age.isValid).toBe(true);
      expect(age.years).toBe(10);
      expect(age.months).toBe(1);
      expect(age.days).toBe(14);
    });

    it('rejects test date strictly before birth date (negative age)', () => {
      const res = validateAgeAndBattery('2015-05-10', '2015-05-09', 'WISC-V');
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toContain('anterior');
    });

    it('rejects same day evaluation (age 0:0:0) for school age battery', () => {
      const res = validateAgeAndBattery('2020-05-10', '2020-05-10', 'WISC-V');
      expect(res.isValid).toBe(false);
      expect(res.years).toBe(0);
    });

    it('rejects impossible non-existent leap year dates (Feb 30, Feb 31)', () => {
      const age1 = calculateChronologicalAge('2010-02-30', '2020-05-10');
      const age2 = calculateChronologicalAge('2010-04-31', '2020-05-10'); // April has 30 days
      expect(age1.isValid).toBe(false);
      expect(age2.isValid).toBe(false);
    });
  });
});
