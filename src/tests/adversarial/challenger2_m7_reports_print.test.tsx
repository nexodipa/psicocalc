import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../App';
import { ClinicalSessionProvider, useClinicalSession } from '../../ui/context/ClinicalSessionContext';
import { ClinicalReportView } from '../../ui/components/report/ClinicalReportView';
import { anonymizeName } from '../../ui/hooks/usePsychometrics';

describe('Adversarial Verification Suite — Challenger 2 (Milestone M7)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  /* =========================================================================
   * DIMENSION 1: Dynamic Modular Report — Omission of Unadministered Tests
   * ========================================================================= */
  describe('Dimension 1: Unadministered Test Omission (Zero Empty Sections / Blank Tables)', () => {
    it('OMIT-1: when ONLY PHQ-9 and MoCA are answered, WISC, SDQ, and HTP sections are strictly omitted with ZERO blank tables', () => {
      const TestPartialConsumer: React.FC = () => {
        const session = useClinicalSession();

        return (
          <div>
            <button
              type="button"
              onClick={() => {
                // Clear Wechsler, SDQ, GAD-7, and HTP
                session.clearAllScores();
                session.clearSdq();
                session.clearGad7();
                session.clearHtp();

                // Administer only PHQ-9 and MoCA
                session.loadPhq9Sample('moderate');
                session.loadMocaSample('normal');
              }}
            >
              Apply Only PHQ-9 and MoCA
            </button>
            <ClinicalReportView />
          </div>
        );
      };

      const { container } = render(
        <ClinicalSessionProvider>
          <TestPartialConsumer />
        </ClinicalSessionProvider>
      );

      // Trigger configuration
      const applyBtn = screen.getByRole('button', { name: /Apply Only PHQ-9 and MoCA/i });
      fireEvent.click(applyBtn);

      // 1. Assert WISC/WAIS section is completely omitted
      expect(screen.queryByTestId('report-wechsler-section')).toBeNull();
      expect(screen.queryByText(/II\. Resumen de Puntuaciones Compuestas/i)).toBeNull();
      expect(screen.queryByText(/III\. Puntuaciones Escalares/i)).toBeNull();
      expect(screen.queryByText(/IV\. Interpretación Clínica y Juicio Diagnóstico/i)).toBeNull();
      expect(container.querySelector('svg.psychometric-chart')).toBeNull();

      // 2. Assert SDQ section is completely omitted
      expect(screen.queryByTestId('report-sdq-section')).toBeNull();
      expect(screen.queryByText(/VI\. Evaluación Conductual y Socioemocional/i)).toBeNull();
      expect(container.querySelector('svg.sdq-chart')).toBeNull();

      // 3. Assert HTP section is completely omitted
      expect(screen.queryByTestId('report-htp-section')).toBeNull();
      expect(screen.queryByText(/VIII\. Evaluación Proyectiva Gráfica HTP/i)).toBeNull();

      // 4. Assert MoCA section IS rendered and complete
      const mocaSection = screen.getByTestId('report-moca-section');
      expect(mocaSection).toBeDefined();
      expect(screen.getByText(/V\. Cribado Neurocognitivo Rápido \(MoCA/i)).toBeDefined();
      expect(screen.getByText('Visuoespacial / Ejecutiva')).toBeDefined();
      expect(screen.getByText('Recuerdo Diferido')).toBeDefined();
      expect(screen.getByText(/PUNTUACIÓN TOTAL AJUSTADA FINAL/i)).toBeDefined();

      // 5. Assert Affective section IS rendered, containing PHQ-9 ONLY (GAD-7 omitted)
      const affectiveSection = screen.getByTestId('report-affective-section');
      expect(affectiveSection).toBeDefined();
      expect(screen.getByText(/VII\. Sintomatología Afectiva/i)).toBeDefined();
      expect(screen.getByText(/PHQ-9 \(Cuestionario de Salud del Paciente - Depresión\)/i)).toBeDefined();
      expect(screen.queryByText(/GAD-7 \(Trastorno de Ansiedad Generalizada\)/i)).toBeNull();

      // 6. Empirical DOM assertion: verify NO blank or empty table rows exist
      const tables = container.querySelectorAll('table.clinical-table');
      expect(tables.length).toBeGreaterThanOrEqual(2); // Demographics + MoCA + Affective
      tables.forEach((tbl) => {
        const rows = tbl.querySelectorAll('tbody tr');
        expect(rows.length).toBeGreaterThan(0);
        rows.forEach((row) => {
          expect(row.textContent?.trim().length).toBeGreaterThan(0);
        });
      });
    });

    it('OMIT-2: when ONLY SDQ is administered, Wechsler, MoCA, Affective, and HTP are strictly omitted', () => {
      const TestSdqOnlyConsumer: React.FC = () => {
        const session = useClinicalSession();

        return (
          <div>
            <button
              type="button"
              onClick={() => {
                session.clearAllScores();
                session.clearPhq9();
                session.clearGad7();
                session.clearMoca();
                session.clearHtp();
                session.loadSdqSample('clinical');
              }}
            >
              Apply Only SDQ
            </button>
            <ClinicalReportView />
          </div>
        );
      };

      const { container } = render(
        <ClinicalSessionProvider>
          <TestSdqOnlyConsumer />
        </ClinicalSessionProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /Apply Only SDQ/i }));

      // SDQ is present
      expect(screen.getByTestId('report-sdq-section')).toBeDefined();
      expect(screen.getByText(/VI\. Evaluación Conductual y Socioemocional/i)).toBeDefined();
      expect(container.querySelector('svg.sdq-chart')).not.toBeNull();

      // All others are omitted
      expect(screen.queryByTestId('report-wechsler-section')).toBeNull();
      expect(screen.queryByTestId('report-moca-section')).toBeNull();
      expect(screen.queryByTestId('report-affective-section')).toBeNull();
      expect(screen.queryByTestId('report-htp-section')).toBeNull();
    });

    it('OMIT-3: when ONLY GAD-7 is administered, Affective table contains GAD-7 and NOT PHQ-9', () => {
      const TestGad7OnlyConsumer: React.FC = () => {
        const session = useClinicalSession();

        return (
          <div>
            <button
              type="button"
              onClick={() => {
                session.clearAllScores();
                session.clearSdq();
                session.clearPhq9();
                session.clearMoca();
                session.clearHtp();
                session.loadGad7Sample('severe');
              }}
            >
              Apply Only GAD-7
            </button>
            <ClinicalReportView />
          </div>
        );
      };

      render(
        <ClinicalSessionProvider>
          <TestGad7OnlyConsumer />
        </ClinicalSessionProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /Apply Only GAD-7/i }));

      expect(screen.getByTestId('report-affective-section')).toBeDefined();
      expect(screen.getByText(/GAD-7 \(Trastorno de Ansiedad Generalizada\)/i)).toBeDefined();
      expect(screen.queryByText(/PHQ-9 \(Cuestionario de Salud del Paciente - Depresión\)/i)).toBeNull();
      expect(screen.queryByTestId('report-wechsler-section')).toBeNull();
      expect(screen.queryByTestId('report-sdq-section')).toBeNull();
      expect(screen.queryByTestId('report-moca-section')).toBeNull();
      expect(screen.queryByTestId('report-htp-section')).toBeNull();
    });
  });

  /* =========================================================================
   * DIMENSION 2: Complete Multi-Battery Administration & HTP Narrative
   * ========================================================================= */
  describe('Dimension 2: Complete Multi-Battery Administration Coverage', () => {
    it('FULL-1: when ALL instruments are administered, all respective sections (I to VIII) and 5-paragraph HTP qualitative narrative are rendered', () => {
      const TestFullConsumer: React.FC = () => {
        const session = useClinicalSession();

        return (
          <div>
            <button
              type="button"
              onClick={() => {
                session.loadDemoSession();
                // Ensure PHQ-9 has Item 9 = 2 to trigger critical suicide alert
                session.loadPhq9Sample('critical');
              }}
            >
              Load Full Session with Critical Alert
            </button>
            <ClinicalReportView />
          </div>
        );
      };

      const { container } = render(
        <ClinicalSessionProvider>
          <TestFullConsumer />
        </ClinicalSessionProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /Load Full Session with Critical Alert/i }));

      // Section I: Demographics & Header
      expect(screen.getByText(/I\. Datos de Identificación y Filiación Clínica/i)).toBeDefined();
      expect(screen.getAllByText(/Lucas Fernández Gómez/i).length).toBeGreaterThanOrEqual(1);

      // Section II, III, IV: Wechsler Intelligence (WISC-V)
      const wechsler = screen.getByTestId('report-wechsler-section');
      expect(wechsler).toBeDefined();
      expect(screen.getByText(/II\. Resumen de Puntuaciones Compuestas e Índices Primarios/i)).toBeDefined();
      expect(screen.getByText(/III\. Puntuaciones Escalares y Análisis de Dispersión/i)).toBeDefined();
      expect(screen.getByText(/IV\. Interpretación Clínica y Juicio Diagnóstico Automatizado/i)).toBeDefined();
      expect(container.querySelector('svg.psychometric-chart')).not.toBeNull();

      // Section V: MoCA Neurocognitive Screening
      const moca = screen.getByTestId('report-moca-section');
      expect(moca).toBeDefined();
      expect(screen.getByText(/V\. Cribado Neurocognitivo Rápido \(MoCA/i)).toBeDefined();
      expect(screen.getByText(/Ajuste por Escolaridad/i)).toBeDefined();

      // Section VI: SDQ Behavioral Assessment
      const sdq = screen.getByTestId('report-sdq-section');
      expect(sdq).toBeDefined();
      expect(screen.getByText(/VI\. Evaluación Conductual y Socioemocional \(SDQ/i)).toBeDefined();
      expect(container.querySelector('svg.sdq-chart')).not.toBeNull();

      // Section VII: Affective Symptomatology (PHQ-9 & GAD-7)
      const affective = screen.getByTestId('report-affective-section');
      expect(affective).toBeDefined();
      expect(screen.getByText(/VII\. Sintomatología Afectiva: Depresión y Ansiedad/i)).toBeDefined();
      expect(screen.getByTestId('report-suicide-alert')).toBeDefined(); // Suicide alert banner
      expect(screen.getByText(/PHQ-9 \(Cuestionario de Salud del Paciente - Depresión\)/i)).toBeDefined();
      expect(screen.getByText(/GAD-7 \(Trastorno de Ansiedad Generalizada\)/i)).toBeDefined();

      // Section VIII: HTP Qualitative Projective Assessment (5 PARAGRAPHS)
      const htp = screen.getByTestId('report-htp-section');
      expect(htp).toBeDefined();
      expect(screen.getByText(/VIII\. Evaluación Proyectiva Gráfica HTP/i)).toBeDefined();

      // Verify the 5 exact qualitative paragraphs
      expect(screen.getByText(/a\) Indicadores Expresivos y Formales Transversales/i)).toBeDefined();
      expect(screen.getByText(/b\) Dinámica Familiar y Área Afectiva \(Casa\)/i)).toBeDefined();
      expect(screen.getByText(/c\) Estructura del Yo y Estabilidad Emocional Profunda \(Árbol\)/i)).toBeDefined();
      expect(screen.getByText(/d\) Imagen Corporal y Relaciones Interpersonales \(Persona\)/i)).toBeDefined();
      expect(screen.getByText(/e\) Conclusión Cualitativa Integrada/i)).toBeDefined();

      // Verify HTP does NOT contain fake score tables
      expect(htp.querySelectorAll('table').length).toBe(0);

      // Signature Block present
      expect(screen.getByText(/Psicólogo\/a Colegiado\/a Especialista/i)).toBeDefined();
      expect(container.querySelector('.signature-block')).not.toBeNull();
    });
  });

  /* =========================================================================
   * DIMENSION 3: 1-Click Global Anonymization Stress Testing
   * ========================================================================= */
  describe('Dimension 3: 1-Click Global Anonymization (Total Trace Eradication)', () => {
    it('ANON-1: stress-tests name tokenizer against edge cases, hyphens, and whitespace anomalies', () => {
      // Standard Hispanic 3-part
      expect(anonymizeName('Lucas Fernández Gómez')).toBe('L. F. G.');
      // 5-part noble/compound
      expect(anonymizeName('María Del Carmen De La Cruz')).toBe('M. D. C. D. L. C.');
      // Mononym
      expect(anonymizeName('Platón')).toBe('P.');
      // Irregular whitespace and tabs
      expect(anonymizeName('   Carlos   \t   Eduardo   Mora  ')).toBe('C. E. M.');
      // Empty & whitespace-only inputs
      expect(anonymizeName('')).toBe('');
      expect(anonymizeName('   ')).toBe('');
      // Lowercase tokens
      expect(anonymizeName('alberto pérez')).toBe('A. P.');
    });

    it('ANON-2: 1-click anonymization replaces patient identity across Demographics, Narrative, and Navigation in full App', () => {
      render(<App />);

      // Initial state: Full patient name visible
      expect(screen.getAllByText(/Lucas Fernández Gómez/i).length).toBeGreaterThanOrEqual(1);

      // Click 1-Clic Anonymize button
      const anonBtn = screen.getAllByRole('button', { name: /1-Clic Anonimizar/i })[0];
      fireEvent.click(anonBtn);

      // 1. Full name must be completely wiped from the DOM
      expect(screen.queryByText(/Lucas Fernández Gómez/i)).toBeNull();

      // 2. Anonymized initials "L. F. G." must appear in all corresponding places
      const initialsMatches = screen.getAllByText(/L\. F\. G\./i);
      expect(initialsMatches.length).toBeGreaterThanOrEqual(1);

      // 3. Navigate to Report view
      const reportNavBtn = screen.getByRole('button', { name: /Informe Clínico Integrado/i });
      fireEvent.click(reportNavBtn);

      // In Report view: verify full name remains absent and initials are used
      expect(screen.queryByText(/Lucas Fernández Gómez/i)).toBeNull();
      expect(screen.getAllByText(/L\. F\. G\./i).length).toBeGreaterThanOrEqual(2); // Demographics + Narrative

      // 4. Click to restore original name
      const restoreBtn = screen.getByRole('button', { name: /Anonimizado \(1-Clic\)/i });
      fireEvent.click(restoreBtn);

      // Verify original name restored everywhere
      expect(screen.getAllByText(/Lucas Fernández Gómez/i).length).toBeGreaterThanOrEqual(2);
    });

    it('ANON-3: updates anonymized initials dynamically if user enters a custom name while anonymized', () => {
      const TestCustomAnonConsumer: React.FC = () => {
        const session = useClinicalSession();

        return (
          <div>
            <button
              type="button"
              onClick={() => {
                session.setDemographics({ nameOrId: 'Rodrigo Mendoza Silva' });
              }}
            >
              Set Rodrigo
            </button>
            <button type="button" onClick={() => session.toggleAnonymize()}>
              Toggle Anon
            </button>
            <ClinicalReportView />
          </div>
        );
      };

      render(
        <ClinicalSessionProvider>
          <TestCustomAnonConsumer />
        </ClinicalSessionProvider>
      );

      // Set new name
      fireEvent.click(screen.getByRole('button', { name: /Set Rodrigo/i }));
      expect(screen.getAllByText(/Rodrigo Mendoza Silva/i).length).toBeGreaterThan(0);

      // Anonymize
      fireEvent.click(screen.getByRole('button', { name: /Toggle Anon/i }));
      expect(screen.queryByText(/Rodrigo Mendoza Silva/i)).toBeNull();
      expect(screen.getAllByText(/R\. M\. S\./i).length).toBeGreaterThan(0);

      // Restore
      fireEvent.click(screen.getByRole('button', { name: /Toggle Anon/i }));
      expect(screen.getAllByText(/Rodrigo Mendoza Silva/i).length).toBeGreaterThan(0);
    });
  });

  /* =========================================================================
   * DIMENSION 4: Camera-Ready Print Stylesheet Inspection (print.css)
   * ========================================================================= */
  describe('Dimension 4: Camera-Ready Print Stylesheet & Class Adherence', () => {
    let printCssContent = '';

    beforeEach(async () => {
      // @ts-expect-error dynamic node import
      const fs = await import('fs');
      // @ts-expect-error dynamic node import
      const path = await import('path');
      const cwd = ((globalThis as unknown as { process?: { cwd: () => string } }).process?.cwd?.()) || '';
      const cssPath = path.resolve(cwd, 'src/styles/print.css');
      printCssContent = fs.readFileSync(cssPath, 'utf-8');
    });

    it('PRINT-1: print.css wraps all rules within @media print and declares strict A4 portrait sizing', () => {
      expect(printCssContent).toMatch(/@media\s+print\s*\{/);
      expect(printCssContent).toMatch(/@page\s*\{[^}]*size:\s*A4\s+portrait/i);
      expect(printCssContent).toMatch(/margin:\s*14mm\s+16mm\s+14mm\s+16mm/i);
    });

    it('PRINT-2: suppresses all interactive and web chrome controls in print mode', () => {
      // Must hide app-nav, sidebar, buttons, no-print elements, quick panels, footer
      expect(printCssContent).toMatch(/header\.app-nav/);
      expect(printCssContent).toMatch(/aside\.sidebar/);
      expect(printCssContent).toMatch(/button/);
      expect(printCssContent).toMatch(/\.no-print/);
      expect(printCssContent).toMatch(/\.battery-toggle/);
      expect(printCssContent).toMatch(/\.quick-input-panel/);
      expect(printCssContent).toMatch(/\.status-toast/);
      expect(printCssContent).toMatch(/footer\.app-footer/);
      expect(printCssContent).toMatch(/display:\s*none\s*!important/);
    });

    it('PRINT-3: enforces clean page breaks and avoids breaking inside clinical sections/tables', () => {
      // Page break triggers
      expect(printCssContent).toMatch(/\.print-page-break\s*\{[^}]*break-before:\s*page\s*!important/i);

      // Page break avoid rules
      expect(printCssContent).toMatch(/\.avoid-break/);
      expect(printCssContent).toMatch(/\.report-instrument-section/);
      expect(printCssContent).toMatch(/break-inside:\s*avoid\s*!important/i);

      // Heading break rules
      expect(printCssContent).toMatch(/h2\.report-section\s*\{[^}]*break-after:\s*avoid/i);
    });

    it('PRINT-4: flattens form inputs and formats clinical tables and SVG charts for paper output', () => {
      // Form inputs become static text
      expect(printCssContent).toMatch(/input,\s*textarea,\s*select\s*\{[^}]*border:\s*none\s*!important/i);
      expect(printCssContent).toMatch(/background:\s*transparent\s*!important/i);

      // Pure SVG charts
      expect(printCssContent).toMatch(/svg\.psychometric-chart/);
      expect(printCssContent).toMatch(/svg\.sdq-chart/);
      expect(printCssContent).toMatch(/break-inside:\s*avoid/);

      // Clinical table borders & shaded bands
      expect(printCssContent).toMatch(/table\.clinical-table/);
      expect(printCssContent).toMatch(/border-collapse:\s*collapse/);
      expect(printCssContent).toMatch(/\.print-critical-alert\s*\{[^}]*border:\s*2pt\s+solid\s+#b91c1c/i);
    });

    it('PRINT-5: ClinicalReportView applies print classes accurately to DOM elements', () => {
      const TestPrintClassConsumer: React.FC = () => {
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
              Setup Critical Demo
            </button>
            <ClinicalReportView />
          </div>
        );
      };

      const { container } = render(
        <ClinicalSessionProvider>
          <TestPrintClassConsumer />
        </ClinicalSessionProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /Setup Critical Demo/i }));

      // Container has print layout classes
      const reportContainer = screen.getByTestId('clinical-report-view');
      expect(reportContainer.className).toContain('page-container');
      expect(reportContainer.className).toContain('print:p-0');
      expect(reportContainer.className).toContain('print:border-none');
      expect(reportContainer.className).toContain('print:shadow-none');

      // Instrument sections have avoid-break
      const instrumentSections = container.querySelectorAll('.report-instrument-section');
      expect(instrumentSections.length).toBeGreaterThanOrEqual(4);
      instrumentSections.forEach((sec) => {
        expect(sec.className).toMatch(/avoid-break|space-y/);
      });

      // Tables have clinical-table
      const tables = container.querySelectorAll('table');
      tables.forEach((tbl) => {
        expect(tbl.className).toContain('clinical-table');
      });

      // Critical alert has print-critical-alert
      const alertBanner = screen.getByTestId('report-suicide-alert');
      expect(alertBanner.className).toContain('print-critical-alert');
    });
  });

  /* =========================================================================
   * DIMENSION 5: Adversarial Boundary & Stress Cases
   * ========================================================================= */
  describe('Dimension 5: Deep Clinical Boundary Stress Tests', () => {
    it('STRESS-1: WAIS-IV battery full report header adaptation and adult subtests', () => {
      const TestWaisConsumer: React.FC = () => {
        const session = useClinicalSession();

        return (
          <div>
            <button type="button" onClick={() => session.setBattery('WAIS-IV')}>
              Switch to WAIS
            </button>
            <button
              type="button"
              onClick={() => {
                session.loadSampleProfile('average');
                session.loadPhq9Sample('minimal');
                session.loadGad7Sample('minimal');
                session.loadMocaSample('normal');
                session.loadHtpPreset('balanced');
              }}
            >
              Load WAIS Session
            </button>
            <ClinicalReportView />
          </div>
        );
      };

      render(
        <ClinicalSessionProvider>
          <TestWaisConsumer />
        </ClinicalSessionProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /Switch to WAIS/i }));
      fireEvent.click(screen.getByRole('button', { name: /Load WAIS Session/i }));

      // Verify WAIS-IV header appears
      expect(
        screen.getByText(/Escala de Inteligencia de Wechsler para Adultos — Cuarta Edición \(WAIS-IV\)/i)
      ).toBeDefined();

      // Verify WAIS subtests are rendered
      expect(screen.getByTestId('report-wechsler-section')).toBeDefined();
    });

    it('STRESS-2: Incomplete WISC subtests (only 2 entered) handles missing CIT without crashing', () => {
      const TestIncompleteConsumer: React.FC = () => {
        const session = useClinicalSession();

        return (
          <div>
            <button
              type="button"
              onClick={() => {
                session.clearAllScores();
                session.setSubtestScore('S', 12);
                session.setSubtestScore('V', 14);
              }}
            >
              Setup Incomplete
            </button>
            <ClinicalReportView />
          </div>
        );
      };

      render(
        <ClinicalSessionProvider>
          <TestIncompleteConsumer />
        </ClinicalSessionProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /Setup Incomplete/i }));

      // Wechsler section exists with partial data
      expect(screen.getByTestId('report-wechsler-section')).toBeDefined();
      expect(screen.getByText('Semejanzas')).toBeDefined();
      expect(screen.getByText('Vocabulario')).toBeDefined();
    });

    it('STRESS-3: PHQ-9 Item 9 gradient: 0 hides alert, 1, 2, and 3 display deontological alert', () => {
      const TestPhq9GradientConsumer: React.FC<{ item9: 0 | 1 | 2 | 3 }> = ({ item9 }) => {
        const session = useClinicalSession();

        return (
          <div>
            <button
              type="button"
              onClick={() => {
                session.loadPhq9Sample('minimal');
                session.setPhq9Response(9, item9);
              }}
            >
              Set Item 9
            </button>
            <ClinicalReportView />
          </div>
        );
      };

      // Case Item 9 = 0
      const { unmount } = render(
        <ClinicalSessionProvider>
          <TestPhq9GradientConsumer item9={0} />
        </ClinicalSessionProvider>
      );
      fireEvent.click(screen.getByRole('button', { name: /Set Item 9/i }));
      expect(screen.queryByTestId('report-suicide-alert')).toBeNull();
      unmount();

      // Case Item 9 = 1
      const render1 = render(
        <ClinicalSessionProvider>
          <TestPhq9GradientConsumer item9={1} />
        </ClinicalSessionProvider>
      );
      fireEvent.click(render1.getByRole('button', { name: /Set Item 9/i }));
      expect(render1.getByTestId('report-suicide-alert')).toBeDefined();
      expect(render1.getByText(/Alerta Pericial Deontológica: Detección de Riesgo Autolítico/i)).toBeDefined();
      render1.unmount();

      // Case Item 9 = 3
      const render3 = render(
        <ClinicalSessionProvider>
          <TestPhq9GradientConsumer item9={3} />
        </ClinicalSessionProvider>
      );
      fireEvent.click(render3.getByRole('button', { name: /Set Item 9/i }));
      expect(render3.getByTestId('report-suicide-alert')).toBeDefined();
      render3.unmount();
    });

    it('STRESS-4: MoCA Education rule boundary: raw 25 + education 12 vs 13 years determines cutoff pass/fail', () => {
      const TestMocaCutoffConsumer: React.FC<{ eduYears: number }> = ({ eduYears }) => {
        const session = useClinicalSession();

        return (
          <div>
            <button
              type="button"
              onClick={() => {
                session.clearMoca();
                session.setMocaEducationYears(eduYears);
                // Raw score = 25
                session.setMocaDomainScore('visuospatialExecutive', 5);
                session.setMocaDomainScore('naming', 3);
                session.setMocaDomainScore('attention', 5);
                session.setMocaDomainScore('language', 3);
                session.setMocaDomainScore('abstraction', 2);
                session.setMocaDomainScore('delayedRecall', 3);
                session.setMocaDomainScore('orientation', 4); // Sum = 25
              }}
            >
              Setup MoCA
            </button>
            <ClinicalReportView />
          </div>
        );
      };

      // Case 1: eduYears = 12 -> +1 adjustment -> 26 -> Normal (cutoff not met)
      const render12 = render(
        <ClinicalSessionProvider>
          <TestMocaCutoffConsumer eduYears={12} />
        </ClinicalSessionProvider>
      );
      fireEvent.click(render12.getByRole('button', { name: /Setup MoCA/i }));
      expect(render12.getAllByText(/26 \/ 30/i).length).toBeGreaterThanOrEqual(1);
      expect(render12.getByText(/Rendimiento neurocognitivo global dentro de los límites normales esperados/i)).toBeDefined();
      expect(render12.getByText(/\+1 punto \(Escolaridad ≤ 12 años\)/i)).toBeDefined();
      render12.unmount();

      // Case 2: eduYears = 13 -> 0 adjustment -> 25 -> DCL (cutoff met)
      const render13 = render(
        <ClinicalSessionProvider>
          <TestMocaCutoffConsumer eduYears={13} />
        </ClinicalSessionProvider>
      );
      fireEvent.click(render13.getByRole('button', { name: /Setup MoCA/i }));
      expect(render13.getAllByText(/25 \/ 30/i).length).toBeGreaterThanOrEqual(1);
      expect(render13.getByText(/Alerta de Rendimiento Neurocognitivo:/i)).toBeDefined();
      expect(render13.getAllByText(/Deterioro Cognitivo Leve/i).length).toBeGreaterThanOrEqual(1);
      expect(render13.getByText(/0 puntos \(Escolaridad > 12 años\)/i)).toBeDefined();
      render13.unmount();
    });

    it('STRESS-5: HTP across benchmark presets consistently outputs 5 qualitative paragraphs without scores', () => {
      const presets = ['balanced', 'inhibited', 'expansive'] as const;

      presets.forEach((preset) => {
        const TestHtpPresetConsumer: React.FC = () => {
          const session = useClinicalSession();

          return (
            <div>
              <button type="button" onClick={() => session.loadHtpPreset(preset)}>
                Load {preset}
              </button>
              <ClinicalReportView />
            </div>
          );
        };

        const { unmount } = render(
          <ClinicalSessionProvider>
            <TestHtpPresetConsumer />
          </ClinicalSessionProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: new RegExp(`Load ${preset}`, 'i') }));

        const htpSection = screen.getByTestId('report-htp-section');
        expect(htpSection).toBeDefined();

        // Check 5 narrative headings
        expect(screen.getByText(/a\) Indicadores Expresivos y Formales Transversales/i)).toBeDefined();
        expect(screen.getByText(/b\) Dinámica Familiar y Área Afectiva \(Casa\)/i)).toBeDefined();
        expect(screen.getByText(/c\) Estructura del Yo y Estabilidad Emocional Profunda \(Árbol\)/i)).toBeDefined();
        expect(screen.getByText(/d\) Imagen Corporal y Relaciones Interpersonales \(Persona\)/i)).toBeDefined();
        expect(screen.getByText(/e\) Conclusión Cualitativa Integrada/i)).toBeDefined();

        // Empirical check: Zero tables in HTP section
        expect(htpSection.querySelectorAll('table').length).toBe(0);

        unmount();
      });
    });

    it('STRESS-6: Anonymization handles accented and complex Hispanic characters', () => {
      expect(anonymizeName('Íñigo De Loyola Peña')).toBe('Í. D. L. P.');
      expect(anonymizeName('Álvaro Núñez Cabeza De Vaca')).toBe('Á. N. C. D. V.');
      expect(anonymizeName('Óscar Úbeda Écija')).toBe('Ó. Ú. É.');
    });
  });
});
