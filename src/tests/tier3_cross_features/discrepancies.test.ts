import { describe, it, expect } from 'vitest';
import {
  calculateWiscV,
  calculateWaisIV,
  calculatePairDiscrepancy,
  calculateAllDiscrepancies,
  estimateBaseRateDesc,
  WISC_V_DISCREPANCY_CRITICAL,
  WAIS_IV_DISCREPANCY_CRITICAL,
} from '../../core';

describe('Tier 3 - Pairwise Index Discrepancies & Statistical Significance', () => {
  describe('WISC-V Pairwise Discrepancy Matrix (10 Canonical Pairs)', () => {
    it('verifies all 10 pairwise comparisons in WISC-V critical difference table', () => {
      const expectedPairs = [
        'ICV-IVE', 'ICV-IRF', 'ICV-IMT', 'ICV-IVP',
        'IVE-IRF', 'IVE-IMT', 'IVE-IVP',
        'IRF-IMT', 'IRF-IVP',
        'IMT-IVP',
      ];
      expect(Object.keys(WISC_V_DISCREPANCY_CRITICAL)).toHaveLength(10);
      for (const pair of expectedPairs) {
        expect(WISC_V_DISCREPANCY_CRITICAL[pair]).toBeDefined();
        expect(WISC_V_DISCREPANCY_CRITICAL[pair].cv05).toBeGreaterThan(0);
        expect(WISC_V_DISCREPANCY_CRITICAL[pair].cv01).toBeGreaterThan(
          WISC_V_DISCREPANCY_CRITICAL[pair].cv05
        );
      }
    });

    it('generates exactly 10 pairwise discrepancies when all 5 primary indices are computed', () => {
      const res = calculateWiscV({
        S: 10, V: 10, C: 10, PV: 10, M: 10, B: 10, D: 10, SD: 10, CL: 10, BS: 10,
      });
      expect(res.discrepancies).toHaveLength(10);
      for (const d of res.discrepancies) {
        expect(d.diff).toBe(0);
        expect(d.isSignificant05).toBe(false);
        expect(d.isSignificant01).toBe(false);
      }
    });

    it('flags high discrepancy as significant at both p < .05 and p < .01 (ICV 131 vs IVP 109, diff = 22)', () => {
      const res = calculateWiscV({
        S: 16, V: 15, // ICV = 131
        C: 10, PV: 10,
        M: 10, B: 10,
        D: 10, SD: 10,
        CL: 12, BS: 11, // IVP = 109
      });
      const pair = res.discrepancies.find(
        (d) => (d.pair[0] === 'ICV' && d.pair[1] === 'IVP') || (d.pair[0] === 'IVP' && d.pair[1] === 'ICV')
      );
      expect(pair).toBeDefined();
      expect(Math.abs(pair!.diff)).toBe(22);
      expect(pair!.isSignificant05).toBe(true);
      expect(pair!.isSignificant01).toBe(true);
      expect(pair!.baseRateDesc).toBeDefined();
    });

    it('flags moderate discrepancy significant at p < .05 but not at p < .01', () => {
      // For ICV-IVE: cv05 = 11.8, cv01 = 15.5. A diff of 13 should be sig at 0.05, not at 0.01
      const disc = calculatePairDiscrepancy('ICV', 113, 'IVE', 100, 'WISC-V');
      expect(disc.diff).toBe(13);
      expect(disc.isSignificant05).toBe(true);
      expect(disc.isSignificant01).toBe(false);
    });

    it('does not flag differences below critical values as significant', () => {
      // For ICV-IVE: diff of 8 is well below cv05 = 11.8
      const disc = calculatePairDiscrepancy('ICV', 108, 'IVE', 100, 'WISC-V');
      expect(disc.diff).toBe(8);
      expect(disc.isSignificant05).toBe(false);
      expect(disc.isSignificant01).toBe(false);
    });
  });

  describe('WAIS-IV Pairwise Discrepancy Matrix (6 Canonical Pairs)', () => {
    it('verifies all 6 pairwise comparisons in WAIS-IV critical difference table', () => {
      const expectedPairs = [
        'ICV-IRP', 'ICV-IMT', 'ICV-IVP',
        'IRP-IMT', 'IRP-IVP',
        'IMT-IVP',
      ];
      expect(Object.keys(WAIS_IV_DISCREPANCY_CRITICAL)).toHaveLength(6);
      for (const pair of expectedPairs) {
        expect(WAIS_IV_DISCREPANCY_CRITICAL[pair]).toBeDefined();
        expect(WAIS_IV_DISCREPANCY_CRITICAL[pair].cv05).toBeGreaterThan(0);
        expect(WAIS_IV_DISCREPANCY_CRITICAL[pair].cv01).toBeGreaterThan(
          WAIS_IV_DISCREPANCY_CRITICAL[pair].cv05
        );
      }
    });

    it('generates exactly 6 pairwise discrepancies when all 4 primary indices are computed', () => {
      const res = calculateWaisIV({
        WAIS_C: 10, WAIS_S: 10, WAIS_D: 10, WAIS_M: 10, WAIS_V: 10,
        WAIS_A: 10, WAIS_BS: 10, WAIS_PV: 10, WAIS_I: 10, WAIS_CN: 10,
      });
      expect(res.discrepancies).toHaveLength(6);
      for (const d of res.discrepancies) {
        expect(d.diff).toBe(0);
        expect(d.isSignificant05).toBe(false);
        expect(d.isSignificant01).toBe(false);
      }
    });

    it('flags extreme cognitive dissociation (ICV 106 vs IVP 65, diff = 41)', () => {
      const disc = calculatePairDiscrepancy('ICV', 106, 'IVP', 65, 'WAIS-IV');
      expect(disc.diff).toBe(41);
      expect(disc.isSignificant05).toBe(true);
      expect(disc.isSignificant01).toBe(true);
      expect(disc.baseRateDesc).toContain('< 1.5%');
    });

    it('correctly reports negative directional difference (IVP 70 vs ICV 100, diff = -30)', () => {
      const disc = calculatePairDiscrepancy('IVP', 70, 'ICV', 100, 'WAIS-IV');
      expect(disc.diff).toBe(-30);
      expect(disc.isSignificant05).toBe(true);
      expect(disc.isSignificant01).toBe(true);
    });

    it('returns empty discrepancy list when fewer than 2 primary indices are computed', () => {
      const res1 = calculateWaisIV({});
      const res2 = calculateWaisIV({ WAIS_S: 10, WAIS_V: 10, WAIS_I: 10 }); // Only ICV computed
      expect(res1.discrepancies).toEqual([]);
      expect(res2.discrepancies).toEqual([]);
    });
  });

  describe('Clinical Base Rate Categorization', () => {
    it('classifies diff >= 30 points as extremely rare (< 1.5%)', () => {
      expect(estimateBaseRateDesc(35)).toContain('< 1.5%');
    });

    it('classifies diff between 20 and 24 as unusual (< 5.0%)', () => {
      expect(estimateBaseRateDesc(22)).toContain('< 5.0%');
    });

    it('classifies diff between 15 and 19 as infrequent (< 10.0%)', () => {
      expect(estimateBaseRateDesc(17)).toContain('< 10.0%');
    });

    it('classifies diff between 10 and 14 as 10% – 15%', () => {
      expect(estimateBaseRateDesc(12)).toBe('10% – 15%');
    });

    it('classifies diff < 10 as common in general population (> 15%)', () => {
      expect(estimateBaseRateDesc(5)).toContain('> 15%');
      expect(estimateBaseRateDesc(0)).toContain('> 15%');
    });
  });
});
