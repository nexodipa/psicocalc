import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../App';
import { AppHeader } from '../../ui/components/layout/AppHeader';
import { BatterySelector } from '../../ui/components/layout/BatterySelector';
import { DemographicsCard } from '../../ui/components/entry/DemographicsCard';
import { SubtestInputGrid } from '../../ui/components/entry/SubtestInputGrid';
import { CompositeScoreCards } from '../../ui/components/entry/CompositeScoreCards';
import { ValidationBanner } from '../../ui/components/entry/ValidationBanner';
import { ProfileScatterChart } from '../../ui/components/charts/ProfileScatterChart';
import { GaussianBellCurve } from '../../ui/components/charts/GaussianBellCurve';
import { ClinicalReportView } from '../../ui/components/report/ClinicalReportView';
import { InstitutionalHeader } from '../../ui/components/report/InstitutionalHeader';
import { DemographicsTable } from '../../ui/components/report/DemographicsTable';
import { PrimaryIndicesTable } from '../../ui/components/report/PrimaryIndicesTable';
import { SubtestSummaryTable } from '../../ui/components/report/SubtestSummaryTable';
import { AutomatedNarrative } from '../../ui/components/report/AutomatedNarrative';
import { SignatureBlock } from '../../ui/components/report/SignatureBlock';
import {
  calculateWiscV,
  calculateWaisIV,
  validateAgeAndBattery,
  calculateStrengthsWeaknesses,
} from '../../core';

describe('UI Smoke & Component Tests (Psicocalc M2 & M3)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. AppHeader & BatterySelector', () => {
    it('renders AppHeader with title, badges, and action buttons', () => {
      const onSelectBattery = vi.fn();
      const onSelectTab = vi.fn();
      const onPrint = vi.fn();

      render(
        <AppHeader
          currentBattery="WISC-V"
          onSelectBattery={onSelectBattery}
          activeTab="calculator"
          onSelectTab={onSelectTab}
          onPrint={onPrint}
        />
      );

      expect(screen.getByText('PSICOCALC')).toBeDefined();
      expect(screen.getByText('Clínico')).toBeDefined();
      expect(screen.getByText('Calculadora')).toBeDefined();
      expect(screen.getByText('Informe Clínico')).toBeDefined();
      expect(screen.getByText('Imprimir / Guardar PDF')).toBeDefined();
    });

    it('triggers window.print when print button is clicked', () => {
      const printSpy = vi.fn();
      window.print = printSpy;

      render(
        <AppHeader
          currentBattery="WISC-V"
          onSelectBattery={vi.fn()}
          activeTab="calculator"
          onSelectTab={vi.fn()}
          onPrint={() => window.print()}
        />
      );

      const printBtn = screen.getByText('Imprimir / Guardar PDF');
      fireEvent.click(printBtn);
      expect(printSpy).toHaveBeenCalledTimes(1);
    });

    it('allows toggling battery in BatterySelector', () => {
      const onSelectBattery = vi.fn();
      render(
        <BatterySelector
          currentBattery="WISC-V"
          onSelectBattery={onSelectBattery}
        />
      );

      const waisBtn = screen.getByRole('radio', { name: /WAIS-IV/i });
      fireEvent.click(waisBtn);
      expect(onSelectBattery).toHaveBeenCalledWith('WAIS-IV');
    });
  });

  describe('2. DemographicsCard & Anonymization', () => {
    it('renders patient identification, calculated age, and anonymize button', () => {
      const demographics = {
        nameOrId: 'Lucas Fernández Gómez',
        birthDate: '2016-04-08',
        testDate: '2026-09-22',
        examiner: 'Lic. Roberto Gómez',
        reasonForEvaluation: 'Evaluación de perfil',
        isAnonymized: false,
      };
      const ageValidation = validateAgeAndBattery(demographics.birthDate, demographics.testDate, 'WISC-V');
      const onToggleAnonymize = vi.fn();

      render(
        <DemographicsCard
          battery="WISC-V"
          demographics={demographics}
          onUpdateDemographics={vi.fn()}
          onToggleAnonymize={onToggleAnonymize}
          displayName={demographics.nameOrId}
          ageValidation={ageValidation}
        />
      );

      expect(screen.getByText('Datos del Evaluado y Protocolo')).toBeDefined();
      expect(screen.getByDisplayValue('Lucas Fernández Gómez')).toBeDefined();
      expect(screen.getByText(/10 a, 5 m, 14 d/)).toBeDefined();

      const anonBtn = screen.getByText('1-Clic Anonimizar');
      fireEvent.click(anonBtn);
      expect(onToggleAnonymize).toHaveBeenCalled();
    });

    it('displays error badge when age is incompatible with chosen battery', () => {
      const demographics = {
        nameOrId: 'Adult Patient',
        birthDate: '1995-01-01',
        testDate: '2026-09-22',
        examiner: 'Lic. Tester',
        isAnonymized: false,
      };
      // 31 years old on WISC-V is invalid
      const ageValidation = validateAgeAndBattery(demographics.birthDate, demographics.testDate, 'WISC-V');

      render(
        <DemographicsCard
          battery="WISC-V"
          demographics={demographics}
          onUpdateDemographics={vi.fn()}
          onToggleAnonymize={vi.fn()}
          displayName={demographics.nameOrId}
          ageValidation={ageValidation}
        />
      );

      expect(screen.getByText(/Incompatibilidad etaria con WISC-V/)).toBeDefined();
    });
  });

  describe('3. SubtestInputGrid & ValidationBanner', () => {
    it('renders subtests organized by cognitive domain', () => {
      const subtests = { S: 11, V: 11, C: 13 };
      const rawInputs = { S: '11', V: '11', C: '13' };

      render(
        <SubtestInputGrid
          battery="WISC-V"
          subtests={subtests}
          rawInputs={rawInputs}
          invalidSubtests={{}}
          onSetScore={vi.fn()}
          onClearAll={vi.fn()}
          onLoadSample={vi.fn()}
        />
      );

      expect(screen.getByText(/Entrada Rápida de Puntuaciones Escalares/)).toBeDefined();
      expect(screen.getByText('Semejanzas')).toBeDefined();
      expect(screen.getByText('Vocabulario')).toBeDefined();
      expect(screen.getByText('Cubos')).toBeDefined();
    });

    it('renders ValidationBanner when out-of-range values or age incompatibility occur', () => {
      const ageValidation = {
        isValid: false,
        years: 4,
        months: 0,
        days: 0,
        errorMessage: 'El evaluado tiene menos de 6 años.',
      };

      render(
        <ValidationBanner
          battery="WISC-V"
          invalidSubtests={{ S: 'Puntuación fuera de rango (1-19)' }}
          hasInvalidScores={true}
          ageValidation={ageValidation}
          isCompleteCit={false}
          administeredSubtestCount={3}
        />
      );

      expect(screen.getByText(/Se han detectado 1 puntuación\(es\) fuera del rango psicométrico/)).toBeDefined();
      expect(screen.getByText(/Discrepancia en la edad del evaluado/)).toBeDefined();
    });
  });

  describe('4. CompositeScoreCards', () => {
    it('renders CIT hero card and primary cognitive indices', () => {
      const wiscResult = calculateWiscV({
        S: 10, V: 10, C: 10, PV: 10, M: 10, B: 10, D: 10, SD: 10, CL: 10, BS: 10,
      });

      render(
        <CompositeScoreCards
          battery="WISC-V"
          cit={wiscResult.cit}
          primaryIndices={wiscResult.primaryIndices}
          isCompleteCit={true}
          hasInvalidScores={false}
        />
      );

      expect(screen.getByText('Coeficiente Intelectual Total (CIT / FSIQ)')).toBeDefined();
      // Score 100 for CIT and indices
      expect(screen.getAllByText('100').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Pc\s*50/).length).toBeGreaterThan(0);
      expect(screen.getAllByText('Promedio').length).toBeGreaterThan(0);
    });
  });

  describe('5. Pure Vector SVG Charts', () => {
    it('renders ProfileScatterChart with SVG elements, guidelines, and stems', () => {
      const subtests = { S: 11, V: 11, C: 13, M: 14, B: 14, D: 9, CL: 7 };
      const sw = calculateStrengthsWeaknesses(subtests);

      const { container } = render(
        <ProfileScatterChart
          battery="WISC-V"
          subtests={subtests}
          strengthsWeaknesses={sw}
        />
      );

      const svg = container.querySelector('svg.psychometric-chart');
      expect(svg).not.toBeNull();
      expect(svg?.getAttribute('viewBox')).toBe('0 0 760 360');

      // Check for presence of circles and lines
      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThanOrEqual(7);

      // Check for S/W badges
      const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent);
      expect(texts).toContain('Media Sujeto: 11.3');
    });

    it('renders GaussianBellCurve with 7 shaded qualitative zones and CIT pin', () => {
      const wiscResult = calculateWiscV({
        S: 10, V: 10, C: 10, PV: 10, M: 10, B: 10, D: 10, SD: 10, CL: 10, BS: 10,
      });

      const { container } = render(
        <GaussianBellCurve
          battery="WISC-V"
          cit={wiscResult.cit}
          primaryIndices={wiscResult.primaryIndices}
          isCompleteCit={true}
        />
      );

      const svg = container.querySelector('svg.psychometric-chart');
      expect(svg).not.toBeNull();
      expect(svg?.getAttribute('viewBox')).toBe('0 0 760 340');

      // 7 shaded zone paths
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBeGreaterThanOrEqual(7);

      // Qualitative zone labels
      expect(screen.getByText('Muy Bajo')).toBeDefined();
      expect(screen.getByText('Limítrofe')).toBeDefined();
      expect(screen.getByText('Promedio Bajo')).toBeDefined();
      expect(screen.getAllByText('Promedio').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Promedio Alto')).toBeDefined();
      expect(screen.getByText('Superior')).toBeDefined();
      expect(screen.getByText('Muy Superior')).toBeDefined();

      // CIT Pin text badge
      expect(screen.getByText(/CIT: 100 \| Pc 50/)).toBeDefined();
    });
  });

  describe('6. Formal Clinical Report & Automated Narrative Engine', () => {
    it('renders InstitutionalHeader, DemographicsTable, and SignatureBlock', () => {
      const demographics = {
        nameOrId: 'L. F.',
        birthDate: '2016-04-08',
        testDate: '2026-09-22',
        examiner: 'Lic. Roberto Gómez',
        isAnonymized: true,
      };
      const ageValidation = validateAgeAndBattery(demographics.birthDate, demographics.testDate, 'WISC-V');

      render(
        <div>
          <InstitutionalHeader battery="WISC-V" />
          <DemographicsTable
            demographics={demographics}
            displayName="L. F."
            ageValidation={ageValidation}
          />
          <SignatureBlock
            examinerName={demographics.examiner}
            testDate={demographics.testDate}
          />
        </div>
      );

      expect(screen.getByText(/Centro de Neuropsicología y Psicología Clínica/i)).toBeDefined();
      expect(screen.getByText('L. F.')).toBeDefined();
      expect(screen.getByText(/Fdo.: Lic. Roberto Gómez/)).toBeDefined();
      expect(screen.getByText(/Sello/)).toBeDefined();
    });

    it('generates homogeneous narrative when delta < 23', () => {
      const wiscResult = calculateWiscV({
        S: 10, V: 10, C: 10, PV: 10, M: 10, B: 10, D: 10, SD: 10, CL: 10, BS: 10,
      });

      render(
        <AutomatedNarrative
          battery="WISC-V"
          displayName="Lucas"
          cit={wiscResult.cit}
          primaryIndices={wiscResult.primaryIndices}
          subtests={{ S: 10, V: 10, C: 10, PV: 10, M: 10, B: 10, D: 10, SD: 10, CL: 10, BS: 10 }}
          strengthsWeaknesses={wiscResult.strengthsWeaknesses}
          isCompleteCit={true}
        />
      );

      expect(screen.getByText(/homogéneo y equilibrado/i)).toBeDefined();
      expect(screen.getByText(/estimación global/i)).toBeDefined();
    });

    it('generates heterogeneous narrative when delta >= 23 points', () => {
      // Create high discrepancy: IRF = 121, IVP = 89 (diff = 32 points >= 23)
      const subtests = {
        S: 11, V: 11, C: 13, PV: 12, M: 14, B: 14, D: 9, SD: 9, CL: 7, BS: 9,
      };
      const wiscResult = calculateWiscV(subtests);

      render(
        <AutomatedNarrative
          battery="WISC-V"
          displayName="Lucas"
          cit={wiscResult.cit}
          primaryIndices={wiscResult.primaryIndices}
          subtests={subtests}
          strengthsWeaknesses={wiscResult.strengthsWeaknesses}
          isCompleteCit={true}
        />
      );

      expect(screen.getByText(/Advertencia de Heterogeneidad Clínica/i)).toBeDefined();
      expect(screen.getByText(/debe interpretarse con cautela/i)).toBeDefined();
    });

    it('renders complete ClinicalReportView without throwing errors', () => {
      const subtests = { S: 10, V: 10, C: 10, PV: 10, M: 10, B: 10, D: 10, SD: 10, CL: 10, BS: 10 };
      const wiscResult = calculateWiscV(subtests);
      const demographics = {
        nameOrId: 'Lucas Fernández',
        birthDate: '2016-04-08',
        testDate: '2026-09-22',
        examiner: 'Lic. Roberto Gómez',
        isAnonymized: false,
      };
      const ageValidation = validateAgeAndBattery(demographics.birthDate, demographics.testDate, 'WISC-V');

      render(
        <ClinicalReportView
          battery="WISC-V"
          demographics={demographics}
          displayName="Lucas Fernández"
          ageValidation={ageValidation}
          cit={wiscResult.cit}
          primaryIndices={wiscResult.primaryIndices}
          subtests={subtests}
          strengthsWeaknesses={wiscResult.strengthsWeaknesses}
          isCompleteCit={true}
        />
      );

      expect(screen.getByText('I. Datos de Identificación y Filiación Clínica')).toBeDefined();
      expect(screen.getByText('II. Resumen de Puntuaciones Compuestas e Índices Primarios')).toBeDefined();
      expect(screen.getByText('III. Puntuaciones Escalares y Análisis de Dispersión Intraindividual')).toBeDefined();
      expect(screen.getByText('IV. Interpretación Clínica y Juicio Diagnóstico Automatizado')).toBeDefined();
    });
  });

  describe('7. Full App Integration & Tab Traversal', () => {
    it('mounts full App and toggles between Calculator and Report views', () => {
      render(<App />);

      expect(screen.getByText('PSICOCALC')).toBeDefined();
      expect(screen.getByText('Datos del Evaluado y Protocolo')).toBeDefined();

      // Click "Informe Clínico" tab
      const reportTabBtn = screen.getByRole('button', { name: /^Informe Clínico$/i });
      fireEvent.click(reportTabBtn);

      // Verify report view headings appear
      expect(screen.getByText('I. Datos de Identificación y Filiación Clínica')).toBeDefined();
      expect(screen.getByText('II. Resumen de Puntuaciones Compuestas e Índices Primarios')).toBeDefined();

      // Switch back to Calculator
      const calcTabBtn = screen.getByRole('button', { name: /^Calculadora$/i });
      fireEvent.click(calcTabBtn);

      expect(screen.getByText('Datos del Evaluado y Protocolo')).toBeDefined();
    });
  });
});
