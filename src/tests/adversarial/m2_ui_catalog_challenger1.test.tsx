import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../../App';
import {
  ClinicalSessionProvider,
  useClinicalSession,
} from '../../ui/context/ClinicalSessionContext';
import { CatalogExplorer } from '../../ui/components/catalog/CatalogExplorer';

// Dynamic test harness enabling systematic reactive mutations in session state
// while inspecting CatalogExplorer rendered DOM.
const DynamicHarness: React.FC = () => {
  const session = useClinicalSession();

  return (
    <div>
      <div data-testid="harness-actions" className="hidden">
        {/* D2-R actions */}
        <button
          data-testid="act-d2r-progress"
          onClick={() => session.setBatteryData('d2_r', { tr: 0, ta: 25, o: 0, c: 0 })}
        >
          D2R Progress
        </button>
        <button
          data-testid="act-d2r-complete"
          onClick={() =>
            session.setBatteryData('d2_r', { tr: 480, ta: 485, o: 5, c: 2 })
          }
        >
          D2R Complete
        </button>
        <button
          data-testid="act-d2r-alert"
          onClick={() =>
            session.setBatteryData('d2_r', { tr: 480, ta: 450, o: 10, c: 65 })
          }
        >
          D2R Alert
        </button>

        {/* PHQ-9 actions */}
        <button
          data-testid="act-phq9-progress"
          onClick={() => session.setBatteryData('phq_9', { responses: { 1: 1 } })}
        >
          PHQ9 Progress
        </button>
        <button
          data-testid="act-phq9-complete"
          onClick={() =>
            session.setBatteryData('phq_9', {
              responses: { 1: 1, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
            })
          }
        >
          PHQ9 Complete
        </button>
        <button
          data-testid="act-phq9-alert"
          onClick={() => session.setBatteryData('phq_9', { responses: { 1: 0, 9: 2 } })}
        >
          PHQ9 Alert
        </button>

        {/* GAD-7 actions */}
        <button
          data-testid="act-gad7-progress"
          onClick={() => session.setBatteryData('gad_7', { responses: { 1: 1 } })}
        >
          GAD7 Progress
        </button>
        <button
          data-testid="act-gad7-complete"
          onClick={() =>
            session.setBatteryData('gad_7', {
              responses: { 1: 1, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
            })
          }
        >
          GAD7 Complete
        </button>

        {/* SDQ actions */}
        <button
          data-testid="act-sdq-progress"
          onClick={() => session.setBatteryData('sdq', { informant: 'parent', responses: { 1: 1 } })}
        >
          SDQ Progress
        </button>

        {/* MMPI-3 actions */}
        <button
          data-testid="act-mmpi3-complete"
          onClick={() =>
            session.setBatteryData('mmpi_3', {
              tScores: { SUI: 45, VRIN: 50, CRIN: 50, RCd: 50 },
            })
          }
        >
          MMPI3 Complete
        </button>
        <button
          data-testid="act-mmpi3-alert"
          onClick={() =>
            session.setBatteryData('mmpi_3', {
              tScores: { SUI: 75, VRIN: 50, CRIN: 50, RCd: 70 },
            })
          }
        >
          MMPI3 Alert
        </button>

        {/* PAI actions */}
        <button
          data-testid="act-pai-complete"
          onClick={() =>
            session.setBatteryData('pai', {
              tScores: { SUI: 50, SOM: 50, ANX: 50 },
            })
          }
        >
          PAI Complete
        </button>
        <button
          data-testid="act-pai-alert"
          onClick={() =>
            session.setBatteryData('pai', {
              tScores: { SUI: 78, SOM: 60, ANX: 70 },
            })
          }
        >
          PAI Alert
        </button>

        {/* MCMI-IV actions */}
        <button
          data-testid="act-mcmi4-complete"
          onClick={() =>
            session.setBatteryData('mcmi_iv', {
              baseRates: { '2A': 60, '1': 55 },
            })
          }
        >
          MCMI4 Complete
        </button>
        <button
          data-testid="act-mcmi4-alert"
          onClick={() =>
            session.setBatteryData('mcmi_iv', {
              baseRates: { '2A': 88, '1': 60 },
            })
          }
        >
          MCMI4 Alert
        </button>

        {/* BYI-2 actions */}
        <button
          data-testid="act-byi2-complete"
          onClick={() =>
            session.setBatteryData('byi_2', {
              tScores: { DEP: 50, ANX: 50 },
              suicidalItemResponse: 0,
            })
          }
        >
          BYI2 Complete
        </button>
        <button
          data-testid="act-byi2-alert"
          onClick={() =>
            session.setBatteryData('byi_2', {
              tScores: { DEP: 75, ANX: 70 },
              suicidalItemResponse: 2,
            })
          }
        >
          BYI2 Alert
        </button>

        {/* NEUROPSI Breve actions */}
        <button
          data-testid="act-neuropsi-complete"
          onClick={() =>
            session.setBatteryData('neuropsi_breve', {
              totalRawScore: 115,
              age: 30,
              educationYears: 12,
            })
          }
        >
          NEUROPSI Complete
        </button>
        <button
          data-testid="act-neuropsi-alert"
          onClick={() =>
            session.setBatteryData('neuropsi_breve', {
              totalRawScore: 35,
              age: 30,
              educationYears: 12,
            })
          }
        >
          NEUROPSI Alert
        </button>

        {/* MMSE actions */}
        <button
          data-testid="act-mmse-complete"
          onClick={() =>
            session.setBatteryData('mmse', {
              rawScore: 28,
              age: 65,
              educationYears: 12,
            })
          }
        >
          MMSE Complete
        </button>
        <button
          data-testid="act-mmse-alert"
          onClick={() =>
            session.setBatteryData('mmse', {
              rawScore: 18,
              age: 65,
              educationYears: 12,
            })
          }
        >
          MMSE Alert
        </button>

        {/* ABAS-3 actions */}
        <button
          data-testid="act-abas3-complete"
          onClick={() =>
            session.setBatteryData('abas_3', {
              skillAreas: {
                COM: 10,
                HAF: 10,
                AD: 10,
                OC: 10,
                SOC: 10,
                UC: 10,
                VH: 10,
                SS: 10,
                AC: 10,
              },
            })
          }
        >
          ABAS3 Complete
        </button>
        <button
          data-testid="act-abas3-alert"
          onClick={() =>
            session.setBatteryData('abas_3', {
              skillAreas: {
                COM: 3,
                HAF: 3,
                AD: 3,
                OC: 3,
                SOC: 3,
                UC: 3,
                VH: 3,
                SS: 3,
                AC: 3,
              },
            })
          }
        >
          ABAS3 Alert
        </button>

        {/* Vineland-3 actions */}
        <button
          data-testid="act-vineland3-complete"
          onClick={() =>
            session.setBatteryData('vineland_3', {
              subdomains: {
                receptive: 15,
                expressive: 15,
                written: 15,
                personal: 15,
                domestic: 15,
                community: 15,
                interpersonal: 15,
                playLeisure: 15,
                coping: 15,
              },
            })
          }
        >
          Vineland3 Complete
        </button>
        <button
          data-testid="act-vineland3-alert"
          onClick={() =>
            session.setBatteryData('vineland_3', {
              subdomains: {
                receptive: 3,
                expressive: 3,
                written: 3,
                personal: 3,
                domestic: 3,
                community: 3,
                interpersonal: 3,
                playLeisure: 3,
                coping: 3,
              },
            })
          }
        >
          Vineland3 Alert
        </button>

        {/* SENA actions */}
        <button
          data-testid="act-sena-complete"
          onClick={() =>
            session.setBatteryData('sena', {
              tScores: { ATE: 50, HIP: 50 },
              criticalItems: {},
            })
          }
        >
          SENA Complete
        </button>
        <button
          data-testid="act-sena-alert"
          onClick={() =>
            session.setBatteryData('sena', {
              tScores: { ATE: 75, HIP: 70 },
              criticalItems: { suicidalIdeation: true },
            })
          }
        >
          SENA Alert
        </button>
      </div>

      <CatalogExplorer />
    </div>
  );
};

describe('Empirical Challenger 1 — Milestone M2-UI: Catalog Explorer Adversarial Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Dimension 1: Search Filtering Edge Cases, Accents, Case, & Empty States
  // ==========================================================================
  describe('Dimension 1: Search Filtering Edge Cases & Diacritic/Case Insensitivity', () => {
    it('accurately resolves accented Spanish search queries ("atención", "evaluación", "depresión")', () => {
      render(
        <ClinicalSessionProvider>
          <CatalogExplorer />
        </ClinicalSessionProvider>
      );

      const searchInput = screen.getByRole('searchbox');

      // 1. Accented query "atención" -> matches D2-R
      fireEvent.change(searchInput, { target: { value: 'atención' } });
      expect(screen.getByTestId('catalog-card-d2_r')).toBeDefined();
      expect(screen.queryByTestId('catalog-card-wais_iv')).toBeNull();
      expect(screen.queryByTestId('catalog-card-mmpi_3')).toBeNull();

      // 2. Accented query "evaluación" -> matches NEUROPSI Breve, ABAS-3, PAI, SENA, MoCA
      fireEvent.change(searchInput, { target: { value: 'evaluación' } });
      expect(screen.getByTestId('catalog-card-neuropsi_breve')).toBeDefined();
      expect(screen.getByTestId('catalog-card-abas_3')).toBeDefined();
      expect(screen.getByTestId('catalog-card-pai')).toBeDefined();
      expect(screen.getByTestId('catalog-card-sena')).toBeDefined();
      expect(screen.getByTestId('catalog-card-moca')).toBeDefined();
      expect(screen.queryByTestId('catalog-card-wais_iv')).toBeNull();
      expect(screen.queryByTestId('catalog-card-d2_r')).toBeNull();

      // 3. Accented query "depresión" -> matches PHQ-9 (fullName includes Depresión)
      fireEvent.change(searchInput, { target: { value: 'depresión' } });
      expect(screen.getByTestId('catalog-card-phq_9')).toBeDefined();
      expect(screen.queryByTestId('catalog-card-wisc_v')).toBeNull();

      // 4. Unaccented query "atencion" -> matches D2-R via keywords
      fireEvent.change(searchInput, { target: { value: 'atencion' } });
      expect(screen.getByTestId('catalog-card-d2_r')).toBeDefined();

      // 5. Diacritic boundary check: "evaluacion" (unaccented) yields 0 because
      // keywords lack unaccented variation while fullName has "Evaluación"
      fireEvent.change(searchInput, { target: { value: 'evaluacion' } });
      expect(screen.queryByTestId('catalog-card-neuropsi_breve')).toBeNull();
      expect(
        screen.getByText(/No se encontraron instrumentos para el filtro seleccionado/i)
      ).toBeDefined();
    });

    it('enforces case insensitivity across uppercase, titlecase, and mixedcase searches', () => {
      render(
        <ClinicalSessionProvider>
          <CatalogExplorer />
        </ClinicalSessionProvider>
      );

      const searchInput = screen.getByRole('searchbox');

      // Uppercase "ATENCIÓN"
      fireEvent.change(searchInput, { target: { value: 'ATENCIÓN' } });
      expect(screen.getByTestId('catalog-card-d2_r')).toBeDefined();
      expect(screen.queryByTestId('catalog-card-wais_iv')).toBeNull();

      // Mixed case "AtEnCiÓn"
      fireEvent.change(searchInput, { target: { value: 'AtEnCiÓn' } });
      expect(screen.getByTestId('catalog-card-d2_r')).toBeDefined();

      // Uppercase "EVALUACIÓN"
      fireEvent.change(searchInput, { target: { value: 'EVALUACIÓN' } });
      expect(screen.getByTestId('catalog-card-neuropsi_breve')).toBeDefined();
      expect(screen.getByTestId('catalog-card-abas_3')).toBeDefined();

      // Mixed case acronym "mMpI-3"
      fireEvent.change(searchInput, { target: { value: 'mMpI-3' } });
      expect(screen.getByTestId('catalog-card-mmpi_3')).toBeDefined();
      expect(screen.queryByTestId('catalog-card-wisc_v')).toBeNull();

      // All caps "RAVEN 2"
      fireEvent.change(searchInput, { target: { value: 'RAVEN 2' } });
      expect(screen.getByTestId('catalog-card-raven_2')).toBeDefined();
    });

    it('handles special characters, hyphens, and whitespace padding gracefully', () => {
      render(
        <ClinicalSessionProvider>
          <CatalogExplorer />
        </ClinicalSessionProvider>
      );

      const searchInput = screen.getByRole('searchbox');

      // Hyphenated names
      const hyphenatedTests = [
        { query: 'D2-R', card: 'catalog-card-d2_r' },
        { query: 'MMPI-3', card: 'catalog-card-mmpi_3' },
        { query: 'WISC-V', card: 'catalog-card-wisc_v' },
        { query: 'WAIS-IV', card: 'catalog-card-wais_iv' },
        { query: 'PHQ-9', card: 'catalog-card-phq_9' },
        { query: 'GAD-7', card: 'catalog-card-gad_7' },
        { query: 'BYI-2', card: 'catalog-card-byi_2' },
        { query: 'ABAS-3', card: 'catalog-card-abas_3' },
        { query: 'Vineland-3', card: 'catalog-card-vineland_3' },
        { query: 'MCMI-IV', card: 'catalog-card-mcmi_iv' },
      ];

      for (const item of hyphenatedTests) {
        fireEvent.change(searchInput, { target: { value: item.query } });
        expect(screen.getByTestId(item.card)).toBeDefined();
      }

      // Whitespace and tab trimming
      fireEvent.change(searchInput, { target: { value: '   atención   ' } });
      expect(screen.getByTestId('catalog-card-d2_r')).toBeDefined();

      fireEvent.change(searchInput, { target: { value: '\tWISC-V\n ' } });
      expect(screen.getByTestId('catalog-card-wisc_v')).toBeDefined();
    });

    it('renders empty state upon non-matching strings, special characters, or XSS vectors and recovers on reset', () => {
      render(
        <ClinicalSessionProvider>
          <CatalogExplorer />
        </ClinicalSessionProvider>
      );

      const searchInput = screen.getByRole('searchbox');

      // Non-matching adversarial query
      fireEvent.change(searchInput, {
        target: { value: '!@#$%^&*()_NON_MATCHING_FUZZ_VECTOR_12345' },
      });

      // Verify 0 instrument cards rendered
      expect(screen.queryByTestId('catalog-card-wisc_v')).toBeNull();
      expect(screen.queryByTestId('catalog-card-d2_r')).toBeNull();
      expect(screen.queryByTestId('catalog-grid')).toBeNull();

      // Verify empty state display elements
      expect(
        screen.getByText(/No se encontraron instrumentos para el filtro seleccionado/i)
      ).toBeDefined();
      expect(
        screen.getByText(/Intenta cambiar los términos de búsqueda/i)
      ).toBeDefined();

      // Click "Restablecer todos los filtros"
      const resetBtn = screen.getByRole('button', {
        name: /Restablecer todos los filtros/i,
      });
      fireEvent.click(resetBtn);

      // Verify recovery to all 19 instruments
      expect(screen.getByTestId('catalog-card-wisc_v')).toBeDefined();
      expect(screen.getByTestId('catalog-card-mmpi_3')).toBeDefined();
      expect(screen.getByText(/35 de 35 disponibles/i)).toBeDefined();

      // Test "X" button to clear search input directly
      fireEvent.change(searchInput, { target: { value: '<script>alert(1)</script>' } });
      expect(screen.queryByTestId('catalog-card-wisc_v')).toBeNull();

      const clearXBtn = screen.getByLabelText(/Limpiar búsqueda/i);
      fireEvent.click(clearXBtn);

      expect(screen.getByTestId('catalog-card-wisc_v')).toBeDefined();
      expect(searchInput).toHaveProperty('value', '');
    });
  });

  // ==========================================================================
  // Dimension 2: Systematic Domain Filtering Across All 6 Clinical Domains
  // ==========================================================================
  describe('Dimension 2: Domain Filtering Across All 6 Clinical Domains and Mutual Exclusivity', () => {
    it('strictly isolates instruments by clinical domain with correct counts and zero cross-leakage', () => {
      render(
        <ClinicalSessionProvider>
          <CatalogExplorer />
        </ClinicalSessionProvider>
      );

      // 1. Intelligence & Aptitudes (3 instruments)
      const intelChip = screen.getByRole('button', {
        name: /Inteligencia & Aptitudes/i,
      });
      fireEvent.click(intelChip);

      expect(screen.getByTestId('catalog-card-wisc_v')).toBeDefined();
      expect(screen.getByTestId('catalog-card-wais_iv')).toBeDefined();
      expect(screen.getByTestId('catalog-card-raven_2')).toBeDefined();
      // Ensure other domains are excluded
      expect(screen.queryByTestId('catalog-card-d2_r')).toBeNull();
      expect(screen.queryByTestId('catalog-card-mmpi_3')).toBeNull();
      expect(screen.queryByTestId('catalog-card-abas_3')).toBeNull();
      expect(screen.queryByTestId('catalog-card-sena')).toBeNull();
      expect(screen.queryByTestId('catalog-card-htp')).toBeNull();
      expect(screen.getByText(/5 de 35 disponibles/i)).toBeDefined();

      // 2. Neuropsychology & Attention (4 instruments)
      const neuroChip = screen.getByRole('button', {
        name: /Neuropsicología & Atención/i,
      });
      fireEvent.click(neuroChip);

      expect(screen.getByTestId('catalog-card-d2_r')).toBeDefined();
      expect(screen.getByTestId('catalog-card-neuropsi_breve')).toBeDefined();
      expect(screen.getByTestId('catalog-card-mmse')).toBeDefined();
      expect(screen.getByTestId('catalog-card-moca')).toBeDefined();
      expect(screen.queryByTestId('catalog-card-wisc_v')).toBeNull();
      expect(screen.queryByTestId('catalog-card-mmpi_3')).toBeNull();
      expect(screen.getByText(/8 de 35 disponibles/i)).toBeDefined();

      // 3. Personality & Psychopathology (3 instruments)
      const persChip = screen.getByRole('button', {
        name: /Personalidad & Psicopatología/i,
      });
      fireEvent.click(persChip);

      expect(screen.getByTestId('catalog-card-mmpi_3')).toBeDefined();
      expect(screen.getByTestId('catalog-card-pai')).toBeDefined();
      expect(screen.getByTestId('catalog-card-mcmi_iv')).toBeDefined();
      expect(screen.queryByTestId('catalog-card-d2_r')).toBeNull();
      expect(screen.queryByTestId('catalog-card-wisc_v')).toBeNull();
      expect(screen.getByText(/9 de 35 disponibles/i)).toBeDefined();

      // 4. Adaptive Behavior & Development (2 instruments)
      const adaptChip = screen.getByRole('button', {
        name: /Conducta Adaptativa & Desarrollo/i,
      });
      fireEvent.click(adaptChip);

      expect(screen.getByTestId('catalog-card-abas_3')).toBeDefined();
      expect(screen.getByTestId('catalog-card-vineland_3')).toBeDefined();
      expect(screen.queryByTestId('catalog-card-mmpi_3')).toBeNull();
      expect(screen.getByText(/3 de 35 disponibles/i)).toBeDefined();

      // 5. Child, Adolescent & Emotional (6 instruments)
      const childChip = screen.getByRole('button', {
        name: /Infanto-Juvenil & Emocional/i,
      });
      fireEvent.click(childChip);

      expect(screen.getByTestId('catalog-card-sena')).toBeDefined();
      expect(screen.getByTestId('catalog-card-cbcl')).toBeDefined();
      expect(screen.getByTestId('catalog-card-byi_2')).toBeDefined();
      expect(screen.getByTestId('catalog-card-sdq')).toBeDefined();
      expect(screen.getByTestId('catalog-card-phq_9')).toBeDefined();
      expect(screen.getByTestId('catalog-card-gad_7')).toBeDefined();
      expect(screen.queryByTestId('catalog-card-wisc_v')).toBeNull();
      expect(screen.getByText(/9 de 35 disponibles/i)).toBeDefined();

      // 6. Projective Guides (1 instrument)
      const projChip = screen.getByRole('button', {
        name: /Guías Proyectivas/i,
      });
      fireEvent.click(projChip);

      expect(screen.getByTestId('catalog-card-htp')).toBeDefined();
      expect(screen.queryByTestId('catalog-card-wisc_v')).toBeNull();
      expect(screen.queryByTestId('catalog-card-sena')).toBeNull();
      expect(screen.getByText(/1 de 35 disponibles/i)).toBeDefined();

      // 7. Reset to "Todos" (19 instruments)
      const allChip = screen.getByRole('button', { name: /^Todos\b/i });
      fireEvent.click(allChip);

      expect(screen.getByTestId('catalog-card-wisc_v')).toBeDefined();
      expect(screen.getByTestId('catalog-card-htp')).toBeDefined();
      expect(screen.getByText(/35 de 35 disponibles/i)).toBeDefined();
    });
  });

  // ==========================================================================
  // Dimension 3: Age Target Segment Toggles & Combinatorial Intersections
  // ==========================================================================
  describe('Dimension 3: Age Target Segment Toggles & Intersecting Filters', () => {
    it('filters instruments accurately by age segment pills', () => {
      render(
        <ClinicalSessionProvider>
          <CatalogExplorer />
        </ClinicalSessionProvider>
      );

      // 1. Infantil (0-11)
      const childPill = screen.getByRole('button', { name: /Infantil \(0-11\)/i });
      fireEvent.click(childPill);

      expect(screen.getByTestId('catalog-card-wisc_v')).toBeDefined();
      expect(screen.getByTestId('catalog-card-raven_2')).toBeDefined();
      expect(screen.getByTestId('catalog-card-d2_r')).toBeDefined();
      expect(screen.getByTestId('catalog-card-abas_3')).toBeDefined();
      expect(screen.getByTestId('catalog-card-vineland_3')).toBeDefined();
      expect(screen.getByTestId('catalog-card-sena')).toBeDefined();
      expect(screen.getByTestId('catalog-card-cbcl')).toBeDefined();
      expect(screen.getByTestId('catalog-card-byi_2')).toBeDefined();
      expect(screen.getByTestId('catalog-card-sdq')).toBeDefined();
      expect(screen.getByTestId('catalog-card-htp')).toBeDefined();

      // Must strictly exclude adult-only batteries
      expect(screen.queryByTestId('catalog-card-wais_iv')).toBeNull();
      expect(screen.queryByTestId('catalog-card-mmpi_3')).toBeNull();
      expect(screen.queryByTestId('catalog-card-pai')).toBeNull();
      expect(screen.queryByTestId('catalog-card-mcmi_iv')).toBeNull();
      expect(screen.queryByTestId('catalog-card-neuropsi_breve')).toBeNull();
      expect(screen.queryByTestId('catalog-card-mmse')).toBeNull();
      expect(screen.queryByTestId('catalog-card-moca')).toBeNull();
      expect(screen.queryByTestId('catalog-card-phq_9')).toBeNull();
      expect(screen.queryByTestId('catalog-card-gad_7')).toBeNull();
      expect(screen.getByText(/17 de 35 disponibles/i)).toBeDefined();

      // 2. Adulto (18-64)
      const adultPill = screen.getByRole('button', { name: /Adulto \(18-64\)/i });
      fireEvent.click(adultPill);

      expect(screen.getByTestId('catalog-card-wais_iv')).toBeDefined();
      expect(screen.getByTestId('catalog-card-raven_2')).toBeDefined();
      expect(screen.getByTestId('catalog-card-d2_r')).toBeDefined();
      expect(screen.getByTestId('catalog-card-neuropsi_breve')).toBeDefined();
      expect(screen.getByTestId('catalog-card-mmse')).toBeDefined();
      expect(screen.getByTestId('catalog-card-moca')).toBeDefined();
      expect(screen.getByTestId('catalog-card-mmpi_3')).toBeDefined();
      expect(screen.getByTestId('catalog-card-pai')).toBeDefined();
      expect(screen.getByTestId('catalog-card-mcmi_iv')).toBeDefined();
      expect(screen.getByTestId('catalog-card-abas_3')).toBeDefined();
      expect(screen.getByTestId('catalog-card-vineland_3')).toBeDefined();
      expect(screen.getByTestId('catalog-card-phq_9')).toBeDefined();
      expect(screen.getByTestId('catalog-card-gad_7')).toBeDefined();
      expect(screen.getByTestId('catalog-card-htp')).toBeDefined();

      // Must strictly exclude child-only batteries
      expect(screen.queryByTestId('catalog-card-wisc_v')).toBeNull();
      expect(screen.queryByTestId('catalog-card-sena')).toBeNull();
      expect(screen.queryByTestId('catalog-card-cbcl')).toBeNull();
      expect(screen.queryByTestId('catalog-card-byi_2')).toBeNull();
      expect(screen.queryByTestId('catalog-card-sdq')).toBeNull();
      expect(screen.getByText(/21 de 35 disponibles/i)).toBeDefined();
    });

    it('evaluates combinatorial intersecting filters (domain + age) with zero-match resilience', () => {
      render(
        <ClinicalSessionProvider>
          <CatalogExplorer />
        </ClinicalSessionProvider>
      );

      // Intersect: Domain "Personalidad" + Age "Infantil" -> Should be empty (0 tests)
      const persChip = screen.getByRole('button', {
        name: /Personalidad & Psicopatología/i,
      });
      fireEvent.click(persChip);

      const childPill = screen.getByRole('button', { name: /Infantil \(0-11\)/i });
      fireEvent.click(childPill);

      // Verify empty state is rendered
      expect(
        screen.getByText(/No se encontraron instrumentos para el filtro seleccionado/i)
      ).toBeDefined();
      expect(screen.getByText(/0 de 35 disponibles/i)).toBeDefined();

      // Intersect: Domain "Inteligencia" + Age "Infantil" -> WISC-V & Raven 2 (WAIS-IV excluded)
      const intelChip = screen.getByRole('button', {
        name: /Inteligencia & Aptitudes/i,
      });
      fireEvent.click(intelChip);

      expect(screen.getByTestId('catalog-card-wisc_v')).toBeDefined();
      expect(screen.getByTestId('catalog-card-raven_2')).toBeDefined();
      expect(screen.queryByTestId('catalog-card-wais_iv')).toBeNull();
      expect(screen.getByText(/3 de 35 disponibles/i)).toBeDefined();

      // Intersect: Domain "Infanto-Juvenil & Emocional" + Age "Adulto" -> PHQ-9 & GAD-7 (SENA, CBCL, BYI, SDQ excluded)
      const childChip = screen.getByRole('button', {
        name: /Infanto-Juvenil & Emocional/i,
      });
      fireEvent.click(childChip);

      const adultPill = screen.getByRole('button', { name: /Adulto \(18-64\)/i });
      fireEvent.click(adultPill);

      expect(screen.getByTestId('catalog-card-phq_9')).toBeDefined();
      expect(screen.getByTestId('catalog-card-gad_7')).toBeDefined();
      expect(screen.queryByTestId('catalog-card-sena')).toBeNull();
      expect(screen.queryByTestId('catalog-card-cbcl')).toBeNull();
      expect(screen.queryByTestId('catalog-card-byi_2')).toBeNull();
      expect(screen.queryByTestId('catalog-card-sdq')).toBeNull();
      expect(screen.getByText(/2 de 35 disponibles/i)).toBeDefined();
    });
  });

  // ==========================================================================
  // Dimension 4: Dynamic Status Badge Transitions across Test Lifecycle
  // ==========================================================================
  describe('Dimension 4: Status Badge Dynamic Transitions (No iniciada -> En curso -> Completada / Alerta clínica)', () => {
    it('transitions PHQ-9 badge dynamically through all 4 states ("No iniciada", "En curso", "Completada", "Alerta clínica")', () => {
      render(
        <ClinicalSessionProvider>
          <DynamicHarness />
        </ClinicalSessionProvider>
      );

      const card = screen.getByTestId('catalog-card-phq_9');

      // 1. Initial status: No iniciada
      expect(within(card).getByText('No iniciada')).toBeDefined();
      expect(within(card).queryByText('En curso')).toBeNull();
      expect(within(card).queryByText('Completada')).toBeNull();
      expect(within(card).queryByText('Alerta clínica')).toBeNull();

      // 2. Partial input (1 answer): En curso
      fireEvent.click(screen.getByTestId('act-phq9-progress'));
      expect(within(card).getByText('En curso')).toBeDefined();
      expect(within(card).queryByText('No iniciada')).toBeNull();

      // 3. Complete without critical alert (9 answers, item 9 = 0): Completada
      fireEvent.click(screen.getByTestId('act-phq9-complete'));
      expect(within(card).getByText('Completada')).toBeDefined();
      expect(within(card).queryByText('En curso')).toBeNull();
      expect(within(card).queryByText('Alerta clínica')).toBeNull();

      // 4. Critical Item 9 suicide alert trigger: Alerta clínica
      fireEvent.click(screen.getByTestId('act-phq9-alert'));
      expect(within(card).getByText('Alerta clínica')).toBeDefined();
      expect(within(card).queryByText('Completada')).toBeNull();
      const alertBadge = within(card).getByTitle('Ideación suicida (Ítem 9)');
      expect(alertBadge).toBeDefined();
    });

    it('transitions D2-R badge dynamically through all 4 states ("No iniciada", "En curso", "Completada", "Alerta clínica")', () => {
      render(
        <ClinicalSessionProvider>
          <DynamicHarness />
        </ClinicalSessionProvider>
      );

      const card = screen.getByTestId('catalog-card-d2_r');

      // 1. Initial: No iniciada
      expect(within(card).getByText('No iniciada')).toBeDefined();

      // 2. Partial input (ta > 0, tr = 0): En curso
      fireEvent.click(screen.getByTestId('act-d2r-progress'));
      expect(within(card).getByText('En curso')).toBeDefined();

      // 3. Normal completed run: Completada
      fireEvent.click(screen.getByTestId('act-d2r-complete'));
      expect(within(card).getByText('Completada')).toBeDefined();

      // 4. High commission errors (c=65, impulsive alert): Alerta clínica
      fireEvent.click(screen.getByTestId('act-d2r-alert'));
      expect(within(card).getByText('Alerta clínica')).toBeDefined();
    });

    it('transitions MMPI-3 badge dynamically from "No iniciada" -> "Completada" -> "Alerta clínica"', () => {
      render(
        <ClinicalSessionProvider>
          <DynamicHarness />
        </ClinicalSessionProvider>
      );

      const card = screen.getByTestId('catalog-card-mmpi_3');

      // 1. Initial status: No iniciada
      expect(within(card).getByText('No iniciada')).toBeDefined();

      // 2. Normal profile: Completada
      fireEvent.click(screen.getByTestId('act-mmpi3-complete'));
      expect(within(card).getByText('Completada')).toBeDefined();

      // 3. Critical suicide elevation (SUI >= 65): Alerta clínica
      fireEvent.click(screen.getByTestId('act-mmpi3-alert'));
      expect(within(card).getByText('Alerta clínica')).toBeDefined();
    });

    it('transitions GAD-7 and SDQ badges dynamically to "En curso"', () => {
      render(
        <ClinicalSessionProvider>
          <DynamicHarness />
        </ClinicalSessionProvider>
      );

      // GAD-7
      const gadCard = screen.getByTestId('catalog-card-gad_7');
      expect(within(gadCard).getByText('No iniciada')).toBeDefined();
      fireEvent.click(screen.getByTestId('act-gad7-progress'));
      expect(within(gadCard).getByText('En curso')).toBeDefined();
      fireEvent.click(screen.getByTestId('act-gad7-complete'));
      expect(within(gadCard).getByText('Completada')).toBeDefined();

      // SDQ
      const sdqCard = screen.getByTestId('catalog-card-sdq');
      expect(within(sdqCard).getByText('No iniciada')).toBeDefined();
      fireEvent.click(screen.getByTestId('act-sdq-progress'));
      expect(within(sdqCard).getByText('En curso')).toBeDefined();
    });

    it('triggers "Alerta clínica" on PAI, MCMI-IV, BYI-2, NEUROPSI, MMSE, ABAS-3, Vineland-3, and SENA', () => {
      render(
        <ClinicalSessionProvider>
          <DynamicHarness />
        </ClinicalSessionProvider>
      );

      // PAI
      const paiCard = screen.getByTestId('catalog-card-pai');
      expect(within(paiCard).getByText('No iniciada')).toBeDefined();
      fireEvent.click(screen.getByTestId('act-pai-complete'));
      expect(within(paiCard).getByText('Completada')).toBeDefined();
      fireEvent.click(screen.getByTestId('act-pai-alert'));
      expect(within(paiCard).getByText('Alerta clínica')).toBeDefined();

      // MCMI-IV (Prominence cutoff TB >= 85)
      const mcmiCard = screen.getByTestId('catalog-card-mcmi_iv');
      expect(within(mcmiCard).getByText('No iniciada')).toBeDefined();
      fireEvent.click(screen.getByTestId('act-mcmi4-complete'));
      expect(within(mcmiCard).getByText('Completada')).toBeDefined();
      fireEvent.click(screen.getByTestId('act-mcmi4-alert'));
      expect(within(mcmiCard).getByText('Alerta clínica')).toBeDefined();

      // BYI-2 (Suicide item response affirmative)
      const byiCard = screen.getByTestId('catalog-card-byi_2');
      expect(within(byiCard).getByText('No iniciada')).toBeDefined();
      fireEvent.click(screen.getByTestId('act-byi2-complete'));
      expect(within(byiCard).getByText('Completada')).toBeDefined();
      fireEvent.click(screen.getByTestId('act-byi2-alert'));
      expect(within(byiCard).getByText('Alerta clínica')).toBeDefined();

      // NEUROPSI Breve (Severe impairment cutoff)
      const neuropsiCard = screen.getByTestId('catalog-card-neuropsi_breve');
      expect(within(neuropsiCard).getByText('No iniciada')).toBeDefined();
      fireEvent.click(screen.getByTestId('act-neuropsi-complete'));
      expect(within(neuropsiCard).getByText('Completada')).toBeDefined();
      fireEvent.click(screen.getByTestId('act-neuropsi-alert'));
      expect(within(neuropsiCard).getByText('Alerta clínica')).toBeDefined();

      // MMSE (Folstein/NORMACODEM impairment < 24)
      const mmseCard = screen.getByTestId('catalog-card-mmse');
      expect(within(mmseCard).getByText('No iniciada')).toBeDefined();
      fireEvent.click(screen.getByTestId('act-mmse-complete'));
      expect(within(mmseCard).getByText('Completada')).toBeDefined();
      fireEvent.click(screen.getByTestId('act-mmse-alert'));
      expect(within(mmseCard).getByText('Alerta clínica')).toBeDefined();

      // ABAS-3 (CAG deficit <= 69)
      const abasCard = screen.getByTestId('catalog-card-abas_3');
      expect(within(abasCard).getByText('No iniciada')).toBeDefined();
      fireEvent.click(screen.getByTestId('act-abas3-complete'));
      expect(within(abasCard).getByText('Completada')).toBeDefined();
      fireEvent.click(screen.getByTestId('act-abas3-alert'));
      expect(within(abasCard).getByText('Alerta clínica')).toBeDefined();

      // Vineland-3 (ABC deficit <= 70)
      const vinelandCard = screen.getByTestId('catalog-card-vineland_3');
      expect(within(vinelandCard).getByText('No iniciada')).toBeDefined();
      fireEvent.click(screen.getByTestId('act-vineland3-complete'));
      expect(within(vinelandCard).getByText('Completada')).toBeDefined();
      fireEvent.click(screen.getByTestId('act-vineland3-alert'));
      expect(within(vinelandCard).getByText('Alerta clínica')).toBeDefined();

      // SENA (Red flag critical items)
      const senaCard = screen.getByTestId('catalog-card-sena');
      expect(within(senaCard).getByText('No iniciada')).toBeDefined();
      fireEvent.click(screen.getByTestId('act-sena-complete'));
      expect(within(senaCard).getByText('Completada')).toBeDefined();
      fireEvent.click(screen.getByTestId('act-sena-alert'));
      expect(within(senaCard).getByText('Alerta clínica')).toBeDefined();
    });
  });

  // ==========================================================================
  // Dimension 5: Interactive E2E Flow (Catalog -> Form -> Alert -> Catalog Return)
  // ==========================================================================
  describe('Dimension 5: Interactive E2E Workflow through Full App Navigation', () => {
    it('updates MMPI-3 status to "Alerta clínica" in Catalog after entering clinical sample in form', () => {
      render(<App />);

      // 1. Switch to Catálogo Universal
      const catalogHeaderBtn = screen.getAllByRole('button', {
        name: /Catálogo Universal/i,
      })[0];
      fireEvent.click(catalogHeaderBtn);

      // Verify MMPI-3 card is initially "No iniciada"
      const mmpiCardInitial = screen.getByTestId('catalog-card-mmpi_3');
      expect(within(mmpiCardInitial).getByText('No iniciada')).toBeDefined();

      // 2. Click "Administrar / Abrir" on MMPI-3
      const openBtn = within(mmpiCardInitial).getByRole('button', {
        name: /Administrar \/ Abrir/i,
      });
      fireEvent.click(openBtn);

      // 3. Verify LikertMatrixInputCard for MMPI-3 mounts
      expect(screen.getByTestId('likert-form-mmpi_3')).toBeDefined();

      // Click "Muestra Clínica" button (triggers SUI = 75 elevation)
      const clinicalBtn = screen.getByRole('button', { name: /Muestra Clínica/i });
      fireEvent.click(clinicalBtn);

      // Verify suicide alert is displayed in the form
      expect(screen.getByTestId('critical-suicide-banner')).toBeDefined();

      // 4. Return to Catálogo Universal via header
      const returnCatalogBtn = screen.getAllByRole('button', {
        name: /Catálogo Universal/i,
      })[0];
      fireEvent.click(returnCatalogBtn);

      // 5. Verify MMPI-3 card in Catalog now displays "Alerta clínica"
      const mmpiCardUpdated = screen.getByTestId('catalog-card-mmpi_3');
      expect(within(mmpiCardUpdated).getByText('Alerta clínica')).toBeDefined();
      expect(within(mmpiCardUpdated).queryByText('No iniciada')).toBeNull();
    });

    it('updates PHQ-9 status to "Alerta clínica" in Catalog after triggering Item 9 in form', () => {
      render(<App />);

      // 1. Switch to Catálogo Universal
      const catalogHeaderBtn = screen.getAllByRole('button', {
        name: /Catálogo Universal/i,
      })[0];
      fireEvent.click(catalogHeaderBtn);

      // Verify PHQ-9 card is initially "No iniciada"
      const phqCardInitial = screen.getByTestId('catalog-card-phq_9');
      expect(within(phqCardInitial).getByText('No iniciada')).toBeDefined();

      // 2. Click "Administrar / Abrir" on PHQ-9
      const openBtn = within(phqCardInitial).getByRole('button', {
        name: /Administrar \/ Abrir/i,
      });
      fireEvent.click(openBtn);

      // 3. In PHQ-9 form, load critical preset with item 9
      const criticalPresetBtn = screen.getByRole('button', {
        name: /Alerta Ítem 9/i,
      });
      expect(criticalPresetBtn).toBeDefined();
      fireEvent.click(criticalPresetBtn);

      // 4. Return to Catálogo Universal
      const returnCatalogBtn = screen.getAllByRole('button', {
        name: /Catálogo Universal/i,
      })[0];
      fireEvent.click(returnCatalogBtn);

      // 5. Verify PHQ-9 card in Catalog now displays "Alerta clínica"
      const phqCardUpdated = screen.getByTestId('catalog-card-phq_9');
      expect(within(phqCardUpdated).getByText('Alerta clínica')).toBeDefined();
      expect(within(phqCardUpdated).queryByText('No iniciada')).toBeNull();
    });
  });
});
