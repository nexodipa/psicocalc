import { describe, it, expect } from 'vitest';
import {
  calculateWiscV,
  validateScaledScore,
  WISC_V_SUBTESTS,
  WISC_V_PRIMARY_INDICES,
  WISC_V_CIT_META,
  WISC_V_ANCILLARY_INDICES,
  wiscPrimarySumToComposite,
  wiscCitSumToComposite,
  compositeToPercentile,
  calculateBothConfidenceIntervals,
  getQualitativeCategory,
  WiscSubtestId,
} from '../../core';

describe('Tier 1 - WISC-V Subtests & Index Conversions', () => {
  describe('WISC-V 10 Primary Subtests Validation & Metadata', () => {
    const primarySubtests: WiscSubtestId[] = ['S', 'V', 'C', 'PV', 'M', 'B', 'D', 'SD', 'CL', 'BS'];

    it('verifies all 10 primary subtests exist in WISC_V_SUBTESTS metadata', () => {
      expect(primarySubtests).toHaveLength(10);
      for (const id of primarySubtests) {
        expect(WISC_V_SUBTESTS[id]).toBeDefined();
        expect(WISC_V_SUBTESTS[id].isPrimary).toBe(true);
      }
    });

    it('verifies the 7 fundamental core subtests contributing to CIT-7', () => {
      const coreCit = primarySubtests.filter((id) => WISC_V_SUBTESTS[id].isCoreCit);
      expect(coreCit).toHaveLength(7);
      expect(coreCit).toEqual(expect.arrayContaining(['S', 'V', 'C', 'M', 'B', 'D', 'CL']));
      expect(WISC_V_CIT_META.coreSubtests).toEqual(['S', 'V', 'C', 'M', 'B', 'D', 'CL']);
    });

    it('verifies the 3 primary subtests that do NOT contribute directly to CIT-7', () => {
      const nonCitPrimaries = primarySubtests.filter((id) => !WISC_V_SUBTESTS[id].isCoreCit);
      expect(nonCitPrimaries).toHaveLength(3);
      expect(nonCitPrimaries).toEqual(expect.arrayContaining(['PV', 'SD', 'BS']));
    });

    it('validates each primary subtest accepts valid scaled scores in [1..19]', () => {
      for (const id of primarySubtests) {
        const checkLow = validateScaledScore(1);
        const checkMid = validateScaledScore(10);
        const checkHigh = validateScaledScore(19);
        expect(checkLow.isValid).toBe(true);
        expect(checkMid.isValid).toBe(true);
        expect(checkHigh.isValid).toBe(true);
      }
    });

    it('validates each primary subtest rejects scores outside [1..19]', () => {
      for (const id of primarySubtests) {
        const checkZero = validateScaledScore(0);
        const checkAbove = validateScaledScore(20);
        expect(checkZero.isValid).toBe(false);
        expect(checkAbove.isValid).toBe(false);
      }
    });
  });

  describe('WISC-V 5 Secondary Subtests Validation & Metadata', () => {
    const secondarySubtests: WiscSubtestId[] = ['I', 'CO', 'A', 'LN', 'CA'];

    it('verifies all 5 secondary subtests exist and are marked as non-primary', () => {
      expect(secondarySubtests).toHaveLength(5);
      for (const id of secondarySubtests) {
        expect(WISC_V_SUBTESTS[id]).toBeDefined();
        expect(WISC_V_SUBTESTS[id].isPrimary).toBe(false);
        expect(WISC_V_SUBTESTS[id].isCoreCit).toBe(false);
      }
    });

    it('validates secondary subtest max raw score specifications', () => {
      expect(WISC_V_SUBTESTS['I'].maxRawScore).toBe(31);
      expect(WISC_V_SUBTESTS['CO'].maxRawScore).toBe(38);
      expect(WISC_V_SUBTESTS['A'].maxRawScore).toBe(34);
      expect(WISC_V_SUBTESTS['LN'].maxRawScore).toBe(30);
      expect(WISC_V_SUBTESTS['CA'].maxRawScore).toBe(128);
    });

    it('accepts valid scaled scores [1..19] for secondary subtests', () => {
      for (const id of secondarySubtests) {
        expect(validateScaledScore(5).isValid).toBe(true);
        expect(validateScaledScore(15).isValid).toBe(true);
      }
    });

    it('rejects invalid scores for secondary subtests', () => {
      for (const id of secondarySubtests) {
        expect(validateScaledScore(-1).isValid).toBe(false);
        expect(validateScaledScore(25).isValid).toBe(false);
      }
    });

    it('confirms secondary subtests map to their respective cognitive domains', () => {
      expect(WISC_V_SUBTESTS['I'].index).toBe('ICV');
      expect(WISC_V_SUBTESTS['CO'].index).toBe('ICV');
      expect(WISC_V_SUBTESTS['A'].index).toBe('IRC');
      expect(WISC_V_SUBTESTS['LN'].index).toBe('IMTA');
      expect(WISC_V_SUBTESTS['CA'].index).toBe('IVP');
    });
  });

  describe('WISC-V Primary Index - ICV (Semejanzas + Vocabulario)', () => {
    it('calculates normative average (S=10, V=10 -> Sum=20 -> ICV=100, PR=50, Promedio)', () => {
      const res = calculateWiscV({ S: 10, V: 10 });
      const icv = res.primaryIndices.ICV;
      expect(icv).not.toBeNull();
      expect(icv?.sumScaled).toBe(20);
      expect(icv?.compositeScore).toBe(100);
      expect(icv?.percentile).toBe(50);
      expect(icv?.qualitative).toBe('Promedio');
      expect(icv?.ci95.lower).toBeLessThanOrEqual(100);
      expect(icv?.ci95.upper).toBeGreaterThanOrEqual(100);
    });

    it('calculates superior verbal comprehension (S=16, V=15 -> Sum=31 -> ICV=131, Muy Superior)', () => {
      const res = calculateWiscV({ S: 16, V: 15 });
      const icv = res.primaryIndices.ICV;
      expect(icv).not.toBeNull();
      expect(icv?.sumScaled).toBe(31);
      expect(icv?.compositeScore).toBe(131);
      expect(icv?.percentile).toBeGreaterThanOrEqual(98);
      expect(icv?.qualitative).toBe('Muy Superior');
    });

    it('calculates below average verbal comprehension (S=7, V=7 -> Sum=14 -> ICV=84, Promedio Bajo)', () => {
      const res = calculateWiscV({ S: 7, V: 7 });
      const icv = res.primaryIndices.ICV;
      expect(icv).not.toBeNull();
      expect(icv?.sumScaled).toBe(14);
      expect(icv?.compositeScore).toBe(84);
      expect(icv?.percentile).toBeLessThan(25);
      expect(icv?.qualitative).toBe('Promedio Bajo');
    });

    it('calculates high average verbal comprehension (S=13, V=12 -> Sum=25 -> ICV=114, Promedio Alto)', () => {
      const res = calculateWiscV({ S: 13, V: 12 });
      const icv = res.primaryIndices.ICV;
      expect(icv).not.toBeNull();
      expect(icv?.sumScaled).toBe(25);
      expect(icv?.compositeScore).toBe(114);
      expect(icv?.percentile).toBe(82);
      expect(icv?.qualitative).toBe('Promedio Alto');
    });

    it('returns null for ICV when constituent subtest is missing', () => {
      const res1 = calculateWiscV({ S: 10 });
      const res2 = calculateWiscV({ V: 10 });
      expect(res1.primaryIndices.ICV).toBeNull();
      expect(res2.primaryIndices.ICV).toBeNull();
    });
  });

  describe('WISC-V Primary Index - IVE (Cubos + Puzles Visuales)', () => {
    it('calculates normative average (C=10, PV=10 -> Sum=20 -> IVE=100, PR=50, Promedio)', () => {
      const res = calculateWiscV({ C: 10, PV: 10 });
      const ive = res.primaryIndices.IVE;
      expect(ive).not.toBeNull();
      expect(ive?.sumScaled).toBe(20);
      expect(ive?.compositeScore).toBe(100);
      expect(ive?.percentile).toBe(50);
      expect(ive?.qualitative).toBe('Promedio');
    });

    it('calculates very high visual spatial (C=15, PV=16 -> Sum=31 -> IVE=132, Muy Superior)', () => {
      const res = calculateWiscV({ C: 15, PV: 16 });
      const ive = res.primaryIndices.IVE;
      expect(ive).not.toBeNull();
      expect(ive?.sumScaled).toBe(31);
      expect(ive?.compositeScore).toBe(132);
      expect(ive?.percentile).toBeGreaterThanOrEqual(98);
      expect(ive?.qualitative).toBe('Muy Superior');
    });

    it('calculates average visual spatial (C=11, PV=10 -> Sum=21 -> IVE=103, Promedio)', () => {
      const res = calculateWiscV({ C: 11, PV: 10 });
      const ive = res.primaryIndices.IVE;
      expect(ive).not.toBeNull();
      expect(ive?.sumScaled).toBe(21);
      expect(ive?.compositeScore).toBe(103);
      expect(ive?.qualitative).toBe('Promedio');
    });

    it('calculates low visual spatial (C=5, PV=6 -> Sum=11 -> IVE=76, Limítrofe)', () => {
      const res = calculateWiscV({ C: 5, PV: 6 });
      const ive = res.primaryIndices.IVE;
      expect(ive).not.toBeNull();
      expect(ive?.sumScaled).toBe(11);
      expect(ive?.compositeScore).toBe(76);
      expect(ive?.qualitative).toBe('Limítrofe');
    });

    it('returns null for IVE when one subtest is missing', () => {
      const res = calculateWiscV({ C: 10 });
      expect(res.primaryIndices.IVE).toBeNull();
    });
  });

  describe('WISC-V Primary Index - IRF (Matrices + Balanzas)', () => {
    it('calculates normative average (M=10, B=10 -> Sum=20 -> IRF=100, PR=50, Promedio)', () => {
      const res = calculateWiscV({ M: 10, B: 10 });
      const irf = res.primaryIndices.IRF;
      expect(irf).not.toBeNull();
      expect(irf?.sumScaled).toBe(20);
      expect(irf?.compositeScore).toBe(100);
      expect(irf?.percentile).toBe(50);
      expect(irf?.qualitative).toBe('Promedio');
    });

    it('calculates superior fluid reasoning (M=14, B=15 -> Sum=29 -> IRF=126, Superior)', () => {
      const res = calculateWiscV({ M: 14, B: 15 });
      const irf = res.primaryIndices.IRF;
      expect(irf).not.toBeNull();
      expect(irf?.sumScaled).toBe(29);
      expect(irf?.compositeScore).toBe(126);
      expect(irf?.percentile).toBe(96);
      expect(irf?.qualitative).toBe('Superior');
    });

    it('calculates very superior fluid reasoning (M=16, B=17 -> Sum=33 -> IRF=138, Muy Superior)', () => {
      const res = calculateWiscV({ M: 16, B: 17 });
      const irf = res.primaryIndices.IRF;
      expect(irf).not.toBeNull();
      expect(irf?.sumScaled).toBe(33);
      expect(irf?.compositeScore).toBe(138);
      expect(irf?.percentile).toBeGreaterThanOrEqual(99);
      expect(irf?.qualitative).toBe('Muy Superior');
    });

    it('calculates average fluid reasoning (M=12, B=11 -> Sum=23 -> IRF=108, Promedio)', () => {
      const res = calculateWiscV({ M: 12, B: 11 });
      const irf = res.primaryIndices.IRF;
      expect(irf).not.toBeNull();
      expect(irf?.sumScaled).toBe(23);
      expect(irf?.compositeScore).toBe(108);
      expect(irf?.qualitative).toBe('Promedio');
    });

    it('returns null for IRF when constituent subtest is missing', () => {
      const res = calculateWiscV({ M: 12 });
      expect(res.primaryIndices.IRF).toBeNull();
    });
  });

  describe('WISC-V Primary Index - IMT (Dígitos + Span de Dibujos)', () => {
    it('calculates normative average (D=10, SD=10 -> Sum=20 -> IMT=100, PR=50, Promedio)', () => {
      const res = calculateWiscV({ D: 10, SD: 10 });
      const imt = res.primaryIndices.IMT;
      expect(imt).not.toBeNull();
      expect(imt?.sumScaled).toBe(20);
      expect(imt?.compositeScore).toBe(100);
      expect(imt?.percentile).toBe(50);
      expect(imt?.qualitative).toBe('Promedio');
    });

    it('calculates high average working memory (D=13, SD=12 -> Sum=25 -> IMT=114, Promedio Alto)', () => {
      const res = calculateWiscV({ D: 13, SD: 12 });
      const imt = res.primaryIndices.IMT;
      expect(imt).not.toBeNull();
      expect(imt?.sumScaled).toBe(25);
      expect(imt?.compositeScore).toBe(114);
      expect(imt?.percentile).toBe(82);
      expect(imt?.qualitative).toBe('Promedio Alto');
    });

    it('calculates low working memory (D=6, SD=7 -> Sum=13 -> IMT=80, Promedio Bajo)', () => {
      const res = calculateWiscV({ D: 6, SD: 7 });
      const imt = res.primaryIndices.IMT;
      expect(imt).not.toBeNull();
      expect(imt?.sumScaled).toBe(13);
      expect(imt?.compositeScore).toBe(80);
      expect(imt?.percentile).toBe(9);
      expect(imt?.qualitative).toBe('Promedio Bajo');
    });

    it('calculates superior working memory (D=14, SD=15 -> Sum=29 -> IMT=124, Superior)', () => {
      const res = calculateWiscV({ D: 14, SD: 15 });
      const imt = res.primaryIndices.IMT;
      expect(imt).not.toBeNull();
      expect(imt?.sumScaled).toBe(29);
      expect(imt?.compositeScore).toBe(124);
      expect(imt?.percentile).toBe(95);
      expect(imt?.qualitative).toBe('Superior');
    });

    it('returns null for IMT when one subtest is missing', () => {
      const res = calculateWiscV({ SD: 10 });
      expect(res.primaryIndices.IMT).toBeNull();
    });
  });

  describe('WISC-V Primary Index - IVP (Claves + Búsqueda de Símbolos)', () => {
    it('calculates normative average (CL=10, BS=10 -> Sum=20 -> IVP=100, PR=50, Promedio)', () => {
      const res = calculateWiscV({ CL: 10, BS: 10 });
      const ivp = res.primaryIndices.IVP;
      expect(ivp).not.toBeNull();
      expect(ivp?.sumScaled).toBe(20);
      expect(ivp?.compositeScore).toBe(100);
      expect(ivp?.percentile).toBe(50);
      expect(ivp?.qualitative).toBe('Promedio');
    });

    it('calculates average processing speed (CL=12, BS=11 -> Sum=23 -> IVP=109, Promedio)', () => {
      const res = calculateWiscV({ CL: 12, BS: 11 });
      const ivp = res.primaryIndices.IVP;
      expect(ivp).not.toBeNull();
      expect(ivp?.sumScaled).toBe(23);
      expect(ivp?.compositeScore).toBe(109);
      expect(ivp?.percentile).toBe(73);
      expect(ivp?.qualitative).toBe('Promedio');
    });

    it('calculates borderline processing speed (CL=5, BS=6 -> Sum=11 -> IVP=76, Limítrofe)', () => {
      const res = calculateWiscV({ CL: 5, BS: 6 });
      const ivp = res.primaryIndices.IVP;
      expect(ivp).not.toBeNull();
      expect(ivp?.sumScaled).toBe(11);
      expect(ivp?.compositeScore).toBe(76);
      expect(ivp?.percentile).toBe(5);
      expect(ivp?.qualitative).toBe('Limítrofe');
    });

    it('calculates high average processing speed (CL=12, BS=13 -> Sum=25 -> IVP=114, Promedio Alto)', () => {
      const res = calculateWiscV({ CL: 12, BS: 13 });
      const ivp = res.primaryIndices.IVP;
      expect(ivp).not.toBeNull();
      expect(ivp?.sumScaled).toBe(25);
      expect(ivp?.compositeScore).toBe(114);
      expect(ivp?.percentile).toBe(82);
      expect(ivp?.qualitative).toBe('Promedio Alto');
    });

    it('returns null for IVP when one subtest is missing', () => {
      const res = calculateWiscV({ CL: 12 });
      expect(res.primaryIndices.IVP).toBeNull();
    });
  });

  describe('WISC-V Full Scale IQ (CIT-7)', () => {
    it('calculates exact normative median (Sum=70 from S,V,C,M,B,D,CL all 10 -> CIT=100, PR=50, Promedio)', () => {
      const res = calculateWiscV({
        S: 10, V: 10, C: 10, M: 10, B: 10, D: 10, CL: 10,
      });
      expect(res.isCompleteCit).toBe(true);
      expect(res.cit).not.toBeNull();
      expect(res.cit?.sumScaled).toBe(70);
      expect(res.cit?.compositeScore).toBe(100);
      expect(res.cit?.percentile).toBe(50);
      expect(res.cit?.qualitative).toBe('Promedio');
      expect(res.cit?.ci95.lower).toBe(94);
      expect(res.cit?.ci95.upper).toBe(106);
    });

    it('calculates superior CIT (Sum=100 -> CIT=129 o 130, PR=97-98)', () => {
      const res = calculateWiscV({
        S: 16, V: 15, C: 15, M: 14, B: 15, D: 13, CL: 12,
      });
      expect(res.isCompleteCit).toBe(true);
      expect(res.cit).not.toBeNull();
      expect(res.cit?.sumScaled).toBe(100);
      expect(res.cit?.compositeScore).toBeGreaterThanOrEqual(129);
      expect(res.cit?.compositeScore).toBeLessThanOrEqual(130);
      expect(res.cit?.percentile).toBeGreaterThanOrEqual(97);
    });

    it('calculates below average CIT (Sum=56, all 8s -> CIT=86, Promedio Bajo)', () => {
      const res = calculateWiscV({
        S: 8, V: 8, C: 8, M: 8, B: 8, D: 8, CL: 8,
      });
      expect(res.isCompleteCit).toBe(true);
      expect(res.cit?.sumScaled).toBe(56);
      expect(res.cit?.compositeScore).toBe(86);
      expect(res.cit?.qualitative).toBe('Promedio Bajo');
    });

    it('returns null CIT and isCompleteCit false when only 6 core subtests are provided without substitution', () => {
      const res = calculateWiscV({
        S: 10, V: 10, C: 10, M: 10, B: 10, D: 10, // CL missing
      });
      expect(res.isCompleteCit).toBe(false);
      expect(res.cit).toBeNull();
    });

    it('calculates CIT successfully with single permissible substitution (LN for D)', () => {
      const res = calculateWiscV({
        S: 10, V: 10, C: 10, M: 10, B: 10, CL: 10, // D missing
        LN: 10, // Substitute
      });
      expect(res.isCompleteCit).toBe(true);
      expect(res.cit).not.toBeNull();
      expect(res.cit?.sumScaled).toBe(70);
      expect(res.cit?.compositeScore).toBe(100);
    });
  });

  describe('WISC-V Ancillary Indices (IAG, ICC, INV)', () => {
    it('calculates normative average for IAG (S, V, C, M, B all 10 -> Sum=50 -> IAG=100, PR=50)', () => {
      const res = calculateWiscV({ S: 10, V: 10, C: 10, M: 10, B: 10 });
      expect(res.ancillaryIndices.IAG).not.toBeNull();
      expect(res.ancillaryIndices.IAG?.sumScaled).toBe(50);
      expect(res.ancillaryIndices.IAG?.compositeScore).toBe(100);
      expect(res.ancillaryIndices.IAG?.percentile).toBe(50);
      expect(res.ancillaryIndices.IAG?.qualitative).toBe('Promedio');
    });

    it('calculates normative average for ICC (D, SD, CL, BS all 10 -> Sum=40 -> ICC=100, PR=50)', () => {
      const res = calculateWiscV({ D: 10, SD: 10, CL: 10, BS: 10 });
      expect(res.ancillaryIndices.ICC).not.toBeNull();
      expect(res.ancillaryIndices.ICC?.sumScaled).toBe(40);
      expect(res.ancillaryIndices.ICC?.compositeScore).toBe(100);
      expect(res.ancillaryIndices.ICC?.percentile).toBe(50);
      expect(res.ancillaryIndices.ICC?.qualitative).toBe('Promedio');
    });

    it('calculates normative average for INV (C, PV, M, B, SD, CL all 10 -> Sum=60 -> INV=100, PR=50)', () => {
      const res = calculateWiscV({ C: 10, PV: 10, M: 10, B: 10, SD: 10, CL: 10 });
      expect(res.ancillaryIndices.INV).not.toBeNull();
      expect(res.ancillaryIndices.INV?.sumScaled).toBe(60);
      expect(res.ancillaryIndices.INV?.compositeScore).toBe(100);
      expect(res.ancillaryIndices.INV?.percentile).toBe(50);
      expect(res.ancillaryIndices.INV?.qualitative).toBe('Promedio');
    });

    it('calculates superior IAG with high core scores', () => {
      const res = calculateWiscV({ S: 17, V: 18, C: 16, M: 16, B: 17 });
      expect(res.ancillaryIndices.IAG).not.toBeNull();
      expect(res.ancillaryIndices.IAG?.sumScaled).toBe(84);
      expect(res.ancillaryIndices.IAG?.compositeScore).toBe(145);
      expect(res.ancillaryIndices.IAG?.qualitative).toBe('Muy Superior');
    });

    it('returns null ancillary index when any constituent subtest is missing', () => {
      const res = calculateWiscV({ S: 10, V: 10, C: 10, M: 10 }); // B missing for IAG
      expect(res.ancillaryIndices.IAG).toBeNull();
    });

    it('calculates normative average for IRC (B=10, A=10 -> Sum=20 -> IRC=100, PR=50)', () => {
      const res = calculateWiscV({ B: 10, A: 10 });
      expect(res.ancillaryIndices.IRC).not.toBeNull();
      expect(res.ancillaryIndices.IRC?.sumScaled).toBe(20);
      expect(res.ancillaryIndices.IRC?.compositeScore).toBe(100);
      expect(res.ancillaryIndices.IRC?.percentile).toBe(50);
      expect(res.ancillaryIndices.IRC?.qualitative).toBe('Promedio');
    });

    it('calculates normative average for IMTA (D=10, LN=10 -> Sum=20 -> IMTA=100, PR=50)', () => {
      const res = calculateWiscV({ D: 10, LN: 10 });
      expect(res.ancillaryIndices.IMTA).not.toBeNull();
      expect(res.ancillaryIndices.IMTA?.sumScaled).toBe(20);
      expect(res.ancillaryIndices.IMTA?.compositeScore).toBe(100);
      expect(res.ancillaryIndices.IMTA?.percentile).toBe(50);
      expect(res.ancillaryIndices.IMTA?.qualitative).toBe('Promedio');
    });

    it('returns null for IRC and IMTA when subtests are missing', () => {
      const res1 = calculateWiscV({ B: 10 });
      expect(res1.ancillaryIndices.IRC).toBeNull();
      const res2 = calculateWiscV({ D: 10 });
      expect(res2.ancillaryIndices.IMTA).toBeNull();
    });
  });
});
