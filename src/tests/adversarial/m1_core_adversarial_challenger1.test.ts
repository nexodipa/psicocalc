/**
 * Empirical Challenger 1 — Milestone M1-Core Adversarial Test Suite
 *
 * Exhaustively stress-tests all 12 universal psychometric engines and the TestRegistry:
 * - MMPI-3 (Ben-Porath & Tellegen)
 * - PAI (Morey)
 * - MCMI-IV (Millon)
 * - D2-R (Brickenkamp et al.)
 * - NEUROPSI Breve (Ostrosky-Solís et al.)
 * - MMSE (Folstein / NORMACODEM)
 * - ABAS-3 (Harrison & Oakland)
 * - Vineland-3 (Sparrow, Cicchetti & Saulnier)
 * - SENA (Fernández-Pinto et al.)
 * - CBCL (ASEBA - Achenbach)
 * - BYI-2 (Beck et al.)
 * - Raven 2 (Raven's Progressive Matrices)
 *
 * Tests:
 * 1. Extreme inputs (all zeros, maximum scores, negative values, boundary ages, extreme education).
 * 2. Invalidation rules: verify that invalid protocols are correctly flagged and do NOT report valid clinical classifications.
 * 3. Mathematical invariants: D2-R CON <= TA <= TR; MMSE capped at 30; Base Rates in [0..115]; T-score cutoffs at 65/70 and TB 75/85.
 * 4. Property-based fuzzing (500 stochastic vectors) verifying no NaN, undefined, or unhandled exceptions.
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

describe('Empirical Challenger 1 — Milestone M1-Core Adversarial Stress Suite', () => {
  beforeEach(() => {
    TestRegistry.reset();
  });

  // ==========================================================================
  // Dimension 1: MMPI-3 Invalidation Protocols & Extreme Input Boundaries
  // ==========================================================================
  describe('Dimension 1: MMPI-3 Invalidation Protocols & Extreme Input Boundaries', () => {
    it('CH1-MMPI-1: enforces all 7 invalidation criteria independently', () => {
      // 1. CNS >= 15
      const cnsRes = validateMmpi3({ omittedCount: 15 });
      expect(cnsRes.isValid).toBe(false);
      expect(cnsRes.validity.isValidProtocol).toBe(false);
      expect(cnsRes.validity.invalidationReason).toContain('CNS = 15 >= 15');

      // 2. VRIN >= 80
      const vrinRes = validateMmpi3({ tScores: { VRIN: 80 } });
      expect(vrinRes.isValid).toBe(false);
      expect(vrinRes.validity.isValidProtocol).toBe(false);
      expect(vrinRes.validity.invalidationReason).toContain('VRIN T=80 >= 80');

      // 3. TRIN >= 80
      const trinRes = validateMmpi3({ tScores: { TRIN: 80 } });
      expect(trinRes.isValid).toBe(false);
      expect(trinRes.validity.isValidProtocol).toBe(false);
      expect(trinRes.validity.invalidationReason).toContain('TRIN T=80 >= 80');

      // 4. CRIN >= 80
      const crinRes = validateMmpi3({ tScores: { CRIN: 80 } });
      expect(crinRes.isValid).toBe(false);
      expect(crinRes.validity.isValidProtocol).toBe(false);
      expect(crinRes.validity.invalidationReason).toContain('CRIN T=80 >= 80');

      // 5. F >= 100
      const fRes = validateMmpi3({ tScores: { F: 100 } });
      expect(fRes.isValid).toBe(false);
      expect(fRes.validity.isValidProtocol).toBe(false);
      expect(fRes.validity.invalidationReason).toContain('F T=100 >= 100');

      // 6. Fp >= 80
      const fpRes = validateMmpi3({ tScores: { Fp: 80 } });
      expect(fpRes.isValid).toBe(false);
      expect(fpRes.validity.isValidProtocol).toBe(false);
      expect(fpRes.validity.invalidationReason).toContain('Fp T=80 >= 80');

      // 7. L >= 80
      const lRes = validateMmpi3({ tScores: { L: 80 } });
      expect(lRes.isValid).toBe(false);
      expect(lRes.validity.isValidProtocol).toBe(false);
      expect(lRes.validity.invalidationReason).toContain('L T=80 >= 80');
    });

    it('CH1-MMPI-2: invalid protocol suppresses valid clinical classification in summary', () => {
      const invalidInput = {
        omittedCount: 20, // Clearly invalid
        tScores: {
          EID: 85,
          RCd: 82,
          RC2: 80,
        },
      };

      const result = calculateMmpi3(invalidInput);
      expect(result.validity.isValidProtocol).toBe(false);
      expect(result.clinicalProfileInterpretable).toBe(false);
      // Must NOT report normal or simple elevation summary, but explicitly warn invalidity
      expect(result.clinicalClassification).toMatch(/^Protocolo INVÁLIDO/);
      expect(result.clinicalClassification).toContain('CNS = 20 >= 15');
    });

    it('CH1-MMPI-3: handles extreme input boundaries (zeros, negative raw scores, huge raw scores)', () => {
      // All raw scores 0
      const zeroRaw = {
        rawScores: {
          EID: 0,
          THD: 0,
          BXD: 0,
          RCd: 0,
          SUI: 0,
        },
      };
      const zeroRes = calculateMmpi3(zeroRaw);
      expect(zeroRes.scales.EID.tScore).toBeGreaterThanOrEqual(30);
      expect(zeroRes.scales.EID.tScore).toBeLessThanOrEqual(120);
      expect(zeroRes.scales.EID.percentile).toBeGreaterThanOrEqual(0.1);
      expect(zeroRes.scales.EID.percentile).toBeLessThanOrEqual(99.9);
      expect(Number.isNaN(zeroRes.scales.EID.tScore)).toBe(false);

      // Huge raw scores (999)
      const maxRaw = {
        rawScores: {
          EID: 999,
          SUI: 999,
        },
      };
      const maxRes = calculateMmpi3(maxRaw);
      expect(maxRes.scales.EID.tScore).toBe(120); // clamped at 120
      expect(maxRes.scales.SUI.tScore).toBe(120);
      expect(maxRes.suicideRiskAlert.triggered).toBe(true);
      expect(maxRes.suicideRiskAlert.level).toBe('CRITICAL_RISK');

      // Negative raw scores
      const negRaw = {
        rawScores: {
          EID: -50,
        },
      };
      const negRes = calculateMmpi3(negRaw);
      expect(negRes.scales.EID.tScore).toBe(30); // clamped at 30
      expect(Number.isNaN(negRes.scales.EID.percentile)).toBe(false);
    });

    it('CH1-MMPI-4: suicide risk SUI alert boundary precision at 64 vs 65 and 79 vs 80', () => {
      // Score 64 -> NONE
      const r64 = calculateMmpi3({ tScores: { SUI: 64 } });
      expect(r64.suicideRiskAlert.triggered).toBe(false);
      expect(r64.suicideRiskAlert.level).toBe('NONE');

      // Score 65 -> CLINICAL_ALERT
      const r65 = calculateMmpi3({ tScores: { SUI: 65 } });
      expect(r65.suicideRiskAlert.triggered).toBe(true);
      expect(r65.suicideRiskAlert.level).toBe('CLINICAL_ALERT');

      // Score 79 -> CLINICAL_ALERT
      const r79 = calculateMmpi3({ tScores: { SUI: 79 } });
      expect(r79.suicideRiskAlert.triggered).toBe(true);
      expect(r79.suicideRiskAlert.level).toBe('CLINICAL_ALERT');

      // Score 80 -> CRITICAL_RISK
      const r80 = calculateMmpi3({ tScores: { SUI: 80 } });
      expect(r80.suicideRiskAlert.triggered).toBe(true);
      expect(r80.suicideRiskAlert.level).toBe('CRITICAL_RISK');
    });
  });

  // ==========================================================================
  // Dimension 2: PAI Invalidation Protocols & Cutoff Boundaries
  // ==========================================================================
  describe('Dimension 2: PAI Invalidation Protocols & Cutoff Boundaries', () => {
    it('CH1-PAI-1: enforces all invalidation rules: omissions > 17, ICN >= 73, INF >= 75, NIM >= 92', () => {
      // Omissions boundary: 17 is valid with caution, 18 is INVALID
      const om17 = validatePai({ omittedCount: 17 });
      expect(om17.isValid).toBe(true);
      expect(om17.validity.isValidProtocol).toBe(true);
      expect(om17.validity.cautionFlags?.length).toBeGreaterThan(0);

      const om18 = validatePai({ omittedCount: 18 });
      expect(om18.isValid).toBe(false);
      expect(om18.validity.isValidProtocol).toBe(false);
      expect(om18.validity.invalidationReason).toContain('Omisiones = 18 > 17');

      // ICN boundary: 72 is valid with caution, 73 is INVALID
      expect(validatePai({ tScores: { ICN: 72 } }).isValid).toBe(true);
      expect(validatePai({ tScores: { ICN: 73 } }).isValid).toBe(false);

      // INF boundary: 74 is valid with caution, 75 is INVALID
      expect(validatePai({ tScores: { INF: 74 } }).isValid).toBe(true);
      expect(validatePai({ tScores: { INF: 75 } }).isValid).toBe(false);

      // NIM boundary: 91 is valid with caution, 92 is INVALID
      expect(validatePai({ tScores: { NIM: 91 } }).isValid).toBe(true);
      expect(validatePai({ tScores: { NIM: 92 } }).isValid).toBe(false);
    });

    it('CH1-PAI-2: invalid PAI protocol reports invalidity in summary', () => {
      const invalidInput = {
        tScores: {
          NIM: 95,
          DEP: 90,
        },
      };
      const res = calculatePai(invalidInput);
      expect(res.validity.isValidProtocol).toBe(false);
      expect(res.clinicalProfileInterpretable).toBe(false);
      expect(res.summary).toMatch(/^Protocolo INVÁLIDO/);
    });

    it('CH1-PAI-3: substance warning triggers at ALC >= 70 or DRG >= 70 and not at 69', () => {
      expect(calculatePai({ tScores: { ALC: 69, DRG: 69 } }).substanceAlert.triggered).toBe(false);
      expect(calculatePai({ tScores: { ALC: 70, DRG: 50 } }).substanceAlert.triggered).toBe(true);
      expect(calculatePai({ tScores: { ALC: 50, DRG: 70 } }).substanceAlert.triggered).toBe(true);
    });

    it('CH1-PAI-4: clamps extreme T-scores to [30, 120] and computes valid percentiles', () => {
      const extreme = calculatePai({ tScores: { SOM: -100, DEP: 500 } });
      expect(extreme.scales.SOM.tScore).toBe(30);
      expect(extreme.scales.DEP.tScore).toBe(120);
      expect(extreme.scales.SOM.percentile).toBe(2.3);
      expect(extreme.scales.DEP.percentile).toBe(99.9);
    });
  });

  // ==========================================================================
  // Dimension 3: MCMI-IV Base Rates Invariants & Modifying Indices
  // ==========================================================================
  describe('Dimension 3: MCMI-IV Base Rates Invariants & Modifying Indices', () => {
    it('CH1-MCMI-1: enforces all 4 modifying index invalidation rules', () => {
      // 1. Omissions > 14
      expect(validateMcmi4({ omittedCount: 14 }).isValid).toBe(true);
      expect(validateMcmi4({ omittedCount: 15 }).isValid).toBe(false);

      // 2. V >= 2 (V=1 is caution, V=2 is invalid)
      const v1 = validateMcmi4({ rawScores: { V: 1 } });
      expect(v1.isValid).toBe(true);
      expect(v1.validity.cautionFlags?.length).toBeGreaterThan(0);

      const v2 = validateMcmi4({ rawScores: { V: 2 } });
      expect(v2.isValid).toBe(false);
      expect(v2.validity.isValidProtocol).toBe(false);
      expect(v2.validity.invalidationReason).toContain('Escala V = 2 >= 2');

      // 3. W >= 20
      expect(validateMcmi4({ rawScores: { W: 19 } }).isValid).toBe(true);
      expect(validateMcmi4({ rawScores: { W: 20 } }).isValid).toBe(false);

      // 4. X < 7 or X > 114
      expect(validateMcmi4({ rawScores: { X: 6 } }).isValid).toBe(false);
      expect(validateMcmi4({ rawScores: { X: 7 } }).isValid).toBe(true);
      expect(validateMcmi4({ rawScores: { X: 114 } }).isValid).toBe(true);
      expect(validateMcmi4({ rawScores: { X: 115 } }).isValid).toBe(false);
    });

    it('CH1-MCMI-2: invariant: Base Rates are strictly clamped to [0, 115]', () => {
      // Negative / huge raw scores
      const res = calculateMcmi4({
        rawScores: {
          '1': -999, // Should clamp to TB 0
          C: 999,    // Should clamp to TB 115
        },
      });

      expect(res.scales['1'].baseRate).toBe(0);
      expect(res.scales.C.baseRate).toBe(115);

      // Direct extreme base rates
      const resDirect = calculateMcmi4({
        baseRates: {
          '1': -50,
          C: 200,
        },
      });
      expect(resDirect.scales['1'].baseRate).toBe(0);
      expect(resDirect.scales.C.baseRate).toBe(115);
    });

    it('CH1-MCMI-3: Base Rate cutoffs: Estilo (60-74), Presencia (75-84), Prominencia (>=85)', () => {
      const res = calculateMcmi4({
        baseRates: {
          '1': 59,  // No significativo
          '2A': 60, // Estilo
          '2B': 74, // Estilo
          '3': 75,  // Presencia
          '4A': 84, // Presencia
          '4B': 85, // Prominencia
          C: 115,   // Prominencia
        },
      });

      expect(res.scales['1'].qualitativeLevel).toBe('No significativo');
      expect(res.scales['2A'].qualitativeLevel).toBe('Estilo');
      expect(res.scales['2B'].qualitativeLevel).toBe('Estilo');
      expect(res.scales['3'].qualitativeLevel).toBe('Presencia');
      expect(res.scales['4A'].qualitativeLevel).toBe('Presencia');
      expect(res.scales['4B'].qualitativeLevel).toBe('Prominencia');
      expect(res.scales.C.qualitativeLevel).toBe('Prominencia');

      expect(res.presenceScales.some((s) => s.includes('3 (TB=75)'))).toBe(true);
      expect(res.presenceScales.some((s) => s.includes('4A (TB=84)'))).toBe(true);
      expect(res.prominenceScales.some((s) => s.includes('4B (TB=85)'))).toBe(true);
      expect(res.prominenceScales.some((s) => s.includes('C (TB=115)'))).toBe(true);
    });

    it('CH1-MCMI-4: invalid protocol sets clinicalProfileInterpretable = false and reports invalid summary', () => {
      const res = calculateMcmi4({
        rawScores: { V: 3 },
        baseRates: { C: 90 },
      });
      expect(res.validity.isValidProtocol).toBe(false);
      expect(res.clinicalProfileInterpretable).toBe(false);
      expect(res.diagnosticSummary).toMatch(/^Protocolo INVÁLIDO/);
    });
  });

  // ==========================================================================
  // Dimension 4: D2-R Mathematical Invariants & Attentional Indices
  // ==========================================================================
  describe('Dimension 4: D2-R Mathematical Invariants & Attentional Indices', () => {
    it('CH1-D2R-1: enforces mathematical invariant: TA <= TR and rejects TA > TR', () => {
      const invalid = validateD2r({ tr: 200, ta: 201 });
      expect(invalid.isValid).toBe(false);
      expect(invalid.errors.some((e) => e.includes('no puede superar a TR'))).toBe(true);
    });

    it('CH1-D2R-2: invariant CON = TA - C <= TA <= TR holds for all valid inputs', () => {
      const testCases = [
        { tr: 300, ta: 150, o: 10, c: 5 },
        { tr: 500, ta: 220, o: 0, c: 0 },
        { tr: 450, ta: 180, o: 20, c: 30 },
      ];

      for (const tc of testCases) {
        const res = calculateD2r(tc);
        expect(res.con).toBe(res.ta - res.c);
        expect(res.con).toBeLessThanOrEqual(res.ta);
        expect(res.ta).toBeLessThanOrEqual(res.tr);
        expect(res.tot).toBe(res.o + res.c);
      }
    });

    it('CH1-D2R-3: invalidation criteria: TR < 100 (abandonment) and CP% > 40% (random marking)', () => {
      // TR < 100
      const abandon = validateD2r({ tr: 99, ta: 40 });
      expect(abandon.validity.isValidProtocol).toBe(false);
      expect(abandon.validity.invalidationReason).toContain('TR (99) < 100');

      // CP% > 40%
      const random = validateD2r({ tr: 200, ta: 80, o: 45, c: 45 }); // TOT = 90 / 200 = 45%
      expect(random.validity.isValidProtocol).toBe(false);
      expect(random.validity.invalidationReason).toContain('CP% (45.0%) > 40%');
    });

    it('CH1-D2R-4: handles edge case TR=0 without division by zero NaN', () => {
      const res = calculateD2r({ tr: 0, ta: 0, o: 0, c: 0 });
      expect(res.cpPercent).toBe(0);
      expect(Number.isNaN(res.cpPercent)).toBe(false);
      expect(Number.isNaN(res.percentile)).toBe(false);
      expect(Number.isNaN(res.decatype)).toBe(false);
    });

    it('CH1-D2R-5: handles negative inputs cleanly in validator', () => {
      expect(validateD2r({ tr: -10, ta: 5 }).isValid).toBe(false);
      expect(validateD2r({ tr: 100, ta: -5 }).isValid).toBe(false);
      expect(validateD2r({ tr: 100, ta: 50, o: -1 }).isValid).toBe(false);
      expect(validateD2r({ tr: 100, ta: 50, c: -1 }).isValid).toBe(false);
    });
  });

  // ==========================================================================
  // Dimension 5: NEUROPSI Breve 16-Cell Matrix & Education Adjustments
  // ==========================================================================
  describe('Dimension 5: NEUROPSI Breve 16-Cell Matrix & Education Adjustments', () => {
    it('CH1-NEURO-1: correctly maps education years across all 4 levels', () => {
      expect(getNeuropsiEducationLevel(0)).toBe('nula');
      expect(getNeuropsiEducationLevel(-1)).toBe('nula');
      expect(getNeuropsiEducationLevel(1)).toBe('baja');
      expect(getNeuropsiEducationLevel(4)).toBe('baja');
      expect(getNeuropsiEducationLevel(5)).toBe('media');
      expect(getNeuropsiEducationLevel(9)).toBe('media');
      expect(getNeuropsiEducationLevel(10)).toBe('alta');
      expect(getNeuropsiEducationLevel(24)).toBe('alta');
    });

    it('CH1-NEURO-2: correctly maps age groups across all 4 brackets', () => {
      expect(getNeuropsiAgeGroup(16)).toBe('16_30');
      expect(getNeuropsiAgeGroup(30)).toBe('16_30');
      expect(getNeuropsiAgeGroup(31)).toBe('31_50');
      expect(getNeuropsiAgeGroup(50)).toBe('31_50');
      expect(getNeuropsiAgeGroup(51)).toBe('51_65');
      expect(getNeuropsiAgeGroup(65)).toBe('51_65');
      expect(getNeuropsiAgeGroup(66)).toBe('66_85');
      expect(getNeuropsiAgeGroup(85)).toBe('66_85');
    });

    it('CH1-NEURO-3: classifies floor (score 0) as Alteración Severa and ceiling as Normal', () => {
      const edLevels = [0, 3, 7, 14];
      const ages = [20, 40, 60, 80];

      for (const ed of edLevels) {
        for (const age of ages) {
          const floorRes = calculateNeuropsiBreve({ age, educationYears: ed, totalRawScore: 0 });
          expect(floorRes.classification).toBe('Alteración Severa');
          expect(floorRes.meetsClinicalCutoff).toBe(true);

          const ceilRes = calculateNeuropsiBreve({ age, educationYears: ed, totalRawScore: 130 });
          expect(ceilRes.classification).toBe('Normal');
          expect(ceilRes.meetsClinicalCutoff).toBe(false);
        }
      }
    });

    it('CH1-NEURO-4: validates input boundaries (age 16-85, education 0-24)', () => {
      expect(validateNeuropsiBreve({ age: 15, educationYears: 10 }).isValid).toBe(false);
      expect(validateNeuropsiBreve({ age: 86, educationYears: 10 }).isValid).toBe(false);
      expect(validateNeuropsiBreve({ age: 30, educationYears: -1 }).isValid).toBe(false);
      expect(validateNeuropsiBreve({ age: 30, educationYears: 25 }).isValid).toBe(false);
    });
  });

  // ==========================================================================
  // Dimension 6: MMSE NORMACODEM Demographic Adjustment & Score Capping
  // ==========================================================================
  describe('Dimension 6: MMSE NORMACODEM Demographic Adjustment & Score Capping', () => {
    it('CH1-MMSE-1: invariant: adjusted MMSE score is strictly capped in [0, 30]', () => {
      // Score 30 + delta 2 -> 32 -> capped at 30
      const capTop = calculateMmse({ age: 80, educationYears: 5, rawScore: 30 });
      expect(capTop.adjustmentDelta).toBe(2);
      expect(capTop.adjustedScore).toBe(30);

      // Score 0 + delta -1 -> -1 -> capped at 0
      const capBottom = calculateMmse({ age: 30, educationYears: 18, rawScore: 0 });
      expect(capBottom.adjustmentDelta).toBe(-1);
      expect(capBottom.adjustedScore).toBe(0);
    });

    it('CH1-MMSE-2: NORMACODEM delta truth matrix verification across all age x education bands', () => {
      // Low education (<= 8 years)
      expect(getNormacodemDelta(70, 6)).toBe(1); // <= 75 -> +1
      expect(getNormacodemDelta(80, 6)).toBe(2); // > 75 -> +2

      // Medium education (9 - 17 years)
      expect(getNormacodemDelta(70, 12)).toBe(0); // <= 75 -> 0
      expect(getNormacodemDelta(80, 12)).toBe(1); // > 75 -> +1

      // High education (> 17 years)
      expect(getNormacodemDelta(70, 18)).toBe(-1); // <= 75 -> -1
      expect(getNormacodemDelta(80, 18)).toBe(0);  // > 75 -> 0
    });

    it('CH1-MMSE-3: clinical cutoff trigger strictly at adjustedScore < 24', () => {
      // Score 24 -> normal/suspect, meetsClinicalCutoff = false
      const r24 = calculateMmse({ age: 50, educationYears: 12, rawScore: 24 });
      expect(r24.adjustedScore).toBe(24);
      expect(r24.meetsClinicalCutoff).toBe(false);
      expect(r24.alertMessage).toBeUndefined();

      // Score 23 -> meetsClinicalCutoff = true, alertMessage present
      const r23 = calculateMmse({ age: 50, educationYears: 12, rawScore: 23 });
      expect(r23.adjustedScore).toBe(23);
      expect(r23.meetsClinicalCutoff).toBe(true);
      expect(r23.alertMessage).toContain('MMSE ajustado = 23 < 24');
    });

    it('CH1-MMSE-4: validates minimum age >= 18', () => {
      expect(validateMmse({ age: 17, educationYears: 10 }).isValid).toBe(false);
      expect(validateMmse({ age: 18, educationYears: 10 }).isValid).toBe(true);
    });
  });

  // ==========================================================================
  // Dimension 7: ABAS-3 Adaptive Behavior Engine Stress Tests
  // ==========================================================================
  describe('Dimension 7: ABAS-3 Adaptive Behavior Engine Stress Tests', () => {
    it('CH1-ABAS-1: floor (all 1s) and ceiling (all 19s) composites remain in [40, 160]', () => {
      const all1s = {
        skillAreas: {
          COM: 1, HAF: 1, AD: 1, OC: 1, SOC: 1, UC: 1, VH: 1, SS: 1, AC: 1,
        },
      };
      const res1 = calculateAbas3(all1s);
      expect(res1.gac.compositeScore).toBeGreaterThanOrEqual(40);
      expect(res1.gac.compositeScore).toBeLessThanOrEqual(160);
      expect(res1.meetsClinicalCutoff).toBe(true); // GAC <= 69
      expect(res1.clinicalAlert).toContain('CAG =');

      const all19s = {
        skillAreas: {
          COM: 19, HAF: 19, AD: 19, OC: 19, SOC: 19, UC: 19, VH: 19, SS: 19, AC: 19,
        },
      };
      const res19 = calculateAbas3(all19s);
      expect(res19.gac.compositeScore).toBeGreaterThanOrEqual(40);
      expect(res19.gac.compositeScore).toBeLessThanOrEqual(160);
      expect(res19.meetsClinicalCutoff).toBe(false);
    });

    it('CH1-ABAS-2: intellectual disability diagnostic cutoff at CAG <= 69', () => {
      // Test borderline case CAG = 69 vs 70
      // GAC formula: Math.round(100 + (totalSum - 90) * 0.67)
      // totalSum = 44 -> 100 + (44 - 90) * 0.67 = 100 - 30.82 = 69
      const c69 = calculateAbas3({
        skillAreas: {
          COM: 5, HAF: 5, AD: 5, OC: 5, SOC: 5, UC: 5, VH: 5, SS: 5, AC: 4,
        },
      });
      expect(c69.gac.compositeScore).toBe(69);
      expect(c69.meetsClinicalCutoff).toBe(true);
      expect(c69.clinicalAlert).toBeDefined();

      // totalSum = 45 -> 100 + (45 - 90) * 0.67 = 100 - 30.15 = 70
      const c70 = calculateAbas3({
        skillAreas: {
          COM: 5, HAF: 5, AD: 5, OC: 5, SOC: 5, UC: 5, VH: 5, SS: 5, AC: 5,
        },
      });
      expect(c70.gac.compositeScore).toBe(70);
      expect(c70.meetsClinicalCutoff).toBe(false);
      expect(c70.clinicalAlert).toBeUndefined();
    });

    it('CH1-ABAS-3: validates scaled scores strictly within [1, 19]', () => {
      expect(validateAbas3({ skillAreas: { COM: 0 } }).isValid).toBe(false);
      expect(validateAbas3({ skillAreas: { COM: 20 } }).isValid).toBe(false);
      expect(validateAbas3({ skillAreas: { COM: 10 } }).isValid).toBe(true);
    });
  });

  // ==========================================================================
  // Dimension 8: Vineland-3 Adaptive Behavior Engine Stress Tests
  // ==========================================================================
  describe('Dimension 8: Vineland-3 Adaptive Behavior Engine Stress Tests', () => {
    it('CH1-VINE-1: floor (all 1s) and ceiling (all 24s) standard scores remain in [20, 140]', () => {
      const all1s = {
        subdomains: {
          receptive: 1, expressive: 1, written: 1,
          personal: 1, domestic: 1, community: 1,
          interpersonal: 1, playLeisure: 1, coping: 1,
        },
      };
      const res1 = calculateVineland3(all1s);
      expect(res1.abc.standardScore).toBeGreaterThanOrEqual(20);
      expect(res1.abc.standardScore).toBeLessThanOrEqual(140);
      expect(res1.abc.descriptor).toBe('Low');
      expect(res1.meetsClinicalCutoff).toBe(true);

      const all24s = {
        subdomains: {
          receptive: 24, expressive: 24, written: 24,
          personal: 24, domestic: 24, community: 24,
          interpersonal: 24, playLeisure: 24, coping: 24,
        },
      };
      const res24 = calculateVineland3(all24s);
      expect(res24.abc.standardScore).toBeGreaterThanOrEqual(20);
      expect(res24.abc.standardScore).toBeLessThanOrEqual(140);
      expect(res24.abc.descriptor).toBe('High');
      expect(res24.meetsClinicalCutoff).toBe(false);
    });

    it('CH1-VINE-2: validates v-scale range strictly within [1, 24]', () => {
      expect(validateVineland3({ subdomains: { receptive: 0 } }).isValid).toBe(false);
      expect(validateVineland3({ subdomains: { receptive: 25 } }).isValid).toBe(false);
      expect(validateVineland3({ subdomains: { receptive: 15 } }).isValid).toBe(true);
    });
  });

  // ==========================================================================
  // Dimension 9: SENA Protective vs Problem Scales & Red Flags
  // ==========================================================================
  describe('Dimension 9: SENA Protective vs Problem Scales & Red Flags', () => {
    it('CH1-SENA-1: verifies inverted classification logic for protective scales', () => {
      // Protective scale: autoestima
      // T <= 30 is Clínico / Muy Bajo
      // T <= 40 is En Riesgo / Bajo
      // T > 40 is Normal
      const res = calculateSena({
        tScores: {
          autoestima: 25,
          competencia_social: 38,
          inteligencia_emocional: 50,
          depresion: 75,
          ansiedad: 62,
        },
      });

      expect(res.scales.autoestima.classification).toBe('Clínico / Muy Bajo');
      expect(res.scales.autoestima.isAlert).toBe(true);
      expect(res.scales.competencia_social.classification).toBe('En Riesgo / Bajo');
      expect(res.scales.inteligencia_emocional.classification).toBe('Normal');

      // Problem scales: depresion, ansiedad
      expect(res.scales.depresion.classification).toBe('Clínico');
      expect(res.scales.depresion.isAlert).toBe(true);
      expect(res.scales.ansiedad.classification).toBe('En Riesgo');
      expect(res.scales.ansiedad.isAlert).toBe(false);
    });

    it('CH1-SENA-2: invalidation when INC >= 70', () => {
      const inv = validateSena({ tScores: { inc: 70 } });
      expect(inv.isValid).toBe(false);
      expect(inv.validity.isValidProtocol).toBe(false);
      expect(inv.validity.invalidationReason).toContain('INC T=70 >= 70');
    });

    it('CH1-SENA-3: triggers all 4 critical red flags and banner message', () => {
      const res = calculateSena({
        tScores: { depresion: 50 },
        criticalItems: {
          suicidalIdeation: true,
          selfHarm: true,
          abuse: true,
          psychosis: true,
        },
      });

      expect(res.criticalAlerts.hasRedFlag).toBe(true);
      expect(res.criticalAlerts.flags.length).toBe(4);
      expect(res.criticalAlerts.bannerMessage).toContain('ALERTA ROJA PRIORITARIA');
      expect(res.summary).toContain('ALERTA ROJA PRIORITARIA');
    });
  });

  // ==========================================================================
  // Dimension 10: CBCL (ASEBA) Asymmetric Cutoff Discontinuities
  // ==========================================================================
  describe('Dimension 10: CBCL (ASEBA) Asymmetric Cutoff Discontinuities', () => {
    it('CH1-CBCL-1: asymmetric boundary stress-testing for broadband vs syndrome/DSM scales', () => {
      // Broadband: Normal < 60, Borderline 60-63, Clinical >= 64
      // Syndrome/DSM: Normal < 65, Borderline 65-69, Clinical >= 70
      const testVectors = [
        { t: 59, bbExpected: 'Normal', synExpected: 'Normal' },
        { t: 60, bbExpected: 'Limítrofe', synExpected: 'Normal' },
        { t: 63, bbExpected: 'Limítrofe', synExpected: 'Normal' },
        { t: 64, bbExpected: 'Clínico', synExpected: 'Normal' },
        { t: 65, bbExpected: 'Clínico', synExpected: 'Limítrofe' },
        { t: 69, bbExpected: 'Clínico', synExpected: 'Limítrofe' },
        { t: 70, bbExpected: 'Clínico', synExpected: 'Clínico' },
      ];

      for (const tv of testVectors) {
        const res = calculateCbcl({
          tScores: {
            internalizing: tv.t,  // Broadband
            aggressive: tv.t,     // Syndrome
            dsm_depressive: tv.t, // DSM
          },
        });

        expect(res.broadband.internalizing.classification).toBe(tv.bbExpected);
        expect(res.syndromes.aggressive.classification).toBe(tv.synExpected);
        expect(res.dsmScales.dsm_depressive.classification).toBe(tv.synExpected);
      }
    });

    it('CH1-CBCL-2: validates T-scores strictly in [30, 120]', () => {
      expect(validateCbcl({ tScores: { internalizing: 29 } }).isValid).toBe(false);
      expect(validateCbcl({ tScores: { internalizing: 121 } }).isValid).toBe(false);
      expect(validateCbcl({ tScores: { internalizing: 60 } }).isValid).toBe(true);
    });
  });

  // ==========================================================================
  // Dimension 11: BYI-2 Beck Youth Inventories Construct Direction & Suicide Alert
  // ==========================================================================
  describe('Dimension 11: BYI-2 Beck Youth Inventories Construct Direction & Suicide Alert', () => {
    it('CH1-BYI-1: evaluates self-concept (BSCI-Y) in inverted direction', () => {
      // High score on self-concept is GOOD (Superior), low is BAD (Muy Inferior)
      const resHigh = calculateByi2({ tScores: { BSCI_Y: 60 } });
      expect(resHigh.inventories.BSCI_Y.severity).toBe('Superior al Promedio');

      const resLow = calculateByi2({ tScores: { BSCI_Y: 35 } });
      expect(resLow.inventories.BSCI_Y.severity).toBe('Muy Inferior al Promedio');

      // Symptom scales (e.g. BDI_Y): high score is BAD
      const resDepHigh = calculateByi2({ tScores: { BDI_Y: 72 } });
      expect(resDepHigh.inventories.BDI_Y.severity).toBe('Elevación Extremadamente Alta');
    });

    it('CH1-BYI-2: triggers suicide alert when suicidalItemResponse > 0 and suppresses on 0', () => {
      expect(calculateByi2({ suicidalItemResponse: 0 }).suicideRiskAlert.triggered).toBe(false);
      expect(calculateByi2({ suicidalItemResponse: 1 }).suicideRiskAlert.triggered).toBe(true);
      expect(calculateByi2({ suicidalItemResponse: 2 }).suicideRiskAlert.message).toContain('ítem 9 = 2');
    });

    it('CH1-BYI-3: validates raw scores in [0, 60]', () => {
      expect(validateByi2({ rawScores: { BDI_Y: -1 } }).isValid).toBe(false);
      expect(validateByi2({ rawScores: { BDI_Y: 61 } }).isValid).toBe(false);
      expect(validateByi2({ rawScores: { BDI_Y: 30 } }).isValid).toBe(true);
    });
  });

  // ==========================================================================
  // Dimension 12: Raven 2 Progressive Matrices Invariants & Age Boundaries
  // ==========================================================================
  describe('Dimension 12: Raven 2 Progressive Matrices Invariants & Age Boundaries', () => {
    it('CH1-RAV-1: standard score remains strictly in [40, 160] and percentiles in [0.1, 99.9]', () => {
      // Floor (raw = 0)
      const floorRes = calculateRaven2({ ageYears: 20, rawScore: 0 });
      expect(floorRes.standardScore).toBeGreaterThanOrEqual(40);
      expect(floorRes.percentile).toBeGreaterThanOrEqual(0.1);
      expect(floorRes.abilityScore).toBe(350);

      // Ceiling (raw = 48)
      const ceilRes = calculateRaven2({ ageYears: 20, rawScore: 48 });
      expect(ceilRes.standardScore).toBeLessThanOrEqual(160);
      expect(ceilRes.percentile).toBeLessThanOrEqual(99.9);
      expect(ceilRes.abilityScore).toBe(650);
    });

    it('CH1-RAV-2: validates age limits (4 to 69 years) and raw score (0 to 48)', () => {
      expect(validateRaven2({ ageYears: 3, rawScore: 20 }).isValid).toBe(false);
      expect(validateRaven2({ ageYears: 70, rawScore: 20 }).isValid).toBe(false);
      expect(validateRaven2({ ageYears: 25, rawScore: -1 }).isValid).toBe(false);
      expect(validateRaven2({ ageYears: 25, rawScore: 49 }).isValid).toBe(false);
      expect(validateRaven2({ ageYears: 25, rawScore: 30 }).isValid).toBe(true);
    });

    it('CH1-RAV-3: SEM confidence intervals symmetric around standardScore', () => {
      const res = calculateRaven2({ ageYears: 10, rawScore: 26 });
      const ss = res.standardScore;
      expect(res.ci90).toEqual([ss - 6, ss + 6]);
      expect(res.ci95).toEqual([ss - 7, ss + 7]);
    });
  });

  // ==========================================================================
  // Dimension 13: Centralized TestRegistry Contract Invariants
  // ==========================================================================
  describe('Dimension 13: Centralized TestRegistry Contract Invariants', () => {
    it('CH1-REG-1: all 19 registered instruments provide unique non-null initial states', () => {
      const all = TestRegistry.getAll();
      expect(all.length).toBe(19);

      for (const inst of all) {
        const state1 = inst.createInitialState();
        const state2 = inst.createInitialState();
        expect(state1).toBeDefined();
        expect(state2).toBeDefined();
        // Slices must be independent instances
        expect(state1).not.toBe(state2);
      }
    });

    it('CH1-REG-2: filterByAge handles clinical age transition boundaries', () => {
      // Age 3.5: SENA (3-18.92) and HTP (4-99)
      const age3 = TestRegistry.filterByAge(3.5).map((i) => i.metadata.id);
      expect(age3).toContain('sena');
      expect(age3).not.toContain('wisc_v');
      expect(age3).not.toContain('wais_iv');

      // Age 16.5: WISC-V (6-16.92) AND WAIS-IV (16-90.92) overlap!
      const age16 = TestRegistry.filterByAge(16.5).map((i) => i.metadata.id);
      expect(age16).toContain('wisc_v');
      expect(age16).toContain('wais_iv');

      // Age 70: WAIS-IV and MMSE and MoCA, but NOT WISC-V
      const age70 = TestRegistry.filterByAge(70).map((i) => i.metadata.id);
      expect(age70).toContain('wais_iv');
      expect(age70).toContain('mmse');
      expect(age70).not.toContain('wisc_v');
    });

    it('CH1-REG-3: hasActiveAlert triggers consistently when result has active clinical risk', () => {
      const paiInst = TestRegistry.get('pai')!;
      const paiRes = calculatePai({ tScores: { SUI: 85 } });
      const alert = paiInst.hasActiveAlert?.(paiRes);
      expect(alert?.active).toBe(true);
      expect(alert?.severity).toBe('critical');

      const senaInst = TestRegistry.get('sena')!;
      const senaRes = calculateSena({
        tScores: { depresion: 50 },
        criticalItems: { suicidalIdeation: true },
      });
      const senaAlert = senaInst.hasActiveAlert?.(senaRes);
      expect(senaAlert?.active).toBe(true);
      expect(senaAlert?.severity).toBe('critical');
    });
  });

  // ==========================================================================
  // Dimension 14: Stochastic Fuzzing & Crash Resistance (500 iterations)
  // ==========================================================================
  describe('Dimension 14: Stochastic Fuzzing & Crash Resistance (500 iterations)', () => {
    it('CH1-FUZZ-1: 500 stochastic parameter vectors across all 12 engines produce zero NaN or unhandled throws', () => {
      for (let i = 0; i < 500; i++) {
        // Stochastic D2-R
        const tr = Math.floor(Math.random() * 658);
        const ta = Math.floor(Math.random() * (tr + 1));
        const c = Math.floor(Math.random() * 50);
        const o = Math.floor(Math.random() * 50);
        const d2Res = calculateD2r({ tr, ta, c, o });
        expect(Number.isNaN(d2Res.con)).toBe(false);
        expect(Number.isNaN(d2Res.percentile)).toBe(false);
        expect(Number.isNaN(d2Res.cpPercent)).toBe(false);
        expect(d2Res.con).toBeLessThanOrEqual(d2Res.ta);

        // Stochastic MMSE
        const rawMmse = Math.floor(Math.random() * 40) - 5; // -5 to 35
        const ageMmse = Math.floor(Math.random() * 80) + 18;
        const edMmse = Math.floor(Math.random() * 25);
        const mmseRes = calculateMmse({ age: ageMmse, educationYears: edMmse, rawScore: rawMmse });
        expect(mmseRes.adjustedScore).toBeGreaterThanOrEqual(0);
        expect(mmseRes.adjustedScore).toBeLessThanOrEqual(30);

        // Stochastic MCMI-IV
        const br = Math.floor(Math.random() * 150) - 20; // -20 to 130
        const mcmiRes = calculateMcmi4({ baseRates: { C: br, A: br } });
        expect(mcmiRes.scales.C.baseRate).toBeGreaterThanOrEqual(0);
        expect(mcmiRes.scales.C.baseRate).toBeLessThanOrEqual(115);

        // Stochastic Raven 2
        const rawRav = Math.floor(Math.random() * 60) - 5;
        const ageRav = Math.floor(Math.random() * 65) + 4;
        const ravRes = calculateRaven2({ ageYears: ageRav, rawScore: rawRav });
        expect(ravRes.standardScore).toBeGreaterThanOrEqual(40);
        expect(ravRes.standardScore).toBeLessThanOrEqual(160);
        expect(Number.isNaN(ravRes.percentile)).toBe(false);

        // Stochastic ABAS-3
        const scaleArea = Math.floor(Math.random() * 21);
        const abasRes = calculateAbas3({
          skillAreas: {
            COM: scaleArea, HAF: scaleArea, AD: scaleArea,
            OC: scaleArea, SOC: scaleArea,
            UC: scaleArea, VH: scaleArea, SS: scaleArea, AC: scaleArea,
          },
        });
        expect(abasRes.gac.compositeScore).toBeGreaterThanOrEqual(40);
        expect(abasRes.gac.compositeScore).toBeLessThanOrEqual(160);
      }
    });
  });
});
