import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../App';
import { ClinicalSessionProvider } from '../../ui/context/ClinicalSessionContext';
import { CatalogExplorer } from '../../ui/components/catalog/CatalogExplorer';
import {
  LikertMatrixInputCard,
  SpeedAccuracyInputCard,
  DomainChecklistScreeningCard,
  BaseRateMultiScaleCard,
  AdaptiveSkillDomainCard,
  Raven2InputCard,
} from '../../ui/components/forms';

describe('Milestone M2-UI — Universal Catalog Explorer & Specialized Multitest Forms', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // 1. Universal Catalog Explorer Tests
  // ==========================================================================
  describe('1. Universal Catalog Explorer (CatalogExplorer)', () => {
    it('renders all 19 psychometric instruments on initial display', () => {
      render(
        <ClinicalSessionProvider>
          <CatalogExplorer />
        </ClinicalSessionProvider>
      );

      // Verify the 19 instrument cards exist
      const expectedIds = [
        'wisc_v', 'wais_iv', 'raven_2',
        'd2_r', 'neuropsi_breve', 'mmse', 'moca',
        'mmpi_3', 'pai', 'mcmi_iv',
        'abas_3', 'vineland_3',
        'sena', 'cbcl', 'byi_2', 'sdq', 'phq_9', 'gad_7',
        'htp',
      ];

      for (const id of expectedIds) {
        expect(screen.getByTestId(`catalog-card-${id}`)).toBeDefined();
      }

      expect(screen.getByText(/35 de 35 disponibles/i)).toBeDefined();
    });

    it('filters instruments dynamically via keyword search bar without reload', () => {
      render(
        <ClinicalSessionProvider>
          <CatalogExplorer />
        </ClinicalSessionProvider>
      );

      const searchInput = screen.getByRole('searchbox');

      // Search for "atención" -> should match D2-R, NEUROPSI Breve
      fireEvent.change(searchInput, { target: { value: 'atención' } });

      expect(screen.getByTestId('catalog-card-d2_r')).toBeDefined();
      expect(screen.queryByTestId('catalog-card-wais_iv')).toBeNull();

      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByTestId('catalog-card-wais_iv')).toBeDefined();

      // Search by acronym "MMPI-3"
      fireEvent.change(searchInput, { target: { value: 'MMPI-3' } });
      expect(screen.getByTestId('catalog-card-mmpi_3')).toBeDefined();
      expect(screen.queryByTestId('catalog-card-wisc_v')).toBeNull();
    });

    it('filters instruments by clinical domain filter chips', () => {
      render(
        <ClinicalSessionProvider>
          <CatalogExplorer />
        </ClinicalSessionProvider>
      );

      // Filter by "Personalidad & Psicopatología"
      const personalityChip = screen.getByRole('button', {
        name: /Personalidad & Psicopatología/i,
      });
      fireEvent.click(personalityChip);

      expect(screen.getByTestId('catalog-card-mmpi_3')).toBeDefined();
      expect(screen.getByTestId('catalog-card-pai')).toBeDefined();
      expect(screen.getByTestId('catalog-card-mcmi_iv')).toBeDefined();
      expect(screen.queryByTestId('catalog-card-wisc_v')).toBeNull();
      expect(screen.queryByTestId('catalog-card-d2_r')).toBeNull();

      // Filter by "Conducta Adaptativa & Desarrollo"
      const adaptiveChip = screen.getByRole('button', {
        name: /Conducta Adaptativa & Desarrollo/i,
      });
      fireEvent.click(adaptiveChip);

      expect(screen.getByTestId('catalog-card-abas_3')).toBeDefined();
      expect(screen.getByTestId('catalog-card-vineland_3')).toBeDefined();
      expect(screen.queryByTestId('catalog-card-mmpi_3')).toBeNull();

      // Return to "Todos"
      const allChip = screen.getByRole('button', { name: /^Todos\b/i });
      fireEvent.click(allChip);
      expect(screen.getByTestId('catalog-card-wisc_v')).toBeDefined();
      expect(screen.getByTestId('catalog-card-mmpi_3')).toBeDefined();
    });

    it('filters instruments by age target segment pills', () => {
      render(
        <ClinicalSessionProvider>
          <CatalogExplorer />
        </ClinicalSessionProvider>
      );

      // Filter by "Infantil (0-11)"
      const childPill = screen.getByRole('button', { name: /Infantil \(0-11\)/i });
      fireEvent.click(childPill);

      expect(screen.getByTestId('catalog-card-wisc_v')).toBeDefined();
      expect(screen.getByTestId('catalog-card-sena')).toBeDefined();
      expect(screen.getByTestId('catalog-card-cbcl')).toBeDefined();
      // Adult only instruments must be excluded
      expect(screen.queryByTestId('catalog-card-wais_iv')).toBeNull();
      expect(screen.queryByTestId('catalog-card-mmpi_3')).toBeNull();
      expect(screen.queryByTestId('catalog-card-pai')).toBeNull();
    });

    it('activates and transitions to test form when clicking "Administrar / Abrir"', () => {
      render(<App />);

      // 1. Switch to Catálogo Universal via Header tab
      const catalogHeaderBtn = screen.getAllByRole('button', { name: /Catálogo Universal/i })[0];
      fireEvent.click(catalogHeaderBtn);

      expect(screen.getByTestId('catalog-module')).toBeDefined();

      // 2. Click "Administrar / Abrir" on D2-R card
      const d2rCard = screen.getByTestId('catalog-card-d2_r');
      const openBtn = d2rCard.querySelector('button');
      expect(openBtn).toBeDefined();
      fireEvent.click(openBtn!);

      // 3. Verifies smooth navigation to D2-R SpeedAccuracy form
      expect(screen.getByTestId('speed-accuracy-form')).toBeDefined();
      expect(screen.getByText(/D2-R — Test de Atención y Concentración/i)).toBeDefined();
    });
  });

  // ==========================================================================
  // 2. Specialized Input Form Archetypes Tests
  // ==========================================================================
  describe('2. Specialized Input Form Archetypes', () => {
    describe('LikertMatrixInputCard (MMPI-3, PAI, SENA, CBCL, BYI-2)', () => {
      it('calculates MMPI-3 clinical elevations and triggers suicide alert on SUI >= 65', () => {
        render(
          <ClinicalSessionProvider>
            <LikertMatrixInputCard batteryId="mmpi_3" />
          </ClinicalSessionProvider>
        );

        expect(screen.getByTestId('likert-form-mmpi_3')).toBeDefined();

        // Load clinical sample
        const clinicalBtn = screen.getByRole('button', { name: /Muestra Clínica/i });
        fireEvent.click(clinicalBtn);

        // Verify suicide risk alert banner triggers
        expect(screen.getByTestId('critical-suicide-banner')).toBeDefined();
        expect(screen.getByText(/ALERTA DE SEGURIDAD CLÍNICA PRIORITARIA/i)).toBeDefined();

        // Verify protocol is valid
        expect(screen.getByText(/Protocolo VÁLIDO/i)).toBeDefined();
      });

      it('detects invalid protocol in MMPI-3 when VRIN/CRIN >= 80', () => {
        render(
          <ClinicalSessionProvider>
            <LikertMatrixInputCard batteryId="mmpi_3" />
          </ClinicalSessionProvider>
        );

        // Load invalid sample
        const invalidBtn = screen.getByRole('button', { name: /Protocolo Inválido/i });
        fireEvent.click(invalidBtn);

        expect(screen.getByTestId('protocol-invalid-banner')).toBeDefined();
        expect(screen.getByText(/PROTOCOLO PROTOCOLARMENTE INVÁLIDO/i)).toBeDefined();
      });

      it('calculates PAI and triggers critical risk banner when SUI >= 80', () => {
        render(
          <ClinicalSessionProvider>
            <LikertMatrixInputCard batteryId="pai" />
          </ClinicalSessionProvider>
        );

        const clinicalBtn = screen.getByRole('button', { name: /Muestra Clínica/i });
        fireEvent.click(clinicalBtn);

        expect(screen.getByTestId('critical-suicide-banner')).toBeDefined();
        expect(screen.getByText(/Protocolo VÁLIDO/i)).toBeDefined();
      });

      it('calculates SENA with protective scale deficits and suicide red flag', () => {
        render(
          <ClinicalSessionProvider>
            <LikertMatrixInputCard batteryId="sena" />
          </ClinicalSessionProvider>
        );

        const clinicalBtn = screen.getByRole('button', { name: /Muestra Clínica/i });
        fireEvent.click(clinicalBtn);

        // Red flag banner
        expect(screen.getByTestId('critical-suicide-banner')).toBeDefined();
      });
    });

    describe('SpeedAccuracyInputCard (D2-R)', () => {
      it('reactively computes TOT, CON, and CP% on input change and preset loading', () => {
        render(
          <ClinicalSessionProvider>
            <SpeedAccuracyInputCard />
          </ClinicalSessionProvider>
        );

        // Load optimal sample (TR=540, TA=220, O=8, C=4)
        const optimalBtn = screen.getByRole('button', { name: /Muestra Óptima/i });
        fireEvent.click(optimalBtn);

        expect(screen.getByText('216')).toBeDefined(); // CON = 220 - 4
        expect(screen.getByText('12')).toBeDefined();  // TOT = 8 + 4
        expect(screen.getByText('2.2%')).toBeDefined(); // CP%

        // Load impulsive sample
        const impulsiveBtn = screen.getByRole('button', { name: /Estilo Impulsivo/i });
        fireEvent.click(impulsiveBtn);

        expect(screen.getByText('115')).toBeDefined(); // CON = 160 - 45
        expect(screen.getByTestId('d2r-clinical-note')).toBeDefined();
      });

      it('rejects mathematical invariant when TA > TR', () => {
        render(
          <ClinicalSessionProvider>
            <SpeedAccuracyInputCard />
          </ClinicalSessionProvider>
        );

        const trInput = screen.getByLabelText(/Total Caracteres Revisados/i);
        const taInput = screen.getByLabelText(/Total Aciertos/i);

        fireEvent.change(trInput, { target: { value: '200' } });
        fireEvent.change(taInput, { target: { value: '250' } });

        expect(screen.getByTestId('d2r-validation-error')).toBeDefined();
        expect(screen.getByText(/TA \(250\) no puede superar a TR \(200\)/i)).toBeDefined();
      });

      it('displays invalidation banner when error rate CP% > 40%', () => {
        render(
          <ClinicalSessionProvider>
            <SpeedAccuracyInputCard />
          </ClinicalSessionProvider>
        );

        const invalidBtn = screen.getByRole('button', { name: /Protocolo Inválido/i });
        fireEvent.click(invalidBtn);

        expect(screen.getByTestId('d2r-invalidation-banner')).toBeDefined();
      });
    });

    describe('DomainChecklistScreeningCard (NEUROPSI Breve & MMSE)', () => {
      it('calculates NEUROPSI Breve with education and age stratification and triggers cutoff alert', () => {
        render(
          <ClinicalSessionProvider>
            <DomainChecklistScreeningCard instrumentId="neuropsi_breve" />
          </ClinicalSessionProvider>
        );

        // Load moderate impairment preset (age 68, edu 7, score 76)
        const moderateBtn = screen.getByRole('button', { name: /Deterioro Moderado/i });
        fireEvent.click(moderateBtn);

        expect(screen.getByTestId('screening-cutoff-alert')).toBeDefined();
        expect(screen.getByText(/Alteración Moderada/i)).toBeDefined();
      });

      it('calculates MMSE with NORMACODEM demographic adjustment', () => {
        render(
          <ClinicalSessionProvider>
            <DomainChecklistScreeningCard instrumentId="mmse" />
          </ClinicalSessionProvider>
        );

        // Load moderate preset (age 78, edu 6, raw 23 -> delta +2 -> adjusted 25)
        const moderateBtn = screen.getByRole('button', { name: /Deterioro Moderado/i });
        fireEvent.click(moderateBtn);

        expect(screen.getByText('25')).toBeDefined(); // Adjusted score
        expect(screen.getByText(/Directa: 23 ptos/i)).toBeDefined();
      });
    });

    describe('BaseRateMultiScaleCard (MCMI-IV)', () => {
      it('maps Base Rate (TB) scores and flags presence (TB >= 75) and prominence (TB >= 85)', () => {
        render(
          <ClinicalSessionProvider>
            <BaseRateMultiScaleCard />
          </ClinicalSessionProvider>
        );

        // Load clinical preset
        const clinicalBtn = screen.getByRole('button', { name: /Límite & Depresión/i });
        fireEvent.click(clinicalBtn);

        // Check summary presence & prominence
        expect(screen.getByText(/Protocolo VÁLIDO/i)).toBeDefined();
        expect(screen.getAllByText(/C \(TB=88\)/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/CC \(TB=86\)/i).length).toBeGreaterThan(0);
      });

      it('flags protocol invalidation when Scale V >= 2', () => {
        render(
          <ClinicalSessionProvider>
            <BaseRateMultiScaleCard />
          </ClinicalSessionProvider>
        );

        const invalidBtn = screen.getByRole('button', { name: /Protocolo Inválido/i });
        fireEvent.click(invalidBtn);

        expect(screen.getByTestId('mcmi4-invalidation-banner')).toBeDefined();
      });
    });

    describe('AdaptiveSkillDomainCard (ABAS-3 & Vineland-3)', () => {
      it('calculates ABAS-3 and triggers DSM-5/AAIDD alert on GAC <= 69', () => {
        render(
          <ClinicalSessionProvider>
            <AdaptiveSkillDomainCard batteryId="abas_3" />
          </ClinicalSessionProvider>
        );

        const deficitBtn = screen.getByRole('button', { name: /Déficit Adaptativo/i });
        fireEvent.click(deficitBtn);

        expect(screen.getByTestId('adaptive-deficit-alert')).toBeDefined();
        expect(screen.getAllByText('62').length).toBeGreaterThan(0); // GAC composite
        expect(screen.getByText(/DÉFICIT SIGNIFICATIVO/i)).toBeDefined();
      });

      it('calculates Vineland-3 and triggers clinical alert on ABC <= 70', () => {
        render(
          <ClinicalSessionProvider>
            <AdaptiveSkillDomainCard batteryId="vineland_3" />
          </ClinicalSessionProvider>
        );

        const deficitBtn = screen.getByRole('button', { name: /Déficit Adaptativo/i });
        fireEvent.click(deficitBtn);

        expect(screen.getByTestId('adaptive-deficit-alert')).toBeDefined();
        expect(screen.getByText('63')).toBeDefined(); // ABC composite
      });
    });

    describe('Raven2InputCard (Raven 2)', () => {
      it('computes nonverbal standard IQ and percentiles reactively', () => {
        render(
          <ClinicalSessionProvider>
            <Raven2InputCard />
          </ClinicalSessionProvider>
        );

        const superiorBtn = screen.getByRole('button', { name: /Capacidad Superior/i });
        fireEvent.click(superiorBtn);

        expect(screen.getByText('135')).toBeDefined(); // Standard score for raw 40 at age 10
        expect(screen.getByText(/Muy Superior/i)).toBeDefined();
      });
    });
  });

  // ==========================================================================
  // 3. Multi-Test State Isolation & Persistence Verification
  // ==========================================================================
  describe('3. Multi-Test State Isolation & Persistence across Navigation Traversal', () => {
    it('persists inputs across WISC-V, Catalog Explorer, and newly activated batteries without state collision', () => {
      render(<App />);

      // 1. Enter custom score in WISC-V (Cubos)
      const cubosInput = screen.getByLabelText(/Cubos/i);
      fireEvent.change(cubosInput, { target: { value: '17' } });
      expect((cubosInput as HTMLInputElement).value).toBe('17');

      // 2. Navigate to Catalog Universal
      const catalogBtn = screen.getAllByRole('button', { name: /Catálogo Universal/i })[0];
      fireEvent.click(catalogBtn);

      expect(screen.getByTestId('catalog-module')).toBeDefined();

      // 3. Activate and open D2-R
      const d2rCard = screen.getByTestId('catalog-card-d2_r');
      const openD2rBtn = d2rCard.querySelector('button');
      fireEvent.click(openD2rBtn!);

      expect(screen.getByTestId('speed-accuracy-form')).toBeDefined();

      // Enter D2-R values
      const trInput = screen.getByLabelText(/Total Caracteres Revisados/i);
      fireEvent.change(trInput, { target: { value: '520' } });

      // 4. Navigate back to WISC-V via category tab
      const intelTab = screen.getByRole('button', { name: /Inteligencia & Cognición/i });
      fireEvent.click(intelTab);

      // Verify WISC-V Cubos still has 17!
      const cubosAfter = screen.getByLabelText(/Cubos/i);
      expect((cubosAfter as HTMLInputElement).value).toBe('17');

      // 5. Navigate back to D2-R via Active Batteries select dropdown
      const activeSelect = screen.getByLabelText(/Seleccionar batería activa/i);
      fireEvent.change(activeSelect, { target: { value: 'd2_r' } });

      const trAfter = screen.getByLabelText(/Total Caracteres Revisados/i);
      expect((trAfter as HTMLInputElement).value).toBe('520');
    });

    it('toggles patient anonymization in 1 click from header and masks name', () => {
      render(<App />);

      // Check header anonymize button
      const anonBtn = screen.getByRole('button', { name: /Alternar anonimización de paciente/i });
      expect(anonBtn).toBeDefined();

      fireEvent.click(anonBtn);

      // Expect mask to be active
      expect(screen.getByText(/Anonimizado \(1-Clic\)/i)).toBeDefined();
    });
  });
});
