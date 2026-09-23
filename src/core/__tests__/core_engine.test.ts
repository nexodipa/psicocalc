import { describe, it, expect } from 'vitest';
import {
  erf,
  normalCdf,
  compositeToZ,
  scaledToZ,
  compositeToPercentile,
  formatPercentile,
  calculateConfidenceInterval,
  calculateBothConfidenceIntervals,
  validateScaledScore,
  calculateChronologicalAge,
  validateAgeAndBattery,
  calculateWiscV,
  calculateWaisIV,
  calculatePairDiscrepancy,
  calculateAllDiscrepancies,
  calculateStrengthsWeaknesses,
  getQualitativeCategory,
} from '../index';

describe('Core Psychometric Math & Engine Suite', () => {
  describe('Mathematical Normal Distribution Engine', () => {
    it('calculates error function erf with high precision', () => {
      expect(erf(0)).toBe(0);
      expect(erf(-1)).toBeCloseTo(-erf(1), 6);
      expect(erf(1)).toBeCloseTo(0.84270079, 5);
      expect(erf(2)).toBeCloseTo(0.99532226, 5);
    });

    it('calculates normal CDF accurately across key z-scores', () => {
      expect(normalCdf(0)).toBeCloseTo(0.5, 6);
      expect(normalCdf(1)).toBeCloseTo(0.8413447, 5);
      expect(normalCdf(-1)).toBeCloseTo(0.1586553, 5);
      expect(normalCdf(1.96)).toBeCloseTo(0.975, 3);
      expect(normalCdf(-1.96)).toBeCloseTo(0.025, 3);
    });

    it('converts composite scores and scaled scores to z-scores', () => {
      expect(compositeToZ(100)).toBe(0);
      expect(compositeToZ(115)).toBe(1);
      expect(compositeToZ(85)).toBe(-1);
      expect(compositeToZ(130)).toBe(2);
      expect(compositeToZ(70)).toBe(-2);

      expect(scaledToZ(10)).toBe(0);
      expect(scaledToZ(13)).toBe(1);
      expect(scaledToZ(7)).toBe(-1);
    });

    it('computes percentiles and clamps to [0.1, 99.9]', () => {
      expect(compositeToPercentile(100)).toBe(50);
      expect(compositeToPercentile(130)).toBe(98);
      expect(compositeToPercentile(70)).toBe(2);
      expect(compositeToPercentile(160)).toBe(99.9);
      expect(compositeToPercentile(40)).toBe(0.1);
      expect(compositeToPercentile(144)).toBe(99.8);
      expect(compositeToPercentile(138)).toBe(99.4);
    });

    it('formats clinical percentile strings correctly with bounds', () => {
      expect(formatPercentile(50)).toBe('50');
      expect(formatPercentile(0.1)).toBe('<0.1');
      expect(formatPercentile(99.9)).toBe('>99.9');
      expect(formatPercentile(0.05, 40)).toBe('<0.1');
      expect(formatPercentile(99.95, 160)).toBe('>99.9');
    });
  });

  describe('Confidence Interval Engine', () => {
    it('calculates 90% and 95% confidence intervals with valid rounding', () => {
      const { ci90, ci95 } = calculateBothConfidenceIntervals(100, 3.0);
      // z90 = 1.645 * 3 = 4.935 -> 5 => [95, 105]
      expect(ci90.lower).toBe(95);
      expect(ci90.upper).toBe(105);
      // z95 = 1.96 * 3 = 5.88 -> 6 => [94, 106]
      expect(ci95.lower).toBe(94);
      expect(ci95.upper).toBe(106);
    });

    it('strictly clamps confidence intervals within [40, 160]', () => {
      const low = calculateConfidenceInterval(42, 5.0, 95);
      // 42 - 10 = 32 -> clamped to 40
      expect(low.lower).toBe(40);

      const high = calculateConfidenceInterval(158, 5.0, 95);
      // 158 + 10 = 168 -> clamped to 160
      expect(high.upper).toBe(160);
    });
  });

  describe('Validator Engine', () => {
    it('validates scaled scores in [1..19] as integers', () => {
      expect(validateScaledScore(1).isValid).toBe(true);
      expect(validateScaledScore(10).isValid).toBe(true);
      expect(validateScaledScore(19).isValid).toBe(true);

      expect(validateScaledScore(0).isValid).toBe(false);
      expect(validateScaledScore(20).isValid).toBe(false);
      expect(validateScaledScore(-5).isValid).toBe(false);
      expect(validateScaledScore(10.5).isValid).toBe(false);
      expect(validateScaledScore('abc').isValid).toBe(false);
      expect(validateScaledScore(null).isValid).toBe(false);
      expect(validateScaledScore(NaN).isValid).toBe(false);
    });

    it('calculates chronological age with exact day borrowing', () => {
      const age = calculateChronologicalAge('2015-05-20', '2025-10-15');
      expect(age.isValid).toBe(true);
      expect(age.years).toBe(10);
      expect(age.months).toBe(4);
      expect(age.days).toBe(25);
    });

    it('validates battery suitability by age', () => {
      // 10 years old -> valid WISC-V, invalid WAIS-IV
      const childWisc = validateAgeAndBattery('2015-01-01', '2025-01-01', 'WISC-V');
      expect(childWisc.isValid).toBe(true);
      const childWais = validateAgeAndBattery('2015-01-01', '2025-01-01', 'WAIS-IV');
      expect(childWais.isValid).toBe(false);

      // 5 years 11 months -> invalid for WISC-V (too young, needs WPPSI)
      const toddlerWisc = validateAgeAndBattery('2020-02-01', '2026-01-01', 'WISC-V');
      expect(toddlerWisc.isValid).toBe(false);

      // 16 years 6 months -> valid for BOTH WISC-V and WAIS-IV (overlapping age)
      const teenWisc = validateAgeAndBattery('2009-06-01', '2025-12-01', 'WISC-V');
      expect(teenWisc.isValid).toBe(true);
      expect(teenWisc.isOverlappingAge).toBe(true);
      const teenWais = validateAgeAndBattery('2009-06-01', '2025-12-01', 'WAIS-IV');
      expect(teenWais.isValid).toBe(true);
      expect(teenWais.isOverlappingAge).toBe(true);

      // 25 years old -> invalid for WISC-V, valid for WAIS-IV
      const adultWisc = validateAgeAndBattery('2000-01-01', '2025-01-01', 'WISC-V');
      expect(adultWisc.isValid).toBe(false);
      const adultWais = validateAgeAndBattery('2000-01-01', '2025-01-01', 'WAIS-IV');
      expect(adultWais.isValid).toBe(true);
    });
  });

  describe('Qualitative Wechsler Bands', () => {
    it('classifies composite scores correctly', () => {
      expect(getQualitativeCategory(140)).toBe('Muy Superior');
      expect(getQualitativeCategory(130)).toBe('Muy Superior');
      expect(getQualitativeCategory(125)).toBe('Superior');
      expect(getQualitativeCategory(115)).toBe('Promedio Alto');
      expect(getQualitativeCategory(100)).toBe('Promedio');
      expect(getQualitativeCategory(90)).toBe('Promedio');
      expect(getQualitativeCategory(85)).toBe('Promedio Bajo');
      expect(getQualitativeCategory(75)).toBe('Limítrofe');
      expect(getQualitativeCategory(65)).toBe('Extremadamente Bajo');
      expect(getQualitativeCategory(40)).toBe('Extremadamente Bajo');
    });
  });

  describe('Discrepancy & Scatter Analysis', () => {
    it('evaluates statistical significance of index discrepancies', () => {
      const res = calculatePairDiscrepancy('ICV', 130, 'IVP', 100, 'WISC-V');
      expect(res.diff).toBe(30);
      expect(res.isSignificant05).toBe(true);
      expect(res.isSignificant01).toBe(true);
      expect(res.baseRateDesc).toContain('< 1.5%');

      const smallDiff = calculatePairDiscrepancy('ICV', 100, 'IVE', 102, 'WISC-V');
      expect(smallDiff.diff).toBe(-2);
      expect(smallDiff.isSignificant05).toBe(false);
      expect(smallDiff.isSignificant01).toBe(false);
    });

    it('computes ipsative strengths and weaknesses against personal mean', () => {
      const subtests = {
        S: 16,
        V: 15,
        C: 15,
        PV: 16,
        M: 14,
        B: 15,
        D: 13,
        SD: 12,
        CL: 12,
        BS: 11,
      };
      // Mean = 139 / 10 = 13.9
      const sw = calculateStrengthsWeaknesses(subtests, 2.5);
      const bs = sw.find((item) => item.subtestId === 'BS');
      expect(bs).toBeDefined();
      expect(bs?.difference).toBeCloseTo(-2.9, 1);
      expect(bs?.classification).toBe('Debilidad');

      const s = sw.find((item) => item.subtestId === 'S');
      expect(s).toBeDefined();
      expect(s?.difference).toBeCloseTo(2.1, 1);
      expect(s?.classification).toBe('Promedio');
    });
  });

  describe('Full WISC-V Clinical Calculation Scenarios', () => {
    it('computes Case 1: Average Child (all subtests = 10)', () => {
      const res = calculateWiscV({
        S: 10, V: 10, C: 10, PV: 10, M: 10, B: 10, D: 10, SD: 10, CL: 10, BS: 10,
      });

      expect(res.primaryIndices.ICV?.compositeScore).toBe(100);
      expect(res.primaryIndices.ICV?.percentile).toBe(50);
      expect(res.primaryIndices.IVE?.compositeScore).toBe(100);
      expect(res.primaryIndices.IRF?.compositeScore).toBe(100);
      expect(res.primaryIndices.IMT?.compositeScore).toBe(100);
      expect(res.primaryIndices.IVP?.compositeScore).toBe(100);

      expect(res.cit?.compositeScore).toBe(100);
      expect(res.cit?.percentile).toBe(50);
      expect(res.cit?.qualitative).toBe('Promedio');
      expect(res.isCompleteCit).toBe(true);

      expect(res.ancillaryIndices.IAG?.compositeScore).toBe(100);
      expect(res.ancillaryIndices.ICC?.compositeScore).toBe(100);
      expect(res.ancillaryIndices.INV?.compositeScore).toBe(100);
    });

    it('computes Case 2: High Potential / Gifted Profile', () => {
      const res = calculateWiscV({
        C: 16, S: 17, M: 16, D: 14, CL: 12, V: 18, B: 17, PV: 15, SD: 15, BS: 13,
      });

      expect(res.primaryIndices.ICV?.compositeScore).toBe(144);
      expect(res.primaryIndices.IVE?.compositeScore).toBe(132);
      expect(res.primaryIndices.IRF?.compositeScore).toBe(138);
      expect(res.primaryIndices.IMT?.compositeScore).toBe(124);
      expect(res.primaryIndices.IVP?.compositeScore).toBe(114);

      expect(res.cit?.compositeScore).toBe(138);
      expect(res.cit?.percentile).toBe(99.4);
      expect(res.cit?.qualitative).toBe('Muy Superior');

      expect(res.ancillaryIndices.IAG?.compositeScore).toBe(145);
      expect(res.ancillaryIndices.IAG?.qualitative).toBe('Muy Superior');
    });

    it('computes Case 3: ADHD Profile', () => {
      const res = calculateWiscV({
        C: 11, S: 13, M: 12, D: 6, CL: 5, V: 12, B: 11, PV: 10, SD: 7, BS: 6,
      });

      expect(res.primaryIndices.ICV?.compositeScore).toBe(114);
      expect(res.primaryIndices.IVE?.compositeScore).toBe(103);
      expect(res.primaryIndices.IRF?.compositeScore).toBe(108);
      expect(res.primaryIndices.IMT?.compositeScore).toBe(80);
      expect(res.primaryIndices.IVP?.compositeScore).toBe(76);

      expect(res.cit?.compositeScore).toBe(100);
      expect(res.ancillaryIndices.IAG?.compositeScore).toBe(111);
      expect(res.ancillaryIndices.ICC?.compositeScore).toBe(72);
    });

    it('handles Floor & Ceiling in WISC-V', () => {
      // Floor: all 1
      const floorRes = calculateWiscV({
        S: 1, V: 1, C: 1, PV: 1, M: 1, B: 1, D: 1, SD: 1, CL: 1, BS: 1,
      });
      expect(floorRes.primaryIndices.ICV?.compositeScore).toBe(45);
      expect(floorRes.cit?.compositeScore).toBe(40);
      expect(floorRes.cit?.percentile).toBe(0.1);
      expect(floorRes.cit?.qualitative).toBe('Extremadamente Bajo');

      // Ceiling: all 19
      const ceilRes = calculateWiscV({
        S: 19, V: 19, C: 19, PV: 19, M: 19, B: 19, D: 19, SD: 19, CL: 19, BS: 19,
      });
      expect(ceilRes.primaryIndices.ICV?.compositeScore).toBe(155);
      expect(ceilRes.cit?.compositeScore).toBe(160);
      expect(ceilRes.cit?.percentile).toBe(99.9);
      expect(ceilRes.cit?.qualitative).toBe('Muy Superior');
    });
  });

  describe('Full WAIS-IV Clinical Calculation Scenarios', () => {
    it('computes Case 4: Standard Healthy Adult (all subtests = 10)', () => {
      const res = calculateWaisIV({
        BD: 10, SI: 10, DS: 10, MR: 10, VC: 10, AR: 10, SS: 10, VP: 10, IN: 10, CD: 10,
      });

      expect(res.primaryIndices.ICV?.compositeScore).toBe(100);
      expect(res.primaryIndices.IRP?.compositeScore).toBe(100);
      expect(res.primaryIndices.IMT?.compositeScore).toBe(100);
      expect(res.primaryIndices.IVP?.compositeScore).toBe(100);

      expect(res.cit?.compositeScore).toBe(100);
      expect(res.cit?.percentile).toBe(50);
      expect(res.cit?.qualitative).toBe('Promedio');
      expect(res.isCompleteCit).toBe(true);

      expect(res.ancillaryIndices.IAG?.compositeScore).toBe(100);
      expect(res.ancillaryIndices.ICC?.compositeScore).toBe(100);
    });

    it('computes Case 5: Superior Professional Adult', () => {
      const res = calculateWaisIV({
        BD: 14, SI: 16, DS: 15, MR: 15, VC: 16, AR: 14, SS: 13, VP: 14, IN: 15, CD: 13,
      });

      expect(res.primaryIndices.ICV?.compositeScore).toBe(132);
      expect(res.primaryIndices.IRP?.compositeScore).toBe(125);
      expect(res.primaryIndices.IMT?.compositeScore).toBe(125);
      expect(res.primaryIndices.IVP?.compositeScore).toBe(117);

      expect(res.cit?.compositeScore).toBe(129);
      expect(res.cit?.qualitative).toBe('Superior');

      expect(res.ancillaryIndices.IAG?.compositeScore).toBe(131);
    });

    it('computes Case 6: TBI / Neurocognitive Impairment Adult', () => {
      const res = calculateWaisIV({
        BD: 6, SI: 10, DS: 5, MR: 7, VC: 12, AR: 6, SS: 4, VP: 6, IN: 11, CD: 3,
      });

      expect(res.primaryIndices.ICV?.compositeScore).toBe(106);
      expect(res.primaryIndices.IRP?.compositeScore).toBe(79);
      expect(res.primaryIndices.IMT?.compositeScore).toBe(74);
      expect(res.primaryIndices.IVP?.compositeScore).toBe(65);

      expect(res.cit?.compositeScore).toBe(77);
      expect(res.cit?.qualitative).toBe('Limítrofe');
      expect(res.ancillaryIndices.IAG?.compositeScore).toBe(90);
    });

    it('handles Floor & Ceiling in WAIS-IV', () => {
      // Floor: all 1
      const floorRes = calculateWaisIV({
        WAIS_C: 1, WAIS_S: 1, WAIS_D: 1, WAIS_M: 1, WAIS_V: 1,
        WAIS_A: 1, WAIS_BS: 1, WAIS_PV: 1, WAIS_I: 1, WAIS_CN: 1,
      });
      expect(floorRes.primaryIndices.ICV?.compositeScore).toBe(45);
      expect(floorRes.cit?.compositeScore).toBe(40);
      expect(floorRes.cit?.percentile).toBe(0.1);
      expect(floorRes.cit?.qualitative).toBe('Extremadamente Bajo');

      // Ceiling: all 19
      const ceilRes = calculateWaisIV({
        WAIS_C: 19, WAIS_S: 19, WAIS_D: 19, WAIS_M: 19, WAIS_V: 19,
        WAIS_A: 19, WAIS_BS: 19, WAIS_PV: 19, WAIS_I: 19, WAIS_CN: 19,
      });
      expect(ceilRes.primaryIndices.ICV?.compositeScore).toBe(155);
      expect(ceilRes.cit?.compositeScore).toBe(160);
      expect(ceilRes.cit?.percentile).toBe(99.9);
      expect(ceilRes.cit?.qualitative).toBe('Muy Superior');
    });
  });
});
