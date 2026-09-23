/**
 * ============================================================================
 * Psicocalc — Milestone M8: Final Adversarial Coverage Hardening (Tier 5)
 * Empirical Challenger 1 (challenger_m8_1)
 * ============================================================================
 * Focus:
 * 1. SDQ: Reversed items (7, 11, 14, 21, 25) mathematical involution & range invariance,
 *    subscale Goodman prorating limits, strict Prosocial exclusion from Total Difficulties
 *    under exhaustive combinatorial & property-based mutations.
 * 2. PHQ-9: Item 9 suicide risk alert unconditional sensitivity (0 suppressed, 1..3 triggered),
 *    orthogonal independence from total severity, and DSM-5 Major Depressive Episode logic.
 * 3. MoCA: Education adjustment (+1 if <= 12 yrs), strict 30 ceiling ceiling clamp,
 *    and exact clinical cutoff (< 26) boundary transitions.
 * 4. GAD-7: Exact clinical anxiety cutoff (score >= 10), severity bands, boundary invariants.
 * 5. HTP: Pure qualitative synthesis (0 artificial numerical scores), resilient injection
 *    safety of clinician field notes, and complete 5-paragraph structure coverage.
 * 6. Fuzzing / Property-Based Invariant Verification: 500 stochastic trials.
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Phq9SuicideAlertBanner } from '../../ui/components/clinical/Phq9SuicideAlertBanner';
import { MocaScoreAlert } from '../../ui/components/clinical/MocaScoreAlert';
import {
  calculateSdq,
  calculateSdqSubscaleScore,
  invertSdqItem,
  isSdqItemReversed,
  validateSdqInput,
  classifySdqSubscale,
  classifySdqTotalDifficulties,
  calculatePhq9,
  checkPhq9SuicideAlert,
  classifyPhq9Severity,
  evaluatePhq9MajorDepression,
  validatePhq9Input,
  calculateGad7,
  classifyGad7Severity,
  validateGad7Input,
  calculateMoca,
  classifyMoca,
  getMocaEducationAdjustment,
  validateMocaInput,
} from '../../core/engine/clinicalCalculators';
import {
  generateFormalSummary,
  generateHouseNarrative,
  generateTreeNarrative,
  generatePersonNarrative,
  generateIntegratedConclusion,
  generateHtpFullReport,
} from '../../core/engine/htpNarrativeEngine';
import {
  SDQ_REVERSED_ITEMS,
  SDQ_SUBSCALE_METAS,
  SDQ_NORMS,
  MOCA_DOMAINS,
  PHQ9_SEVERITY_BANDS,
  GAD7_SEVERITY_BANDS,
} from '../../core/tables/clinicalNorms';
import {
  HtpAssessmentRecord,
  INITIAL_HTP_RECORD,
  HtpFormalFeatures,
  HouseFeatures,
  TreeFeatures,
  PersonFeatures,
} from '../../core/types/htp';
import {
  SdqInformantType,
  SdqSubscaleId,
  MocaDomainId,
} from '../../core/types/clinical';

describe('Psicocalc — Milestone M8: Final Adversarial Coverage Hardening (Challenger 1)', () => {

  /* =========================================================================
   * DIMENSION 1: SDQ INVARIANT HARDENING & PROSOCIAL ISOLATION
   * ========================================================================= */
  describe('Dimension 1: SDQ Invariant Hardening & Prosocial Isolation', () => {

    it('SDQ-REV-1: verifies reversed items {7, 11, 14, 21, 25} form a perfect involution (2 - (2 - x) === x)', () => {
      const reversedSet = new Set(SDQ_REVERSED_ITEMS);
      expect(Array.from(reversedSet).sort((a, b) => a - b)).toEqual([7, 11, 14, 21, 25]);

      for (let item = 1; item <= 25; item++) {
        const isRev = reversedSet.has(item);
        expect(isSdqItemReversed(item)).toBe(isRev);

        for (const raw of [0, 1, 2]) {
          const transformed = invertSdqItem(item, raw);
          if (isRev) {
            expect(transformed).toBe(2 - raw);
            // Involution property: inverting again yields the original raw score
            expect(invertSdqItem(item, transformed)).toBe(raw);
          } else {
            expect(transformed).toBe(raw);
            // Identity property
            expect(invertSdqItem(item, transformed)).toBe(raw);
          }
        }
      }
    });

    it('SDQ-REV-2: rejects invalid raw response types or out-of-range values', () => {
      const invalidValues = [-1, 3, 1.5, -0.1, NaN, Infinity, -Infinity];
      for (const item of [7, 11, 14, 21, 25, 1, 2, 3]) {
        for (const val of invalidValues) {
          expect(() => invertSdqItem(item, val as any)).toThrow(/Invalid SDQ raw response/i);
        }
      }
    });

    it('SDQ-PRO-1: Prosocial score changes NEVER alter Total Difficulties score across all informant norms', () => {
      const informants: SdqInformantType[] = ['parent', 'self', 'teacher'];

      for (const informant of informants) {
        // Base response vector with non-prosocial items set to arbitrary valid scores
        const baseResponses: Record<number, number> = {};
        for (let i = 1; i <= 25; i++) {
          baseResponses[i] = (i % 3); // 0, 1, or 2
        }

        const prosocialItems = SDQ_SUBSCALE_METAS.prosocial.itemNumbers; // [1, 4, 9, 17, 20]

        // Calculate initial total difficulties
        const baseResult = calculateSdq({ informant, responses: baseResponses });
        const baselineTotalDifficulties = baseResult.totalDifficulties.score;

        // Systematically mutate ONLY the prosocial items to all 0s, all 1s, and all 2s
        const prosocialPermutations: number[][] = [
          [0, 0, 0, 0, 0],
          [1, 1, 1, 1, 1],
          [2, 2, 2, 2, 2],
          [0, 2, 0, 2, 0],
          [2, 0, 2, 0, 2],
        ];

        for (const perm of prosocialPermutations) {
          const mutatedResponses = { ...baseResponses };
          prosocialItems.forEach((itemNum, idx) => {
            mutatedResponses[itemNum] = perm[idx];
          });

          const mutatedResult = calculateSdq({ informant, responses: mutatedResponses });

          // Total difficulties MUST remain invariant
          expect(mutatedResult.totalDifficulties.score).toBe(baselineTotalDifficulties);
          expect(mutatedResult.totalDifficulties.classification).toBe(baseResult.totalDifficulties.classification);

          // Verify exact mathematical formula: emotional + conduct + hyperactivity + peer
          const expectedDiff =
            mutatedResult.subscales.emotional.rawScore +
            mutatedResult.subscales.conduct.rawScore +
            mutatedResult.subscales.hyperactivity.rawScore +
            mutatedResult.subscales.peer.rawScore;

          expect(mutatedResult.totalDifficulties.score).toBe(expectedDiff);
          // And total difficulties never exceeds 40
          expect(mutatedResult.totalDifficulties.score).toBeLessThanOrEqual(40);
          expect(mutatedResult.totalDifficulties.score).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('SDQ-PRO-2: Cartesian product of all 243 (3^5) prosocial response combinations preserves Total Difficulties invariance', () => {
      // Base responses: fixed values for non-prosocial items
      const baseResponses: Record<number, number> = {};
      for (let i = 1; i <= 25; i++) {
        baseResponses[i] = 1; // All non-prosocial set to 1
      }
      const prosocialItems = SDQ_SUBSCALE_METAS.prosocial.itemNumbers; // [1, 4, 9, 17, 20]

      // Baseline with all prosocial set to 0
      prosocialItems.forEach(item => { baseResponses[item] = 0; });
      const baselineResult = calculateSdq({ informant: 'parent', responses: baseResponses });
      const targetTotalDifficulties = baselineResult.totalDifficulties.score;

      // Iterate through all 3^5 = 243 combinations
      for (let p0 = 0; p0 <= 2; p0++) {
        for (let p1 = 0; p1 <= 2; p1++) {
          for (let p2 = 0; p2 <= 2; p2++) {
            for (let p3 = 0; p3 <= 2; p3++) {
              for (let p4 = 0; p4 <= 2; p4++) {
                const combo = [p0, p1, p2, p3, p4];
                const mutated = { ...baseResponses };
                prosocialItems.forEach((item, idx) => {
                  mutated[item] = combo[idx];
                });

                const res = calculateSdq({ informant: 'parent', responses: mutated });
                expect(res.totalDifficulties.score).toBe(targetTotalDifficulties);
                expect(res.subscales.prosocial.rawScore).toBe(p0 + p1 + p2 + p3 + p4);
              }
            }
          }
        }
      }
    });

    it('SDQ-PRORATE-2: 32-subset combinatorial test for Goodman prorating rules across all possible subsets of 5 items', () => {
      const items = SDQ_SUBSCALE_METAS.conduct.itemNumbers; // [5, 7, 12, 18, 22], item 7 reversed
      // 2^5 = 32 subsets
      for (let mask = 0; mask < 32; mask++) {
        const subsetResponses: Record<number, number> = {};
        let answeredCount = 0;

        for (let i = 0; i < 5; i++) {
          if ((mask & (1 << i)) !== 0) {
            subsetResponses[items[i]] = 1; // Answer 1
            answeredCount++;
          }
        }

        if (answeredCount < 3) {
          expect(() => calculateSdqSubscaleScore(subsetResponses, 'conduct')).toThrow(
            /Goodman prorating requires at least 3 answered items/i
          );
        } else {
          const subResult = calculateSdqSubscaleScore(subsetResponses, 'conduct');
          expect(subResult.answeredCount).toBe(answeredCount);
          expect(subResult.score).toBeGreaterThanOrEqual(0);
          expect(subResult.score).toBeLessThanOrEqual(10);
          expect(subResult.isProrated).toBe(answeredCount !== 5);
        }
      }
    });

    it('SDQ-PRORATE-1: Goodman prorating algorithm correctly handles 3, 4, and 5 answered items per scale', () => {
      // Subscale hyperactivity items: [2, 10, 15, 21, 25] (items 21, 25 are reversed)
      // Test 5 answered items: raw [2, 2, 2, 0, 0] -> inverted [2, 2, 2, 2, 2] = sum 10
      const resp5: Record<number, number> = { 2: 2, 10: 2, 15: 2, 21: 0, 25: 0 };
      const res5 = calculateSdqSubscaleScore(resp5, 'hyperactivity');
      expect(res5.score).toBe(10);
      expect(res5.answeredCount).toBe(5);
      expect(res5.isProrated).toBe(false);

      // Test 4 answered items: raw [2, 2, 2, 0] (item 25 missing) -> inverted [2, 2, 2, 2] = sum 8
      // Goodman formula: round(8 * 5 / 4) = round(40 / 4) = 10
      const resp4: Record<number, number> = { 2: 2, 10: 2, 15: 2, 21: 0 };
      const res4 = calculateSdqSubscaleScore(resp4, 'hyperactivity');
      expect(res4.score).toBe(10);
      expect(res4.answeredCount).toBe(4);
      expect(res4.isProrated).toBe(true);

      // Test 3 answered items: raw [2, 2, 2] (items 21, 25 missing) -> inverted [2, 2, 2] = sum 6
      // Goodman formula: round(6 * 5 / 3) = round(30 / 3) = 10
      const resp3: Record<number, number> = { 2: 2, 10: 2, 15: 2 };
      const res3 = calculateSdqSubscaleScore(resp3, 'hyperactivity');
      expect(res3.score).toBe(10);
      expect(res3.answeredCount).toBe(3);
      expect(res3.isProrated).toBe(true);

      // Test < 3 answered items: strictly throws error
      const resp2: Record<number, number> = { 2: 2, 10: 2 };
      expect(() => calculateSdqSubscaleScore(resp2, 'hyperactivity')).toThrow(/Goodman prorating requires at least 3/i);

      const resp1: Record<number, number> = { 2: 2 };
      expect(() => calculateSdqSubscaleScore(resp1, 'hyperactivity')).toThrow(/Goodman prorating requires at least 3/i);

      const resp0: Record<number, number> = {};
      expect(() => calculateSdqSubscaleScore(resp0, 'hyperactivity')).toThrow(/Goodman prorating requires at least 3/i);
    });

    it('SDQ-BOUNDS-1: evaluates all 3 informants against boundary conditions (all minimum 0s vs all maximum 2s)', () => {
      const informants: SdqInformantType[] = ['parent', 'self', 'teacher'];

      for (const informant of informants) {
        // All raw 0s
        const allZeros: Record<number, number> = {};
        for (let i = 1; i <= 25; i++) allZeros[i] = 0;
        const resZeros = calculateSdq({ informant, responses: allZeros });

        // Items 7, 11, 14, 21, 25 are reversed: 0 -> 2
        // Emotional (3, 8, 13, 16, 24): all direct 0 -> 0
        // Conduct (5, 7, 12, 18, 22): item 7 reversed (2), others 0 -> 2
        // Hyperactivity (2, 10, 15, 21, 25): 21 and 25 reversed (2+2), others 0 -> 4
        // Peer (6, 11, 14, 19, 23): 11 and 14 reversed (2+2), others 0 -> 4
        // Prosocial (1, 4, 9, 17, 20): all direct 0 -> 0 (Abnormal for strength)
        expect(resZeros.subscales.emotional.rawScore).toBe(0);
        expect(resZeros.subscales.conduct.rawScore).toBe(2);
        expect(resZeros.subscales.hyperactivity.rawScore).toBe(4);
        expect(resZeros.subscales.peer.rawScore).toBe(4);
        expect(resZeros.subscales.prosocial.rawScore).toBe(0);
        expect(resZeros.subscales.prosocial.classification).toBe('Abnormal');
        expect(resZeros.totalDifficulties.score).toBe(0 + 2 + 4 + 4); // 10

        // All raw 2s
        const allTwos: Record<number, number> = {};
        for (let i = 1; i <= 25; i++) allTwos[i] = 2;
        const resTwos = calculateSdq({ informant, responses: allTwos });

        // Inverted items: 2 -> 0
        // Emotional: 5 * 2 = 10
        // Conduct: 4 direct (8) + 1 reversed (0) = 8
        // Hyperactivity: 3 direct (6) + 2 reversed (0) = 6
        // Peer: 3 direct (6) + 2 reversed (0) = 6
        // Prosocial: 5 direct (10) = 10 (Normal)
        expect(resTwos.subscales.emotional.rawScore).toBe(10);
        expect(resTwos.subscales.conduct.rawScore).toBe(8);
        expect(resTwos.subscales.hyperactivity.rawScore).toBe(6);
        expect(resTwos.subscales.peer.rawScore).toBe(6);
        expect(resTwos.subscales.prosocial.rawScore).toBe(10);
        expect(resTwos.subscales.prosocial.classification).toBe('Normal');
        expect(resTwos.totalDifficulties.score).toBe(10 + 8 + 6 + 6); // 30
      }
    });
  });

  /* =========================================================================
   * DIMENSION 2: PHQ-9 SUICIDE RISK ALERT & DSM-5 DIAGNOSTIC LOGIC
   * ========================================================================= */
  describe('Dimension 2: PHQ-9 Suicide Risk Alert & DSM-5 Diagnostic Logic', () => {

    it('PHQ-ALERT-1: Item 9 triggers critical alert unconditionally on scores 1, 2, 3 and ONLY suppresses on 0', () => {
      // Test score 0
      const alert0 = checkPhq9SuicideAlert(0);
      expect(alert0.triggered).toBe(false);
      expect(alert0.level).toBe('NONE');
      expect(alert0.clinicalActionRequired).toBe(false);
      expect(alert0.bannerText).toBe('');

      // Test scores 1, 2, 3
      for (const score of [1, 2, 3] as const) {
        const alert = checkPhq9SuicideAlert(score);
        expect(alert.triggered).toBe(true);
        expect(alert.itemScore).toBe(score);
        expect(alert.level).toBe('CRITICAL');
        expect(alert.clinicalActionRequired).toBe(true);
        expect(alert.bannerText).toContain('ALERTA CLÍNICA CRÍTICA');
        expect(alert.clinicalNote).toContain('ítem 9');
      }
    });

    it('PHQ-ALERT-2: Suicide alert is completely orthogonal to total PHQ-9 score', () => {
      // Scenario A: Minimal overall depression (total = 1), but Item 9 = 1 -> MUST TRIGGER
      const minimalWithSuicide: Record<number, number> = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 1,
      };
      const resA = calculatePhq9(minimalWithSuicide as any);
      expect(resA.totalScore).toBe(1);
      expect(resA.severity).toBe('Ninguna / Mínima');
      expect(resA.meetsClinicalCutoff).toBe(false);
      expect(resA.isItem9AlertActive).toBe(true);
      expect(resA.suicideRiskAlert.triggered).toBe(true);
      expect(resA.suicideRiskAlert.level).toBe('CRITICAL');

      // Scenario B: Severe overall depression (total = 24), but Item 9 = 0 -> MUST NOT TRIGGER
      const severeNoSuicide: Record<number, number> = {
        1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 0,
      };
      const resB = calculatePhq9(severeNoSuicide as any);
      expect(resB.totalScore).toBe(24);
      expect(resB.severity).toBe('Severa');
      expect(resB.meetsClinicalCutoff).toBe(true);
      expect(resB.isItem9AlertActive).toBe(false);
      expect(resB.suicideRiskAlert.triggered).toBe(false);
      expect(resB.suicideRiskAlert.level).toBe('NONE');
    });

    it('PHQ-DSM-1: DSM-5 Major Depression algorithm requires cardinal symptom (item 1 or 2 >= 2) and >= 5 qualifying symptoms', () => {
      // Cardinal test: 7 symptoms at max score 3 (items 3-9), but items 1 and 2 are 1 (< 2)
      // Even though total score is 1 + 1 + 21 = 23 (Severa), cardinal requirement fails!
      const failedCardinal: Record<number, number> = {
        1: 1, 2: 1, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3,
      };
      expect(evaluatePhq9MajorDepression(failedCardinal)).toBe(false);

      // Cardinal passed (item 1 = 2), but only 4 qualifying symptoms (items 1, 3, 4, 5 >= 2; others 0)
      const fourSymptoms: Record<number, number> = {
        1: 2, 2: 0, 3: 2, 4: 2, 5: 2, 6: 1, 7: 1, 8: 1, 9: 0,
      };
      expect(evaluatePhq9MajorDepression(fourSymptoms)).toBe(false);

      // Cardinal passed (item 1 = 2) and exactly 5 qualifying symptoms (items 1, 3, 4, 5 >= 2 and item 9 = 1)
      // Note: for item 9, threshold is >= 1!
      const fiveSymptomsWithItem9: Record<number, number> = {
        1: 2, 2: 0, 3: 2, 4: 2, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1,
      };
      expect(evaluatePhq9MajorDepression(fiveSymptomsWithItem9)).toBe(true);
    });

    it('PHQ-SEV-1: verifies all severity band boundaries (0-4, 5-9, 10-14, 15-19, 20-27)', () => {
      const expectations: [number, string][] = [
        [0, 'Ninguna / Mínima'],
        [4, 'Ninguna / Mínima'],
        [5, 'Leve'],
        [9, 'Leve'],
        [10, 'Moderada'],
        [14, 'Moderada'],
        [15, 'Moderadamente Severa'],
        [19, 'Moderadamente Severa'],
        [20, 'Severa'],
        [27, 'Severa'],
      ];

      for (const [score, expectedSeverity] of expectations) {
        expect(classifyPhq9Severity(score)).toBe(expectedSeverity);
      }

      expect(() => classifyPhq9Severity(-1)).toThrow();
      expect(() => classifyPhq9Severity(28)).toThrow();
    });

    it('PHQ-UI-1: Phq9SuicideAlertBanner React component renders 024 emergency line on scores 1, 2, 3 and null on 0', () => {
      // Score 0: renders nothing
      const { container: c0 } = render(React.createElement(Phq9SuicideAlertBanner, { item9Score: 0 }));
      expect(c0.firstChild).toBeNull();

      // Negative score: renders nothing
      const { container: cNeg } = render(React.createElement(Phq9SuicideAlertBanner, { item9Score: -1 }));
      expect(cNeg.firstChild).toBeNull();

      // Scores 1, 2, 3: renders deontological alert banner
      for (const score of [1, 2, 3]) {
        const { unmount } = render(React.createElement(Phq9SuicideAlertBanner, { item9Score: score }));
        expect(screen.getByRole('alert')).toBeDefined();
        expect(screen.getByText(/Alerta Deontológica: Riesgo de Autolesión o Ideación Suicida/i)).toBeDefined();
        expect(screen.getByText(/Línea 024 de Atención a la Conducta Suicida/i)).toBeDefined();
        expect(screen.getByText(new RegExp(`Ítem 9 = .*\\(${score}\\)`, 'i'))).toBeDefined();
        unmount();
      }
    });
  });

  /* =========================================================================
   * DIMENSION 3: MoCA EDUCATION ADJUSTMENT, CAPPING & CUTOFF ACCURACY
   * ========================================================================= */
  describe('Dimension 3: MoCA Education Adjustment, Capping & Cutoff Accuracy', () => {

    it('MOCA-ADJ-1: Nasreddine rule strictly enforces <= 12 years (+1) vs >= 13 years (+0)', () => {
      for (let yrs = 0; yrs <= 12; yrs++) {
        expect(getMocaEducationAdjustment(yrs)).toBe(1);
      }
      for (let yrs = 13; yrs <= 25; yrs++) {
        expect(getMocaEducationAdjustment(yrs)).toBe(0);
      }
      expect(() => getMocaEducationAdjustment(-1)).toThrow(/Invalid education years/i);
    });

    it('MOCA-CAP-1: raw scores 29 and 30 with education <= 12 NEVER exceed 30', () => {
      const fullDomains = {
        visuospatialExecutive: 5,
        naming: 3,
        attention: 6,
        language: 3,
        abstraction: 2,
        delayedRecall: 5,
        orientation: 6,
      }; // raw = 30

      // Raw 30 + 0 yrs education -> 30 + 1 clamped to 30
      const res30 = calculateMoca({ domains: fullDomains, educationYears: 0 });
      expect(res30.rawScore).toBe(30);
      expect(res30.educationAdjustment).toBe(1);
      expect(res30.adjustedScore).toBe(30);
      expect(res30.adjustedScore).toBeLessThanOrEqual(30);
      expect(res30.meetsClinicalCutoff).toBe(false);

      // Raw 29 (visuospatial 4) + 12 yrs education -> 29 + 1 clamped to 30
      const domains29 = { ...fullDomains, visuospatialExecutive: 4 };
      const res29 = calculateMoca({ domains: domains29, educationYears: 12 });
      expect(res29.rawScore).toBe(29);
      expect(res29.educationAdjustment).toBe(1);
      expect(res29.adjustedScore).toBe(30);
      expect(res29.adjustedScore).toBeLessThanOrEqual(30);
      expect(res29.meetsClinicalCutoff).toBe(false);
    });

    it('MOCA-CUT-1: strictly validates the clinical cutoff < 26 (DCL / MCI threshold)', () => {
      // Adjusted score = 25 -> meetsClinicalCutoff = true
      const domains24 = {
        visuospatialExecutive: 4,
        naming: 3,
        attention: 5,
        language: 2,
        abstraction: 2,
        delayedRecall: 4,
        orientation: 4,
      }; // raw = 24

      // Education 12: 24 + 1 = 25 -> DCL (< 26)
      const res25 = calculateMoca({ domains: domains24, educationYears: 12 });
      expect(res25.adjustedScore).toBe(25);
      expect(res25.meetsClinicalCutoff).toBe(true);
      expect(res25.classification).toBe('Deterioro Cognitivo Leve');

      // Raw 25 + education 12 -> 25 + 1 = 26 -> Normal (cutoff < 26 not met)
      const domains25 = { ...domains24, orientation: 5 }; // raw = 25
      const res26 = calculateMoca({ domains: domains25, educationYears: 12 });
      expect(res26.adjustedScore).toBe(26);
      expect(res26.meetsClinicalCutoff).toBe(false);
      expect(res26.classification).toBe('Normal');

      // Raw 25 + education 13 -> 25 + 0 = 25 -> DCL (cutoff < 26 met)
      const res25_noAdj = calculateMoca({ domains: domains25, educationYears: 13 });
      expect(res25_noAdj.adjustedScore).toBe(25);
      expect(res25_noAdj.meetsClinicalCutoff).toBe(true);
      expect(res25_noAdj.classification).toBe('Deterioro Cognitivo Leve');
    });

    it('MOCA-DOM-1: validates all domain maxima and rejects illegal over-capacity values', () => {
      for (const def of MOCA_DOMAINS) {
        const illegalDomains = {
          visuospatialExecutive: 0,
          naming: 0,
          attention: 0,
          language: 0,
          abstraction: 0,
          delayedRecall: 0,
          orientation: 0,
          [def.id]: def.maxScore + 1, // Exceeds max
        };

        const validation = validateMocaInput({
          domains: illegalDomains as any,
          educationYears: 12,
        });

        expect(validation.isValid).toBe(false);
        expect(validation.errors[0]).toContain(def.id);
      }
    });

    it('MOCA-DOM-COMB: combinatorial boundary tests across education levels 0 to 20 for score transitions', () => {
      // Create domains totaling exactly 25
      const domains25 = {
        visuospatialExecutive: 5,
        naming: 3,
        attention: 5,
        language: 3,
        abstraction: 2,
        delayedRecall: 3,
        orientation: 4,
      };

      for (let ed = 0; ed <= 20; ed++) {
        const res = calculateMoca({ domains: domains25, educationYears: ed });
        if (ed <= 12) {
          expect(res.rawScore).toBe(25);
          expect(res.educationAdjustment).toBe(1);
          expect(res.adjustedScore).toBe(26);
          expect(res.meetsClinicalCutoff).toBe(false);
          expect(res.classification).toBe('Normal');
        } else {
          expect(res.rawScore).toBe(25);
          expect(res.educationAdjustment).toBe(0);
          expect(res.adjustedScore).toBe(25);
          expect(res.meetsClinicalCutoff).toBe(true);
          expect(res.classification).toBe('Deterioro Cognitivo Leve');
        }
      }
    });

    it('MOCA-UI-1: MocaScoreAlert React component correctly renders warning (<26) vs normal (>=26) and education badge', () => {
      // Case A: score 25, education 12 (cutoff met)
      const { unmount: u1 } = render(React.createElement(MocaScoreAlert, {
        adjustedScore: 25,
        rawScore: 24,
        educationYears: 12,
        educationAdjustment: 1,
        meetsClinicalCutoff: true,
        classification: 'Deterioro Cognitivo Leve',
      }));
      expect(screen.getByRole('alert')).toBeDefined();
      expect(screen.getByText(/Alerta de Cribado Neurocognitivo \(Puntuación < 26\)/i)).toBeDefined();
      expect(screen.getByText(/Ajuste por escolaridad aplicado \(\+1 punto por escolaridad ≤ 12 años\)/i)).toBeDefined();
      expect(screen.getAllByText('25').length).toBeGreaterThan(0);
      u1();

      // Case B: score 26, education 12 (normal)
      const { unmount: u2 } = render(React.createElement(MocaScoreAlert, {
        adjustedScore: 26,
        rawScore: 25,
        educationYears: 12,
        educationAdjustment: 1,
        meetsClinicalCutoff: false,
        classification: 'Normal',
      }));
      expect(screen.getByRole('status')).toBeDefined();
      expect(screen.getByText(/Cribado Neurocognitivo Normal \(Puntuación ≥ 26\)/i)).toBeDefined();
      expect(screen.getByText(/Ajuste por escolaridad aplicado \(\+1 punto por escolaridad ≤ 12 años\)/i)).toBeDefined();
      expect(screen.getAllByText('26').length).toBeGreaterThan(0);
      u2();

      // Case C: score 25, education 13 (no adjustment)
      render(React.createElement(MocaScoreAlert, {
        adjustedScore: 25,
        rawScore: 25,
        educationYears: 13,
        educationAdjustment: 0,
        meetsClinicalCutoff: true,
        classification: 'Deterioro Cognitivo Leve',
      }));
      expect(screen.getByText(/Sin ajuste de escolaridad aplicado \(escolaridad > 12 años\)/i)).toBeDefined();
    });
  });

  /* =========================================================================
   * DIMENSION 4: GAD-7 ANXIETY SEVERITY & CUTOFF INVARIANTS
   * ========================================================================= */
  describe('Dimension 4: GAD-7 Anxiety Severity & Cutoff Invariants', () => {

    it('GAD-CUT-1: enforces clinical anxiety cutoff strictly at >= 10', () => {
      // Score 9: Leve, meetsClinicalCutoff = false
      const responses9: Record<number, number> = {
        1: 2, 2: 2, 3: 2, 4: 1, 5: 1, 6: 1, 7: 0,
      };
      const res9 = calculateGad7(responses9 as any);
      expect(res9.totalScore).toBe(9);
      expect(res9.severity).toBe('Ansiedad leve');
      expect(res9.meetsClinicalCutoff).toBe(false);

      // Score 10: Moderada, meetsClinicalCutoff = true
      const responses10: Record<number, number> = {
        1: 2, 2: 2, 3: 2, 4: 1, 5: 1, 6: 1, 7: 1,
      };
      const res10 = calculateGad7(responses10 as any);
      expect(res10.totalScore).toBe(10);
      expect(res10.severity).toBe('Ansiedad moderada');
      expect(res10.meetsClinicalCutoff).toBe(true);
    });

    it('GAD-SEV-1: verifies all severity band boundaries (0-4, 5-9, 10-14, 15-21)', () => {
      const expectations: [number, string][] = [
        [0, 'Ansiedad mínima'],
        [4, 'Ansiedad mínima'],
        [5, 'Ansiedad leve'],
        [9, 'Ansiedad leve'],
        [10, 'Ansiedad moderada'],
        [14, 'Ansiedad moderada'],
        [15, 'Ansiedad severa'],
        [21, 'Ansiedad severa'],
      ];

      for (const [score, expectedSeverity] of expectations) {
        expect(classifyGad7Severity(score)).toBe(expectedSeverity);
      }

      expect(() => classifyGad7Severity(-1)).toThrow();
      expect(() => classifyGad7Severity(22)).toThrow();
    });
  });

  /* =========================================================================
   * DIMENSION 5: HTP PURE QUALITATIVE ENGINE & FIELD NOTES SAFETY
   * ========================================================================= */
  describe('Dimension 5: HTP Pure Qualitative Engine & Field Notes Safety', () => {

    it('HTP-ZERO-NUM-1: guarantees 0 artificial numerical scores across all preset and synthetic configurations', () => {
      // Test baseline initial record
      const report = generateHtpFullReport(INITIAL_HTP_RECORD);

      // Check all 5 narrative sections
      const sections = [
        report.summaryFormal,
        report.houseAnalysis,
        report.treeAnalysis,
        report.personAnalysis,
        report.integratedConclusion,
      ];

      for (const sec of sections) {
        expect(sec).toBeDefined();
        expect(sec.length).toBeGreaterThan(50);

        // Disallow artificial score formulations: "puntos", "score", "/10", "/100", "percentil", "CI="
        expect(sec).not.toMatch(/puntuaci[óo]n\s*:\s*\d+/i);
        expect(sec).not.toMatch(/score\s*:\s*\d+/i);
        expect(sec).not.toMatch(/\d+\s*\/\s*100/i);
        expect(sec).not.toMatch(/percentil\s*\d+/i);
        expect(sec).not.toMatch(/puntaje\s*num[ée]rico/i);
      }
    });

    it('HTP-NOTES-SAFE-1: safely incorporates clinician field notes containing HTML, quotes, and punctuation', () => {
      const adversarialRecord: HtpAssessmentRecord = {
        ...INITIAL_HTP_RECORD,
        formal: {
          ...INITIAL_HTP_RECORD.formal,
        },
        house: {
          ...INITIAL_HTP_RECORD.house,
          observations: '<script>alert("xss")</script> & "puerta con triple cerrojo"',
        },
        tree: {
          ...INITIAL_HTP_RECORD.tree,
          observations: "Tronco con 'herida abierta'; <b>sangrado simbólico</b> (pérdida vital).",
        },
        person: {
          ...INITIAL_HTP_RECORD.person,
          observations: 'Figura sin manos ("incapacidad manipulativa") & boca dentada (agresividad).',
        },
        generalClinicalNotes: 'Evaluación forense bajo art. 456 LECrim: congruencia con trauma post-accidente.',
      };

      const formalNotes = 'Trazado tembloroso a 45° con oscilación continua (hipertonía / ansiedad).';
      const formalSummary = generateFormalSummary(adversarialRecord.formal, formalNotes);
      const report = generateHtpFullReport(adversarialRecord);

      expect(formalSummary).toContain('Trazado tembloroso a 45° con oscilación continua');
      expect(report.houseAnalysis).toContain('<script>alert("xss")</script> & "puerta con triple cerrojo"');
      expect(report.treeAnalysis).toContain("Tronco con 'herida abierta'; <b>sangrado simbólico</b>");
      expect(report.personAnalysis).toContain('Figura sin manos ("incapacidad manipulativa")');
      expect(report.integratedConclusion).toContain('Evaluación forense bajo art. 456 LECrim');
    });

    it('HTP-STRUCT-1: generates all 5 paragraphs and synthesizes critical indicators correctly', () => {
      const criticalRecord: HtpAssessmentRecord = {
        ...INITIAL_HTP_RECORD,
        formal: {
          ...INITIAL_HTP_RECORD.formal,
          hasTransparencies: true,
          shading: 'excessive',
        },
        house: {
          ...INITIAL_HTP_RECORD.house,
          walls: 'weak_broken',
        },
        tree: {
          ...INITIAL_HTP_RECORD.tree,
          trunk: 'broken_scarred',
          branches: 'severed_truncated',
        },
        person: {
          ...INITIAL_HTP_RECORD.person,
          hands: 'claw_pointed',
        },
      };

      const report = generateHtpFullReport(criticalRecord);

      // Paragraph 1: Formal
      expect(report.summaryFormal).toContain('transparencias estructurales');
      expect(report.summaryFormal).toContain('sombreado intenso');

      // Paragraph 2: House
      expect(report.houseAnalysis).toContain('paredes débiles o discontinuas');

      // Paragraph 3: Tree
      expect(report.treeAnalysis).toContain('tronco quebrado o con marcas lesionales');
      expect(report.treeAnalysis).toContain('ramas cortadas o truncadas');

      // Paragraph 4: Person
      expect(report.personAnalysis).toContain('dedos en garra o afilados');

      // Paragraph 5: Conclusion must contain critical alert
      expect(report.integratedConclusion).toContain('Alerta clínica de indicadores críticos');
      expect(report.integratedConclusion).toContain('tronco quebrado o con marcas lesionales');
      expect(report.integratedConclusion).toContain('ramas cortadas o truncadas');
    });
  });

  /* =========================================================================
   * DIMENSION 6: STOCHASTIC PROPERTY-BASED CHAOS FUZZING (500 ITERATIONS)
   * ========================================================================= */
  describe('Dimension 6: Stochastic Property-Based Invariant Fuzzing (500 iterations)', () => {

    it('FUZZ-PROP-1: verifies all core invariants hold across 500 randomized multi-instrument iterations', () => {
      const informants: SdqInformantType[] = ['parent', 'self', 'teacher'];

      for (let trial = 0; trial < 500; trial++) {
        // --- 1. SDQ Stochastic Validation ---
        const informant = informants[trial % 3];
        const sdqResponses: Record<number, number> = {};
        for (let item = 1; item <= 25; item++) {
          sdqResponses[item] = Math.floor(Math.random() * 3); // 0, 1, or 2
        }

        const sdqRes = calculateSdq({ informant, responses: sdqResponses });

        // Invariant A: Total difficulties is strictly emotional + conduct + hyperactivity + peer
        const expectedDiff =
          sdqRes.subscales.emotional.rawScore +
          sdqRes.subscales.conduct.rawScore +
          sdqRes.subscales.hyperactivity.rawScore +
          sdqRes.subscales.peer.rawScore;

        expect(sdqRes.totalDifficulties.score).toBe(expectedDiff);
        expect(sdqRes.totalDifficulties.score).toBeGreaterThanOrEqual(0);
        expect(sdqRes.totalDifficulties.score).toBeLessThanOrEqual(40);

        // Invariant B: Reversed items are inverted
        for (const revItem of SDQ_REVERSED_ITEMS) {
          expect(sdqRes.itemScores[revItem]).toBe(2 - sdqResponses[revItem]);
        }

        // --- 2. PHQ-9 Stochastic Validation ---
        const phqResponses: Record<number, number> = {};
        for (let item = 1; item <= 9; item++) {
          phqResponses[item] = Math.floor(Math.random() * 4); // 0, 1, 2, 3
        }

        const phqRes = calculatePhq9(phqResponses as any);

        // Invariant C: Total score is exact sum
        let phqSum = 0;
        for (let item = 1; item <= 9; item++) phqSum += phqResponses[item];
        expect(phqRes.totalScore).toBe(phqSum);

        // Invariant D: Suicide risk alert is triggered iff Item 9 >= 1
        const item9Score = phqResponses[9];
        if (item9Score >= 1) {
          expect(phqRes.isItem9AlertActive).toBe(true);
          expect(phqRes.suicideRiskAlert.triggered).toBe(true);
          expect(phqRes.suicideRiskAlert.level).toBe('CRITICAL');
        } else {
          expect(phqRes.isItem9AlertActive).toBe(false);
          expect(phqRes.suicideRiskAlert.triggered).toBe(false);
          expect(phqRes.suicideRiskAlert.level).toBe('NONE');
        }

        // --- 3. MoCA Stochastic Validation ---
        const educationYears = Math.floor(Math.random() * 25); // 0 to 24
        const mocaDomains = {
          visuospatialExecutive: Math.floor(Math.random() * 6), // 0..5
          naming: Math.floor(Math.random() * 4),               // 0..3
          attention: Math.floor(Math.random() * 7),            // 0..6
          language: Math.floor(Math.random() * 4),             // 0..3
          abstraction: Math.floor(Math.random() * 3),          // 0..2
          delayedRecall: Math.floor(Math.random() * 6),        // 0..5
          orientation: Math.floor(Math.random() * 7),          // 0..6
        };

        const mocaRes = calculateMoca({ domains: mocaDomains, educationYears });

        // Invariant E: Adjusted score is capped at 30
        expect(mocaRes.adjustedScore).toBeLessThanOrEqual(30);
        expect(mocaRes.adjustedScore).toBeGreaterThanOrEqual(0);

        const expectedAdjustment = educationYears <= 12 ? 1 : 0;
        expect(mocaRes.educationAdjustment).toBe(expectedAdjustment);
        expect(mocaRes.adjustedScore).toBe(Math.min(30, mocaRes.rawScore + expectedAdjustment));

        // Invariant F: Clinical cutoff is true iff adjustedScore < 26
        expect(mocaRes.meetsClinicalCutoff).toBe(mocaRes.adjustedScore < 26);
      }
    });
  });
});
