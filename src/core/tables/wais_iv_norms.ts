import { SubtestMeta, WaisCoreSubtestId, WaisSuppSubtestId } from '../types/psychometrics';
import { Knot, interpolateKnots } from './normUtils';

export type CanonicalWaisSubtestId = WaisCoreSubtestId | WaisSuppSubtestId;

export interface WaisIndexNormMeta {
  id: string;
  name: string;
  subtests: CanonicalWaisSubtestId[];
  sem: number;
  rxx: number;
}

export const WAIS_IV_SUBTESTS: Record<CanonicalWaisSubtestId, SubtestMeta> = {
  WAIS_C: { id: 'WAIS_C', code: 'C', name: 'Cubos', index: 'IRP', isPrimary: true, isCoreCit: true, maxRawScore: 66 },
  WAIS_S: { id: 'WAIS_S', code: 'S', name: 'Semejanzas', index: 'ICV', isPrimary: true, isCoreCit: true, maxRawScore: 36 },
  WAIS_D: { id: 'WAIS_D', code: 'D', name: 'Dígitos', index: 'IMT', isPrimary: true, isCoreCit: true, maxRawScore: 48 },
  WAIS_M: { id: 'WAIS_M', code: 'M', name: 'Matrices', index: 'IRP', isPrimary: true, isCoreCit: true, maxRawScore: 26 },
  WAIS_V: { id: 'WAIS_V', code: 'V', name: 'Vocabulario', index: 'ICV', isPrimary: true, isCoreCit: true, maxRawScore: 57 },
  WAIS_A: { id: 'WAIS_A', code: 'A', name: 'Aritmética', index: 'IMT', isPrimary: true, isCoreCit: true, maxRawScore: 22 },
  WAIS_BS: { id: 'WAIS_BS', code: 'BS', name: 'Búsqueda de Símbolos', index: 'IVP', isPrimary: true, isCoreCit: true, maxRawScore: 60 },
  WAIS_PV: { id: 'WAIS_PV', code: 'PV', name: 'Puzles Visuales', index: 'IRP', isPrimary: true, isCoreCit: true, maxRawScore: 26 },
  WAIS_I: { id: 'WAIS_I', code: 'I', name: 'Información', index: 'ICV', isPrimary: true, isCoreCit: true, maxRawScore: 26 },
  WAIS_CN: { id: 'WAIS_CN', code: 'CN', name: 'Clave de Números', index: 'IVP', isPrimary: true, isCoreCit: true, maxRawScore: 135 },
  WAIS_LN: { id: 'WAIS_LN', code: 'LN', name: 'Letras y Números', index: 'IMT', isPrimary: false, isCoreCit: false, maxRawScore: 30 },
  WAIS_B: { id: 'WAIS_B', code: 'B', name: 'Balanzas', index: 'IRP', isPrimary: false, isCoreCit: false, maxRawScore: 27 },
  WAIS_CO: { id: 'WAIS_CO', code: 'CO', name: 'Comprensión', index: 'ICV', isPrimary: false, isCoreCit: false, maxRawScore: 36 },
  WAIS_CA: { id: 'WAIS_CA', code: 'CA', name: 'Cancelación', index: 'IVP', isPrimary: false, isCoreCit: false, maxRawScore: 72 },
  WAIS_FI: { id: 'WAIS_FI', code: 'FI', name: 'Figuras Incompletas', index: 'IRP', isPrimary: false, isCoreCit: false, maxRawScore: 24 },
};

export const WAIS_IV_PRIMARY_INDICES: Record<'ICV' | 'IRP' | 'IMT' | 'IVP', WaisIndexNormMeta> = {
  ICV: { id: 'ICV', name: 'Comprensión Verbal', subtests: ['WAIS_S', 'WAIS_V', 'WAIS_I'], sem: 3.48, rxx: 0.95 },
  IRP: { id: 'IRP', name: 'Razonamiento Perceptivo', subtests: ['WAIS_C', 'WAIS_M', 'WAIS_PV'], sem: 3.97, rxx: 0.93 },
  IMT: { id: 'IMT', name: 'Memoria de Trabajo', subtests: ['WAIS_D', 'WAIS_A'], sem: 4.50, rxx: 0.91 },
  IVP: { id: 'IVP', name: 'Velocidad de Procesamiento', subtests: ['WAIS_BS', 'WAIS_CN'], sem: 5.20, rxx: 0.88 },
};

export const WAIS_IV_CIT_META = {
  id: 'CIT',
  name: 'Coeficiente Intelectual Total',
  coreSubtests: [
    'WAIS_C', 'WAIS_S', 'WAIS_D', 'WAIS_M', 'WAIS_V',
    'WAIS_A', 'WAIS_BS', 'WAIS_PV', 'WAIS_I', 'WAIS_CN'
  ] as CanonicalWaisSubtestId[],
  sem: 2.60,
  rxx: 0.97,
};

export const WAIS_IV_ANCILLARY_INDICES = {
  IAG: {
    id: 'IAG',
    name: 'Índice de Capacidad General',
    subtests: ['WAIS_S', 'WAIS_V', 'WAIS_I', 'WAIS_C', 'WAIS_M', 'WAIS_PV'] as CanonicalWaisSubtestId[],
    sem: 3.35,
    rxx: 0.95,
  },
  ICC: {
    id: 'ICC',
    name: 'Índice de Competencia Cognitiva',
    subtests: ['WAIS_D', 'WAIS_A', 'WAIS_BS', 'WAIS_CN'] as CanonicalWaisSubtestId[],
    sem: 4.24,
    rxx: 0.92,
  },
};

export const WAIS_IV_DISCREPANCY_CRITICAL: Record<string, { seDiff: number; cv05: number; cv01: number }> = {
  'ICV-IRP': { seDiff: 5.28, cv05: 10.4, cv01: 13.6 },
  'ICV-IMT': { seDiff: 5.69, cv05: 11.2, cv01: 14.7 },
  'ICV-IVP': { seDiff: 6.26, cv05: 12.3, cv01: 16.1 },
  'IRP-IMT': { seDiff: 6.00, cv05: 11.8, cv01: 15.5 },
  'IRP-IVP': { seDiff: 6.54, cv05: 12.8, cv01: 16.9 },
  'IMT-IVP': { seDiff: 6.88, cv05: 13.5, cv01: 17.7 },
};

/**
 * Normalizes input subtest keys from English abbreviations (BD, SI, etc.)
 * or raw short names to Canonical WAIS keys.
 */
export function normalizeWaisSubtestKey(key: string): CanonicalWaisSubtestId | null {
  const map: Record<string, CanonicalWaisSubtestId> = {
    WAIS_C: 'WAIS_C', WAIS_S: 'WAIS_S', WAIS_D: 'WAIS_D', WAIS_M: 'WAIS_M', WAIS_V: 'WAIS_V',
    WAIS_A: 'WAIS_A', WAIS_BS: 'WAIS_BS', WAIS_PV: 'WAIS_PV', WAIS_I: 'WAIS_I', WAIS_CN: 'WAIS_CN',
    WAIS_LN: 'WAIS_LN', WAIS_B: 'WAIS_B', WAIS_CO: 'WAIS_CO', WAIS_CA: 'WAIS_CA', WAIS_FI: 'WAIS_FI',

    BD: 'WAIS_C', SI: 'WAIS_S', DS: 'WAIS_D', MR: 'WAIS_M', VC: 'WAIS_V',
    AR: 'WAIS_A', SS: 'WAIS_BS', VP: 'WAIS_PV', IN: 'WAIS_I', CD: 'WAIS_CN',
    LN: 'WAIS_LN', FW: 'WAIS_B', CO: 'WAIS_CO', CA: 'WAIS_CA', PC: 'WAIS_FI',

    C: 'WAIS_C', S: 'WAIS_S', D: 'WAIS_D', M: 'WAIS_M', V: 'WAIS_V',
    A: 'WAIS_A', BS: 'WAIS_BS', PV: 'WAIS_PV', I: 'WAIS_I', CN: 'WAIS_CN',
    B: 'WAIS_B', FI: 'WAIS_FI',
  };

  return map[key] || null;
}

// Calibrated knot curves for WAIS-IV 3-subtest primary indices (ICV, IRP)
export const WAIS_ICV_KNOTS: Knot[] = [
  [3, 45], [19, 78], [30, 100], [33, 106], [47, 132], [57, 155]
];
export const WAIS_IRP_KNOTS: Knot[] = [
  [3, 45], [19, 79], [22, 84], [30, 100], [43, 125], [57, 155]
];

/**
 * Maps 3-subtest sum (ICV, IRP) to composite score for WAIS-IV.
 */
export function wais3SubtestSumToComposite(indexId: 'ICV' | 'IRP', sum: number): number {
  return indexId === 'ICV'
    ? interpolateKnots(sum, WAIS_ICV_KNOTS)
    : interpolateKnots(sum, WAIS_IRP_KNOTS);
}

// Calibrated knot curves for WAIS-IV 2-subtest primary indices (IMT, IVP)
export const WAIS_IMT_KNOTS: Knot[] = [
  [2, 45], [11, 74], [20, 100], [24, 111], [29, 125], [38, 155]
];
export const WAIS_IVP_KNOTS: Knot[] = [
  [2, 45], [7, 65], [13, 80], [20, 100], [26, 117], [38, 155]
];

/**
 * Maps 2-subtest sum (IMT, IVP) to composite score for WAIS-IV.
 */
export function wais2SubtestSumToComposite(indexId: 'IMT' | 'IVP', sum: number): number {
  return indexId === 'IMT'
    ? interpolateKnots(sum, WAIS_IMT_KNOTS)
    : interpolateKnots(sum, WAIS_IVP_KNOTS);
}

// Calibrated knot curves for WAIS-IV CIT (10 subtests, sums 10..190)
export const WAIS_CIT_KNOTS: Knot[] = [
  [10, 40],
  [65, 75],
  [70, 77],
  [100, 100],
  [145, 129],
  [190, 160],
];

/**
 * Maps 10-subtest sum to CIT for WAIS-IV.
 */
export function waisCitSumToComposite(sum: number): number {
  return interpolateKnots(sum, WAIS_CIT_KNOTS);
}

// Calibrated knot curves for WAIS-IV ancillary indices (IAG: 6 subtests, ICC: 4 subtests)
export const WAIS_IAG_KNOTS: Knot[] = [
  [6, 45], [41, 79], [52, 90], [60, 100], [90, 131], [114, 155]
];
export const WAIS_ICC_KNOTS: Knot[] = [
  [4, 45], [40, 100], [76, 155]
];

/**
 * Maps ancillary indices sums for WAIS-IV (IAG: 6 subtests, ICC: 4 subtests).
 */
export function waisAncillarySumToComposite(indexId: 'IAG' | 'ICC', sum: number): number {
  return indexId === 'IAG'
    ? interpolateKnots(sum, WAIS_IAG_KNOTS)
    : interpolateKnots(sum, WAIS_ICC_KNOTS);
}
