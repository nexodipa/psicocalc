/**
 * Adversarial Verification Test Suite — Empirical Challenger 2 (Milestone M1-Core)
 *
 * Subject: TestRegistry Extensible Catalog & Two-Layer State Isolation Engine
 * Focus Areas:
 *   1. State Collision Resistance: Concurrent activation and mutation of disparate batteries
 *   2. Dynamic Lifecycle: Activate -> Answer -> Deactivate -> Mutate Others -> Reactivate Cache Integrity
 *   3. Legacy Lenses: Zero key-dropping and symmetric bi-directional synchronization
 *   4. Anonymization Toggle & Demographic Envelope: Consistency across all active test slices
 *   5. TestRegistry Invariants: Boundary filtering, prototype pollution resistance, dynamic extension & reset
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { act } from 'react';
import { render } from '@testing-library/react';
import {
  TestRegistry,
  calculateMmpi3,
  calculateD2r,
  calculateVineland3,
  calculateWiscV,
  calculateRaven2,
  calculateAbas3,
  calculateSena,
  calculateMoca,
  InstrumentDefinition,
} from '../../core';
import {
  ClinicalSessionProvider,
  useClinicalSession,
} from '../../ui/context/ClinicalSessionContext';
import { ClinicalSessionContextValue } from '../../ui/context/ClinicalSessionTypes';

describe('Empirical Challenger 2 — Milestone M1-Core: TestRegistry & State Isolation Adversarial Verification', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    TestRegistry.reset();
  });

  // Helper component to capture the live session context in React rendering cycle
  const createSessionHarness = () => {
    let currentSession: ClinicalSessionContextValue | null = null;

    const TestHarness: React.FC = () => {
      const session = useClinicalSession();
      currentSession = session;
      return (
        <div data-testid="session-harness-root">
          <div data-testid="active-instruments">{session.activeInstrument}</div>
          <div data-testid="display-name">{session.displayName}</div>
          <div data-testid="active-battery-count">{session.activeBatteryIds.length}</div>
        </div>
      );
    };

    const rendered = render(
      <ClinicalSessionProvider>
        <TestHarness />
      </ClinicalSessionProvider>
    );

    return {
      getSession: () => {
        if (!currentSession) throw new Error('Session harness not initialized');
        return currentSession;
      },
      rendered,
    };
  };

  // ==========================================================================
  // Dimension 1: State Collision Resistance (Multi-Battery Concurrency Stress)
  // ==========================================================================
  describe('Dimension 1: State Collision Resistance Under Concurrent Multi-Battery Load', () => {
    it('maintains strict state isolation when mutating WISC-V, MMPI-3, D2-R, Vineland-3, Raven-2, and SDQ concurrently', () => {
      const { getSession } = createSessionHarness();
      const session = getSession();

      // 1. Activate multi-domain instruments simultaneously
      act(() => {
        session.activateBattery('mmpi_3');
        session.activateBattery('d2_r');
        session.activateBattery('vineland_3');
        session.activateBattery('raven_2');
      });

      const updated = getSession();
      expect(updated.activeBatteryIds).toContain('wisc_v');
      expect(updated.activeBatteryIds).toContain('mmpi_3');
      expect(updated.activeBatteryIds).toContain('d2_r');
      expect(updated.activeBatteryIds).toContain('vineland_3');
      expect(updated.activeBatteryIds).toContain('raven_2');
      expect(updated.activeBatteryIds).toContain('sdq');

      // 2. Concurrently inject distinct domain data payloads
      const mmpiPayload = {
        tScores: { SUI: 82, CRIN: 52, VRIN: 48, F: 62, RCd: 74, RC1: 68 },
        rawScores: { SUI: 12 },
        omittedCount: 0,
      };

      const d2rPayload = {
        tr: 620,
        ta: 605,
        o: 12,
        c: 8,
      };

      const vinelandPayload = {
        subdomains: {
          receptive: 14,
          expressive: 15,
          written: 13,
          personal: 12,
          domestic: 11,
          community: 12,
          interpersonal: 16,
          playLeisure: 14,
          coping: 15,
        },
      };

      const ravenPayload = {
        rawScore: 42,
        ageYears: 12,
      };

      // Apply mutations
      act(() => {
        // Mutate MMPI-3
        session.setBatteryData('mmpi_3', mmpiPayload);
        // Mutate D2-R
        session.setBatteryData('d2_r', d2rPayload);
        // Mutate Vineland-3
        session.setBatteryData('vineland_3', vinelandPayload);
        // Mutate Raven 2
        session.setBatteryData('raven_2', ravenPayload);
        // Mutate SDQ via legacy lens
        session.setSdqResponse(1, 2);
        session.setSdqResponse(2, 1);
        session.setSdqInformant('teacher');
        // Mutate WISC-V via legacy lens
        session.setSubtestScore('S', 16);
        session.setSubtestScore('V', 15);
      });

      const sAfter = getSession();

      // 3. Verify namespace containment: each battery has ONLY its own fields
      const mmpiData = sAfter.getBatteryData('mmpi_3');
      const d2rData = sAfter.getBatteryData('d2_r');
      const vinelandData = sAfter.getBatteryData('vineland_3');
      const ravenData = sAfter.getBatteryData('raven_2');
      const wiscData = sAfter.getBatteryData('wisc_v');
      const sdqData = sAfter.getBatteryData('sdq');

      // MMPI-3 checks
      expect(mmpiData.tScores.SUI).toBe(82);
      expect(mmpiData.tScores.RCd).toBe(74);
      expect(mmpiData.tr).toBeUndefined(); // No D2-R leakage
      expect(mmpiData.subdomains).toBeUndefined(); // No Vineland leakage
      expect(mmpiData.rawScore).toBeUndefined(); // No Raven leakage

      // D2-R checks
      expect(d2rData.tr).toBe(620);
      expect(d2rData.ta).toBe(605);
      expect(d2rData.c).toBe(8);
      expect(d2rData.tScores).toBeUndefined(); // No MMPI leakage
      expect(d2rData.subdomains).toBeUndefined(); // No Vineland leakage

      // Vineland-3 checks
      expect(vinelandData.subdomains.interpersonal).toBe(16);
      expect(vinelandData.tr).toBeUndefined();
      expect(vinelandData.tScores).toBeUndefined();

      // Raven-2 checks
      expect(ravenData.rawScore).toBe(42);
      expect(ravenData.subtests).toBeUndefined();

      // WISC-V checks
      expect(wiscData.subtests.S).toBe(16);
      expect(wiscData.subtests.V).toBe(15);
      expect(wiscData.tScores).toBeUndefined();

      // SDQ checks
      expect(sdqData.responses[1]).toBe(2);
      expect(sdqData.responses[2]).toBe(1);
      expect(sdqData.informant).toBe('teacher');
      expect(sdqData.tScores).toBeUndefined();

      // 4. Verify pure calculations execute concurrently without interference
      const mmpiResult = calculateMmpi3(mmpiData);
      expect(mmpiResult.suicideRiskAlert.triggered).toBe(true);
      expect(mmpiResult.suicideRiskAlert.level).toBe('CRITICAL_RISK');

      const d2rResult = calculateD2r(d2rData);
      expect(d2rResult.con).toBe(605 - 8); // Concentration: TA - C = 597
      expect(d2rResult.tot).toBe(12 + 8); // Total error count: O + C = 20

      const vinelandResult = calculateVineland3(vinelandPayload);
      expect(vinelandResult.abc.standardScore).toBe(93);
      expect(vinelandResult.meetsClinicalCutoff).toBe(false);

      const ravenResult = calculateRaven2(ravenPayload);
      expect(ravenResult.standardScore).toBeGreaterThan(100);

      const wiscResult = calculateWiscV(wiscData.subtests);
      expect(wiscResult.primaryIndices.ICV).not.toBeNull();
    });

    it('isolates state mutations when two instruments share the exact same clinical domain', () => {
      const { getSession } = createSessionHarness();
      const session = getSession();

      // Domain: intelligence_aptitudes (wisc_v and raven_2)
      act(() => {
        session.activateBattery('raven_2');
      });

      const initialWisc = { ...getSession().getBatteryData('wisc_v').subtests };

      // Mutate Raven 2
      act(() => {
        session.setBatteryData('raven_2', { rawScore: 48, ageYears: 16 });
      });

      // Verify WISC-V remained completely unchanged
      const currentWisc = getSession().getBatteryData('wisc_v').subtests;
      expect(currentWisc).toEqual(initialWisc);

      // Mutate WISC-V
      act(() => {
        session.setSubtestScore('C', 19);
      });

      // Verify Raven 2 remained completely unchanged
      const currentRaven = getSession().getBatteryData('raven_2');
      expect(currentRaven.rawScore).toBe(48);
      expect(currentRaven.ageYears).toBe(16);
    });

    it('prevents state collision during rapid interleaved mutations across 5 batteries', () => {
      const { getSession } = createSessionHarness();
      const session = getSession();

      act(() => {
        session.activateBattery('mmpi_3');
        session.activateBattery('d2_r');
        session.activateBattery('vineland_3');
        session.activateBattery('abas_3');
      });

      // Interleave 25 rapid sequential mutations across disparate batteries
      for (let i = 1; i <= 25; i++) {
        act(() => {
          session.setBatteryData('d2_r', (prev: any) => ({
            ...prev,
            tr: 500 + i,
            ta: 480 + i,
          }));
          session.setBatteryData('mmpi_3', (prev: any) => ({
            ...prev,
            tScores: { ...(prev?.tScores || {}), [`SCALE_${i}`]: 50 + (i % 20) },
          }));
          session.setBatteryData('vineland_3', (prev: any) => ({
            ...prev,
            subdomains: { ...(prev?.subdomains || {}), personal: 10 + (i % 5) },
          }));
          session.setSdqResponse(1, (i % 3) as any);
          session.setSubtestScore('M', 10 + (i % 7));
        });
      }

      const finalState = getSession();
      expect(finalState.getBatteryData('d2_r').tr).toBe(525);
      expect(finalState.getBatteryData('d2_r').ta).toBe(505);
      expect(Object.keys(finalState.getBatteryData('mmpi_3').tScores).length).toBe(25);
      expect(finalState.getBatteryData('vineland_3').subdomains.personal).toBe(10 + (25 % 5));
      expect(finalState.getBatteryData('sdq').responses[1]).toBe(25 % 3);
      expect(finalState.subtests.M).toBe(10 + (25 % 7));
    });
  });

  // ==========================================================================
  // Dimension 2: Dynamic Lifecycle (Cache Retention On Deactivate / Reactivate)
  // ==========================================================================
  describe('Dimension 2: Dynamic Lifecycle & Response Cache Retention', () => {
    it('preserves cached test responses across activation, answer, deactivation, and reactivation cycles', () => {
      const { getSession } = createSessionHarness();
      const session = getSession();

      // 1. Activate battery
      act(() => {
        session.activateBattery('mmpi_3');
      });
      expect(getSession().activeBatteryIds).toContain('mmpi_3');

      // 2. Answer questions / populate full diagnostic dataset
      const diagnosticProfile = {
        tScores: {
          SUI: 85,
          EID: 78,
          THD: 72,
          RCd: 80,
          CRIN: 50,
          VRIN: 52,
          F: 65,
          L: 45,
          K: 48,
        },
        rawScores: { SUI: 15, EID: 32 },
        omittedCount: 2,
      };

      act(() => {
        session.setBatteryData('mmpi_3', diagnosticProfile);
      });

      const beforeDeactivation = JSON.parse(JSON.stringify(getSession().getBatteryData('mmpi_3')));
      expect(beforeDeactivation).toEqual(diagnosticProfile);

      // 3. Deactivate MMPI-3
      act(() => {
        session.deactivateBattery('mmpi_3');
      });

      const stateWhileDeactivated = getSession();
      // Should no longer be in active list
      expect(stateWhileDeactivated.activeBatteryIds).not.toContain('mmpi_3');
      // In-memory cache in testData must remain intact
      expect(stateWhileDeactivated.testData['mmpi_3']).toEqual(diagnosticProfile);

      // 4. Heavily mutate other active batteries while MMPI-3 is dormant
      act(() => {
        session.setSubtestScore('C', 18);
        session.setSubtestScore('S', 17);
        session.setSdqResponse(10, 2);
        session.setMocaDomainScore('attention', 5);
      });

      expect(getSession().testData['mmpi_3']).toEqual(diagnosticProfile);

      // 5. Re-activate MMPI-3
      act(() => {
        session.activateBattery('mmpi_3');
      });

      const stateAfterReactivation = getSession();
      expect(stateAfterReactivation.activeBatteryIds).toContain('mmpi_3');
      const restoredData = stateAfterReactivation.getBatteryData('mmpi_3');

      // Verification: Cache was NOT reset by createInitialState()!
      expect(restoredData).toEqual(diagnosticProfile);
      expect(restoredData.tScores.SUI).toBe(85);
      expect(restoredData.tScores.RCd).toBe(80);

      // Pure engine calculates immediately on restored cache
      const calcResult = calculateMmpi3(restoredData);
      expect(calcResult.suicideRiskAlert.triggered).toBe(true);
      expect(calcResult.suicideRiskAlert.level).toBe('CRITICAL_RISK');
    });

    it('robustly preserves multiple instruments through iterated deactivation/reactivation fuzzing loops', () => {
      const { getSession } = createSessionHarness();
      const session = getSession();

      const batteries = ['abas_3', 'sena', 'd2_r', 'vineland_3'];

      // Activate all
      act(() => {
        batteries.forEach((id) => session.activateBattery(id));
      });

      // Populate unique payloads
      const payloads: Record<string, any> = {
        abas_3: {
          skillAreas: {
            communication: 10,
            communityUse: 8,
            functionalAcademics: 9,
            homeLiving: 11,
            healthAndSafety: 12,
            leisure: 10,
            selfCare: 11,
            selfDirection: 9,
            social: 10,
          },
        },
        sena: {
          tScores: {
            DEP: 75,
            ANS: 72,
            IRA: 68,
            AUT: 28, // Protective resource (low = clinical)
          },
          criticalItems: {
            suicidalIdeation: true,
          },
        },
        d2_r: {
          tr: 590,
          ta: 580,
          o: 10,
          c: 5,
        },
        vineland_3: {
          subdomains: {
            receptive: 15,
            expressive: 16,
            written: 14,
            personal: 13,
            domestic: 12,
            community: 14,
            interpersonal: 15,
            playLeisure: 13,
            coping: 14,
          },
        },
      };

      act(() => {
        batteries.forEach((id) => session.setBatteryData(id, payloads[id]));
      });

      // Execute 5 cycles of alternating deactivation and reactivation
      for (let cycle = 1; cycle <= 5; cycle++) {
        const target = batteries[cycle % batteries.length];

        // Deactivate
        act(() => {
          session.deactivateBattery(target);
        });
        expect(getSession().activeBatteryIds).not.toContain(target);

        // Mutate unrelated battery
        act(() => {
          session.setSubtestScore('PV', 10 + cycle);
        });

        // Reactivate
        act(() => {
          session.activateBattery(target);
        });
        expect(getSession().activeBatteryIds).toContain(target);

        // Ensure payload is 100% byte-for-byte identical to original
        expect(getSession().getBatteryData(target)).toEqual(payloads[target]);
      }
    });
  });

  // ==========================================================================
  // Dimension 3: Legacy Lenses Bi-Directional Sync & Key Dropping Prevention
  // ==========================================================================
  describe('Dimension 3: Legacy Lenses Bi-Directional Synchronization & Zero Key Dropping', () => {
    it('synchronizes WISC-V mutations through legacy lens without dropping existing subtest keys', () => {
      const { getSession } = createSessionHarness();
      const session = getSession();

      // Initial WISC has 10 subtests: S, V, C, PV, M, B, D, SD, CL, BS
      const initialKeys = Object.keys(session.state.wiscState.subtests);
      expect(initialKeys.length).toBe(10);
      expect(session.subtests.C).toBe(13);

      // 1. Mutate single subtest via legacy setter: setSubtestScore('C', 18)
      act(() => {
        getSession().setSubtestScore('C', 18);
      });

      const s1 = getSession();
      // Lens check: both legacy root accessor and state envelope accessor
      expect(s1.state.wiscState.subtests.C).toBe(18);
      expect(s1.subtests.C).toBe(18);
      // Partition testData check
      expect(s1.getBatteryData('wisc_v').subtests.C).toBe(18);

      // Crucial check: verify ZERO keys were dropped
      const keysAfterEdit = Object.keys(s1.state.wiscState.subtests);
      expect(keysAfterEdit.length).toBe(10);
      expect(s1.state.wiscState.subtests.S).toBe(11);
      expect(s1.state.wiscState.subtests.V).toBe(11);
      expect(s1.state.wiscState.subtests.PV).toBe(12);
      expect(s1.state.wiscState.subtests.M).toBe(14);
      expect(s1.state.wiscState.subtests.B).toBe(14);
      expect(s1.state.wiscState.subtests.D).toBe(9);
      expect(s1.state.wiscState.subtests.SD).toBe(9);
      expect(s1.state.wiscState.subtests.CL).toBe(7);
      expect(s1.state.wiscState.subtests.BS).toBe(9);

      // 2. Mutate through Layer 2 setBatteryData('wisc_v', ...) and check legacy wiscState sync
      act(() => {
        getSession().setBatteryData('wisc_v', (prev: any) => ({
          ...prev,
          subtests: { ...prev.subtests, S: 19 },
        }));
      });

      const s2 = getSession();
      expect(s2.state.wiscState.subtests.S).toBe(19);
      expect(s2.subtests.S).toBe(19);
      expect(s2.getBatteryData('wisc_v').subtests.S).toBe(19);
      expect(s2.getBatteryData('wisc_v').subtests.C).toBe(18);

      // 3. Remove a score via setSubtestScore('BS', null)
      act(() => {
        getSession().setSubtestScore('BS', null);
      });

      const s3 = getSession();
      expect(s3.state.wiscState.subtests.BS).toBeUndefined();
      expect(s3.getBatteryData('wisc_v').subtests.BS).toBeUndefined();
      expect(Object.keys(s3.state.wiscState.subtests).length).toBe(9);
      expect(s3.state.wiscState.subtests.S).toBe(19); // Retained

      // 4. Invalid score rejection synchronizes invalidSubtests in both layers
      act(() => {
        getSession().setSubtestScore('D', 25); // Invalid scaled score (> 19)
      });

      const s4 = getSession();
      expect(s4.state.wiscState.subtests.D).toBeUndefined();
      expect(s4.state.wiscState.invalidSubtests.D).toBeDefined();
      expect(s4.getBatteryData('wisc_v').invalidSubtests.D).toBeDefined();
      expect(s4.hasInvalidScores).toBe(true);
    });

    it('synchronizes SDQ state bidirectionally between legacy sdqState and testData.sdq', () => {
      const { getSession } = createSessionHarness();
      const session = getSession();

      // 1. Mutate via legacy setters
      act(() => {
        session.setSdqInformant('self');
        session.setSdqResponse(5, 2);
        session.setSdqResponse(12, 1);
      });

      const s1 = getSession();
      // Legacy lens
      expect(s1.sdqState.informant).toBe('self');
      expect(s1.sdqState.responses[5]).toBe(2);
      expect(s1.sdqState.responses[12]).toBe(1);
      // testData slice
      expect(s1.getBatteryData('sdq').informant).toBe('self');
      expect(s1.getBatteryData('sdq').responses[5]).toBe(2);
      expect(s1.getBatteryData('sdq').responses[12]).toBe(1);

      // 2. Mutate via setBatteryData('sdq', ...)
      act(() => {
        session.setBatteryData('sdq', (prev: any) => ({
          ...prev,
          responses: {
            ...prev.responses,
            18: 2,
          },
        }));
      });

      const s2 = getSession();
      expect(s2.sdqState.responses[18]).toBe(2);
      expect(s2.sdqState.responses[5]).toBe(2); // Retained!
      expect(s2.getBatteryData('sdq').responses[18]).toBe(2);

      // 3. Reset via clearSdq
      act(() => {
        session.clearSdq();
      });

      const s3 = getSession();
      expect(Object.keys(s3.sdqState.responses).length).toBe(0);
      expect(Object.keys(s3.getBatteryData('sdq').responses).length).toBe(0);
      expect(s3.sdqState.informant).toBe('parent');
      expect(s3.getBatteryData('sdq').informant).toBe('parent');
    });

    it('synchronizes PHQ-9, GAD-7, MoCA, and HTP legacy lenses with testData slices', () => {
      const { getSession } = createSessionHarness();
      const session = getSession();

      // PHQ-9
      act(() => {
        session.setPhq9Response(9, 2); // Suicide item
      });
      expect(getSession().phq9State.responses[9]).toBe(2);
      expect(getSession().getBatteryData('phq_9').responses[9]).toBe(2);
      expect(getSession().isPhq9Item9AlertActive).toBe(true);

      // GAD-7
      act(() => {
        session.setGad7Response(1, 3);
        session.setGad7Response(2, 3);
      });
      expect(getSession().gad7State.responses[1]).toBe(3);
      expect(getSession().getBatteryData('gad_7').responses[1]).toBe(3);

      // MoCA
      act(() => {
        session.setMocaDomainScore('attention', 6);
        session.setMocaEducationYears(10);
      });
      expect(getSession().mocaState.domains.attention).toBe(6);
      expect(getSession().mocaState.educationYears).toBe(10);
      expect(getSession().getBatteryData('moca').domains.attention).toBe(6);
      expect(getSession().getBatteryData('moca').educationYears).toBe(10);

      // HTP
      act(() => {
        session.setHtpRecord((prev) => ({
          ...prev,
          generalClinicalNotes: 'Evaluación cualitativa pericial',
        }));
      });
      expect(getSession().htpRecord.generalClinicalNotes).toBe('Evaluación cualitativa pericial');
      expect(getSession().getBatteryData('htp').generalClinicalNotes).toBe('Evaluación cualitativa pericial');
    });
  });

  // ==========================================================================
  // Dimension 4: Demographics Envelope & Anonymization Toggle Consistency
  // ==========================================================================
  describe('Dimension 4: Demographic Envelope & Anonymization Consistency Across Slices', () => {
    it('masks patient name consistently without mutating any active battery test slice', () => {
      const { getSession } = createSessionHarness();
      const session = getSession();

      // 1. Set specific demographics and active battery states
      act(() => {
        session.setDemographics({
          nameOrId: 'Fernando Alonso Díaz',
          birthDate: '2014-07-29',
          testDate: '2026-10-13',
          examiner: 'Lic. Mariana Ortiz',
          reasonForEvaluation: 'Evaluación neuropsicológica integral',
          educationYears: 10,
        });
        session.activateBattery('mmpi_3');
        session.activateBattery('d2_r');
        session.setBatteryData('mmpi_3', { tScores: { SUI: 70 }, rawScores: {} });
        session.setBatteryData('d2_r', { tr: 600, ta: 590, o: 5, c: 5 });
      });

      const sBefore = getSession();
      expect(sBefore.displayName).toBe('Fernando Alonso Díaz');
      expect(sBefore.demographics.isAnonymized).toBe(false);

      // Snapshots of test slices
      const mmpiSnap = JSON.stringify(sBefore.getBatteryData('mmpi_3'));
      const d2rSnap = JSON.stringify(sBefore.getBatteryData('d2_r'));
      const wiscSnap = JSON.stringify(sBefore.getBatteryData('wisc_v'));

      // 2. Toggle anonymization ON
      act(() => {
        getSession().toggleAnonymize();
      });

      const sAnon = getSession();
      expect(sAnon.demographics.isAnonymized).toBe(true);
      expect(sAnon.displayName).toBe('F. A. D.');
      expect(sAnon.demographics.nameOrId).toBe('F. A. D.');

      // Test data slices MUST remain 100% unmutated
      expect(JSON.stringify(sAnon.getBatteryData('mmpi_3'))).toBe(mmpiSnap);
      expect(JSON.stringify(sAnon.getBatteryData('d2_r'))).toBe(d2rSnap);
      expect(JSON.stringify(sAnon.getBatteryData('wisc_v'))).toBe(wiscSnap);

      // 3. Toggle anonymization OFF
      act(() => {
        getSession().toggleAnonymize();
      });

      const sRestored = getSession();
      expect(sRestored.demographics.isAnonymized).toBe(false);
      expect(sRestored.displayName).toBe('Fernando Alonso Díaz');
      expect(sRestored.demographics.nameOrId).toBe('Fernando Alonso Díaz');
    });

    it('propagates educationYears changes from demographics envelope to MoCA slice and calculation', () => {
      const { getSession } = createSessionHarness();
      const session = getSession();

      // Configure MoCA with 25 points
      act(() => {
        session.setMocaDomainScore('visuospatialExecutive', 4);
        session.setMocaDomainScore('naming', 3);
        session.setMocaDomainScore('attention', 5);
        session.setMocaDomainScore('language', 3);
        session.setMocaDomainScore('abstraction', 2);
        session.setMocaDomainScore('delayedRecall', 3);
        session.setMocaDomainScore('orientation', 5); // Raw sum = 25
      });

      // Initially educationYears = 12 (<= 12 years qualifies for +1 adjustment)
      const calc1 = getSession().mocaCalculation;
      expect(calc1).not.toBeNull();
      expect(calc1?.rawScore).toBe(25);
      expect(calc1?.educationAdjustment).toBe(1);
      expect(calc1?.adjustedScore).toBe(26); // 25 + 1 = 26 (no alert)
      expect(calc1?.meetsClinicalCutoff).toBe(false);

      // Update educationYears to 16 in Demographics envelope (> 12 years = 0 adjustment)
      act(() => {
        session.setDemographics({ educationYears: 16 });
      });

      const sUpdated = getSession();
      expect(sUpdated.demographics.educationYears).toBe(16);
      expect(sUpdated.mocaState.educationYears).toBe(16);
      expect(sUpdated.getBatteryData('moca').educationYears).toBe(16);

      const calc2 = sUpdated.mocaCalculation;
      expect(calc2?.educationAdjustment).toBe(0);
      expect(calc2?.adjustedScore).toBe(25); // 25 + 0 = 25 (< 26 alerts!)
      expect(calc2?.meetsClinicalCutoff).toBe(true);
      expect(sUpdated.isMocaAlertActive).toBe(true);
    });
  });

  // ==========================================================================
  // Dimension 5: TestRegistry Boundary Invariants & Extensibility Stress Tests
  // ==========================================================================
  describe('Dimension 5: TestRegistry Adversarial Boundaries, Edge Cases & Dynamic Extension', () => {
    it('ensures createInitialState() generates new independent object instances without prototype pollution', () => {
      const allInstruments = TestRegistry.getAll();
      expect(allInstruments.length).toBe(19);

      for (const inst of allInstruments) {
        const state1 = inst.createInitialState();
        const state2 = inst.createInitialState();

        // Must be separate memory references
        expect(state1).not.toBe(state2);

        // Mutating state1 must NEVER affect state2
        (state1 as any).__adversarialPollution = 'CORRUPTED';
        expect((state2 as any).__adversarialPollution).toBeUndefined();

        const state3 = inst.createInitialState();
        expect((state3 as any).__adversarialPollution).toBeUndefined();
      }
    });

    it('handles adversarial queries (regex special chars, extreme ages, empty strings) safely', () => {
      // 1. Extreme age boundaries
      expect(TestRegistry.filterByAge(-1)).toEqual([]);
      expect(TestRegistry.filterByAge(0).length).toBeGreaterThan(0); // ABAS-3 and Vineland-3 start at 0
      expect(TestRegistry.filterByAge(120)).toEqual([]);

      // Age 16 (transition point between WISC-V and WAIS-IV)
      const age16 = TestRegistry.filterByAge(16).map((i) => i.metadata.id);
      expect(age16).toContain('wisc_v');
      expect(age16).toContain('wais_iv');

      // 2. Malicious / Regex search payloads
      const specialCharQueries = [
        '.*',
        '[a-z]+',
        '(.*)',
        '\\d+',
        '???',
        '   ',
        '   depresion   ',
        'ÁÉÍÓÚ',
        '__proto__',
        'constructor',
      ];

      for (const query of specialCharQueries) {
        expect(() => TestRegistry.search(query)).not.toThrow();
        expect(() => TestRegistry.filter({ query })).not.toThrow();
      }

      // '   depresion   ' should match trimmed 'depresion'
      const trimmedSearch = TestRegistry.search('   depresion   ').map((i) => i.metadata.id);
      expect(trimmedSearch).toContain('phq_9');
    });

    it('supports dynamic registration of a 20th custom instrument and restores cleanly on reset()', () => {
      const customInstrument: InstrumentDefinition = {
        metadata: {
          id: 'custom_neuro_test',
          name: 'CNT-1',
          fullName: 'Custom Neuropsychological Test',
          domain: 'neuropsychology_attention',
          scoringType: 'speed_accuracy',
          ageRange: { minYears: 18, maxYears: 65, description: '18 a 65 años' },
          targetGroups: ['adult'],
          estimatedMinutes: 15,
          keywords: ['custom', 'atencion', 'experimental'],
        },
        createInitialState: () => ({ reactionTimeMs: 250, errors: 0 }),
        calculate: (input) => ({ speedIndex: input.reactionTimeMs / 10 }),
        validateInput: (input) => ({ isValid: input.reactionTimeMs > 0, errors: [] }),
        isCompleted: (input) => input.reactionTimeMs > 0,
      };

      // 1. Register custom instrument
      TestRegistry.register(customInstrument);
      expect(TestRegistry.has('custom_neuro_test')).toBe(true);
      expect(TestRegistry.getAll().length).toBe(20);

      // Search finds it
      const searchRes = TestRegistry.search('experimental').map((i) => i.metadata.id);
      expect(searchRes).toContain('custom_neuro_test');

      // 2. Test in ClinicalSession Context
      const { getSession } = createSessionHarness();
      const session = getSession();

      act(() => {
        session.activateBattery('custom_neuro_test');
      });

      expect(getSession().activeBatteryIds).toContain('custom_neuro_test');
      expect(getSession().getBatteryData('custom_neuro_test')).toEqual({
        reactionTimeMs: 250,
        errors: 0,
      });

      act(() => {
        session.setBatteryData('custom_neuro_test', { reactionTimeMs: 320, errors: 2 });
      });

      expect(getSession().getBatteryData('custom_neuro_test')).toEqual({
        reactionTimeMs: 320,
        errors: 2,
      });

      // 3. Reset registry
      TestRegistry.reset();
      expect(TestRegistry.has('custom_neuro_test')).toBe(false);
      expect(TestRegistry.getAll().length).toBe(19);
    });
  });
});
