import { describe, it, expect } from 'vitest';
import {
  calculateWiscV,
  calculateWaisIV,
  calculateConfidenceInterval,
  calculateBothConfidenceIntervals,
  compositeToPercentile,
  formatPercentile,
  getQualitativeCategory,
  SubtestId,
} from '../../core';
import {
  wiscPrimarySumToComposite,
  wiscCitSumToComposite,
  wiscAncillarySumToComposite,
  WISC_V_PRIMARY_INDICES,
  WISC_V_CIT_META,
  WISC_V_ANCILLARY_INDICES,
} from '../../core/tables/wisc_v_norms';
import {
  wais3SubtestSumToComposite,
  wais2SubtestSumToComposite,
  waisCitSumToComposite,
  waisAncillarySumToComposite,
  WAIS_IV_PRIMARY_INDICES,
  WAIS_IV_CIT_META,
  WAIS_IV_ANCILLARY_INDICES,
} from '../../core/tables/wais_iv_norms';

describe('Adversarial Invariant Verification — Challenger 2 (Milestone M1)', () => {
  // =========================================================================
  // 1. STANDARD COMPOSITE SCORES ARE STRICTLY INTEGERS
  // =========================================================================
  describe('Invariant 1: Composite Scores are Strictly Integers', () => {
    it('verifies that WISC-V primary indices are strictly integers for ALL possible 2-subtest sums [2..38]', () => {
      const indexKeys: Array<'ICV' | 'IVE' | 'IRF' | 'IMT' | 'IVP'> = ['ICV', 'IVE', 'IRF', 'IMT', 'IVP'];
      for (const key of indexKeys) {
        for (let sum = 2; sum <= 38; sum++) {
          const composite = wiscPrimarySumToComposite(key, sum);
          expect(Number.isInteger(composite)).toBe(true);
          expect(composite).toBeGreaterThanOrEqual(45);
          expect(composite).toBeLessThanOrEqual(155);
        }
      }
    });

    it('verifies that WISC-V CIT is strictly an integer for ALL possible 7-subtest sums [7..133]', () => {
      for (let sum = 7; sum <= 133; sum++) {
        const cit = wiscCitSumToComposite(sum);
        expect(Number.isInteger(cit)).toBe(true);
        expect(cit).toBeGreaterThanOrEqual(40);
        expect(cit).toBeLessThanOrEqual(160);
      }
    });

    it('verifies that WISC-V ancillary indices (IAG, ICC, INV) are strictly integers across all valid sums', () => {
      // IAG: 5 subtests [5..95]
      for (let sum = 5; sum <= 95; sum++) {
        const iag = wiscAncillarySumToComposite('IAG', sum);
        expect(Number.isInteger(iag)).toBe(true);
        expect(iag).toBeGreaterThanOrEqual(45);
        expect(iag).toBeLessThanOrEqual(155);
      }
      // ICC: 4 subtests [4..76]
      for (let sum = 4; sum <= 76; sum++) {
        const icc = wiscAncillarySumToComposite('ICC', sum);
        expect(Number.isInteger(icc)).toBe(true);
        expect(icc).toBeGreaterThanOrEqual(45);
        expect(icc).toBeLessThanOrEqual(155);
      }
      // INV: 6 subtests [6..114]
      for (let sum = 6; sum <= 114; sum++) {
        const inv = wiscAncillarySumToComposite('INV', sum);
        expect(Number.isInteger(inv)).toBe(true);
        expect(inv).toBeGreaterThanOrEqual(45);
        expect(inv).toBeLessThanOrEqual(155);
      }
    });

    it('verifies that WAIS-IV 3-subtest primary indices (ICV, IRP) are strictly integers for ALL sums [3..57]', () => {
      for (const id of ['ICV', 'IRP'] as const) {
        for (let sum = 3; sum <= 57; sum++) {
          const comp = wais3SubtestSumToComposite(id, sum);
          expect(Number.isInteger(comp)).toBe(true);
          expect(comp).toBeGreaterThanOrEqual(45);
          expect(comp).toBeLessThanOrEqual(155);
        }
      }
    });

    it('verifies that WAIS-IV 2-subtest primary indices (IMT, IVP) are strictly integers for ALL sums [2..38]', () => {
      for (const id of ['IMT', 'IVP'] as const) {
        for (let sum = 2; sum <= 38; sum++) {
          const comp = wais2SubtestSumToComposite(id, sum);
          expect(Number.isInteger(comp)).toBe(true);
          expect(comp).toBeGreaterThanOrEqual(45);
          expect(comp).toBeLessThanOrEqual(155);
        }
      }
    });

    it('verifies that WAIS-IV CIT is strictly an integer for ALL possible 10-subtest sums [10..190]', () => {
      for (let sum = 10; sum <= 190; sum++) {
        const cit = waisCitSumToComposite(sum);
        expect(Number.isInteger(cit)).toBe(true);
        expect(cit).toBeGreaterThanOrEqual(40);
        expect(cit).toBeLessThanOrEqual(160);
      }
    });

    it('verifies that WAIS-IV ancillary indices (IAG, ICC) are strictly integers across all valid sums', () => {
      // IAG: 6 subtests [6..114]
      for (let sum = 6; sum <= 114; sum++) {
        const iag = waisAncillarySumToComposite('IAG', sum);
        expect(Number.isInteger(iag)).toBe(true);
        expect(iag).toBeGreaterThanOrEqual(45);
        expect(iag).toBeLessThanOrEqual(155);
      }
      // ICC: 4 subtests [4..76]
      for (let sum = 4; sum <= 76; sum++) {
        const icc = waisAncillarySumToComposite('ICC', sum);
        expect(Number.isInteger(icc)).toBe(true);
        expect(icc).toBeGreaterThanOrEqual(45);
        expect(icc).toBeLessThanOrEqual(155);
      }
    });
  });

  // =========================================================================
  // 2. CONFIDENCE INTERVAL BOUNDS: STRICTLY INTEGERS AND CLAMPED [40, 160]
  // =========================================================================
  describe('Invariant 2: Confidence Interval Bounds', () => {
    const semValues = [
      WISC_V_CIT_META.sem, // 3.00
      WISC_V_PRIMARY_INDICES.ICV.sem, // 4.24
      WISC_V_PRIMARY_INDICES.IRF.sem, // 3.87
      WISC_V_PRIMARY_INDICES.IMT.sem, // 4.50
      WISC_V_PRIMARY_INDICES.IVP.sem, // 5.20
      WAIS_IV_CIT_META.sem, // 2.60
      WAIS_IV_PRIMARY_INDICES.ICV.sem, // 3.48
      WAIS_IV_PRIMARY_INDICES.IRP.sem, // 3.97
      WAIS_IV_ANCILLARY_INDICES.IAG.sem, // 3.35
      WAIS_IV_ANCILLARY_INDICES.ICC.sem, // 4.24
    ];

    it('verifies CI bounds are strictly integers, within [40, 160], and enclose observed score', () => {
      for (const sem of semValues) {
        for (let score = 40; score <= 160; score++) {
          const { ci90, ci95 } = calculateBothConfidenceIntervals(score, sem);

          // Both bounds must be integers
          expect(Number.isInteger(ci90.lower)).toBe(true);
          expect(Number.isInteger(ci90.upper)).toBe(true);
          expect(Number.isInteger(ci95.lower)).toBe(true);
          expect(Number.isInteger(ci95.upper)).toBe(true);

          // Clamped strictly within [40, 160]
          expect(ci90.lower).toBeGreaterThanOrEqual(40);
          expect(ci90.upper).toBeLessThanOrEqual(160);
          expect(ci95.lower).toBeGreaterThanOrEqual(40);
          expect(ci95.upper).toBeLessThanOrEqual(160);

          // Ordering
          expect(ci90.lower).toBeLessThanOrEqual(ci90.upper);
          expect(ci95.lower).toBeLessThanOrEqual(ci95.upper);

          // 95% CI is at least as wide as 90% CI
          expect(ci95.lower).toBeLessThanOrEqual(ci90.lower);
          expect(ci95.upper).toBeGreaterThanOrEqual(ci90.upper);

          // Score is enclosed
          expect(ci90.lower).toBeLessThanOrEqual(score);
          expect(score).toBeLessThanOrEqual(ci90.upper);
          expect(ci95.lower).toBeLessThanOrEqual(score);
          expect(score).toBeLessThanOrEqual(ci95.upper);
        }
      }
    });

    it('verifies floor boundary clamping at composite = 40', () => {
      const ci = calculateConfidenceInterval(40, 4.5, 95);
      expect(ci.lower).toBe(40); // Clamped at 40
      expect(ci.upper).toBeGreaterThan(40);
      expect(Number.isInteger(ci.lower)).toBe(true);
      expect(Number.isInteger(ci.upper)).toBe(true);
    });

    it('verifies ceiling boundary clamping at composite = 160', () => {
      const ci = calculateConfidenceInterval(160, 4.5, 95);
      expect(ci.upper).toBe(160); // Clamped at 160
      expect(ci.lower).toBeLessThan(160);
      expect(Number.isInteger(ci.lower)).toBe(true);
      expect(Number.isInteger(ci.upper)).toBe(true);
    });
  });

  // =========================================================================
  // 3. PERCENTILES: RANGE [0.1, 99.9] AND FORMATTING
  // =========================================================================
  describe('Invariant 3: Percentiles in [0.1, 99.9] & Formatting', () => {
    it('verifies that compositeToPercentile is strictly in range [0.1, 99.9] for all integer composites [40..160]', () => {
      for (let score = 40; score <= 160; score++) {
        const pr = compositeToPercentile(score);
        expect(pr).toBeGreaterThanOrEqual(0.1);
        expect(pr).toBeLessThanOrEqual(99.9);
        expect(Number.isFinite(pr)).toBe(true);
      }
    });

    it('verifies known percentile anchors', () => {
      expect(compositeToPercentile(100)).toBe(50);
      expect(compositeToPercentile(40)).toBe(0.1);
      expect(compositeToPercentile(160)).toBe(99.9);
      expect(compositeToPercentile(115)).toBe(84);
      expect(compositeToPercentile(85)).toBe(16);
      expect(compositeToPercentile(130)).toBe(98);
      expect(compositeToPercentile(70)).toBe(2);
    });

    it('verifies percentile formatting with formatPercentile', () => {
      expect(formatPercentile(0.1)).toBe('<0.1');
      expect(formatPercentile(0.05)).toBe('<0.1');
      expect(formatPercentile(99.9)).toBe('>99.9');
      expect(formatPercentile(99.95)).toBe('>99.9');
      expect(formatPercentile(50)).toBe('50');
      expect(formatPercentile(84)).toBe('84');
      expect(formatPercentile(99.4)).toBe('99.4');
      expect(formatPercentile(0.4)).toBe('0.4');
      expect(formatPercentile(NaN)).toBe('-');
    });

    it('verifies formatPercentile respects originalComposite boundary conditions', () => {
      expect(formatPercentile(0.1, 40)).toBe('<0.1');
      expect(formatPercentile(0.1, 45)).toBe('<0.1');
      expect(formatPercentile(99.9, 155)).toBe('>99.9');
      expect(formatPercentile(99.9, 160)).toBe('>99.9');
    });
  });

  // =========================================================================
  // 4. SUBTEST SUBSTITUTION LIMITS
  // =========================================================================
  describe('Invariant 4: Subtest Substitution Limits', () => {
    describe('WISC-V Substitution Limits', () => {
      it('allows exactly ONE valid substitution in WISC-V CIT', () => {
        // Missing D, valid substitute LN
        const res = calculateWiscV({
          S: 10, V: 10, C: 10, M: 10, B: 10, CL: 10,
          LN: 12,
        });
        expect(res.isCompleteCit).toBe(true);
        expect(res.cit).not.toBeNull();
        expect(res.cit?.sumScaled).toBe(72);
      });

      it('FAILS when attempting TWO substitutions in WISC-V CIT (D and CL missing, LN and CA provided)', () => {
        const res = calculateWiscV({
          S: 10, V: 10, C: 10, M: 10, B: 10, // D and CL missing
          LN: 10,
          CA: 10,
        });
        expect(res.isCompleteCit).toBe(false);
        expect(res.cit).toBeNull();
      });

      it('FAILS when attempting THREE substitutions in WISC-V CIT (S, M, D missing)', () => {
        const res = calculateWiscV({
          V: 10, C: 10, B: 10, CL: 10, // S, M, D missing
          I: 10,
          A: 10,
          LN: 10,
        });
        expect(res.isCompleteCit).toBe(false);
        expect(res.cit).toBeNull();
      });

      it('FAILS when missing core subtest has NO valid substitute (Cubos C cannot be substituted)', () => {
        const res = calculateWiscV({
          S: 10, V: 10, M: 10, B: 10, D: 10, CL: 10, // C missing
          PV: 10, // Secondary / ancillary, but not substitutable for C in CIT
        });
        expect(res.isCompleteCit).toBe(false);
        expect(res.cit).toBeNull();
      });

      it('FAILS substitution into WISC-V Primary Indices (substitutions strictly forbidden for primary indices)', () => {
        // S missing in ICV, I provided: ICV must NOT be computed
        const res = calculateWiscV({
          V: 10,
          I: 10,
        });
        expect(res.primaryIndices.ICV).toBeNull();
      });
    });

    describe('WAIS-IV Substitution Limits', () => {
      it('allows exactly ONE valid substitution in WAIS-IV CIT', () => {
        // WAIS_I missing, WAIS_CO provided
        const res = calculateWaisIV({
          WAIS_C: 10, WAIS_S: 10, WAIS_D: 10, WAIS_M: 10, WAIS_V: 10,
          WAIS_A: 10, WAIS_BS: 10, WAIS_PV: 10, WAIS_CN: 10, // WAIS_I missing
          WAIS_CO: 12,
        });
        expect(res.isCompleteCit).toBe(true);
        expect(res.cit).not.toBeNull();
        expect(res.cit?.sumScaled).toBe(102);
      });

      it('FAILS when attempting TWO substitutions in WAIS-IV CIT across different indices', () => {
        // WAIS_I (ICV) and WAIS_CN (IVP) missing, WAIS_CO and WAIS_CA provided
        const res = calculateWaisIV({
          WAIS_C: 10, WAIS_S: 10, WAIS_D: 10, WAIS_M: 10, WAIS_V: 10,
          WAIS_A: 10, WAIS_BS: 10, WAIS_PV: 10,
          WAIS_CO: 10,
          WAIS_CA: 10,
        });
        expect(res.isCompleteCit).toBe(false);
        expect(res.cit).toBeNull();
      });

      it('FAILS when attempting multiple substitutions within a single WAIS-IV primary index (e.g. 2 missing in ICV)', () => {
        // Both WAIS_S and WAIS_V missing in ICV, only WAIS_CO provided
        const res = calculateWaisIV({
          WAIS_I: 10,
          WAIS_CO: 10,
        });
        expect(res.primaryIndices.ICV).toBeNull();
      });

      it('FAILS when attempting multiple substitutions in WAIS-IV IRP (2 missing, 1 substitute)', () => {
        // Both WAIS_C and WAIS_PV missing in IRP, WAIS_B provided
        const res = calculateWaisIV({
          WAIS_M: 10,
          WAIS_B: 10,
        });
        expect(res.primaryIndices.IRP).toBeNull();
      });

      it('FAILS when attempting substitution with invalid cross-domain subtest', () => {
        // WAIS_D missing in IMT, but WAIS_CO (verbal) provided instead of WAIS_LN
        const res = calculateWaisIV({
          WAIS_C: 10, WAIS_S: 10, WAIS_M: 10, WAIS_V: 10,
          WAIS_A: 10, WAIS_BS: 10, WAIS_PV: 10, WAIS_I: 10, WAIS_CN: 10,
          WAIS_CO: 10, // Not eligible for IMT
        });
        expect(res.isCompleteCit).toBe(false);
        expect(res.cit).toBeNull();
      });
    });
  });

  // =========================================================================
  // 5. WECHSLER NORMATIVE CONSISTENCY & MONOTONICITY CHALLENGES
  // =========================================================================
  describe('Normative Consistency & Monotonicity', () => {
    it('verifies WISC-V primary indices are strictly monotonic non-decreasing: f(s) <= f(s+1)', () => {
      const keys: Array<'ICV' | 'IVE' | 'IRF' | 'IMT' | 'IVP'> = ['ICV', 'IVE', 'IRF', 'IMT', 'IVP'];
      for (const key of keys) {
        for (let s = 2; s < 38; s++) {
          const c1 = wiscPrimarySumToComposite(key, s);
          const c2 = wiscPrimarySumToComposite(key, s + 1);
          expect(c2).toBeGreaterThanOrEqual(c1);
        }
      }
    });

    it('verifies WISC-V CIT is strictly monotonic non-decreasing: f(s) <= f(s+1)', () => {
      for (let s = 7; s < 133; s++) {
        const c1 = wiscCitSumToComposite(s);
        const c2 = wiscCitSumToComposite(s + 1);
        expect(c2).toBeGreaterThanOrEqual(c1);
      }
    });

    it('verifies WISC-V ancillary indices are strictly monotonic non-decreasing', () => {
      for (let s = 5; s < 95; s++) {
        expect(wiscAncillarySumToComposite('IAG', s + 1)).toBeGreaterThanOrEqual(wiscAncillarySumToComposite('IAG', s));
      }
      for (let s = 4; s < 76; s++) {
        expect(wiscAncillarySumToComposite('ICC', s + 1)).toBeGreaterThanOrEqual(wiscAncillarySumToComposite('ICC', s));
      }
      for (let s = 6; s < 114; s++) {
        expect(wiscAncillarySumToComposite('INV', s + 1)).toBeGreaterThanOrEqual(wiscAncillarySumToComposite('INV', s));
      }
    });

    it('verifies WAIS-IV primary indices are strictly monotonic non-decreasing', () => {
      for (let s = 3; s < 57; s++) {
        expect(wais3SubtestSumToComposite('ICV', s + 1)).toBeGreaterThanOrEqual(wais3SubtestSumToComposite('ICV', s));
        expect(wais3SubtestSumToComposite('IRP', s + 1)).toBeGreaterThanOrEqual(wais3SubtestSumToComposite('IRP', s));
      }
      for (let s = 2; s < 38; s++) {
        expect(wais2SubtestSumToComposite('IMT', s + 1)).toBeGreaterThanOrEqual(wais2SubtestSumToComposite('IMT', s));
        expect(wais2SubtestSumToComposite('IVP', s + 1)).toBeGreaterThanOrEqual(wais2SubtestSumToComposite('IVP', s));
      }
    });

    it('verifies WAIS-IV CIT monotonicity around former inversion points', () => {
      // Monotonicity requires f(s) <= f(s+1).
      const cit64 = waisCitSumToComposite(64);
      const cit65 = waisCitSumToComposite(65);
      const cit69 = waisCitSumToComposite(69);
      const cit70 = waisCitSumToComposite(70);

      expect(cit65).toBeGreaterThanOrEqual(cit64);
      expect(cit70).toBeGreaterThanOrEqual(cit69);
    });

    it('verifies WAIS-IV CIT is non-decreasing across entire domain [10..190]', () => {
      for (let s = 10; s < 190; s++) {
        expect(waisCitSumToComposite(s + 1)).toBeGreaterThanOrEqual(waisCitSumToComposite(s));
      }
    });

    it('verifies WAIS-IV IAG monotonicity around former inversion point', () => {
      const iag51 = waisAncillarySumToComposite('IAG', 51);
      const iag52 = waisAncillarySumToComposite('IAG', 52);

      expect(iag52).toBeGreaterThanOrEqual(iag51);
    });

    it('verifies WAIS-IV ancillary indices (IAG, ICC) are non-decreasing across entire domains', () => {
      for (let s = 6; s < 114; s++) {
        expect(waisAncillarySumToComposite('IAG', s + 1)).toBeGreaterThanOrEqual(waisAncillarySumToComposite('IAG', s));
      }
      for (let s = 4; s < 76; s++) {
        expect(waisAncillarySumToComposite('ICC', s + 1)).toBeGreaterThanOrEqual(waisAncillarySumToComposite('ICC', s));
      }
    });

    it('verifies WISC-V IRC and IMTA are non-decreasing across entire domains', () => {
      for (let s = 2; s < 38; s++) {
        expect(wiscAncillarySumToComposite('IRC', s + 1)).toBeGreaterThanOrEqual(wiscAncillarySumToComposite('IRC', s));
        expect(wiscAncillarySumToComposite('IMTA', s + 1)).toBeGreaterThanOrEqual(wiscAncillarySumToComposite('IMTA', s));
      }
    });
  });
});
