import { SubtestMeta, WaisCoreSubtestId, WaisSuppSubtestId } from '../types/psychometrics';
import { GENERIC_RXX, GENERIC_SEM, genericComposite, genericCriticalDifferences } from './normUtils';

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
  ICV: { id: 'ICV', name: 'Comprensión Verbal', subtests: ['WAIS_S', 'WAIS_V', 'WAIS_I'], sem: GENERIC_SEM, rxx: GENERIC_RXX },
  IRP: { id: 'IRP', name: 'Razonamiento Perceptivo', subtests: ['WAIS_C', 'WAIS_M', 'WAIS_PV'], sem: GENERIC_SEM, rxx: GENERIC_RXX },
  IMT: { id: 'IMT', name: 'Memoria de Trabajo', subtests: ['WAIS_D', 'WAIS_A'], sem: GENERIC_SEM, rxx: GENERIC_RXX },
  IVP: { id: 'IVP', name: 'Velocidad de Procesamiento', subtests: ['WAIS_BS', 'WAIS_CN'], sem: GENERIC_SEM, rxx: GENERIC_RXX },
};

export const WAIS_IV_CIT_META = {
  id: 'CIT',
  name: 'Coeficiente Intelectual Total',
  coreSubtests: [
    'WAIS_C', 'WAIS_S', 'WAIS_D', 'WAIS_M', 'WAIS_V',
    'WAIS_A', 'WAIS_BS', 'WAIS_PV', 'WAIS_I', 'WAIS_CN'
  ] as CanonicalWaisSubtestId[],
  sem: GENERIC_SEM,
  rxx: GENERIC_RXX,
};

export const WAIS_IV_ANCILLARY_INDICES = {
  IAG: {
    id: 'IAG',
    name: 'Índice de Capacidad General',
    subtests: ['WAIS_S', 'WAIS_V', 'WAIS_I', 'WAIS_C', 'WAIS_M', 'WAIS_PV'] as CanonicalWaisSubtestId[],
    sem: GENERIC_SEM,
    rxx: GENERIC_RXX,
  },
  ICC: {
    id: 'ICC',
    name: 'Índice de Competencia Cognitiva',
    subtests: ['WAIS_D', 'WAIS_A', 'WAIS_BS', 'WAIS_CN'] as CanonicalWaisSubtestId[],
    sem: GENERIC_SEM,
    rxx: GENERIC_RXX,
  },
};

/** Generic, illustrative critical differences (not from the manual). */
export const WAIS_IV_DISCREPANCY_CRITICAL = genericCriticalDifferences(['ICV', 'IRP', 'IMT', 'IVP']);

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

/** 3-subtest sum (ICV, IRP) to composite (generic, illustrative). */
export function wais3SubtestSumToComposite(_indexId: 'ICV' | 'IRP', sum: number): number {
  return genericComposite(sum, 3);
}

/** 2-subtest sum (IMT, IVP) to composite (generic, illustrative). */
export function wais2SubtestSumToComposite(_indexId: 'IMT' | 'IVP', sum: number): number {
  return genericComposite(sum, 2);
}

/** 10-subtest sum to total composite (generic, illustrative). */
export function waisCitSumToComposite(sum: number): number {
  return genericComposite(sum, 10, 40, 160);
}

/** Ancillary index composite (IAG: 6 subtests, ICC: 4 subtests; generic, illustrative). */
export function waisAncillarySumToComposite(indexId: 'IAG' | 'ICC', sum: number): number {
  return genericComposite(sum, indexId === 'IAG' ? 6 : 4);
}
