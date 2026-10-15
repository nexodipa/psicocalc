/**
 * Normative metadata, scale definitions, and cutoffs for:
 * - SENA
 * - CBCL (ASEBA)
 * - BYI-2
 */

import { Byi2InventoryId } from '../types/child_adolescent';

// ============================================================================
// SENA Metadata & Cutoffs
// ============================================================================

export const SENA_PROTECTIVE_SCALES = new Set<string>([
  'autoestima',
  'integracion_social',
  'competencia_social',
  'inteligencia_emocional',
  'disposicion_al_estudio',
]);

export const SENA_CONTROL_SCALES = new Set<string>(['inc', 'neg', 'pos']);

// ============================================================================
// CBCL Scale Categories
// ============================================================================

export const CBCL_BROADBAND_SCALES = new Set<string>([
  'internalizing',
  'externalizing',
  'total_problems',
]);

export const CBCL_DSM_SCALES = new Set<string>([
  'dsm_depressive',
  'dsm_anxiety',
  'dsm_somatic',
  'dsm_adhd',
  'dsm_odd',
  'dsm_conduct',
]);

// ============================================================================
// BYI-2 Metadata
// ============================================================================

export interface Byi2Meta {
  id: Byi2InventoryId;
  name: string;
  isPositiveConstruct: boolean;
  meanRaw: number;
  sdRaw: number;
}

export const BYI2_INVENTORIES: Record<Byi2InventoryId, Byi2Meta> = {
  BDI_Y: { id: 'BDI_Y', name: 'Inventario de Depresión (BDI-Y)', isPositiveConstruct: false, meanRaw: 12, sdRaw: 8.5 },
  BAI_Y: { id: 'BAI_Y', name: 'Inventario de Ansiedad (BAI-Y)', isPositiveConstruct: false, meanRaw: 14, sdRaw: 9.0 },
  BANI_Y: { id: 'BANI_Y', name: 'Inventario de Ira (BANI-Y)', isPositiveConstruct: false, meanRaw: 16, sdRaw: 9.5 },
  BDBI_Y: { id: 'BDBI_Y', name: 'Inventario de Conducta Disruptiva (BDBI-Y)', isPositiveConstruct: false, meanRaw: 13, sdRaw: 8.0 },
  BSCI_Y: { id: 'BSCI_Y', name: 'Inventario de Autoconcepto (BSCI-Y)', isPositiveConstruct: true, meanRaw: 38, sdRaw: 9.0 },
};
