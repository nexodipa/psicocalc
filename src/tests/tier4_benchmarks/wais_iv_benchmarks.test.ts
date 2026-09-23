import { describe, it, expect } from 'vitest';
import {
  calculateWaisIV,
  validateAgeAndBattery,
} from '../../core';

describe('Tier 4 - WAIS-IV Real-World Benchmark Clinical Cases', () => {
  describe('Case 4: Standard Healthy Adult (Age 25y 0m)', () => {
    const demographics = { birthDate: '1995-01-15', testDate: '2020-01-15' };
    const scores = {
      BD: 10, SI: 10, DS: 10, MR: 10, VC: 10,
      AR: 10, SS: 10, VP: 10, IN: 10, CD: 10,
    };

    it('validates patient age compatibility with WAIS-IV', () => {
      const ageCheck = validateAgeAndBattery(demographics.birthDate, demographics.testDate, 'WAIS-IV');
      expect(ageCheck.isValid).toBe(true);
      expect(ageCheck.years).toBe(25);
      expect(ageCheck.months).toBe(0);
    });

    it('computes 100% exact mathematical values for all 4 Primary Indices', () => {
      const res = calculateWaisIV(scores);

      // ICV
      expect(res.primaryIndices.ICV?.sumScaled).toBe(30);
      expect(res.primaryIndices.ICV?.compositeScore).toBe(100);
      expect(res.primaryIndices.ICV?.percentile).toBe(50);
      expect(res.primaryIndices.ICV?.qualitative).toBe('Promedio');
      expect(res.primaryIndices.ICV?.ci95.lower).toBe(93);
      expect(res.primaryIndices.ICV?.ci95.upper).toBe(107);

      // IRP
      expect(res.primaryIndices.IRP?.sumScaled).toBe(30);
      expect(res.primaryIndices.IRP?.compositeScore).toBe(100);
      expect(res.primaryIndices.IRP?.percentile).toBe(50);
      expect(res.primaryIndices.IRP?.qualitative).toBe('Promedio');
      expect(res.primaryIndices.IRP?.ci95.lower).toBe(92);
      expect(res.primaryIndices.IRP?.ci95.upper).toBe(108);

      // IMT
      expect(res.primaryIndices.IMT?.sumScaled).toBe(20);
      expect(res.primaryIndices.IMT?.compositeScore).toBe(100);
      expect(res.primaryIndices.IMT?.percentile).toBe(50);
      expect(res.primaryIndices.IMT?.qualitative).toBe('Promedio');
      expect(res.primaryIndices.IMT?.ci95.lower).toBe(91);
      expect(res.primaryIndices.IMT?.ci95.upper).toBe(109);

      // IVP
      expect(res.primaryIndices.IVP?.sumScaled).toBe(20);
      expect(res.primaryIndices.IVP?.compositeScore).toBe(100);
      expect(res.primaryIndices.IVP?.percentile).toBe(50);
      expect(res.primaryIndices.IVP?.qualitative).toBe('Promedio');
      expect(res.primaryIndices.IVP?.ci95.lower).toBe(90);
      expect(res.primaryIndices.IVP?.ci95.upper).toBe(110);
    });

    it('computes 100% exact Full Scale IQ (CIT-10 = 100, PR = 50, CI95 [95, 105])', () => {
      const res = calculateWaisIV(scores);
      expect(res.isCompleteCit).toBe(true);
      expect(res.cit).not.toBeNull();
      expect(res.cit?.sumScaled).toBe(100);
      expect(res.cit?.compositeScore).toBe(100);
      expect(res.cit?.percentile).toBe(50);
      expect(res.cit?.qualitative).toBe('Promedio');
      expect(res.cit?.ci95.lower).toBe(95);
      expect(res.cit?.ci95.upper).toBe(105);
    });

    it('computes exact ancillary indices (IAG = 100, ICC = 100)', () => {
      const res = calculateWaisIV(scores);
      expect(res.ancillaryIndices.IAG?.compositeScore).toBe(100);
      expect(res.ancillaryIndices.ICC?.compositeScore).toBe(100);
    });

    it('confirms homogeneous profile with zero significant discrepancies', () => {
      const res = calculateWaisIV(scores);
      expect(res.discrepancies).toHaveLength(6);
      expect(res.discrepancies.every((d) => d.diff === 0 && !d.isSignificant05)).toBe(true);
    });
  });

  describe('Case 5: Superior Professional (Age 42y 5m)', () => {
    const demographics = { birthDate: '1977-12-10', testDate: '2020-05-10' };
    const scores = {
      BD: 14, SI: 16, DS: 15, MR: 15, VC: 16,
      AR: 14, SS: 13, VP: 14, IN: 15, CD: 13,
    };

    it('validates patient age 42:5:0 for WAIS-IV', () => {
      const ageCheck = validateAgeAndBattery(demographics.birthDate, demographics.testDate, 'WAIS-IV');
      expect(ageCheck.isValid).toBe(true);
      expect(ageCheck.years).toBe(42);
      expect(ageCheck.months).toBe(5);
    });

    it('computes Very Superior verbal and Superior perceptual/working memory indices', () => {
      const res = calculateWaisIV(scores);

      // ICV: SI(16) + VC(16) + IN(15) = 47 -> 132
      expect(res.primaryIndices.ICV?.sumScaled).toBe(47);
      expect(res.primaryIndices.ICV?.compositeScore).toBe(132);
      expect(res.primaryIndices.ICV?.percentile).toBe(98);
      expect(res.primaryIndices.ICV?.qualitative).toBe('Muy Superior');

      // IRP: BD(14) + MR(15) + VP(14) = 43 -> 125
      expect(res.primaryIndices.IRP?.sumScaled).toBe(43);
      expect(res.primaryIndices.IRP?.compositeScore).toBe(125);
      expect(res.primaryIndices.IRP?.percentile).toBe(95);
      expect(res.primaryIndices.IRP?.qualitative).toBe('Superior');

      // IMT: DS(15) + AR(14) = 29 -> 125
      expect(res.primaryIndices.IMT?.sumScaled).toBe(29);
      expect(res.primaryIndices.IMT?.compositeScore).toBe(125);
      expect(res.primaryIndices.IMT?.percentile).toBe(95);
      expect(res.primaryIndices.IMT?.qualitative).toBe('Superior');

      // IVP: SS(13) + CD(13) = 26 -> 117
      expect(res.primaryIndices.IVP?.sumScaled).toBe(26);
      expect(res.primaryIndices.IVP?.compositeScore).toBe(117);
      expect(res.primaryIndices.IVP?.percentile).toBe(87);
      expect(res.primaryIndices.IVP?.qualitative).toBe('Promedio Alto');
    });

    it('computes Superior Full Scale IQ (CIT Sum = 145 -> Score = 129, PR = 97)', () => {
      const res = calculateWaisIV(scores);
      expect(res.cit?.sumScaled).toBe(145);
      expect(res.cit?.compositeScore).toBe(129);
      expect(res.cit?.percentile).toBe(97);
      expect(res.cit?.qualitative).toBe('Superior');
    });

    it('computes IAG = 131 (General Ability Index in Muy Superior range)', () => {
      const res = calculateWaisIV(scores);
      expect(res.ancillaryIndices.IAG?.sumScaled).toBe(90);
      expect(res.ancillaryIndices.IAG?.compositeScore).toBe(131);
      expect(res.ancillaryIndices.IAG?.percentile).toBe(98);
      expect(res.ancillaryIndices.IAG?.qualitative).toBe('Muy Superior');
    });

    it('identifies verbal vs speed difference (ICV 132 vs IVP 117, diff = +15, p < .05)', () => {
      const res = calculateWaisIV(scores);
      const pair = res.discrepancies.find(
        (d) => (d.pair[0] === 'ICV' && d.pair[1] === 'IVP') || (d.pair[0] === 'IVP' && d.pair[1] === 'ICV')
      );
      expect(pair).toBeDefined();
      expect(Math.abs(pair!.diff)).toBe(15);
      expect(pair!.isSignificant05).toBe(true);
    });
  });

  describe('Case 6: Traumatic Brain Injury / Neurocognitive Impairment (Age 68y 3m)', () => {
    const demographics = { birthDate: '1952-02-15', testDate: '2020-05-15' };
    const scores = {
      BD: 6, SI: 10, DS: 5, MR: 7, VC: 12,
      AR: 6, SS: 4, VP: 6, IN: 11, CD: 3,
    };

    it('validates patient age 68:3:0 for WAIS-IV', () => {
      const ageCheck = validateAgeAndBattery(demographics.birthDate, demographics.testDate, 'WAIS-IV');
      expect(ageCheck.isValid).toBe(true);
      expect(ageCheck.years).toBe(68);
      expect(ageCheck.months).toBe(3);
    });

    it('computes preserved verbal comprehension with impaired fluid, memory and processing speed', () => {
      const res = calculateWaisIV(scores);

      // ICV: SI(10) + VC(12) + IN(11) = 33 -> 106 (Promedio)
      expect(res.primaryIndices.ICV?.sumScaled).toBe(33);
      expect(res.primaryIndices.ICV?.compositeScore).toBe(106);
      expect(res.primaryIndices.ICV?.percentile).toBe(66);
      expect(res.primaryIndices.ICV?.qualitative).toBe('Promedio');

      // IRP: BD(6) + MR(7) + VP(6) = 19 -> 79 (Limítrofe)
      expect(res.primaryIndices.IRP?.sumScaled).toBe(19);
      expect(res.primaryIndices.IRP?.compositeScore).toBe(79);
      expect(res.primaryIndices.IRP?.percentile).toBe(8);
      expect(res.primaryIndices.IRP?.qualitative).toBe('Limítrofe');

      // IMT: DS(5) + AR(6) = 11 -> 74 (Limítrofe)
      expect(res.primaryIndices.IMT?.sumScaled).toBe(11);
      expect(res.primaryIndices.IMT?.compositeScore).toBe(74);
      expect(res.primaryIndices.IMT?.percentile).toBe(4);
      expect(res.primaryIndices.IMT?.qualitative).toBe('Limítrofe');

      // IVP: SS(4) + CD(3) = 7 -> 65 (Extremadamente Bajo)
      expect(res.primaryIndices.IVP?.sumScaled).toBe(7);
      expect(res.primaryIndices.IVP?.compositeScore).toBe(65);
      expect(res.primaryIndices.IVP?.percentile).toBe(1);
      expect(res.primaryIndices.IVP?.qualitative).toBe('Extremadamente Bajo');
    });

    it('computes Borderline Full Scale IQ (CIT Sum = 70 -> Score = 77, PR = 6)', () => {
      const res = calculateWaisIV(scores);
      expect(res.cit?.sumScaled).toBe(70);
      expect(res.cit?.compositeScore).toBe(77);
      expect(res.cit?.percentile).toBe(6);
      expect(res.cit?.qualitative).toBe('Limítrofe');
    });

    it('computes IAG = 90 (Preserved general cognitive potential despite acquired deficits)', () => {
      const res = calculateWaisIV(scores);
      expect(res.ancillaryIndices.IAG?.sumScaled).toBe(52);
      expect(res.ancillaryIndices.IAG?.compositeScore).toBe(90);
      expect(res.ancillaryIndices.IAG?.percentile).toBe(25);
      expect(res.ancillaryIndices.IAG?.qualitative).toBe('Promedio');
    });

    it('identifies massive crystallized verbal vs speed dissociation (ICV 106 vs IVP 65, diff = +41, p < .001)', () => {
      const res = calculateWaisIV(scores);
      const pair = res.discrepancies.find(
        (d) => (d.pair[0] === 'ICV' && d.pair[1] === 'IVP') || (d.pair[0] === 'IVP' && d.pair[1] === 'ICV')
      );
      expect(pair).toBeDefined();
      expect(Math.abs(pair!.diff)).toBe(41);
      expect(pair!.isSignificant05).toBe(true);
      expect(pair!.isSignificant01).toBe(true);
      expect(pair!.baseRateDesc).toContain('< 1.5%');
    });

    it('identifies processing speed subtests as personal relative weaknesses', () => {
      const res = calculateWaisIV(scores);
      const weaknesses = res.strengthsWeaknesses.filter((r) => r.classification === 'Debilidad');
      const weakIds = weaknesses.map((w) => w.subtestId);
      expect(weakIds).toContain('WAIS_CN');
      expect(weakIds).toContain('WAIS_BS');
    });
  });
});
