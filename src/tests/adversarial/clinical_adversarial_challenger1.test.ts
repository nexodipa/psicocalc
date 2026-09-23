/**
 * Adversarial Stress Test Suite — Challenger 1 (Milestone M5)
 * Clinical Psychometric Engines: SDQ, PHQ-9, GAD-7, MoCA
 *
 * Rigorous empirical verification of:
 * - Extreme boundary conditions (all zeros, maximum scores, negative / out-of-range inputs)
 * - MoCA education adjustment ceiling (raw 29 & 30 with ed <= 12 MUST never exceed 30)
 * - PHQ-9 item 9 critical alert trigger (0 -> NO alert; 1, 2, 3 -> MUST alert)
 * - SDQ reversed item behavior (items 7, 11, 14, 21, 25: 0->2, 1->1, 2->0)
 * - Goodman prorating limits (2 items REJECT, 3, 4, 5 ACCEPT)
 * - Property-based invariant fuzzing & Prosocial scale isolation
 */

import { describe, it, expect } from 'vitest';
import {
  // SDQ
  calculateSdq,
  calculateSdqSubscaleScore,
  invertSdqItem,
  isSdqItemReversed,
  validateSdqInput,
  classifySdqSubscale,
  classifySdqTotalDifficulties,
  SDQ_REVERSED_ITEMS,
  SDQ_SUBSCALE_METAS,
  SdqInformantType,
  SdqSubscaleId,
  // PHQ-9
  calculatePhq9,
  checkPhq9SuicideAlert,
  classifyPhq9Severity,
  evaluatePhq9MajorDepression,
  validatePhq9Input,
  // GAD-7
  calculateGad7,
  classifyGad7Severity,
  validateGad7Input,
  // MoCA
  calculateMoca,
  classifyMoca,
  getMocaEducationAdjustment,
  validateMocaInput,
  MOCA_DOMAINS
} from '../../core';

describe('Adversarial Stress Test Suite — Challenger 1 (Milestone M5)', () => {

  // ==========================================================================
  // Dimension 1: MoCA Education Adjustment Ceiling & Domain Bounds
  // ==========================================================================
  describe('Dimension 1: MoCA Education Adjustment Ceiling & Domain Invariants', () => {

    it('MOCA-CEIL-1: raw 30 with education <= 12 years MUST NEVER exceed 30 (strict ceiling)', () => {
      // Test at education = 12, 6, 1, 0 years
      const educationLevels = [12, 8, 6, 1, 0];
      for (const ed of educationLevels) {
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
          educationYears: ed
        });

        expect(result.rawScore).toBe(30);
        expect(result.educationAdjustment).toBe(1);
        expect(result.adjustedScore).toBe(30); // Math.min(30, 30 + 1) === 30, NEVER 31!
        expect(result.adjustedScore).toBeLessThanOrEqual(30);
        expect(result.classification).toBe('Normal');
        expect(result.meetsClinicalCutoff).toBe(false);
      }
    });

    it('MOCA-CEIL-2: raw 29 with education <= 12 years adjusts to exactly 30 (never 31)', () => {
      // 29 points (e.g., visuospatial 4 instead of 5)
      const educationLevels = [12, 10, 5, 0];
      for (const ed of educationLevels) {
        const result = calculateMoca({
          domains: {
            visuospatialExecutive: 4,
            naming: 3,
            attention: 6,
            language: 3,
            abstraction: 2,
            delayedRecall: 5,
            orientation: 6
          },
          educationYears: ed
        });

        expect(result.rawScore).toBe(29);
        expect(result.educationAdjustment).toBe(1);
        expect(result.adjustedScore).toBe(30); // 29 + 1 = 30
        expect(result.adjustedScore).toBeLessThanOrEqual(30);
        expect(result.classification).toBe('Normal');
        expect(result.meetsClinicalCutoff).toBe(false);
      }
    });

    it('MOCA-CEIL-3: raw 29 and 30 with education > 12 years receives NO adjustment (+0)', () => {
      const edLevels = [13, 16, 20];
      for (const ed of edLevels) {
        // raw 29
        const res29 = calculateMoca({
          domains: {
            visuospatialExecutive: 4,
            naming: 3,
            attention: 6,
            language: 3,
            abstraction: 2,
            delayedRecall: 5,
            orientation: 6
          },
          educationYears: ed
        });
        expect(res29.rawScore).toBe(29);
        expect(res29.educationAdjustment).toBe(0);
        expect(res29.adjustedScore).toBe(29);

        // raw 30
        const res30 = calculateMoca({
          domains: {
            visuospatialExecutive: 5,
            naming: 3,
            attention: 6,
            language: 3,
            abstraction: 2,
            delayedRecall: 5,
            orientation: 6
          },
          educationYears: ed
        });
        expect(res30.rawScore).toBe(30);
        expect(res30.educationAdjustment).toBe(0);
        expect(res30.adjustedScore).toBe(30);
      }
    });

    it('MOCA-BOUND-1: absolute floor score (all zero domains)', () => {
      // With education <= 12 -> 0 + 1 = 1
      const resEdLow = calculateMoca({
        domains: {
          visuospatialExecutive: 0,
          naming: 0,
          attention: 0,
          language: 0,
          abstraction: 0,
          delayedRecall: 0,
          orientation: 0
        },
        educationYears: 6
      });
      expect(resEdLow.rawScore).toBe(0);
      expect(resEdLow.educationAdjustment).toBe(1);
      expect(resEdLow.adjustedScore).toBe(1);
      expect(resEdLow.classification).toBe('Deterioro Cognitivo Severo');
      expect(resEdLow.meetsClinicalCutoff).toBe(true);

      // With education > 12 -> 0 + 0 = 0
      const resEdHigh = calculateMoca({
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
      expect(resEdHigh.rawScore).toBe(0);
      expect(resEdHigh.educationAdjustment).toBe(0);
      expect(resEdHigh.adjustedScore).toBe(0);
      expect(resEdHigh.classification).toBe('Deterioro Cognitivo Severo');
      expect(resEdHigh.meetsClinicalCutoff).toBe(true);
    });

    it('MOCA-BOUND-2: rejects domain scores that exceed individual domain caps', () => {
      const maxChecks = [
        { domain: 'visuospatialExecutive', max: 5 },
        { domain: 'naming', max: 3 },
        { domain: 'attention', max: 6 },
        { domain: 'language', max: 3 },
        { domain: 'abstraction', max: 2 },
        { domain: 'delayedRecall', max: 5 },
        { domain: 'orientation', max: 6 }
      ];

      for (const { domain, max } of maxChecks) {
        const invalidPayload = {
          domains: { [domain]: max + 1 },
          educationYears: 10
        };
        const val = validateMocaInput(invalidPayload as any);
        expect(val.isValid).toBe(false);
        expect(val.errors.some(e => e.includes(domain))).toBe(true);
        expect(() => calculateMoca(invalidPayload as any)).toThrow(/MoCA validation failed/);
      }
    });

    it('MOCA-BOUND-3: rejects negative domain scores, non-integers, and invalid educationYears', () => {
      // Negative domain
      expect(validateMocaInput({ domains: { naming: -1 }, educationYears: 10 }).isValid).toBe(false);
      // Float domain
      expect(validateMocaInput({ domains: { naming: 1.5 }, educationYears: 10 }).isValid).toBe(false);
      // Negative education
      expect(validateMocaInput({ domains: { naming: 2 }, educationYears: -1 }).isValid).toBe(false);
      // Float education
      expect(validateMocaInput({ domains: { naming: 2 }, educationYears: 10.5 }).isValid).toBe(false);
      // Null / undefined input
      expect(validateMocaInput(null as any).isValid).toBe(false);
    });
  });

  // ==========================================================================
  // Dimension 2: PHQ-9 Item 9 Critical Alert Trigger & Boundary Testing
  // ==========================================================================
  describe('Dimension 2: PHQ-9 Item 9 Critical Alert Trigger & Extreme Boundaries', () => {

    it('PHQ9-ALERT-1: exhaustive test of item 9 values 0, 1, 2, 3 (0 -> NO alert; 1, 2, 3 -> MUST alert)', () => {
      // Value 0: MUST NOT alert
      const alert0 = checkPhq9SuicideAlert(0);
      expect(alert0.triggered).toBe(false);
      expect(alert0.level).toBe('NONE');
      expect(alert0.clinicalActionRequired).toBe(false);

      // Value 1: MUST alert
      const alert1 = checkPhq9SuicideAlert(1);
      expect(alert1.triggered).toBe(true);
      expect(alert1.level).toBe('CRITICAL');
      expect(alert1.itemScore).toBe(1);
      expect(alert1.clinicalActionRequired).toBe(true);
      expect(alert1.bannerText.length).toBeGreaterThan(0);

      // Value 2: MUST alert
      const alert2 = checkPhq9SuicideAlert(2);
      expect(alert2.triggered).toBe(true);
      expect(alert2.level).toBe('CRITICAL');
      expect(alert2.itemScore).toBe(2);
      expect(alert2.clinicalActionRequired).toBe(true);

      // Value 3: MUST alert
      const alert3 = checkPhq9SuicideAlert(3);
      expect(alert3.triggered).toBe(true);
      expect(alert3.level).toBe('CRITICAL');
      expect(alert3.itemScore).toBe(3);
      expect(alert3.clinicalActionRequired).toBe(true);
    });

    it('PHQ9-ALERT-2: full calculatePhq9 triggers critical alert when item 9 is 1, 2, or 3 even at minimal total score', () => {
      for (const item9Val of [1, 2, 3] as const) {
        const responses = [0, 0, 0, 0, 0, 0, 0, 0, item9Val];
        const res = calculatePhq9(responses);

        expect(res.totalScore).toBe(item9Val);
        expect(res.isItem9AlertActive).toBe(true);
        expect(res.suicideRiskAlert.triggered).toBe(true);
        expect(res.suicideRiskAlert.level).toBe('CRITICAL');
        expect(res.suicideRiskAlert.clinicalActionRequired).toBe(true);
        expect(res.alertLevel).toBe('CRITICAL');
      }
    });

    it('PHQ9-ALERT-3: item 9 = 0 does NOT alert even when all other items are maximum (Total = 24)', () => {
      // Items 1..8 = 3, Item 9 = 0 -> Total = 24 (Severa)
      const responses = [3, 3, 3, 3, 3, 3, 3, 3, 0];
      const res = calculatePhq9(responses);

      expect(res.totalScore).toBe(24);
      expect(res.severity).toBe('Severa');
      expect(res.isItem9AlertActive).toBe(false);
      expect(res.suicideRiskAlert.triggered).toBe(false);
      expect(res.suicideRiskAlert.level).toBe('NONE');
      expect(res.alertLevel).toBe('NONE');
    });

    it('PHQ9-BOUND-1: all zeros floor and all threes ceiling', () => {
      // Floor (all 0s)
      const floorRes = calculatePhq9([0, 0, 0, 0, 0, 0, 0, 0, 0]);
      expect(floorRes.totalScore).toBe(0);
      expect(floorRes.severity).toBe('Ninguna / Mínima');
      expect(floorRes.meetsClinicalCutoff).toBe(false);
      expect(floorRes.meetsMajorDepressionCriteria).toBe(false);
      expect(floorRes.isItem9AlertActive).toBe(false);

      // Ceiling (all 3s)
      const ceilRes = calculatePhq9([3, 3, 3, 3, 3, 3, 3, 3, 3]);
      expect(ceilRes.totalScore).toBe(27);
      expect(ceilRes.severity).toBe('Severa');
      expect(ceilRes.meetsClinicalCutoff).toBe(true);
      expect(ceilRes.meetsMajorDepressionCriteria).toBe(true);
      expect(ceilRes.isItem9AlertActive).toBe(true);
    });

    it('PHQ9-BOUND-2: rejects negative values, scores > 3, non-integers, and wrong array lengths', () => {
      expect(validatePhq9Input([-1, 0, 0, 0, 0, 0, 0, 0, 0]).isValid).toBe(false);
      expect(validatePhq9Input([4, 0, 0, 0, 0, 0, 0, 0, 0]).isValid).toBe(false);
      expect(validatePhq9Input([1.5, 0, 0, 0, 0, 0, 0, 0, 0]).isValid).toBe(false);
      expect(validatePhq9Input([0, 0, 0, 0, 0, 0, 0, 0]).isValid).toBe(false); // 8 items
      expect(validatePhq9Input([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]).isValid).toBe(false); // 11 items
      expect(() => calculatePhq9([0, 0, 0, 0, 0, 0, 0, 0, 4])).toThrow(/PHQ-9 validation failed/);
    });
  });

  // ==========================================================================
  // Dimension 3: SDQ Reversed Item Behavior & Subscale Invariants
  // ==========================================================================
  describe('Dimension 3: SDQ Reversed Item Inversion & Scale Isolation', () => {

    it('SDQ-REV-1: verifies exactly items 7, 11, 14, 21, 25 are reversed and transform 0->2, 1->1, 2->0', () => {
      const expectedReversed = [7, 11, 14, 21, 25];
      expect([...SDQ_REVERSED_ITEMS].sort((a, b) => a - b)).toEqual(expectedReversed);

      for (const itemNum of expectedReversed) {
        expect(isSdqItemReversed(itemNum)).toBe(true);
        expect(invertSdqItem(itemNum, 0)).toBe(2);
        expect(invertSdqItem(itemNum, 1)).toBe(1);
        expect(invertSdqItem(itemNum, 2)).toBe(0);
      }
    });

    it('SDQ-REV-2: verifies all 20 non-reversed items preserve raw scores without inversion (0->0, 1->1, 2->2)', () => {
      const nonReversed = [1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24]
        .filter(n => !SDQ_REVERSED_ITEMS.includes(n));

      expect(nonReversed.length).toBe(20);

      for (const itemNum of nonReversed) {
        expect(isSdqItemReversed(itemNum)).toBe(false);
        expect(invertSdqItem(itemNum, 0)).toBe(0);
        expect(invertSdqItem(itemNum, 1)).toBe(1);
        expect(invertSdqItem(itemNum, 2)).toBe(2);
      }
    });

    it('SDQ-REV-3: invertSdqItem rejects out-of-range raw inputs (< 0, > 2, non-integers)', () => {
      for (const itemNum of [7, 11, 14, 21, 25, 1, 2]) {
        expect(() => invertSdqItem(itemNum, -1)).toThrow(/Invalid SDQ raw response/);
        expect(() => invertSdqItem(itemNum, 3)).toThrow(/Invalid SDQ raw response/);
        expect(() => invertSdqItem(itemNum, 1.5)).toThrow(/Invalid SDQ raw response/);
      }
    });

    it('SDQ-ISOL-1: Prosocial scale is strictly excluded from Total Difficulties under all extremes', () => {
      // Case A: High difficulties, zero prosocial
      const respA: Record<number, number> = {};
      for (let i = 1; i <= 25; i++) {
        // Set direct difficulty items to 2, inverted items to 0 (which become 2), prosocial to 0
        if ([1, 4, 9, 17, 20].includes(i)) respA[i] = 0;
        else if (SDQ_REVERSED_ITEMS.includes(i)) respA[i] = 0;
        else respA[i] = 2;
      }
      const resA = calculateSdq({ informant: 'parent', responses: respA });
      expect(resA.subscales.prosocial.rawScore).toBe(0);
      expect(resA.totalDifficulties.score).toBe(40); // 10 + 10 + 10 + 10 = 40

      // Case B: Same difficulties, but set prosocial to maximum (10)
      const respB = { ...respA };
      for (const p of [1, 4, 9, 17, 20]) respB[p] = 2;
      const resB = calculateSdq({ informant: 'parent', responses: respB });
      expect(resB.subscales.prosocial.rawScore).toBe(10);
      // CRITICAL INVARIANT: Total difficulties MUST remain strictly 40, NEVER 50!
      expect(resB.totalDifficulties.score).toBe(40);
    });

    it('SDQ-BOUND-1: extreme raw responses (all raw 0s vs all raw 2s)', () => {
      // All raw zeros
      const allZeros: Record<number, number> = {};
      for (let i = 1; i <= 25; i++) allZeros[i] = 0;
      const resZero = calculateSdq({ informant: 'parent', responses: allZeros });
      // Reversed items (7, 11, 14, 21, 25) invert to 2.
      // Conduct: item 7 = 2 -> rawScore = 2
      // Hyperactivity: items 21, 25 = 2 + 2 = 4 -> rawScore = 4
      // Peer: items 11, 14 = 2 + 2 = 4 -> rawScore = 4
      // Emotional: 0
      // Prosocial: 0
      // Total difficulties = 0 + 2 + 4 + 4 = 10
      expect(resZero.subscales.emotional.rawScore).toBe(0);
      expect(resZero.subscales.conduct.rawScore).toBe(2);
      expect(resZero.subscales.hyperactivity.rawScore).toBe(4);
      expect(resZero.subscales.peer.rawScore).toBe(4);
      expect(resZero.subscales.prosocial.rawScore).toBe(0);
      expect(resZero.totalDifficulties.score).toBe(10);

      // All raw twos
      const allTwos: Record<number, number> = {};
      for (let i = 1; i <= 25; i++) allTwos[i] = 2;
      const resTwo = calculateSdq({ informant: 'parent', responses: allTwos });
      // Reversed items invert to 0.
      // Emotional: all 5 in 2 = 10
      // Conduct: 4 direct in 2, 1 reversed in 0 = 8
      // Hyperactivity: 3 direct in 2, 2 reversed in 0 = 6
      // Peer: 3 direct in 2, 2 reversed in 0 = 6
      // Prosocial: 5 direct in 2 = 10
      // Total difficulties = 10 + 8 + 6 + 6 = 30
      expect(resTwo.subscales.emotional.rawScore).toBe(10);
      expect(resTwo.subscales.conduct.rawScore).toBe(8);
      expect(resTwo.subscales.hyperactivity.rawScore).toBe(6);
      expect(resTwo.subscales.peer.rawScore).toBe(6);
      expect(resTwo.subscales.prosocial.rawScore).toBe(10);
      expect(resTwo.totalDifficulties.score).toBe(30);
    });

    it('SDQ-BOUND-2: rejects invalid informants and values out of range', () => {
      const invalidInf = {
        informant: 'doctor' as any,
        responses: { 1: 0 }
      };
      expect(validateSdqInput(invalidInf).isValid).toBe(false);

      const invalidVal = {
        informant: 'parent' as SdqInformantType,
        responses: { 1: 3 }
      };
      expect(validateSdqInput(invalidVal).isValid).toBe(false);
    });
  });

  // ==========================================================================
  // Dimension 4: Goodman Prorating Limits (2 REJECT, 3, 4, 5 ACCEPT)
  // ==========================================================================
  describe('Dimension 4: Goodman Prorating Limits across Subscales', () => {

    const subscales: SdqSubscaleId[] = ['emotional', 'conduct', 'hyperactivity', 'peer', 'prosocial'];

    it('PRORATE-LIMIT-1: 2 items answered MUST REJECT (insufficient items for Goodman prorating)', () => {
      for (const scaleId of subscales) {
        const meta = SDQ_SUBSCALE_METAS[scaleId];
        // Provide only first 2 items of the subscale
        const responses: Record<number, number> = {
          [meta.itemNumbers[0]]: 1,
          [meta.itemNumbers[1]]: 1
        };

        // calculateSdqSubscaleScore must throw
        expect(() => calculateSdqSubscaleScore(responses, scaleId)).toThrow(
          /Goodman prorating requires at least 3 answered items/
        );

        // validateSdqInput must flag as invalid
        const val = validateSdqInput({ informant: 'parent', responses });
        expect(val.isValid).toBe(false);
        expect(val.errors.some(e => e.includes(meta.name))).toBe(true);
      }
    });

    it('PRORATE-LIMIT-2: 0 and 1 items answered MUST REJECT', () => {
      expect(() => calculateSdqSubscaleScore({}, 'emotional')).toThrow(/Goodman prorating requires at least 3/);
      expect(() => calculateSdqSubscaleScore({ 3: 2 }, 'emotional')).toThrow(/Goodman prorating requires at least 3/);
    });

    it('PRORATE-LIMIT-3: 3 items answered MUST ACCEPT with isProrated === true and correct formula', () => {
      // Emotional subscale items: 3, 8, 13, 16, 24 (non-reversed)
      // Test all possible sums for 3 items (sum from 0 to 6)
      const testCases = [
        { items: { 3: 0, 8: 0, 13: 0 }, expectedScore: 0 },                  // round(0 * 5/3) = 0
        { items: { 3: 1, 8: 0, 13: 0 }, expectedScore: Math.round(1 * 5 / 3) }, // round(1.666) = 2
        { items: { 3: 1, 8: 1, 13: 0 }, expectedScore: Math.round(2 * 5 / 3) }, // round(3.333) = 3
        { items: { 3: 1, 8: 1, 13: 1 }, expectedScore: Math.round(3 * 5 / 3) }, // round(5.000) = 5
        { items: { 3: 2, 8: 1, 13: 1 }, expectedScore: Math.round(4 * 5 / 3) }, // round(6.666) = 7
        { items: { 3: 2, 8: 2, 13: 1 }, expectedScore: Math.round(5 * 5 / 3) }, // round(8.333) = 8
        { items: { 3: 2, 8: 2, 13: 2 }, expectedScore: Math.round(6 * 5 / 3) }  // round(10.00) = 10
      ];

      for (const { items, expectedScore } of testCases) {
        const res = calculateSdqSubscaleScore(items, 'emotional');
        expect(res.answeredCount).toBe(3);
        expect(res.isProrated).toBe(true);
        expect(res.score).toBe(expectedScore);
        expect(res.score).toBeGreaterThanOrEqual(0);
        expect(res.score).toBeLessThanOrEqual(10);
      }
    });

    it('PRORATE-LIMIT-4: 4 items answered MUST ACCEPT with isProrated === true and correct formula', () => {
      // Conduct subscale items: 5, 7(inv), 12, 18, 22.
      // Use items 5, 12, 18, 22 (all direct non-reversed) so raw == transformed
      const testCases = [
        { items: { 5: 0, 12: 0, 18: 0, 22: 0 }, expectedScore: 0 },                  // round(0 * 5/4) = 0
        { items: { 5: 1, 12: 0, 18: 0, 22: 0 }, expectedScore: Math.round(1 * 5 / 4) }, // round(1.25) = 1
        { items: { 5: 1, 12: 1, 18: 0, 22: 0 }, expectedScore: Math.round(2 * 5 / 4) }, // round(2.50) = 3
        { items: { 5: 1, 12: 1, 18: 1, 22: 0 }, expectedScore: Math.round(3 * 5 / 4) }, // round(3.75) = 4
        { items: { 5: 1, 12: 1, 18: 1, 22: 1 }, expectedScore: Math.round(4 * 5 / 4) }, // round(5.00) = 5
        { items: { 5: 2, 12: 1, 18: 1, 22: 1 }, expectedScore: Math.round(5 * 5 / 4) }, // round(6.25) = 6
        { items: { 5: 2, 12: 2, 18: 1, 22: 1 }, expectedScore: Math.round(6 * 5 / 4) }, // round(7.50) = 8
        { items: { 5: 2, 12: 2, 18: 2, 22: 1 }, expectedScore: Math.round(7 * 5 / 4) }, // round(8.75) = 9
        { items: { 5: 2, 12: 2, 18: 2, 22: 2 }, expectedScore: Math.round(8 * 5 / 4) }  // round(10.0) = 10
      ];

      for (const { items, expectedScore } of testCases) {
        const res = calculateSdqSubscaleScore(items, 'conduct');
        expect(res.answeredCount).toBe(4);
        expect(res.isProrated).toBe(true);
        expect(res.score).toBe(expectedScore);
        expect(res.score).toBeGreaterThanOrEqual(0);
        expect(res.score).toBeLessThanOrEqual(10);
      }
    });

    it('PRORATE-LIMIT-5: 5 items answered MUST NOT prorate (isProrated === false)', () => {
      const items = { 3: 1, 8: 1, 13: 1, 16: 1, 24: 1 };
      const res = calculateSdqSubscaleScore(items, 'emotional');
      expect(res.answeredCount).toBe(5);
      expect(res.isProrated).toBe(false);
      expect(res.score).toBe(5);
    });

    it('PRORATE-LIMIT-6: full calculateSdq accurately reports isProrated if any subscale has missing items', () => {
      // 25 items where each subscale has 4 items answered and 1 omitted
      const responses: Record<number, number> = {};
      for (const scaleId of subscales) {
        const meta = SDQ_SUBSCALE_METAS[scaleId];
        // Answer first 4 items with 1 (or corresponding value), omit 5th
        for (let i = 0; i < 4; i++) {
          const itemNum = meta.itemNumbers[i];
          responses[itemNum] = 1;
        }
      }

      const res = calculateSdq({ informant: 'parent', responses });
      expect(res.isProrated).toBe(true);
      expect(res.isValid).toBe(true);
      for (const scaleId of subscales) {
        expect(res.subscales[scaleId].isProrated).toBe(true);
        expect(res.subscales[scaleId].answeredCount).toBe(4);
      }
    });
  });

  // ==========================================================================
  // Dimension 5: GAD-7 Extreme Boundaries & Critical Cutoff Transitions
  // ==========================================================================
  describe('Dimension 5: GAD-7 Boundary Conditions & Cutoff Invariants', () => {

    it('GAD7-BOUND-1: floor (0) and ceiling (21) scores', () => {
      const floor = calculateGad7([0, 0, 0, 0, 0, 0, 0]);
      expect(floor.totalScore).toBe(0);
      expect(floor.severity).toBe('Ansiedad mínima');
      expect(floor.meetsClinicalCutoff).toBe(false);

      const ceil = calculateGad7([3, 3, 3, 3, 3, 3, 3]);
      expect(ceil.totalScore).toBe(21);
      expect(ceil.severity).toBe('Ansiedad severa');
      expect(ceil.meetsClinicalCutoff).toBe(true);
    });

    it('GAD7-TRANS-1: step-by-step verification of all cutoff boundaries (4/5, 9/10, 14/15)', () => {
      const transitions = [
        { score: 4, expectedSeverity: 'Ansiedad mínima', expectedCutoff: false },
        { score: 5, expectedSeverity: 'Ansiedad leve', expectedCutoff: false },
        { score: 9, expectedSeverity: 'Ansiedad leve', expectedCutoff: false },
        { score: 10, expectedSeverity: 'Ansiedad moderada', expectedCutoff: true }, // CLINICAL CUTOFF
        { score: 14, expectedSeverity: 'Ansiedad moderada', expectedCutoff: true },
        { score: 15, expectedSeverity: 'Ansiedad severa', expectedCutoff: true }
      ];

      for (const t of transitions) {
        expect(classifyGad7Severity(t.score)).toBe(t.expectedSeverity);
      }
    });

    it('GAD7-BOUND-2: rejects negative values, values > 3, floats, and wrong item counts', () => {
      expect(validateGad7Input([-1, 0, 0, 0, 0, 0, 0]).isValid).toBe(false);
      expect(validateGad7Input([4, 0, 0, 0, 0, 0, 0]).isValid).toBe(false);
      expect(validateGad7Input([1.5, 0, 0, 0, 0, 0, 0]).isValid).toBe(false);
      expect(validateGad7Input([0, 0, 0, 0, 0, 0]).isValid).toBe(false); // 6 items
      expect(validateGad7Input([0, 0, 0, 0, 0, 0, 0, 0, 0]).isValid).toBe(false); // 9 items
      expect(() => calculateGad7([0, 0, 0, 0, 0, 0, -1])).toThrow(/GAD-7 validation failed/);
    });
  });

  // ==========================================================================
  // Dimension 6: Property-Based Fuzzing & Structural Invariants (500 Profiles)
  // ==========================================================================
  describe('Dimension 6: Property-Based Invariant Fuzzing', () => {

    it('FUZZ-CLINICAL-1: 500 stochastic profiles across all 4 instruments satisfy mathematical invariants', () => {
      const informants: SdqInformantType[] = ['parent', 'self', 'teacher'];

      for (let run = 0; run < 500; run++) {
        // --- 1. SDQ Stochastic Run ---
        const sdqResponses: Record<number, number> = {};
        for (let i = 1; i <= 25; i++) {
          sdqResponses[i] = Math.floor(Math.random() * 3); // 0, 1, 2
        }
        const inf = informants[run % informants.length];
        const sdqRes = calculateSdq({ informant: inf, responses: sdqResponses });

        expect(sdqRes.totalDifficulties.score).toBeGreaterThanOrEqual(0);
        expect(sdqRes.totalDifficulties.score).toBeLessThanOrEqual(40);
        expect(Number.isInteger(sdqRes.totalDifficulties.score)).toBe(true);

        for (const scaleId of ['emotional', 'conduct', 'hyperactivity', 'peer', 'prosocial'] as const) {
          const sub = sdqRes.subscales[scaleId];
          expect(sub.rawScore).toBeGreaterThanOrEqual(0);
          expect(sub.rawScore).toBeLessThanOrEqual(10);
          expect(Number.isInteger(sub.rawScore)).toBe(true);
          expect(['Normal', 'Borderline', 'Abnormal']).toContain(sub.classification);
        }

        // --- 2. PHQ-9 Stochastic Run ---
        const phqResponses: number[] = [];
        for (let i = 0; i < 9; i++) {
          phqResponses.push(Math.floor(Math.random() * 4)); // 0, 1, 2, 3
        }
        const phqRes = calculatePhq9(phqResponses);
        expect(phqRes.totalScore).toBeGreaterThanOrEqual(0);
        expect(phqRes.totalScore).toBeLessThanOrEqual(27);
        expect(Number.isInteger(phqRes.totalScore)).toBe(true);

        // Invariant: alert MUST be active if item 9 >= 1
        const item9Val = phqResponses[8];
        if (item9Val >= 1) {
          expect(phqRes.isItem9AlertActive).toBe(true);
          expect(phqRes.suicideRiskAlert.triggered).toBe(true);
          expect(phqRes.alertLevel).toBe('CRITICAL');
        } else {
          expect(phqRes.isItem9AlertActive).toBe(false);
          expect(phqRes.suicideRiskAlert.triggered).toBe(false);
          expect(phqRes.alertLevel).toBe('NONE');
        }

        // --- 3. GAD-7 Stochastic Run ---
        const gadResponses: number[] = [];
        for (let i = 0; i < 7; i++) {
          gadResponses.push(Math.floor(Math.random() * 4)); // 0, 1, 2, 3
        }
        const gadRes = calculateGad7(gadResponses);
        expect(gadRes.totalScore).toBeGreaterThanOrEqual(0);
        expect(gadRes.totalScore).toBeLessThanOrEqual(21);
        expect(Number.isInteger(gadRes.totalScore)).toBe(true);
        expect(gadRes.meetsClinicalCutoff).toBe(gadRes.totalScore >= 10);

        // --- 4. MoCA Stochastic Run ---
        const edYears = Math.floor(Math.random() * 25); // 0 to 24
        const mocaInput = {
          domains: {
            visuospatialExecutive: Math.floor(Math.random() * 6), // 0..5
            naming: Math.floor(Math.random() * 4),                // 0..3
            attention: Math.floor(Math.random() * 7),             // 0..6
            language: Math.floor(Math.random() * 4),              // 0..3
            abstraction: Math.floor(Math.random() * 3),           // 0..2
            delayedRecall: Math.floor(Math.random() * 6),         // 0..5
            orientation: Math.floor(Math.random() * 7)            // 0..6
          },
          educationYears: edYears
        };
        const mocaRes = calculateMoca(mocaInput);
        expect(mocaRes.rawScore).toBeGreaterThanOrEqual(0);
        expect(mocaRes.rawScore).toBeLessThanOrEqual(30);
        expect(mocaRes.adjustedScore).toBeGreaterThanOrEqual(0);
        expect(mocaRes.adjustedScore).toBeLessThanOrEqual(30); // STRICT CEILING
        expect(Number.isInteger(mocaRes.adjustedScore)).toBe(true);
        expect(mocaRes.meetsClinicalCutoff).toBe(mocaRes.adjustedScore < 26);
      }
    });
  });

});
