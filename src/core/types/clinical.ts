/**
 * Types and data models for clinical psychometric instruments in Psicocalc:
 * - SDQ (Strengths and Difficulties Questionnaire - Goodman)
 * - PHQ-9 (Patient Health Questionnaire - 9 - Kroenke & Spitzer)
 * - GAD-7 (Generalized Anxiety Disorder - 7 - Spitzer et al.)
 * - MoCA (Montreal Cognitive Assessment - Nasreddine)
 */

// ============================================================================
// SDQ (Strengths and Difficulties Questionnaire) Types
// ============================================================================

export type SdqInformantType = 'parent' | 'self' | 'teacher';

export type SdqSubscaleId =
  | 'emotional'
  | 'conduct'
  | 'hyperactivity'
  | 'peer'
  | 'prosocial';

export type SdqBandClassification = 'Normal' | 'Borderline' | 'Abnormal';

export type SdqResponse = 0 | 1 | 2;

export interface SdqItemDefinition {
  itemNumber: number; // 1..25
  text: string;
  subscale: SdqSubscaleId;
  isReversed: boolean;
}

export interface SdqSubscaleResult {
  id: SdqSubscaleId;
  name: string;
  rawScore: number; // [0..10]
  maxScore: number; // 10
  classification: SdqBandClassification;
  isStrengthScale: boolean; // true only for prosocial
  answeredCount: number; // count of answered items in this subscale
  isProrated: boolean; // true if prorated due to missing item(s)
}

export interface SdqTotalDifficultiesResult {
  score: number; // [0..40]
  maxScore: number; // 40
  classification: SdqBandClassification;
}

export interface SdqCalculationResult {
  informant: SdqInformantType;
  subscales: Record<SdqSubscaleId, SdqSubscaleResult>;
  totalDifficulties: SdqTotalDifficultiesResult;
  itemScores: Record<number, number>; // Transformed/inverted item scores (1..25)
  isProrated: boolean;
  isValid: boolean;
}

export type SdqItemResponses = Record<number, SdqResponse | number | undefined | null>;

export interface SdqInput {
  informant: SdqInformantType;
  responses: SdqItemResponses;
}

// ============================================================================
// PHQ-9 (Patient Health Questionnaire - 9) Types
// ============================================================================

export type Phq9Response = 0 | 1 | 2 | 3;

export type Phq9SeverityBand =
  | 'Ninguna / Mínima'
  | 'Leve'
  | 'Moderada'
  | 'Moderadamente Severa'
  | 'Severa';

export interface Phq9ItemDefinition {
  itemNumber: number; // 1..9
  text: string;
  symptom: string;
}

export interface Phq9SuicideAlert {
  triggered: boolean;
  itemScore: Phq9Response;
  level: 'NONE' | 'CRITICAL';
  bannerText: string;
  clinicalActionRequired: boolean;
  clinicalNote: string;
}

export interface Phq9CalculationResult {
  totalScore: number; // [0..27]
  severity: Phq9SeverityBand;
  meetsClinicalCutoff: boolean; // totalScore >= 10
  meetsMajorDepressionCriteria: boolean; // Algorithmic DSM-5 criteria
  suicideRiskAlert: Phq9SuicideAlert;
  isItem9AlertActive: boolean; // Required flag: item_9 >= 1
  alertLevel: 'NONE' | 'CRITICAL';
  interpretation: string;
  recommendation: string;
}

export type Phq9ItemResponses = Record<number, Phq9Response | number> | number[];

export interface Phq9Input {
  responses: Phq9ItemResponses;
}

// ============================================================================
// GAD-7 (Generalized Anxiety Disorder - 7) Types
// ============================================================================

export type Gad7Response = 0 | 1 | 2 | 3;

export type Gad7SeverityBand =
  | 'Ansiedad mínima'
  | 'Ansiedad leve'
  | 'Ansiedad moderada'
  | 'Ansiedad severa';

export interface Gad7ItemDefinition {
  itemNumber: number; // 1..7
  text: string;
  symptom: string;
}

export interface Gad7CalculationResult {
  totalScore: number; // [0..21]
  severity: Gad7SeverityBand;
  meetsClinicalCutoff: boolean; // totalScore >= 10 (probable GAD)
  interpretation: string;
  recommendation: string;
}

export type Gad7ItemResponses = Record<number, Gad7Response | number> | number[];

export interface Gad7Input {
  responses: Gad7ItemResponses;
}

// ============================================================================
// MoCA (Montreal Cognitive Assessment) Types
// ============================================================================

export type MocaDomainId =
  | 'visuospatialExecutive'
  | 'naming'
  | 'attention'
  | 'language'
  | 'abstraction'
  | 'delayedRecall'
  | 'orientation';

export interface MocaDomainDefinition {
  id: MocaDomainId;
  name: string;
  maxScore: number;
  description: string;
}

export interface MocaDomainResult {
  id: MocaDomainId;
  name: string;
  score: number;
  maxScore: number;
}

export type MocaClassification =
  | 'Normal'
  | 'Deterioro Cognitivo Leve'
  | 'Deterioro Cognitivo Moderado'
  | 'Deterioro Cognitivo Severo';

export interface MocaDomainScores {
  visuospatialExecutive: number; // 0..5
  naming: number;                // 0..3
  attention: number;             // 0..6
  language: number;              // 0..3
  abstraction: number;           // 0..2
  delayedRecall: number;         // 0..5
  orientation: number;           // 0..6
}

export interface MocaCalculationResult {
  rawScore: number; // [0..30]
  educationAdjustment: 0 | 1;
  educationYears: number;
  adjustedScore: number; // [0..30] strictly capped at 30
  meetsClinicalCutoff: boolean; // adjustedScore < 26 (MCI / impairment alert)
  classification: MocaClassification;
  domains: Record<MocaDomainId, MocaDomainResult>;
  interpretation: string;
  recommendation: string;
}

export interface MocaInput {
  domains: Partial<MocaDomainScores> | MocaDomainScores;
  educationYears: number;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ClinicalValidationResult {
  isValid: boolean;
  errors: string[];
}
