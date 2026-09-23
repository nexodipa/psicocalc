/**
 * Challenger 2 Adversarial Stress Suite — Milestone M5
 * Clinical Psychometric Expansion Verification
 *
 * EMPIRICAL CHALLENGES:
 * 1. SDQ Prosocial behavior strict exclusion invariant across all test vectors.
 * 2. GAD-7 clinical cutoff discontinuity at score >= 10 vs 9 across all 16,384 combinations.
 * 3. PHQ-9 DSM-5 major depression categorical criteria implementation and item 9 threshold.
 * 4. MoCA Serial 7s non-linear lookup conversion and 7-domain summation with education adjustment capping.
 */

import { describe, it, expect } from 'vitest';
import {
  // SDQ
  calculateSdq,
  calculateSdqSubscaleScore,
  classifySdqSubscale,
  classifySdqTotalDifficulties,
  invertSdqItem,
  isSdqItemReversed,
  validateSdqInput,
  SDQ_REVERSED_ITEMS,
  SDQ_SUBSCALE_METAS,
  SdqInformantType,
  SdqSubscaleId,
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
  validateMocaInput,
  MocaDomainId
} from '../../core';

describe('Adversarial Clinical Verification — Challenger 2 (Milestone M5)', () => {

  // =========================================================================
  // 1. SDQ PROSOCIAL BEHAVIOR STRICT EXCLUSION INVARIANT
  // =========================================================================
  describe('Dimension 1: SDQ Prosocial Behavior Strict Exclusion Invariant', () => {

    it('verifies Prosocial behavior is strictly excluded: Total Difficulties = Emotional + Conduct + Hyperactivity + Peer', () => {
      // Benchmark check: max difficulties (40) + max prosocial (10)
      const maxAll: Record<number, number> = {
        // Emotional (3, 8, 13, 16, 24) = 2 -> 10
        3: 2, 8: 2, 13: 2, 16: 2, 24: 2,
        // Conduct (5, 7[inv], 12, 18, 22) -> 10
        5: 2, 7: 0, 12: 2, 18: 2, 22: 2,
        // Hyperactivity (2, 10, 15, 21[inv], 25[inv]) -> 10
        2: 2, 10: 2, 15: 2, 21: 0, 25: 0,
        // Peer (6, 11[inv], 14[inv], 19, 23) -> 10
        6: 2, 11: 0, 14: 0, 19: 2, 23: 2,
        // Prosocial (1, 4, 9, 17, 20) = 2 -> 10
        1: 2, 4: 2, 9: 2, 17: 2, 20: 2
      };

      const result = calculateSdq({ informant: 'parent', responses: maxAll });
      expect(result.subscales.emotional.rawScore).toBe(10);
      expect(result.subscales.conduct.rawScore).toBe(10);
      expect(result.subscales.hyperactivity.rawScore).toBe(10);
      expect(result.subscales.peer.rawScore).toBe(10);
      expect(result.subscales.prosocial.rawScore).toBe(10);

      // Invariant: Total Difficulties MUST be strictly 40, NEVER 50
      expect(result.totalDifficulties.score).toBe(40);
      expect(result.totalDifficulties.maxScore).toBe(40);
    });

    it('verifies floor difficulties (0) + ceiling prosocial (10) yields Total Difficulties = 0 (NOT 10)', () => {
      const responses: Record<number, number> = {
        // Emotional = 0
        3: 0, 8: 0, 13: 0, 16: 0, 24: 0,
        // Conduct = 0 (item 7 inv: 2 -> 0)
        5: 0, 7: 2, 12: 0, 18: 0, 22: 0,
        // Hyperactivity = 0 (21, 25 inv: 2 -> 0)
        2: 0, 10: 0, 15: 0, 21: 2, 25: 2,
        // Peer = 0 (11, 14 inv: 2 -> 0)
        6: 0, 11: 2, 14: 2, 19: 0, 23: 0,
        // Prosocial = 10 (all 2)
        1: 2, 4: 2, 9: 2, 17: 2, 20: 2
      };

      const result = calculateSdq({ informant: 'parent', responses });
      expect(result.subscales.prosocial.rawScore).toBe(10);
      expect(result.totalDifficulties.score).toBe(0);
    });

    it('verifies ceiling difficulties (40) + floor prosocial (0) yields Total Difficulties = 40', () => {
      const responses: Record<number, number> = {
        // Emotional = 10
        3: 2, 8: 2, 13: 2, 16: 2, 24: 2,
        // Conduct = 10 (item 7 inv: 0 -> 2)
        5: 2, 7: 0, 12: 2, 18: 2, 22: 2,
        // Hyperactivity = 10 (21, 25 inv: 0 -> 2)
        2: 2, 10: 2, 15: 2, 21: 0, 25: 0,
        // Peer = 10 (11, 14 inv: 0 -> 2)
        6: 2, 11: 0, 14: 0, 19: 2, 23: 2,
        // Prosocial = 0
        1: 0, 4: 0, 9: 0, 17: 0, 20: 0
      };

      const result = calculateSdq({ informant: 'teacher', responses });
      expect(result.subscales.prosocial.rawScore).toBe(0);
      expect(result.totalDifficulties.score).toBe(40);
    });

    it('orthogonal sensitivity test: altering ONLY prosocial items produces 0 variance in Total Difficulties across 500 random vectors', () => {
      const difficultyItemKeys = [2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 18, 19, 21, 22, 23, 24, 25];
      const prosocialItemKeys = [1, 4, 9, 17, 20];
      const informants: SdqInformantType[] = ['parent', 'self', 'teacher'];

      for (let trial = 0; trial < 500; trial++) {
        // Generate random difficulty items
        const baseResponses: Record<number, number> = {};
        for (const k of difficultyItemKeys) {
          baseResponses[k] = Math.floor(Math.random() * 3);
        }

        const informant = informants[trial % 3];

        // Case A: Prosocial = 0 (all 0)
        const responsesA = { ...baseResponses };
        for (const p of prosocialItemKeys) responsesA[p] = 0;
        const resA = calculateSdq({ informant, responses: responsesA });

        // Case B: Prosocial = 10 (all 2)
        const responsesB = { ...baseResponses };
        for (const p of prosocialItemKeys) responsesB[p] = 2;
        const resB = calculateSdq({ informant, responses: responsesB });

        // Case C: Prosocial random (0..2)
        const responsesC = { ...baseResponses };
        for (const p of prosocialItemKeys) responsesC[p] = Math.floor(Math.random() * 3);
        const resC = calculateSdq({ informant, responses: responsesC });

        // INVARIANT 1: Total difficulties MUST be strictly identical regardless of prosocial score
        expect(resA.totalDifficulties.score).toBe(resB.totalDifficulties.score);
        expect(resA.totalDifficulties.score).toBe(resC.totalDifficulties.score);

        // INVARIANT 2: Total difficulties MUST equal exact sum of the 4 difficulty subscales
        const expectedDiff =
          resA.subscales.emotional.rawScore +
          resA.subscales.conduct.rawScore +
          resA.subscales.hyperactivity.rawScore +
          resA.subscales.peer.rawScore;

        expect(resA.totalDifficulties.score).toBe(expectedDiff);
        expect(resA.totalDifficulties.score).toBeGreaterThanOrEqual(0);
        expect(resA.totalDifficulties.score).toBeLessThanOrEqual(40);

        // Prosocial variance confirmed
        expect(resA.subscales.prosocial.rawScore).toBe(0);
        expect(resB.subscales.prosocial.rawScore).toBe(10);
      }
    });

    it('verifies metadata contract: isStrengthScale is true ONLY for prosocial', () => {
      const subscales: SdqSubscaleId[] = ['emotional', 'conduct', 'hyperactivity', 'peer', 'prosocial'];
      for (const id of subscales) {
        const meta = SDQ_SUBSCALE_METAS[id];
        if (id === 'prosocial') {
          expect(meta.isStrengthScale).toBe(true);
        } else {
          expect(meta.isStrengthScale).toBe(false);
        }
      }
    });
  });

  // =========================================================================
  // 2. GAD-7 CLINICAL CUTOFF DISCONTINUITY AT SCORE 9 VS 10
  // =========================================================================
  describe('Dimension 2: GAD-7 Clinical Cutoff Discontinuity at Score 9 vs 10', () => {

    it('asserts step discontinuity at boundary: score 9 is NOT clinical, score 10 IS clinical', () => {
      // Score 9 vector
      const res9 = calculateGad7([3, 3, 3, 0, 0, 0, 0]);
      expect(res9.totalScore).toBe(9);
      expect(res9.severity).toBe('Ansiedad leve');
      expect(res9.meetsClinicalCutoff).toBe(false);

      // Score 10 vector
      const res10 = calculateGad7([3, 3, 3, 1, 0, 0, 0]);
      expect(res10.totalScore).toBe(10);
      expect(res10.severity).toBe('Ansiedad moderada');
      expect(res10.meetsClinicalCutoff).toBe(true);
    });

    it('exhaustive verification of all 16,384 GAD-7 input combinations (4^7)', () => {
      // There are 4^7 = 16,384 combinations of 7 items each taking values 0, 1, 2, 3.
      // We will verify the exact behavior of calculateGad7 across every single permutation.
      let count9 = 0;
      let count10 = 0;

      const responses = [0, 0, 0, 0, 0, 0, 0];

      function traverse(itemIndex: number, currentSum: number) {
        if (itemIndex === 7) {
          // Check invariant for this combination
          const res = calculateGad7(responses);
          expect(res.totalScore).toBe(currentSum);

          // Clinical cutoff invariant: strictly >= 10
          if (currentSum >= 10) {
            expect(res.meetsClinicalCutoff).toBe(true);
          } else {
            expect(res.meetsClinicalCutoff).toBe(false);
          }

          // Severity bracket invariant
          if (currentSum <= 4) {
            expect(res.severity).toBe('Ansiedad mínima');
          } else if (currentSum <= 9) {
            expect(res.severity).toBe('Ansiedad leve');
            if (currentSum === 9) count9++;
          } else if (currentSum <= 14) {
            expect(res.severity).toBe('Ansiedad moderada');
            if (currentSum === 10) count10++;
          } else {
            expect(res.severity).toBe('Ansiedad severa');
          }

          return;
        }

        for (let val = 0; val <= 3; val++) {
          responses[itemIndex] = val;
          traverse(itemIndex + 1, currentSum + val);
        }
      }

      traverse(0, 0);

      // Confirm both boundary scores were heavily sampled
      expect(count9).toBeGreaterThan(0);
      expect(count10).toBeGreaterThan(0);
    });

    it('verifies monotonicity of GAD-7 meetsClinicalCutoff step function', () => {
      for (let s = 0; s <= 21; s++) {
        // Construct a vector summing to s
        const vec = [0, 0, 0, 0, 0, 0, 0];
        let rem = s;
        for (let i = 0; i < 7; i++) {
          const take = Math.min(3, rem);
          vec[i] = take;
          rem -= take;
        }
        const res = calculateGad7(vec);
        expect(res.totalScore).toBe(s);
        expect(res.meetsClinicalCutoff).toBe(s >= 10);
      }
    });

    it('accepts both array and object formats with identical results at cutoff', () => {
      const arr9 = [3, 2, 2, 2, 0, 0, 0]; // sum = 9
      const obj9 = { 1: 3, 2: 2, 3: 2, 4: 2, 5: 0, 6: 0, 7: 0 };
      expect(calculateGad7(arr9).meetsClinicalCutoff).toBe(false);
      expect(calculateGad7(obj9).meetsClinicalCutoff).toBe(false);

      const arr10 = [3, 2, 2, 2, 1, 0, 0]; // sum = 10
      const obj10 = { 1: 3, 2: 2, 3: 2, 4: 2, 5: 1, 6: 0, 7: 0 };
      expect(calculateGad7(arr10).meetsClinicalCutoff).toBe(true);
      expect(calculateGad7(obj10).meetsClinicalCutoff).toBe(true);
    });
  });

  // =========================================================================
  // 3. PHQ-9 DSM-5 MAJOR DEPRESSION CATEGORICAL CRITERIA
  // =========================================================================
  describe('Dimension 3: PHQ-9 DSM-5 Major Depression Categorical Criteria', () => {

    it('satisfies DSM-5 with Cardinal 1 (Anhedonia >= 2) and 4 other symptoms >= 2', () => {
      // Item 1 = 2 (cardinal)
      // Items 3, 4, 5, 6 = 2 (4 other symptoms)
      // Total symptoms = 5
      const responses: Record<number, number> = {
        1: 2, 2: 0, 3: 2, 4: 2, 5: 2, 6: 2, 7: 0, 8: 0, 9: 0
      };
      expect(evaluatePhq9MajorDepression(responses)).toBe(true);

      const fullResult = calculatePhq9(responses);
      expect(fullResult.meetsMajorDepressionCriteria).toBe(true);
    });

    it('satisfies DSM-5 with Cardinal 2 (Depressed Mood >= 2) and 4 other symptoms >= 2', () => {
      // Item 2 = 2 (cardinal)
      // Items 3, 5, 7, 8 = 2 (4 other symptoms)
      // Total symptoms = 5
      const responses: Record<number, number> = {
        1: 0, 2: 2, 3: 2, 4: 0, 5: 2, 6: 0, 7: 2, 8: 2, 9: 0
      };
      expect(evaluatePhq9MajorDepression(responses)).toBe(true);

      const fullResult = calculatePhq9(responses);
      expect(fullResult.meetsMajorDepressionCriteria).toBe(true);
    });

    it('satisfies DSM-5 when BOTH cardinal symptoms are present (Items 1 & 2 >= 2) and 3 other symptoms', () => {
      // Items 1 & 2 = 2 (2 cardinal)
      // Items 4, 6, 8 = 2 (3 other symptoms)
      // Total symptoms = 5
      const responses: Record<number, number> = {
        1: 2, 2: 2, 3: 0, 4: 2, 5: 0, 6: 2, 7: 0, 8: 2, 9: 0
      };
      expect(evaluatePhq9MajorDepression(responses)).toBe(true);
      expect(calculatePhq9(responses).meetsMajorDepressionCriteria).toBe(true);
    });

    it('FAILS DSM-5 if NEITHER cardinal symptom is >= 2, even if 7 other symptoms are maximally severe', () => {
      // Items 1 = 1, Item 2 = 1 (neither meets >= 2 threshold)
      // Items 3, 4, 5, 6, 7, 8 = 3, Item 9 = 3 (7 symptoms present with maximum score)
      const responses: Record<number, number> = {
        1: 1, 2: 1, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3
      };
      expect(evaluatePhq9MajorDepression(responses)).toBe(false);

      const fullResult = calculatePhq9(responses);
      expect(fullResult.totalScore).toBe(23); // High score (Severa)
      expect(fullResult.severity).toBe('Severa');
      expect(fullResult.meetsClinicalCutoff).toBe(true);
      // But DSM-5 categorical major depression criteria MUST be false
      expect(fullResult.meetsMajorDepressionCriteria).toBe(false);
    });

    it('verifies asymmetric threshold for Item 9 (counts if >= 1, while items 1-8 require >= 2)', () => {
      // Cardinal Item 1 = 2 (1 symptom)
      // Items 3, 4, 5 = 2 (3 symptoms)
      // Total so far = 4 symptoms

      // Subcase A: Item 9 = 0 -> Total = 4 symptoms -> FAILS DSM-5
      const responsesA: Record<number, number> = {
        1: 2, 2: 0, 3: 2, 4: 2, 5: 2, 6: 0, 7: 0, 8: 0, 9: 0
      };
      expect(evaluatePhq9MajorDepression(responsesA)).toBe(false);

      // Subcase B: Item 9 = 1 -> Counts as symptom in DSM-5 -> Total = 5 symptoms -> PASSES DSM-5
      const responsesB: Record<number, number> = {
        1: 2, 2: 0, 3: 2, 4: 2, 5: 2, 6: 0, 7: 0, 8: 0, 9: 1
      };
      expect(evaluatePhq9MajorDepression(responsesB)).toBe(true);

      // Subcase C: Non-cardinal Item 6 = 1 instead of Item 9 (Item 6 does NOT qualify at 1) -> FAILS DSM-5
      const responsesC: Record<number, number> = {
        1: 2, 2: 0, 3: 2, 4: 2, 5: 2, 6: 1, 7: 0, 8: 0, 9: 0
      };
      expect(evaluatePhq9MajorDepression(responsesC)).toBe(false);
    });

    it('verifies suicide risk alert operates independently of DSM-5 major depression diagnosis', () => {
      // Patient with isolated suicidal ideation (Item 9 = 1, all others 0)
      const isolatedSuicide = calculatePhq9([0, 0, 0, 0, 0, 0, 0, 0, 1]);
      expect(isolatedSuicide.suicideRiskAlert.triggered).toBe(true);
      expect(isolatedSuicide.suicideRiskAlert.level).toBe('CRITICAL');
      expect(isolatedSuicide.meetsMajorDepressionCriteria).toBe(false);
      expect(isolatedSuicide.meetsClinicalCutoff).toBe(false);

      // Patient with severe major depression but NO suicidal ideation (Item 9 = 0, others >= 2)
      const depressionNoSuicide = calculatePhq9([2, 2, 2, 2, 2, 0, 0, 0, 0]);
      expect(depressionNoSuicide.meetsMajorDepressionCriteria).toBe(true);
      expect(depressionNoSuicide.suicideRiskAlert.triggered).toBe(false);
      expect(depressionNoSuicide.suicideRiskAlert.level).toBe('NONE');
    });

    it('stress-tests 1,000 stochastic permutations of DSM-5 diagnostic combinations against formal oracle', () => {
      function oracleMajorDepression(vec: number[]): boolean {
        const item1 = vec[0];
        const item2 = vec[1];
        if (item1 < 2 && item2 < 2) return false;

        let symptoms = 0;
        for (let i = 0; i < 8; i++) {
          if (vec[i] >= 2) symptoms++;
        }
        if (vec[8] >= 1) symptoms++;

        return symptoms >= 5;
      }

      for (let t = 0; t < 1000; t++) {
        const vec = Array.from({ length: 9 }, () => Math.floor(Math.random() * 4));
        const res = calculatePhq9(vec);
        const expected = oracleMajorDepression(vec);
        expect(res.meetsMajorDepressionCriteria).toBe(expected);
      }
    });
  });

  // =========================================================================
  // 4. MOCA SERIAL 7s CONVERSION & 7-DOMAIN SUMMATION
  // =========================================================================
  describe('Dimension 4: MoCA Serial 7s Conversion & 7-Domain Summation', () => {

    it('verifies exact Serial 7s non-linear lookup conversion table across all cases', () => {
      // Nasreddine standardized table:
      // 4 or 5 correct subtractions: 3 points
      // 2 or 3 correct subtractions: 2 points
      // 1 correct subtraction: 1 point
      // 0 correct subtractions: 0 points
      expect(getMocaSerial7Score(5)).toBe(3);
      expect(getMocaSerial7Score(4)).toBe(3);
      expect(getMocaSerial7Score(3)).toBe(2);
      expect(getMocaSerial7Score(2)).toBe(2);
      expect(getMocaSerial7Score(1)).toBe(1);
      expect(getMocaSerial7Score(0)).toBe(0);
    });

    it('verifies 7-domain summation across all 7 cognitive domains (sum of max scores = 30)', () => {
      const maxDomains = {
        visuospatialExecutive: 5,
        naming: 3,
        attention: 6,
        language: 3,
        abstraction: 2,
        delayedRecall: 5,
        orientation: 6
      };

      const result = calculateMoca({ domains: maxDomains, educationYears: 16 });
      expect(result.rawScore).toBe(30);
      expect(result.adjustedScore).toBe(30);
      expect(result.meetsClinicalCutoff).toBe(false);
      expect(result.classification).toBe('Normal');

      // Verify each domain breakdown
      expect(result.domains.visuospatialExecutive.score).toBe(5);
      expect(result.domains.visuospatialExecutive.maxScore).toBe(5);

      expect(result.domains.naming.score).toBe(3);
      expect(result.domains.naming.maxScore).toBe(3);

      expect(result.domains.attention.score).toBe(6);
      expect(result.domains.attention.maxScore).toBe(6);

      expect(result.domains.language.score).toBe(3);
      expect(result.domains.language.maxScore).toBe(3);

      expect(result.domains.abstraction.score).toBe(2);
      expect(result.domains.abstraction.maxScore).toBe(2);

      expect(result.domains.delayedRecall.score).toBe(5);
      expect(result.domains.delayedRecall.maxScore).toBe(5);

      expect(result.domains.orientation.score).toBe(6);
      expect(result.domains.orientation.maxScore).toBe(6);
    });

    it('stress-tests 1,000 random domain vectors for exact summation and adjustment rules', () => {
      const domainMaxes: Record<MocaDomainId, number> = {
        visuospatialExecutive: 5,
        naming: 3,
        attention: 6,
        language: 3,
        abstraction: 2,
        delayedRecall: 5,
        orientation: 6
      };

      for (let t = 0; t < 1000; t++) {
        const domains = {
          visuospatialExecutive: Math.floor(Math.random() * 6),
          naming: Math.floor(Math.random() * 4),
          attention: Math.floor(Math.random() * 7),
          language: Math.floor(Math.random() * 4),
          abstraction: Math.floor(Math.random() * 3),
          delayedRecall: Math.floor(Math.random() * 6),
          orientation: Math.floor(Math.random() * 7)
        };

        const educationYears = Math.floor(Math.random() * 21); // 0..20 years
        const expectedRaw =
          domains.visuospatialExecutive +
          domains.naming +
          domains.attention +
          domains.language +
          domains.abstraction +
          domains.delayedRecall +
          domains.orientation;

        const expectedAdjustment = educationYears <= 12 ? 1 : 0;
        const expectedAdjusted = Math.min(30, expectedRaw + expectedAdjustment);
        const expectedCutoff = expectedAdjusted < 26;

        const res = calculateMoca({ domains, educationYears });

        expect(res.rawScore).toBe(expectedRaw);
        expect(res.educationAdjustment).toBe(expectedAdjustment);
        expect(res.adjustedScore).toBe(expectedAdjusted);
        expect(res.adjustedScore).toBeLessThanOrEqual(30);
        expect(res.adjustedScore).toBeGreaterThanOrEqual(0);
        expect(res.meetsClinicalCutoff).toBe(expectedCutoff);
      }
    });

    it('verifies ceiling clamping invariant: adjustedScore NEVER exceeds 30 even with adjustment', () => {
      for (let raw = 0; raw <= 30; raw++) {
        // Build domain scores that sum to raw
        let rem = raw;
        const doms: Record<MocaDomainId, number> = {
          visuospatialExecutive: 0,
          naming: 0,
          attention: 0,
          language: 0,
          abstraction: 0,
          delayedRecall: 0,
          orientation: 0
        };

        const maxes: [MocaDomainId, number][] = [
          ['visuospatialExecutive', 5],
          ['naming', 3],
          ['attention', 6],
          ['language', 3],
          ['abstraction', 2],
          ['delayedRecall', 5],
          ['orientation', 6]
        ];

        for (const [id, maxVal] of maxes) {
          const alloc = Math.min(maxVal, rem);
          doms[id] = alloc;
          rem -= alloc;
        }

        const resLowEd = calculateMoca({ domains: doms, educationYears: 6 });
        expect(resLowEd.adjustedScore).toBe(Math.min(30, raw + 1));
        expect(resLowEd.adjustedScore).toBeLessThanOrEqual(30);

        const resHighEd = calculateMoca({ domains: doms, educationYears: 16 });
        expect(resHighEd.adjustedScore).toBe(raw);
        expect(resHighEd.adjustedScore).toBeLessThanOrEqual(30);
      }
    });

    it('verifies clinical cutoff boundary (< 26): exactly 25 triggers cutoff, exactly 26 does not', () => {
      // 25 without adjustment -> triggers cutoff
      const res25 = calculateMoca({
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
      expect(res25.adjustedScore).toBe(25);
      expect(res25.meetsClinicalCutoff).toBe(true);
      expect(res25.classification).toBe('Deterioro Cognitivo Leve');

      // 25 WITH adjustment -> becomes 26 -> does NOT trigger cutoff
      const res26Adj = calculateMoca({
        domains: {
          visuospatialExecutive: 4,
          naming: 3,
          attention: 5,
          language: 2,
          abstraction: 1,
          delayedRecall: 4,
          orientation: 6
        },
        educationYears: 12
      });
      expect(res26Adj.adjustedScore).toBe(26);
      expect(res26Adj.meetsClinicalCutoff).toBe(false);
      expect(res26Adj.classification).toBe('Normal');

      // 26 without adjustment -> does NOT trigger cutoff
      const res26Raw = calculateMoca({
        domains: {
          visuospatialExecutive: 5,
          naming: 3,
          attention: 5,
          language: 2,
          abstraction: 1,
          delayedRecall: 4,
          orientation: 6
        },
        educationYears: 16
      });
      expect(res26Raw.adjustedScore).toBe(26);
      expect(res26Raw.meetsClinicalCutoff).toBe(false);
      expect(res26Raw.classification).toBe('Normal');
    });
  });

});
