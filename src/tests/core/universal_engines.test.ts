/**
 * Universal Psychometric Engines & TestRegistry Unit Test Suite (Milestone M1-Core)
 *
 * Exhaustively validates all psychometric calculation engines, validity checking protocols,
 * normative transformations, and demographic adjustment formulas against authoritative benchmark cases.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  TestRegistry,
  calculateMmpi3,
  validateMmpi3,
  calculatePai,
  validatePai,
  calculateMcmi4,
  validateMcmi4,
  calculateD2r,
  validateD2r,
  calculateNeuropsiBreve,
  validateNeuropsiBreve,
  calculateMmse,
  validateMmse,
  calculateAbas3,
  validateAbas3,
  calculateVineland3,
  validateVineland3,
  calculateSena,
  validateSena,
  calculateCbcl,
  validateCbcl,
  calculateByi2,
  validateByi2,
  calculateRaven2,
  validateRaven2,
  getNormacodemDelta,
  getNeuropsiEducationLevel,
  getNeuropsiAgeGroup,
} from '../../core';

describe('Universal Psychometric Suite — Core Engines & Registry (Milestone M1-Core)', () => {
  beforeEach(() => {
    TestRegistry.reset();
  });

  // ==========================================================================
  // 1. Centralized TestRegistry Architecture
  // ==========================================================================
  describe('1. Centralized TestRegistry Architecture', () => {
    it('registers all 19 psychometric instruments across 6 clinical domains', () => {
      const all = TestRegistry.getAll();
      expect(all.length).toBe(19);

      const expectedIds = [
        'wisc_v', 'wais_iv', 'raven_2',
        'd2_r', 'neuropsi_breve', 'mmse', 'moca',
        'mmpi_3', 'pai', 'mcmi_iv',
        'abas_3', 'vineland_3',
        'sena', 'cbcl', 'byi_2', 'sdq', 'phq_9', 'gad_7',
        'htp',
      ];

      for (const id of expectedIds) {
        expect(TestRegistry.has(id)).toBe(true);
        const inst = TestRegistry.get(id);
        expect(inst).toBeDefined();
        expect(inst?.metadata.id).toBe(id);
        expect(inst?.metadata.name).toBeDefined();
        expect(inst?.metadata.domain).toBeDefined();
        expect(inst?.createInitialState).toBeDefined();
        expect(inst?.calculate).toBeDefined();
        expect(inst?.validateInput).toBeDefined();
      }
    });

    it('categorizes instruments accurately across the 6 clinical domains', () => {
      expect(TestRegistry.getByDomain('intelligence_aptitudes').map((i) => i.metadata.id)).toEqual([
        'wisc_v', 'wais_iv', 'raven_2',
      ]);
      expect(TestRegistry.getByDomain('neuropsychology_attention').map((i) => i.metadata.id)).toEqual([
        'd2_r', 'neuropsi_breve', 'mmse', 'moca',
      ]);
      expect(TestRegistry.getByDomain('personality_psychopathology').map((i) => i.metadata.id)).toEqual([
        'mmpi_3', 'pai', 'mcmi_iv',
      ]);
      expect(TestRegistry.getByDomain('adaptive_behavior').map((i) => i.metadata.id)).toEqual([
        'abas_3', 'vineland_3',
      ]);
      expect(TestRegistry.getByDomain('child_adolescent_emotional').map((i) => i.metadata.id)).toEqual([
        'sena', 'cbcl', 'byi_2', 'sdq', 'phq_9', 'gad_7',
      ]);
      expect(TestRegistry.getByDomain('projective_guides').map((i) => i.metadata.id)).toEqual([
        'htp',
      ]);
    });

    it('searches instruments dynamically by keyword and text', () => {
      const ansiedadResults = TestRegistry.search('ansiedad').map((i) => i.metadata.id);
      expect(ansiedadResults).toContain('gad_7');
      expect(ansiedadResults).toContain('byi_2');
      expect(ansiedadResults).toContain('pai');

      const personalidadResults = TestRegistry.search('personalidad').map((i) => i.metadata.id);
      expect(personalidadResults).toContain('mmpi_3');
      expect(personalidadResults).toContain('pai');
      expect(personalidadResults).toContain('mcmi_iv');

      const adaptativeResults = TestRegistry.search('adaptativa').map((i) => i.metadata.id);
      expect(adaptativeResults).toContain('abas_3');
      expect(adaptativeResults).toContain('vineland_3');
    });

    it('filters instruments by age criteria', () => {
      const childInstruments = TestRegistry.filterByAge(10).map((i) => i.metadata.id);
      expect(childInstruments).toContain('wisc_v');
      expect(childInstruments).toContain('raven_2');
      expect(childInstruments).toContain('d2_r');
      expect(childInstruments).toContain('sena');
      expect(childInstruments).toContain('cbcl');
      expect(childInstruments).toContain('byi_2');
      expect(childInstruments).toContain('sdq');
      expect(childInstruments).not.toContain('wais_iv');
      expect(childInstruments).not.toContain('mmpi_3');

      const adultInstruments = TestRegistry.filterByAge(40).map((i) => i.metadata.id);
      expect(adultInstruments).toContain('wais_iv');
      expect(adultInstruments).toContain('mmpi_3');
      expect(adultInstruments).toContain('pai');
      expect(adultInstruments).toContain('mcmi_iv');
      expect(adultInstruments).not.toContain('wisc_v');
    });
  });

  // ==========================================================================
  // 2. MMPI-3 Psychometric Engine & Validity Protocols
  // ==========================================================================
  describe('2. MMPI-3 Psychometric Engine & Validity Protocols', () => {
    it('Benchmark Case 1: valid protocol with depressive elevation and active suicide alert (SUI >= 65)', () => {
      const input = {
        omittedCount: 1,
        tScores: {
          CRIN: 52,
          VRIN: 50,
          TRIN: 54,
          F: 62,
          Fp: 51,
          L: 48,
          K: 45,
          EID: 78,
          THD: 48,
          BXD: 52,
          RCd: 76,
          RC2: 74,
          SUI: 72,
        },
      };

      const result = calculateMmpi3(input);
      expect(result.validity.isValidProtocol).toBe(true);
      expect(result.validity.invalidationReasons).toEqual([]);
      expect(result.clinicalProfileInterpretable).toBe(true);
      expect(result.primaryElevations).toContain('EID');
      expect(result.primaryElevations).toContain('RCd');
      expect(result.primaryElevations).toContain('RC2');
      expect(result.primaryElevations).toContain('SUI');
      expect(result.suicideRiskAlert.triggered).toBe(true);
      expect(result.suicideRiskAlert.level).toBe('CLINICAL_ALERT');
      expect(result.suicideRiskAlert.message).toContain('SUI T=72 >= 65');
    });

    it('Benchmark Case 2: invalid protocol due to random inconsistent responding (VRIN >= 80, CRIN >= 80)', () => {
      const input = {
        omittedCount: 2,
        tScores: {
          VRIN: 85,
          CRIN: 82,
          EID: 88,
          RCd: 85,
        },
      };

      const result = calculateMmpi3(input);
      expect(result.validity.isValidProtocol).toBe(false);
      expect(result.clinicalProfileInterpretable).toBe(false);
      expect(result.validity.invalidationReasons?.some((r) => r.includes('VRIN T=85 >= 80'))).toBe(true);
      expect(result.validity.invalidationReasons?.some((r) => r.includes('CRIN T=82 >= 80'))).toBe(true);
      expect(result.clinicalClassification).toContain('Protocolo INVÁLIDO');
    });

    it('invalidation rules: detects CNS >= 15 omissions, F >= 100 extreme infrequency, and L >= 80', () => {
      const omittedInput = { omittedCount: 15 };
      expect(validateMmpi3(omittedInput).validity.isValidProtocol).toBe(false);
      expect(validateMmpi3(omittedInput).validity.invalidationReason).toContain('CNS = 15 >= 15');

      const extremeFInput = { tScores: { F: 102 } };
      expect(validateMmpi3(extremeFInput).validity.isValidProtocol).toBe(false);
      expect(validateMmpi3(extremeFInput).validity.invalidationReason).toContain('F T=102 >= 100');

      const extremeLInput = { tScores: { L: 82 } };
      expect(validateMmpi3(extremeLInput).validity.isValidProtocol).toBe(false);
      expect(validateMmpi3(extremeLInput).validity.invalidationReason).toContain('L T=82 >= 80');
    });

    it('critical alert: triggers CRITICAL_RISK when SUI >= 80', () => {
      const input = { tScores: { SUI: 84 } };
      const res = calculateMmpi3(input);
      expect(res.suicideRiskAlert.triggered).toBe(true);
      expect(res.suicideRiskAlert.level).toBe('CRITICAL_RISK');
      expect(res.suicideRiskAlert.message).toContain('SUI T=84 >= 80');
    });
  });

  // ==========================================================================
  // 3. PAI Psychometric Engine & Diagnostic Cutoffs
  // ==========================================================================
  describe('3. PAI Psychometric Engine & Diagnostic Cutoffs', () => {
    it('Benchmark Case 3: valid profile with Borderline traits, severe depression and imminent suicide risk (SUI >= 80)', () => {
      const input = {
        omittedCount: 2,
        tScores: {
          ICN: 55,
          INF: 52,
          NIM: 68,
          PIM: 42,
          SOM: 58,
          ANX: 74,
          ARD: 65,
          DEP: 82,
          MAN: 48,
          PAR: 60,
          SCZ: 56,
          BOR: 78,
          ANT: 52,
          ALC: 50,
          DRG: 46,
          SUI: 84,
        },
      };

      const result = calculatePai(input);
      expect(result.validity.isValidProtocol).toBe(true);
      expect(result.clinicalProfileInterpretable).toBe(true);
      expect(result.meetsClinicalCutoff).toBe(true);
      expect(result.elevations.some((e) => e.includes('DEP (T=82, Severa)'))).toBe(true);
      expect(result.elevations.some((e) => e.includes('BOR (T=78, Clínica)'))).toBe(true);
      expect(result.elevations.some((e) => e.includes('ANX (T=74, Clínica)'))).toBe(true);
      expect(result.suicideRiskAlert.triggered).toBe(true);
      expect(result.suicideRiskAlert.level).toBe('CRITICAL_RISK');
      expect(result.suicideRiskAlert.message).toContain('SUI T=84 >= 80');
    });

    it('Benchmark Case 4: invalid protocol due to deliberate simulation / faking bad (NIM >= 92)', () => {
      const input = {
        tScores: {
          ICN: 60,
          INF: 58,
          NIM: 96,
          PIM: 32,
          DEP: 95,
        },
      };

      const result = calculatePai(input);
      expect(result.validity.isValidProtocol).toBe(false);
      expect(result.clinicalProfileInterpretable).toBe(false);
      expect(result.validity.invalidationReason).toContain('NIM T=96 >= 92');
    });

    it('invalidation rules: excessive omissions (> 17) and inconsistency (ICN >= 73)', () => {
      const omittedInput = { omittedCount: 18 };
      expect(validatePai(omittedInput).validity.isValidProtocol).toBe(false);
      expect(validatePai(omittedInput).validity.invalidationReason).toContain('Omisiones = 18 > 17');

      const icnInput = { tScores: { ICN: 75 } };
      expect(validatePai(icnInput).validity.isValidProtocol).toBe(false);
      expect(validatePai(icnInput).validity.invalidationReason).toContain('ICN T=75 >= 73');
    });

    it('substance alert: triggers substance warning when ALC or DRG >= 70', () => {
      const input = { tScores: { ALC: 76, DRG: 50 } };
      const res = calculatePai(input);
      expect(res.substanceAlert.triggered).toBe(true);
      expect(res.substanceAlert.message).toContain('Alcohol (T=76)');
    });
  });

  // ==========================================================================
  // 4. MCMI-IV Millon Base Rates Engine
  // ==========================================================================
  describe('4. MCMI-IV Millon Base Rates Engine', () => {
    it('Benchmark Case 5: valid profile with Borderline prominence (TB >= 85) and Major Depression syndrome', () => {
      const input = {
        omittedCount: 0,
        rawScores: {
          V: 0,
          W: 6,
          X: 65,
        },
        baseRates: {
          '1': 45,
          '2B': 82,
          C: 88,
          A: 78,
          CC: 86,
        },
      };

      const result = calculateMcmi4(input);
      expect(result.validity.isValidProtocol).toBe(true);
      expect(result.clinicalProfileInterpretable).toBe(true);
      expect(result.presenceScales.some((s) => s.includes('2B (TB=82)'))).toBe(true);
      expect(result.presenceScales.some((s) => s.includes('A (TB=78)'))).toBe(true);
      expect(result.prominenceScales.some((s) => s.includes('C (TB=88)'))).toBe(true);
      expect(result.prominenceScales.some((s) => s.includes('CC (TB=86)'))).toBe(true);
      expect(result.diagnosticSummary).toContain('Prominencia clínica en: C (TB=88), CC (TB=86)');
    });

    it('Benchmark Case 6: invalid protocol due to absurd items marked true (Scale V >= 2)', () => {
      const input = {
        rawScores: {
          V: 2,
          W: 12,
          X: 70,
        },
      };

      const result = calculateMcmi4(input);
      expect(result.validity.isValidProtocol).toBe(false);
      expect(result.clinicalProfileInterpretable).toBe(false);
      expect(result.validity.invalidationReason).toContain('Escala V = 2 >= 2');
    });

    it('invalidation rules: Scale W >= 20 and Scale X disclosure bounds (< 7 or > 114)', () => {
      expect(validateMcmi4({ rawScores: { W: 22 } }).validity.isValidProtocol).toBe(false);
      expect(validateMcmi4({ rawScores: { X: 5 } }).validity.isValidProtocol).toBe(false);
      expect(validateMcmi4({ rawScores: { X: 118 } }).validity.isValidProtocol).toBe(false);
    });
  });

  // ==========================================================================
  // 5. D2-R Attention & Processing Speed Engine
  // ==========================================================================
  describe('5. D2-R Attention & Processing Speed Engine', () => {
    it('Benchmark Case 7: optimal concentration and high precision performance', () => {
      const input = {
        tr: 540,
        ta: 220,
        e1: 8,
        e2: 4,
      };

      const result = calculateD2r(input);
      expect(result.validity.isValidProtocol).toBe(true);
      expect(result.tot).toBe(12);
      expect(result.con).toBe(216);
      expect(result.cpPercent).toBeCloseTo(2.22, 1);
      expect(result.qualitativePrecision).toContain('Excelente precisión');
      expect(result.qualitativeConcentration).toContain('Alto');
    });

    it('Benchmark Case 8: impulsive pattern with elevated commissions and clinical note', () => {
      const input = {
        tr: 480,
        ta: 160,
        e1: 25,
        e2: 45,
      };

      const result = calculateD2r(input);
      expect(result.validity.isValidProtocol).toBe(true);
      expect(result.tot).toBe(70);
      expect(result.con).toBe(115);
      expect(result.cpPercent).toBeCloseTo(14.58, 1);
      expect(result.clinicalNote).toContain('estilo impulsivo');
    });

    it('mathematical invariant: rejects TA > TR input', () => {
      const invalidInput = {
        tr: 200,
        ta: 250, // Impossible: more targets hit than items reviewed
      };

      const val = validateD2r(invalidInput);
      expect(val.isValid).toBe(false);
      expect(val.errors[0]).toContain('TA (250) no puede superar a TR (200)');
    });

    it('invalidation threshold: rejects protocol with CP% > 40%', () => {
      const randomInput = {
        tr: 200,
        ta: 80,
        e1: 45,
        e2: 45, // TOT = 90 / 200 = 45% error
      };

      const val = validateD2r(randomInput);
      expect(val.validity.isValidProtocol).toBe(false);
      expect(val.validity.invalidationReason).toContain('CP% (45.0%) > 40%');
    });
  });

  // ==========================================================================
  // 6. NEUROPSI Breve Demographic Matrix Engine
  // ==========================================================================
  describe('6. NEUROPSI Breve Demographic Matrix Engine', () => {
    it('Benchmark Case 9: 68-year-old with medium education (7 years) and score 76 -> Alteración Moderada', () => {
      const input = {
        age: 68,
        educationYears: 7,
        totalRawScore: 76,
      };

      expect(getNeuropsiEducationLevel(7)).toBe('media');
      expect(getNeuropsiAgeGroup(68)).toBe('66_85');

      const result = calculateNeuropsiBreve(input);
      expect(result.classification).toBe('Alteración Moderada');
      expect(result.meetsClinicalCutoff).toBe(true);
      expect(result.alertMessage).toContain('rango moderado');
    });

    it('correctly classifies a young adult with high education as Normal', () => {
      const input = {
        age: 24,
        educationYears: 16,
        totalRawScore: 122,
      };

      const result = calculateNeuropsiBreve(input);
      expect(result.classification).toBe('Normal');
      expect(result.meetsClinicalCutoff).toBe(false);
    });

    it('correctly classifies an elderly illiterate adult with score <= 39 as Alteración Severa', () => {
      const input = {
        age: 72,
        educationYears: 0,
        totalRawScore: 35,
      };

      const result = calculateNeuropsiBreve(input);
      expect(result.classification).toBe('Alteración Severa');
      expect(result.meetsClinicalCutoff).toBe(true);
    });
  });

  // ==========================================================================
  // 7. MMSE NORMACODEM Demographic Adjustment Engine
  // ==========================================================================
  describe('7. MMSE NORMACODEM Demographic Adjustment Engine', () => {
    it('Benchmark Case 10A: elderly patient with primary education receives +2 adjustment', () => {
      const input = {
        age: 78,
        educationYears: 6,
        rawScore: 23,
      };

      expect(getNormacodemDelta(78, 6)).toBe(2);

      const result = calculateMmse(input);
      expect(result.adjustmentDelta).toBe(2);
      expect(result.adjustedScore).toBe(25);
      expect(result.rawClassification).toBe('Deterioro Cognitivo Moderado');
      expect(result.classification).toBe('Sospecha / Deterioro Cognitivo Leve');
    });

    it('Benchmark Case 10B: young adult with university education receives -1 adjustment', () => {
      const input = {
        age: 32,
        educationYears: 18,
        rawScore: 30,
      };

      expect(getNormacodemDelta(32, 18)).toBe(-1);

      const result = calculateMmse(input);
      expect(result.adjustmentDelta).toBe(-1);
      expect(result.adjustedScore).toBe(29);
      expect(result.classification).toBe('Normal / Cognición Intacta');
    });

    it('clamps adjusted score strictly within [0, 30]', () => {
      const input = {
        age: 80,
        educationYears: 5,
        rawScore: 30, // 30 + 2 -> 32 -> capped at 30
      };

      const result = calculateMmse(input);
      expect(result.adjustedScore).toBe(30);
    });
  });

  // ==========================================================================
  // 8. ABAS-3 Adaptive Behavior Engine
  // ==========================================================================
  describe('8. ABAS-3 Adaptive Behavior Engine', () => {
    it('Benchmark Case ABAS-1: average typical profile across all 9 skill areas', () => {
      const input = {
        skillAreas: {
          COM: 10, HAF: 10, AD: 10,
          OC: 10, SOC: 10,
          UC: 10, VH: 10, SS: 10, AC: 10,
        },
      };

      const result = calculateAbas3(input);
      expect(result.domains.conceptual.compositeScore).toBe(100);
      expect(result.domains.conceptual.percentile).toBe(50);
      expect(result.domains.conceptual.qualitative).toBe('Promedio');

      expect(result.domains.social.compositeScore).toBe(100);
      expect(result.domains.social.percentile).toBe(50);

      expect(result.domains.practical.compositeScore).toBe(100);
      expect(result.domains.practical.percentile).toBe(50);

      expect(result.gac.compositeScore).toBe(100);
      expect(result.gac.percentile).toBe(50);
      expect(result.gac.qualitative).toBe('Promedio');
      expect(result.meetsClinicalCutoff).toBe(false);
    });

    it('Benchmark Case ABAS-2: severe adaptive deficit profile (ID / DSM-5 cutoff <= 69)', () => {
      const input = {
        skillAreas: {
          COM: 4, HAF: 3, AD: 4,
          OC: 5, SOC: 4,
          UC: 3, VH: 4, SS: 3, AC: 4,
        },
      };

      const result = calculateAbas3(input);
      expect(result.domains.conceptual.compositeScore).toBe(62);
      expect(result.domains.conceptual.percentile).toBeCloseTo(0.6, 1);
      expect(result.domains.conceptual.qualitative).toBe('Extremadamente Bajo');

      expect(result.domains.social.compositeScore).toBe(70);
      expect(result.domains.social.percentile).toBe(2);
      expect(result.domains.social.qualitative).toBe('Limítrofe');

      expect(result.domains.practical.compositeScore).toBe(61);
      expect(result.domains.practical.percentile).toBeCloseTo(0.5, 1);
      expect(result.domains.practical.qualitative).toBe('Extremadamente Bajo');

      expect(result.gac.compositeScore).toBe(62);
      expect(result.gac.percentile).toBeCloseTo(0.6, 1);
      expect(result.gac.qualitative).toBe('Extremadamente Bajo');
      expect(result.meetsClinicalCutoff).toBe(true);
      expect(result.clinicalAlert).toContain('Déficit adaptativo clínico significativo');
    });

    it('Benchmark Case ABAS-3: superior adaptive functioning', () => {
      const input = {
        skillAreas: {
          COM: 14, HAF: 15, AD: 13,
          OC: 13, SOC: 14,
          UC: 14, VH: 14, SS: 15, AC: 14,
        },
      };

      const result = calculateAbas3(input);
      expect(result.domains.conceptual.compositeScore).toBe(124);
      expect(result.domains.conceptual.percentile).toBe(95);
      expect(result.domains.conceptual.qualitative).toBe('Superior');

      expect(result.domains.social.compositeScore).toBe(119);
      expect(result.domains.social.qualitative).toBe('Promedio Alto');

      expect(result.domains.practical.compositeScore).toBe(126);
      expect(result.domains.practical.qualitative).toBe('Superior');

      expect(result.gac.compositeScore).toBe(124);
      expect(result.gac.percentile).toBe(95);
      expect(result.gac.qualitative).toBe('Superior');
    });

    it('validates scaled scores within [1, 19]', () => {
      const invalid = { skillAreas: { COM: 22 } };
      const val = validateAbas3(invalid);
      expect(val.isValid).toBe(false);
      expect(val.errors[0]).toContain('COM (22) fuera de rango');
    });
  });

  // ==========================================================================
  // 9. Vineland-3 Adaptive Behavior Engine
  // ==========================================================================
  describe('9. Vineland-3 Adaptive Behavior Engine', () => {
    it('Benchmark Case VINE-1: adequate typical profile across all 9 subdomains', () => {
      const input = {
        subdomains: {
          receptive: 15, expressive: 15, written: 15,
          personal: 15, domestic: 15, community: 15,
          interpersonal: 15, playLeisure: 15, coping: 15,
        },
      };

      const result = calculateVineland3(input);
      expect(result.domains.communication.standardScore).toBe(100);
      expect(result.domains.communication.descriptor).toBe('Adequate');

      expect(result.domains.dailyLivingSkills.standardScore).toBe(100);
      expect(result.domains.dailyLivingSkills.descriptor).toBe('Adequate');

      expect(result.domains.socialization.standardScore).toBe(100);
      expect(result.domains.socialization.descriptor).toBe('Adequate');

      expect(result.abc.standardScore).toBe(100);
      expect(result.abc.descriptor).toBe('Adequate');
      expect(result.meetsClinicalCutoff).toBe(false);
    });

    it('Benchmark Case VINE-2: severe autism spectrum profile with low adaptive composite', () => {
      const input = {
        subdomains: {
          receptive: 8, expressive: 6, written: 7,
          personal: 11, domestic: 10, community: 9,
          interpersonal: 5, playLeisure: 5, coping: 6,
        },
      };

      const result = calculateVineland3(input);
      expect(result.subdomains.receptive.descriptor).toBe('Low');
      expect(result.subdomains.personal.descriptor).toBe('Moderately Low');

      expect(result.domains.communication.standardScore).toBe(64);
      expect(result.domains.communication.descriptor).toBe('Low');

      expect(result.domains.dailyLivingSkills.standardScore).toBe(78);
      expect(result.domains.dailyLivingSkills.descriptor).toBe('Moderately Low');

      expect(result.domains.socialization.standardScore).toBe(58);
      expect(result.domains.socialization.descriptor).toBe('Low');

      expect(result.abc.standardScore).toBe(63);
      expect(result.abc.descriptor).toBe('Low');
      expect(result.meetsClinicalCutoff).toBe(true);
      expect(result.clinicalAlert).toContain('Compromiso adaptativo global significativo');
    });
  });

  // ==========================================================================
  // 10. SENA Problem & Protective Multidimensional Engine
  // ==========================================================================
  describe('10. SENA Problem & Protective Multidimensional Engine', () => {
    it('Benchmark Case SENA-1: clinical elevations, protective resource deficit and active suicide red flag', () => {
      const input = {
        tScores: {
          depresion: 76,
          ansiedad: 72,
          somatizacion: 64,
          problemas_conducta: 48,
          hiperactividad: 50,
          aislamiento: 74,
          rigidez: 62,
          autoestima: 28, // Protective scale: T <= 30 is Clinical / Muy Bajo!
          integracion_social: 34, // Protective scale: T <= 40 is En Riesgo / Bajo
          inc: 48,
          neg: 62,
          pos: 40,
        },
        criticalItems: {
          suicidalIdeation: true,
        },
      };

      const result = calculateSena(input);
      expect(result.scales.depresion.classification).toBe('Clínico');
      expect(result.scales.ansiedad.classification).toBe('Clínico');
      expect(result.scales.somatizacion.classification).toBe('En Riesgo');
      expect(result.scales.autoestima.classification).toBe('Clínico / Muy Bajo');
      expect(result.scales.autoestima.isAlert).toBe(true);
      expect(result.scales.integracion_social.classification).toBe('En Riesgo / Bajo');

      expect(result.validity.isValidProtocol).toBe(true);
      expect(result.criticalAlerts.hasRedFlag).toBe(true);
      expect(result.criticalAlerts.flags).toContain('Ideación suicida detectada');
      expect(result.criticalAlerts.bannerMessage).toContain('ALERTA ROJA PRIORITARIA');
    });

    it('invalidation rule: rejects protocol when inconsistency INC >= 70', () => {
      const input = { tScores: { inc: 74 } };
      const val = validateSena(input);
      expect(val.validity.isValidProtocol).toBe(false);
      expect(val.validity.invalidationReason).toContain('Inconsistencia INC T=74 >= 70');
    });
  });

  // ==========================================================================
  // 11. CBCL (ASEBA) Asymmetric Cutoff Engine
  // ==========================================================================
  describe('11. CBCL (ASEBA) Asymmetric Cutoff Engine', () => {
    it('Benchmark Case CBCL-1: asymmetric borderline cutoff for broadband (T=60-63) vs syndromes (T=65-69)', () => {
      const input = {
        tScores: {
          internalizing: 52,
          externalizing: 62, // Broadband: T=62 -> Limítrofe (60-63)
          total_problems: 59, // Broadband: T=59 -> Normal (<60)
          anxious_depressed: 54,
          aggressive: 68,     // Syndrome: T=68 -> Limítrofe (65-69)
          attention: 61,      // Syndrome: T=61 -> Normal (<65)
        },
      };

      const result = calculateCbcl(input);
      expect(result.broadband.externalizing.classification).toBe('Limítrofe');
      expect(result.broadband.total_problems.classification).toBe('Normal');
      expect(result.syndromes.aggressive.classification).toBe('Limítrofe');
      expect(result.syndromes.attention.classification).toBe('Normal'); // Note: T=61 is normal for syndrome!
    });

    it('Benchmark Case CBCL-2: manifest clinical elevation on broadband (T >= 64) and DSM scales (T >= 70)', () => {
      const input = {
        tScores: {
          internalizing: 72, // Broadband: T >= 64 -> Clínico
          dsm_depressive: 75, // DSM: T >= 70 -> Clínico
        },
      };

      const result = calculateCbcl(input);
      expect(result.broadband.internalizing.classification).toBe('Clínico');
      expect(result.dsmScales.dsm_depressive.classification).toBe('Clínico');
      expect(result.clinicalElevations.some((e) => e.includes('internalizing'))).toBe(true);
      expect(result.clinicalElevations.some((e) => e.includes('dsm_depressive'))).toBe(true);
    });
  });

  // ==========================================================================
  // 12. BYI-2 Beck Youth Inventories Engine
  // ==========================================================================
  describe('12. BYI-2 Beck Youth Inventories Engine', () => {
    it('Benchmark Case BYI-1: adolescent clinical depression, anxiety and self-concept deficit with suicide item alert', () => {
      const input = {
        tScores: {
          BDI_Y: 72,
          BAI_Y: 64,
          BANI_Y: 52,
          BDBI_Y: 48,
          BSCI_Y: 36, // Self-concept inverted: T < 40 is Muy Inferior al Promedio
        },
        suicidalItemResponse: 2,
      };

      const result = calculateByi2(input);
      expect(result.inventories.BDI_Y.severity).toBe('Elevación Extremadamente Alta');
      expect(result.inventories.BAI_Y.severity).toBe('Elevación Moderada');
      expect(result.inventories.BANI_Y.severity).toBe('Promedio');
      expect(result.inventories.BSCI_Y.severity).toBe('Muy Inferior al Promedio');

      expect(result.suicideRiskAlert.triggered).toBe(true);
      expect(result.suicideRiskAlert.message).toContain('ítem 9 = 2');
    });
  });

  // ==========================================================================
  // 13. Raven 2 Progressive Matrices Engine
  // ==========================================================================
  describe('13. Raven 2 Progressive Matrices Engine', () => {
    it('Benchmark Case RAVEN-1: 10y 4m child with 26 hits -> standard IQ 100 (Promedio)', () => {
      const input = {
        ageYears: 10,
        ageMonths: 4,
        rawScore: 26,
      };

      const result = calculateRaven2(input);
      expect(result.abilityScore).toBe(513); // 350 + 26 * 6.25 = 512.5 -> 513
      expect(result.standardScore).toBe(100);
      expect(result.percentile).toBe(50);
      expect(result.qualitative).toBe('Promedio');
      expect(result.ci95).toEqual([93, 107]);
    });

    it('Benchmark Case RAVEN-2: 12y 0m child with 42 hits -> standard IQ 132 (Muy Superior)', () => {
      const input = {
        ageYears: 12,
        ageMonths: 0,
        rawScore: 42,
      };

      const result = calculateRaven2(input);
      expect(result.abilityScore).toBe(613); // 350 + 42 * 6.25 = 612.5 -> 613
      expect(result.standardScore).toBe(132);
      expect(result.percentile).toBeCloseTo(98.4, 0.5);
      expect(result.qualitative).toBe('Muy Superior');
      expect(result.ci95).toEqual([125, 139]);
    });

    it('Benchmark Case RAVEN-3: 15y 6m adolescent with 18 hits -> standard IQ 76 (Limítrofe)', () => {
      const input = {
        ageYears: 15,
        ageMonths: 6,
        rawScore: 18,
      };

      const result = calculateRaven2(input);
      expect(result.abilityScore).toBe(463);
      expect(result.standardScore).toBe(76);
      expect(result.percentile).toBeCloseTo(5.5, 1);
      expect(result.qualitative).toBe('Limítrofe');
      expect(result.ci95).toEqual([69, 83]);
    });

    it('handles extreme bounds: rawScore 0 and rawScore 48', () => {
      const floorRes = calculateRaven2({ ageYears: 10, rawScore: 0 });
      expect(floorRes.standardScore).toBeLessThanOrEqual(50);

      const ceilRes = calculateRaven2({ ageYears: 10, rawScore: 48 });
      expect(ceilRes.standardScore).toBeGreaterThanOrEqual(150);
    });
  });
});
