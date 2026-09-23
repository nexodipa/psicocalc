import { describe, it, expect } from 'vitest';
import {
  calculateWiscV,
  validateAgeAndBattery,
} from '../../core';

describe('Tier 4 - WISC-V Real-World Benchmark Clinical Cases', () => {
  describe('Case 1: Standard Normative Average Child (Age 10y 4m)', () => {
    // Demographics: Born 2010-01-15, Evaluated 2020-05-15 (10 years, 4 months)
    const demographics = { birthDate: '2010-01-15', testDate: '2020-05-15' };
    const scores = {
      C: 10, S: 10, M: 10, D: 10, CL: 10,
      V: 10, B: 10, PV: 10, SD: 10, BS: 10,
    };

    it('validates patient age compatibility with WISC-V', () => {
      const ageCheck = validateAgeAndBattery(demographics.birthDate, demographics.testDate, 'WISC-V');
      expect(ageCheck.isValid).toBe(true);
      expect(ageCheck.years).toBe(10);
      expect(ageCheck.months).toBe(4);
    });

    it('computes 100% exact mathematical values for all 5 Primary Indices', () => {
      const res = calculateWiscV(scores);

      // ICV
      expect(res.primaryIndices.ICV?.sumScaled).toBe(20);
      expect(res.primaryIndices.ICV?.compositeScore).toBe(100);
      expect(res.primaryIndices.ICV?.percentile).toBe(50);
      expect(res.primaryIndices.ICV?.qualitative).toBe('Promedio');
      expect(res.primaryIndices.ICV?.ci95.lower).toBe(92);
      expect(res.primaryIndices.ICV?.ci95.upper).toBe(108);

      // IVE
      expect(res.primaryIndices.IVE?.sumScaled).toBe(20);
      expect(res.primaryIndices.IVE?.compositeScore).toBe(100);
      expect(res.primaryIndices.IVE?.percentile).toBe(50);
      expect(res.primaryIndices.IVE?.qualitative).toBe('Promedio');
      expect(res.primaryIndices.IVE?.ci95.lower).toBe(92);
      expect(res.primaryIndices.IVE?.ci95.upper).toBe(108);

      // IRF
      expect(res.primaryIndices.IRF?.sumScaled).toBe(20);
      expect(res.primaryIndices.IRF?.compositeScore).toBe(100);
      expect(res.primaryIndices.IRF?.percentile).toBe(50);
      expect(res.primaryIndices.IRF?.qualitative).toBe('Promedio');
      expect(res.primaryIndices.IRF?.ci95.lower).toBe(92);
      expect(res.primaryIndices.IRF?.ci95.upper).toBe(108);

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

    it('computes 100% exact Full Scale IQ (CIT-7 = 100, PR = 50, CI95 [94, 106])', () => {
      const res = calculateWiscV(scores);
      expect(res.isCompleteCit).toBe(true);
      expect(res.cit).not.toBeNull();
      expect(res.cit?.sumScaled).toBe(70);
      expect(res.cit?.compositeScore).toBe(100);
      expect(res.cit?.percentile).toBe(50);
      expect(res.cit?.qualitative).toBe('Promedio');
      expect(res.cit?.ci95.lower).toBe(94);
      expect(res.cit?.ci95.upper).toBe(106);
    });

    it('computes exact ancillary indices (IAG = 100, ICC = 100, INV = 100)', () => {
      const res = calculateWiscV(scores);
      expect(res.ancillaryIndices.IAG?.compositeScore).toBe(100);
      expect(res.ancillaryIndices.ICC?.compositeScore).toBe(100);
      expect(res.ancillaryIndices.INV?.compositeScore).toBe(100);
    });

    it('confirms flat cognitive profile with zero significant discrepancies and zero weaknesses', () => {
      const res = calculateWiscV(scores);
      expect(res.discrepancies.every((d) => d.diff === 0 && !d.isSignificant05)).toBe(true);
      expect(res.strengthsWeaknesses.every((s) => s.classification === 'Promedio')).toBe(true);
    });
  });

  describe('Case 2: High Cognitive Potential / Gifted Child (Age 8y 2m)', () => {
    const demographics = { birthDate: '2012-03-10', testDate: '2020-05-10' };
    const scores = {
      C: 16, S: 17, M: 16, D: 14, CL: 12,
      V: 18, B: 17, PV: 15, SD: 15, BS: 13,
    };

    it('validates age 8:2:0 for WISC-V', () => {
      const ageCheck = validateAgeAndBattery(demographics.birthDate, demographics.testDate, 'WISC-V');
      expect(ageCheck.isValid).toBe(true);
      expect(ageCheck.years).toBe(8);
      expect(ageCheck.months).toBe(2);
    });

    it('computes superior verbal, spatial and fluid primary indices', () => {
      const res = calculateWiscV(scores);

      // ICV: S(17) + V(18) = 35 -> 144
      expect(res.primaryIndices.ICV?.sumScaled).toBe(35);
      expect(res.primaryIndices.ICV?.compositeScore).toBe(144);
      expect(res.primaryIndices.ICV?.percentile).toBeGreaterThanOrEqual(99.5);
      expect(res.primaryIndices.ICV?.qualitative).toBe('Muy Superior');

      // IVE: C(16) + PV(15) = 31 -> 132
      expect(res.primaryIndices.IVE?.sumScaled).toBe(31);
      expect(res.primaryIndices.IVE?.compositeScore).toBe(132);
      expect(res.primaryIndices.IVE?.percentile).toBeGreaterThanOrEqual(98);
      expect(res.primaryIndices.IVE?.qualitative).toBe('Muy Superior');

      // IRF: M(16) + B(17) = 33 -> 138
      expect(res.primaryIndices.IRF?.sumScaled).toBe(33);
      expect(res.primaryIndices.IRF?.compositeScore).toBe(138);
      expect(res.primaryIndices.IRF?.percentile).toBeGreaterThanOrEqual(99);
      expect(res.primaryIndices.IRF?.qualitative).toBe('Muy Superior');

      // IMT: D(14) + SD(15) = 29 -> 124
      expect(res.primaryIndices.IMT?.sumScaled).toBe(29);
      expect(res.primaryIndices.IMT?.compositeScore).toBe(124);
      expect(res.primaryIndices.IMT?.qualitative).toBe('Superior');

      // IVP: CL(12) + BS(13) = 25 -> 114
      expect(res.primaryIndices.IVP?.sumScaled).toBe(25);
      expect(res.primaryIndices.IVP?.compositeScore).toBe(114);
      expect(res.primaryIndices.IVP?.qualitative).toBe('Promedio Alto');
    });

    it('computes Very Superior Full Scale IQ (CIT Sum = 110 -> Score = 138, PR = 99.4)', () => {
      const res = calculateWiscV(scores);
      expect(res.cit?.sumScaled).toBe(110);
      expect(res.cit?.compositeScore).toBe(138);
      expect(res.cit?.percentile).toBeGreaterThanOrEqual(99);
      expect(res.cit?.qualitative).toBe('Muy Superior');
    });

    it('computes IAG = 145 (General Ability Index)', () => {
      const res = calculateWiscV(scores);
      expect(res.ancillaryIndices.IAG?.sumScaled).toBe(84);
      expect(res.ancillaryIndices.IAG?.compositeScore).toBe(145);
      expect(res.ancillaryIndices.IAG?.percentile).toBeGreaterThanOrEqual(99.8);
      expect(res.ancillaryIndices.IAG?.qualitative).toBe('Muy Superior');
    });

    it('identifies significant verbal vs speed discrepancy (ICV 144 vs IVP 114, diff = +30, p < .01)', () => {
      const res = calculateWiscV(scores);
      const pair = res.discrepancies.find(
        (d) => (d.pair[0] === 'ICV' && d.pair[1] === 'IVP') || (d.pair[0] === 'IVP' && d.pair[1] === 'ICV')
      );
      expect(pair).toBeDefined();
      expect(Math.abs(pair!.diff)).toBe(30);
      expect(pair!.isSignificant05).toBe(true);
      expect(pair!.isSignificant01).toBe(true);
    });
  });

  describe('Case 3: ADHD / Specific Learning Disorder Profile (Age 12y 6m)', () => {
    const demographics = { birthDate: '2007-11-01', testDate: '2020-05-01' };
    const scores = {
      C: 11, S: 13, M: 12, D: 6, CL: 5,
      V: 12, B: 11, PV: 10, SD: 7, BS: 6,
    };

    it('validates age 12:6:0 for WISC-V', () => {
      const ageCheck = validateAgeAndBattery(demographics.birthDate, demographics.testDate, 'WISC-V');
      expect(ageCheck.isValid).toBe(true);
      expect(ageCheck.years).toBe(12);
      expect(ageCheck.months).toBe(6);
    });

    it('computes preserved verbal/fluid reasoning with impaired working memory and speed', () => {
      const res = calculateWiscV(scores);

      // ICV: S(13) + V(12) = 25 -> 114 (Promedio Alto)
      expect(res.primaryIndices.ICV?.compositeScore).toBe(114);
      expect(res.primaryIndices.ICV?.qualitative).toBe('Promedio Alto');

      // IVE: C(11) + PV(10) = 21 -> 103 (Promedio)
      expect(res.primaryIndices.IVE?.compositeScore).toBe(103);
      expect(res.primaryIndices.IVE?.qualitative).toBe('Promedio');

      // IRF: M(12) + B(11) = 23 -> 108 (Promedio)
      expect(res.primaryIndices.IRF?.compositeScore).toBe(108);

      // IMT: D(6) + SD(7) = 13 -> 80 (Promedio Bajo)
      expect(res.primaryIndices.IMT?.compositeScore).toBe(80);
      expect(res.primaryIndices.IMT?.qualitative).toBe('Promedio Bajo');

      // IVP: CL(5) + BS(6) = 11 -> 76 (Limítrofe)
      expect(res.primaryIndices.IVP?.compositeScore).toBe(76);
      expect(res.primaryIndices.IVP?.qualitative).toBe('Limítrofe');
    });

    it('computes CIT = 100 while IAG is 111 and ICC is 72 (Profound Cognitive Competency Dissociation)', () => {
      const res = calculateWiscV(scores);
      expect(res.cit?.compositeScore).toBe(100);
      expect(res.ancillaryIndices.IAG?.compositeScore).toBe(111);
      expect(res.ancillaryIndices.ICC?.compositeScore).toBe(72);

      // IAG - ICC dissociation: 111 - 72 = 39 points
      const diffGaiCpi = res.ancillaryIndices.IAG!.compositeScore - res.ancillaryIndices.ICC!.compositeScore;
      expect(diffGaiCpi).toBe(39);
    });

    it('flags Claves (CL=5) and Dígitos (D=6) as relative weaknesses in ipsative analysis', () => {
      const res = calculateWiscV(scores);
      const weaknesses = res.strengthsWeaknesses.filter((r) => r.classification === 'Debilidad');
      const weakSubtests = weaknesses.map((w) => w.subtestId);
      expect(weakSubtests).toContain('CL');
      expect(weakSubtests).toContain('D');
    });

    it('flags highly significant verbal vs processing speed discrepancy (diff = 38, p < .01)', () => {
      const res = calculateWiscV(scores);
      const pair = res.discrepancies.find(
        (d) => (d.pair[0] === 'ICV' && d.pair[1] === 'IVP') || (d.pair[0] === 'IVP' && d.pair[1] === 'ICV')
      );
      expect(pair).toBeDefined();
      expect(Math.abs(pair!.diff)).toBe(38);
      expect(pair!.isSignificant01).toBe(true);
    });
  });
});
