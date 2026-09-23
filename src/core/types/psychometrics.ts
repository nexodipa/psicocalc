export type BatteryType = 'WISC-V' | 'WAIS-IV';

export type WiscSubtestId =
  // WISC-V Primarios
  | 'S' | 'V' | 'C' | 'PV' | 'M' | 'B' | 'D' | 'SD' | 'CL' | 'BS'
  // WISC-V Secundarios
  | 'I' | 'CO' | 'A' | 'LN' | 'CA';

export type WaisCoreSubtestId =
  | 'WAIS_C' | 'WAIS_S' | 'WAIS_D' | 'WAIS_M' | 'WAIS_V' | 'WAIS_A' | 'WAIS_BS' | 'WAIS_PV' | 'WAIS_I' | 'WAIS_CN';

export type WaisSuppSubtestId =
  | 'WAIS_LN' | 'WAIS_B' | 'WAIS_CO' | 'WAIS_CA' | 'WAIS_FI';

export type WaisAltSubtestId =
  | 'BD' | 'SI' | 'DS' | 'MR' | 'VC' | 'AR' | 'SS' | 'VP' | 'IN' | 'CD'
  | 'PC' | 'FW';

export type SubtestId =
  | WiscSubtestId
  | WaisCoreSubtestId
  | WaisSuppSubtestId
  | WaisAltSubtestId;

export type QualitativeCategory =
  | 'Muy Superior'
  | 'Superior'
  | 'Promedio Alto'
  | 'Promedio'
  | 'Promedio Bajo'
  | 'Limítrofe'
  | 'Extremadamente Bajo';

export interface ConfidenceInterval {
  lower: number;
  upper: number;
  level: 90 | 95;
}

export interface CompositeResult {
  id: string;
  name: string;
  sumScaled: number;
  compositeScore: number;
  percentile: number;
  ci90: ConfidenceInterval;
  ci95: ConfidenceInterval;
  qualitative: QualitativeCategory;
}

export interface DiscrepancyResult {
  pair: [string, string];
  diff: number;
  isSignificant05: boolean;
  isSignificant01: boolean;
  baseRateDesc?: string;
}

export interface StrengthWeaknessResult {
  subtestId: string;
  score: number;
  difference: number;
  classification: 'Fortaleza' | 'Debilidad' | 'Promedio';
}

export interface PatientDemographics {
  nameOrId: string;
  birthDate: string; // YYYY-MM-DD
  testDate: string;  // YYYY-MM-DD
  examiner: string;
  reasonForEvaluation?: string;
  isAnonymized: boolean;
}

export interface SubtestMeta {
  id: SubtestId;
  code: string;
  name: string;
  index: string;
  isPrimary: boolean;
  isCoreCit: boolean;
  maxRawScore?: number;
}
