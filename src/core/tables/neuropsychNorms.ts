/**
 * Normative tables and cutoffs for:
 * - D2-R
 * - NEUROPSI Breve
 * - MMSE (Folstein / NORMACODEM)
 */

import {
  NeuropsiAgeGroup,
  NeuropsiEducationLevel,
} from '../types/neuropsych';

// ============================================================================
// D2-R Norms
// ============================================================================

export const D2R_NORMS = {
  // Adult reference parameters for Concentration Index (CON)
  CON_MEAN: 175,
  CON_SD: 35,
  // Processing Speed reference parameters (TR)
  TR_MEAN: 470,
  TR_SD: 75,
  // Limits
  MAX_TR: 658,
  MIN_VALID_TR: 100,
  MAX_VALID_CP_PERCENT: 40.0,
};

// ============================================================================
// NEUROPSI Breve Official 16-Cell Normative Cutoffs
// ============================================================================

export interface NeuropsiCutoffThresholds {
  normalMin: number;
  maxScore: number;
  leveMin: number;
  leveMax: number;
  moderadaMin: number;
  moderadaMax: number;
  severaMax: number;
}

export const NEUROPSI_CUTOFFS: Record<
  NeuropsiEducationLevel,
  Record<NeuropsiAgeGroup, NeuropsiCutoffThresholds>
> = {
  alta: {
    '16_30': { normalMin: 114, maxScore: 130, leveMin: 103, leveMax: 113, moderadaMin: 98, moderadaMax: 102, severaMax: 97 },
    '31_50': { normalMin: 112, maxScore: 130, leveMin: 102, leveMax: 111, moderadaMin: 97, moderadaMax: 101, severaMax: 96 },
    '51_65': { normalMin: 101, maxScore: 130, leveMin: 93, leveMax: 100, moderadaMin: 88, moderadaMax: 92, severaMax: 87 },
    '66_85': { normalMin: 91, maxScore: 130, leveMin: 78, leveMax: 90, moderadaMin: 72, moderadaMax: 77, severaMax: 71 },
  },
  media: {
    '16_30': { normalMin: 113, maxScore: 130, leveMin: 102, leveMax: 112, moderadaMin: 97, moderadaMax: 101, severaMax: 96 },
    '31_50': { normalMin: 117, maxScore: 130, leveMin: 106, leveMax: 116, moderadaMin: 101, moderadaMax: 105, severaMax: 100 },
    '51_65': { normalMin: 110, maxScore: 130, leveMin: 98, leveMax: 109, moderadaMin: 91, moderadaMax: 97, severaMax: 90 },
    '66_85': { normalMin: 96, maxScore: 130, leveMin: 80, leveMax: 95, moderadaMin: 72, moderadaMax: 79, severaMax: 71 },
  },
  baja: {
    '16_30': { normalMin: 103, maxScore: 124, leveMin: 92, leveMax: 102, moderadaMin: 87, moderadaMax: 91, severaMax: 86 },
    '31_50': { normalMin: 98, maxScore: 124, leveMin: 87, leveMax: 97, moderadaMin: 81, moderadaMax: 86, severaMax: 80 },
    '51_65': { normalMin: 89, maxScore: 124, leveMin: 76, leveMax: 88, moderadaMin: 70, moderadaMax: 75, severaMax: 69 },
    '66_85': { normalMin: 73, maxScore: 124, leveMin: 59, leveMax: 72, moderadaMin: 52, moderadaMax: 58, severaMax: 51 },
  },
  nula: {
    '16_30': { normalMin: 91, maxScore: 117, leveMin: 79, leveMax: 90, moderadaMin: 73, moderadaMax: 78, severaMax: 72 },
    '31_50': { normalMin: 84, maxScore: 117, leveMin: 71, leveMax: 83, moderadaMin: 65, moderadaMax: 70, severaMax: 64 },
    '51_65': { normalMin: 75, maxScore: 117, leveMin: 63, leveMax: 74, moderadaMin: 57, moderadaMax: 62, severaMax: 56 },
    '66_85': { normalMin: 61, maxScore: 117, leveMin: 47, leveMax: 60, moderadaMin: 40, moderadaMax: 46, severaMax: 39 },
  },
};

export function getNeuropsiEducationLevel(years: number): NeuropsiEducationLevel {
  if (years <= 0) return 'nula';
  if (years <= 4) return 'baja';
  if (years <= 9) return 'media';
  return 'alta';
}

export function getNeuropsiAgeGroup(age: number): NeuropsiAgeGroup {
  if (age <= 30) return '16_30';
  if (age <= 50) return '31_50';
  if (age <= 65) return '51_65';
  return '66_85';
}

// ============================================================================
// MMSE / NORMACODEM Norms
// ============================================================================

export function getNormacodemDelta(age: number, educationYears: number): number {
  if (educationYears <= 8) {
    return age > 75 ? 2 : 1;
  }
  if (educationYears <= 17) {
    return age > 75 ? 1 : 0;
  }
  // Education > 17
  return age > 75 ? 0 : -1;
}

export function getMmseClassification(score: number): {
  classification: string;
  meetsClinicalCutoff: boolean;
} {
  if (score >= 27) {
    return { classification: 'Normal / Cognición Intacta', meetsClinicalCutoff: false };
  }
  if (score >= 24) {
    return { classification: 'Sospecha / Deterioro Cognitivo Leve', meetsClinicalCutoff: false };
  }
  if (score >= 18) {
    return { classification: 'Deterioro Cognitivo Moderado', meetsClinicalCutoff: true };
  }
  return { classification: 'Deterioro Cognitivo Severo', meetsClinicalCutoff: true };
}
