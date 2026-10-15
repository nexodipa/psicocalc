/**
 * Type definitions for Personality & Psychopathology instruments:
 * - MMPI-3 (Minnesota Multiphasic Personality Inventory - 3)
 * - PAI (Personality Assessment Inventory)
 * - MCMI-IV (Millon Clinical Multiaxial Inventory - IV)
 */

import { ProtocolValidityResult } from '../registry/TestRegistryTypes';

// ============================================================================
// MMPI-3 Types
// ============================================================================

export type Mmpi3ValidityScaleId =
  | 'CNS'
  | 'CRIN'
  | 'VRIN'
  | 'TRIN'
  | 'F'
  | 'Fp'
  | 'Fs'
  | 'FBS'
  | 'RBS'
  | 'L'
  | 'K';

export type Mmpi3HigherOrderScaleId = 'EID' | 'THD' | 'BXD';

export type Mmpi3RestructuredClinicalScaleId =
  | 'RCd'
  | 'RC1'
  | 'RC2'
  | 'RC4'
  | 'RC6'
  | 'RC7'
  | 'RC8'
  | 'RC9';

export type Mmpi3SomaticCognitiveScaleId = 'MLS' | 'NUC' | 'EAT' | 'COG';

export type Mmpi3SpecificInternalizingScaleId =
  | 'SUI'
  | 'HLP'
  | 'SFD'
  | 'NFC'
  | 'STR'
  | 'WRY'
  | 'CMP'
  | 'ARX'
  | 'ANP'
  | 'BRF';

export type Mmpi3SpecificExternalizingScaleId = 'FML' | 'JCP' | 'SUB' | 'IMP' | 'ACT';

export type Mmpi3InterpersonalScaleId = 'SFI' | 'DOM' | 'DSF' | 'SAV' | 'SHY';

export type Mmpi3Psy5ScaleId = 'AGGR' | 'PSYC' | 'DISC' | 'NEGE' | 'INTR';

export type Mmpi3ScaleId =
  | Mmpi3ValidityScaleId
  | Mmpi3HigherOrderScaleId
  | Mmpi3RestructuredClinicalScaleId
  | Mmpi3SomaticCognitiveScaleId
  | Mmpi3SpecificInternalizingScaleId
  | Mmpi3SpecificExternalizingScaleId
  | Mmpi3InterpersonalScaleId
  | Mmpi3Psy5ScaleId;

export interface Mmpi3ScaleScore {
  scaleId: Mmpi3ScaleId;
  rawScore: number;
  tScore: number;
  percentile: number;
  elevation: 'normal' | 'clinical' | 'marked'; // normal < 65, clinical 65-79, marked >= 80
}

export interface Mmpi3Input {
  rawScores?: Partial<Record<Mmpi3ScaleId, number>>;
  tScores?: Partial<Record<Mmpi3ScaleId, number>>;
  omittedCount?: number;
}

export interface Mmpi3CalculationResult {
  scales: Record<string, Mmpi3ScaleScore>;
  validity: ProtocolValidityResult;
  clinicalProfileInterpretable: boolean;
  primaryElevations: string[];
  suicideRiskAlert: {
    triggered: boolean;
    level: 'NONE' | 'CLINICAL_ALERT' | 'CRITICAL_RISK';
    message: string;
  };
  clinicalClassification: string;
}

// ============================================================================
// PAI Types
// ============================================================================

export type PaiValidityScaleId = 'ICN' | 'INF' | 'NIM' | 'PIM';

export type PaiClinicalScaleId =
  | 'SOM'
  | 'ANX'
  | 'ARD'
  | 'DEP'
  | 'MAN'
  | 'PAR'
  | 'SCZ'
  | 'BOR'
  | 'ANT'
  | 'ALC'
  | 'DRG';

export type PaiTreatmentScaleId = 'AGG' | 'SUI' | 'STR' | 'NON' | 'RXR';

export type PaiInterpersonalScaleId = 'DOM' | 'WRM';

export type PaiMainScaleId =
  | PaiValidityScaleId
  | PaiClinicalScaleId
  | PaiTreatmentScaleId
  | PaiInterpersonalScaleId;

export type PaiSubscaleId =
  | 'SOM-C' | 'SOM-S' | 'SOM-H'
  | 'ANX-C' | 'ANX-A' | 'ANX-P'
  | 'ARD-O' | 'ARD-P' | 'ARD-T'
  | 'DEP-C' | 'DEP-A' | 'DEP-P'
  | 'MAN-A' | 'MAN-G' | 'MAN-I'
  | 'PAR-H' | 'PAR-P' | 'PAR-R'
  | 'SCZ-P' | 'SCZ-S' | 'SCZ-A'
  | 'BOR-A' | 'BOR-I' | 'BOR-N' | 'BOR-S'
  | 'ANT-A' | 'ANT-E' | 'ANT-S'
  | 'AGG-A' | 'AGG-V' | 'AGG-P';

export interface PaiScaleScore {
  scaleId: string;
  rawScore: number;
  tScore: number;
  percentile: number;
  elevation: 'normal' | 'moderate' | 'clinical' | 'marked'; // normal < 60, moderate 60-69, clinical 70-81, marked >= 82
}

export interface PaiInput {
  rawScores?: Record<string, number>;
  tScores?: Record<string, number>;
  omittedCount?: number;
  scaleOmissions?: Record<string, number>;
}

export interface PaiCalculationResult {
  scales: Record<string, PaiScaleScore>;
  subscales: Record<string, PaiScaleScore>;
  validity: ProtocolValidityResult;
  clinicalProfileInterpretable: boolean;
  meetsClinicalCutoff: boolean;
  elevations: string[];
  suicideRiskAlert: {
    triggered: boolean;
    level: 'NONE' | 'CLINICAL_ALERT' | 'CRITICAL_RISK';
    message: string;
  };
  substanceAlert: {
    triggered: boolean;
    message: string;
  };
  summary: string;
}

// ============================================================================
// MCMI-IV Types
// ============================================================================

export type Mcmi4ModifyingIndexId = 'V' | 'W' | 'X' | 'Y' | 'Z';

export type Mcmi4ClinicalPatternId =
  | '1'
  | '2A'
  | '2B'
  | '3'
  | '4A'
  | '4B'
  | '5'
  | '6A'
  | '6B'
  | '7'
  | '8A'
  | '8B';

export type Mcmi4SeverePersonalityId = 'S' | 'C' | 'P';

export type Mcmi4ClinicalSyndromeId = 'A' | 'H' | 'N' | 'D' | 'B' | 'T' | 'R';

export type Mcmi4SevereSyndromeId = 'SS' | 'CC' | 'PP';

export type Mcmi4ScaleId =
  | Mcmi4ModifyingIndexId
  | Mcmi4ClinicalPatternId
  | Mcmi4SeverePersonalityId
  | Mcmi4ClinicalSyndromeId
  | Mcmi4SevereSyndromeId;

export interface Mcmi4ScaleScore {
  scaleId: Mcmi4ScaleId;
  rawScore: number;
  baseRate: number; // 0 to 115
  presence: boolean; // TB >= 75
  prominence: boolean; // TB >= 85
  qualitativeLevel: 'No significativo' | 'Estilo' | 'Presencia' | 'Prominencia';
}

export interface Mcmi4Input {
  rawScores?: Partial<Record<Mcmi4ScaleId, number>>;
  baseRates?: Partial<Record<Mcmi4ScaleId, number>>;
  omittedCount?: number;
}

export interface Mcmi4CalculationResult {
  scales: Record<string, Mcmi4ScaleScore>;
  validity: ProtocolValidityResult;
  clinicalProfileInterpretable: boolean;
  presenceScales: string[];
  prominenceScales: string[];
  diagnosticSummary: string;
}
