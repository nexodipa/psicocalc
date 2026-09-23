import { describe, it, expect } from 'vitest';
import {
  calculateWaisIV,
  validateScaledScore,
  WAIS_IV_SUBTESTS,
  WAIS_IV_PRIMARY_INDICES,
  WAIS_IV_CIT_META,
  WAIS_IV_ANCILLARY_INDICES,
  normalizeWaisSubtestKey,
  CanonicalWaisSubtestId,
} from '../../core';

describe('Tier 1 - WAIS-IV Subtests & Index Conversions', () => {
  describe('WAIS-IV 10 Core Subtests Validation & Metadata', () => {
    const coreSubtests: CanonicalWaisSubtestId[] = [
      'WAIS_C', 'WAIS_S', 'WAIS_D', 'WAIS_M', 'WAIS_V',
      'WAIS_A', 'WAIS_BS', 'WAIS_PV', 'WAIS_I', 'WAIS_CN',
    ];

    it('verifies all 10 core subtests exist in WAIS_IV_SUBTESTS and are core CIT', () => {
      expect(coreSubtests).toHaveLength(10);
      for (const id of coreSubtests) {
        expect(WAIS_IV_SUBTESTS[id]).toBeDefined();
        expect(WAIS_IV_SUBTESTS[id].isPrimary).toBe(true);
        expect(WAIS_IV_SUBTESTS[id].isCoreCit).toBe(true);
      }
    });

    it('verifies the 10 core subtests correspond to WAIS_IV_CIT_META coreSubtests list', () => {
      expect(WAIS_IV_CIT_META.coreSubtests).toEqual(coreSubtests);
    });

    it('accepts valid scaled scores [1..19] for all core subtests', () => {
      for (const id of coreSubtests) {
        expect(validateScaledScore(1).isValid).toBe(true);
        expect(validateScaledScore(10).isValid).toBe(true);
        expect(validateScaledScore(19).isValid).toBe(true);
      }
    });

    it('rejects out of range scores for core subtests', () => {
      for (const id of coreSubtests) {
        expect(validateScaledScore(0).isValid).toBe(false);
        expect(validateScaledScore(20).isValid).toBe(false);
      }
    });

    it('verifies alias normalization for core subtests (e.g. BD, SI, DS, MR, VC, AR, SS, VP, IN, CD)', () => {
      expect(normalizeWaisSubtestKey('BD')).toBe('WAIS_C');
      expect(normalizeWaisSubtestKey('SI')).toBe('WAIS_S');
      expect(normalizeWaisSubtestKey('DS')).toBe('WAIS_D');
      expect(normalizeWaisSubtestKey('MR')).toBe('WAIS_M');
      expect(normalizeWaisSubtestKey('VC')).toBe('WAIS_V');
      expect(normalizeWaisSubtestKey('AR')).toBe('WAIS_A');
      expect(normalizeWaisSubtestKey('SS')).toBe('WAIS_BS');
      expect(normalizeWaisSubtestKey('VP')).toBe('WAIS_PV');
      expect(normalizeWaisSubtestKey('IN')).toBe('WAIS_I');
      expect(normalizeWaisSubtestKey('CD')).toBe('WAIS_CN');
    });
  });

  describe('WAIS-IV 5 Supplemental Subtests Validation & Metadata', () => {
    const suppSubtests: CanonicalWaisSubtestId[] = [
      'WAIS_LN', 'WAIS_B', 'WAIS_CO', 'WAIS_CA', 'WAIS_FI',
    ];

    it('verifies all 5 supplemental subtests exist and are marked as non-primary', () => {
      expect(suppSubtests).toHaveLength(5);
      for (const id of suppSubtests) {
        expect(WAIS_IV_SUBTESTS[id]).toBeDefined();
        expect(WAIS_IV_SUBTESTS[id].isPrimary).toBe(false);
        expect(WAIS_IV_SUBTESTS[id].isCoreCit).toBe(false);
      }
    });

    it('validates supplemental subtest max raw score specifications', () => {
      expect(WAIS_IV_SUBTESTS['WAIS_LN'].maxRawScore).toBe(30);
      expect(WAIS_IV_SUBTESTS['WAIS_B'].maxRawScore).toBe(27);
      expect(WAIS_IV_SUBTESTS['WAIS_CO'].maxRawScore).toBe(36);
      expect(WAIS_IV_SUBTESTS['WAIS_CA'].maxRawScore).toBe(72);
      expect(WAIS_IV_SUBTESTS['WAIS_FI'].maxRawScore).toBe(24);
    });

    it('accepts valid scaled scores [1..19] for supplemental subtests', () => {
      for (const id of suppSubtests) {
        expect(validateScaledScore(7).isValid).toBe(true);
        expect(validateScaledScore(14).isValid).toBe(true);
      }
    });

    it('rejects invalid scores for supplemental subtests', () => {
      for (const id of suppSubtests) {
        expect(validateScaledScore(-5).isValid).toBe(false);
        expect(validateScaledScore(30).isValid).toBe(false);
      }
    });

    it('verifies alias normalization for supplemental subtests (LN, FW, CO, CA, PC)', () => {
      expect(normalizeWaisSubtestKey('LN')).toBe('WAIS_LN');
      expect(normalizeWaisSubtestKey('FW')).toBe('WAIS_B');
      expect(normalizeWaisSubtestKey('CO')).toBe('WAIS_CO');
      expect(normalizeWaisSubtestKey('CA')).toBe('WAIS_CA');
      expect(normalizeWaisSubtestKey('PC')).toBe('WAIS_FI');
    });
  });

  describe('WAIS-IV Primary Index - ICV (Semejanzas + Vocabulario + Información)', () => {
    it('calculates normative average (S=10, V=10, I=10 -> Sum=30 -> ICV=100, PR=50, Promedio)', () => {
      const res = calculateWaisIV({ WAIS_S: 10, WAIS_V: 10, WAIS_I: 10 });
      const icv = res.primaryIndices.ICV;
      expect(icv).not.toBeNull();
      expect(icv?.sumScaled).toBe(30);
      expect(icv?.compositeScore).toBe(100);
      expect(icv?.percentile).toBe(50);
      expect(icv?.qualitative).toBe('Promedio');
      expect(icv?.ci95.lower).toBe(93);
      expect(icv?.ci95.upper).toBe(107);
    });

    it('calculates superior verbal comprehension (S=16, V=16, I=15 -> Sum=47 -> ICV=132, Muy Superior)', () => {
      const res = calculateWaisIV({ WAIS_S: 16, WAIS_V: 16, WAIS_I: 15 });
      const icv = res.primaryIndices.ICV;
      expect(icv).not.toBeNull();
      expect(icv?.sumScaled).toBe(47);
      expect(icv?.compositeScore).toBe(132);
      expect(icv?.percentile).toBe(98);
      expect(icv?.qualitative).toBe('Muy Superior');
    });

    it('calculates borderline verbal comprehension (S=7, V=6, I=6 -> Sum=19 -> ICV=78, Limítrofe)', () => {
      const res = calculateWaisIV({ WAIS_S: 7, WAIS_V: 6, WAIS_I: 6 });
      const icv = res.primaryIndices.ICV;
      expect(icv).not.toBeNull();
      expect(icv?.sumScaled).toBe(19);
      expect(icv?.compositeScore).toBe(78);
      expect(icv?.percentile).toBe(7);
      expect(icv?.qualitative).toBe('Limítrofe');
    });

    it('calculates average verbal comprehension with English alias keys (SI=10, VC=12, IN=11 -> Sum=33 -> ICV=106, Promedio)', () => {
      const res = calculateWaisIV({ SI: 10, VC: 12, IN: 11 });
      const icv = res.primaryIndices.ICV;
      expect(icv).not.toBeNull();
      expect(icv?.sumScaled).toBe(33);
      expect(icv?.compositeScore).toBe(106);
      expect(icv?.percentile).toBe(66);
      expect(icv?.qualitative).toBe('Promedio');
    });

    it('returns null for ICV when only 2 subtests provided without substitution', () => {
      const res = calculateWaisIV({ WAIS_S: 10, WAIS_V: 10 });
      expect(res.primaryIndices.ICV).toBeNull();
    });
  });

  describe('WAIS-IV Primary Index - IRP (Cubos + Matrices + Puzles Visuales)', () => {
    it('calculates normative average (C=10, M=10, PV=10 -> Sum=30 -> IRP=100, PR=50, Promedio)', () => {
      const res = calculateWaisIV({ WAIS_C: 10, WAIS_M: 10, WAIS_PV: 10 });
      const irp = res.primaryIndices.IRP;
      expect(irp).not.toBeNull();
      expect(irp?.sumScaled).toBe(30);
      expect(irp?.compositeScore).toBe(100);
      expect(irp?.percentile).toBe(50);
      expect(irp?.qualitative).toBe('Promedio');
      expect(irp?.ci95.lower).toBe(92);
      expect(irp?.ci95.upper).toBe(108);
    });

    it('calculates superior perceptual reasoning (C=14, M=15, PV=14 -> Sum=43 -> IRP=125, Superior)', () => {
      const res = calculateWaisIV({ WAIS_C: 14, WAIS_M: 15, WAIS_PV: 14 });
      const irp = res.primaryIndices.IRP;
      expect(irp).not.toBeNull();
      expect(irp?.sumScaled).toBe(43);
      expect(irp?.compositeScore).toBe(125);
      expect(irp?.percentile).toBe(95);
      expect(irp?.qualitative).toBe('Superior');
    });

    it('calculates low average perceptual reasoning (C=8, M=7, PV=7 -> Sum=22 -> IRP=84, Promedio Bajo)', () => {
      const res = calculateWaisIV({ WAIS_C: 8, WAIS_M: 7, WAIS_PV: 7 });
      const irp = res.primaryIndices.IRP;
      expect(irp).not.toBeNull();
      expect(irp?.sumScaled).toBe(22);
      expect(irp?.compositeScore).toBe(84);
      expect(irp?.percentile).toBe(14);
      expect(irp?.qualitative).toBe('Promedio Bajo');
    });

    it('calculates borderline perceptual reasoning (BD=6, MR=7, VP=6 -> Sum=19 -> IRP=79, Limítrofe)', () => {
      const res = calculateWaisIV({ BD: 6, MR: 7, VP: 6 });
      const irp = res.primaryIndices.IRP;
      expect(irp).not.toBeNull();
      expect(irp?.sumScaled).toBe(19);
      expect(irp?.compositeScore).toBe(79);
      expect(irp?.percentile).toBe(8);
      expect(irp?.qualitative).toBe('Limítrofe');
    });

    it('returns null for IRP when constituent subtests are incomplete', () => {
      const res = calculateWaisIV({ WAIS_C: 10, WAIS_M: 10 });
      expect(res.primaryIndices.IRP).toBeNull();
    });
  });

  describe('WAIS-IV Primary Index - IMT (Dígitos + Aritmética)', () => {
    it('calculates normative average (D=10, A=10 -> Sum=20 -> IMT=100, PR=50, Promedio)', () => {
      const res = calculateWaisIV({ WAIS_D: 10, WAIS_A: 10 });
      const imt = res.primaryIndices.IMT;
      expect(imt).not.toBeNull();
      expect(imt?.sumScaled).toBe(20);
      expect(imt?.compositeScore).toBe(100);
      expect(imt?.percentile).toBe(50);
      expect(imt?.qualitative).toBe('Promedio');
      expect(imt?.ci95.lower).toBe(91);
      expect(imt?.ci95.upper).toBe(109);
    });

    it('calculates superior working memory (D=15, A=14 -> Sum=29 -> IMT=125, Superior)', () => {
      const res = calculateWaisIV({ WAIS_D: 15, WAIS_A: 14 });
      const imt = res.primaryIndices.IMT;
      expect(imt).not.toBeNull();
      expect(imt?.sumScaled).toBe(29);
      expect(imt?.compositeScore).toBe(125);
      expect(imt?.percentile).toBe(95);
      expect(imt?.qualitative).toBe('Superior');
    });

    it('calculates borderline working memory (D=5, A=6 -> Sum=11 -> IMT=74, Limítrofe)', () => {
      const res = calculateWaisIV({ WAIS_D: 5, WAIS_A: 6 });
      const imt = res.primaryIndices.IMT;
      expect(imt).not.toBeNull();
      expect(imt?.sumScaled).toBe(11);
      expect(imt?.compositeScore).toBe(74);
      expect(imt?.percentile).toBe(4);
      expect(imt?.qualitative).toBe('Limítrofe');
    });

    it('calculates high average working memory (DS=12, AR=12 -> Sum=24 -> IMT=111, Promedio Alto)', () => {
      const res = calculateWaisIV({ DS: 12, AR: 12 });
      const imt = res.primaryIndices.IMT;
      expect(imt).not.toBeNull();
      expect(imt?.sumScaled).toBe(24);
      expect(imt?.compositeScore).toBe(111);
      expect(imt?.qualitative).toBe('Promedio Alto');
    });

    it('returns null for IMT when one subtest is missing', () => {
      const res = calculateWaisIV({ WAIS_D: 10 });
      expect(res.primaryIndices.IMT).toBeNull();
    });
  });

  describe('WAIS-IV Primary Index - IVP (Búsqueda de Símbolos + Clave de Números)', () => {
    it('calculates normative average (BS=10, CN=10 -> Sum=20 -> IVP=100, PR=50, Promedio)', () => {
      const res = calculateWaisIV({ WAIS_BS: 10, WAIS_CN: 10 });
      const ivp = res.primaryIndices.IVP;
      expect(ivp).not.toBeNull();
      expect(ivp?.sumScaled).toBe(20);
      expect(ivp?.compositeScore).toBe(100);
      expect(ivp?.percentile).toBe(50);
      expect(ivp?.qualitative).toBe('Promedio');
      expect(ivp?.ci95.lower).toBe(90);
      expect(ivp?.ci95.upper).toBe(110);
    });

    it('calculates high average processing speed (BS=13, CN=13 -> Sum=26 -> IVP=117, Promedio Alto)', () => {
      const res = calculateWaisIV({ WAIS_BS: 13, WAIS_CN: 13 });
      const ivp = res.primaryIndices.IVP;
      expect(ivp).not.toBeNull();
      expect(ivp?.sumScaled).toBe(26);
      expect(ivp?.compositeScore).toBe(117);
      expect(ivp?.percentile).toBe(87);
      expect(ivp?.qualitative).toBe('Promedio Alto');
    });

    it('calculates below average processing speed (BS=7, CN=6 -> Sum=13 -> IVP=80, Promedio Bajo)', () => {
      const res = calculateWaisIV({ WAIS_BS: 7, WAIS_CN: 6 });
      const ivp = res.primaryIndices.IVP;
      expect(ivp).not.toBeNull();
      expect(ivp?.sumScaled).toBe(13);
      expect(ivp?.compositeScore).toBe(80);
      expect(ivp?.percentile).toBe(9);
      expect(ivp?.qualitative).toBe('Promedio Bajo');
    });

    it('calculates impaired processing speed (SS=4, CD=3 -> Sum=7 -> IVP=65, Extremadamente Bajo)', () => {
      const res = calculateWaisIV({ SS: 4, CD: 3 });
      const ivp = res.primaryIndices.IVP;
      expect(ivp).not.toBeNull();
      expect(ivp?.sumScaled).toBe(7);
      expect(ivp?.compositeScore).toBe(65);
      expect(ivp?.percentile).toBe(1);
      expect(ivp?.qualitative).toBe('Extremadamente Bajo');
    });

    it('returns null for IVP when one subtest is missing', () => {
      const res = calculateWaisIV({ WAIS_BS: 10 });
      expect(res.primaryIndices.IVP).toBeNull();
    });
  });

  describe('WAIS-IV Full Scale IQ (CIT-10)', () => {
    it('calculates exact normative median (Sum=100 from 10 core subtests all 10 -> CIT=100, PR=50, Promedio)', () => {
      const res = calculateWaisIV({
        WAIS_C: 10, WAIS_S: 10, WAIS_D: 10, WAIS_M: 10, WAIS_V: 10,
        WAIS_A: 10, WAIS_BS: 10, WAIS_PV: 10, WAIS_I: 10, WAIS_CN: 10,
      });
      expect(res.isCompleteCit).toBe(true);
      expect(res.cit).not.toBeNull();
      expect(res.cit?.sumScaled).toBe(100);
      expect(res.cit?.compositeScore).toBe(100);
      expect(res.cit?.percentile).toBe(50);
      expect(res.cit?.qualitative).toBe('Promedio');
      expect(res.cit?.ci95.lower).toBe(95);
      expect(res.cit?.ci95.upper).toBe(105);
    });

    it('calculates superior CIT (Sum=145 -> CIT=129, Superior)', () => {
      const res = calculateWaisIV({
        BD: 14, SI: 16, DS: 15, MR: 15, VC: 16,
        AR: 14, SS: 13, VP: 14, IN: 15, CD: 13,
      });
      expect(res.isCompleteCit).toBe(true);
      expect(res.cit).not.toBeNull();
      expect(res.cit?.sumScaled).toBe(145);
      expect(res.cit?.compositeScore).toBe(129);
      expect(res.cit?.percentile).toBe(97);
      expect(res.cit?.qualitative).toBe('Superior');
    });

    it('calculates borderline CIT (Sum=65 -> CIT=75, Limítrofe)', () => {
      const res = calculateWaisIV({
        WAIS_C: 8, WAIS_S: 7, WAIS_D: 5, WAIS_M: 7, WAIS_V: 6,
        WAIS_A: 6, WAIS_BS: 7, WAIS_PV: 7, WAIS_I: 6, WAIS_CN: 6,
      });
      expect(res.isCompleteCit).toBe(true);
      expect(res.cit).not.toBeNull();
      expect(res.cit?.sumScaled).toBe(65);
      expect(res.cit?.compositeScore).toBe(75);
      expect(res.cit?.percentile).toBe(5);
      expect(res.cit?.qualitative).toBe('Limítrofe');
    });

    it('returns null CIT and isCompleteCit false when only 9 core subtests provided without substitution', () => {
      const res = calculateWaisIV({
        WAIS_C: 10, WAIS_S: 10, WAIS_D: 10, WAIS_M: 10, WAIS_V: 10,
        WAIS_A: 10, WAIS_BS: 10, WAIS_PV: 10, WAIS_I: 10, // WAIS_CN missing
      });
      expect(res.isCompleteCit).toBe(false);
      expect(res.cit).toBeNull();
    });

    it('calculates CIT successfully with single permissible substitution (CO for I)', () => {
      const res = calculateWaisIV({
        WAIS_C: 10, WAIS_S: 10, WAIS_D: 10, WAIS_M: 10, WAIS_V: 10,
        WAIS_A: 10, WAIS_BS: 10, WAIS_PV: 10, WAIS_CN: 10, // WAIS_I missing
        WAIS_CO: 10, // Substitute
      });
      expect(res.isCompleteCit).toBe(true);
      expect(res.cit).not.toBeNull();
      expect(res.cit?.sumScaled).toBe(100);
      expect(res.cit?.compositeScore).toBe(100);
    });
  });

  describe('WAIS-IV Ancillary Indices (IAG, ICC)', () => {
    it('calculates normative average for IAG (6 subtests from ICV + IRP all 10 -> Sum=60 -> IAG=100, PR=50)', () => {
      const res = calculateWaisIV({
        WAIS_S: 10, WAIS_V: 10, WAIS_I: 10,
        WAIS_C: 10, WAIS_M: 10, WAIS_PV: 10,
      });
      expect(res.ancillaryIndices.IAG).not.toBeNull();
      expect(res.ancillaryIndices.IAG?.sumScaled).toBe(60);
      expect(res.ancillaryIndices.IAG?.compositeScore).toBe(100);
      expect(res.ancillaryIndices.IAG?.percentile).toBe(50);
      expect(res.ancillaryIndices.IAG?.qualitative).toBe('Promedio');
    });

    it('calculates normative average for ICC (4 subtests from IMT + IVP all 10 -> Sum=40 -> ICC=100, PR=50)', () => {
      const res = calculateWaisIV({
        WAIS_D: 10, WAIS_A: 10,
        WAIS_BS: 10, WAIS_CN: 10,
      });
      expect(res.ancillaryIndices.ICC).not.toBeNull();
      expect(res.ancillaryIndices.ICC?.sumScaled).toBe(40);
      expect(res.ancillaryIndices.ICC?.compositeScore).toBe(100);
      expect(res.ancillaryIndices.ICC?.percentile).toBe(50);
      expect(res.ancillaryIndices.ICC?.qualitative).toBe('Promedio');
    });

    it('calculates very high IAG (Sum=90 -> IAG=131, Muy Superior)', () => {
      const res = calculateWaisIV({
        SI: 16, VC: 16, IN: 15,
        BD: 14, MR: 15, VP: 14,
      });
      expect(res.ancillaryIndices.IAG).not.toBeNull();
      expect(res.ancillaryIndices.IAG?.sumScaled).toBe(90);
      expect(res.ancillaryIndices.IAG?.compositeScore).toBe(131);
      expect(res.ancillaryIndices.IAG?.qualitative).toBe('Muy Superior');
    });

    it('calculates impaired IAG (Sum=52 -> IAG=90, Promedio)', () => {
      const res = calculateWaisIV({
        WAIS_S: 10, WAIS_V: 12, WAIS_I: 11,
        WAIS_C: 6, WAIS_M: 7, WAIS_PV: 6,
      });
      expect(res.ancillaryIndices.IAG).not.toBeNull();
      expect(res.ancillaryIndices.IAG?.sumScaled).toBe(52);
      expect(res.ancillaryIndices.IAG?.compositeScore).toBe(90);
    });

    it('returns null ancillary index when constituent subtests are missing', () => {
      const res = calculateWaisIV({ WAIS_S: 10, WAIS_V: 10, WAIS_I: 10 }); // Missing IRP subtests
      expect(res.ancillaryIndices.IAG).toBeNull();
    });
  });
});
