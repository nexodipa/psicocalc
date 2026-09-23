import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../../App';
import { ClinicalSessionProvider, useClinicalSession } from '../../ui/context/ClinicalSessionContext';
import { Phq9SuicideAlertBanner } from '../../ui/components/clinical/Phq9SuicideAlertBanner';
import { MocaScoreAlert } from '../../ui/components/clinical/MocaScoreAlert';
import { calculateMoca, getMocaEducationAdjustment } from '../../core/engine/clinicalCalculators';

describe('Empirical Challenger 1 — Milestone M7: Multimodal Navigation & Reactive State Persistence', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Dimension 1: Multi-Instrument Session State Persistence across Repeated & Chaos Tab Traversal', () => {
    it('persists custom scores across WISC-V, WAIS-IV, SDQ, PHQ-9, GAD-7, MoCA, and HTP through 12+ navigation hops', () => {
      const { container } = render(<App />);

      // --- 1. ENTER CUSTOM VALUES IN INTELLIGENCE (WISC-V) ---
      const inputS = container.querySelector('#subtest-input-S') as HTMLInputElement;
      const inputV = container.querySelector('#subtest-input-V') as HTMLInputElement;
      const inputC = container.querySelector('#subtest-input-C') as HTMLInputElement;
      const inputPV = container.querySelector('#subtest-input-PV') as HTMLInputElement;
      expect(inputS).not.toBeNull();

      fireEvent.change(inputS, { target: { value: '15' } });
      fireEvent.change(inputV, { target: { value: '14' } });
      fireEvent.change(inputC, { target: { value: '12' } });
      fireEvent.change(inputPV, { target: { value: '16' } });

      expect(inputS.value).toBe('15');
      expect(inputV.value).toBe('14');
      expect(inputC.value).toBe('12');
      expect(inputPV.value).toBe('16');

      // --- 2. SWITCH TO WAIS-IV AND ENTER DISTINCT SCORES ---
      const waisBtn = screen.getByRole('button', { name: /^WAIS-IV/i });
      fireEvent.click(waisBtn);

      const inputWaisC = container.querySelector('#subtest-input-WAIS_C') as HTMLInputElement;
      const inputWaisV = container.querySelector('#subtest-input-WAIS_V') as HTMLInputElement;
      expect(inputWaisC).not.toBeNull();

      fireEvent.change(inputWaisC, { target: { value: '17' } });
      fireEvent.change(inputWaisV, { target: { value: '18' } });

      expect(inputWaisC.value).toBe('17');
      expect(inputWaisV.value).toBe('18');

      // Switch back to WISC-V to verify independent retention
      const wiscBtn = screen.getByRole('button', { name: /^WISC-V/i });
      fireEvent.click(wiscBtn);

      const recheckedInputS = container.querySelector('#subtest-input-S') as HTMLInputElement;
      expect(recheckedInputS.value).toBe('15');

      // --- 3. NAVIGATE TO CONDUCTA & EMOCIÓN (SDQ) ---
      const behaviorTab = screen.getByRole('button', { name: /Conducta & Emoción/i });
      fireEvent.click(behaviorTab);

      expect(screen.getByTestId('behavior-module')).toBeDefined();
      expect(screen.getByTestId('sdq-input-card')).toBeDefined();

      // Change informant to teacher
      const informantSelect = screen.getByLabelText(/Versión \/ Informante del Protocolo/i) as HTMLSelectElement;
      fireEvent.change(informantSelect, { target: { value: 'teacher' } });
      expect(informantSelect.value).toBe('teacher');

      // Click "Ejemplo Normal" first to populate full valid 25 items
      const sdqNormalPreset = screen.getByRole('button', { name: /Ejemplo Normal/i });
      fireEvent.click(sdqNormalPreset);
      expect(screen.getByText(/25 \/ 25/i)).toBeDefined();

      // Now customize item 1 to value 2 using the item badge
      const sdqCard = screen.getByTestId('sdq-input-card');
      const sdqBadges = sdqCard.querySelectorAll('span.w-6.h-6');
      expect(sdqBadges.length).toBe(25);
      const item1Row = sdqBadges[0].closest('div.p-3') as HTMLElement;
      expect(item1Row).not.toBeNull();
      const item1Btn2 = within(item1Row).getByRole('button', { name: /2/ });
      fireEvent.click(item1Btn2);
      expect(item1Btn2.getAttribute('aria-pressed')).toBe('true');

      // --- 4. SUB-TAB PHQ-9 ---
      const phq9Tab = screen.getByRole('button', { name: /PHQ-9/i });
      fireEvent.click(phq9Tab);

      expect(screen.getByTestId('phq9-input-card')).toBeDefined();
      const phq9Card = screen.getByTestId('phq9-input-card');

      // Load moderate sample
      const phq9ModBtn = within(phq9Card).getByRole('button', { name: /Moderada/i });
      fireEvent.click(phq9ModBtn);

      // Customize Item 9 to 2 (suicide alert)
      const phqBadges = phq9Card.querySelectorAll('span.w-6.h-6');
      expect(phqBadges.length).toBe(9);
      const item9Row = phqBadges[8].closest('div.p-3\\.5') as HTMLElement;
      expect(item9Row).not.toBeNull();
      const item9Btn2 = within(item9Row).getByRole('button', { name: /2/ });
      fireEvent.click(item9Btn2);
      expect(item9Btn2.getAttribute('aria-pressed')).toBe('true');
      expect(screen.getByTestId('phq9-suicide-alert-banner')).toBeDefined();

      // --- 5. SUB-TAB GAD-7 ---
      const gad7Tab = screen.getByRole('button', { name: /GAD-7/i });
      fireEvent.click(gad7Tab);

      expect(screen.getByTestId('gad7-input-card')).toBeDefined();
      const gad7Card = screen.getByTestId('gad7-input-card');

      // Load severe sample
      const gad7SevBtn = within(gad7Card).getByRole('button', { name: /Severa/i });
      fireEvent.click(gad7SevBtn);
      expect(screen.getByText(/7 \/ 7 ítems/i)).toBeDefined();

      // --- 6. NAVIGATE TO CRIBADO NEUROCOGNITIVO (MoCA) ---
      const neuroTab = screen.getByRole('button', { name: /Cribado Neurocognitivo/i });
      fireEvent.click(neuroTab);

      expect(screen.getByTestId('neurocognitive-module')).toBeDefined();
      expect(screen.getByTestId('moca-input-card')).toBeDefined();
      const mocaCard = screen.getByTestId('moca-input-card');

      // Set education to 8 years
      const edInput = mocaCard.querySelector('#moca-education-years') as HTMLInputElement;
      expect(edInput).not.toBeNull();
      fireEvent.change(edInput, { target: { value: '8' } });
      expect(edInput.value).toBe('8');

      // Load normal sample then customize
      const mocaNormalBtn = within(mocaCard).getByRole('button', { name: /Ejemplo Normal/i });
      fireEvent.click(mocaNormalBtn);

      // Visoespacial: set to 4
      const visuoHeading = within(mocaCard).getByText('Visoespacial / Ejecutiva');
      const visuoRow = visuoHeading.closest('div.p-3\\.5') as HTMLElement;
      const visuoBtn4 = within(visuoRow).getByRole('button', { name: '4' });
      fireEvent.click(visuoBtn4);
      expect(visuoBtn4.getAttribute('aria-pressed')).toBe('true');

      // --- 7. NAVIGATE TO EVALUACIÓN PROYECTIVA (HTP) ---
      const projTab = screen.getByRole('button', { name: /Evaluación Proyectiva/i });
      fireEvent.click(projTab);

      expect(screen.getByTestId('projective-module')).toBeDefined();

      // Select Macrografía for formal size (QualitativeChipGroup renders role="radio")
      const macroRadio = screen.getByRole('radio', { name: /Macrografía/i });
      fireEvent.click(macroRadio);
      expect(macroRadio.getAttribute('aria-checked')).toBe('true');

      // Navigate to Casa tab and set custom observations
      const casaSubTab = screen.getByRole('tab', { name: /Casa/i });
      fireEvent.click(casaSubTab);

      const casaTextarea = screen.getByPlaceholderText(/El sujeto comenzó dibujando una puerta pequeña/i) as HTMLTextAreaElement;
      expect(casaTextarea).not.toBeNull();
      fireEvent.change(casaTextarea, { target: { value: 'Observación pericial personalizada M7: Límites firmes y buena integración.' } });
      expect(casaTextarea.value).toBe('Observación pericial personalizada M7: Límites firmes y buena integración.');

      // --- 8. CHAOS & REPETITIVE TAB TRAVERSAL (12 HOPS) ---
      const intelTab = screen.getByRole('button', { name: /Inteligencia & Cognición/i });
      const reportTab = screen.getByRole('button', { name: /Informe Clínico Integrado/i });

      // Hop 1: Projective -> Report
      fireEvent.click(reportTab);
      expect(screen.getByTestId('report-wechsler-section')).toBeDefined();
      expect(screen.getByTestId('report-suicide-alert')).toBeDefined();

      // Hop 2: Report -> Intelligence
      fireEvent.click(intelTab);
      expect(screen.getByTestId('intelligence-module')).toBeDefined();

      // Hop 3: Intelligence -> Behavior & Emotion
      fireEvent.click(behaviorTab);
      expect(screen.getByTestId('behavior-module')).toBeDefined();

      // Hop 4: Behavior & Emotion -> Neurocognitive
      fireEvent.click(neuroTab);
      expect(screen.getByTestId('neurocognitive-module')).toBeDefined();

      // Hop 5: Neurocognitive -> Projective
      fireEvent.click(projTab);
      expect(screen.getByTestId('projective-module')).toBeDefined();

      // Hop 6: Projective -> Intelligence
      fireEvent.click(intelTab);
      expect(screen.getByTestId('intelligence-module')).toBeDefined();

      // Hop 7: Intelligence -> Neurocognitive
      fireEvent.click(neuroTab);
      expect(screen.getByTestId('neurocognitive-module')).toBeDefined();

      // Hop 8: Neurocognitive -> Behavior & Emotion
      fireEvent.click(behaviorTab);
      expect(screen.getByTestId('behavior-module')).toBeDefined();

      // Hop 9: Behavior & Emotion -> Report
      fireEvent.click(reportTab);
      expect(screen.getByTestId('report-wechsler-section')).toBeDefined();

      // Hop 10: Report -> Projective
      fireEvent.click(projTab);
      expect(screen.getByTestId('projective-module')).toBeDefined();

      // Hop 11: Projective -> Behavior & Emotion
      fireEvent.click(behaviorTab);
      expect(screen.getByTestId('behavior-module')).toBeDefined();

      // Hop 12: Behavior & Emotion -> Intelligence
      fireEvent.click(intelTab);
      expect(screen.getByTestId('intelligence-module')).toBeDefined();

      // --- 9. VERIFY 100% USER INPUT INTEGRITY AFTER CHAOS TRAVERSAL ---

      // A. Verify Intelligence (WISC-V)
      const finalInputS = container.querySelector('#subtest-input-S') as HTMLInputElement;
      const finalInputV = container.querySelector('#subtest-input-V') as HTMLInputElement;
      const finalInputC = container.querySelector('#subtest-input-C') as HTMLInputElement;
      const finalInputPV = container.querySelector('#subtest-input-PV') as HTMLInputElement;

      expect(finalInputS.value).toBe('15');
      expect(finalInputV.value).toBe('14');
      expect(finalInputC.value).toBe('12');
      expect(finalInputPV.value).toBe('16');

      // Switch to WAIS-IV and verify independent persistence
      const finalWaisBtn = screen.getByRole('button', { name: /^WAIS-IV/i });
      fireEvent.click(finalWaisBtn);
      const finalInputWaisC = container.querySelector('#subtest-input-WAIS_C') as HTMLInputElement;
      const finalInputWaisV = container.querySelector('#subtest-input-WAIS_V') as HTMLInputElement;
      expect(finalInputWaisC.value).toBe('17');
      expect(finalInputWaisV.value).toBe('18');

      // B. Verify Behavior & Emotion: SDQ, PHQ-9, GAD-7
      fireEvent.click(behaviorTab);

      // Check GAD-7 (switch to it)
      const finalGad7Tab = screen.getByRole('button', { name: /GAD-7/i });
      fireEvent.click(finalGad7Tab);
      expect(screen.getByText(/7 \/ 7 ítems/i)).toBeDefined();

      // Check PHQ-9
      const finalPhq9Tab = screen.getByRole('button', { name: /PHQ-9/i });
      fireEvent.click(finalPhq9Tab);
      expect(screen.getByTestId('phq9-suicide-alert-banner')).toBeDefined();
      const finalPhq9Card = screen.getByTestId('phq9-input-card');
      const finalPhqBadges = finalPhq9Card.querySelectorAll('span.w-6.h-6');
      const finalItem9Row = finalPhqBadges[8].closest('div.p-3\\.5') as HTMLElement;
      const finalItem9Btn2 = within(finalItem9Row).getByRole('button', { name: /2/ });
      expect(finalItem9Btn2.getAttribute('aria-pressed')).toBe('true');

      // Check SDQ
      const finalSdqTab = screen.getByRole('button', { name: /SDQ/i });
      fireEvent.click(finalSdqTab);
      const finalInformantSelect = screen.getByLabelText(/Versión \/ Informante del Protocolo/i) as HTMLSelectElement;
      expect(finalInformantSelect.value).toBe('teacher');
      const finalSdqCard = screen.getByTestId('sdq-input-card');
      const finalSdqBadges = finalSdqCard.querySelectorAll('span.w-6.h-6');
      const finalItem1Row = finalSdqBadges[0].closest('div.p-3') as HTMLElement;
      const finalItem1Btn2 = within(finalItem1Row).getByRole('button', { name: /2/ });
      expect(finalItem1Btn2.getAttribute('aria-pressed')).toBe('true');

      // C. Verify Neurocognitive (MoCA)
      fireEvent.click(neuroTab);
      const finalEdInput = screen.getByLabelText(/Años de Escolaridad Formal del Evaluado/i) as HTMLInputElement;
      expect(finalEdInput.value).toBe('8');

      const finalMocaCard = screen.getByTestId('moca-input-card');
      const finalVisuoHeading = within(finalMocaCard).getByText('Visoespacial / Ejecutiva');
      const finalVisuoRow = finalVisuoHeading.closest('div.p-3\\.5') as HTMLElement;
      const finalVisuoBtn4 = within(finalVisuoRow).getByRole('button', { name: '4' });
      expect(finalVisuoBtn4.getAttribute('aria-pressed')).toBe('true');

      // D. Verify Projective (HTP)
      fireEvent.click(projTab);
      const finalMacroRadio = screen.getByRole('radio', { name: /Macrografía/i });
      expect(finalMacroRadio.getAttribute('aria-checked')).toBe('true');

      const finalCasaSubTab = screen.getByRole('tab', { name: /Casa/i });
      fireEvent.click(finalCasaSubTab);
      const finalCasaTextarea = screen.getByPlaceholderText(/El sujeto comenzó dibujando una puerta pequeña/i) as HTMLTextAreaElement;
      expect(finalCasaTextarea.value).toBe('Observación pericial personalizada M7: Límites firmes y buena integración.');

      // E. Verify Clinical Report View has rendered all active sections
      fireEvent.click(reportTab);
      expect(screen.getByTestId('report-wechsler-section')).toBeDefined();
      expect(screen.getByTestId('report-moca-section')).toBeDefined();
      expect(screen.getByTestId('report-sdq-section')).toBeDefined();
      expect(screen.getByTestId('report-affective-section')).toBeDefined();
      expect(screen.getByTestId('report-suicide-alert')).toBeDefined();
      expect(screen.getByTestId('report-htp-section')).toBeDefined();
    });
  });

  describe('Dimension 2: Phq9SuicideAlertBanner Reactivity & Deontological Protocol Invariants', () => {
    it('returns null and does not mount when item9Score is 0 or negative', () => {
      const { container, rerender } = render(<Phq9SuicideAlertBanner item9Score={0} />);
      expect(container.firstChild).toBeNull();
      expect(screen.queryByTestId('phq9-suicide-alert-banner')).toBeNull();

      rerender(<Phq9SuicideAlertBanner item9Score={-1} />);
      expect(container.firstChild).toBeNull();
      expect(screen.queryByTestId('phq9-suicide-alert-banner')).toBeNull();
    });

    it('mounts immediately with correct severity text and deontological protocol for scores 1, 2, and 3', () => {
      const { rerender } = render(<Phq9SuicideAlertBanner item9Score={1} />);

      const banner = screen.getByTestId('phq9-suicide-alert-banner');
      expect(banner).toBeDefined();
      expect(screen.getByText(/Alerta Deontológica: Riesgo de Autolesión o Ideación Suicida/i)).toBeDefined();
      expect(screen.getByText(/Varios días \(1\)/i)).toBeDefined();
      expect(screen.getByText(/Protocolo de Actuación Pericial y Asistencial Obligatorio/i)).toBeDefined();
      expect(screen.getByText(/Línea 024 de Atención a la Conducta Suicida/i)).toBeDefined();

      // Transition to score 2
      rerender(<Phq9SuicideAlertBanner item9Score={2} />);
      expect(screen.getByText(/Más de la mitad de los días \(2\)/i)).toBeDefined();

      // Transition to score 3
      rerender(<Phq9SuicideAlertBanner item9Score={3} />);
      expect(screen.getByText(/Casi todos los días \(3\)/i)).toBeDefined();

      // Transition back to 0 -> must immediately unmount
      rerender(<Phq9SuicideAlertBanner item9Score={0} />);
      expect(screen.queryByTestId('phq9-suicide-alert-banner')).toBeNull();
    });

    it('reactively toggles banner in full App and synchronizes navigation badge and report banner', () => {
      render(<App />);

      // Navigate to Conducta & Emoción -> PHQ-9
      const behaviorTab = screen.getByRole('button', { name: /Conducta & Emoción/i });
      fireEvent.click(behaviorTab);
      const phq9Tab = screen.getByRole('button', { name: /PHQ-9/i });
      fireEvent.click(phq9Tab);

      // Populate complete PHQ-9 with minimal (all 0s) to administer test
      const initialPhq9Card = screen.getByTestId('phq9-input-card');
      const minimalBtn = within(initialPhq9Card).getByRole('button', { name: /Normal \(0-4\)/i });
      fireEvent.click(minimalBtn);

      // Verify no banner initially
      expect(screen.queryByTestId('phq9-suicide-alert-banner')).toBeNull();
      expect(screen.queryByTitle(/Alerta Crítica: Ideación suicida detectada en Ítem 9 de PHQ-9/i)).toBeNull();

      // Verify Report view does not have suicide alert initially
      const reportTab = screen.getByRole('button', { name: /Informe Clínico Integrado/i });
      fireEvent.click(reportTab);
      expect(screen.getByTestId('report-affective-section')).toBeDefined();
      expect(screen.queryByTestId('report-suicide-alert')).toBeNull();

      // Navigate back to PHQ-9
      fireEvent.click(behaviorTab);

      // Re-query fresh mounted phq9Card
      const activePhqCard = screen.getByTestId('phq9-input-card');
      const phqBadges = activePhqCard.querySelectorAll('span.w-6.h-6');
      expect(phqBadges.length).toBe(9);
      const item9Row = phqBadges[8].closest('div.p-3\\.5') as HTMLElement;
      expect(item9Row).not.toBeNull();

      // 1. Toggle Item 9 to 1: Banner mounts immediately, category tab shows pulsing alert
      const btn1 = within(item9Row).getByRole('button', { name: /1/ });
      fireEvent.click(btn1);
      expect(screen.getByTestId('phq9-suicide-alert-banner')).toBeDefined();
      expect(screen.getByText(/Varios días \(1\)/i)).toBeDefined();
      // Multimodal category button shows ALERTA badge
      expect(screen.getByTitle(/Alerta Crítica: Ideación suicida detectada en Ítem 9 de PHQ-9/i)).toBeDefined();

      // 2. Toggle Item 9 to 2: Updates severity text
      const btn2 = within(item9Row).getByRole('button', { name: /2/ });
      fireEvent.click(btn2);
      expect(screen.getByText(/Más de la mitad de los días \(2\)/i)).toBeDefined();

      // 3. Toggle Item 9 to 3: Updates severity text
      const btn3 = within(item9Row).getByRole('button', { name: /3/ });
      fireEvent.click(btn3);
      expect(screen.getByText(/Casi todos los días \(3\)/i)).toBeDefined();

      // 4. Navigate to Report: Critical suicide banner is rendered in the formal report
      fireEvent.click(reportTab);
      expect(screen.getByTestId('report-suicide-alert')).toBeDefined();

      // 5. Navigate back to PHQ-9 and set Item 9 back to 0:
      fireEvent.click(behaviorTab);
      const remountedPhqCard = screen.getByTestId('phq9-input-card');
      const remountedBadges = remountedPhqCard.querySelectorAll('span.w-6.h-6');
      const remountedItem9Row = remountedBadges[8].closest('div.p-3\\.5') as HTMLElement;
      const btn0 = within(remountedItem9Row).getByRole('button', { name: /0/ });
      fireEvent.click(btn0);

      // Banner unmounts immediately
      expect(screen.queryByTestId('phq9-suicide-alert-banner')).toBeNull();
      // Category alert badge removed
      expect(screen.queryByTitle(/Alerta Crítica: Ideación suicida detectada en Ítem 9 de PHQ-9/i)).toBeNull();

      // 6. Navigate to Report: Critical suicide banner must be gone from report too
      fireEvent.click(reportTab);
      expect(screen.queryByTestId('report-suicide-alert')).toBeNull();
    });
  });

  describe('Dimension 3: MoCA Education Adjustment Rule & Cutoff Boundary Invariants', () => {
    it('applies Nasreddine rule strictly: +1 if education <= 12, 0 if education > 12', () => {
      // Test all education values from 0 to 20
      for (let ed = 0; ed <= 12; ed++) {
        expect(getMocaEducationAdjustment(ed)).toBe(1);
      }
      for (let ed = 13; ed <= 25; ed++) {
        expect(getMocaEducationAdjustment(ed)).toBe(0);
      }
    });

    it('strictly caps adjusted score at 30 when raw score + adjustment would exceed 30', () => {
      const domainsMax = {
        visuospatialExecutive: 5,
        naming: 3,
        attention: 6,
        language: 3,
        abstraction: 2,
        delayedRecall: 5,
        orientation: 6,
      };

      // Raw score 30 + 1 (ed 10) must cap at 30
      const resultMax = calculateMoca({ domains: domainsMax, educationYears: 10 });
      expect(resultMax.rawScore).toBe(30);
      expect(resultMax.educationAdjustment).toBe(1);
      expect(resultMax.adjustedScore).toBe(30);
      expect(resultMax.meetsClinicalCutoff).toBe(false);
      expect(resultMax.classification).toBe('Normal');

      // Raw score 29 + 1 (ed 12) must cap at 30
      const domains29 = { ...domainsMax, delayedRecall: 4 };
      const result29 = calculateMoca({ domains: domains29, educationYears: 12 });
      expect(result29.rawScore).toBe(29);
      expect(result29.educationAdjustment).toBe(1);
      expect(result29.adjustedScore).toBe(30);
    });

    it('validates critical clinical cutoff at 25 vs 26 boundary', () => {
      // 1. Raw 24, Ed 12 -> 24 + 1 = 25 (< 26, meets cutoff)
      const res25 = calculateMoca({
        domains: {
          visuospatialExecutive: 4,
          naming: 2,
          attention: 5,
          language: 2,
          abstraction: 2,
          delayedRecall: 4,
          orientation: 5,
        },
        educationYears: 12,
      });
      expect(res25.rawScore).toBe(24);
      expect(res25.educationAdjustment).toBe(1);
      expect(res25.adjustedScore).toBe(25);
      expect(res25.meetsClinicalCutoff).toBe(true);
      expect(res25.classification).toBe('Deterioro Cognitivo Leve');

      // 2. Raw 25, Ed 12 -> 25 + 1 = 26 (>= 26, normal)
      const res26 = calculateMoca({
        domains: {
          visuospatialExecutive: 5,
          naming: 2,
          attention: 5,
          language: 2,
          abstraction: 2,
          delayedRecall: 4,
          orientation: 5,
        },
        educationYears: 12,
      });
      expect(res26.rawScore).toBe(25);
      expect(res26.educationAdjustment).toBe(1);
      expect(res26.adjustedScore).toBe(26);
      expect(res26.meetsClinicalCutoff).toBe(false);
      expect(res26.classification).toBe('Normal');

      // 3. Raw 25, Ed 13 -> 25 + 0 = 25 (< 26, meets cutoff due to NO adjustment)
      const res25NoAdj = calculateMoca({
        domains: {
          visuospatialExecutive: 5,
          naming: 2,
          attention: 5,
          language: 2,
          abstraction: 2,
          delayedRecall: 4,
          orientation: 5,
        },
        educationYears: 13,
      });
      expect(res25NoAdj.rawScore).toBe(25);
      expect(res25NoAdj.educationAdjustment).toBe(0);
      expect(res25NoAdj.adjustedScore).toBe(25);
      expect(res25NoAdj.meetsClinicalCutoff).toBe(true);
      expect(res25NoAdj.classification).toBe('Deterioro Cognitivo Leve');
    });

    it('renders MocaScoreAlert reactively in the UI and synchronizes with education input changes', () => {
      render(<App />);

      // Navigate to Cribado Neurocognitivo (MoCA)
      const neuroTab = screen.getByRole('button', { name: /Cribado Neurocognitivo/i });
      fireEvent.click(neuroTab);

      const mocaCard = screen.getByTestId('moca-input-card');
      const edInput = mocaCard.querySelector('#moca-education-years') as HTMLInputElement;

      // Load DCL sample: raw = 18, ed = 12 -> adjusted = 19 (< 26)
      const dclSampleBtn = within(mocaCard).getByRole('button', { name: /Ejemplo DCL/i });
      fireEvent.click(dclSampleBtn);

      expect(screen.getByTestId('moca-score-alert')).toBeDefined();
      expect(screen.getByText(/Alerta de Cribado Neurocognitivo \(Puntuación < 26\)/i)).toBeDefined();
      expect(screen.getByText(/Ajuste por escolaridad aplicado \(\+1 punto por escolaridad ≤ 12 años\)/i)).toBeDefined();
      // Category tab shows <26 badge
      expect(screen.getByTitle(/Alerta Neurocognitiva: MoCA < 26/i)).toBeDefined();

      // Change education to 16 years -> adjustment becomes 0
      fireEvent.change(edInput, { target: { value: '16' } });
      expect(edInput.value).toBe('16');
      expect(screen.getByText(/Sin ajuste de escolaridad aplicado \(escolaridad > 12 años\)/i)).toBeDefined();

      // Load Normal sample: raw = 29, ed = 16 -> adjusted = 29 (>= 26)
      const normalSampleBtn = within(mocaCard).getByRole('button', { name: /Ejemplo Normal/i });
      fireEvent.click(normalSampleBtn);

      // Status becomes normal, alert banner unmounts
      expect(screen.getByText(/Cribado Neurocognitivo Normal \(Puntuación ≥ 26\)/i)).toBeDefined();
      expect(screen.queryByTitle(/Alerta Neurocognitiva: MoCA < 26/i)).toBeNull();
    });
  });
});
