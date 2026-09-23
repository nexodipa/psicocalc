/**
 * Type definitions for the unified clinical session state:
 * - WISC-V & WAIS-IV (Wechsler Intelligence)
 * - SDQ (Goodman Strengths and Difficulties)
 * - PHQ-9 (Patient Health Questionnaire - Depression)
 * - GAD-7 (Generalized Anxiety Disorder)
 * - MoCA (Montreal Cognitive Assessment)
 * - HTP (House-Tree-Person Projective Assessment)
 */

import {
  BatteryType,
  CompositeResult,
  DiscrepancyResult,
  PatientDemographics,
  StrengthWeaknessResult,
  SubtestId,
  validateAgeAndBattery,
} from '../../core';
import {
  SdqCalculationResult,
  SdqInformantType,
  Phq9CalculationResult,
  Gad7CalculationResult,
  MocaCalculationResult,
  MocaDomainScores,
} from '../../core/types/clinical';
import {
  HtpAssessmentRecord,
  HtpNarrativeReport,
  HtpBenchmarkPreset,
} from '../../core/types/htp';

export type ClinicalCategory =
  | 'intelligence'
  | 'behavior_emotion'
  | 'neurocognitive'
  | 'projective'
  | 'report';

export type ClinicalInstrument =
  | 'wisc_v'
  | 'wais_iv'
  | 'sdq'
  | 'phq_9'
  | 'gad_7'
  | 'moca'
  | 'htp';

export interface ExtendedPatientDemographics extends PatientDemographics {
  educationYears?: number; // Education years for MoCA (+1 if <= 12)
  schoolGrade?: string;
  medicalRecordNumber?: string;
}

export interface WechslerSessionState {
  subtests: Partial<Record<SubtestId, number>>;
  rawInputs: Record<string, string>;
  invalidSubtests: Record<string, string>;
}

export interface SdqSessionState {
  informant: SdqInformantType;
  responses: Record<number, number>; // items 1..25
}

export interface Phq9SessionState {
  responses: Record<number, number>; // items 1..9
}

export interface Gad7SessionState {
  responses: Record<number, number>; // items 1..7
}

export interface MocaSessionState {
  domains: MocaDomainScores;
  educationYears: number;
}

export interface AdministeredInstruments {
  wiscV: boolean;
  waisIV: boolean;
  sdq: boolean;
  phq9: boolean;
  gad7: boolean;
  moca: boolean;
  htp: boolean;
}

export interface ClinicalSessionState {
  // Navigation
  activeCategory: ClinicalCategory;
  activeInstrument: ClinicalInstrument;

  // Demographics & Anonymization
  demographics: ExtendedPatientDemographics;
  originalName: string;

  // Wechsler batteries (independent states to avoid losing data)
  wiscState: WechslerSessionState;
  waisState: WechslerSessionState;
  currentBattery: BatteryType;

  // Clinical questionnaire states
  sdqState: SdqSessionState;
  phq9State: Phq9SessionState;
  gad7State: Gad7SessionState;
  mocaState: MocaSessionState;
  htpRecord: HtpAssessmentRecord;
}

export interface ClinicalSessionContextValue {
  // State
  state: ClinicalSessionState;
  administered: AdministeredInstruments;

  // Navigation
  activeCategory: ClinicalCategory;
  activeInstrument: ClinicalInstrument;
  setActiveCategory: (category: ClinicalCategory) => void;
  setActiveInstrument: (instrument: ClinicalInstrument) => void;

  // Demographics
  demographics: ExtendedPatientDemographics;
  displayName: string;
  setDemographics: (updater: Partial<ExtendedPatientDemographics>) => void;
  toggleAnonymize: () => void;
  ageValidationWisc: ReturnType<typeof validateAgeAndBattery>;
  ageValidationWais: ReturnType<typeof validateAgeAndBattery>;

  // Wechsler (WISC-V / WAIS-IV)
  currentBattery: BatteryType;
  setBattery: (battery: BatteryType) => void;
  subtests: Partial<Record<SubtestId, number>>;
  rawInputs: Record<string, string>;
  invalidSubtests: Record<string, string>;
  hasInvalidScores: boolean;
  administeredSubtestCount: number;
  setSubtestScore: (id: SubtestId, score: number | null, rawText?: string) => void;
  clearAllScores: () => void;
  loadSampleProfile: (type: 'average' | 'gifted' | 'adhd') => void;
  primaryIndices: Record<string, CompositeResult | null>;
  cit: CompositeResult | null;
  ancillaryIndices: Record<string, CompositeResult | null>;
  discrepancies: DiscrepancyResult[];
  strengthsWeaknesses: StrengthWeaknessResult[];
  isCompleteCit: boolean;

  // SDQ
  sdqState: SdqSessionState;
  setSdqResponse: (itemNumber: number, value: 0 | 1 | 2) => void;
  setSdqInformant: (informant: SdqInformantType) => void;
  clearSdq: () => void;
  loadSdqSample: (preset?: 'normal' | 'clinical') => void;
  sdqCalculation: SdqCalculationResult | null;
  isSdqCompleted: boolean;

  // PHQ-9
  phq9State: Phq9SessionState;
  setPhq9Response: (itemNumber: number, value: 0 | 1 | 2 | 3) => void;
  clearPhq9: () => void;
  loadPhq9Sample: (preset?: 'minimal' | 'moderate' | 'critical') => void;
  phq9Calculation: Phq9CalculationResult | null;
  isPhq9Completed: boolean;
  isPhq9Item9AlertActive: boolean;

  // GAD-7
  gad7State: Gad7SessionState;
  setGad7Response: (itemNumber: number, value: 0 | 1 | 2 | 3) => void;
  clearGad7: () => void;
  loadGad7Sample: (preset?: 'minimal' | 'moderate' | 'severe') => void;
  gad7Calculation: Gad7CalculationResult | null;
  isGad7Completed: boolean;

  // MoCA
  mocaState: MocaSessionState;
  setMocaDomainScore: (domain: keyof MocaDomainScores, score: number) => void;
  setMocaEducationYears: (years: number) => void;
  clearMoca: () => void;
  loadMocaSample: (preset?: 'normal' | 'mci') => void;
  mocaCalculation: MocaCalculationResult | null;
  isMocaCompleted: boolean;
  isMocaAlertActive: boolean;

  // HTP
  htpRecord: HtpAssessmentRecord;
  setHtpRecord: (updater: HtpAssessmentRecord | ((prev: HtpAssessmentRecord) => HtpAssessmentRecord)) => void;
  clearHtp: () => void;
  loadHtpPreset: (preset: HtpBenchmarkPreset) => void;
  htpReport: HtpNarrativeReport;
  isHtpCompleted: boolean;

  // Global Session Actions
  resetFullSession: () => void;
  loadDemoSession: () => void;
}
