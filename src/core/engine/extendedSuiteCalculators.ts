/**
 * Extended Psychometric Suite Calculators & Validators
 *
 * Implements deterministic scoring, normative conversions (IQ 100±15, T-Scores 50±10,
 * Base Rates 0-115, Decatypes 1-10, Percentiles), protocol validity checks, and clinical alerts for:
 *
 * - TONI-4 (Test de Inteligencia No Verbal - 4)
 * - IPP-R (Intereses y Preferencias Profesionales - Revisado)
 * - BRIEF-A (Evaluación Conductual de la Función Ejecutiva - Adultos)
 * - CUMANES (Cuestionario de Madurez Neuropsicológica Escolar)
 * - NEURO-KID (Evaluación Neuropsicológica Rápida Infantil)
 * - LOLE (Del Lenguaje Oral al Lenguaje Escrito)
 * - MMPI-2-RF (Inventario Multifásico de Personalidad de Minnesota-2 Reestructurado)
 * - MMPI-A-RF (Inventario Multifásico de Personalidad de Minnesota para Adolescentes Reestructurado)
 * - BFQ (Cuestionario "Big Five" de Personalidad)
 * - STAXI-2 (Inventario de Expresión de Ira Estado-Rasgo - 2)
 * - LSB-50 (Listado de Síntomas Breve - 50)
 * - MACI-IV (Inventario Clínico para Adolescentes de Millon)
 * - DP-3 (Perfil de Desarrollo - 3)
 * - CECAD (Cuestionario Educativo-Clínico: Ansiedad y Depresión)
 * - IAC (Inventario de Adaptación de Conducta)
 * - ICCP (Inventario de Competencias y Conducta Psicosocial Infanto-Juvenil)
 */

import { InstrumentValidationResult, ProtocolValidityResult } from '../registry/TestRegistryTypes';

// ============================================================================
// Helper: Standard Normal CDF & Normative Conversions
// ============================================================================

function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const prob =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - prob : prob;
}

export function standardScoreToPercentile(ss: number): number {
  const z = (ss - 100) / 15;
  const p = normalCdf(z) * 100;
  return Math.max(1, Math.min(99, Math.round(p)));
}

export function tScoreToPercentile(t: number): number {
  const z = (t - 50) / 10;
  const p = normalCdf(z) * 100;
  return Math.max(1, Math.min(99, Math.round(p)));
}

export function classifyStandardIq(ss: number): string {
  if (ss >= 130) return 'Muy Superior';
  if (ss >= 120) return 'Superior';
  if (ss >= 110) return 'Promedio Alto';
  if (ss >= 90) return 'Promedio';
  if (ss >= 80) return 'Promedio Bajo';
  if (ss >= 70) return 'Limítrofe';
  return 'Muy Bajo (Compromiso Clínico)';
}

export function classifyTScoreScale(
  t: number,
  isProtective: boolean = false
): { label: string; isClinical: boolean; isModerate: boolean } {
  if (isProtective) {
    if (t <= 30) return { label: 'Déficit Severo (Riesgo)', isClinical: true, isModerate: false };
    if (t <= 39) return { label: 'Nivel Bajo (Vulnerabilidad)', isClinical: false, isModerate: true };
    if (t <= 60) return { label: 'Nivel Adecuado (Promedio)', isClinical: false, isModerate: false };
    return { label: 'Fortaleza Destacada (Alto)', isClinical: false, isModerate: false };
  }
  if (t >= 75) return { label: 'Elevación Muy Significativa (T ≥ 75)', isClinical: true, isModerate: false };
  if (t >= 65) return { label: 'Significación Clínica (T ≥ 65)', isClinical: true, isModerate: false };
  if (t >= 60) return { label: 'Elevación Moderada / subclínica', isClinical: false, isModerate: true };
  if (t >= 40) return { label: 'Rango Normativo (Promedio)', isClinical: false, isModerate: false };
  return { label: 'Puntuación Baja (T < 40)', isClinical: false, isModerate: false };
}

// ============================================================================
// 1. TONI-4 (Test of Nonverbal Intelligence - 4th Edition)
// ============================================================================

export interface Toni4Input {
  rawScore?: number;
  ageYears?: number;
  ageMonths?: number;
  form?: 'A' | 'B';
}

export interface Toni4Result {
  rawScore: number;
  ageYears: number;
  form: 'A' | 'B';
  indexScore: number; // M=100, SD=15
  percentile: number;
  ci90: [number, number];
  ci95: [number, number];
  classification: string;
  qualitative: string;
  meetsClinicalCutoff: boolean;
}

export function validateToni4(input: Toni4Input): InstrumentValidationResult {
  const errors: string[] = [];
  const age = input.ageYears ?? 12;
  const raw = input.rawScore ?? 0;

  if (age < 6 || age > 89.99) {
    errors.push('TONI-4 está baremado para edades entre 6:0 y 89:11 años.');
  }
  if (raw < 0 || raw > 60) {
    errors.push('La puntuación directa de TONI-4 debe situarse entre 0 y 60 aciertos.');
  }

  return { isValid: errors.length === 0, errors };
}

export function calculateToni4(input: Toni4Input): Toni4Result {
  const age = Math.max(6, Math.min(89, input.ageYears ?? 12));
  const raw = Math.max(0, Math.min(60, input.rawScore ?? 0));
  const form = input.form || 'A';

  let expectedMean = 32;
  let expectedSd = 8.5;
  if (age < 9) {
    expectedMean = 19;
    expectedSd = 6.5;
  } else if (age < 13) {
    expectedMean = 28;
    expectedSd = 7.5;
  } else if (age < 18) {
    expectedMean = 35;
    expectedSd = 8.0;
  } else if (age < 55) {
    expectedMean = 40;
    expectedSd = 8.5;
  } else {
    expectedMean = 34;
    expectedSd = 9.0;
  }

  const z = (raw - expectedMean) / expectedSd;
  const indexScore = Math.max(45, Math.min(155, Math.round(100 + z * 15)));
  const percentile = standardScoreToPercentile(indexScore);
  const qualitative = classifyStandardIq(indexScore);

  return {
    rawScore: raw,
    ageYears: age,
    form,
    indexScore,
    percentile,
    ci90: [Math.max(40, indexScore - 5), Math.min(160, indexScore + 5)],
    ci95: [Math.max(40, indexScore - 7), Math.min(160, indexScore + 7)],
    classification: qualitative,
    qualitative,
    meetsClinicalCutoff: indexScore <= 70,
  };
}

// ============================================================================
// 2. DP-3 (Perfil de Desarrollo - 3)
// ============================================================================

export type Dp3ScaleId = 'MOT' | 'ADP' | 'SOC' | 'COG' | 'COM';

export interface Dp3Input {
  scales?: Partial<Record<Dp3ScaleId, number>>;
}

export interface Dp3CalculationResult {
  domains: Record<string, { standardScore: number; percentile: number; classification: string }>;
  scaleScores: Record<string, { standardScore: number; percentile: number; classification: string }>;
  igd: {
    standardScore: number;
    percentile: number;
    qualitative: string;
    ci95: [number, number];
  };
  classification: string;
  meetsClinicalCutoff: boolean;
  clinicalAlert?: string;
}

export type Dp3Result = Dp3CalculationResult;

export function validateDp3(input: Dp3Input): InstrumentValidationResult {
  const errors: string[] = [];
  const scales = input.scales || {};
  for (const [k, v] of Object.entries(scales)) {
    if (v !== undefined && (v < 40 || v > 160)) {
      errors.push(`La puntuación estándar de la escala ${k} debe estar entre 40 y 160.`);
    }
  }
  return { isValid: errors.length === 0, errors };
}

export function calculateDp3(input: Dp3Input): Dp3CalculationResult {
  const scales = input.scales || {};
  const ids: Dp3ScaleId[] = ['MOT', 'ADP', 'SOC', 'COG', 'COM'];
  const scaleScores: Record<string, { standardScore: number; percentile: number; classification: string }> = {};

  let sum = 0;
  let count = 0;
  for (const id of ids) {
    const val = scales[id];
    if (typeof val === 'number' && val > 0) {
      const clamped = Math.max(40, Math.min(160, Math.round(val)));
      scaleScores[id] = {
        standardScore: clamped,
        percentile: standardScoreToPercentile(clamped),
        classification: classifyStandardIq(clamped),
      };
      sum += clamped;
      count++;
    }
  }

  const avg = count > 0 ? sum / count : 100;
  const igdScore = count > 0 ? Math.max(40, Math.min(160, Math.round(100 + (avg - 100) * 1.12))) : 100;
  const igdPercentile = standardScoreToPercentile(igdScore);
  const qualitative = classifyStandardIq(igdScore);
  const meetsClinicalCutoff = count > 0 && igdScore <= 70;

  return {
    domains: scaleScores,
    scaleScores,
    igd: {
      standardScore: igdScore,
      percentile: igdPercentile,
      qualitative,
      ci95: [Math.max(40, igdScore - 6), Math.min(160, igdScore + 6)],
    },
    classification: qualitative,
    meetsClinicalCutoff,
    clinicalAlert: meetsClinicalCutoff
      ? `Alerta de retraso global del desarrollo en DP-3 (IGD = ${igdScore} ≤ 70). Se recomienda atención temprana.`
      : undefined,
  };
}

// ============================================================================
// 3. CUMANES, NEURO-KID & LOLE (Neuropsychological & Language Checklists)
// ============================================================================

export interface NeuroChecklistInput {
  domainScores?: Record<string, number>;
  totalRawScore?: number;
  age?: number;
  educationYears?: number;
}

export interface NeuroChecklistResult {
  instrumentId: 'cumanes' | 'neuro_kid' | 'lole';
  rawScore: number;
  totalScore: number;
  maxScore: number;
  standardIndex: number; // M=100, SD=15
  percentile: number;
  decatype: number; // 1..10
  classification: string;
  meetsClinicalCutoff: boolean;
  alertMessage?: string;
}

export function validateNeuroChecklist(
  instrumentId: 'cumanes' | 'neuro_kid' | 'lole',
  input: NeuroChecklistInput
): InstrumentValidationResult {
  const errors: string[] = [];
  const maxMap = { cumanes: 140, neuro_kid: 80, lole: 80 };
  const max = maxMap[instrumentId];
  const raw = input.totalRawScore ?? 0;
  if (raw < 0 || raw > max) {
    errors.push(`La puntuación total debe estar entre 0 y ${max}.`);
  }
  return { isValid: errors.length === 0, errors };
}

export function calculateNeuroChecklist(
  instrumentId: 'cumanes' | 'neuro_kid' | 'lole',
  input: NeuroChecklistInput
): NeuroChecklistResult {
  const domainSum = Object.values(input.domainScores || {}).reduce((a, b) => a + (b || 0), 0);
  const rawInput =
    input.totalRawScore !== undefined && input.totalRawScore > 0 ? input.totalRawScore : domainSum;

  const specs = {
    cumanes: { max: 120, mean: 72, sd: 16, cutoffIndex: 80, name: 'CUMANES (IDN)' },
    neuro_kid: { max: 80, mean: 48, sd: 11, cutoffIndex: 80, name: 'NEURO-KID (CDNI)' },
    lole: { max: 80, mean: 48, sd: 11, cutoffIndex: 80, name: 'LOLE (Conciencia Fonológica)' },
  }[instrumentId];

  const rawScore = Math.max(0, Math.min(specs.max, rawInput));
  const z = (rawScore - specs.mean) / specs.sd;
  const standardIndex = Math.max(45, Math.min(150, Math.round(100 + z * 15)));
  const percentile = standardScoreToPercentile(standardIndex);
  const decatype = Math.max(1, Math.min(10, Math.round(5.5 + z * 2)));
  const meetsClinicalCutoff = rawScore > 0 && standardIndex < specs.cutoffIndex;

  let classification = 'Desarrollo Neuropsicológico Normal / Medio';
  if (standardIndex >= 115) classification = 'Madurez Neuropsicológica Superior';
  else if (standardIndex >= 85) classification = 'Madurez Neuropsicológica Normal';
  else if (standardIndex >= 75) classification = 'Inmadurez Leve / Alerta Preventiva';
  else classification = 'Compromiso / Riesgo Neuropsicológico Significativo';

  return {
    instrumentId,
    rawScore,
    totalScore: rawScore,
    maxScore: specs.max,
    standardIndex,
    percentile,
    decatype,
    classification,
    meetsClinicalCutoff,
    alertMessage: meetsClinicalCutoff
      ? `Alerta en ${specs.name}: Índice = ${standardIndex} (< ${specs.cutoffIndex}, Decatipo ${decatype}). Indicador de vulnerabilidad madurativa.`
      : undefined,
  };
}

// ============================================================================
// 4. MACI-IV (Millon Adolescent Clinical Inventory - Base Rate Engine)
// ============================================================================

export interface Maci4Input {
  baseRates?: Record<string, number>;
  rawScores?: Record<string, number>;
  omittedCount?: number;
}

export function validateMaci4(input: Maci4Input): InstrumentValidationResult {
  const errors: string[] = [];
  const br = input.baseRates || {};
  const raw = input.rawScores || {};

  const vScore = raw['V'] ?? br['V'] ?? 0;
  const xScore = raw['X'] ?? br['X'] ?? 50;
  const isInvalidV = vScore >= 2;

  for (const [k, v] of Object.entries(br)) {
    if (v < 0 || v > 115) {
      errors.push(`Tasa Base (TB) en escala ${k} fuera de rango (0–115).`);
    }
  }

  const invalidationReasons = isInvalidV
    ? ['Protocolo inválido por respuesta afirmativa a ítems de improbabilidad (Escala V ≥ 2).']
    : [];

  const validity: ProtocolValidityResult = {
    isValidProtocol: !isInvalidV && (input.omittedCount ?? 0) < 12,
    invalidationReasons,
    invalidationReason: invalidationReasons[0],
    fakingGoodFlag: (br['Y'] ?? 50) >= 85,
    fakingBadFlag: (br['Z'] ?? 50) >= 85 || xScore > 100,
    cautionFlags: [],
  };

  return { isValid: errors.length === 0, errors, validity };
}

export function calculateMaci4(input: Maci4Input) {
  const br = input.baseRates || {};
  const raw = input.rawScores || {};
  const valResult = validateMaci4(input);

  const scales: Record<
    string,
    { scaleId: string; baseRate: number; classification: string; isPresent: boolean; isProminent: boolean }
  > = {};
  const presenceScales: string[] = [];
  const prominenceScales: string[] = [];

  for (const [id, val] of Object.entries(br)) {
    const clamped = Math.max(0, Math.min(115, Math.round(val)));
    const isProminent = clamped >= 85;
    const isPresent = clamped >= 75 && clamped < 85;

    let classification = 'Ausente (< 60)';
    if (isProminent) classification = 'Prominencia Clínica / Sindrómica (TB ≥ 85)';
    else if (isPresent) classification = 'Presencia del Rasgo / Síndrome (TB 75–84)';
    else if (clamped >= 60) classification = 'Tendencia Subclínica (TB 60–74)';

    scales[id] = { scaleId: id, baseRate: clamped, classification, isPresent, isProminent };
    if (!['V', 'W', 'X', 'Y', 'Z'].includes(id)) {
      if (isProminent) prominenceScales.push(id);
      else if (isPresent) presenceScales.push(id);
    }
  }

  const suiScore = br['GG'] ?? 0;
  const suicideRiskAlert = {
    triggered: suiScore >= 75,
    level: suiScore >= 85 ? 'CRITICAL_RISK' : suiScore >= 75 ? 'MODERATE_RISK' : 'NONE',
    message:
      suiScore >= 75
        ? `Alerta Deontológica MACI-IV: Elevación en Tendencia Suicida (Escala GG TB = ${suiScore}). Requiere valoración inmediata.`
        : '',
  };

  const diagnosticSummary = !valResult.validity!.isValidProtocol
    ? valResult.validity!.invalidationReason || 'Protocolo inválido.'
    : prominenceScales.length > 0
    ? `Perfil adolescente MACI-IV con prominencia clínica (TB ≥ 85) en: ${prominenceScales.join(', ')}.`
    : presenceScales.length > 0
    ? `Perfil adolescente MACI-IV con presencia de rasgos (TB 75–84) en: ${presenceScales.join(', ')}.`
    : 'Perfil adolescente MACI-IV dentro de los márgenes normativos (TB < 75).';

  return {
    validity: valResult.validity!,
    modifyingIndices: {
      V: raw['V'] ?? br['V'] ?? 0,
      X: raw['X'] ?? br['X'] ?? 50,
      Y: br['Y'] ?? 50,
      Z: br['Z'] ?? 50,
    },
    scales,
    presenceScales,
    prominenceScales,
    suicideRiskAlert,
    diagnosticSummary,
  };
}

// ============================================================================
// 5. Universal Extended Multi-Scale T-Score / Percentile Engine
//    (MMPI-2-RF, MMPI-A-RF, BFQ, STAXI-2, LSB-50, CECAD, BRIEF-A, IAC, ICCP, IPP-R)
// ============================================================================

export type ExtendedLikertBatteryId =
  | 'mmpi_rf'
  | 'mmpi_a_rf'
  | 'bfq'
  | 'staxi_2'
  | 'lsb_50'
  | 'cecad'
  | 'brief_a'
  | 'iac'
  | 'iccp'
  | 'ipp_r';

export interface ExtendedLikertInput {
  tScores?: Record<string, number>;
  rawScores?: Record<string, number>;
  omittedCount?: number;
  criticalFlag?: boolean;
  criticalItems?: { suicidalIdeation?: boolean };
}

export interface ExtendedLikertScaleOutput {
  scaleId: string;
  tScore: number;
  percentile: number;
  classification: string;
  isClinical: boolean;
  isModerate: boolean;
}

export interface ExtendedLikertResult {
  batteryId: ExtendedLikertBatteryId;
  validity: ProtocolValidityResult;
  scales: Record<string, ExtendedLikertScaleOutput>;
  clinicalElevations: string[];
  primaryElevations: string[];
  clinicalClassification: string;
  summary: string;
  suicideRiskAlert: {
    triggered: boolean;
    level: 'NONE' | 'MODERATE_RISK' | 'CRITICAL_RISK';
    message: string;
  };
}

const PROTECTIVE_SCALES_BY_BATTERY: Partial<Record<ExtendedLikertBatteryId, string[]>> = {
  iac: ['PER', 'FAM', 'ESC', 'SOC', 'GLO'],
  iccp: ['EMP', 'ASE', 'RES', 'REG', 'SOC', 'PRO'],
};

export function validateExtendedLikert(
  batteryOrInput: ExtendedLikertBatteryId | ExtendedLikertInput,
  maybeInput?: ExtendedLikertInput
): InstrumentValidationResult {
  const input: ExtendedLikertInput =
    typeof batteryOrInput === 'string' ? maybeInput || {} : batteryOrInput || {};

  const errors: string[] = [];
  const tScores = input.tScores || {};

  for (const [k, v] of Object.entries(tScores)) {
    if (v < 0 || v > 120) {
      errors.push(`La puntuación en la escala ${k} debe situarse entre 0 y 120.`);
    }
  }

  const vrin = tScores['VRINr'] ?? tScores['VRIN_r'] ?? tScores['INC'] ?? 50;
  const trin = tScores['TRINr'] ?? tScores['TRIN_r'] ?? tScores['INF'] ?? 50;
  const fScale =
    tScores['Fr'] ??
    tScores['F_r'] ??
    tScores['Fpr'] ??
    tScores['Fp_r'] ??
    tScores['MAG'] ??
    tScores['Mag'] ??
    tScores['NEG'] ??
    50;
  const lScale =
    tScores['Lr'] ??
    tScores['L_r'] ??
    tScores['D'] ??
    tScores['MIN'] ??
    tScores['Min'] ??
    50;

  const isInvalid = vrin >= 80 || trin >= 80 || fScale >= 95 || (input.omittedCount ?? 0) >= 15;
  const invalidationReasons: string[] = [];
  if (vrin >= 80 || trin >= 80) {
    invalidationReasons.push('Inconsistencia de respuestas severa (VRIN-r / TRIN-r / INC ≥ 80).');
  }
  if (fScale >= 95) {
    invalidationReasons.push('Sobredimensionamiento extremo de síntomas (Escala de infrecuencia/magnificación ≥ 95).');
  }
  if ((input.omittedCount ?? 0) >= 15) {
    invalidationReasons.push('Exceso de ítems omitidos (≥ 15 respuestas en blanco).');
  }

  return {
    isValid: errors.length === 0,
    errors,
    validity: {
      isValidProtocol: !isInvalid,
      invalidationReasons,
      invalidationReason: invalidationReasons[0],
      fakingBadFlag: fScale >= 75,
      fakingGoodFlag: lScale >= 70,
      cautionFlags: [],
    },
  };
}

export function calculateExtendedLikert(
  batteryId: ExtendedLikertBatteryId,
  input: ExtendedLikertInput
): ExtendedLikertResult {
  const tScores = input.tScores || {};
  const valRes = validateExtendedLikert(batteryId, input);
  const protectiveList = PROTECTIVE_SCALES_BY_BATTERY[batteryId] || [];

  const scales: Record<string, ExtendedLikertScaleOutput> = {};
  const clinicalElevations: string[] = [];

  for (const [id, rawVal] of Object.entries(tScores)) {
    const t = Math.max(20, Math.min(120, Math.round(rawVal)));
    const isProtective = protectiveList.includes(id);
    const { label, isClinical, isModerate } = classifyTScoreScale(t, isProtective);

    scales[id] = {
      scaleId: id,
      tScore: t,
      percentile: tScoreToPercentile(t),
      classification: label,
      isClinical,
      isModerate,
    };

    const isValidityScale = [
      'VRINr', 'VRIN_r', 'TRINr', 'TRIN_r', 'Fr', 'F_r', 'Fpr', 'Fp_r', 'Fs', 'FBSr', 'Lr', 'L_r', 'Kr', 'K_r', 'CRIN',
      'D', 'MIN', 'Min', 'MAG', 'Mag', 'NEG', 'INF', 'INC',
    ].includes(id);

    if (!isValidityScale && isClinical) {
      clinicalElevations.push(id);
    }
  }

  const suiT = tScores['SUI'] ?? tScores['IRPSI'] ?? tScores['IRPsi'] ?? tScores['DEP'] ?? 0;
  const hasCriticalAlert =
    Boolean(input.criticalFlag) ||
    Boolean(input.criticalItems?.suicidalIdeation) ||
    (batteryId === 'mmpi_rf' && (tScores['SUI'] ?? 0) >= 65) ||
    (batteryId === 'mmpi_a_rf' && (tScores['SUI'] ?? 0) >= 65) ||
    (batteryId === 'lsb_50' && (tScores['IRPSI'] ?? tScores['IRPsi'] ?? 0) >= 70) ||
    (batteryId === 'cecad' && (tScores['DEP'] ?? 0) >= 70) ||
    (batteryId === 'brief_a' && (tScores['GEC'] ?? 0) >= 65) ||
    (batteryId === 'staxi_2' && (tScores['IEI'] ?? 0) >= 70);

  let alertMsg = '';
  if (hasCriticalAlert) {
    if (batteryId === 'mmpi_rf' || batteryId === 'mmpi_a_rf') {
      alertMsg = `Alerta Deontológica Crítica: Elevación en escala de Ideación Suicida (SUI T = ${tScores['SUI'] ?? 75}).`;
    } else if (batteryId === 'lsb_50') {
      alertMsg = `Alerta Psicopatológica LSB-50: Índice de Riesgo Psicopatológico elevado (IRPsi T = ${tScores['IRPSI'] ?? tScores['IRPsi']}).`;
    } else if (batteryId === 'cecad') {
      alertMsg = `Alerta Clínica CECAD: Sintomatología depresiva severa (DEP T = ${tScores['DEP']}).`;
    } else if (batteryId === 'brief_a') {
      alertMsg = `Alerta Neuropsicológica BRIEF-A: Disfunción Ejecutiva Global significativa (GEC T = ${tScores['GEC']}).`;
    } else if (batteryId === 'staxi_2') {
      alertMsg = `Alerta Clínica STAXI-2: Índice de Expresión de la Ira en rango clínico (IEI T = ${tScores['IEI']}).`;
    } else {
      alertMsg = `Alerta clínica activa en ${batteryId.toUpperCase()}.`;
    }
  }

  const clinicalClassification = !valRes.validity!.isValidProtocol
    ? 'Protocolo Inválido'
    : clinicalElevations.length > 0
    ? `Significación Clínica (${clinicalElevations.length} escalas)`
    : 'Perfil Normativo / Sin Alteraciones';

  const summary = !valRes.validity!.isValidProtocol
    ? valRes.validity!.invalidationReason || 'Protocolo inválido.'
    : clinicalElevations.length > 0
    ? `Puntuaciones significativas identificadas en: ${clinicalElevations.join(', ')}.`
    : 'Puntuaciones dentro de los parámetros normativos esperados (M=50, DE=10).';

  return {
    batteryId,
    validity: valRes.validity!,
    scales,
    clinicalElevations,
    primaryElevations: clinicalElevations,
    clinicalClassification,
    summary,
    suicideRiskAlert: {
      triggered: hasCriticalAlert,
      level: suiT >= 75 || Boolean(input.criticalFlag) ? 'CRITICAL_RISK' : hasCriticalAlert ? 'MODERATE_RISK' : 'NONE',
      message: alertMsg,
    },
  };
}
