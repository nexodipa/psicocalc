/**
 * Type definitions for Neuropsychology & Attention instruments:
 * - D2-R (Test de Atención - Revisado)
 * - NEUROPSI Breve (Evaluación Neuropsicológica Breve en Español)
 * - MMSE (Folstein Mini-Mental / Lobo MEC / NORMACODEM)
 */

import { ProtocolValidityResult } from '../registry/TestRegistryTypes';

// ============================================================================
// D2-R Types
// ============================================================================

export interface D2rInput {
  tr: number; // Total caracteres revisados (0..658)
  ta: number; // Total aciertos (d con 2 rayas)
  o?: number;  // Omisiones (E1)
  c?: number;  // Comisiones (E2)
  e1?: number; // Alias for o
  e2?: number; // Alias for c
}

export interface D2rCalculationResult {
  tr: number;
  ta: number;
  o: number;
  c: number;
  tot: number;
  con: number;
  cpPercent: number;
  decatype: number;
  percentile: number;
  tScore: number;
  qualitativePrecision: string;
  qualitativeConcentration: string;
  clinicalNote?: string;
  validity: ProtocolValidityResult;
}

// ============================================================================
// NEUROPSI Breve Types
// ============================================================================

export type NeuropsiEducationLevel = 'nula' | 'baja' | 'media' | 'alta';
export type NeuropsiAgeGroup = '16_30' | '31_50' | '51_65' | '66_85';

export interface NeuropsiDomainScores {
  orientation?: number;            // 0..6
  attentionConcentration?: number; // 0..27
  encodingMemory?: number;         // 0..18
  language?: number;               // 0..26
  readingWriting?: number;         // 0..5
  executiveFunctions?: number;     // 0..18
  recallMemory?: number;           // 0..25
}

export interface NeuropsiBreveInput {
  domainScores?: NeuropsiDomainScores;
  totalRawScore?: number;
  age: number; // 16..85
  educationYears: number; // 0..24
}

export interface NeuropsiBreveCalculationResult {
  totalScore: number;
  domainScores: Record<string, number>;
  educationLevel: NeuropsiEducationLevel;
  ageGroup: NeuropsiAgeGroup;
  classification: 'Normal' | 'Alteración Leve' | 'Alteración Moderada' | 'Alteración Severa';
  meetsClinicalCutoff: boolean;
  alertMessage?: string;
}

// ============================================================================
// MMSE Types
// ============================================================================

export interface MmseDomainScores {
  orientationTime?: number;       // 0..5
  orientationSpace?: number;      // 0..5
  registration?: number;          // 0..3
  attentionCalculation?: number;  // 0..5
  recall?: number;                // 0..3
  languagePraxis?: number;        // 0..9
}

export interface MmseInput {
  domainScores?: MmseDomainScores;
  rawScore?: number; // 0..30
  age: number;
  educationYears: number;
}

export interface MmseCalculationResult {
  rawScore: number;
  adjustmentDelta: number;
  adjustedScore: number;
  domainScores: Record<string, number>;
  classification: string;
  rawClassification: string;
  meetsClinicalCutoff: boolean;
  alertMessage?: string;
}
