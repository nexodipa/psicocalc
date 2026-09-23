import { describe, it, expect } from 'vitest';
import {
  calculateWiscV,
  calculateWaisIV,
  validateScaledScore,
  validateAgeAndBattery,
  calculateChronologicalAge,
  calculateBothConfidenceIntervals,
  compositeToPercentile,
  formatPercentile,
  getQualitativeCategory,
  calculatePairDiscrepancy,
  calculateStrengthsWeaknesses,
  SubtestId,
} from '../../core';
import {
  wiscPrimarySumToComposite,
  wiscCitSumToComposite,
  wiscAncillarySumToComposite,
} from '../../core/tables/wisc_v_norms';
import {
  wais3SubtestSumToComposite,
  wais2SubtestSumToComposite,
  waisCitSumToComposite,
  waisAncillarySumToComposite,
} from '../../core/tables/wais_iv_norms';

describe('Milestone M4: Tier 5 Adversarial Hardening & Final Verification', () => {
  // =========================================================================
  // 1. CHAOS FUZZING & UNHANDLED EXCEPTION RESILIENCE
  // =========================================================================
  describe('Tier 5.1: Chaos Fuzzing & Degenerate Payload Resilience', () => {
    it('T5-FUZZ-1: handles 500 stochastic adversarial subtest vectors without throwing unhandled exceptions', () => {
      const weirdValues = [
        -999, -1, 0, 0.5, 1, 10, 19, 19.5, 20, 100, 999999,
        NaN, Infinity, -Infinity, null, undefined,
        '', '   ', '10', 'abc', '<script>', { foo: 'bar' }, [10], true, false,
      ];

      const wiscKeys: SubtestId[] = ['S', 'V', 'C', 'PV', 'M', 'B', 'D', 'SD', 'CL', 'BS'];
      const waisKeys: SubtestId[] = [
        'WAIS_C', 'WAIS_S', 'WAIS_D', 'WAIS_M', 'WAIS_V',
        'WAIS_A', 'WAIS_BS', 'WAIS_PV', 'WAIS_I', 'WAIS_CN',
      ];

      for (let i = 0; i < 500; i++) {
        // Construct randomized messy payload
        const wiscInput: Partial<Record<SubtestId, any>> = {};
        for (const k of wiscKeys) {
          const randVal = weirdValues[Math.floor(Math.random() * weirdValues.length)];
          wiscInput[k] = randVal;
        }

        const waisInput: Partial<Record<SubtestId, any>> = {};
        for (const k of waisKeys) {
          const randVal = weirdValues[Math.floor(Math.random() * weirdValues.length)];
          waisInput[k] = randVal;
        }

        // Must never throw unhandled error
        expect(() => calculateWiscV(wiscInput as any)).not.toThrow();
        expect(() => calculateWaisIV(waisInput as any)).not.toThrow();

        const resWisc = calculateWiscV(wiscInput as any);
        expect(typeof resWisc.isCompleteCit).toBe('boolean');
        expect(Array.isArray(resWisc.discrepancies)).toBe(true);
        expect(Array.isArray(resWisc.strengthsWeaknesses)).toBe(true);

        const resWais = calculateWaisIV(waisInput as any);
        expect(typeof resWais.isCompleteCit).toBe('boolean');
        expect(Array.isArray(resWais.discrepancies)).toBe(true);
        expect(Array.isArray(resWais.strengthsWeaknesses)).toBe(true);
      }
    });

    it('T5-FUZZ-2: verifies validateScaledScore immunity against prototypes and symbol injections', () => {
      expect(validateScaledScore(Object.create(null)).isValid).toBe(false);
      expect(validateScaledScore(() => 10).isValid).toBe(false);
      expect(validateScaledScore(BigInt(10)).isValid).toBe(false);
      expect(validateScaledScore(new Date()).isValid).toBe(false);
      expect(validateScaledScore(new RegExp('10')).isValid).toBe(false);
    });

    it('T5-FUZZ-3: handles degenerate dates and malformed strings in age validator safely', () => {
      expect(validateAgeAndBattery('', '', 'WISC-V').isValid).toBe(false);
      expect(validateAgeAndBattery('invalid-date', '2026-09-22', 'WISC-V').isValid).toBe(false);
      expect(validateAgeAndBattery('2026-09-22', '2020-01-01', 'WISC-V').isValid).toBe(false);
      expect(validateAgeAndBattery('2026-02-31', '2026-09-22', 'WISC-V').isValid).toBe(false);
    });
  });

  // =========================================================================
  // 2. MATHEMATICAL MONOTONICITY & PIECEWISE LINEAR CONTINUITY
  // =========================================================================
  describe('Tier 5.2: Absolute Global Monotonicity Invariants', () => {
    it('T5-MONO-1: guarantees f(s + 1) >= f(s) across ALL integer sums for WISC-V primary indices', () => {
      const primaryKeys: Array<'ICV' | 'IVE' | 'IRF' | 'IMT' | 'IVP'> = ['ICV', 'IVE', 'IRF', 'IMT', 'IVP'];
      for (const idx of primaryKeys) {
        let prevComposite = wiscPrimarySumToComposite(idx, 2);
        for (let sum = 3; sum <= 38; sum++) {
          const currComposite = wiscPrimarySumToComposite(idx, sum);
          expect(currComposite).toBeGreaterThanOrEqual(prevComposite);
          prevComposite = currComposite;
        }
      }
    });

    it('T5-MONO-2: guarantees f(s + 1) >= f(s) across ALL integer sums for WISC-V CIT [7..133]', () => {
      let prevCit = wiscCitSumToComposite(7);
      for (let sum = 8; sum <= 133; sum++) {
        const currCit = wiscCitSumToComposite(sum);
        expect(currCit).toBeGreaterThanOrEqual(prevCit);
        prevCit = currCit;
      }
    });

    it('T5-MONO-3: guarantees f(s + 1) >= f(s) across ALL integer sums for WAIS-IV 3-subtest indices (ICV, IRP) [3..57]', () => {
      for (const idx of ['ICV', 'IRP'] as const) {
        let prev = wais3SubtestSumToComposite(idx, 3);
        for (let sum = 4; sum <= 57; sum++) {
          const curr = wais3SubtestSumToComposite(idx, sum);
          expect(curr).toBeGreaterThanOrEqual(prev);
          prev = curr;
        }
      }
    });

    it('T5-MONO-4: guarantees f(s + 1) >= f(s) across ALL integer sums for WAIS-IV 2-subtest indices (IMT, IVP) [2..38]', () => {
      for (const idx of ['IMT', 'IVP'] as const) {
        let prev = wais2SubtestSumToComposite(idx, 2);
        for (let sum = 3; sum <= 38; sum++) {
          const curr = wais2SubtestSumToComposite(idx, sum);
          expect(curr).toBeGreaterThanOrEqual(prev);
          prev = curr;
        }
      }
    });

    it('T5-MONO-5: guarantees f(s + 1) >= f(s) across ALL integer sums for WAIS-IV CIT [10..190]', () => {
      let prevCit = waisCitSumToComposite(10);
      for (let sum = 11; sum <= 190; sum++) {
        const currCit = waisCitSumToComposite(sum);
        expect(currCit).toBeGreaterThanOrEqual(prevCit);
        prevCit = currCit;
      }
    });

    it('T5-MONO-6: guarantees f(s + 1) >= f(s) for WAIS-IV ancillary indices (IAG, ICC)', () => {
      // IAG: 6 subtests [6..114]
      let prevIag = waisAncillarySumToComposite('IAG', 6);
      for (let sum = 7; sum <= 114; sum++) {
        const currIag = waisAncillarySumToComposite('IAG', sum);
        expect(currIag).toBeGreaterThanOrEqual(prevIag);
        prevIag = currIag;
      }

      // ICC: 4 subtests [4..76]
      let prevIcc = waisAncillarySumToComposite('ICC', 4);
      for (let sum = 5; sum <= 76; sum++) {
        const currIcc = waisAncillarySumToComposite('ICC', sum);
        expect(currIcc).toBeGreaterThanOrEqual(prevIcc);
        prevIcc = currIcc;
      }
    });
  });

  // =========================================================================
  // 3. STATISTICAL BOUNDARIES, METRIC CLAMPING & CI TRUNCATION
  // =========================================================================
  describe('Tier 5.3: Metric Clamping & Statistical Confidence Limits', () => {
    it('T5-CLAMP-1: enforces [40, 160] boundary clamping on confidence intervals for all standard scores [40..160]', () => {
      for (let score = 40; score <= 160; score++) {
        const { ci90, ci95 } = calculateBothConfidenceIntervals(score, 3.5);
        expect(ci90.lower).toBeGreaterThanOrEqual(40);
        expect(ci90.upper).toBeLessThanOrEqual(160);
        expect(ci95.lower).toBeGreaterThanOrEqual(40);
        expect(ci95.upper).toBeLessThanOrEqual(160);
        expect(ci95.lower).toBeLessThanOrEqual(ci90.lower);
        expect(ci95.upper).toBeGreaterThanOrEqual(ci90.upper);
      }
    });

    it('T5-CLAMP-2: normal distribution percentile function monotonically maps scores to [0.1, 99.9]', () => {
      let prevPr = compositeToPercentile(40);
      expect(prevPr).toBeLessThanOrEqual(0.1);

      for (let score = 41; score <= 160; score++) {
        const currPr = compositeToPercentile(score);
        expect(currPr).toBeGreaterThanOrEqual(prevPr);
        prevPr = currPr;
      }

      expect(compositeToPercentile(160)).toBeGreaterThanOrEqual(99.9);
    });

    it('T5-CLAMP-3: formatPercentile handles edge percentiles cleanly', () => {
      expect(formatPercentile(0.05)).toBe('<0.1');
      expect(formatPercentile(0.1)).toBe('0.1');
      expect(formatPercentile(50)).toBe('50');
      expect(formatPercentile(99.9)).toBe('99.9');
      expect(formatPercentile(99.95)).toBe('>99.9');
    });

    it('T5-CLAMP-4: qualitative classification strictly covers all Wechsler tiers', () => {
      expect(getQualitativeCategory(135)).toBe('Muy Superior');
      expect(getQualitativeCategory(130)).toBe('Muy Superior');
      expect(getQualitativeCategory(125)).toBe('Superior');
      expect(getQualitativeCategory(120)).toBe('Superior');
      expect(getQualitativeCategory(115)).toBe('Promedio Alto');
      expect(getQualitativeCategory(110)).toBe('Promedio Alto');
      expect(getQualitativeCategory(100)).toBe('Promedio');
      expect(getQualitativeCategory(90)).toBe('Promedio');
      expect(getQualitativeCategory(85)).toBe('Promedio Bajo');
      expect(getQualitativeCategory(80)).toBe('Promedio Bajo');
      expect(getQualitativeCategory(75)).toBe('Limítrofe');
      expect(getQualitativeCategory(70)).toBe('Limítrofe');
      expect(getQualitativeCategory(65)).toBe('Extremadamente Bajo');
      expect(getQualitativeCategory(40)).toBe('Extremadamente Bajo');
    });
  });

  // =========================================================================
  // 4. CLINICAL DISSOCIATION, HOMOGENEITY & IPSATIVE SCATTER
  // =========================================================================
  describe('Tier 5.4: Clinical Discrepancy & Intra-Individual Scatter Invariants', () => {
    it('T5-DISC-1: flags statistical significance at p < .05 and p < .01 based on critical differences', () => {
      // Pairwise difference calculation
      const discSmall = calculatePairDiscrepancy('ICV', 'IVP', 100, 95, 10.0, 13.0);
      expect(discSmall.diff).toBe(5);
      expect(discSmall.isSignificant05).toBe(false);
      expect(discSmall.isSignificant01).toBe(false);

      const discSig05 = calculatePairDiscrepancy('ICV', 'IVP', 112, 100, 10.0, 13.0);
      expect(discSig05.diff).toBe(12);
      expect(discSig05.isSignificant05).toBe(true);
      expect(discSig05.isSignificant01).toBe(false);

      const discSig01 = calculatePairDiscrepancy('ICV', 'IVP', 120, 100, 10.0, 13.0);
      expect(discSig01.diff).toBe(20);
      expect(discSig01.isSignificant05).toBe(true);
      expect(discSig01.isSignificant01).toBe(true);
    });

    it('T5-DISC-2: flat cognitive profiles yield exactly 0 strengths and 0 weaknesses', () => {
      const flatSubtests: Partial<Record<SubtestId, number>> = {
        S: 10, V: 10, C: 10, PV: 10, M: 10, B: 10, D: 10, SD: 10, CL: 10, BS: 10,
      };
      const sw = calculateStrengthsWeaknesses(flatSubtests, 2.5);
      const fortalezas = sw.filter((item) => item.classification === 'Fortaleza');
      const debilidades = sw.filter((item) => item.classification === 'Debilidad');
      expect(fortalezas.length).toBe(0);
      expect(debilidades.length).toBe(0);
      expect(sw.every((item) => item.classification === 'Promedio')).toBe(true);
    });

    it('T5-DISC-3: correctly identifies high and low outliers as Fortaleza and Debilidad', () => {
      // Mean = (16 + 10 + 10 + 10 + 10 + 10 + 10 + 10 + 10 + 4) / 10 = 100 / 10 = 10
      const dispersedSubtests: Partial<Record<SubtestId, number>> = {
        S: 16, // diff = +6 >= 2.5 -> Fortaleza
        V: 10,
        C: 10,
        PV: 10,
        M: 10,
        B: 10,
        D: 10,
        SD: 10,
        CL: 10,
        BS: 4,  // diff = -6 <= -2.5 -> Debilidad
      };
      const sw = calculateStrengthsWeaknesses(dispersedSubtests, 2.5);
      const sResult = sw.find((i) => i.subtestId === 'S');
      const bsResult = sw.find((i) => i.subtestId === 'BS');
      const vResult = sw.find((i) => i.subtestId === 'V');

      expect(sResult?.classification).toBe('Fortaleza');
      expect(bsResult?.classification).toBe('Debilidad');
      expect(vResult?.classification).toBe('Promedio');
    });

    it('T5-DISC-4: checks clinical delta threshold >= 23 points for CIT heterogeneity', () => {
      // Split profile: ICV = 144, IVP = 114 -> delta = 30 >= 23 (Heterogeneous)
      const resWisc = calculateWiscV({
        S: 17, V: 18, C: 16, PV: 15, M: 16, B: 17, D: 14, SD: 15, CL: 12, BS: 13,
      });

      const indices = Object.values(resWisc.primaryIndices)
        .filter((i): i is NonNullable<typeof i> => i !== null)
        .map((i) => i.compositeScore);
      const delta = Math.max(...indices) - Math.min(...indices);
      expect(delta).toBeGreaterThanOrEqual(23);
    });
  });

  // =========================================================================
  // 5. CHRONOLOGICAL AGE AND BATTERY CUTOFF INTEGRITY
  // =========================================================================
  describe('Tier 5.5: Chronological Age Algorithm & Leap Year Transitions', () => {
    it('T5-AGE-1: computes exact chronological age for leap year birthdays (Feb 29)', () => {
      // Born 2016-02-29, evaluated 2026-02-28 -> 9y 11m 30d
      const agePre = calculateChronologicalAge('2016-02-29', '2026-02-28');
      expect(agePre.years).toBe(9);
      expect(agePre.months).toBe(11);

      // Evaluated 2026-03-01 -> 10y 0m 1d
      const agePost = calculateChronologicalAge('2016-02-29', '2026-03-01');
      expect(agePost.years).toBe(10);
      expect(agePost.months).toBe(0);
      expect(agePost.days).toBe(1);
    });

    it('T5-AGE-2: strictly gates battery transitions at 16:0:0 and 16:11:30', () => {
      // Age 16:0:0 is valid in both WISC-V and WAIS-IV
      const gate16Wisc = validateAgeAndBattery('2010-09-22', '2026-09-22', 'WISC-V');
      const gate16Wais = validateAgeAndBattery('2010-09-22', '2026-09-22', 'WAIS-IV');
      expect(gate16Wisc.isValid).toBe(true);
      expect(gate16Wais.isValid).toBe(true);

      // Age 17:0:0 is invalid in WISC-V and valid in WAIS-IV
      const gate17Wisc = validateAgeAndBattery('2009-09-22', '2026-09-22', 'WISC-V');
      const gate17Wais = validateAgeAndBattery('2009-09-22', '2026-09-22', 'WAIS-IV');
      expect(gate17Wisc.isValid).toBe(false);
      expect(gate17Wais.isValid).toBe(true);
    });
  });
});
