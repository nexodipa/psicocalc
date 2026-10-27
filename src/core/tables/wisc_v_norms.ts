import { SubtestMeta, WiscSubtestId } from '../types/psychometrics';
import { GENERIC_RXX, GENERIC_SEM, genericComposite, genericCriticalDifferences } from './normUtils';

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
  ICV: { id: 'ICV', name: 'Comprensión Verbal', subtests: ['S', 'V'], sem: GENERIC_SEM, rxx: GENERIC_RXX },
  IVE: { id: 'IVE', name: 'Visoespacial', subtests: ['C', 'PV'], sem: GENERIC_SEM, rxx: GENERIC_RXX },
  IRF: { id: 'IRF', name: 'Razonamiento Fluido', subtests: ['M', 'B'], sem: GENERIC_SEM, rxx: GENERIC_RXX },
  IMT: { id: 'IMT', name: 'Memoria de Trabajo', subtests: ['D', 'SD'], sem: GENERIC_SEM, rxx: GENERIC_RXX },
  IVP: { id: 'IVP', name: 'Velocidad de Procesamiento', subtests: ['CL', 'BS'], sem: GENERIC_SEM, rxx: GENERIC_RXX },
};

export const WISC_V_CIT_META = {
  id: 'CIT',
  name: 'Coeficiente Intelectual Total',
  coreSubtests: ['S', 'V', 'C', 'M', 'B', 'D', 'CL'] as WiscSubtestId[],
  sem: GENERIC_SEM,
  rxx: GENERIC_RXX,
};

export const WISC_V_ANCILLARY_INDICES = {
  IAG: { id: 'IAG', name: 'Índice de Capacidad General', subtests: ['S', 'V', 'C', 'M', 'B'] as WiscSubtestId[], sem: GENERIC_SEM, rxx: GENERIC_RXX },
  ICC: { id: 'ICC', name: 'Índice de Competencia Cognitiva', subtests: ['D', 'SD', 'CL', 'BS'] as WiscSubtestId[], sem: GENERIC_SEM, rxx: GENERIC_RXX },
  INV: { id: 'INV', name: 'Índice No Verbal', subtests: ['C', 'PV', 'M', 'B', 'SD', 'CL'] as WiscSubtestId[], sem: GENERIC_SEM, rxx: GENERIC_RXX },
  IRC: { id: 'IRC', name: 'Índice de Razonamiento Cuantitativo', subtests: ['B', 'A'] as WiscSubtestId[], sem: GENERIC_SEM, rxx: GENERIC_RXX },
  IMTA: { id: 'IMTA', name: 'Índice de Memoria de Trabajo Auditiva', subtests: ['D', 'LN'] as WiscSubtestId[], sem: GENERIC_SEM, rxx: GENERIC_RXX },
};

/**
 * Pairwise critical differences between primary indices.
 * Generic and illustrative: computed from a single placeholder SEM, not from the manual.
 */
export const WISC_V_DISCREPANCY_CRITICAL = genericCriticalDifferences(['ICV', 'IVE', 'IRF', 'IMT', 'IVP']);

/** Sum of two scaled scores to a primary index composite (generic, illustrative). */
export function wiscPrimarySumToComposite(_indexId: string, sum: number): number {
  return genericComposite(sum, 2);
}

/** Sum of the seven core scaled scores to a total composite (generic, illustrative). */
export function wiscCitSumToComposite(sum: number): number {
  return genericComposite(sum, 7, 40, 160);
}

const WISC_ANCILLARY_COUNTS = { IAG: 5, ICC: 4, INV: 6, IRC: 2, IMTA: 2 } as const;

/** Ancillary index composite (generic, illustrative). */
export function wiscAncillarySumToComposite(
  indexId: 'IAG' | 'ICC' | 'INV' | 'IRC' | 'IMTA',
  sum: number
): number {
  return genericComposite(sum, WISC_ANCILLARY_COUNTS[indexId]);
}
