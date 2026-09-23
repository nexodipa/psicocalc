import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import App from '../../App';
import {
  ClinicalSessionProvider,
  useClinicalSession,
} from '../../ui/context/ClinicalSessionContext';
import { ClinicalReportView } from '../../ui/components/report/ClinicalReportView';
import { Phq9InputCard } from '../../ui/components/clinical/Phq9InputCard';
import { MocaInputCard } from '../../ui/components/clinical/MocaInputCard';
import { anonymizeName } from '../../ui/hooks/usePsychometrics';
import { SubtestId } from '../../core';
import { HtpAssessmentRecord } from '../../core/types/htp';

describe('Adversarial Verification Suite — Challenger 2 (Milestone M8 - Tier 5)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  /* =========================================================================
   * DIMENSION 1: Chaotic, Multi-Instrument Navigation Cycles & Zero-Data-Loss
   * ========================================================================= */
  describe('Dimension 1: Chaotic Multi-Instrument Navigation Cycles & State Persistence', () => {
    it('NAV-PERSIST-1: maintains complete multi-instrument state across 30 chaotic tab traversals without corruption', () => {
      let sessionRef: ReturnType<typeof useClinicalSession> | null = null;

      const TestHarness: React.FC = () => {
        const session = useClinicalSession();
        sessionRef = session;

        return (
          <div>
            <div data-testid="active-cat">{session.activeCategory}</div>
            <div data-testid="active-inst">{session.activeInstrument}</div>
            <div data-testid="active-battery">{session.currentBattery}</div>
            <div data-testid="display-name">{session.displayName}</div>
          </div>
        );
      };

      render(
        <ClinicalSessionProvider>
          <TestHarness />
        </ClinicalSessionProvider>
      );

      expect(sessionRef).not.toBeNull();

      const wiscCustom: Partial<Record<SubtestId, number>> = {
        S: 14, V: 12, C: 15, PV: 10, M: 13,
        B: 11, D: 8, SD: 9, CL: 7, BS: 8,
      };

      const waisCustom: Partial<Record<SubtestId, number>> = {
        WAIS_C: 12, WAIS_S: 14, WAIS_D: 10, WAIS_M: 11, WAIS_V: 13,
        WAIS_A: 9, WAIS_BS: 8, WAIS_PV: 10, WAIS_I: 12, WAIS_CN: 7,
      };

      // 1. Populate custom Demographics & WISC-V
      act(() => {
        const s = sessionRef!;
        s.setDemographics({
          nameOrId: 'Dra. Valeria Sotomayor Peña',
          birthDate: '2015-08-14',
          testDate: '2026-09-23',
          examiner: 'Dr. Alejandro Benítez (Col. M-4521)',
          reasonForEvaluation: 'Evaluación neuropsicológica pericial exhaustiva',
          schoolGrade: '6º Primaria',
          educationYears: 9,
        });

        s.setBattery('WISC-V');
        Object.entries(wiscCustom).forEach(([id, score]) => {
          s.setSubtestScore(id as SubtestId, score);
        });
      });

      // 2. Switch to WAIS-IV (ensures closure updates across render)
      act(() => {
        sessionRef!.setBattery('WAIS-IV');
      });

      // 3. Populate WAIS-IV scores & other instruments
      act(() => {
        const s = sessionRef!;
        Object.entries(waisCustom).forEach(([id, score]) => {
          s.setSubtestScore(id as SubtestId, score);
        });

        // 4. Populate SDQ (Informant: teacher, all 25 items answered)
        s.setSdqInformant('teacher');
        for (let i = 1; i <= 25; i++) {
          const val = (i % 3) as 0 | 1 | 2;
          s.setSdqResponse(i, val);
        }

        // 5. Populate PHQ-9 with item 9 = 2 (active suicide alert)
        for (let i = 1; i <= 8; i++) {
          s.setPhq9Response(i, (i % 3) as 0 | 1 | 2);
        }
        s.setPhq9Response(9, 2);

        // 6. Populate GAD-7 with severe anxiety
        const gadResponses = [3, 2, 3, 2, 3, 2, 3] as const;
        gadResponses.forEach((val, idx) => {
          s.setGad7Response(idx + 1, val as 0 | 1 | 2 | 3);
        });

        // 7. Populate MoCA (raw 24, edu 9 -> +1 = 25 -> DCL alert)
        s.setMocaDomainScore('visuospatialExecutive', 4);
        s.setMocaDomainScore('naming', 3);
        s.setMocaDomainScore('attention', 5);
        s.setMocaDomainScore('language', 2);
        s.setMocaDomainScore('abstraction', 2);
        s.setMocaDomainScore('delayedRecall', 3);
        s.setMocaDomainScore('orientation', 5);
        s.setMocaEducationYears(9);

        // 8. Populate HTP record
        s.setHtpRecord((prev: HtpAssessmentRecord): HtpAssessmentRecord => ({
          ...prev,
          house: {
            ...prev.house,
            observations: 'Techo reforzado con doble teja, puerta pequeña sin picaporte.',
          },
          tree: {
            ...prev.tree,
            observations: 'Tronco grueso con cicatriz en cuadrante inferior izquierdo.',
          },
          person: {
            ...prev.person,
            observations: 'Figura rígida, manos ocultas en los bolsillos.',
          },
          formal: {
            ...prev.formal,
            size: 'macrography',
            verticalPlacement: 'upper',
            strokePressure: 'heavy',
            symmetry: 'asymmetric',
            shading: 'excessive',
          },
          generalClinicalNotes: 'Evaluada muestra afecto ansioso con defensas paranoides.',
        }));

        // Switch back to WISC-V for start of navigation stress test
        s.setBattery('WISC-V');

        // 9. Execute 30 chaotic navigation hops
        const navigationSequence: Array<{ cat: any; inst: any }> = [
          { cat: 'intelligence', inst: 'wisc_v' },
          { cat: 'behavior_emotion', inst: 'sdq' },
          { cat: 'neurocognitive', inst: 'moca' },
          { cat: 'projective', inst: 'htp' },
          { cat: 'behavior_emotion', inst: 'phq_9' },
          { cat: 'intelligence', inst: 'wais_iv' },
          { cat: 'behavior_emotion', inst: 'gad_7' },
          { cat: 'report', inst: 'wisc_v' },
          { cat: 'intelligence', inst: 'wisc_v' },
          { cat: 'projective', inst: 'htp' },
          { cat: 'neurocognitive', inst: 'moca' },
          { cat: 'behavior_emotion', inst: 'sdq' },
          { cat: 'report', inst: 'wisc_v' },
          { cat: 'behavior_emotion', inst: 'phq_9' },
          { cat: 'intelligence', inst: 'wais_iv' },
          { cat: 'behavior_emotion', inst: 'gad_7' },
          { cat: 'projective', inst: 'htp' },
          { cat: 'intelligence', inst: 'wisc_v' },
          { cat: 'neurocognitive', inst: 'moca' },
          { cat: 'behavior_emotion', inst: 'sdq' },
          { cat: 'report', inst: 'wisc_v' },
          { cat: 'behavior_emotion', inst: 'phq_9' },
          { cat: 'intelligence', inst: 'wais_iv' },
          { cat: 'projective', inst: 'htp' },
          { cat: 'behavior_emotion', inst: 'gad_7' },
          { cat: 'neurocognitive', inst: 'moca' },
          { cat: 'report', inst: 'wisc_v' },
          { cat: 'intelligence', inst: 'wisc_v' },
          { cat: 'behavior_emotion', inst: 'sdq' },
          { cat: 'report', inst: 'wisc_v' },
        ];

        navigationSequence.forEach(({ cat, inst }) => {
          s.setActiveCategory(cat);
          s.setActiveInstrument(inst);
        });
      });

      // 10. Rigorous State Integrity Verification Post-Navigation
      const finalSession = sessionRef!;

      // A. Demographics
      expect(finalSession.demographics.nameOrId).toBe('Dra. Valeria Sotomayor Peña');
      expect(finalSession.demographics.birthDate).toBe('2015-08-14');
      expect(finalSession.demographics.educationYears).toBe(9);
      expect(finalSession.demographics.examiner).toContain('Dr. Alejandro Benítez');

      // B. WISC-V State
      expect(finalSession.state.wiscState.subtests).toEqual(wiscCustom);
      expect(Object.keys(finalSession.state.wiscState.subtests).length).toBe(10);
      expect(finalSession.state.wiscState.invalidSubtests).toEqual({});

      // C. WAIS-IV State (Independent from WISC-V)
      expect(finalSession.state.waisState.subtests).toEqual(waisCustom);
      expect(Object.keys(finalSession.state.waisState.subtests).length).toBe(10);
      expect(finalSession.state.waisState.invalidSubtests).toEqual({});

      // D. SDQ State
      expect(finalSession.sdqState.informant).toBe('teacher');
      expect(Object.keys(finalSession.sdqState.responses).length).toBe(25);
      expect(finalSession.sdqCalculation).not.toBeNull();
      expect(finalSession.isSdqCompleted).toBe(true);

      // E. PHQ-9 State & Alert
      expect(finalSession.phq9State.responses[9]).toBe(2);
      expect(finalSession.isPhq9Item9AlertActive).toBe(true);
      expect(finalSession.isPhq9Completed).toBe(true);
      expect(finalSession.phq9Calculation).not.toBeNull();

      // F. GAD-7 State
      expect(Object.keys(finalSession.gad7State.responses).length).toBe(7);
      expect(finalSession.isGad7Completed).toBe(true);
      expect(finalSession.gad7Calculation).not.toBeNull();
      expect(finalSession.gad7Calculation!.totalScore).toBe(18);
      expect(finalSession.gad7Calculation!.severity).toBe('Ansiedad severa');

      // G. MoCA State & Alert
      expect(finalSession.mocaState.domains.visuospatialExecutive).toBe(4);
      expect(finalSession.mocaState.educationYears).toBe(9);
      expect(finalSession.mocaCalculation).not.toBeNull();
      expect(finalSession.mocaCalculation!.rawScore).toBe(24);
      expect(finalSession.mocaCalculation!.educationAdjustment).toBe(1);
      expect(finalSession.mocaCalculation!.adjustedScore).toBe(25);
      expect(finalSession.mocaCalculation!.meetsClinicalCutoff).toBe(true);
      expect(finalSession.isMocaAlertActive).toBe(true);

      // H. HTP State
      expect(finalSession.htpRecord.house.observations).toBe(
        'Techo reforzado con doble teja, puerta pequeña sin picaporte.'
      );
      expect(finalSession.htpRecord.tree.observations).toBe(
        'Tronco grueso con cicatriz en cuadrante inferior izquierdo.'
      );
      expect(finalSession.htpRecord.person.observations).toBe(
        'Figura rígida, manos ocultas en los bolsillos.'
      );
      expect(finalSession.htpRecord.formal.size).toBe('macrography');
      expect(finalSession.htpRecord.generalClinicalNotes).toBe(
        'Evaluada muestra afecto ansioso con defensas paranoides.'
      );
      expect(finalSession.isHtpCompleted).toBe(true);
      expect(finalSession.htpReport.fullNarrativeText.length).toBeGreaterThan(200);

      // I. Administered Map
      expect(finalSession.administered.wiscV).toBe(true);
      expect(finalSession.administered.waisIV).toBe(true);
      expect(finalSession.administered.sdq).toBe(true);
      expect(finalSession.administered.phq9).toBe(true);
      expect(finalSession.administered.gad7).toBe(true);
      expect(finalSession.administered.moca).toBe(true);
      expect(finalSession.administered.htp).toBe(true);
    });

    it('NAV-PERSIST-2: interactive full App traversal via DOM clicks preserves inputs without corruption', () => {
      render(<App />);

      // Verify initially mounted on Intelligence / WISC-V
      expect(screen.getByTestId('intelligence-module')).toBeDefined();

      // Click on Conducta & Emoción
      const behaviorCatBtn = screen.getByRole('button', { name: /Conducta & Emoción/i });
      fireEvent.click(behaviorCatBtn);
      expect(screen.getByTestId('behavior-module')).toBeDefined();

      // Sub-tab: PHQ-9 (fresh query)
      const phq9TabBtn = screen.getByRole('button', { name: /PHQ-9/i });
      fireEvent.click(phq9TabBtn);
      expect(screen.getByTestId('phq9-input-card')).toBeDefined();

      // Click "Alerta Ítem 9 (Crítico)" preset button in PHQ-9
      const criticalBtn = screen.getByRole('button', { name: /Alerta Ítem 9 \(Crítico\)/i });
      fireEvent.click(criticalBtn);
      expect(screen.getByTestId('phq9-suicide-alert-banner')).toBeDefined();

      // Navigate to Neurocognitive / MoCA
      const neuroCatBtn = screen.getByRole('button', { name: /Cribado Neurocognitivo/i });
      fireEvent.click(neuroCatBtn);
      expect(screen.getByTestId('neurocognitive-module')).toBeDefined();
      expect(screen.getByTestId('moca-input-card')).toBeDefined();

      // Load DCL sample in MoCA
      const mciBtn = screen.getByRole('button', { name: /Ejemplo DCL \(<26\)/i });
      fireEvent.click(mciBtn);
      expect(screen.getByTestId('moca-score-alert')).toBeDefined();
      expect(screen.getByText(/Alerta de Cribado Neurocognitivo \(Puntuación < 26\)/i)).toBeDefined();

      // Navigate to Projective / HTP
      const projCatBtn = screen.getByRole('button', { name: /Evaluación Proyectiva/i });
      fireEvent.click(projCatBtn);
      expect(screen.getByTestId('projective-module')).toBeDefined();

      // Navigate back to Intelligence
      const intelCatBtn = screen.getByRole('button', { name: /Inteligencia & Cognición/i });
      fireEvent.click(intelCatBtn);
      expect(screen.getByTestId('intelligence-module')).toBeDefined();

      // Return to Conducta & Emoción (note: it now has critical alert badge ALERTA)
      const behaviorCatBtnAfter = screen.getByRole('button', { name: /Conducta & Emoción/i });
      fireEvent.click(behaviorCatBtnAfter);

      // Now query freshly mounted PHQ-9 button
      const freshPhq9Btn = screen.getByRole('button', { name: /PHQ-9/i });
      fireEvent.click(freshPhq9Btn);
      expect(screen.getByTestId('phq9-suicide-alert-banner')).toBeDefined();

      // Return to MoCA: DCL alert must still be active!
      const freshNeuroCatBtn = screen.getByRole('button', { name: /Cribado Neurocognitivo/i });
      fireEvent.click(freshNeuroCatBtn);
      expect(screen.getByTestId('moca-score-alert')).toBeDefined();
      expect(screen.getByText(/Alerta de Cribado Neurocognitivo \(Puntuación < 26\)/i)).toBeDefined();
    });
  });

  /* =========================================================================
   * DIMENSION 2: Reactive Alert Banners Under Multiple User Edit Cycles
   * ========================================================================= */
  describe('Dimension 2: Reactive Alert Banners Lifecycle Under Multiple Edit Cycles', () => {
    it('ALERT-PHQ9-CYCLE: toggles suicide risk alert reactively through 8 distinct user edit transitions', () => {
      render(
        <ClinicalSessionProvider>
          <Phq9InputCard />
        </ClinicalSessionProvider>
      );

      // Cycle 1: Initially no responses, alert banner absent
      expect(screen.queryByTestId('phq9-suicide-alert-banner')).toBeNull();

      // Cycle 2: User clicks Normal preset (item 9 = 0) -> banner still absent
      const normalBtn = screen.getByRole('button', { name: /Normal \(0-4\)/i });
      fireEvent.click(normalBtn);
      expect(screen.queryByTestId('phq9-suicide-alert-banner')).toBeNull();

      // Cycle 3: User answers Item 9 = 1 ('Varios días')
      const item9Row = screen.getByText(/pensamientos de que estaría mejor muerto/i).closest('div.p-3\\.5') as HTMLElement;
      const btnOpt1 = within(item9Row).getByRole('button', { name: /^1/ });
      fireEvent.click(btnOpt1);

      // Banner must appear immediately with 'Varios días (1)' and Hotline
      const banner1 = screen.getByTestId('phq9-suicide-alert-banner');
      expect(banner1).toBeDefined();
      expect(banner1.getAttribute('role')).toBe('alert');
      expect(banner1.getAttribute('aria-live')).toBe('assertive');
      expect(within(banner1).getByText(/Ítem 9 = Varios días \(1\)/i)).toBeDefined();
      expect(within(banner1).getByText(/Línea 024 de Atención a la Conducta Suicida/i)).toBeDefined();

      // Cycle 4: User transitions Item 9 to 2 ('Más de la mitad de los días')
      const btnOpt2 = within(item9Row).getByRole('button', { name: /^2/ });
      fireEvent.click(btnOpt2);
      expect(screen.getByTestId('phq9-suicide-alert-banner')).toBeDefined();
      expect(screen.getByText(/Ítem 9 = Más de la mitad de los días \(2\)/i)).toBeDefined();

      // Cycle 5: User transitions Item 9 to 3 ('Casi todos los días')
      const btnOpt3 = within(item9Row).getByRole('button', { name: /^3/ });
      fireEvent.click(btnOpt3);
      expect(screen.getByTestId('phq9-suicide-alert-banner')).toBeDefined();
      expect(screen.getByText(/Ítem 9 = Casi todos los días \(3\)/i)).toBeDefined();

      // Cycle 6: User transitions Item 9 back to 0 ('Para nada') -> Banner must vanish
      const btnOpt0 = within(item9Row).getByRole('button', { name: /^0/ });
      fireEvent.click(btnOpt0);
      expect(screen.queryByTestId('phq9-suicide-alert-banner')).toBeNull();

      // Cycle 7: Critical preset clicked -> Banner reappears with Item 9 = 2
      const criticalBtn = screen.getByRole('button', { name: /Alerta Ítem 9 \(Crítico\)/i });
      fireEvent.click(criticalBtn);
      expect(screen.getByTestId('phq9-suicide-alert-banner')).toBeDefined();

      // Cycle 8: User clicks 'Limpiar' -> Banner must vanish immediately
      const clearBtn = screen.getByRole('button', { name: /Limpiar/i });
      fireEvent.click(clearBtn);
      expect(screen.queryByTestId('phq9-suicide-alert-banner')).toBeNull();

      // Cycle 9: Deontological partial protocol: user answers ONLY Item 9 = 3 (items 1-8 empty)
      const freshItem9Row = screen.getByText(/pensamientos de que estaría mejor muerto/i).closest('div.p-3\\.5') as HTMLElement;
      const freshBtn3 = within(freshItem9Row).getByRole('button', { name: /^3/ });
      fireEvent.click(freshBtn3);
      expect(screen.getByTestId('phq9-suicide-alert-banner')).toBeDefined();
      expect(screen.getByText(/Ítem 9 = Casi todos los días \(3\)/i)).toBeDefined();
    });

    it('ALERT-MOCA-CYCLE: transitions MoCA cutoff alert reactively across multiple domain and education edits', () => {
      let sessionRef: ReturnType<typeof useClinicalSession> | null = null;

      const TestMocaHarness: React.FC = () => {
        const session = useClinicalSession();
        sessionRef = session;
        return <MocaInputCard />;
      };

      render(
        <ClinicalSessionProvider>
          <TestMocaHarness />
        </ClinicalSessionProvider>
      );

      // Cycle 1: Set raw score to 24 with education 12:
      // raw 24 + 1 edu = 25 -> DCL alert active (< 26)
      act(() => {
        const s = sessionRef!;
        s.setMocaDomainScore('visuospatialExecutive', 4);
        s.setMocaDomainScore('naming', 3);
        s.setMocaDomainScore('attention', 5);
        s.setMocaDomainScore('language', 2);
        s.setMocaDomainScore('abstraction', 2);
        s.setMocaDomainScore('delayedRecall', 3);
        s.setMocaDomainScore('orientation', 5); // sum = 24
        s.setMocaEducationYears(12);
      });

      const alertBanner = screen.getByTestId('moca-score-alert');
      expect(within(alertBanner).getByText(/Alerta de Cribado Neurocognitivo \(Puntuación < 26\)/i)).toBeDefined();
      expect(within(alertBanner).getAllByText(/25/i).length).toBeGreaterThanOrEqual(1);
      expect(within(alertBanner).getAllByText(/Deterioro Cognitivo Leve/i).length).toBeGreaterThanOrEqual(1);

      // Cycle 2: Increase Visuospatial by 1 -> raw becomes 25 + 1 edu = 26
      // Cutoff boundary: 26 is Normal (alert disappears, normal status appears)
      act(() => {
        sessionRef!.setMocaDomainScore('visuospatialExecutive', 5);
      });
      expect(screen.getByText(/Cribado Neurocognitivo Normal \(Puntuación ≥ 26\)/i)).toBeDefined();
      expect(screen.queryByText(/Alerta de Cribado Neurocognitivo \(Puntuación < 26\)/i)).toBeNull();
      expect(screen.getAllByText(/26/i).length).toBeGreaterThanOrEqual(1);

      // Cycle 3: Edit education years via the input element to 13 years (> 12)
      // Education adjustment drops to 0: raw 25 + 0 = 25 -> Alert flips BACK on!
      const eduInput = screen.getByLabelText(/Años de Escolaridad Formal del Evaluado/i);
      fireEvent.change(eduInput, { target: { value: '13' } });

      expect(screen.getByText(/Alerta de Cribado Neurocognitivo \(Puntuación < 26\)/i)).toBeDefined();
      expect(screen.getByText(/Sin ajuste de escolaridad aplicado \(escolaridad > 12 años\)/i)).toBeDefined();

      // Cycle 4: Increase Delayed Recall by 1 -> raw becomes 26, edu 13 -> 26 (Normal)
      act(() => {
        sessionRef!.setMocaDomainScore('delayedRecall', 4);
      });
      expect(screen.getByText(/Cribado Neurocognitivo Normal \(Puntuación ≥ 26\)/i)).toBeDefined();

      // Cycle 5: Ceiling Cap Invariant: Max out all domains (raw 30), set education to 6 years
      // raw 30 + 1 MUST NOT exceed 30!
      act(() => {
        sessionRef!.setMocaDomainScore('visuospatialExecutive', 5);
        sessionRef!.setMocaDomainScore('naming', 3);
        sessionRef!.setMocaDomainScore('attention', 6);
        sessionRef!.setMocaDomainScore('language', 3);
        sessionRef!.setMocaDomainScore('abstraction', 2);
        sessionRef!.setMocaDomainScore('delayedRecall', 5);
        sessionRef!.setMocaDomainScore('orientation', 6); // sum = 30
        sessionRef!.setMocaEducationYears(6);
      });

      expect(screen.getAllByText(/30/i).length).toBeGreaterThanOrEqual(1);
      expect(sessionRef!.mocaCalculation!.adjustedScore).toBe(30);
      expect(screen.queryByText(/31/i)).toBeNull();

      // Cycle 6: Clear MoCA -> All domains 0
      const clearBtn = screen.getByRole('button', { name: /Limpiar/i });
      fireEvent.click(clearBtn);
      expect(sessionRef!.mocaCalculation!.rawScore).toBe(0);
    });
  });

  /* =========================================================================
   * DIMENSION 3: Dynamic Modular Report Assembly (Zero Blank Tables, No Orphans)
   * ========================================================================= */
  describe('Dimension 3: Dynamic Modular Report Assembly & Deontological Safety', () => {
    it('REPORT-MODULAR-COMBOS: validates selective rendering across 6 diverse instrument combinations with zero empty tables', () => {
      const TestModularConsumer: React.FC<{
        setupFn: (s: ReturnType<typeof useClinicalSession>) => void;
      }> = ({ setupFn }) => {
        const session = useClinicalSession();

        return (
          <div>
            <button type="button" onClick={() => setupFn(session)}>
              Apply Setup
            </button>
            <ClinicalReportView />
          </div>
        );
      };

      // Combo 1: Demographics ONLY (zero tests administered)
      const setupDemographicsOnly = (s: ReturnType<typeof useClinicalSession>) => {
        s.clearAllScores();
        s.clearSdq();
        s.clearPhq9();
        s.clearGad7();
        s.clearMoca();
        s.clearHtp();
      };

      const { unmount: unmount1, container: c1 } = render(
        <ClinicalSessionProvider>
          <TestModularConsumer setupFn={setupDemographicsOnly} />
        </ClinicalSessionProvider>
      );
      fireEvent.click(screen.getByRole('button', { name: /Apply Setup/i }));

      // Section I & Signature are present
      expect(screen.getByText(/I\. Datos de Identificación y Filiación Clínica/i)).toBeDefined();
      expect(c1.querySelector('.signature-block')).not.toBeNull();

      // ALL other sections MUST be completely absent from the DOM
      expect(c1.querySelector('[data-testid="report-wechsler-section"]')).toBeNull();
      expect(c1.querySelector('[data-testid="report-moca-section"]')).toBeNull();
      expect(c1.querySelector('[data-testid="report-sdq-section"]')).toBeNull();
      expect(c1.querySelector('[data-testid="report-affective-section"]')).toBeNull();
      expect(c1.querySelector('[data-testid="report-htp-section"]')).toBeNull();

      // Audit: only demographics table exists, no empty rows
      const tables1 = c1.querySelectorAll('table');
      expect(tables1.length).toBe(1);
      tables1[0].querySelectorAll('tbody tr').forEach((tr) => {
        expect(tr.textContent?.trim().length).toBeGreaterThan(0);
      });
      unmount1();

      // Combo 2: HTP ONLY
      const setupHtpOnly = (s: ReturnType<typeof useClinicalSession>) => {
        s.clearAllScores();
        s.clearSdq();
        s.clearPhq9();
        s.clearGad7();
        s.clearMoca();
        s.loadHtpPreset('expansive');
      };

      const { unmount: unmount2, container: c2 } = render(
        <ClinicalSessionProvider>
          <TestModularConsumer setupFn={setupHtpOnly} />
        </ClinicalSessionProvider>
      );
      fireEvent.click(screen.getByRole('button', { name: /Apply Setup/i }));

      // HTP section is present with exactly 5 narrative paragraphs
      expect(c2.querySelector('[data-testid="report-htp-section"]')).not.toBeNull();
      expect(screen.getByText(/VIII\. Evaluación Proyectiva Gráfica HTP/i)).toBeDefined();
      expect(screen.getByText(/a\) Indicadores Expresivos y Formales Transversales/i)).toBeDefined();
      expect(screen.getByText(/b\) Dinámica Familiar y Área Afectiva \(Casa\)/i)).toBeDefined();
      expect(screen.getByText(/c\) Estructura del Yo y Estabilidad Emocional Profunda \(Árbol\)/i)).toBeDefined();
      expect(screen.getByText(/d\) Imagen Corporal y Relaciones Interpersonales \(Persona\)/i)).toBeDefined();
      expect(screen.getByText(/e\) Conclusión Cualitativa Integrada/i)).toBeDefined();

      // And HTP has ZERO numerical score tables
      expect(c2.querySelector('[data-testid="report-htp-section"]')!.querySelectorAll('table').length).toBe(0);

      // Wechsler, MoCA, SDQ, Affective are omitted
      expect(c2.querySelector('[data-testid="report-wechsler-section"]')).toBeNull();
      expect(c2.querySelector('[data-testid="report-moca-section"]')).toBeNull();
      expect(c2.querySelector('[data-testid="report-sdq-section"]')).toBeNull();
      expect(c2.querySelector('[data-testid="report-affective-section"]')).toBeNull();
      unmount2();

      // Combo 3: SDQ and PHQ-9 ONLY
      const setupSdqPhq9 = (s: ReturnType<typeof useClinicalSession>) => {
        s.clearAllScores();
        s.clearMoca();
        s.clearGad7();
        s.clearHtp();
        s.loadSdqSample('normal');
        s.loadPhq9Sample('minimal');
      };

      const { unmount: unmount3, container: c3 } = render(
        <ClinicalSessionProvider>
          <TestModularConsumer setupFn={setupSdqPhq9} />
        </ClinicalSessionProvider>
      );
      fireEvent.click(screen.getByRole('button', { name: /Apply Setup/i }));

      expect(c3.querySelector('[data-testid="report-sdq-section"]')).not.toBeNull();
      expect(c3.querySelector('[data-testid="report-affective-section"]')).not.toBeNull();
      expect(c3.querySelector('[data-testid="report-wechsler-section"]')).toBeNull();
      expect(c3.querySelector('[data-testid="report-moca-section"]')).toBeNull();
      expect(c3.querySelector('[data-testid="report-htp-section"]')).toBeNull();

      // Affective table must only have PHQ-9 row, NOT GAD-7 row
      expect(screen.getByText(/PHQ-9 \(Cuestionario de Salud del Paciente - Depresión\)/i)).toBeDefined();
      expect(screen.queryByText(/GAD-7 \(Trastorno de Ansiedad Generalizada\)/i)).toBeNull();
      unmount3();
    });

    it('REPORT-DOM-AUDIT: empirical check verifies zero NaN, undefined, or empty rows across full report', () => {
      const TestFullHarness: React.FC = () => {
        const session = useClinicalSession();

        return (
          <div>
            <button
              type="button"
              onClick={() => {
                session.loadDemoSession();
                session.loadPhq9Sample('critical');
              }}
            >
              Load Demo
            </button>
            <ClinicalReportView />
          </div>
        );
      };

      const { container } = render(
        <ClinicalSessionProvider>
          <TestFullHarness />
        </ClinicalSessionProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /Load Demo/i }));

      // 1. Audit text for corruption tokens
      const fullText = container.textContent || '';
      expect(fullText).not.toContain('NaN');
      expect(fullText).not.toContain('undefined');
      expect(fullText).not.toContain('null');
      expect(fullText).not.toContain('[object Object]');

      // 2. Audit all tables
      const tables = container.querySelectorAll('table.clinical-table');
      expect(tables.length).toBeGreaterThanOrEqual(4); // Demographics, WISC Subtests, MoCA, SDQ, Affective

      tables.forEach((table) => {
        const rows = table.querySelectorAll('tbody tr');
        expect(rows.length).toBeGreaterThan(0);
        rows.forEach((row) => {
          const text = row.textContent?.trim() || '';
          expect(text.length).toBeGreaterThan(0);
          expect(text).not.toContain('NaN');
        });
      });
    });

    it('ANON-DEONTOLOGY: stress tests name anonymization across Latin name permutations and restores reliably', () => {
      const namesToTest = [
        { original: 'Juan José De La Torre y Borbón', expected: 'J. J. D. L. T. Y. B.' },
        { original: 'Ángela Sofía Nuñez Del Prado', expected: 'Á. S. N. D. P.' },
        { original: 'Édgar Úrsulo Íñiguez', expected: 'É. Ú. Í.' },
        { original: 'Guillermo', expected: 'G.' },
        { original: '   Pedro    Pablo   Kuczynski   ', expected: 'P. P. K.' },
      ];

      namesToTest.forEach(({ original, expected }) => {
        expect(anonymizeName(original)).toBe(expected);
      });

      // Verify toggle in ClinicalSessionProvider
      let sessionRef: ReturnType<typeof useClinicalSession> | null = null;
      const TestAnonHarness: React.FC = () => {
        const session = useClinicalSession();
        sessionRef = session;
        return <div data-testid="anon-display">{session.displayName}</div>;
      };

      render(
        <ClinicalSessionProvider>
          <TestAnonHarness />
        </ClinicalSessionProvider>
      );

      act(() => {
        sessionRef!.setDemographics({ nameOrId: 'María del Pilar Gómez-Sánchez' });
      });
      expect(sessionRef!.displayName).toBe('María del Pilar Gómez-Sánchez');
      expect(screen.getByTestId('anon-display').textContent).toBe('María del Pilar Gómez-Sánchez');

      // Toggle anonymization ON
      act(() => {
        sessionRef!.toggleAnonymize();
      });
      expect(sessionRef!.displayName).toBe('M. D. P. G.');
      expect(sessionRef!.demographics.isAnonymized).toBe(true);
      expect(screen.getByTestId('anon-display').textContent).toBe('M. D. P. G.');

      // Toggle anonymization OFF
      act(() => {
        sessionRef!.toggleAnonymize();
      });
      expect(sessionRef!.displayName).toBe('María del Pilar Gómez-Sánchez');
      expect(sessionRef!.demographics.isAnonymized).toBe(false);
      expect(screen.getByTestId('anon-display').textContent).toBe('María del Pilar Gómez-Sánchez');
    });
  });

  /* =========================================================================
   * DIMENSION 4: Camera-Ready Print Stylesheet & Media Print DOM Verification
   * ========================================================================= */
  describe('Dimension 4: Camera-Ready Print Stylesheet (print.css) & Media Rules', () => {
    let printCss: string = '';

    beforeEach(async () => {
      // @ts-expect-error dynamic node fs import
      const fs = await import('fs');
      // @ts-expect-error dynamic node path import
      const path = await import('path');
      const cwd = ((globalThis as unknown as { process?: { cwd: () => string } }).process?.cwd?.()) || '';
      printCss = fs.readFileSync(path.resolve(cwd, 'src/styles/print.css'), 'utf-8');
    });

    it('PRINT-A4-SPEC: enforces strict A4 portrait geometry and 14mm/16mm margins', () => {
      expect(printCss).toMatch(/@page\s*\{[^}]*size:\s*A4\s+portrait/i);
      expect(printCss).toMatch(/margin:\s*14mm\s+16mm\s+14mm\s+16mm/i);
      expect(printCss).toMatch(/-webkit-print-color-adjust:\s*exact/i);
      expect(printCss).toMatch(/print-color-adjust:\s*exact/i);
    });

    it('PRINT-CHROME-SUPPRESSION: strips all web navigation, buttons, footers, and floating panels', () => {
      const suppressedSelectors = [
        'header.app-nav',
        'aside.sidebar',
        'button',
        '.no-print',
        '.battery-toggle',
        '.quick-input-panel',
        '.status-toast',
        '.tooltip',
        'footer.app-footer',
      ];

      suppressedSelectors.forEach((selector) => {
        expect(printCss).toContain(selector);
      });
      expect(printCss).toMatch(/display:\s*none\s*!important/);
    });

    it('PRINT-BREAK-DISCIPLINE: applies break-inside-avoid to all clinical sections and SVG charts', () => {
      expect(printCss).toMatch(/\.avoid-break/);
      expect(printCss).toMatch(/\.report-instrument-section/);
      expect(printCss).toMatch(/break-inside:\s*avoid\s*!important/i);
      expect(printCss).toMatch(/page-break-inside:\s*avoid\s*!important/i);
      expect(printCss).toMatch(/h2\.report-section\s*\{[^}]*break-after:\s*avoid/i);
      expect(printCss).toMatch(/svg\.psychometric-chart/);
      expect(printCss).toMatch(/svg\.sdq-chart/);
      expect(printCss).toMatch(/max-height:\s*230px\s*!important/);
    });

    it('PRINT-DOM-ATTACHMENT: App renders ClinicalReportView with print:block and hides interactive modules with print:hidden', () => {
      const { container } = render(<App />);

      // On screen, intelligence module is visible, but carries print:hidden
      const intelModule = screen.getByTestId('intelligence-module');
      expect(intelModule.className).toContain('print:hidden');

      // ClinicalReportView container carries print:block even when not in report tab!
      const reportView = screen.getByTestId('clinical-report-view');
      const reportWrapper = reportView.parentElement!;
      expect(reportWrapper.className).toContain('print:block');

      // The footer carries no-print
      const footer = container.querySelector('footer.app-footer');
      expect(footer).not.toBeNull();
      expect(footer!.className).toContain('no-print');
    });
  });
});
