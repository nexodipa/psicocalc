/**
 * Unit Test Suite for Clinical Psychometric Engines (Milestone M5):
 * - SDQ (Strengths and Difficulties Questionnaire - Goodman)
 * - PHQ-9 (Patient Health Questionnaire - 9 - Kroenke & Spitzer)
 * - GAD-7 (Generalized Anxiety Disorder - 7 - Spitzer et al.)
 * - MoCA (Montreal Cognitive Assessment - Nasreddine)
 *
 * Validates all 8 benchmark cases from clinical_specs.md, reversed items,
 * severity classifications, prorating, cutoff bands, and education adjustments.
 */

import { describe, it, expect } from 'vitest';
import {
  // SDQ
  invertSdqItem,
  isSdqItemReversed,
  calculateSdqSubscaleScore,
  classifySdqSubscale,
  classifySdqTotalDifficulties,
  calculateSdq,
  validateSdqInput,
  SDQ_REVERSED_ITEMS,
  // PHQ-9
  calculatePhq9,
  classifyPhq9Severity,
  evaluatePhq9MajorDepression,
  checkPhq9SuicideAlert,
  validatePhq9Input,
  // GAD-7
  calculateGad7,
  classifyGad7Severity,
  validateGad7Input,
  // MoCA
  calculateMoca,
  classifyMoca,
  getMocaEducationAdjustment,
  getMocaSerial7Score,
  validateMocaInput
} from '../../core';

describe('Clinical Psychometric Engines — Milestone M5', () => {

  // ==========================================================================
  // Section 1: Official 8 Benchmark Cases from clinical_specs.md
  // ==========================================================================
  describe('Authoritative Benchmark Cases (clinical_specs.md §10)', () => {

    it('Benchmark SDQ-1: Normal Típico (Padres / Informante: parent)', () => {
      // Direct items 0, prosocial items 2 (1, 4, 9, 17, 20)
      // Inverted items 2 (7, 11, 14, 21, 25)
      const responses: Record<number, number> = {
        1: 2,  2: 0,  3: 0,  4: 2,  5: 0,
        6: 0,  7: 2,  8: 0,  9: 2, 10: 0,
        11: 2, 12: 0, 13: 0, 14: 2, 15: 0,
        16: 0, 17: 2, 18: 0, 19: 0, 20: 2,
        21: 2, 22: 0, 23: 0, 24: 0, 25: 2
      };

      const result = calculateSdq({ informant: 'parent', responses });

      // Inverted items (7, 11, 14, 21, 25) should invert to 2 - 2 = 0
      expect(result.itemScores[7]).toBe(0);
      expect(result.itemScores[11]).toBe(0);
      expect(result.itemScores[14]).toBe(0);
      expect(result.itemScores[21]).toBe(0);
      expect(result.itemScores[25]).toBe(0);

      // Subscale scores
      expect(result.subscales.emotional.rawScore).toBe(0);
      expect(result.subscales.emotional.classification).toBe('Normal');

      expect(result.subscales.conduct.rawScore).toBe(0);
      expect(result.subscales.conduct.classification).toBe('Normal');

      expect(result.subscales.hyperactivity.rawScore).toBe(0);
      expect(result.subscales.hyperactivity.classification).toBe('Normal');

      expect(result.subscales.peer.rawScore).toBe(0);
      expect(result.subscales.peer.classification).toBe('Normal');

      expect(result.subscales.prosocial.rawScore).toBe(10);
      expect(result.subscales.prosocial.classification).toBe('Normal');

      // Total Difficulties: strictly 0 (prosocial excluded)
      expect(result.totalDifficulties.score).toBe(0);
      expect(result.totalDifficulties.classification).toBe('Normal');
      expect(result.isProrated).toBe(false);
      expect(result.isValid).toBe(true);
    });

    it('Benchmark SDQ-2: Caso Clínico Fronterizo / Limítrofe (Padres / Informante: parent)', () => {
      // Target subscale scores for borderline:
      // emotional: 4 (Borderline for parent: 4)
      // conduct: 3 (Borderline for parent: 3)
      // hyperactivity: 6 (Borderline for parent: 6)
      // peer: 3 (Borderline for parent: 3)
      // prosocial: 5 (Borderline for parent: 5)
      const responses: Record<number, number> = {
        // Prosocial items: 1, 4, 9, 17, 20 -> sum to 5 (e.g. 1, 1, 1, 1, 1)
        1: 1, 4: 1, 9: 1, 17: 1, 20: 1,

        // Emotional items: 3, 8, 13, 16, 24 -> sum to 4 (e.g. 1, 1, 1, 1, 0)
        3: 1, 8: 1, 13: 1, 16: 1, 24: 0,

        // Conduct items: 5, 7(inv), 12, 18, 22 -> sum to 3
        // Let item 7 raw = 1 -> inv = 1; items 5=1, 12=1, 18=0, 22=0 -> sum = 3
        5: 1, 7: 1, 12: 1, 18: 0, 22: 0,

        // Hyperactivity items: 2, 10, 15, 21(inv), 25(inv) -> sum to 6
        // Let 21 raw = 0 (inv -> 2), 25 raw = 0 (inv -> 2), item 2 = 1, 10 = 1, 15 = 0 -> sum = 6
        2: 1, 10: 1, 15: 0, 21: 0, 25: 0,

        // Peer items: 6, 11(inv), 14(inv), 19, 23 -> sum to 3
        // Let 11 raw = 1 (inv -> 1), 14 raw = 1 (inv -> 1), 6 = 1, 19 = 0, 23 = 0 -> sum = 3
        6: 1, 11: 1, 14: 1, 19: 0, 23: 0
      };

      const result = calculateSdq({ informant: 'parent', responses });

      expect(result.subscales.emotional.rawScore).toBe(4);
      expect(result.subscales.emotional.classification).toBe('Borderline');

      expect(result.subscales.conduct.rawScore).toBe(3);
      expect(result.subscales.conduct.classification).toBe('Borderline');

      expect(result.subscales.hyperactivity.rawScore).toBe(6);
      expect(result.subscales.hyperactivity.classification).toBe('Borderline');

      expect(result.subscales.peer.rawScore).toBe(3);
      expect(result.subscales.peer.classification).toBe('Borderline');

      expect(result.subscales.prosocial.rawScore).toBe(5);
      expect(result.subscales.prosocial.classification).toBe('Borderline');

      // Total Difficulties = 4 + 3 + 6 + 3 = 16 (Borderline for parent: 14-16)
      expect(result.totalDifficulties.score).toBe(16);
      expect(result.totalDifficulties.classification).toBe('Borderline');
    });

    it('Benchmark SDQ-3: Caso Clínico Complejo / Patología Grave (Autoinforme / Informante: self)', () => {
      // Direct difficulty items = 2
      // Inverted difficulty items (7, 11, 14, 21, 25) = 0 (invert to 2 - 0 = 2)
      // Prosocial items (1, 4, 9, 17, 20) = 0
      const responses: Record<number, number> = {
        // Prosocial: all 0
        1: 0, 4: 0, 9: 0, 17: 0, 20: 0,
        // Emotional: 3, 8, 13, 16, 24 in 2 -> sum = 10
        3: 2, 8: 2, 13: 2, 16: 2, 24: 2,
        // Conduct: 5(2), 7(raw 0 -> inv 2), 12(2), 18(2), 22(2) -> sum = 10
        5: 2, 7: 0, 12: 2, 18: 2, 22: 2,
        // Hyperactivity: 2(2), 10(2), 15(2), 21(raw 0 -> inv 2), 25(raw 0 -> inv 2) -> sum = 10
        2: 2, 10: 2, 15: 2, 21: 0, 25: 0,
        // Peer: 6(2), 11(raw 0 -> inv 2), 14(raw 0 -> inv 2), 19(2), 23(2) -> sum = 10
        6: 2, 11: 0, 14: 0, 19: 2, 23: 2
      };

      const result = calculateSdq({ informant: 'self', responses });

      expect(result.subscales.emotional.rawScore).toBe(10);
      expect(result.subscales.emotional.classification).toBe('Abnormal');

      expect(result.subscales.conduct.rawScore).toBe(10);
      expect(result.subscales.conduct.classification).toBe('Abnormal');

      expect(result.subscales.hyperactivity.rawScore).toBe(10);
      expect(result.subscales.hyperactivity.classification).toBe('Abnormal');

      expect(result.subscales.peer.rawScore).toBe(10);
      expect(result.subscales.peer.classification).toBe('Abnormal');

      expect(result.subscales.prosocial.rawScore).toBe(0);
      expect(result.subscales.prosocial.classification).toBe('Abnormal');

      // Total Difficulties = 10 + 10 + 10 + 10 = 40 (Abnormal)
      expect(result.totalDifficulties.score).toBe(40);
      expect(result.totalDifficulties.classification).toBe('Abnormal');
    });

    it('Benchmark PHQ9-1: Alerta Suicida Aislada con Puntuación Mínima', () => {
      // Items 1 to 8 = 0; Item 9 = 1
      const responses = [0, 0, 0, 0, 0, 0, 0, 0, 1];
      const result = calculatePhq9(responses);

      expect(result.totalScore).toBe(1);
      expect(result.severity).toBe('Ninguna / Mínima');
      expect(result.meetsClinicalCutoff).toBe(false);
      expect(result.meetsMajorDepressionCriteria).toBe(false);

      // Unconditional suicide risk alert triggered
      expect(result.isItem9AlertActive).toBe(true);
      expect(result.suicideRiskAlert.triggered).toBe(true);
      expect(result.suicideRiskAlert.level).toBe('CRITICAL');
      expect(result.suicideRiskAlert.itemScore).toBe(1);
      expect(result.suicideRiskAlert.clinicalActionRequired).toBe(true);
      expect(result.alertLevel).toBe('CRITICAL');
    });

    it('Benchmark PHQ9-2: Depresión Severa con Ideación Suicida Activa', () => {
      // Items 1 to 9 = all 3
      const responses = [3, 3, 3, 3, 3, 3, 3, 3, 3];
      const result = calculatePhq9(responses);

      expect(result.totalScore).toBe(27);
      expect(result.severity).toBe('Severa');
      expect(result.meetsClinicalCutoff).toBe(true);
      expect(result.meetsMajorDepressionCriteria).toBe(true);

      // Suicide alert active
      expect(result.isItem9AlertActive).toBe(true);
      expect(result.suicideRiskAlert.triggered).toBe(true);
      expect(result.suicideRiskAlert.level).toBe('CRITICAL');
      expect(result.suicideRiskAlert.itemScore).toBe(3);
    });

    it('Benchmark GAD7-1: Umbral Crítico de Intervención Clínica (Score 9 vs 10)', () => {
      // Input A: total = 9 (items 1..3 = 3, items 4..7 = 0)
      const inputA = [3, 3, 3, 0, 0, 0, 0];
      const resultA = calculateGad7(inputA);

      expect(resultA.totalScore).toBe(9);
      expect(resultA.severity).toBe('Ansiedad leve');
      expect(resultA.meetsClinicalCutoff).toBe(false);

      // Input B: total = 10 (items 1..5 = 2, items 6..7 = 0)
      const inputB = [2, 2, 2, 2, 2, 0, 0];
      const resultB = calculateGad7(inputB);

      expect(resultB.totalScore).toBe(10);
      expect(resultB.severity).toBe('Ansiedad moderada');
      expect(resultB.meetsClinicalCutoff).toBe(true);
    });

    it('Benchmark MoCA-1: Paciente Límite con Escolaridad <= 12 Años', () => {
      // Raw Score = 25 (Visuospatial 4, Naming 3, Attention 5, Language 2, Abstraction 1, Recall 4, Orientation 6)
      // educationYears = 10 (<= 12)
      const result = calculateMoca({
        domains: {
          visuospatialExecutive: 4,
          naming: 3,
          attention: 5,
          language: 2,
          abstraction: 1,
          delayedRecall: 4,
          orientation: 6
        },
        educationYears: 10
      });

      expect(result.rawScore).toBe(25);
      expect(result.educationAdjustment).toBe(1);
      expect(result.educationYears).toBe(10);
      expect(result.adjustedScore).toBe(26); // 25 + 1 = 26
      expect(result.meetsClinicalCutoff).toBe(false); // 26 is >= 26 (Normal threshold)
      expect(result.classification).toBe('Normal');
    });

    it('Benchmark MoCA-2: Mismo Puntaje Bruto con Educación Universitaria (> 12 Años)', () => {
      // Raw Score = 25, educationYears = 16 (> 12)
      const result = calculateMoca({
        domains: {
          visuospatialExecutive: 4,
          naming: 3,
          attention: 5,
          language: 2,
          abstraction: 1,
          delayedRecall: 4,
          orientation: 6
        },
        educationYears: 16
      });

      expect(result.rawScore).toBe(25);
      expect(result.educationAdjustment).toBe(0);
      expect(result.educationYears).toBe(16);
      expect(result.adjustedScore).toBe(25); // No adjustment
      expect(result.meetsClinicalCutoff).toBe(true); // 25 < 26 denotes MCI risk
      expect(result.classification).toBe('Deterioro Cognitivo Leve');
    });

    it('Benchmark MoCA-3: Techo Máximo y Capping Estricto en 30', () => {
      // Raw Score = 30, educationYears = 8 (<= 12)
      const result = calculateMoca({
        domains: {
          visuospatialExecutive: 5,
          naming: 3,
          attention: 6,
          language: 3,
          abstraction: 2,
          delayedRecall: 5,
          orientation: 6
        },
        educationYears: 8
      });

      expect(result.rawScore).toBe(30);
      expect(result.educationAdjustment).toBe(1);
      expect(result.adjustedScore).toBe(30); // Math.min(30, 30 + 1) = 30
      expect(result.classification).toBe('Normal');
      expect(result.meetsClinicalCutoff).toBe(false);
    });
  });

  // ==========================================================================
  // Section 2: Detailed SDQ Engine Tests (Reversals, Prorating, Cutoffs)
  // ==========================================================================
  describe('SDQ Engine: Inversions, Prorating and Cutoffs', () => {

    it('verifies the set of 5 reversed items (7, 11, 14, 21, 25)', () => {
      expect(SDQ_REVERSED_ITEMS).toEqual([7, 11, 14, 21, 25]);
      for (const itemNum of [7, 11, 14, 21, 25]) {
        expect(isSdqItemReversed(itemNum)).toBe(true);
      }
      for (const itemNum of [1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 13, 15, 16, 17, 18, 19, 20, 22, 23, 24]) {
        expect(isSdqItemReversed(itemNum)).toBe(false);
      }
    });

    it('inverts items according to formula (score = 2 - raw) for reversed items', () => {
      for (const itemNum of [7, 11, 14, 21, 25]) {
        expect(invertSdqItem(itemNum, 0)).toBe(2);
        expect(invertSdqItem(itemNum, 1)).toBe(1);
        expect(invertSdqItem(itemNum, 2)).toBe(0);
      }
    });

    it('keeps raw score unchanged for non-reversed items', () => {
      for (const itemNum of [1, 2, 3, 4, 5, 6, 8, 9, 10]) {
        expect(invertSdqItem(itemNum, 0)).toBe(0);
        expect(invertSdqItem(itemNum, 1)).toBe(1);
        expect(invertSdqItem(itemNum, 2)).toBe(2);
      }
    });

    it('applies Goodman prorating when 4 items are answered in a subscale', () => {
      // Emotional scale (items: 3, 8, 13, 16, 24).
      // Answer items 3=2, 8=2, 13=2, 16=0 (sum = 6 across 4 items). Item 24 omitted.
      // Prorated: round(6 * (5 / 4)) = round(7.5) = 8.
      const responses = { 3: 2, 8: 2, 13: 2, 16: 0 };
      const subscale = calculateSdqSubscaleScore(responses, 'emotional');

      expect(subscale.answeredCount).toBe(4);
      expect(subscale.isProrated).toBe(true);
      expect(subscale.score).toBe(8);
    });

    it('applies Goodman prorating when 3 items are answered in a subscale', () => {
      // Emotional scale: answer items 3=1, 8=2, 13=1 (sum = 4 across 3 items). Items 16, 24 omitted.
      // Prorated: round(4 * (5 / 3)) = round(6.666...) = 7.
      const responses = { 3: 1, 8: 2, 13: 1 };
      const subscale = calculateSdqSubscaleScore(responses, 'emotional');

      expect(subscale.answeredCount).toBe(3);
      expect(subscale.isProrated).toBe(true);
      expect(subscale.score).toBe(7);
    });

    it('rejects Goodman prorating when fewer than 3 items are answered', () => {
      // Only 2 items answered in emotional scale
      const responses = { 3: 2, 8: 1 };
      expect(() => calculateSdqSubscaleScore(responses, 'emotional')).toThrow(/Goodman prorating requires at least 3 answered items/);
    });

    it('strictly excludes prosocial scale from Total Difficulties score', () => {
      // E=10, C=10, H=10, P=10, Prosocial=10 -> Total Difficulties must be 40, NEVER 50
      const responses: Record<number, number> = {
        // Emotional = 10
        3: 2, 8: 2, 13: 2, 16: 2, 24: 2,
        // Conduct = 10
        5: 2, 7: 0, 12: 2, 18: 2, 22: 2,
        // Hyperactivity = 10
        2: 2, 10: 2, 15: 2, 21: 0, 25: 0,
        // Peer = 10
        6: 2, 11: 0, 14: 0, 19: 2, 23: 2,
        // Prosocial = 10 (all 2s)
        1: 2, 4: 2, 9: 2, 17: 2, 20: 2
      };

      const result = calculateSdq({ informant: 'parent', responses });
      expect(result.subscales.prosocial.rawScore).toBe(10);
      expect(result.totalDifficulties.score).toBe(40);
    });

    it('evaluates teacher cutoffs correctly across all 3 bands', () => {
      // Teacher Total Difficulties: Normal 0-11, Borderline 12-15, Abnormal 16-40
      expect(classifySdqTotalDifficulties(11, 'teacher')).toBe('Normal');
      expect(classifySdqTotalDifficulties(12, 'teacher')).toBe('Borderline');
      expect(classifySdqTotalDifficulties(15, 'teacher')).toBe('Borderline');
      expect(classifySdqTotalDifficulties(16, 'teacher')).toBe('Abnormal');
    });

    it('evaluates parent cutoffs correctly across all 3 bands', () => {
      // Parent Total Difficulties: Normal 0-13, Borderline 14-16, Abnormal 17-40
      expect(classifySdqTotalDifficulties(13, 'parent')).toBe('Normal');
      expect(classifySdqTotalDifficulties(14, 'parent')).toBe('Borderline');
      expect(classifySdqTotalDifficulties(16, 'parent')).toBe('Borderline');
      expect(classifySdqTotalDifficulties(17, 'parent')).toBe('Abnormal');
    });

    it('evaluates self-report cutoffs correctly across all 3 bands', () => {
      // Self Total Difficulties: Normal 0-15, Borderline 16-19, Abnormal 20-40
      expect(classifySdqTotalDifficulties(15, 'self')).toBe('Normal');
      expect(classifySdqTotalDifficulties(16, 'self')).toBe('Borderline');
      expect(classifySdqTotalDifficulties(19, 'self')).toBe('Borderline');
      expect(classifySdqTotalDifficulties(20, 'self')).toBe('Abnormal');
    });

    it('handles inverted classification of prosocial subscale (lower score = higher difficulty)', () => {
      // Prosocial cutoffs for all informants: Normal 6-10, Borderline 5, Abnormal 0-4
      for (const inf of ['parent', 'self', 'teacher'] as const) {
        expect(classifySdqSubscale(10, 'prosocial', inf)).toBe('Normal');
        expect(classifySdqSubscale(6, 'prosocial', inf)).toBe('Normal');
        expect(classifySdqSubscale(5, 'prosocial', inf)).toBe('Borderline');
        expect(classifySdqSubscale(4, 'prosocial', inf)).toBe('Abnormal');
        expect(classifySdqSubscale(0, 'prosocial', inf)).toBe('Abnormal');
      }
    });

    it('validates SDQ inputs and rejects out-of-range or malformed responses', () => {
      const invalidInput = {
        informant: 'parent' as const,
        responses: { 1: 3, 2: -1, 3: 1.5 } // invalid values
      };
      const validation = validateSdqInput(invalidInput);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(() => calculateSdq(invalidInput)).toThrow(/SDQ validation failed/);
    });
  });

  // ==========================================================================
  // Section 3: Detailed PHQ-9 Engine Tests
  // ==========================================================================
  describe('PHQ-9 Engine: Severity, Alerts, and DSM-5 Criteria', () => {

    it('classifies all 5 severity brackets correctly', () => {
      expect(classifyPhq9Severity(0)).toBe('Ninguna / Mínima');
      expect(classifyPhq9Severity(4)).toBe('Ninguna / Mínima');
      expect(classifyPhq9Severity(5)).toBe('Leve');
      expect(classifyPhq9Severity(9)).toBe('Leve');
      expect(classifyPhq9Severity(10)).toBe('Moderada');
      expect(classifyPhq9Severity(14)).toBe('Moderada');
      expect(classifyPhq9Severity(15)).toBe('Moderadamente Severa');
      expect(classifyPhq9Severity(19)).toBe('Moderadamente Severa');
      expect(classifyPhq9Severity(20)).toBe('Severa');
      expect(classifyPhq9Severity(27)).toBe('Severa');
    });

    it('triggers suicide risk alert on any positive answer to item 9 (1, 2, or 3)', () => {
      expect(checkPhq9SuicideAlert(0).triggered).toBe(false);
      expect(checkPhq9SuicideAlert(0).level).toBe('NONE');

      const alert1 = checkPhq9SuicideAlert(1);
      expect(alert1.triggered).toBe(true);
      expect(alert1.level).toBe('CRITICAL');
      expect(alert1.clinicalActionRequired).toBe(true);

      const alert2 = checkPhq9SuicideAlert(2);
      expect(alert2.triggered).toBe(true);
      expect(alert2.level).toBe('CRITICAL');

      const alert3 = checkPhq9SuicideAlert(3);
      expect(alert3.triggered).toBe(true);
      expect(alert3.level).toBe('CRITICAL');
    });

    it('detects DSM-5 major depression episode when cardinal symptom is present + >= 5 symptoms', () => {
      // Cardinal symptom item 1 = 2 ("more than half the days")
      // 5 symptoms >= 2: items 1, 3, 4, 5, 6
      const responses: Record<number, number> = {
        1: 2, 2: 1, 3: 2, 4: 2, 5: 2, 6: 2, 7: 0, 8: 0, 9: 0
      };
      expect(evaluatePhq9MajorDepression(responses)).toBe(true);

      const result = calculatePhq9(responses);
      expect(result.meetsMajorDepressionCriteria).toBe(true);
    });

    it('does NOT meet DSM-5 major depression if neither cardinal symptom (item 1 or 2) is >= 2', () => {
      // 5 symptoms >= 2 (items 3, 4, 5, 6, 7), but item 1 = 1 and item 2 = 1
      const responses: Record<number, number> = {
        1: 1, 2: 1, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 0, 9: 0
      };
      expect(evaluatePhq9MajorDepression(responses)).toBe(false);

      const result = calculatePhq9(responses);
      expect(result.meetsMajorDepressionCriteria).toBe(false);
    });

    it('counts Item 9 >= 1 towards DSM-5 symptom count', () => {
      // Cardinal: item 2 = 2.
      // Other symptoms >= 2: items 3, 4, 5. Total = 4.
      // Item 9 = 1 (counts as symptom for depression in PHQ-9 DSM-5 algorithm). Total = 5.
      const responses: Record<number, number> = {
        1: 0, 2: 2, 3: 2, 4: 2, 5: 2, 6: 0, 7: 0, 8: 0, 9: 1
      };
      expect(evaluatePhq9MajorDepression(responses)).toBe(true);
    });

    it('rejects invalid responses in validation', () => {
      const invalid = [0, 1, 2, 4, 0, 0, 0, 0, 0]; // 4 is invalid
      const validation = validatePhq9Input(invalid);
      expect(validation.isValid).toBe(false);
      expect(() => calculatePhq9(invalid)).toThrow(/PHQ-9 validation failed/);
    });
  });

  // ==========================================================================
  // Section 4: Detailed GAD-7 Engine Tests
  // ==========================================================================
  describe('GAD-7 Engine: Severity and Cutoff Status', () => {

    it('classifies all 4 anxiety severity brackets', () => {
      expect(classifyGad7Severity(0)).toBe('Ansiedad mínima');
      expect(classifyGad7Severity(4)).toBe('Ansiedad mínima');
      expect(classifyGad7Severity(5)).toBe('Ansiedad leve');
      expect(classifyGad7Severity(9)).toBe('Ansiedad leve');
      expect(classifyGad7Severity(10)).toBe('Ansiedad moderada');
      expect(classifyGad7Severity(14)).toBe('Ansiedad moderada');
      expect(classifyGad7Severity(15)).toBe('Ansiedad severa');
      expect(classifyGad7Severity(21)).toBe('Ansiedad severa');
    });

    it('handles floor (0) and ceiling (21) scores cleanly', () => {
      const floor = calculateGad7([0, 0, 0, 0, 0, 0, 0]);
      expect(floor.totalScore).toBe(0);
      expect(floor.severity).toBe('Ansiedad mínima');
      expect(floor.meetsClinicalCutoff).toBe(false);

      const ceiling = calculateGad7([3, 3, 3, 3, 3, 3, 3]);
      expect(ceiling.totalScore).toBe(21);
      expect(ceiling.severity).toBe('Ansiedad severa');
      expect(ceiling.meetsClinicalCutoff).toBe(true);
    });

    it('rejects invalid inputs (negative, out of bounds, non-integers)', () => {
      expect(validateGad7Input([0, 0, -1, 0, 0, 0, 0]).isValid).toBe(false);
      expect(validateGad7Input([0, 0, 4, 0, 0, 0, 0]).isValid).toBe(false);
      expect(validateGad7Input([0, 0, 1.5, 0, 0, 0, 0]).isValid).toBe(false);
      expect(() => calculateGad7([0, 0, 5, 0, 0, 0, 0])).toThrow(/GAD-7 validation failed/);
    });
  });

  // ==========================================================================
  // Section 5: Detailed MoCA Engine Tests (Domains, Adjustments, Capping)
  // ==========================================================================
  describe('MoCA Engine: Cognitive Domains, Education Adjustment and Classifications', () => {

    it('calculates education adjustment rule (+1 point if <= 12 years)', () => {
      expect(getMocaEducationAdjustment(0)).toBe(1);
      expect(getMocaEducationAdjustment(6)).toBe(1);
      expect(getMocaEducationAdjustment(12)).toBe(1);
      expect(getMocaEducationAdjustment(13)).toBe(0);
      expect(getMocaEducationAdjustment(20)).toBe(0);
    });

    it('rejects invalid education years (negative numbers or floats)', () => {
      expect(() => getMocaEducationAdjustment(-1)).toThrow(/Invalid education years/);
      expect(() => getMocaEducationAdjustment(12.5)).toThrow(/Invalid education years/);
    });

    it('maps all 4 MoCA clinical cognitive classifications', () => {
      expect(classifyMoca(30)).toBe('Normal');
      expect(classifyMoca(26)).toBe('Normal');
      expect(classifyMoca(25)).toBe('Deterioro Cognitivo Leve');
      expect(classifyMoca(18)).toBe('Deterioro Cognitivo Leve');
      expect(classifyMoca(17)).toBe('Deterioro Cognitivo Moderado');
      expect(classifyMoca(10)).toBe('Deterioro Cognitivo Moderado');
      expect(classifyMoca(9)).toBe('Deterioro Cognitivo Severo');
      expect(classifyMoca(0)).toBe('Deterioro Cognitivo Severo');
    });

    it('scores Serial 7s subtraction lookup correctly', () => {
      expect(getMocaSerial7Score(5)).toBe(3);
      expect(getMocaSerial7Score(4)).toBe(3);
      expect(getMocaSerial7Score(3)).toBe(2);
      expect(getMocaSerial7Score(2)).toBe(2);
      expect(getMocaSerial7Score(1)).toBe(1);
      expect(getMocaSerial7Score(0)).toBe(0);
    });

    it('verifies floor (0) and severe cognitive impairment', () => {
      const result = calculateMoca({
        domains: {
          visuospatialExecutive: 0,
          naming: 0,
          attention: 0,
          language: 0,
          abstraction: 0,
          delayedRecall: 0,
          orientation: 0
        },
        educationYears: 16
      });

      expect(result.rawScore).toBe(0);
      expect(result.adjustedScore).toBe(0);
      expect(result.classification).toBe('Deterioro Cognitivo Severo');
      expect(result.meetsClinicalCutoff).toBe(true);
    });

    it('rejects domain score exceeding domain maximum', () => {
      // Naming maximum is 3; score of 4 must be rejected
      const invalidInput = {
        domains: {
          naming: 4
        },
        educationYears: 10
      };

      const validation = validateMocaInput(invalidInput);
      expect(validation.isValid).toBe(false);
      expect(validation.errors[0]).toContain('naming');
      expect(() => calculateMoca(invalidInput)).toThrow(/MoCA validation failed/);
    });
  });

});
