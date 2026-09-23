/**
 * Pure mathematical psychometric calculators for clinical instruments:
 * - SDQ (Strengths and Difficulties Questionnaire - Goodman)
 * - PHQ-9 (Patient Health Questionnaire - 9 - Kroenke & Spitzer)
 * - GAD-7 (Generalized Anxiety Disorder - 7 - Spitzer et al.)
 * - MoCA (Montreal Cognitive Assessment - Nasreddine)
 *
 * All functions are deterministic, side-effect free, and have ZERO UI dependencies.
 */

import {
  SdqInformantType,
  SdqSubscaleId,
  SdqBandClassification,
  SdqCalculationResult,
  SdqSubscaleResult,
  SdqInput,
  SdqItemResponses,
  Phq9Response,
  Phq9SeverityBand,
  Phq9SuicideAlert,
  Phq9CalculationResult,
  Phq9Input,
  Phq9ItemResponses,
  Gad7Response,
  Gad7SeverityBand,
  Gad7CalculationResult,
  Gad7Input,
  Gad7ItemResponses,
  MocaDomainId,
  MocaDomainResult,
  MocaClassification,
  MocaCalculationResult,
  MocaInput,
  MocaDomainScores,
  ClinicalValidationResult
} from '../types/clinical';

import {
  SDQ_REVERSED_ITEMS,
  SDQ_SUBSCALE_METAS,
  SDQ_NORMS,
  PHQ9_SEVERITY_BANDS,
  PHQ9_SUICIDE_ALERT_MESSAGE,
  GAD7_SEVERITY_BANDS,
  MOCA_DOMAINS,
  MOCA_CLASSIFICATIONS
} from '../tables/clinicalNorms';

// ============================================================================
// Helper Utilities & Validation
// ============================================================================

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value);
}

// ============================================================================
// SDQ (Strengths and Difficulties Questionnaire) Calculator
// ============================================================================

/**
 * Checks whether an SDQ item is reversed (items 7, 11, 14, 21, 25).
 */
export function isSdqItemReversed(itemNumber: number): boolean {
  return SDQ_REVERSED_ITEMS.includes(itemNumber);
}

/**
 * Transforms an SDQ item response according to Goodman's scoring rules.
 * For items 7, 11, 14, 21, and 25: score = 2 - raw.
 * For all other items: score = raw.
 */
export function invertSdqItem(itemNumber: number, rawResponse: number): number {
  if (!isInteger(rawResponse) || rawResponse < 0 || rawResponse > 2) {
    throw new Error(`Invalid SDQ raw response for item ${itemNumber}: ${rawResponse}. Must be 0, 1, or 2.`);
  }

  if (isSdqItemReversed(itemNumber)) {
    return 2 - rawResponse;
  }
  return rawResponse;
}

/**
 * Validates SDQ input format and values.
 */
export function validateSdqInput(input: SdqInput): ClinicalValidationResult {
  const errors: string[] = [];

  if (!input) {
    return { isValid: false, errors: ['Input cannot be null or undefined.'] };
  }

  const validInformants: SdqInformantType[] = ['parent', 'self', 'teacher'];
  if (!validInformants.includes(input.informant)) {
    errors.push(`Invalid informant type "${input.informant}". Must be "parent", "self", or "teacher".`);
  }

  if (!input.responses || typeof input.responses !== 'object') {
    errors.push('Responses must be an object mapping item numbers (1..25) to values (0..2).');
    return { isValid: false, errors };
  }

  const subscaleIds: SdqSubscaleId[] = ['emotional', 'conduct', 'hyperactivity', 'peer', 'prosocial'];

  for (const scaleId of subscaleIds) {
    const meta = SDQ_SUBSCALE_METAS[scaleId];
    let answeredInScale = 0;

    for (const itemNum of meta.itemNumbers) {
      const val = input.responses[itemNum];
      if (val !== undefined && val !== null) {
        if (!isInteger(val) || val < 0 || val > 2) {
          errors.push(`Item ${itemNum} in subscale "${meta.name}" has invalid value: ${val}. Must be 0, 1, or 2.`);
        } else {
          answeredInScale++;
        }
      }
    }

    if (answeredInScale < 3) {
      errors.push(
        `Subscale "${meta.name}" has only ${answeredInScale} answered items. Goodman prorating requires at least 3 answered items per subscale.`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Classifies an SDQ subscale score into Normal, Borderline, or Abnormal.
 */
export function classifySdqSubscale(
  score: number,
  subscaleId: SdqSubscaleId,
  informant: SdqInformantType
): SdqBandClassification {
  const normTable = SDQ_NORMS[informant];
  if (!normTable) {
    throw new Error(`Unknown informant type: ${informant}`);
  }

  const cutoffs = normTable[subscaleId];

  // In Prosocial, lower score is difficulty
  if (subscaleId === 'prosocial') {
    if (score >= cutoffs.normal.min && score <= cutoffs.normal.max) return 'Normal';
    if (score >= cutoffs.borderline.min && score <= cutoffs.borderline.max) return 'Borderline';
    return 'Abnormal';
  }

  // Difficulty scales
  if (score >= cutoffs.normal.min && score <= cutoffs.normal.max) return 'Normal';
  if (score >= cutoffs.borderline.min && score <= cutoffs.borderline.max) return 'Borderline';
  return 'Abnormal';
}

/**
 * Classifies the SDQ Total Difficulties score into Normal, Borderline, or Abnormal.
 */
export function classifySdqTotalDifficulties(
  score: number,
  informant: SdqInformantType
): SdqBandClassification {
  const normTable = SDQ_NORMS[informant];
  if (!normTable) {
    throw new Error(`Unknown informant type: ${informant}`);
  }

  const cutoffs = normTable.totalDifficulties;
  if (score >= cutoffs.normal.min && score <= cutoffs.normal.max) return 'Normal';
  if (score >= cutoffs.borderline.min && score <= cutoffs.borderline.max) return 'Borderline';
  return 'Abnormal';
}

/**
 * Calculates a single SDQ subscale score with Goodman prorating if 3 or 4 items are answered.
 */
export function calculateSdqSubscaleScore(
  responses: SdqItemResponses,
  subscaleId: SdqSubscaleId
): { score: number; answeredCount: number; isProrated: boolean } {
  const meta = SDQ_SUBSCALE_METAS[subscaleId];
  let sum = 0;
  let answeredCount = 0;

  for (const itemNum of meta.itemNumbers) {
    const raw = responses[itemNum];
    if (raw !== undefined && raw !== null) {
      const transformed = invertSdqItem(itemNum, Number(raw));
      sum += transformed;
      answeredCount++;
    }
  }

  if (answeredCount < 3) {
    throw new Error(
      `Insufficient items for SDQ subscale "${meta.name}". Goodman prorating requires at least 3 answered items, but found ${answeredCount}.`
    );
  }

  if (answeredCount === 5) {
    return { score: sum, answeredCount, isProrated: false };
  }

  // Goodman prorating algorithm: round((sum * 5) / answeredCount)
  const prorated = Math.round((sum * 5) / answeredCount);
  const score = Math.max(0, Math.min(10, prorated));
  return { score, answeredCount, isProrated: true };
}

/**
 * Calculates complete SDQ results (all subscales, total difficulties, and cutoffs).
 */
export function calculateSdq(input: SdqInput): SdqCalculationResult {
  const validation = validateSdqInput(input);
  if (!validation.isValid) {
    throw new Error(`SDQ validation failed: ${validation.errors.join('; ')}`);
  }

  const subscaleIds: SdqSubscaleId[] = ['emotional', 'conduct', 'hyperactivity', 'peer', 'prosocial'];
  const subscaleResults = {} as Record<SdqSubscaleId, SdqSubscaleResult>;
  const itemScores: Record<number, number> = {};
  let anyProrated = false;

  // Process all items for itemScores record
  for (let itemNum = 1; itemNum <= 25; itemNum++) {
    const raw = input.responses[itemNum];
    if (raw !== undefined && raw !== null) {
      itemScores[itemNum] = invertSdqItem(itemNum, Number(raw));
    }
  }

  // Process each subscale
  for (const scaleId of subscaleIds) {
    const meta = SDQ_SUBSCALE_METAS[scaleId];
    const { score, answeredCount, isProrated } = calculateSdqSubscaleScore(input.responses, scaleId);

    if (isProrated) anyProrated = true;

    const classification = classifySdqSubscale(score, scaleId, input.informant);

    subscaleResults[scaleId] = {
      id: scaleId,
      name: meta.name,
      rawScore: score,
      maxScore: 10,
      classification,
      isStrengthScale: meta.isStrengthScale,
      answeredCount,
      isProrated
    };
  }

  // Total Difficulties: strictly emotional + conduct + hyperactivity + peer (EXCLUDING prosocial)
  const totalDifficultiesScore =
    subscaleResults.emotional.rawScore +
    subscaleResults.conduct.rawScore +
    subscaleResults.hyperactivity.rawScore +
    subscaleResults.peer.rawScore;

  const totalClassification = classifySdqTotalDifficulties(totalDifficultiesScore, input.informant);

  return {
    informant: input.informant,
    subscales: subscaleResults,
    totalDifficulties: {
      score: totalDifficultiesScore,
      maxScore: 40,
      classification: totalClassification
    },
    itemScores,
    isProrated: anyProrated,
    isValid: true
  };
}

// ============================================================================
// PHQ-9 (Patient Health Questionnaire - 9) Calculator
// ============================================================================

/**
 * Normalizes PHQ-9 input responses to a 1-indexed Record<number, number>.
 */
function normalizePhq9Responses(input: Phq9Input | Phq9ItemResponses): Record<number, number> {
  const rawResponses = (input && typeof input === 'object' && 'responses' in input)
    ? (input as Phq9Input).responses
    : (input as Phq9ItemResponses);

  const normalized: Record<number, number> = {};

  if (Array.isArray(rawResponses)) {
    if (rawResponses.length === 9) {
      for (let i = 0; i < 9; i++) {
        normalized[i + 1] = rawResponses[i];
      }
    } else if (rawResponses.length === 10) {
      // 1-indexed array with index 0 ignored
      for (let i = 1; i <= 9; i++) {
        normalized[i] = rawResponses[i];
      }
    } else {
      throw new Error(`PHQ-9 array must contain 9 items (or 10 if 1-indexed), but got ${rawResponses.length}.`);
    }
  } else if (rawResponses && typeof rawResponses === 'object') {
    for (let i = 1; i <= 9; i++) {
      normalized[i] = (rawResponses as Record<number, number>)[i];
    }
  } else {
    throw new Error('Invalid PHQ-9 responses format.');
  }

  return normalized;
}

/**
 * Validates PHQ-9 responses.
 */
export function validatePhq9Input(input: Phq9Input | Phq9ItemResponses): ClinicalValidationResult {
  const errors: string[] = [];

  try {
    const responses = normalizePhq9Responses(input);

    for (let i = 1; i <= 9; i++) {
      const val = responses[i];
      if (val === undefined || val === null) {
        errors.push(`Item ${i} is missing. All 9 items of PHQ-9 are mandatory.`);
      } else if (!isInteger(val) || val < 0 || val > 3) {
        errors.push(`Item ${i} has invalid score: ${val}. Must be an integer between 0 and 3.`);
      }
    }
  } catch (err: unknown) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Classifies PHQ-9 total score into one of 5 severity bands.
 */
export function classifyPhq9Severity(score: number): Phq9SeverityBand {
  if (!isInteger(score) || score < 0 || score > 27) {
    throw new Error(`Invalid PHQ-9 score: ${score}. Must be between 0 and 27.`);
  }

  for (const band of PHQ9_SEVERITY_BANDS) {
    if (score >= band.minScore && score <= band.maxScore) {
      return band.severity;
    }
  }

  return 'Severa';
}

/**
 * Evaluates whether responses meet algorithmic DSM-5 criteria for Major Depressive Episode:
 * 1. Item 1 (anhedonia) or Item 2 (depressed mood) must be >= 2 ("more than half the days").
 * 2. At least 5 of the 9 items meet symptomatic threshold (items 1-8 >= 2; item 9 >= 1).
 */
export function evaluatePhq9MajorDepression(responses: Record<number, number>): boolean {
  const item1 = responses[1] ?? 0;
  const item2 = responses[2] ?? 0;

  // Cardinal symptom check: either depressed mood or loss of interest/pleasure
  if (item1 < 2 && item2 < 2) {
    return false;
  }

  let symptomaticCount = 0;

  // Items 1 through 8 count if >= 2
  for (let i = 1; i <= 8; i++) {
    if ((responses[i] ?? 0) >= 2) {
      symptomaticCount++;
    }
  }

  // Item 9 counts if >= 1
  if ((responses[9] ?? 0) >= 1) {
    symptomaticCount++;
  }

  return symptomaticCount >= 5;
}

/**
 * Evaluates suicide risk alert for Item 9.
 * Activated unconditionally if Item 9 >= 1.
 */
export function checkPhq9SuicideAlert(item9Score: number): Phq9SuicideAlert {
  const isTriggered = item9Score >= 1;

  if (isTriggered) {
    return {
      triggered: true,
      itemScore: item9Score as Phq9Response,
      level: 'CRITICAL',
      bannerText: PHQ9_SUICIDE_ALERT_MESSAGE,
      clinicalActionRequired: true,
      clinicalNote:
        'Respuesta afirmativa en el ítem 9 (pensamientos de muerte o deseos de lastimarse). ' +
        'Se requiere exploración pericial/clínica inmediata del plan, letalidad, acceso a medios y red de apoyo.'
    };
  }

  return {
    triggered: false,
    itemScore: 0,
    level: 'NONE',
    bannerText: '',
    clinicalActionRequired: false,
    clinicalNote: 'Sin reporte de ideación autolítica ni deseos de lastimarse en el ítem 9.'
  };
}

/**
 * Calculates complete PHQ-9 scores, severity, alerts, and DSM-5 criteria.
 */
export function calculatePhq9(input: Phq9Input | Phq9ItemResponses): Phq9CalculationResult {
  const validation = validatePhq9Input(input);
  if (!validation.isValid) {
    throw new Error(`PHQ-9 validation failed: ${validation.errors.join('; ')}`);
  }

  const responses = normalizePhq9Responses(input);

  let totalScore = 0;
  for (let i = 1; i <= 9; i++) {
    totalScore += responses[i];
  }

  const severity = classifyPhq9Severity(totalScore);
  const bandConfig = PHQ9_SEVERITY_BANDS.find(b => b.severity === severity)!;

  const meetsClinicalCutoff = totalScore >= 10;
  const meetsMajorDepressionCriteria = evaluatePhq9MajorDepression(responses);
  const suicideRiskAlert = checkPhq9SuicideAlert(responses[9]);
  const isItem9AlertActive = responses[9] >= 1;

  return {
    totalScore,
    severity,
    meetsClinicalCutoff,
    meetsMajorDepressionCriteria,
    suicideRiskAlert,
    isItem9AlertActive,
    alertLevel: suicideRiskAlert.level,
    interpretation: bandConfig.interpretation,
    recommendation: bandConfig.recommendation
  };
}

// ============================================================================
// GAD-7 (Generalized Anxiety Disorder - 7) Calculator
// ============================================================================

/**
 * Normalizes GAD-7 responses to a 1-indexed Record<number, number>.
 */
function normalizeGad7Responses(input: Gad7Input | Gad7ItemResponses): Record<number, number> {
  const rawResponses = (input && typeof input === 'object' && 'responses' in input)
    ? (input as Gad7Input).responses
    : (input as Gad7ItemResponses);

  const normalized: Record<number, number> = {};

  if (Array.isArray(rawResponses)) {
    if (rawResponses.length === 7) {
      for (let i = 0; i < 7; i++) {
        normalized[i + 1] = rawResponses[i];
      }
    } else if (rawResponses.length === 8) {
      // 1-indexed array with index 0 ignored
      for (let i = 1; i <= 7; i++) {
        normalized[i] = rawResponses[i];
      }
    } else {
      throw new Error(`GAD-7 array must contain 7 items (or 8 if 1-indexed), but got ${rawResponses.length}.`);
    }
  } else if (rawResponses && typeof rawResponses === 'object') {
    for (let i = 1; i <= 7; i++) {
      normalized[i] = (rawResponses as Record<number, number>)[i];
    }
  } else {
    throw new Error('Invalid GAD-7 responses format.');
  }

  return normalized;
}

/**
 * Validates GAD-7 responses.
 */
export function validateGad7Input(input: Gad7Input | Gad7ItemResponses): ClinicalValidationResult {
  const errors: string[] = [];

  try {
    const responses = normalizeGad7Responses(input);

    for (let i = 1; i <= 7; i++) {
      const val = responses[i];
      if (val === undefined || val === null) {
        errors.push(`Item ${i} is missing. All 7 items of GAD-7 are mandatory.`);
      } else if (!isInteger(val) || val < 0 || val > 3) {
        errors.push(`Item ${i} has invalid score: ${val}. Must be an integer between 0 and 3.`);
      }
    }
  } catch (err: unknown) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Classifies GAD-7 total score into one of 4 anxiety severity bands.
 */
export function classifyGad7Severity(score: number): Gad7SeverityBand {
  if (!isInteger(score) || score < 0 || score > 21) {
    throw new Error(`Invalid GAD-7 score: ${score}. Must be between 0 and 21.`);
  }

  for (const band of GAD7_SEVERITY_BANDS) {
    if (score >= band.minScore && score <= band.maxScore) {
      return band.severity;
    }
  }

  return 'Ansiedad severa';
}

/**
 * Calculates complete GAD-7 score, severity, and clinical cutoff status.
 */
export function calculateGad7(input: Gad7Input | Gad7ItemResponses): Gad7CalculationResult {
  const validation = validateGad7Input(input);
  if (!validation.isValid) {
    throw new Error(`GAD-7 validation failed: ${validation.errors.join('; ')}`);
  }

  const responses = normalizeGad7Responses(input);

  let totalScore = 0;
  for (let i = 1; i <= 7; i++) {
    totalScore += responses[i];
  }

  const severity = classifyGad7Severity(totalScore);
  const bandConfig = GAD7_SEVERITY_BANDS.find(b => b.severity === severity)!;
  const meetsClinicalCutoff = totalScore >= 10;

  return {
    totalScore,
    severity,
    meetsClinicalCutoff,
    interpretation: bandConfig.interpretation,
    recommendation: bandConfig.recommendation
  };
}

// ============================================================================
// MoCA (Montreal Cognitive Assessment) Calculator
// ============================================================================

/**
 * Determines education adjustment point according to Nasreddine rule:
 * +1 point if formal education <= 12 years; 0 points if > 12 years.
 */
export function getMocaEducationAdjustment(educationYears: number): 0 | 1 {
  if (!isInteger(educationYears) || educationYears < 0) {
    throw new Error(`Invalid education years: ${educationYears}. Must be a non-negative integer.`);
  }

  return educationYears <= 12 ? 1 : 0;
}

/**
 * Validates MoCA input parameters and domain scores.
 */
export function validateMocaInput(input: MocaInput): ClinicalValidationResult {
  const errors: string[] = [];

  if (!input) {
    return { isValid: false, errors: ['Input cannot be null or undefined.'] };
  }

  if (!isInteger(input.educationYears) || input.educationYears < 0) {
    errors.push(`Invalid educationYears: ${input.educationYears}. Must be a non-negative integer.`);
  }

  if (!input.domains || typeof input.domains !== 'object') {
    errors.push('Domains must be an object containing domain scores.');
    return { isValid: false, errors };
  }

  for (const def of MOCA_DOMAINS) {
    const val = input.domains[def.id];
    if (val !== undefined && val !== null) {
      if (!isInteger(val) || val < 0 || val > def.maxScore) {
        errors.push(
          `Domain "${def.name}" (${def.id}) score ${val} is invalid. Must be an integer between 0 and ${def.maxScore}.`
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Classifies adjusted MoCA score into clinical cognitive strata.
 */
export function classifyMoca(adjustedScore: number): MocaClassification {
  if (!isInteger(adjustedScore) || adjustedScore < 0 || adjustedScore > 30) {
    throw new Error(`Invalid MoCA adjusted score: ${adjustedScore}. Must be an integer between 0 and 30.`);
  }

  for (const band of MOCA_CLASSIFICATIONS) {
    if (adjustedScore >= band.minScore && adjustedScore <= band.maxScore) {
      return band.classification;
    }
  }

  return 'Deterioro Cognitivo Severo';
}

/**
 * Calculates complete MoCA score, domain breakdown, education adjustment, and clinical status.
 */
export function calculateMoca(input: MocaInput): MocaCalculationResult {
  const validation = validateMocaInput(input);
  if (!validation.isValid) {
    throw new Error(`MoCA validation failed: ${validation.errors.join('; ')}`);
  }

  const domainResults = {} as Record<MocaDomainId, MocaDomainResult>;
  let rawScore = 0;

  for (const def of MOCA_DOMAINS) {
    const score = input.domains[def.id] ?? 0;
    rawScore += score;

    domainResults[def.id] = {
      id: def.id,
      name: def.name,
      score,
      maxScore: def.maxScore
    };
  }

  const educationAdjustment = getMocaEducationAdjustment(input.educationYears);

  // Strictly capped at 30: Math.min(30, rawScore + adjustment)
  const adjustedScore = Math.min(30, rawScore + educationAdjustment);

  // Clinical cutoff: strictly < 26 denotes risk of cognitive impairment / MCI
  const meetsClinicalCutoff = adjustedScore < 26;
  const classification = classifyMoca(adjustedScore);

  const bandConfig = MOCA_CLASSIFICATIONS.find(b => b.classification === classification)!;

  return {
    rawScore,
    educationAdjustment,
    educationYears: input.educationYears,
    adjustedScore,
    meetsClinicalCutoff,
    classification,
    domains: domainResults,
    interpretation: bandConfig.interpretation,
    recommendation: bandConfig.recommendation
  };
}
