import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../App';
import { ClinicalSessionProvider, useClinicalSession } from '../../ui/context/ClinicalSessionContext';
import { Phq9SuicideAlertBanner } from '../../ui/components/clinical/Phq9SuicideAlertBanner';
import { MocaScoreAlert } from '../../ui/components/clinical/MocaScoreAlert';
import { SdqProfileBarChart } from '../../ui/components/clinical/SdqProfileBarChart';
import { ClinicalReportView } from '../../ui/components/report/ClinicalReportView';
import { calculateSdq } from '../../core/engine/clinicalCalculators';

describe('Multimodal Navigation, Reactive Visuals & Clinical Report Suite (R3)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Multimodal Category & Tab Traversal with State Persistence', () => {
    it('mounts App with MultimodalNav and allows navigating across all 4 categories and report', () => {
      render(<App />);

      // Verify category navigation buttons are present
      expect(screen.getByRole('button', { name: /Inteligencia & Cognición/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Conducta & Emoción/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Cribado Neurocognitivo/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Evaluación Proyectiva/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Informe Clínico Integrado/i })).toBeDefined();

      // Starts in Intelligence category (WISC-V)
      expect(screen.getByTestId('intelligence-module')).toBeDefined();
    });

    it('preserves user input state when switching between instruments without data loss', () => {
      render(<App />);

      // 1. In Intelligence (WISC-V), check initial inputs exist
      const initialInputs = screen.getAllByDisplayValue('11');
      expect(initialInputs.length).toBeGreaterThanOrEqual(1);

      // 2. Navigate to Conducta & Emoción (SDQ by default)
      const behaviorTab = screen.getByRole('button', { name: /Conducta & Emoción/i });
      fireEvent.click(behaviorTab);

      expect(screen.getByTestId('behavior-module')).toBeDefined();
      expect(screen.getByTestId('sdq-input-card')).toBeDefined();

      // Load SDQ sample
      const sdqSampleBtn = screen.getByRole('button', { name: /Ejemplo Normal/i });
      fireEvent.click(sdqSampleBtn);

      // Verify SDQ has 25 answered items
      expect(screen.getAllByText(/25 \/ 25/i).length).toBeGreaterThan(0);

      // 3. Switch to PHQ-9 inside Conducta & Emoción
      const phq9Tab = screen.getByRole('button', { name: /PHQ-9/i });
      fireEvent.click(phq9Tab);

      expect(screen.getByTestId('phq9-input-card')).toBeDefined();
      // Load moderate depression sample
      const phq9ModerateBtn = screen.getByRole('button', { name: /Moderada/i });
      fireEvent.click(phq9ModerateBtn);
      // Score 11 present
      expect(screen.getAllByText('11').length).toBeGreaterThan(0);

      // 4. Switch to Neurocognitivo (MoCA)
      const neuroTab = screen.getByRole('button', { name: /Cribado Neurocognitivo/i });
      fireEvent.click(neuroTab);

      expect(screen.getByTestId('neurocognitive-module')).toBeDefined();
      expect(screen.getByTestId('moca-input-card')).toBeDefined();

      // Load Normal MoCA sample
      const mocaSampleBtn = screen.getByRole('button', { name: /Ejemplo Normal/i });
      fireEvent.click(mocaSampleBtn);
      expect(screen.getAllByText(/29/i).length).toBeGreaterThan(0);

      // 5. Navigate back to Intelligence
      const intelTab = screen.getByRole('button', { name: /Inteligencia & Cognición/i });
      fireEvent.click(intelTab);

      // Verify WISC-V input was preserved
      expect(screen.getByTestId('intelligence-module')).toBeDefined();
      expect(screen.getAllByDisplayValue('11').length).toBeGreaterThanOrEqual(1);

      // 6. Navigate back to Conducta & Emoción (PHQ-9)
      fireEvent.click(behaviorTab);
      // Verify PHQ-9 maintained its score of 11
      expect(screen.getAllByText('11').length).toBeGreaterThan(0);

      // 7. Check SDQ sub-tab
      const sdqTab = screen.getByRole('button', { name: /SDQ/i });
      fireEvent.click(sdqTab);
      // Verify SDQ still has 25/25 items
      expect(screen.getAllByText(/25 \/ 25/i).length).toBeGreaterThan(0);

      // 8. Check MoCA
      fireEvent.click(neuroTab);
      expect(screen.getAllByText(/29/i).length).toBeGreaterThan(0);
    });

    it('preserves independent state between WISC-V and WAIS-IV without overwriting', () => {
      render(<App />);

      // In WISC-V, default Semejanzas = 11
      const initialWiscInputs = screen.getAllByDisplayValue('11');
      expect(initialWiscInputs.length).toBeGreaterThanOrEqual(1);

      // Switch to WAIS-IV
      const waisBtn = screen.getByRole('button', { name: /^WAIS-IV/i });
      fireEvent.click(waisBtn);

      // In WAIS-IV, load Gifted sample (button is named "Altas Cap.")
      const sampleBtn = screen.getByRole('button', { name: /Altas Cap\./i });
      fireEvent.click(sampleBtn);
      // WAIS Vocabulario = 16
      expect(screen.getAllByDisplayValue('16').length).toBeGreaterThan(0);

      // Switch back to WISC-V
      const wiscBtn = screen.getByRole('button', { name: /^WISC-V/i });
      fireEvent.click(wiscBtn);

      // Semejanzas 11 should still be present in WISC-V!
      expect(screen.getAllByDisplayValue('11').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('2. PHQ-9 Critical Suicide Alert Banner (Item 9 >= 1)', () => {
    it('does not render alert banner when item 9 is 0', () => {
      const { container } = render(<Phq9SuicideAlertBanner item9Score={0} />);
      expect(container.firstChild).toBeNull();
      expect(screen.queryByTestId('phq9-suicide-alert-banner')).toBeNull();
    });

    it('renders prominent red alert banner when item 9 = 1 with mandatory deontological protocol', () => {
      render(<Phq9SuicideAlertBanner item9Score={1} />);

      const banner = screen.getByTestId('phq9-suicide-alert-banner');
      expect(banner).toBeDefined();
      expect(screen.getByText(/Alerta Deontológica: Riesgo de Autolesión o Ideación Suicida/i)).toBeDefined();
      expect(screen.getByText(/Varios días \(1\)/i)).toBeDefined();
      expect(screen.getByText(/Protocolo de Actuación Pericial y Asistencial Obligatorio/i)).toBeDefined();
      expect(screen.getByText(/Línea 024 de Atención a la Conducta Suicida/i)).toBeDefined();
    });

    it('renders alert banner for item 9 = 2 and 3', () => {
      const { rerender } = render(<Phq9SuicideAlertBanner item9Score={2} />);
      expect(screen.getByText(/Más de la mitad de los días \(2\)/i)).toBeDefined();

      rerender(<Phq9SuicideAlertBanner item9Score={3} />);
      expect(screen.getByText(/Casi todos los días \(3\)/i)).toBeDefined();
    });

    it('reactively displays alert banner in full App when user clicks Item 9 option >= 1 and removes on 0', () => {
      render(<App />);

      // Navigate to Conducta & Emoción -> PHQ-9
      fireEvent.click(screen.getByRole('button', { name: /Conducta & Emoción/i }));
      fireEvent.click(screen.getByRole('button', { name: /PHQ-9/i }));

      // Initially, no critical alert banner
      expect(screen.queryByTestId('phq9-suicide-alert-banner')).toBeNull();

      // Trigger critical sample
      const criticalBtn = screen.getByRole('button', { name: /Alerta Ítem 9/i });
      fireEvent.click(criticalBtn);

      // Alert banner is now visible in the DOM
      expect(screen.getByTestId('phq9-suicide-alert-banner')).toBeDefined();

      // Clear PHQ-9
      const clearBtn = screen.getByRole('button', { name: /Limpiar/i });
      fireEvent.click(clearBtn);

      // Alert banner disappears immediately
      expect(screen.queryByTestId('phq9-suicide-alert-banner')).toBeNull();
    });
  });

  describe('3. MoCA Reactive Cognitive Impairment Warning & Education Adjustment', () => {
    it('applies +1 education adjustment when education <= 12 years and detects MCI when score < 26', () => {
      render(
        <MocaScoreAlert
          adjustedScore={24}
          rawScore={23}
          educationYears={10}
          educationAdjustment={1}
          meetsClinicalCutoff={true}
          classification="Deterioro Cognitivo Leve"
        />
      );

      // Check warning banner
      expect(screen.getByText(/Alerta de Cribado Neurocognitivo \(Puntuación < 26\)/i)).toBeDefined();
      expect(screen.getAllByText(/Deterioro Cognitivo Leve/i).length).toBeGreaterThan(0);

      // Check education adjustment note
      expect(screen.getByText(/Ajuste por escolaridad aplicado \(\+1 punto por escolaridad ≤ 12 años\)/i)).toBeDefined();
      expect(screen.getByText(/Escolaridad declarada:/i)).toBeDefined();
      expect(screen.getByText(/Directa:/i)).toBeDefined();
    });

    it('does not apply adjustment when education > 12 years', () => {
      render(
        <MocaScoreAlert
          adjustedScore={25}
          rawScore={25}
          educationYears={16}
          educationAdjustment={0}
          meetsClinicalCutoff={true}
          classification="Deterioro Cognitivo Leve"
        />
      );

      expect(screen.getByText(/Sin ajuste de escolaridad aplicado \(escolaridad > 12 años\)/i)).toBeDefined();
      expect(screen.getByText(/Directa:/i)).toBeDefined();
    });

    it('renders normal status badge when adjusted score >= 26', () => {
      render(
        <MocaScoreAlert
          adjustedScore={27}
          rawScore={26}
          educationYears={12}
          educationAdjustment={1}
          meetsClinicalCutoff={false}
          classification="Normal"
        />
      );

      expect(screen.getByText(/Cribado Neurocognitivo Normal \(Puntuación ≥ 26\)/i)).toBeDefined();
      expect(screen.getAllByText(/^Normal$/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Ajuste por escolaridad aplicado/i)).toBeDefined();
    });
  });

  describe('4. SDQ Profile Bar Chart Vector Visualization', () => {
    it('renders pure React/SVG vector chart with 5 subscales and total difficulties', () => {
      const responses: Record<number, number> = {
        1: 1, 2: 0, 3: 0, 4: 0, 5: 0,
        6: 0, 7: 2, 8: 0, 9: 1, 10: 0,
        11: 2, 12: 0, 13: 0, 14: 2, 15: 0,
        16: 0, 17: 1, 18: 0, 19: 0, 20: 1,
        21: 2, 22: 0, 23: 0, 24: 0, 25: 2,
      };
      const result = calculateSdq({ informant: 'parent', responses });

      const { container } = render(<SdqProfileBarChart sdqResult={result} />);

      const svg = container.querySelector('svg.sdq-chart');
      expect(svg).not.toBeNull();
      expect(svg?.getAttribute('viewBox')).toBe('0 0 720 270');

      // Check scale labels rendered
      expect(screen.getByText('Síntomas Emocionales')).toBeDefined();
      expect(screen.getByText('Problemas de Conducta')).toBeDefined();
      expect(screen.getByText('Hiperactividad / Inatención')).toBeDefined();
      expect(screen.getByText('Problemas con Compañeros')).toBeDefined();
      expect(screen.getAllByText(/Conducta Prosocial/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('TOTAL DE DIFICULTADES')).toBeDefined();
    });
  });

  describe('5. Unified Dynamic Clinical Report (ClinicalReportView)', () => {
    it('renders only administered instruments and omits unadministered sections', () => {
      const TestConsumer: React.FC = () => {
        const session = useClinicalSession();

        return (
          <div>
            <button
              type="button"
              onClick={() => {
                session.loadMocaSample('normal');
                session.loadPhq9Sample('critical');
              }}
            >
              Setup Session
            </button>
            <ClinicalReportView />
          </div>
        );
      };

      render(
        <ClinicalSessionProvider>
          <TestConsumer />
        </ClinicalSessionProvider>
      );

      // Initially: Wechsler is populated, but MoCA, PHQ-9, SDQ are not administered
      expect(screen.getByTestId('report-wechsler-section')).toBeDefined();
      expect(screen.queryByTestId('report-moca-section')).toBeNull();
      expect(screen.queryByTestId('report-sdq-section')).toBeNull();
      expect(screen.queryByTestId('report-affective-section')).toBeNull();

      // Trigger setup session (administer MoCA and PHQ-9 critical)
      const setupBtn = screen.getByRole('button', { name: /Setup Session/i });
      fireEvent.click(setupBtn);

      // Now MoCA and Affective sections are dynamically rendered!
      expect(screen.getByTestId('report-moca-section')).toBeDefined();
      expect(screen.getByTestId('report-affective-section')).toBeDefined();
      // Suicide risk banner in report is also rendered!
      expect(screen.getByTestId('report-suicide-alert')).toBeDefined();
      // SDQ was not administered, so it remains omitted!
      expect(screen.queryByTestId('report-sdq-section')).toBeNull();
    });

    it('renders full demo session with all instruments and qualitative narrative', () => {
      const TestDemoConsumer: React.FC = () => {
        const session = useClinicalSession();

        return (
          <div>
            <button type="button" onClick={() => session.loadDemoSession()}>
              Load Full Demo
            </button>
            <ClinicalReportView />
          </div>
        );
      };

      render(
        <ClinicalSessionProvider>
          <TestDemoConsumer />
        </ClinicalSessionProvider>
      );

      const demoBtn = screen.getByRole('button', { name: /Load Full Demo/i });
      fireEvent.click(demoBtn);

      // Verify all sections appear
      expect(screen.getByTestId('report-wechsler-section')).toBeDefined();
      expect(screen.getByTestId('report-moca-section')).toBeDefined();
      expect(screen.getByTestId('report-sdq-section')).toBeDefined();
      expect(screen.getByTestId('report-affective-section')).toBeDefined();
      expect(screen.getByTestId('report-htp-section')).toBeDefined();
      expect(screen.getByText(/VIII. Evaluación Proyectiva Gráfica HTP/i)).toBeDefined();
    });
  });

  describe('6. Global 1-Click Anonymization across all views', () => {
    it('toggles patient name to initials in navigation, tables, and reports in 1 click', () => {
      render(<App />);

      // Original name present
      expect(screen.getAllByText(/Lucas Fernández Gómez/i).length).toBeGreaterThan(0);

      // Click 1-Clic Anonimizar in header/nav (use the first button)
      const anonBtns = screen.getAllByRole('button', { name: /1-Clic Anonimizar/i });
      fireEvent.click(anonBtns[0]);

      // Name is now anonymized to initials: "L. F. G."
      expect(screen.getAllByText(/L\. F\. G\./i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Anonimizado \(1-Clic\)/i)).toBeDefined();

      // Click again to restore
      const restoreBtn = screen.getByRole('button', { name: /Anonimizado \(1-Clic\)/i });
      fireEvent.click(restoreBtn);

      expect(screen.getAllByText(/Lucas Fernández Gómez/i).length).toBeGreaterThan(0);
    });
  });
});
