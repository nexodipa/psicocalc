/**
 * Unified type definitions for Centralized TestRegistry across 6 clinical domains:
 * 1. intelligence_aptitudes
 * 2. neuropsychology_attention
 * 3. personality_psychopathology
 * 4. adaptive_behavior
 * 5. child_adolescent_emotional
 * 6. projective_guides
 */

import { PatientDemographics } from '../types/psychometrics';

export type ClinicalDomainId =
  | 'intelligence_aptitudes'
  | 'neuropsychology_attention'
  | 'personality_psychopathology'
  | 'adaptive_behavior'
  | 'child_adolescent_emotional'
  | 'projective_guides';

export type ScoringMetricType =
  | 'standard_iq'      // Mean 100, SD 15
  | 'scaled_score'     // Mean 10, SD 3 [1..19]
  | 't_score'          // Mean 50, SD 10
  | 'base_rate'        // Millon Base Rate [0..115]
  | 'screening_cutoff' // Direct score with clinical threshold
  | 'speed_accuracy'   // Attention, speed, omission/commission errors
  | 'qualitative';     // Pure qualitative descriptive assessment

export type TargetAgeGroup = 'child' | 'adolescent' | 'adult' | 'elderly' | 'all';

export interface ProtocolValidityResult {
  isValidProtocol: boolean;
  invalidationReason?: string;
  invalidationReasons?: string[];
  inconsistencyIndex?: number;
  omittedCount?: number;
  fakingGoodFlag?: boolean;
  fakingBadFlag?: boolean;
  cautionFlags?: string[];
}

export interface InstrumentMetadata {
  id: string;
  name: string;
  fullName: string;
  domain: ClinicalDomainId;
  scoringType: ScoringMetricType;
  ageRange: { minYears: number; maxYears: number; description: string };
  targetGroups: TargetAgeGroup[];
  estimatedMinutes: number;
  keywords: string[];
  requiresEducationAdjustment?: boolean;
  clinicalAlertsSupported?: string[];
  normReference?: string;
}

export interface InstrumentValidationResult {
  isValid: boolean;
  errors: string[];
  validity?: ProtocolValidityResult;
}

export interface ClinicalAlertInfo {
  active: boolean;
  label: string;
  severity: 'warning' | 'critical';
  details?: string;
}

export interface InstrumentDefinition<TInput = any, TResult = any> {
  metadata: InstrumentMetadata;
  createInitialState: () => TInput;
  loadSampleProfile?: (preset: string) => TInput;
  calculate: (input: TInput, demographics?: PatientDemographics | any) => TResult;
  validateInput: (input: TInput, demographics?: PatientDemographics | any) => InstrumentValidationResult;
  isCompleted: (input: TInput, result?: TResult | null) => boolean;
  hasActiveAlert?: (result: TResult | null) => ClinicalAlertInfo;
}
