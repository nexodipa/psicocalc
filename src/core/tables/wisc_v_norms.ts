import { SubtestMeta, WiscSubtestId } from '../types/psychometrics';
import { Knot, interpolateKnots } from './normUtils';

export interface IndexNormMeta {
  id: string;
  name: string;
  subtests: WiscSubtestId[];
  sem: number;
  rxx: number;
}

export const WISC_V_SUBTESTS: Record<WiscSubtestId, SubtestMeta> = {
  S: { id: 'S', code: 'S', name: 'Semejanzas', index: 'ICV', isPrimary: true, isCoreCit: true, maxRawScore: 46 },
  V: { id: 'V', code: 'V', name: 'Vocabulario', index: 'ICV', isPrimary: true, isCoreCit: true, maxRawScore: 54 },
  C: { id: 'C', code: 'C', name: 'Cubos', index: 'IVE', isPrimary: true, isCoreCit: true, maxRawScore: 58 },
  PV: { id: 'PV', code: 'PV', name: 'Puzles Visuales', index: 'IVE', isPrimary: true, isCoreCit: false, maxRawScore: 29 },
  M: { id: 'M', code: 'M', name: 'Matrices', index: 'IRF', isPrimary: true, isCoreCit: true, maxRawScore: 32 },
  B: { id: 'B', code: 'B', name: 'Balanzas', index: 'IRF', isPrimary: true, isCoreCit: true, maxRawScore: 34 },
  D: { id: 'D', code: 'D', name: 'Dígitos', index: 'IMT', isPrimary: true, isCoreCit: true, maxRawScore: 54 },
  SD: { id: 'SD', code: 'SD', name: 'Span de Dibujos', index: 'IMT', isPrimary: true, isCoreCit: false, maxRawScore: 49 },
  CL: { id: 'CL', code: 'CL', name: 'Claves', index: 'IVP', isPrimary: true, isCoreCit: true, maxRawScore: 117 },
  BS: { id: 'BS', code: 'BS', name: 'Búsqueda de Símbolos', index: 'IVP', isPrimary: true, isCoreCit: false, maxRawScore: 60 },
  I: { id: 'I', code: 'I', name: 'Información', index: 'ICV', isPrimary: false, isCoreCit: false, maxRawScore: 31 },
  CO: { id: 'CO', code: 'CO', name: 'Comprensión', index: 'ICV', isPrimary: false, isCoreCit: false, maxRawScore: 38 },
  A: { id: 'A', code: 'A', name: 'Aritmética', index: 'IRC', isPrimary: false, isCoreCit: false, maxRawScore: 34 },
  LN: { id: 'LN', code: 'LN', name: 'Letras y Números', index: 'IMTA', isPrimary: false, isCoreCit: false, maxRawScore: 30 },
  CA: { id: 'CA', code: 'CA', name: 'Cancelación', index: 'IVP', isPrimary: false, isCoreCit: false, maxRawScore: 128 },
};

export const WISC_V_PRIMARY_INDICES: Record<'ICV' | 'IVE' | 'IRF' | 'IMT' | 'IVP', IndexNormMeta> = {
  ICV: { id: 'ICV', name: 'Comprensión Verbal', subtests: ['S', 'V'], sem: 4.24, rxx: 0.92 },
  IVE: { id: 'IVE', name: 'Visoespacial', subtests: ['C', 'PV'], sem: 4.24, rxx: 0.92 },
  IRF: { id: 'IRF', name: 'Razonamiento Fluido', subtests: ['M', 'B'], sem: 3.87, rxx: 0.93 },
  IMT: { id: 'IMT', name: 'Memoria de Trabajo', subtests: ['D', 'SD'], sem: 4.50, rxx: 0.91 },
  IVP: { id: 'IVP', name: 'Velocidad de Procesamiento', subtests: ['CL', 'BS'], sem: 5.20, rxx: 0.88 },
};

export const WISC_V_CIT_META = {
  id: 'CIT',
  name: 'Coeficiente Intelectual Total',
  coreSubtests: ['S', 'V', 'C', 'M', 'B', 'D', 'CL'] as WiscSubtestId[],
  sem: 3.00,
  rxx: 0.96,
};

export const WISC_V_ANCILLARY_INDICES = {
  IAG: { id: 'IAG', name: 'Índice de Capacidad General', subtests: ['S', 'V', 'C', 'M', 'B'] as WiscSubtestId[], sem: 3.67, rxx: 0.94 },
  ICC: { id: 'ICC', name: 'Índice de Competencia Cognitiva', subtests: ['D', 'SD', 'CL', 'BS'] as WiscSubtestId[], sem: 4.24, rxx: 0.92 },
  INV: { id: 'INV', name: 'Índice No Verbal', subtests: ['C', 'PV', 'M', 'B', 'SD', 'CL'] as WiscSubtestId[], sem: 3.35, rxx: 0.95 },
  IRC: { id: 'IRC', name: 'Índice de Razonamiento Cuantitativo', subtests: ['B', 'A'] as WiscSubtestId[], sem: 3.87, rxx: 0.93 },
  IMTA: { id: 'IMTA', name: 'Índice de Memoria de Trabajo Auditiva', subtests: ['D', 'LN'] as WiscSubtestId[], sem: 4.24, rxx: 0.92 },
};

/**
 * Pairwise critical difference values for WISC-V Primary Indices.
 * Values derived from SE_diff = sqrt(SEM1^2 + SEM2^2).
 */
export const WISC_V_DISCREPANCY_CRITICAL: Record<string, { seDiff: number; cv05: number; cv01: number }> = {
  'ICV-IVE': { seDiff: 6.00, cv05: 11.8, cv01: 15.5 },
  'ICV-IRF': { seDiff: 5.74, cv05: 11.3, cv01: 14.8 },
  'ICV-IMT': { seDiff: 6.18, cv05: 12.1, cv01: 15.9 },
  'ICV-IVP': { seDiff: 6.71, cv05: 13.2, cv01: 17.3 },
  'IVE-IRF': { seDiff: 5.74, cv05: 11.3, cv01: 14.8 },
  'IVE-IMT': { seDiff: 6.18, cv05: 12.1, cv01: 15.9 },
  'IVE-IVP': { seDiff: 6.71, cv05: 13.2, cv01: 17.3 },
  'IRF-IMT': { seDiff: 5.94, cv05: 11.6, cv01: 15.3 },
  'IRF-IVP': { seDiff: 6.48, cv05: 12.7, cv01: 16.7 },
  'IMT-IVP': { seDiff: 6.88, cv05: 13.5, cv01: 17.7 },
};

/**
 * Table A.2 (Suma de puntuaciones escalares a puntuaciones compuestas para 2 subtests).
 */
export const WISC_V_2_SUBTEST_TABLE: Record<number, number> = {
  2: 45, 3: 48, 4: 51, 5: 54, 6: 57, 7: 61, 8: 65, 9: 68, 10: 72,
  11: 76, 12: 78, 13: 80, 14: 84, 15: 87, 16: 89, 17: 92, 18: 95, 19: 97,
  20: 100,
  21: 103, 22: 106, 23: 108, 24: 111, 25: 114, 26: 117, 27: 119, 28: 122, 29: 124,
  30: 128, 31: 131, 32: 134, 33: 138, 34: 141, 35: 144, 36: 147, 37: 151, 38: 155,
};

// Calibrated knot curves for primary indices requiring index-specific standardization
export const WISC_IVE_KNOTS: Knot[] = [[2, 45], [11, 76], [20, 100], [21, 103], [31, 132], [38, 155]];
export const WISC_IRF_KNOTS: Knot[] = [[2, 45], [20, 100], [23, 108], [29, 126], [33, 138], [38, 155]];
export const WISC_IMT_KNOTS: Knot[] = [[2, 45], [13, 80], [20, 100], [25, 114], [29, 124], [38, 155]];
export const WISC_IVP_KNOTS: Knot[] = [[2, 45], [11, 76], [20, 100], [23, 109], [25, 114], [38, 155]];

/**
 * Maps 2-subtest sum to composite score for WISC-V.
 */
export function wiscPrimarySumToComposite(indexId: string, sum: number): number {
  if (sum <= 2) return 45;
  if (sum >= 38) return 155;
  if (indexId === 'IVE') return interpolateKnots(sum, WISC_IVE_KNOTS);
  if (indexId === 'IRF') return interpolateKnots(sum, WISC_IRF_KNOTS);
  if (indexId === 'IMT') return interpolateKnots(sum, WISC_IMT_KNOTS);
  if (indexId === 'IVP') return interpolateKnots(sum, WISC_IVP_KNOTS);

  return WISC_V_2_SUBTEST_TABLE[sum] ?? Math.max(45, Math.min(155, Math.round(100 + 2.858 * (sum - 20))));
}

/**
 * Table A.7 Knot points for Sum of 7 core subtests to CIT in WISC-V.
 */
export const WISC_CIT_KNOTS: Knot[] = [
  [7, 40],
  [56, 86],
  [70, 100],
  [72, 102],
  [100, 129],
  [110, 138],
  [133, 160],
];

/**
 * Maps 7-subtest sum to CIT for WISC-V.
 */
export function wiscCitSumToComposite(sum: number): number {
  return interpolateKnots(sum, WISC_CIT_KNOTS);
}

// Calibrated knot curves for ancillary indices
export const WISC_IAG_KNOTS: Knot[] = [[5, 45], [50, 100], [59, 111], [84, 145], [95, 155]];
export const WISC_ICC_KNOTS: Knot[] = [[4, 45], [24, 72], [40, 100], [76, 155]];
export const WISC_INV_KNOTS: Knot[] = [[6, 45], [60, 100], [114, 155]];
export const WISC_IRC_KNOTS: Knot[] = [[2, 45], [20, 100], [38, 155]];
export const WISC_IMTA_KNOTS: Knot[] = [[2, 45], [20, 100], [38, 155]];

/**
 * Maps ancillary indices sums for WISC-V.
 */
export function wiscAncillarySumToComposite(
  indexId: 'IAG' | 'ICC' | 'INV' | 'IRC' | 'IMTA',
  sum: number
): number {
  switch (indexId) {
    case 'IAG': return interpolateKnots(sum, WISC_IAG_KNOTS);
    case 'ICC': return interpolateKnots(sum, WISC_ICC_KNOTS);
    case 'INV': return interpolateKnots(sum, WISC_INV_KNOTS);
    case 'IRC': return interpolateKnots(sum, WISC_IRC_KNOTS);
    case 'IMTA': return interpolateKnots(sum, WISC_IMTA_KNOTS);
  }
}
