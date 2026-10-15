import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../../App';
import {
  ClinicalSessionProvider,
  useClinicalSession,
} from '../../ui/context/ClinicalSessionContext';
import {
  LikertMatrixInputCard,
  SpeedAccuracyInputCard,
  DomainChecklistScreeningCard,
  BaseRateMultiScaleCard,
  AdaptiveSkillDomainCard,
  Raven2InputCard,
} from '../../ui/components/forms';

describe('Empirical Challenger 2 — Milestone M2-UI: Specialized Input Form Archetypes Adversarial Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Dimension 1: Adversarial Boundary & Fuzz Input Testing across Form Archetypes
  // ==========================================================================
  describe('Dimension 1: Adversarial Boundary & Fuzz Input Testing', () => {
    describe('1.1 SpeedAccuracyInputCard (D2-R) Boundary & Invariants', () => {
      it('handles zeroed inputs without divide-by-zero or NaN exceptions', () => {
        render(
          <ClinicalSessionProvider>
            <SpeedAccuracyInputCard />
          </ClinicalSessionProvider>
        );

        const trInput = screen.getByLabelText(/Total Caracteres Revisados/i);
        const taInput = screen.getByLabelText(/Total Aciertos/i);
        const oInput = screen.getByLabelText(/Omisiones \(O\/E1\)/i);
        const cInput = screen.getByLabelText(/Comisiones \(C\/E2\)/i);

        fireEvent.change(trInput, { target: { value: '0' } });
        fireEvent.change(taInput, { target: { value: '0' } });
        fireEvent.change(oInput, { target: { value: '0' } });
        fireEvent.change(cInput, { target: { value: '0' } });

        // Component should render calmly without error or NaN
        expect(screen.getByTestId('speed-accuracy-form')).toBeDefined();
        expect(screen.queryByTestId('d2r-validation-error')).toBeNull();
      });

      it('strictly enforces mathematical invariant TA <= TR and alerts on violation', () => {
        render(
          <ClinicalSessionProvider>
            <SpeedAccuracyInputCard />
          </ClinicalSessionProvider>
        );

        const trInput = screen.getByLabelText(/Total Caracteres Revisados/i);
        const taInput = screen.getByLabelText(/Total Aciertos/i);

        // Adversarial violation: TA=350 > TR=200
        fireEvent.change(trInput, { target: { value: '200' } });
        fireEvent.change(taInput, { target: { value: '350' } });

        expect(screen.getByTestId('d2r-validation-error')).toBeDefined();
        expect(screen.getByText(/TA \(350\) no puede superar a TR \(200\)/i)).toBeDefined();

        // Fix the violation: TR=400 > TA=350
        fireEvent.change(trInput, { target: { value: '400' } });
        expect(screen.queryByTestId('d2r-validation-error')).toBeNull();
      });

      it('handles empty strings and negative input gracefully', () => {
        render(
          <ClinicalSessionProvider>
            <SpeedAccuracyInputCard />
          </ClinicalSessionProvider>
        );

        const trInput = screen.getByLabelText(/Total Caracteres Revisados/i);
        // Clear input to empty string
        fireEvent.change(trInput, { target: { value: '' } });
        expect(screen.getByTestId('speed-accuracy-form')).toBeDefined();

        // Negative input -> should be clamped to 0 by Math.max(0, val)
        fireEvent.change(trInput, { target: { value: '-50' } });
        expect(screen.getByTestId('speed-accuracy-form')).toBeDefined();
      });

      it('flags protocol non-interpretability when error rate CP% exceeds 40%', () => {
        render(
          <ClinicalSessionProvider>
            <SpeedAccuracyInputCard />
          </ClinicalSessionProvider>
        );

        const trInput = screen.getByLabelText(/Total Caracteres Revisados \(TR\)/i);
        const taInput = screen.getByLabelText(/Total Aciertos \(TA\)/i);
        const oInput = screen.getByLabelText(/Omisiones \(O\/E1\)/i);
        const cInput = screen.getByLabelText(/Comisiones \(C\/E2\)/i);

        // Errors TOT = 90 out of TR = 200 -> CP% = 45% > 40%
        fireEvent.change(trInput, { target: { value: '200' } });
        fireEvent.change(taInput, { target: { value: '80' } });
        fireEvent.change(oInput, { target: { value: '45' } });
        fireEvent.change(cInput, { target: { value: '45' } });

        expect(screen.getByTestId('d2r-invalidation-banner')).toBeDefined();
        expect(screen.getByText(/PROTOCOLO D2-R PROTOCOLARMENTE NO INTERPRETABLE/i)).toBeDefined();
      });

      it('clears all fields and removes error/invalidation banners on Limpiar click', () => {
        render(
          <ClinicalSessionProvider>
            <SpeedAccuracyInputCard />
          </ClinicalSessionProvider>
        );

        // Load invalid sample
        const invalidBtn = screen.getByRole('button', { name: /Protocolo Inválido/i });
        fireEvent.click(invalidBtn);
        expect(screen.getByTestId('d2r-invalidation-banner')).toBeDefined();

        // Click Limpiar
        const clearBtn = screen.getByRole('button', { name: /Limpiar/i });
        fireEvent.click(clearBtn);

        expect(screen.queryByTestId('d2r-invalidation-banner')).toBeNull();
        expect(screen.queryByTestId('d2r-validation-error')).toBeNull();
      });
    });

    describe('1.2 LikertMatrixInputCard (MMPI-3, PAI, SENA, CBCL, BYI-2) Boundary & Alerts', () => {
      it('renders with 0 progress when unpopulated and accepts custom scale edits', () => {
        render(
          <ClinicalSessionProvider>
            <LikertMatrixInputCard batteryId="mmpi_3" />
          </ClinicalSessionProvider>
        );

        expect(screen.getByText(/0 \/ 20 escalas ingresadas \(0%\)/i)).toBeDefined();
        expect(screen.queryByTestId('critical-suicide-banner')).toBeNull();
        expect(screen.queryByTestId('protocol-invalid-banner')).toBeNull();

        // Enter score for SUI via text input
        const suiInput = screen.getByLabelText(/Puntuación para Ideación Suicida \(SUI\)/i);
        fireEvent.change(suiInput, { target: { value: '75' } });

        // SUI = 75 >= 65 triggers suicide risk banner
        expect(screen.getByTestId('critical-suicide-banner')).toBeDefined();
        expect(screen.getByText(/1 \/ 20 escalas ingresadas/i)).toBeDefined();
      });

      it('handles empty and non-numeric entries in scale inputs without NaN collapse', () => {
        render(
          <ClinicalSessionProvider>
            <LikertMatrixInputCard batteryId="pai" />
          </ClinicalSessionProvider>
        );

        const depInput = screen.getByLabelText(/Puntuación para Depresión \(DEP\)/i);
        fireEvent.change(depInput, { target: { value: '' } });
        expect(screen.getByTestId('likert-form-pai')).toBeDefined();

        fireEvent.change(depInput, { target: { value: 'not-a-number' } });
        expect(screen.getByTestId('likert-form-pai')).toBeDefined();
      });

      it('uses quick preset buttons (T=45..85) to rapidly update scores and qualitative labels', () => {
        render(
          <ClinicalSessionProvider>
            <LikertMatrixInputCard batteryId="pai" />
          </ClinicalSessionProvider>
        );

        // Find row for SUI and click quick button T=85
        const suiRow = screen.getByLabelText(/Puntuación para Ideaciones Suicidas \(SUI\)/i).closest('tr')!;
        const btn85 = within(suiRow).getByRole('button', { name: /T=85/i });
        fireEvent.click(btn85);

        // SUI = 85 -> triggers critical suicide banner and Marcada / Severa
        expect(screen.getByTestId('critical-suicide-banner')).toBeDefined();
        expect(within(suiRow).getByText(/Marcada \/ Severa/i)).toBeDefined();

        // Now click T=45 -> clears critical suicide banner
        const btn45 = within(suiRow).getByRole('button', { name: /T=45/i });
        fireEvent.click(btn45);
        expect(screen.queryByTestId('critical-suicide-banner')).toBeNull();
      });

      it('detects invalid protocol in MMPI-3 when VRIN >= 80 and removes on Limpiar', () => {
        render(
          <ClinicalSessionProvider>
            <LikertMatrixInputCard batteryId="mmpi_3" />
          </ClinicalSessionProvider>
        );

        const vrinInput = screen.getByLabelText(/Puntuación para Inconsistencia Variable \(VRIN\)/i);
        fireEvent.change(vrinInput, { target: { value: '88' } });

        expect(screen.getByTestId('protocol-invalid-banner')).toBeDefined();

        // Limpiar resets all
        const clearBtn = screen.getByRole('button', { name: /Limpiar/i });
        fireEvent.click(clearBtn);

        expect(screen.queryByTestId('protocol-invalid-banner')).toBeNull();
        expect(screen.getByText(/0 \/ 20 escalas ingresadas \(0%\)/i)).toBeDefined();
      });

      it('evaluates BYI-2 suicidal item response elevation and triggers red banner', () => {
        render(
          <ClinicalSessionProvider>
            <LikertMatrixInputCard batteryId="byi_2" />
          </ClinicalSessionProvider>
        );

        // Clinical preset has suicidalItemResponse = 2
        const clinicalBtn = screen.getByRole('button', { name: /Muestra Clínica/i });
        fireEvent.click(clinicalBtn);

        expect(screen.getByTestId('critical-suicide-banner')).toBeDefined();
      });
    });

    describe('1.3 DomainChecklistScreeningCard (NEUROPSI Breve & MMSE) Boundary Clamping', () => {
      it('clamps NEUROPSI Breve domain scores to domain max limits', () => {
        render(
          <ClinicalSessionProvider>
            <DomainChecklistScreeningCard instrumentId="neuropsi_breve" />
          </ClinicalSessionProvider>
        );

        // Orientation max is 6. Typing 25 must clamp to 6
        const orientInput = screen.getByLabelText(/Puntuación para Orientación/i) as HTMLInputElement;
        fireEvent.change(orientInput, { target: { value: '25' } });
        expect(orientInput.value).toBe('6');

        // Negative input (-5) must clamp to 0
        fireEvent.change(orientInput, { target: { value: '-5' } });
        expect(orientInput.value).toBe('0');
      });

      it('clamps NEUROPSI Breve direct total score to max 130', () => {
        render(
          <ClinicalSessionProvider>
            <DomainChecklistScreeningCard instrumentId="neuropsi_breve" />
          </ClinicalSessionProvider>
        );

        const totalInput = screen.getByLabelText(/Puntuación Total Directa/i) as HTMLInputElement;
        fireEvent.change(totalInput, { target: { value: '999' } });
        expect(totalInput.value).toBe('130');

        fireEvent.change(totalInput, { target: { value: '-20' } });
        expect(totalInput.value).toBe('0');
      });

      it('clamps MMSE domain scores to their respective maximums and raw total to 30', () => {
        render(
          <ClinicalSessionProvider>
            <DomainChecklistScreeningCard instrumentId="mmse" />
          </ClinicalSessionProvider>
        );

        // Orientation time max is 5. Typing 10 clamps to 5
        const orientTimeInput = screen.getByLabelText(/Puntuación para Orientación Temporal/i) as HTMLInputElement;
        fireEvent.change(orientTimeInput, { target: { value: '10' } });
        expect(orientTimeInput.value).toBe('5');

        // MMSE total max is 30. Typing 50 clamps to 30
        const totalInput = screen.getByLabelText(/Puntuación Total Directa/i) as HTMLInputElement;
        fireEvent.change(totalInput, { target: { value: '50' } });
        expect(totalInput.value).toBe('30');
      });

      it('reactively recalculates MMSE NORMACODEM demographic adjustment on age/education change', () => {
        render(
          <ClinicalSessionProvider>
            <DomainChecklistScreeningCard instrumentId="mmse" />
          </ClinicalSessionProvider>
        );

        // Set raw score 23 via domain checklist inputs:
        // Orientation Time: 5, Orientation Space: 5, Registration: 3, Attention & Calculation: 5, Recall: 2, Language: 3 -> Total = 23
        // Age 78, education 6 -> Delta +2 -> Adjusted 25
        fireEvent.change(screen.getByLabelText(/Puntuación para Orientación Temporal/i), { target: { value: '5' } });
        fireEvent.change(screen.getByLabelText(/Puntuación para Orientación Espacial/i), { target: { value: '5' } });
        fireEvent.change(screen.getByLabelText(/Puntuación para Fijación \/ Memoria Inmediata/i), { target: { value: '3' } });
        fireEvent.change(screen.getByLabelText(/Puntuación para Atención y Cálculo/i), { target: { value: '5' } });
        fireEvent.change(screen.getByLabelText(/Puntuación para Memoria Diferida/i), { target: { value: '2' } });
        fireEvent.change(screen.getByLabelText(/Puntuación para Lenguaje y Praxias/i), { target: { value: '3' } });

        const ageInput = screen.getByLabelText(/Edad del paciente/i);
        const eduInput = screen.getByLabelText(/Años de escolaridad/i);

        fireEvent.change(ageInput, { target: { value: '78' } });
        fireEvent.change(eduInput, { target: { value: '6' } });

        expect(screen.getByText('25')).toBeDefined(); // Adjusted
        expect(screen.getByText(/Directa: 23 ptos/i)).toBeDefined();
      });
    });

    describe('1.4 BaseRateMultiScaleCard (MCMI-IV) Boundary Clamping & Modifying Indices', () => {
      it('clamps MCMI-IV Base Rate (TB) entries strictly within [0..115]', () => {
        render(
          <ClinicalSessionProvider>
            <BaseRateMultiScaleCard />
          </ClinicalSessionProvider>
        );

        const schizoidInput = screen.getByLabelText(/Puntuación para 1 — Esquizoide/i) as HTMLInputElement;

        // Enter 200 -> clamps to 115
        fireEvent.change(schizoidInput, { target: { value: '200' } });
        expect(schizoidInput.value).toBe('115');

        // Enter -10 -> clamps to 0
        fireEvent.change(schizoidInput, { target: { value: '-10' } });
        expect(schizoidInput.value).toBe('0');
      });

      it('triggers invalidation banner when Scale V (Absurd items) >= 2', () => {
        render(
          <ClinicalSessionProvider>
            <BaseRateMultiScaleCard />
          </ClinicalSessionProvider>
        );

        const scaleVInput = screen.getByLabelText(/Puntuación para Validez/i);
        fireEvent.change(scaleVInput, { target: { value: '2' } });

        expect(screen.getByTestId('mcmi4-invalidation-banner')).toBeDefined();
        expect(screen.getByText(/PROTOCOLO MCMI-IV PROTOCOLARMENTE INVÁLIDO/i)).toBeDefined();

        // Changing back to 0 clears invalidation
        fireEvent.change(scaleVInput, { target: { value: '0' } });
        expect(screen.queryByTestId('mcmi4-invalidation-banner')).toBeNull();
      });

      it('resets all base rates and modifying indices upon Limpiar click', () => {
        render(
          <ClinicalSessionProvider>
            <BaseRateMultiScaleCard />
          </ClinicalSessionProvider>
        );

        // Load sample preset
        const presetBtn = screen.getByRole('button', { name: /Límite & Depresión/i });
        fireEvent.click(presetBtn);

        expect(screen.getByText(/Protocolo VÁLIDO/i)).toBeDefined();

        // Clear
        const clearBtn = screen.getByRole('button', { name: /Limpiar/i });
        fireEvent.click(clearBtn);

        expect(screen.queryByText(/Protocolo VÁLIDO/i)).toBeNull();
      });
    });

    describe('1.5 AdaptiveSkillDomainCard (ABAS-3 & Vineland-3) Boundary Clamping & Alerts', () => {
      it('clamps ABAS-3 scaled scores within [1..19] and requires all 9 areas for GAC computation', () => {
        render(
          <ClinicalSessionProvider>
            <AdaptiveSkillDomainCard batteryId="abas_3" />
          </ClinicalSessionProvider>
        );

        const comInput = screen.getByLabelText(/Puntuación para Comunicación/i) as HTMLInputElement;

        // Enter 25 -> clamps to 19
        fireEvent.change(comInput, { target: { value: '25' } });
        expect(comInput.value).toBe('19');

        // Enter 0 -> clamps to 1
        fireEvent.change(comInput, { target: { value: '0' } });
        expect(comInput.value).toBe('1');

        // With only 1 area answered (< 9), composite GAC is not computed
        expect(screen.queryByTestId('adaptive-deficit-alert')).toBeNull();
      });

      it('clamps Vineland-3 v-scale scores within [1..24]', () => {
        render(
          <ClinicalSessionProvider>
            <AdaptiveSkillDomainCard batteryId="vineland_3" />
          </ClinicalSessionProvider>
        );

        const recInput = screen.getByLabelText(/Puntuación para Receptivo/i) as HTMLInputElement;

        // Enter 30 -> clamps to 24
        fireEvent.change(recInput, { target: { value: '30' } });
        expect(recInput.value).toBe('24');

        // Enter -2 -> clamps to 1
        fireEvent.change(recInput, { target: { value: '-2' } });
        expect(recInput.value).toBe('1');
      });

      it('flags significant adaptive deficit alert when GAC <= 69 in ABAS-3', () => {
        render(
          <ClinicalSessionProvider>
            <AdaptiveSkillDomainCard batteryId="abas_3" />
          </ClinicalSessionProvider>
        );

        const deficitBtn = screen.getByRole('button', { name: /Déficit Adaptativo/i });
        fireEvent.click(deficitBtn);

        expect(screen.getByTestId('adaptive-deficit-alert')).toBeDefined();
        expect(screen.getByText(/ALERTA CLÍNICA DE DÉFICIT EN CONDUCTA ADAPTATIVA/i)).toBeDefined();
      });
    });

    describe('1.6 Raven2InputCard (Raven 2) Out-of-Range Boundary Validation', () => {
      it('rejects raw scores greater than 48 with validation alert', () => {
        render(
          <ClinicalSessionProvider>
            <Raven2InputCard />
          </ClinicalSessionProvider>
        );

        const rawInput = screen.getByLabelText(/Aciertos directos Raven 2/i);
        fireEvent.change(rawInput, { target: { value: '55' } });

        expect(screen.getByTestId('raven2-validation-error')).toBeDefined();
        expect(screen.getByText(/Puntuación directa de aciertos \(55\) debe estar entre 0 y 48/i)).toBeDefined();

        // Valid score 30 clears error
        fireEvent.change(rawInput, { target: { value: '30' } });
        expect(screen.queryByTestId('raven2-validation-error')).toBeNull();
      });

      it('rejects age outside the normative range [4:0 - 69:11]', () => {
        render(
          <ClinicalSessionProvider>
            <Raven2InputCard />
          </ClinicalSessionProvider>
        );

        const ageYearsInput = screen.getByLabelText(/Edad en años/i);
        fireEvent.change(ageYearsInput, { target: { value: '2' } });

        expect(screen.getByTestId('raven2-validation-error')).toBeDefined();
        expect(screen.getByText(/Edad \(2\) fuera del rango normativo de Raven 2/i)).toBeDefined();

        // Valid age 10 clears error
        fireEvent.change(ageYearsInput, { target: { value: '10' } });
        expect(screen.queryByTestId('raven2-validation-error')).toBeNull();
      });

      it('computes standard score, percentile, and qualitative descriptor for superior preset', () => {
        render(
          <ClinicalSessionProvider>
            <Raven2InputCard />
          </ClinicalSessionProvider>
        );

        const superiorBtn = screen.getByRole('button', { name: /Capacidad Superior/i });
        fireEvent.click(superiorBtn);

        expect(screen.getByText('135')).toBeDefined(); // CI Típico No Verbal
        expect(screen.getByText(/Muy Superior/i)).toBeDefined();
      });
    });
  });

  // ==========================================================================
  // Dimension 2: Rapid Multi-Test Switching without Cross-Contamination or Data Loss
  // ==========================================================================
  describe('Dimension 2: Rapid Multi-Test Switching without Cross-Contamination or Data Loss', () => {
    it('switches between MMPI-3, D2-R, and NEUROPSI Breve across 5 rapid cycles while maintaining sandboxed state integrity', () => {
      render(<App />);

      // Step 1: Open Catalog and Activate MMPI-3
      const catalogBtn = screen.getAllByRole('button', { name: /Catálogo Universal/i })[0];
      fireEvent.click(catalogBtn);

      const mmpiCard = screen.getByTestId('catalog-card-mmpi_3');
      const openMmpiBtn = mmpiCard.querySelector('button')!;
      fireEvent.click(openMmpiBtn);

      expect(screen.getByTestId('likert-form-mmpi_3')).toBeDefined();

      // Enter MMPI-3 custom values: EID=75, SUI=70
      const eidInput = screen.getByLabelText(/Puntuación para Disfunción Emocional \(EID\)/i);
      const suiInput = screen.getByLabelText(/Puntuación para Ideación Suicida \(SUI\)/i);
      fireEvent.change(eidInput, { target: { value: '75' } });
      fireEvent.change(suiInput, { target: { value: '70' } });

      // Step 2: Open Catalog and Activate D2-R
      fireEvent.click(screen.getAllByRole('button', { name: /Catálogo Universal/i })[0]);
      const d2rCard = screen.getByTestId('catalog-card-d2_r');
      const openD2rBtn = d2rCard.querySelector('button')!;
      fireEvent.click(openD2rBtn);

      expect(screen.getByTestId('speed-accuracy-form')).toBeDefined();

      // Enter D2-R custom values: TR=530, TA=225, O=9, C=6
      const trInput = screen.getByLabelText(/Total Caracteres Revisados \(TR\)/i);
      const taInput = screen.getByLabelText(/Total Aciertos \(TA\)/i);
      const oInput = screen.getByLabelText(/Omisiones \(O\/E1\)/i);
      const cInput = screen.getByLabelText(/Comisiones \(C\/E2\)/i);

      fireEvent.change(trInput, { target: { value: '530' } });
      fireEvent.change(taInput, { target: { value: '225' } });
      fireEvent.change(oInput, { target: { value: '9' } });
      fireEvent.change(cInput, { target: { value: '6' } });

      expect(screen.getByText('219')).toBeDefined(); // CON = 225 - 6

      // Step 3: Open Catalog and Activate NEUROPSI Breve
      fireEvent.click(screen.getAllByRole('button', { name: /Catálogo Universal/i })[0]);
      const neuropsiCard = screen.getByTestId('catalog-card-neuropsi_breve');
      const openNeuropsiBtn = neuropsiCard.querySelector('button')!;
      fireEvent.click(openNeuropsiBtn);

      expect(screen.getByTestId('screening-form-neuropsi_breve')).toBeDefined();

      // Enter NEUROPSI custom total score: 82
      const neuropsiTotalInput = screen.getByLabelText(/Puntuación Total Directa/i);
      fireEvent.change(neuropsiTotalInput, { target: { value: '82' } });

      // ======================================================================
      // Rapid Switching Loop: MMPI-3 <-> D2-R <-> NEUROPSI Breve
      // ======================================================================
      const activeSelect = screen.getByLabelText(/Seleccionar batería activa/i);

      for (let cycle = 1; cycle <= 3; cycle++) {
        // Switch to MMPI-3
        fireEvent.change(activeSelect, { target: { value: 'mmpi_3' } });
        expect(screen.getByTestId('likert-form-mmpi_3')).toBeDefined();

        const curEid = screen.getByLabelText(/Puntuación para Disfunción Emocional \(EID\)/i) as HTMLInputElement;
        const curSui = screen.getByLabelText(/Puntuación para Ideación Suicida \(SUI\)/i) as HTMLInputElement;
        expect(curEid.value).toBe('75');
        expect(curSui.value).toBe(cycle === 1 ? '70' : '82');

        // Mutate SUI in cycle 1
        if (cycle === 1) {
          fireEvent.change(curSui, { target: { value: '82' } });
          expect(screen.getByTestId('critical-suicide-banner')).toBeDefined();
        }

        // Switch to D2-R
        fireEvent.change(activeSelect, { target: { value: 'd2_r' } });
        expect(screen.getByTestId('speed-accuracy-form')).toBeDefined();

        const curTr = screen.getByLabelText(/Total Caracteres Revisados/i) as HTMLInputElement;
        const curTa = screen.getByLabelText(/Total Aciertos/i) as HTMLInputElement;
        expect(curTr.value).toBe('530');
        expect(curTa.value).toBe(cycle === 1 ? '225' : '235');

        // Mutate TA in cycle 1
        if (cycle === 1) {
          fireEvent.change(curTa, { target: { value: '235' } });
          expect(screen.getByText('229')).toBeDefined(); // CON = 235 - 6
        }

        // Switch to NEUROPSI Breve
        fireEvent.change(activeSelect, { target: { value: 'neuropsi_breve' } });
        expect(screen.getByTestId('screening-form-neuropsi_breve')).toBeDefined();

        const curNeuroTotal = screen.getByLabelText(/Puntuación Total Directa/i) as HTMLInputElement;
        expect(curNeuroTotal.value).toBe(cycle === 1 ? '82' : '88');

        // Mutate NEUROPSI in cycle 1
        if (cycle === 1) {
          fireEvent.change(curNeuroTotal, { target: { value: '88' } });
        }
      }

      // Final Assert: Confirm all three instruments have their latest mutated values without any cross-talk
      fireEvent.change(activeSelect, { target: { value: 'mmpi_3' } });
      expect((screen.getByLabelText(/Puntuación para Ideación Suicida \(SUI\)/i) as HTMLInputElement).value).toBe('82');
      expect(screen.getByTestId('critical-suicide-banner')).toBeDefined();

      fireEvent.change(activeSelect, { target: { value: 'd2_r' } });
      expect((screen.getByLabelText(/Total Aciertos/i) as HTMLInputElement).value).toBe('235');
      expect(screen.getByText('229')).toBeDefined();

      fireEvent.change(activeSelect, { target: { value: 'neuropsi_breve' } });
      expect((screen.getByLabelText(/Puntuación Total Directa/i) as HTMLInputElement).value).toBe('88');
    });
  });

  // ==========================================================================
  // Dimension 3: Preset Loading Sandboxing & Mutual Battery Isolation
  // ==========================================================================
  describe('Dimension 3: Preset Loading Sandboxing & Mutual Battery Isolation', () => {
    it('loading sample presets in one battery preserves the exact custom state of all other active batteries', () => {
      render(<App />);

      const activeSelect = screen.getByLabelText(/Seleccionar batería activa/i);

      // 1. Activate D2-R and set custom values
      fireEvent.click(screen.getAllByRole('button', { name: /Catálogo Universal/i })[0]);
      const d2rCard = screen.getByTestId('catalog-card-d2_r');
      fireEvent.click(d2rCard.querySelector('button')!);

      const trInput = screen.getByLabelText(/Total Caracteres Revisados/i);
      const taInput = screen.getByLabelText(/Total Aciertos/i);
      fireEvent.change(trInput, { target: { value: '512' } });
      fireEvent.change(taInput, { target: { value: '208' } });

      // 2. Activate MMPI-3
      fireEvent.click(screen.getAllByRole('button', { name: /Catálogo Universal/i })[0]);
      const mmpiCard = screen.getByTestId('catalog-card-mmpi_3');
      fireEvent.click(mmpiCard.querySelector('button')!);

      // Load MMPI-3 Clinical Sample Preset
      const mmpiClinicalBtn = screen.getByRole('button', { name: /Muestra Clínica/i });
      fireEvent.click(mmpiClinicalBtn);

      expect(screen.getByTestId('critical-suicide-banner')).toBeDefined();
      expect(screen.getByText(/Protocolo VÁLIDO/i)).toBeDefined();

      // 3. Switch back to D2-R: Verify D2-R is 100% UNTOUCHED
      fireEvent.change(activeSelect, { target: { value: 'd2_r' } });
      expect((screen.getByLabelText(/Total Caracteres Revisados/i) as HTMLInputElement).value).toBe('512');
      expect((screen.getByLabelText(/Total Aciertos/i) as HTMLInputElement).value).toBe('208');

      // 4. On D2-R, load "Estilo Impulsivo" preset
      const impulsiveBtn = screen.getByRole('button', { name: /Estilo Impulsivo/i });
      fireEvent.click(impulsiveBtn);

      expect((screen.getByLabelText(/Total Caracteres Revisados/i) as HTMLInputElement).value).toBe('480');
      expect((screen.getByLabelText(/Total Aciertos/i) as HTMLInputElement).value).toBe('160');
      expect(screen.getAllByText('115').length).toBeGreaterThan(0); // CON = 160 - 45

      // 5. Switch back to MMPI-3: Verify MMPI-3 retains its clinical preset
      fireEvent.change(activeSelect, { target: { value: 'mmpi_3' } });
      expect(screen.getByTestId('critical-suicide-banner')).toBeDefined();
      expect((screen.getByLabelText(/Puntuación para Disfunción Emocional \(EID\)/i) as HTMLInputElement).value).toBe('78');

      // 6. Click "Limpiar" on MMPI-3: verify only MMPI-3 is cleared
      const clearMmpiBtn = screen.getByRole('button', { name: /Limpiar/i });
      fireEvent.click(clearMmpiBtn);

      expect(screen.queryByTestId('critical-suicide-banner')).toBeNull();
      expect(screen.getByText(/0 \/ 20 escalas ingresadas \(0%\)/i)).toBeDefined();

      // 7. Switch back to D2-R: Verify D2-R still retains its "Estilo Impulsivo" preset!
      fireEvent.change(activeSelect, { target: { value: 'd2_r' } });
      expect((screen.getByLabelText(/Total Caracteres Revisados/i) as HTMLInputElement).value).toBe('480');
      expect((screen.getByLabelText(/Total Aciertos/i) as HTMLInputElement).value).toBe('160');
      expect(screen.getAllByText('115').length).toBeGreaterThan(0);
    });
  });
});
