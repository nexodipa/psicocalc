/**
 * ============================================================================
 * Psicocalc — Clinical Expansion E2E Integration Test Suite (Milestone M8)
 * ============================================================================
 * Authoritative Specifications:
 * - ORIGINAL_REQUEST.md (Requirements R1, R2, R3)
 * - PROJECT.md (Architecture, Multi-Instrument Session, Dynamic Reporting)
 *
 * Scenarios Covered:
 * 1. Complete Multi-Test Clinical Journey:
 *    - Patient Demographics setup
 *    - WISC-V 10 core subtests, 5 primary indices & CIT/FSIQ
 *    - SDQ 25 items with reverse items (7, 11, 14, 21, 25), subscale normative
 *      bands, and Total Difficulties (excluding prosocial)
 *    - PHQ-9 triggering Item 9 critical suicide risk alert banner (item_9 >= 1)
 *    - GAD-7 triggering clinical anxiety cutoff (score >= 10)
 *    - MoCA verifying education <= 12 years +1 adjustment (capped at 30) and cutoff warning (< 26)
 *    - Qualitative HTP with custom clinician field notes generating 5-paragraph narrative
 *    - Rapid category traversal verifying zero data loss
 *    - Full ClinicalReportView verification across Sections I to VIII
 * 2. Partial Evaluation Journey:
 *    - Only PHQ-9 and MoCA administered; dynamic modular omission of WISC, SDQ, HTP
 *    - Zero empty tables, no blank rows, clean DOM structure
 * 3. Deontological Safety & 1-Click Global Anonymization:
 *    - 1-Click anonymization across header, demographics, narrative, and report
 *    - Restoring original name, dynamic initials updating
 * 4. Adversarial Clinical Boundary Invariants:
 *    - MoCA capping at 30 and 12 vs 13 years education boundary
 *    - PHQ-9 Item 9 gradient (0 vs 1, 2, 3)
 *    - SDQ item inversion invariants & prosocial exclusion
 *    - HTP clinician field notes with special characters and quotes
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../App';
import {
  ClinicalSessionProvider,
  useClinicalSession,
} from '../../ui/context/ClinicalSessionContext';
import { ClinicalReportView } from '../../ui/components/report/ClinicalReportView';
import {
  calculateWiscV,
  validateAgeAndBattery,
} from '../../core';
import {
  calculateSdq,
  calculatePhq9,
  calculateGad7,
  calculateMoca,
  invertSdqItem,
  isSdqItemReversed,
} from '../../core/engine/clinicalCalculators';
import { generateHtpFullReport, generateFormalSummary } from '../../core/engine/htpNarrativeEngine';
import { anonymizeName } from '../../ui/hooks/usePsychometrics';
import { HtpAssessmentRecord, INITIAL_HTP_RECORD } from '../../core/types/htp';
import { Phq9SuicideAlertBanner } from '../../ui/components/clinical/Phq9SuicideAlertBanner';
import { MocaScoreAlert } from '../../ui/components/clinical/MocaScoreAlert';

// Shorthand React.createElement helper for .ts file
const h = React.createElement;

describe('Psicocalc — Clinical Expansion E2E Integration Test Suite (Milestone M8)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  /* =========================================================================
   * 1. COMPLETE MULTI-TEST CLINICAL JOURNEY
   * ========================================================================= */
  describe('1. Complete Multi-Test Clinical Journey (End-to-End Workflow)', () => {
    it('executes full clinical session: Demographics, WISC-V, SDQ, PHQ-9, GAD-7, MoCA, HTP, traversal & Report (Sections I-VIII)', () => {
      // Custom test patient: Mateo Valenzuela Ríos, age 10y 4m
      const patientDemographics = {
        nameOrId: 'Mateo Valenzuela Ríos',
        birthDate: '2016-05-15',
        testDate: '2026-09-23',
        examiner: 'Dra. Sofía Alarcón (Col. M-4521)',
        reasonForEvaluation:
          'Evaluación neuropsicológica comprensiva y descarte de dificultades atencionales y afectivas',
        isAnonymized: false,
        educationYears: 5,
        schoolGrade: '5º Primaria',
      };

      // WISC-V 10 Core Subtests
      const wiscScores = {
        S: 12, // Semejanzas (VCI)
        V: 11, // Vocabulario (VCI)
        C: 10, // Cubos (VSI)
        PV: 9, // Puzzles Visuales (VSI)
        M: 13, // Matrices (FRI)
        B: 12, // Balanzas (FRI)
        D: 7,  // Dígitos (WMI)
        SD: 8, // Span de Dibujos (WMI)
        CL: 6, // Claves (PSI)
        BS: 7, // Búsqueda de Símbolos (PSI)
      };

      // SDQ 25 items with reversed items (7, 11, 14, 21, 25)
      // Reverse rule: score = 2 - raw
      // Items 7, 11, 14, 21, 25 raw=0 -> inverted score=2
      const sdqResponses: Record<number, number> = {
        // Prosocial (1, 4, 9, 17, 20)
        1: 1, 4: 1, 9: 1, 17: 1, 20: 1, // sum = 5 (Borderline: 5-5)
        // Emotional (3, 8, 13, 16, 24)
        3: 2, 8: 2, 13: 2, 16: 1, 24: 1, // sum = 8 (Abnormal: >= 5)
        // Conduct (5, 7, 12, 18, 22) - item 7 reversed!
        5: 2, 7: 0, 12: 2, 18: 1, 22: 1, // item 7 inverted = 2. sum = 2+2+2+1+1 = 8 (Abnormal: >= 4)
        // Hyperactivity (2, 10, 15, 21, 25) - items 21, 25 reversed!
        2: 2, 10: 2, 15: 2, 21: 0, 25: 0, // items 21, 25 inverted = 2 each. sum = 2+2+2+2+2 = 10 (Abnormal: >= 7)
        // Peer (6, 11, 14, 19, 23) - items 11, 14 reversed!
        6: 2, 11: 0, 14: 0, 19: 1, 23: 1, // items 11, 14 inverted = 2 each. sum = 2+2+2+1+1 = 8 (Abnormal: >= 4)
      };

      // PHQ-9 (9 items): item 9 = 2 triggers critical suicide alert banner
      const phq9Responses: Record<number, 0 | 1 | 2 | 3> = {
        1: 2, 2: 2, 3: 1, 4: 2, 5: 1, 6: 1, 7: 1, 8: 1, 9: 2,
      };

      // GAD-7 (7 items): total = 12 triggers clinical anxiety cutoff (>= 10)
      const gad7Responses: Record<number, 0 | 1 | 2 | 3> = {
        1: 2, 2: 2, 3: 2, 4: 2, 5: 1, 6: 2, 7: 1,
      };

      // MoCA domains: raw = 19, education = 5 (<= 12) -> adjustment = +1, adjusted = 20 (< 26 cutoff alert)
      const mocaDomains = {
        visuospatialExecutive: 3,
        naming: 2,
        attention: 4,
        language: 2,
        abstraction: 1,
        delayedRecall: 2,
        orientation: 5,
      };

      // Custom HTP Record with clinician field notes
      const customHtpRecord: HtpAssessmentRecord = {
        ...INITIAL_HTP_RECORD,
        id: 'htp-test-mateo',
        testDate: '2026-09-23',
        evaluator: 'Dra. Sofía Alarcón',
        formal: {
          size: 'micrography',
          verticalPlacement: 'lower',
          horizontalPlacement: 'left',
          strokePressure: 'weak',
          lineQuality: 'fragmented',
          shading: 'excessive',
          symmetry: 'rigid',
          hasExcessiveErasures: true,
          hasTransparencies: false,
          hasOmissions: true,
        },
        house: {
          roof: 'normal',
          walls: 'weak_broken',
          door: 'closed_unlocked',
          windows: 'closed_curtained',
          chimneySmoke: 'absent_no_smoke',
          pathway: 'absent_isolated',
          fences: 'none',
          observations: 'Aislamiento vincular severo reflejado en puerta cerrada sin picaporte.',
        },
        tree: {
          groundLine: 'floating_absent',
          roots: 'hidden_normal',
          trunk: 'broken_scarred',
          branches: 'severed_truncated',
          foliageCrown: 'sparse_bare',
          hasKnotsOrHoles: true,
          observations: 'Trauma temprano manifestado en corteza con hendiduras y raíces ausentes.',
        },
        person: {
          head: 'proportionate',
          expression: 'anguished_vacant',
          eyes: 'empty_dots',
          mouth: 'tight_line',
          neck: 'long_thin',
          arms: 'rigid_vertical',
          hands: 'absent',
          legsFeet: 'tense_pressed',
          clothing: 'underdressed_scanty',
          observations: 'Autoimagen corporal frágil con omisión de manos y brazos pegados al cuerpo.',
        },
        generalClinicalNotes:
          'Perfil proyectivo altamente congruente con sintomatología afectiva y retracción social.',
      };

      // Harness component to orchestrate full session in context
      const TestFullJourneyHarness: React.FC = () => {
        const session = useClinicalSession();

        return h(
          'div',
          null,
          h(
            'button',
            {
              type: 'button',
              'data-testid': 'btn-administer-full-journey',
              onClick: () => {
                // 1. Demographics
                session.setDemographics(patientDemographics);

                // 2. WISC-V
                session.setBattery('WISC-V');
                Object.entries(wiscScores).forEach(([k, v]) => {
                  session.setSubtestScore(k as any, v);
                });

                // 3. SDQ
                session.setSdqInformant('parent');
                Object.entries(sdqResponses).forEach(([k, v]) => {
                  session.setSdqResponse(Number(k), v as any);
                });

                // 4. PHQ-9
                Object.entries(phq9Responses).forEach(([k, v]) => {
                  session.setPhq9Response(Number(k), v as any);
                });

                // 5. GAD-7
                Object.entries(gad7Responses).forEach(([k, v]) => {
                  session.setGad7Response(Number(k), v as any);
                });

                // 6. MoCA
                session.setMocaEducationYears(5);
                Object.entries(mocaDomains).forEach(([k, v]) => {
                  session.setMocaDomainScore(k as any, v);
                });

                // 7. HTP
                session.setHtpRecord(customHtpRecord);
              },
            },
            'Administer Full Journey'
          ),
          h(
            'button',
            {
              type: 'button',
              'data-testid': 'btn-nav-intelligence',
              onClick: () => session.setActiveCategory('intelligence'),
            },
            'Nav Intelligence'
          ),
          h(
            'button',
            {
              type: 'button',
              'data-testid': 'btn-nav-behavior',
              onClick: () => session.setActiveCategory('behavior_emotion'),
            },
            'Nav Behavior'
          ),
          h(
            'button',
            {
              type: 'button',
              'data-testid': 'btn-nav-neuro',
              onClick: () => session.setActiveCategory('neurocognitive'),
            },
            'Nav Neuro'
          ),
          h(
            'button',
            {
              type: 'button',
              'data-testid': 'btn-nav-projective',
              onClick: () => session.setActiveCategory('projective'),
            },
            'Nav Projective'
          ),
          h(
            'button',
            {
              type: 'button',
              'data-testid': 'btn-nav-report',
              onClick: () => session.setActiveCategory('report'),
            },
            'Nav Report'
          ),
          h(ClinicalReportView)
        );
      };

      const { container } = render(
        h(ClinicalSessionProvider, null, h(TestFullJourneyHarness))
      );

      // Trigger full administration
      fireEvent.click(screen.getByTestId('btn-administer-full-journey'));

      // -----------------------------------------------------------------------
      // Step A: Mathematical Psychometric Integrity Checks
      // -----------------------------------------------------------------------
      // 1. WISC-V calculations
      const wiscCalc = calculateWiscV(wiscScores);
      expect(wiscCalc.isCompleteCit).toBe(true);
      expect(wiscCalc.cit).not.toBeNull();
      expect(wiscCalc.primaryIndices.ICV?.sumScaled).toBe(23);
      expect(wiscCalc.primaryIndices.IVE?.sumScaled).toBe(19);
      expect(wiscCalc.primaryIndices.IRF?.sumScaled).toBe(25);
      expect(wiscCalc.primaryIndices.IMT?.sumScaled).toBe(15);
      expect(wiscCalc.primaryIndices.IVP?.sumScaled).toBe(13);

      // 2. SDQ calculations with reverse item inversion
      const sdqCalc = calculateSdq({ informant: 'parent', responses: sdqResponses });
      expect(sdqCalc.subscales.emotional.rawScore).toBe(8);
      expect(sdqCalc.subscales.emotional.classification).toBe('Abnormal');
      expect(sdqCalc.subscales.conduct.rawScore).toBe(8);
      expect(sdqCalc.subscales.conduct.classification).toBe('Abnormal');
      expect(sdqCalc.subscales.hyperactivity.rawScore).toBe(10);
      expect(sdqCalc.subscales.hyperactivity.classification).toBe('Abnormal');
      expect(sdqCalc.subscales.peer.rawScore).toBe(8);
      expect(sdqCalc.subscales.peer.classification).toBe('Abnormal');
      expect(sdqCalc.subscales.prosocial.rawScore).toBe(5);
      expect(sdqCalc.subscales.prosocial.classification).toBe('Borderline');

      // Total Difficulties = 8 + 8 + 10 + 8 = 34 (STRICTLY excludes prosocial!)
      expect(sdqCalc.totalDifficulties.score).toBe(34);
      expect(sdqCalc.totalDifficulties.classification).toBe('Abnormal');

      // 3. PHQ-9 calculations
      const phq9Calc = calculatePhq9(phq9Responses);
      expect(phq9Calc.totalScore).toBe(13);
      expect(phq9Calc.severity).toBe('Moderada');
      expect(phq9Calc.isItem9AlertActive).toBe(true);
      expect(phq9Calc.suicideRiskAlert.triggered).toBe(true);
      expect(phq9Calc.suicideRiskAlert.itemScore).toBe(2);

      // 4. GAD-7 calculations
      const gad7Calc = calculateGad7(gad7Responses);
      expect(gad7Calc.totalScore).toBe(12);
      expect(gad7Calc.severity).toBe('Ansiedad moderada');
      expect(gad7Calc.meetsClinicalCutoff).toBe(true);

      // 5. MoCA calculations: raw 19, +1 adjustment for 5 years education, adjusted 20, cutoff < 26 met
      const mocaCalc = calculateMoca({ domains: mocaDomains, educationYears: 5 });
      expect(mocaCalc.rawScore).toBe(19);
      expect(mocaCalc.educationAdjustment).toBe(1);
      expect(mocaCalc.adjustedScore).toBe(20);
      expect(mocaCalc.meetsClinicalCutoff).toBe(true);
      expect(mocaCalc.classification).toBe('Deterioro Cognitivo Leve');

      // 6. HTP Qualitative Narrative Engine
      const htpReport = generateHtpFullReport(customHtpRecord);
      expect(htpReport.summaryFormal).toContain('micrografía');
      expect(htpReport.houseAnalysis).toContain('Aislamiento vincular severo reflejado en puerta cerrada sin picaporte.');
      expect(htpReport.treeAnalysis).toContain('Trauma temprano manifestado en corteza con hendiduras y raíces ausentes.');
      expect(htpReport.personAnalysis).toContain('Autoimagen corporal frágil con omisión de manos y brazos pegados al cuerpo.');
      expect(htpReport.integratedConclusion).toContain('Perfil proyectivo altamente congruente con sintomatología afectiva y retracción social.');

      // -----------------------------------------------------------------------
      // Step B: Traversal Across Categories (Zero Data Loss Verification)
      // -----------------------------------------------------------------------
      fireEvent.click(screen.getByTestId('btn-nav-behavior'));
      fireEvent.click(screen.getByTestId('btn-nav-neuro'));
      fireEvent.click(screen.getByTestId('btn-nav-projective'));
      fireEvent.click(screen.getByTestId('btn-nav-intelligence'));
      fireEvent.click(screen.getByTestId('btn-nav-report'));

      // -----------------------------------------------------------------------
      // Step C: Complete Clinical Report View Verification (Sections I to VIII)
      // -----------------------------------------------------------------------
      // Section I: Demographics & Consultation
      expect(screen.getByText(/I\. Datos de Identificación y Filiación Clínica/i)).toBeDefined();
      expect(screen.getAllByText(/Mateo Valenzuela Ríos/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Dra\. Sofía Alarcón/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/descarte de dificultades atencionales y afectivas/i)).toBeDefined();

      // Section II: Wechsler Composite & Primary Indices
      expect(screen.getByTestId('report-wechsler-section')).toBeDefined();
      expect(screen.getByText(/II\. Resumen de Puntuaciones Compuestas e Índices Primarios/i)).toBeDefined();
      expect(screen.getAllByText('ICV').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Comprensión Verbal').length).toBeGreaterThan(0);
      expect(screen.getAllByText('IVE').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Visoespacial').length).toBeGreaterThan(0);
      expect(screen.getAllByText('IRF').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Razonamiento Fluido').length).toBeGreaterThan(0);
      expect(screen.getAllByText('IMT').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Memoria de Trabajo').length).toBeGreaterThan(0);
      expect(screen.getAllByText('IVP').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Velocidad de Procesamiento').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/COEFICIENTE INTELECTUAL TOTAL/i).length).toBeGreaterThan(0);

      // Section III: Wechsler Subtest Summary Table
      expect(screen.getByText(/III\. Puntuaciones Escalares y Análisis de Dispersión Intraindividual/i)).toBeDefined();

      // Section IV: Wechsler Narrative
      expect(screen.getByText(/IV\. Interpretación Clínica y Juicio Diagnóstico Automatizado/i)).toBeDefined();

      // Section V: MoCA Neurocognitive Screening
      expect(screen.getByTestId('report-moca-section')).toBeDefined();
      expect(screen.getByText(/V\. Cribado Neurocognitivo Rápido \(MoCA - Montreal Cognitive Assessment\)/i)).toBeDefined();
      expect(screen.getByText(/Alerta de Rendimiento Neurocognitivo:/i)).toBeDefined();
      expect(screen.getAllByText(/Deterioro Cognitivo Leve/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/20 \/ 30/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Ajuste por Escolaridad \(5 años declarados\)/i)).toBeDefined();
      expect(screen.getByText(/\+1 punto \(Escolaridad ≤ 12 años\)/i)).toBeDefined();

      // Section VI: SDQ Behavioral Screening
      expect(screen.getByTestId('report-sdq-section')).toBeDefined();
      expect(screen.getByText(/VI\. Evaluación Conductual y Socioemocional \(SDQ/i)).toBeDefined();
      expect(screen.getByText('TOTAL DE DIFICULTADES (Excluye Prosocial)')).toBeDefined();
      expect(screen.getAllByText('34').length).toBeGreaterThan(0); // Total difficulties raw score
      expect(screen.getAllByText(/34 \/ 40/i).length).toBeGreaterThan(0);
      const sdqSvg = container.querySelector('svg.sdq-chart');
      expect(sdqSvg).not.toBeNull();

      // Section VII: Affective Symptomatology (PHQ-9 & GAD-7)
      expect(screen.getByTestId('report-affective-section')).toBeDefined();
      expect(screen.getByText(/VII\. Sintomatología Afectiva: Depresión y Ansiedad \(PHQ-9 & GAD-7\)/i)).toBeDefined();
      expect(screen.getByTestId('report-suicide-alert')).toBeDefined();
      expect(screen.getByText(/Alerta Pericial Deontológica: Detección de Riesgo Autolítico/i)).toBeDefined();
      expect(screen.getByText(/PHQ-9 \(Cuestionario de Salud del Paciente - Depresión\)/i)).toBeDefined();
      expect(screen.getAllByText('13').length).toBeGreaterThan(0); // PHQ-9 score
      expect(screen.getByText(/GAD-7 \(Trastorno de Ansiedad Generalizada\)/i)).toBeDefined();
      expect(screen.getAllByText('12').length).toBeGreaterThan(0); // GAD-7 score
      expect(screen.getAllByText('Superado (Clínico)').length).toBe(2);

      // Section VIII: HTP Qualitative Projective Assessment
      expect(screen.getByTestId('report-htp-section')).toBeDefined();
      expect(screen.getByText(/VIII\. Evaluación Proyectiva Gráfica HTP \(Casa - Árbol - Persona\)/i)).toBeDefined();
      expect(screen.getByText(/a\) Indicadores Expresivos y Formales Transversales/i)).toBeDefined();
      expect(screen.getByText(/b\) Dinámica Familiar y Área Afectiva \(Casa\)/i)).toBeDefined();
      expect(screen.getByText(/c\) Estructura del Yo y Estabilidad Emocional Profunda \(Árbol\)/i)).toBeDefined();
      expect(screen.getByText(/d\) Imagen Corporal y Relaciones Interpersonales \(Persona\)/i)).toBeDefined();
      expect(screen.getByText(/e\) Conclusión Cualitativa Integrada/i)).toBeDefined();

      // Check verbatim inclusion of clinician field notes in the report DOM
      expect(screen.getByText(new RegExp('Aislamiento vincular severo reflejado en puerta cerrada', 'i'))).toBeDefined();
      expect(screen.getByText(new RegExp('Trauma temprano manifestado en corteza', 'i'))).toBeDefined();
      expect(screen.getByText(new RegExp('Autoimagen corporal frágil con omisión de manos', 'i'))).toBeDefined();
      expect(screen.getByText(new RegExp('Perfil proyectivo altamente congruente con sintomatología afectiva', 'i'))).toBeDefined();

      // Signature Block
      expect(screen.getByText(/Lugar y fecha de emisión/i)).toBeDefined();
      expect(screen.getByText(/Psicólogo\/a Colegiado\/a Especialista/i)).toBeDefined();
    });

    it('executes full interactive clinical journey directly through App UI navigation and user clicks', () => {
      render(h(App));

      // 1. Starts in Intelligence / WISC-V initial state
      expect(screen.getByTestId('intelligence-module')).toBeDefined();

      // 2. Navigate to Conducta & Emoción (starts on SDQ)
      fireEvent.click(screen.getByRole('button', { name: /Conducta & Emoción/i }));
      expect(screen.getByTestId('behavior-module')).toBeDefined();
      expect(screen.getByTestId('sdq-input-card')).toBeDefined();

      // Load SDQ sample
      fireEvent.click(screen.getByRole('button', { name: /Ejemplo Normal/i }));
      expect(screen.getAllByText(/25 \/ 25/i).length).toBeGreaterThan(0);

      // Switch to PHQ-9 sub-tab
      fireEvent.click(screen.getByRole('button', { name: /PHQ-9/i }));
      expect(screen.getByTestId('phq9-input-card')).toBeDefined();

      // Trigger critical item 9 sample
      fireEvent.click(screen.getByRole('button', { name: /Alerta Ítem 9/i }));
      expect(screen.getByTestId('phq9-suicide-alert-banner')).toBeDefined();
      expect(screen.getByText(/Alerta Deontológica: Riesgo de Autolesión o Ideación Suicida/i)).toBeDefined();

      // Switch to GAD-7 sub-tab
      fireEvent.click(screen.getByRole('button', { name: /GAD-7/i }));
      expect(screen.getByTestId('gad7-input-card')).toBeDefined();
      fireEvent.click(screen.getByRole('button', { name: /Moderada/i }));
      expect(screen.getAllByText('10').length).toBeGreaterThan(0);

      // 3. Switch to Cribado Neurocognitivo (MoCA)
      fireEvent.click(screen.getByRole('button', { name: /Cribado Neurocognitivo/i }));
      expect(screen.getByTestId('neurocognitive-module')).toBeDefined();
      expect(screen.getByTestId('moca-input-card')).toBeDefined();
      fireEvent.click(screen.getByRole('button', { name: /Ejemplo DCL/i }));
      expect(screen.getByText(/Alerta de Cribado Neurocognitivo \(Puntuación < 26\)/i)).toBeDefined();

      // 4. Switch to Evaluación Proyectiva (HTP)
      fireEvent.click(screen.getByRole('button', { name: /Evaluación Proyectiva/i }));
      expect(screen.getByTestId('projective-module')).toBeDefined();
      fireEvent.click(screen.getByRole('button', { name: /Inhibido \/ Ansioso/i }));
      expect(screen.getByText(/Previsualización Narrativa Pericial/i)).toBeDefined();

      // 5. Navigate to Informe Clínico Integrado
      fireEvent.click(screen.getByRole('button', { name: /Informe Clínico Integrado/i }));
      expect(screen.getByTestId('clinical-report-view')).toBeDefined();
      expect(screen.getByTestId('report-wechsler-section')).toBeDefined();
      expect(screen.getByTestId('report-sdq-section')).toBeDefined();
      expect(screen.getByTestId('report-affective-section')).toBeDefined();
      expect(screen.getByTestId('report-suicide-alert')).toBeDefined();
      expect(screen.getByTestId('report-moca-section')).toBeDefined();
      expect(screen.getByTestId('report-htp-section')).toBeDefined();

      // 6. Test 1-click anonymization
      const anonBtn = screen.getAllByRole('button', { name: /1-Clic Anonimizar/i })[0];
      fireEvent.click(anonBtn);
      expect(screen.getAllByText('L. F. G.').length).toBeGreaterThan(0);
    });
  });

  /* =========================================================================
   * 2. PARTIAL EVALUATION JOURNEY
   * ========================================================================= */
  describe('2. Partial Evaluation Journey (Dynamic Modular Omission & Zero Empty Tables)', () => {
    it('administers ONLY PHQ-9 and MoCA: renders Sections I, V, VII and omits Wechsler, SDQ, HTP with zero empty rows', () => {
      const TestPartialConsumer: React.FC = () => {
        const session = useClinicalSession();

        return h(
          'div',
          null,
          h(
            'button',
            {
              type: 'button',
              'data-testid': 'btn-partial-setup',
              onClick: () => {
                session.clearAllScores();
                session.clearSdq();
                session.clearGad7();
                session.clearHtp();

                // Administer only PHQ-9 and MoCA
                session.loadPhq9Sample('moderate');
                session.loadMocaSample('normal');
              },
            },
            'Setup Partial Session'
          ),
          h(ClinicalReportView)
        );
      };

      const { container } = render(
        h(ClinicalSessionProvider, null, h(TestPartialConsumer))
      );

      fireEvent.click(screen.getByTestId('btn-partial-setup'));

      // 1. Demographics Section I IS rendered
      expect(screen.getByText(/I\. Datos de Identificación y Filiación Clínica/i)).toBeDefined();

      // 2. MoCA Section V IS rendered
      const mocaSection = screen.getByTestId('report-moca-section');
      expect(mocaSection).toBeDefined();
      expect(screen.getByText(/V\. Cribado Neurocognitivo Rápido \(MoCA/i)).toBeDefined();
      expect(screen.getByText(/Rendimiento neurocognitivo global dentro de los límites normales esperados/i)).toBeDefined();

      // 3. Affective Section VII IS rendered with PHQ-9 ONLY
      const affectiveSection = screen.getByTestId('report-affective-section');
      expect(affectiveSection).toBeDefined();
      expect(screen.getByText(/VII\. Sintomatología Afectiva: Depresión y Ansiedad \(PHQ-9 & GAD-7\)/i)).toBeDefined();
      expect(screen.getByText(/PHQ-9 \(Cuestionario de Salud del Paciente - Depresión\)/i)).toBeDefined();
      expect(screen.queryByText(/GAD-7 \(Trastorno de Ansiedad Generalizada\)/i)).toBeNull();

      // 4. Unadministered sections are strictly omitted
      expect(screen.queryByTestId('report-wechsler-section')).toBeNull();
      expect(screen.queryByText(/II\. Resumen de Puntuaciones Compuestas/i)).toBeNull();
      expect(screen.queryByText(/III\. Puntuaciones Escalares/i)).toBeNull();
      expect(screen.queryByText(/IV\. Interpretación Clínica y Juicio Diagnóstico/i)).toBeNull();
      expect(screen.queryByTestId('report-sdq-section')).toBeNull();
      expect(screen.queryByText(/VI\. Evaluación Conductual y Socioemocional/i)).toBeNull();
      expect(screen.queryByTestId('report-htp-section')).toBeNull();
      expect(screen.queryByText(/VIII\. Evaluación Proyectiva Gráfica HTP/i)).toBeNull();

      // 5. Zero Blank Tables / Zero Empty Rows Verification
      const renderedTables = container.querySelectorAll('table.clinical-table');
      expect(renderedTables.length).toBeGreaterThanOrEqual(2); // Demographics + MoCA + Affective
      renderedTables.forEach((table) => {
        const rows = table.querySelectorAll('tbody tr');
        expect(rows.length).toBeGreaterThan(0);
        rows.forEach((row) => {
          // Assert every row contains meaningful text content
          const text = row.textContent?.trim() || '';
          expect(text.length).toBeGreaterThan(0);
          expect(text).not.toBe('-');
        });
      });
    });

    it('administers ONLY SDQ: verifies that Wechsler, MoCA, Affective, and HTP are strictly omitted', () => {
      const TestSdqOnlyConsumer: React.FC = () => {
        const session = useClinicalSession();

        return h(
          'div',
          null,
          h(
            'button',
            {
              type: 'button',
              'data-testid': 'btn-sdq-only-setup',
              onClick: () => {
                session.clearAllScores();
                session.clearPhq9();
                session.clearGad7();
                session.clearMoca();
                session.clearHtp();

                session.loadSdqSample('normal');
              },
            },
            'Setup SDQ Only'
          ),
          h(ClinicalReportView)
        );
      };

      render(h(ClinicalSessionProvider, null, h(TestSdqOnlyConsumer)));
      fireEvent.click(screen.getByTestId('btn-sdq-only-setup'));

      // Section I (Demographics) and Section VI (SDQ) are present
      expect(screen.getByText(/I\. Datos de Identificación y Filiación Clínica/i)).toBeDefined();
      expect(screen.getByTestId('report-sdq-section')).toBeDefined();
      expect(screen.getByText(/VI\. Evaluación Conductual y Socioemocional \(SDQ/i)).toBeDefined();

      // All others are strictly omitted
      expect(screen.queryByTestId('report-wechsler-section')).toBeNull();
      expect(screen.queryByTestId('report-moca-section')).toBeNull();
      expect(screen.queryByTestId('report-affective-section')).toBeNull();
      expect(screen.queryByTestId('report-htp-section')).toBeNull();
    });
  });

  /* =========================================================================
   * 3. DEONTOLOGICAL SAFETY & 1-CLICK GLOBAL ANONYMIZATION
   * ========================================================================= */
  describe('3. Deontological Safety & 1-Click Global Anonymization', () => {
    it('toggles global anonymization mode and masks patient name with initials across header, card, and report', () => {
      render(h(App));

      // 1. Initial State: Real patient name is displayed
      const initialName = 'Lucas Fernández Gómez';
      expect(screen.getAllByText(new RegExp(initialName, 'i')).length).toBeGreaterThan(0);

      // 2. Click 1-Clic Anonimizar button in navigation
      const anonButtons = screen.getAllByRole('button', { name: /1-Clic Anonimizar/i });
      expect(anonButtons.length).toBeGreaterThan(0);
      fireEvent.click(anonButtons[0]);

      // 3. Name is now anonymized to initials: "L. F. G."
      const expectedInitials = 'L. F. G.';
      expect(screen.getAllByText(expectedInitials).length).toBeGreaterThan(0);

      // Verify the button text changes to active state
      expect(screen.getByText(/Anonimizado \(1-Clic\)/i)).toBeDefined();

      // Navigate to Report view while anonymized
      fireEvent.click(screen.getByRole('button', { name: /Informe Clínico Integrado/i }));

      // Report Demographics Table must display anonymized initials
      expect(screen.getAllByText(expectedInitials).length).toBeGreaterThan(0);

      // 4. Click again to deactivate anonymization
      const restoreButton = screen.getByRole('button', { name: /Anonimizado \(1-Clic\)/i });
      fireEvent.click(restoreButton);

      // 5. Real name is restored
      expect(screen.getAllByText(new RegExp(initialName, 'i')).length).toBeGreaterThan(0);
    });

    it('dynamically computes correct initials for various complex Latin naming conventions', () => {
      expect(anonymizeName('Mateo Valenzuela Ríos')).toBe('M. V. R.');
      expect(anonymizeName('María De Los Ángeles Rodríguez Paz')).toBe('M. D. L. Á. R. P.');
      expect(anonymizeName('Juan Carlos')).toBe('J. C.');
      expect(anonymizeName('Sofía')).toBe('S.');
      expect(anonymizeName('   Santiago   Navarro   ')).toBe('S. N.');
      expect(anonymizeName('')).toBe('');
    });
  });

  /* =========================================================================
   * 4. ADVERSARIAL HARDENING & CLINICAL BOUNDARY INVARIANTS
   * ========================================================================= */
  describe('4. Adversarial Hardening & Clinical Boundary Invariants', () => {
    describe('MoCA Education Adjustment & Capping Invariants', () => {
      it('caps adjusted score at 30 when raw score + adjustment would exceed 30', () => {
        // Raw = 30, education = 10 (<= 12 years -> +1 adjustment)
        const res30 = calculateMoca({
          domains: {
            visuospatialExecutive: 5,
            naming: 3,
            attention: 6,
            language: 3,
            abstraction: 2,
            delayedRecall: 5,
            orientation: 6,
          },
          educationYears: 10,
        });
        expect(res30.rawScore).toBe(30);
        expect(res30.educationAdjustment).toBe(1);
        expect(res30.adjustedScore).toBe(30); // Capped at 30!
        expect(res30.meetsClinicalCutoff).toBe(false);

        // Raw = 29, education = 12 years -> 29 + 1 = 30
        const res29 = calculateMoca({
          domains: {
            visuospatialExecutive: 4,
            naming: 3,
            attention: 6,
            language: 3,
            abstraction: 2,
            delayedRecall: 5,
            orientation: 6,
          },
          educationYears: 12,
        });
        expect(res29.rawScore).toBe(29);
        expect(res29.educationAdjustment).toBe(1);
        expect(res29.adjustedScore).toBe(30);
        expect(res29.meetsClinicalCutoff).toBe(false);
      });

      it('strictly enforces the 12-year boundary threshold: raw 25 + 12 yrs (Normal 26) vs raw 25 + 13 yrs (MCI 25)', () => {
        const domains = {
          visuospatialExecutive: 4,
          naming: 3,
          attention: 5,
          language: 2,
          abstraction: 2,
          delayedRecall: 4,
          orientation: 5,
        }; // raw sum = 25

        // Case A: Education = 12 years (adjustment applied -> 26 Normal)
        const res12 = calculateMoca({ domains, educationYears: 12 });
        expect(res12.rawScore).toBe(25);
        expect(res12.educationAdjustment).toBe(1);
        expect(res12.adjustedScore).toBe(26);
        expect(res12.meetsClinicalCutoff).toBe(false);
        expect(res12.classification).toBe('Normal');

        // Case B: Education = 13 years (NO adjustment -> 25 Deterioro Cognitivo Leve)
        const res13 = calculateMoca({ domains, educationYears: 13 });
        expect(res13.rawScore).toBe(25);
        expect(res13.educationAdjustment).toBe(0);
        expect(res13.adjustedScore).toBe(25);
        expect(res13.meetsClinicalCutoff).toBe(true);
        expect(res13.classification).toBe('Deterioro Cognitivo Leve');
      });
    });

    describe('PHQ-9 Item 9 Suicide Alert Gradient Invariants', () => {
      it('item 9 = 0 does NOT trigger alert, while items 1, 2, 3 trigger alert banner with 024 helpline', () => {
        // Score 0: no alert
        const { container: c0 } = render(h(Phq9SuicideAlertBanner, { item9Score: 0 }));
        expect(c0.firstChild).toBeNull();

        // Score 1: Varios días
        const { unmount: u1 } = render(h(Phq9SuicideAlertBanner, { item9Score: 1 }));
        expect(screen.getByText(/Alerta Deontológica: Riesgo de Autolesión o Ideación Suicida/i)).toBeDefined();
        expect(screen.getByText(/Varios días \(1\)/i)).toBeDefined();
        expect(screen.getByText(/024/i)).toBeDefined();
        u1();

        // Score 2: Más de la mitad de los días
        const { unmount: u2 } = render(h(Phq9SuicideAlertBanner, { item9Score: 2 }));
        expect(screen.getByText(/Más de la mitad de los días \(2\)/i)).toBeDefined();
        u2();

        // Score 3: Casi todos los días
        render(h(Phq9SuicideAlertBanner, { item9Score: 3 }));
        expect(screen.getByText(/Casi todos los días \(3\)/i)).toBeDefined();
      });
    });

    describe('SDQ Item Reversal & Subscale Exclusivity Invariants', () => {
      it('verifies items 7, 11, 14, 21, 25 are reversed deterministically and all others are direct', () => {
        const reversedItems = [7, 11, 14, 21, 25];
        for (let i = 1; i <= 25; i++) {
          if (reversedItems.includes(i)) {
            expect(isSdqItemReversed(i)).toBe(true);
            expect(invertSdqItem(i, 0)).toBe(2);
            expect(invertSdqItem(i, 1)).toBe(1);
            expect(invertSdqItem(i, 2)).toBe(0);
          } else {
            expect(isSdqItemReversed(i)).toBe(false);
            expect(invertSdqItem(i, 0)).toBe(0);
            expect(invertSdqItem(i, 1)).toBe(1);
            expect(invertSdqItem(i, 2)).toBe(2);
          }
        }
      });

      it('guarantees prosocial scale is strictly excluded from Total Difficulties under extreme boundary payloads', () => {
        // Payload with ALL 2s across all 25 items
        const allTwos: Record<number, number> = {};
        for (let i = 1; i <= 25; i++) allTwos[i] = 2;

        const resAllTwos = calculateSdq({ informant: 'parent', responses: allTwos });
        // Reversed items (7, 11, 14, 21, 25) raw=2 -> score=0
        // Conduct: items 5(2), 7(0), 12(2), 18(2), 22(2) = 8
        // Hyperactivity: items 2(2), 10(2), 15(2), 21(0), 25(0) = 6
        // Peer: items 6(2), 11(0), 14(0), 19(2), 23(2) = 6
        // Emotional: items 3(2), 8(2), 13(2), 16(2), 24(2) = 10
        // Prosocial: items 1(2), 4(2), 9(2), 17(2), 20(2) = 10
        // Total Difficulties = 8 + 6 + 6 + 10 = 30
        expect(resAllTwos.totalDifficulties.score).toBe(30);
        expect(resAllTwos.subscales.prosocial.rawScore).toBe(10);
        // Verify prosocial was NOT added: 30 != 40
        expect(resAllTwos.totalDifficulties.score).not.toBe(40);
      });
    });

    describe('HTP Narrative Field Notes Robustness & Special Character Encoding', () => {
      it('safely handles complex punctuation, quotes, and psychiatric shorthand in clinician notes', () => {
        const formalNotes = 'Paciente verbaliza: "No quiero dibujar el techo & la chimenea" (desinterés/oposicionismo <sic>).';
        const complexNotesRecord: HtpAssessmentRecord = {
          ...INITIAL_HTP_RECORD,
          house: {
            ...INITIAL_HTP_RECORD.house,
            observations: "Ventanas 'cerradas a cal y canto'; aislamiento defensivo severo.",
          },
          tree: {
            ...INITIAL_HTP_RECORD.tree,
            observations: 'Corteza desgarrada (traumatismo vital precoz @ 5 años).',
          },
          person: {
            ...INITIAL_HTP_RECORD.person,
            observations: 'Figura sin manos ("no puedo tocar las cosas"); vivencia de castración.',
          },
          generalClinicalNotes: 'Síntesis diagnóstica: F43.1 / F32.1 con defensas disociativas rígidas.',
        };

        const formalSummary = generateFormalSummary(complexNotesRecord.formal, formalNotes);
        const narrative = generateHtpFullReport(complexNotesRecord);

        // All notes must appear cleanly without crashing or dropping content
        expect(formalSummary).toContain('Paciente verbaliza: "No quiero dibujar el techo & la chimenea"');
        expect(narrative.houseAnalysis).toContain("Ventanas 'cerradas a cal y canto'");
        expect(narrative.treeAnalysis).toContain('Corteza desgarrada (traumatismo vital precoz @ 5 años).');
        expect(narrative.personAnalysis).toContain('Figura sin manos ("no puedo tocar las cosas")');
        expect(narrative.integratedConclusion).toContain('Síntesis diagnóstica: F43.1 / F32.1');
      });
    });
  });
});
