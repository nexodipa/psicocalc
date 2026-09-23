import { describe, it, expect } from 'vitest';
import {
  calculateWiscV,
  calculateWaisIV,
  calculateBothConfidenceIntervals,
  calculateConfidenceInterval,
  compositeToPercentile,
  getQualitativeCategory,
} from '../../core';

describe('Tier 2 - Floor, Ceiling & Metric Boundaries', () => {
  describe('WISC-V Floor Extremes (All Scaled Scores = 1)', () => {
    const floorScores = {
      S: 1, V: 1, C: 1, PV: 1, M: 1, B: 1, D: 1, SD: 1, CL: 1, BS: 1,
    };

    it('clamps all 5 primary indices to minimum floor score 45', () => {
      const res = calculateWiscV(floorScores);
      expect(res.primaryIndices.ICV?.compositeScore).toBe(45);
      expect(res.primaryIndices.IVE?.compositeScore).toBe(45);
      expect(res.primaryIndices.IRF?.compositeScore).toBe(45);
      expect(res.primaryIndices.IMT?.compositeScore).toBe(45);
      expect(res.primaryIndices.IVP?.compositeScore).toBe(45);
    });

    it('clamps WISC-V CIT to absolute metric minimum 40 (Sum = 7)', () => {
      const res = calculateWiscV(floorScores);
      expect(res.isCompleteCit).toBe(true);
      expect(res.cit?.sumScaled).toBe(7);
      expect(res.cit?.compositeScore).toBe(40);
      expect(res.cit?.qualitative).toBe('Extremadamente Bajo');
    });

    it('clamps floor percentiles to extreme minimum <= 0.1', () => {
      const res = calculateWiscV(floorScores);
      expect(res.cit?.percentile).toBeLessThanOrEqual(0.1);
      expect(res.primaryIndices.ICV?.percentile).toBeLessThanOrEqual(0.1);
    });

    it('truncates confidence interval lower bounds strictly at 40 (no scores < 40)', () => {
      const res = calculateWiscV(floorScores);
      expect(res.cit?.ci95.lower).toBe(40);
      expect(res.cit?.ci90.lower).toBe(40);
      expect(res.primaryIndices.ICV?.ci95.lower).toBeGreaterThanOrEqual(40);
    });

    it('clamps ancillary indices to theoretical floors', () => {
      const res = calculateWiscV(floorScores);
      expect(res.ancillaryIndices.IAG?.compositeScore).toBeLessThanOrEqual(45);
      expect(res.ancillaryIndices.ICC?.compositeScore).toBeLessThanOrEqual(45);
      expect(res.ancillaryIndices.INV?.compositeScore).toBeLessThanOrEqual(45);
    });
  });

  describe('WISC-V Ceiling Extremes (All Scaled Scores = 19)', () => {
    const ceilingScores = {
      S: 19, V: 19, C: 19, PV: 19, M: 19, B: 19, D: 19, SD: 19, CL: 19, BS: 19,
    };

    it('clamps all 5 primary indices to ceiling score 155', () => {
      const res = calculateWiscV(ceilingScores);
      expect(res.primaryIndices.ICV?.compositeScore).toBe(155);
      expect(res.primaryIndices.IVE?.compositeScore).toBe(155);
      expect(res.primaryIndices.IRF?.compositeScore).toBe(155);
      expect(res.primaryIndices.IMT?.compositeScore).toBe(155);
      expect(res.primaryIndices.IVP?.compositeScore).toBe(155);
    });

    it('clamps WISC-V CIT to absolute metric maximum 160 (Sum = 133)', () => {
      const res = calculateWiscV(ceilingScores);
      expect(res.isCompleteCit).toBe(true);
      expect(res.cit?.sumScaled).toBe(133);
      expect(res.cit?.compositeScore).toBe(160);
      expect(res.cit?.qualitative).toBe('Muy Superior');
    });

    it('clamps ceiling percentiles to extreme maximum >= 99.9', () => {
      const res = calculateWiscV(ceilingScores);
      expect(res.cit?.percentile).toBeGreaterThanOrEqual(99.9);
      expect(res.primaryIndices.ICV?.percentile).toBeGreaterThanOrEqual(99.9);
    });

    it('truncates confidence interval upper bounds strictly at 160 (no scores > 160)', () => {
      const res = calculateWiscV(ceilingScores);
      expect(res.cit?.ci95.upper).toBe(160);
      expect(res.cit?.ci90.upper).toBe(160);
      expect(res.primaryIndices.ICV?.ci95.upper).toBeLessThanOrEqual(160);
    });

    it('assigns qualitative category Muy Superior across all ceiling indices', () => {
      const res = calculateWiscV(ceilingScores);
      expect(res.cit?.qualitative).toBe('Muy Superior');
      expect(res.primaryIndices.ICV?.qualitative).toBe('Muy Superior');
      expect(res.primaryIndices.IRF?.qualitative).toBe('Muy Superior');
    });
  });

  describe('WAIS-IV Floor Extremes (All Scaled Scores = 1)', () => {
    const floorScores = {
      WAIS_C: 1, WAIS_S: 1, WAIS_D: 1, WAIS_M: 1, WAIS_V: 1,
      WAIS_A: 1, WAIS_BS: 1, WAIS_PV: 1, WAIS_I: 1, WAIS_CN: 1,
    };

    it('clamps all 4 primary indices to minimum floor score 45', () => {
      const res = calculateWaisIV(floorScores);
      expect(res.primaryIndices.ICV?.compositeScore).toBe(45);
      expect(res.primaryIndices.IRP?.compositeScore).toBe(45);
      expect(res.primaryIndices.IMT?.compositeScore).toBe(45);
      expect(res.primaryIndices.IVP?.compositeScore).toBe(45);
    });

    it('clamps WAIS-IV CIT to absolute minimum 40 (Sum = 10)', () => {
      const res = calculateWaisIV(floorScores);
      expect(res.isCompleteCit).toBe(true);
      expect(res.cit?.sumScaled).toBe(10);
      expect(res.cit?.compositeScore).toBe(40);
      expect(res.cit?.qualitative).toBe('Extremadamente Bajo');
    });

    it('clamps floor percentiles to extreme minimum <= 0.1', () => {
      const res = calculateWaisIV(floorScores);
      expect(res.cit?.percentile).toBeLessThanOrEqual(0.1);
      expect(res.primaryIndices.IRP?.percentile).toBeLessThanOrEqual(0.1);
    });

    it('truncates confidence interval lower bounds strictly at 40', () => {
      const res = calculateWaisIV(floorScores);
      expect(res.cit?.ci95.lower).toBe(40);
      expect(res.primaryIndices.ICV?.ci95.lower).toBeGreaterThanOrEqual(40);
    });

    it('clamps WAIS-IV ancillary indices (IAG, ICC) to minimum floor', () => {
      const res = calculateWaisIV(floorScores);
      expect(res.ancillaryIndices.IAG?.compositeScore).toBeLessThanOrEqual(45);
      expect(res.ancillaryIndices.ICC?.compositeScore).toBeLessThanOrEqual(45);
    });
  });

  describe('WAIS-IV Ceiling Extremes (All Scaled Scores = 19)', () => {
    const ceilingScores = {
      WAIS_C: 19, WAIS_S: 19, WAIS_D: 19, WAIS_M: 19, WAIS_V: 19,
      WAIS_A: 19, WAIS_BS: 19, WAIS_PV: 19, WAIS_I: 19, WAIS_CN: 19,
    };

    it('clamps all 4 primary indices to ceiling score 155', () => {
      const res = calculateWaisIV(ceilingScores);
      expect(res.primaryIndices.ICV?.compositeScore).toBe(155);
      expect(res.primaryIndices.IRP?.compositeScore).toBe(155);
      expect(res.primaryIndices.IMT?.compositeScore).toBe(155);
      expect(res.primaryIndices.IVP?.compositeScore).toBe(155);
    });

    it('clamps WAIS-IV CIT to absolute maximum 160 (Sum = 190)', () => {
      const res = calculateWaisIV(ceilingScores);
      expect(res.isCompleteCit).toBe(true);
      expect(res.cit?.sumScaled).toBe(190);
      expect(res.cit?.compositeScore).toBe(160);
      expect(res.cit?.qualitative).toBe('Muy Superior');
    });

    it('clamps ceiling percentiles to extreme maximum >= 99.9', () => {
      const res = calculateWaisIV(ceilingScores);
      expect(res.cit?.percentile).toBeGreaterThanOrEqual(99.9);
      expect(res.primaryIndices.IVP?.percentile).toBeGreaterThanOrEqual(99.9);
    });

    it('truncates confidence interval upper bounds strictly at 160', () => {
      const res = calculateWaisIV(ceilingScores);
      expect(res.cit?.ci95.upper).toBe(160);
      expect(res.primaryIndices.IRP?.ci95.upper).toBeLessThanOrEqual(160);
    });

    it('assigns qualitative category Muy Superior across all ceiling indices', () => {
      const res = calculateWaisIV(ceilingScores);
      expect(res.cit?.qualitative).toBe('Muy Superior');
      expect(res.primaryIndices.ICV?.qualitative).toBe('Muy Superior');
      expect(res.ancillaryIndices.IAG?.qualitative).toBe('Muy Superior');
    });
  });

  describe('Confidence Interval Truncation & Normal Distribution Clamps', () => {
    it('truncates CI lower bound when score minus margin drops below 40', () => {
      // Score = 42, SEM = 5.0, 95% margin = 10 -> 42 - 10 = 32 -> clamped to 40
      const ci = calculateConfidenceInterval(42, 5.0, 95);
      expect(ci.lower).toBe(40);
      expect(ci.upper).toBe(52);
    });

    it('truncates CI upper bound when score plus margin exceeds 160', () => {
      // Score = 156, SEM = 4.0, 95% margin = 8 -> 156 + 8 = 164 -> clamped to 160
      const ci = calculateConfidenceInterval(156, 4.0, 95);
      expect(ci.lower).toBe(148);
      expect(ci.upper).toBe(160);
    });

    it('clamps composite percentile to 0.1 for scores <= 40', () => {
      expect(compositeToPercentile(40)).toBe(0.1);
      expect(compositeToPercentile(30)).toBe(0.1);
    });

    it('clamps composite percentile to 99.9 for scores >= 160', () => {
      expect(compositeToPercentile(160)).toBe(99.9);
      expect(compositeToPercentile(170)).toBe(99.9);
    });

    it('classifies boundaries 40 and 160 correctly in qualitative bands', () => {
      expect(getQualitativeCategory(40)).toBe('Extremadamente Bajo');
      expect(getQualitativeCategory(69)).toBe('Extremadamente Bajo');
      expect(getQualitativeCategory(70)).toBe('Limítrofe');
      expect(getQualitativeCategory(129)).toBe('Superior');
      expect(getQualitativeCategory(130)).toBe('Muy Superior');
      expect(getQualitativeCategory(160)).toBe('Muy Superior');
    });
  });
});
