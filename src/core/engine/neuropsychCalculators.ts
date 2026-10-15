/**
 * Pure deterministic psychometric calculators for Neuropsychology & Attention:
 * - D2-R (Brickenkamp et al.)
 * - NEUROPSI Breve (Ostrosky-Solís et al.)
 * - MMSE (Folstein / NORMACODEM)
 *
 * All functions have ZERO UI dependencies.
 */

import { normalCdf } from './normalDist';
import {
  D2rInput,
  D2rCalculationResult,
  NeuropsiBreveInput,
  NeuropsiBreveCalculationResult,
  MmseInput,
  MmseCalculationResult,
} from '../types/neuropsych';

import {
  D2R_NORMS,
  NEUROPSI_CUTOFFS,
  getNeuropsiEducationLevel,
  getNeuropsiAgeGroup,
  getNormacodemDelta,
  getMmseClassification,
} from '../tables/neuropsychNorms';
import { ProtocolValidityResult } from '../registry/TestRegistryTypes';

// ============================================================================
// D2-R Calculator
// ============================================================================

export function validateD2r(input: D2rInput): {
  isValid: boolean;
  errors: string[];
  validity: ProtocolValidityResult;
} {
  const errors: string[] = [];
  const invalidationReasons: string[] = [];
  const cautionFlags: string[] = [];

  const tr = input.tr ?? 0;
  const ta = input.ta ?? 0;
  const o = input.o ?? input.e1 ?? 0;
  const c = input.c ?? input.e2 ?? 0;

  if (tr < 0 || tr > D2R_NORMS.MAX_TR) {
    errors.push(`TR (${tr}) debe estar entre 0 y ${D2R_NORMS.MAX_TR}`);
  }
  if (ta < 0) {
    errors.push('TA no puede ser negativo');
  }
  if (ta > tr) {
    errors.push(`Invariante violado: Total de aciertos TA (${ta}) no puede superar a TR (${tr})`);
  }
  if (o < 0) {
    errors.push('Las omisiones (E1) no pueden ser negativas');
  }
  if (c < 0) {
    errors.push('Las comisiones (E2) no pueden ser negativas');
  }

  // Validity threshold checks
  if (tr < D2R_NORMS.MIN_VALID_TR && tr > 0) {
    invalidationReasons.push(
      `TR (${tr}) < 100: Protocolo INVÁLIDO por abandono prematuro o esfuerzo insuficiente`
    );
  }

  const tot = o + c;
  const cpPercent = tr > 0 ? (tot / tr) * 100 : 0;
  if (cpPercent > D2R_NORMS.MAX_VALID_CP_PERCENT) {
    invalidationReasons.push(
      `CP% (${cpPercent.toFixed(1)}%) > 40%: Protocolo INVÁLIDO por marcado indiscriminado al azar`
    );
  }

  const isValidProtocol = errors.length === 0 && invalidationReasons.length === 0;
  return {
    isValid: isValidProtocol,
    errors,
    validity: {
      isValidProtocol,
      invalidationReason: invalidationReasons[0],
      invalidationReasons,
      cautionFlags,
    },
  };
}

export function calculateD2r(input: D2rInput): D2rCalculationResult {
  const validation = validateD2r(input);
  const tr = input.tr ?? 0;
  const ta = input.ta ?? 0;
  const o = input.o ?? input.e1 ?? 0;
  const c = input.c ?? input.e2 ?? 0;

  const tot = o + c;
  const con = ta - c;
  const cpPercent = tr > 0 ? Math.round((tot / tr) * 10000) / 100 : 0;

  // Standard conversions based on adult normative reference
  const zCon = (con - D2R_NORMS.CON_MEAN) / D2R_NORMS.CON_SD;
  const decatype = Math.max(1, Math.min(10, Math.round(5.5 + zCon * 2.0)));
  const tScore = Math.max(20, Math.min(80, Math.round(50 + zCon * 10)));
  const percentile = Math.min(99.9, Math.max(0.1, Math.round(normalCdf(zCon) * 1000) / 10));

  // Qualitative precision
  let qualitativePrecision = 'Excelente precisión (CP% < 5%)';
  if (cpPercent >= 15) {
    qualitativePrecision = 'Baja precisión / marcado impulsivo (CP% >= 15%)';
  } else if (cpPercent >= 10) {
    qualitativePrecision = 'Precisión moderada (10% - 14.9%)';
  } else if (cpPercent >= 5) {
    qualitativePrecision = 'Buena precisión (5% - 9.9%)';
  }

  // Qualitative concentration
  let qualitativeConcentration = 'Rendimiento Normal / Promedio';
  if (percentile >= 95) {
    qualitativeConcentration = 'Rendimiento Muy Alto / Superior';
  } else if (percentile >= 75) {
    qualitativeConcentration = 'Rendimiento Alto';
  } else if (percentile <= 5) {
    qualitativeConcentration = 'Rendimiento Muy Bajo / Deficitario';
  } else if (percentile <= 24) {
    qualitativeConcentration = 'Rendimiento Bajo';
  }

  let clinicalNote: string | undefined = undefined;
  if (c >= 30 || cpPercent >= 12) {
    clinicalNote = `Alta tasa de comisiones (E2=${c}) con porcentaje de error elevado (${cpPercent.toFixed(
      2
    )}%), sugestivo de estilo impulsivo con fallas en control inhibitorio`;
  }

  return {
    tr,
    ta,
    o,
    c,
    tot,
    con,
    cpPercent,
    decatype,
    percentile,
    tScore,
    qualitativePrecision,
    qualitativeConcentration,
    clinicalNote,
    validity: validation.validity,
  };
}

// ============================================================================
// NEUROPSI Breve Calculator
// ============================================================================

export function validateNeuropsiBreve(input: NeuropsiBreveInput): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (input.age < 16 || input.age > 85) {
    errors.push(`Edad (${input.age}) fuera del rango normativo de NEUROPSI Breve (16-85 años)`);
  }
  if (input.educationYears < 0 || input.educationYears > 24) {
    errors.push(`Años de escolaridad (${input.educationYears}) deben estar entre 0 y 24`);
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function calculateNeuropsiBreve(
  input: NeuropsiBreveInput
): NeuropsiBreveCalculationResult {
  const educationLevel = getNeuropsiEducationLevel(input.educationYears);
  const ageGroup = getNeuropsiAgeGroup(input.age);

  const domainScores: Record<string, number> = {};
  let totalScore = 0;

  if (input.domainScores) {
    Object.entries(input.domainScores).forEach(([k, v]) => {
      if (v !== undefined) {
        domainScores[k] = v;
        totalScore += v;
      }
    });
  } else if (input.totalRawScore !== undefined) {
    totalScore = input.totalRawScore;
  }

  const cell = NEUROPSI_CUTOFFS[educationLevel][ageGroup];
  totalScore = Math.max(0, Math.min(cell.maxScore, totalScore));

  let classification: 'Normal' | 'Alteración Leve' | 'Alteración Moderada' | 'Alteración Severa';
  let meetsClinicalCutoff = false;
  let alertMessage: string | undefined;

  if (totalScore >= cell.normalMin) {
    classification = 'Normal';
  } else if (totalScore >= cell.leveMin) {
    classification = 'Alteración Leve';
    meetsClinicalCutoff = true;
    alertMessage = 'Puntaje en rango de alteración neuropsicológica leve para edad y escolaridad';
  } else if (totalScore >= cell.moderadaMin) {
    classification = 'Alteración Moderada';
    meetsClinicalCutoff = true;
    alertMessage = 'Alerta de deterioro neuropsicológico en rango moderado para edad y escolaridad';
  } else {
    classification = 'Alteración Severa';
    meetsClinicalCutoff = true;
    alertMessage = 'Alerta crítica de compromiso neuropsicológico severo';
  }

  return {
    totalScore,
    domainScores,
    educationLevel,
    ageGroup,
    classification,
    meetsClinicalCutoff,
    alertMessage,
  };
}

// ============================================================================
// MMSE Calculator
// ============================================================================

export function validateMmse(input: MmseInput): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (input.age < 18) {
    errors.push(`Edad (${input.age}) menor a 18 años para baremación de MMSE`);
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function calculateMmse(input: MmseInput): MmseCalculationResult {
  const domainScores: Record<string, number> = {};
  let rawScore = 0;

  if (input.domainScores) {
    Object.entries(input.domainScores).forEach(([k, v]) => {
      if (v !== undefined) {
        domainScores[k] = v;
        rawScore += v;
      }
    });
  } else if (input.rawScore !== undefined) {
    rawScore = input.rawScore;
  }

  rawScore = Math.max(0, Math.min(30, rawScore));
  const delta = getNormacodemDelta(input.age, input.educationYears);
  const adjustedScore = Math.max(0, Math.min(30, rawScore + delta));

  const rawClass = getMmseClassification(rawScore);
  const adjClass = getMmseClassification(adjustedScore);

  let alertMessage: string | undefined;
  if (adjClass.meetsClinicalCutoff) {
    alertMessage = `Alerta de sospecha de deterioro cognitivo significativo (MMSE ajustado = ${adjustedScore} < 24)`;
  }

  return {
    rawScore,
    adjustmentDelta: delta,
    adjustedScore,
    domainScores,
    rawClassification: rawClass.classification,
    classification: adjClass.classification,
    meetsClinicalCutoff: adjClass.meetsClinicalCutoff,
    alertMessage,
  };
}
