import { describe, it, expect } from 'vitest';
import {
  calculateWiscV,
  calculateWaisIV,
  validateScaledScore,
  validateAgeAndBattery,
  calculateChronologicalAge,
  calculatePairDiscrepancy,
  calculateAllDiscrepancies,
  estimateBaseRateDesc,
  compositeToPercentile,
  formatPercentile,
  getQualitativeCategory,
  calculateConfidenceInterval,
  SubtestId,
} from '../../core';
import {
  waisCitSumToComposite,
  waisAncillarySumToComposite,
  wais3SubtestSumToComposite,
  wais2SubtestSumToComposite,
} from '../../core/tables/wais_iv_norms';
import {
  wiscCitSumToComposite,
  wiscPrimarySumToComposite,
  wiscAncillarySumToComposite,
} from '../../core/tables/wisc_v_norms';

describe('Adversarial Stress Test Suite — Challenger 1 (Milestone M1)', () => {
  describe('Adversarial Dimension 1: Input Validation & Type Confusion Defects', () => {
    it('AD-VAL-1: verifies validateScaledScore strictly rejects boolean values true and false', () => {
      const resTrue = validateScaledScore(true);
      expect(resTrue.isValid).toBe(false);
      const resFalse = validateScaledScore(false);
      expect(resFalse.isValid).toBe(false);
    });

    it('AD-VAL-2: verifies validateScaledScore strictly rejects array [10] as valid score', () => {
      const res = validateScaledScore([10]);
      expect(res.isValid).toBe(false);
    });

    it('AD-VAL-3: verifies validateScaledScore strictly rejects object with valueOf hack', () => {
      const hack = { valueOf: () => 10 };
      const res = validateScaledScore(hack);
      expect(res.isValid).toBe(false);
    });

    it('AD-VAL-4: verifies validateScaledScore handles Symbol safely without throwing and rejects it', () => {
      const res = validateScaledScore(Symbol('10'));
      expect(res.isValid).toBe(false);
    });

    it('AD-VAL-5: correctly rejects boundary out-of-range floats and negatives', () => {
      expect(validateScaledScore(0.9999).isValid).toBe(false);
      expect(validateScaledScore(19.0001).isValid).toBe(false);
      expect(validateScaledScore(-1).isValid).toBe(false);
      expect(validateScaledScore(20).isValid).toBe(false);
    });
  });

  describe('Adversarial Dimension 2: Extreme Profile Asymmetry (e.g. ICV=155 vs IVP=45)', () => {
    it('AD-ASYM-1: WISC-V extreme asymmetry (ICV=155, IVP=45, diff=110 points)', () => {
      const res = calculateWiscV({
        S: 19, V: 19,   // ICV sum=38 -> 155 (Muy Superior)
        C: 10, PV: 10,  // IVE sum=20 -> 100 (Promedio)
        M: 10, B: 10,   // IRF sum=20 -> 100 (Promedio)
        D: 10, SD: 10,  // IMT sum=20 -> 100 (Promedio)
        CL: 1, BS: 1,   // IVP sum=2 -> 45 (Extremadamente Bajo)
      });

      expect(res.primaryIndices.ICV?.compositeScore).toBe(155);
      expect(res.primaryIndices.ICV?.percentile).toBe(99.9);
      expect(res.primaryIndices.ICV?.qualitative).toBe('Muy Superior');

      expect(res.primaryIndices.IVP?.compositeScore).toBe(45);
      expect(res.primaryIndices.IVP?.percentile).toBe(0.1);
      expect(res.primaryIndices.IVP?.qualitative).toBe('Extremadamente Bajo');

      // Check discrepancy matrix
      const icvIvp = res.discrepancies.find(
        (d) => (d.pair[0] === 'ICV' && d.pair[1] === 'IVP') || (d.pair[0] === 'IVP' && d.pair[1] === 'ICV')
      );
      expect(icvIvp).toBeDefined();
      expect(Math.abs(icvIvp!.diff)).toBe(110);
      expect(icvIvp!.isSignificant05).toBe(true);
      expect(icvIvp!.isSignificant01).toBe(true);
      expect(icvIvp!.baseRateDesc).toContain('< 1.5%');

      // Check ipsative strengths & weaknesses
      const strengths = res.strengthsWeaknesses.filter((sw) => sw.classification === 'Fortaleza');
      const weaknesses = res.strengthsWeaknesses.filter((sw) => sw.classification === 'Debilidad');
      expect(strengths.map((s) => s.subtestId)).toEqual(expect.arrayContaining(['S', 'V']));
      expect(weaknesses.map((w) => w.subtestId)).toEqual(expect.arrayContaining(['CL', 'BS']));
    });

    it('AD-ASYM-2: WAIS-IV extreme asymmetry (ICV=155, IVP=45, diff=110 points)', () => {
      const res = calculateWaisIV({
        WAIS_S: 19, WAIS_V: 19, WAIS_I: 19, // ICV sum=57 -> 155
        WAIS_C: 10, WAIS_M: 10, WAIS_PV: 10, // IRP sum=30 -> 100
        WAIS_D: 10, WAIS_A: 10,             // IMT sum=20 -> 100
        WAIS_BS: 1, WAIS_CN: 1,             // IVP sum=2 -> 45
      });

      expect(res.primaryIndices.ICV?.compositeScore).toBe(155);
      expect(res.primaryIndices.IVP?.compositeScore).toBe(45);

      const icvIvp = res.discrepancies.find(
        (d) => (d.pair[0] === 'ICV' && d.pair[1] === 'IVP') || (d.pair[0] === 'IVP' && d.pair[1] === 'ICV')
      );
      expect(icvIvp).toBeDefined();
      expect(Math.abs(icvIvp!.diff)).toBe(110);
      expect(icvIvp!.isSignificant05).toBe(true);
      expect(icvIvp!.isSignificant01).toBe(true);
      expect(icvIvp!.baseRateDesc).toContain('< 1.5%');
    });

    it('AD-ASYM-3: Inverted asymmetry (ICV=45, IVP=155) maintains negative directionality and significance', () => {
      const res = calculateWiscV({
        S: 1, V: 1,     // ICV sum=2 -> 45
        C: 10, PV: 10,
        M: 10, B: 10,
        D: 10, SD: 10,
        CL: 19, BS: 19, // IVP sum=38 -> 155
      });

      const icvIvp = res.discrepancies.find(
        (d) => d.pair[0] === 'ICV' && d.pair[1] === 'IVP'
      );
      expect(icvIvp).toBeDefined();
      expect(icvIvp!.diff).toBe(-110);
      expect(icvIvp!.isSignificant05).toBe(true);
      expect(icvIvp!.isSignificant01).toBe(true);
      expect(icvIvp!.baseRateDesc).toContain('< 1.5%');
    });
  });

  describe('Adversarial Dimension 3: Discrepancy Matrices Boundary Conditions', () => {
    it('AD-DISC-1: Integer critical value threshold boundary (diff=11 vs cv05=11.8 vs diff=12)', () => {
      // For WISC-V ICV-IVE: cv05 = 11.8, cv01 = 15.5
      // diff = 11: 11 < 11.8 -> not significant
      const disc11 = calculatePairDiscrepancy('ICV', 111, 'IVE', 100, 'WISC-V');
      expect(disc11.diff).toBe(11);
      expect(disc11.isSignificant05).toBe(false);

      // diff = 12: 12 >= 11.8 -> significant at .05, not at .01 (12 < 15.5)
      const disc12 = calculatePairDiscrepancy('ICV', 112, 'IVE', 100, 'WISC-V');
      expect(disc12.diff).toBe(12);
      expect(disc12.isSignificant05).toBe(true);
      expect(disc12.isSignificant01).toBe(false);

      // diff = 16: 16 >= 15.5 -> significant at .01
      const disc16 = calculatePairDiscrepancy('ICV', 116, 'IVE', 100, 'WISC-V');
      expect(disc16.diff).toBe(16);
      expect(disc16.isSignificant05).toBe(true);
      expect(disc16.isSignificant01).toBe(true);
    });

    it('AD-DISC-2: Base rate categorization boundary transitions', () => {
      expect(estimateBaseRateDesc(29.9)).toContain('< 2.5%');
      expect(estimateBaseRateDesc(30.0)).toContain('< 1.5%');

      expect(estimateBaseRateDesc(24.9)).toContain('< 5.0%');
      expect(estimateBaseRateDesc(25.0)).toContain('< 2.5%');

      expect(estimateBaseRateDesc(19.9)).toContain('< 10.0%');
      expect(estimateBaseRateDesc(20.0)).toContain('< 5.0%');

      expect(estimateBaseRateDesc(14.9)).toBe('10% – 15%');
      expect(estimateBaseRateDesc(15.0)).toContain('< 10.0%');

      expect(estimateBaseRateDesc(9.9)).toContain('> 15%');
      expect(estimateBaseRateDesc(10.0)).toBe('10% – 15%');
    });

    it('AD-DISC-3: Fallback calculation for non-standard pair uses dynamic SEM formula', () => {
      const disc = calculatePairDiscrepancy('CUSTOM_A', 115, 'CUSTOM_B', 100, 'WISC-V', 3.0, 4.0);
      // seDiff = sqrt(3^2 + 4^2) = 5.0
      // cv05 = 1.96 * 5.0 = 9.8
      // cv01 = 2.576 * 5.0 = 12.88 -> 12.9
      // diff = 15 >= 12.9 -> significant at both
      expect(disc.diff).toBe(15);
      expect(disc.isSignificant05).toBe(true);
      expect(disc.isSignificant01).toBe(true);
    });
  });

  describe('Adversarial Dimension 4: Leap Years, Month-Ends & Edge Age Calculations', () => {
    it('AD-AGE-1: Leap year birth on Feb 29 to Feb 28 of non-leap year (1 day before birthday)', () => {
      const age = calculateChronologicalAge('2004-02-29', '2016-02-28');
      expect(age.isValid).toBe(true);
      expect(age.years).toBe(11);
      expect(age.months).toBe(11);
    });

    it('AD-AGE-2: Month-end transitions across months of differing lengths (31, 30, 28 days)', () => {
      // Born Aug 31, tested Sept 30 (borrowing from Aug with 31 days)
      const age1 = calculateChronologicalAge('2010-08-31', '2020-09-30');
      expect(age1.isValid).toBe(true);
      expect(age1.years).toBe(10);
      expect(age1.months).toBe(0);
      expect(age1.days).toBe(30);

      // Born Aug 31, tested Oct 1 (borrowing from Sept with 30 days)
      const age2 = calculateChronologicalAge('2010-08-31', '2020-10-01');
      expect(age2.isValid).toBe(true);
      expect(age2.years).toBe(10);
      expect(age2.months).toBe(1);
      expect(age2.days).toBe(0);
    });

    it('AD-AGE-3: Century leap year rule (2000 was leap, 1900 was not)', () => {
      // 2000-02-29 is valid
      const age2000 = calculateChronologicalAge('2000-02-29', '2020-02-29');
      expect(age2000.isValid).toBe(true);
      expect(age2000.years).toBe(20);

      // 1900-02-29 is invalid (non-leap year)
      const age1900 = calculateChronologicalAge('1900-02-29', '1920-02-28');
      expect(age1900.isValid).toBe(false);
    });

    it('AD-AGE-4: Same day birth and test date (age = 0y 0m 0d)', () => {
      const age = calculateChronologicalAge('2020-05-15', '2020-05-15');
      expect(age.isValid).toBe(true);
      expect(age.years).toBe(0);
      expect(age.months).toBe(0);
      expect(age.days).toBe(0);
    });

    it('AD-AGE-5: 1 day before 6th birthday for WISC-V strictly rejected', () => {
      const res = validateAgeAndBattery('2014-06-15', '2020-06-14', 'WISC-V');
      expect(res.isValid).toBe(false);
      expect(res.years).toBe(5);
      expect(res.months).toBe(11);
    });

    it('AD-AGE-6: Exact 90 years 11 months 30 days for WAIS-IV accepted', () => {
      const res = validateAgeAndBattery('1929-06-01', '2020-05-31', 'WAIS-IV');
      expect(res.isValid).toBe(true);
      expect(res.years).toBe(90);
      expect(res.months).toBe(11);
    });
  });

  describe('Adversarial Dimension 5: Monotonicity Audit & Inversion Discovery', () => {
    it('AD-MONO-1: WISC-V 2-subtest composite function is strictly monotonic', () => {
      for (let s = 2; s < 38; s++) {
        const c1 = wiscPrimarySumToComposite('ICV', s);
        const c2 = wiscPrimarySumToComposite('ICV', s + 1);
        expect(c2).toBeGreaterThanOrEqual(c1);
      }
    });

    it('AD-MONO-2: WISC-V CIT function is non-decreasing across entire domain [7..133]', () => {
      for (let s = 7; s < 133; s++) {
        const c1 = wiscCitSumToComposite(s);
        const c2 = wiscCitSumToComposite(s + 1);
        expect(c2).toBeGreaterThanOrEqual(c1);
      }
    });

    it('AD-MONO-3: verifies WAIS-IV CIT function exhibits non-decreasing monotonicity at former inversion points sum=65 and sum=70', () => {
      const cit64 = waisCitSumToComposite(64);
      const cit65 = waisCitSumToComposite(65);
      expect(cit65).toBeGreaterThanOrEqual(cit64);

      const cit69 = waisCitSumToComposite(69);
      const cit70 = waisCitSumToComposite(70);
      expect(cit70).toBeGreaterThanOrEqual(cit69);
    });

    it('AD-MONO-4: verifies WAIS-IV IAG function exhibits non-decreasing monotonicity at former inversion point sum=52', () => {
      const iag51 = waisAncillarySumToComposite('IAG', 51);
      const iag52 = waisAncillarySumToComposite('IAG', 52);
      expect(iag52).toBeGreaterThanOrEqual(iag51);
    });
  });

  describe('Adversarial Dimension 6: Property-Based Invariant Fuzzing (1,000 Random Profiles)', () => {
    it('AD-PROP-1: 1,000 random WISC-V profiles obey psychometric bounds and invariants', () => {
      const wiscKeys: SubtestId[] = ['S', 'V', 'C', 'PV', 'M', 'B', 'D', 'SD', 'CL', 'BS'];

      for (let i = 0; i < 1000; i++) {
        const record: Partial<Record<SubtestId, number>> = {};
        for (const k of wiscKeys) {
          record[k] = Math.floor(Math.random() * 19) + 1; // [1..19]
        }

        const res = calculateWiscV(record);

        // Invariant 1: Complete CIT must be true
        expect(res.isCompleteCit).toBe(true);
        expect(res.cit).not.toBeNull();

        // Invariant 2: CIT composite score in [40, 160]
        const cit = res.cit!;
        expect(cit.compositeScore).toBeGreaterThanOrEqual(40);
        expect(cit.compositeScore).toBeLessThanOrEqual(160);

        // Invariant 3: Percentile strictly in [0.1, 99.9]
        expect(cit.percentile).toBeGreaterThanOrEqual(0.1);
        expect(cit.percentile).toBeLessThanOrEqual(99.9);

        // Invariant 4: Confidence intervals bounded and enclosing score
        expect(cit.ci90.lower).toBeGreaterThanOrEqual(40);
        expect(cit.ci90.upper).toBeLessThanOrEqual(160);
        expect(cit.ci90.lower).toBeLessThanOrEqual(cit.compositeScore);
        expect(cit.compositeScore).toBeLessThanOrEqual(cit.ci90.upper);

        expect(cit.ci95.lower).toBeGreaterThanOrEqual(40);
        expect(cit.ci95.upper).toBeLessThanOrEqual(160);
        expect(cit.ci95.lower).toBeLessThanOrEqual(cit.compositeScore);
        expect(cit.compositeScore).toBeLessThanOrEqual(cit.ci95.upper);

        // Invariant 5: Exactly 10 pairwise discrepancies
        expect(res.discrepancies).toHaveLength(10);
        for (const d of res.discrepancies) {
          expect(typeof d.isSignificant05).toBe('boolean');
          expect(typeof d.isSignificant01).toBe('boolean');
          if (d.isSignificant01) {
            expect(d.isSignificant05).toBe(true); // p<.01 implies p<.05
          }
        }

        // Invariant 6: Strengths and weaknesses have exactly 10 items
        expect(res.strengthsWeaknesses).toHaveLength(10);
      }
    });

    it('AD-PROP-2: 1,000 random WAIS-IV profiles obey psychometric bounds and invariants', () => {
      const waisKeys: SubtestId[] = [
        'WAIS_C', 'WAIS_S', 'WAIS_D', 'WAIS_M', 'WAIS_V',
        'WAIS_A', 'WAIS_BS', 'WAIS_PV', 'WAIS_I', 'WAIS_CN',
      ];

      for (let i = 0; i < 1000; i++) {
        const record: Partial<Record<SubtestId, number>> = {};
        for (const k of waisKeys) {
          record[k] = Math.floor(Math.random() * 19) + 1; // [1..19]
        }

        const res = calculateWaisIV(record);

        expect(res.isCompleteCit).toBe(true);
        expect(res.cit).not.toBeNull();

        const cit = res.cit!;
        expect(cit.compositeScore).toBeGreaterThanOrEqual(40);
        expect(cit.compositeScore).toBeLessThanOrEqual(160);
        expect(cit.percentile).toBeGreaterThanOrEqual(0.1);
        expect(cit.percentile).toBeLessThanOrEqual(99.9);

        expect(cit.ci90.lower).toBeGreaterThanOrEqual(40);
        expect(cit.ci90.upper).toBeLessThanOrEqual(160);
        expect(cit.ci95.lower).toBeGreaterThanOrEqual(40);
        expect(cit.ci95.upper).toBeLessThanOrEqual(160);

        expect(res.discrepancies).toHaveLength(6);
        for (const d of res.discrepancies) {
          if (d.isSignificant01) {
            expect(d.isSignificant05).toBe(true);
          }
        }

        expect(res.strengthsWeaknesses).toHaveLength(10);
      }
    });
  });
});
