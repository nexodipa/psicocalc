/**
 * Pure deterministic psychometric calculators for Personality & Psychopathology:
 * - MMPI-3 (Ben-Porath & Tellegen)
 * - PAI (Morey)
 * - MCMI-IV (Millon)
 *
 * All functions have ZERO UI dependencies.
 */

import { normalCdf } from './normalDist';
import {
  Mmpi3Input,
  Mmpi3CalculationResult,
  Mmpi3ScaleScore,
  Mmpi3ScaleId,
  PaiInput,
  PaiCalculationResult,
  PaiScaleScore,
  Mcmi4Input,
  Mcmi4CalculationResult,
  Mcmi4ScaleScore,
  Mcmi4ScaleId,
} from '../types/personality';

import {
  MMPI3_SCALES,
  MMPI3_INVALIDATION_RULES,
  PAI_SCALES,
  PAI_INVALIDATION_RULES,
  MCMI4_SCALES,
  MCMI4_INVALIDATION_RULES,
} from '../tables/personalityNorms';
import { ProtocolValidityResult } from '../registry/TestRegistryTypes';

// ============================================================================
// MMPI-3 Calculator
// ============================================================================

export function validateMmpi3(input: Mmpi3Input): {
  isValid: boolean;
  errors: string[];
  validity: ProtocolValidityResult;
} {
  const errors: string[] = [];
  const invalidationReasons: string[] = [];
  const cautionFlags: string[] = [];

  const omitted = input.omittedCount ?? 0;
  if (omitted >= 15) {
    invalidationReasons.push(
      `CNS = ${omitted} >= 15: Protocolo INVÁLIDO por falta de respuesta`
    );
  } else if (omitted >= 5) {
    cautionFlags.push(`CNS = ${omitted}: Omisión parcial de respuestas (5-14 ítems)`);
  }

  const getT = (scaleId: Mmpi3ScaleId): number | undefined => {
    if (input.tScores && input.tScores[scaleId] !== undefined) {
      return input.tScores[scaleId];
    }
    if (input.rawScores && input.rawScores[scaleId] !== undefined) {
      const meta = MMPI3_SCALES[scaleId];
      if (meta) {
        const raw = input.rawScores[scaleId]!;
        return Math.round(50 + 10 * ((raw - meta.mean) / meta.sd));
      }
    }
    return undefined;
  };

  const vrin = getT('VRIN');
  if (vrin !== undefined) {
    if (vrin >= 80) {
      invalidationReasons.push(
        `VRIN T=${vrin} >= 80: Inconsistencia extrema de respuestas variables (patrón aleatorio)`
      );
    } else if (vrin >= 70) {
      cautionFlags.push(`VRIN T=${vrin}: Inconsistencia moderada de respuestas`);
    }
  }

  const trin = getT('TRIN');
  if (trin !== undefined) {
    if (trin >= 80) {
      invalidationReasons.push(
        `TRIN T=${trin} >= 80: Inconsistencia por sesgo fijo (True o False)`
      );
    } else if (trin >= 70) {
      cautionFlags.push(`TRIN T=${trin}: Tendencia a aquiescencia o contra-aquiescencia`);
    }
  }

  const crin = getT('CRIN');
  if (crin !== undefined) {
    if (crin >= 80) {
      invalidationReasons.push(
        `CRIN T=${crin} >= 80: Inconsistencia combinada fuera de tolerancia`
      );
    } else if (crin >= 70) {
      cautionFlags.push(`CRIN T=${crin}: Inconsistencia combinada moderada`);
    }
  }

  const f = getT('F');
  if (f !== undefined) {
    if (f >= 100) {
      invalidationReasons.push(
        `F T=${f} >= 100: Protocolo INVÁLIDO por sobredeterminación extrema / infrecuencia severa`
      );
    } else if (f >= 80) {
      cautionFlags.push(`F T=${f}: Elevación infrecuente alta (posible exageración o crisis)`);
    }
  }

  const fp = getT('Fp');
  if (fp !== undefined) {
    if (fp >= 80) {
      invalidationReasons.push(
        `Fp T=${fp} >= 80: Protocolo INVÁLIDO por simulación de psicopatología`
      );
    } else if (fp >= 70) {
      cautionFlags.push(`Fp T=${fp}: Respuestas psicopatológicas infrecuentes`);
    }
  }

  const l = getT('L');
  if (l !== undefined) {
    if (l >= 80) {
      invalidationReasons.push(
        `L T=${l} >= 80: Protocolo INVÁLIDO por sub-declaración extrema`
      );
    } else if (l >= 65) {
      cautionFlags.push(`L T=${l}: Deseabilidad social o defensividad ingenua`);
    }
  }

  const isValidProtocol = invalidationReasons.length === 0;
  return {
    isValid: isValidProtocol,
    errors,
    validity: {
      isValidProtocol,
      invalidationReason: invalidationReasons[0],
      invalidationReasons,
      cautionFlags,
      omittedCount: omitted,
    },
  };
}

export function calculateMmpi3(input: Mmpi3Input): Mmpi3CalculationResult {
  const validation = validateMmpi3(input);
  const scalesRecord: Record<string, Mmpi3ScaleScore> = {};
  const primaryElevations: string[] = [];

  const allKeys = new Set<Mmpi3ScaleId>([
    ...((input.tScores ? Object.keys(input.tScores) : []) as Mmpi3ScaleId[]),
    ...((input.rawScores ? Object.keys(input.rawScores) : []) as Mmpi3ScaleId[]),
  ]);

  for (const scaleId of allKeys) {
    const meta = MMPI3_SCALES[scaleId];
    if (!meta) continue;

    let tScore: number;
    let rawScore: number;

    if (input.tScores && input.tScores[scaleId] !== undefined) {
      tScore = Math.max(30, Math.min(120, Math.round(input.tScores[scaleId]!)));
      rawScore =
        input.rawScores && input.rawScores[scaleId] !== undefined
          ? input.rawScores[scaleId]!
          : Math.round(meta.mean + ((tScore - 50) / 10) * meta.sd);
    } else if (input.rawScores && input.rawScores[scaleId] !== undefined) {
      rawScore = input.rawScores[scaleId]!;
      tScore = Math.max(
        30,
        Math.min(120, Math.round(50 + 10 * ((rawScore - meta.mean) / meta.sd)))
      );
    } else {
      continue;
    }

    const z = (tScore - 50) / 10;
    const percentile = Math.min(99.9, Math.max(0.1, Math.round(normalCdf(z) * 1000) / 10));

    let elevation: 'normal' | 'clinical' | 'marked' = 'normal';
    if (tScore >= 80) {
      elevation = 'marked';
      if (meta.category !== 'validity') primaryElevations.push(scaleId);
    } else if (tScore >= 65) {
      elevation = 'clinical';
      if (meta.category !== 'validity') primaryElevations.push(scaleId);
    }

    scalesRecord[scaleId] = {
      scaleId,
      rawScore,
      tScore,
      percentile,
      elevation,
    };
  }

  // Suicide risk alert assessment (SUI)
  const suiScore = scalesRecord['SUI'];
  let suicideTriggered = false;
  let suicideLevel: 'NONE' | 'CLINICAL_ALERT' | 'CRITICAL_RISK' = 'NONE';
  let suicideMessage = 'Sin alerta de ideación suicida.';

  if (suiScore) {
    if (suiScore.tScore >= 80) {
      suicideTriggered = true;
      suicideLevel = 'CRITICAL_RISK';
      suicideMessage = `Alerta de riesgo crítico inminente: Ideación suicida aguda con potencial intencionalidad (SUI T=${suiScore.tScore} >= 80)`;
    } else if (suiScore.tScore >= 65) {
      suicideTriggered = true;
      suicideLevel = 'CLINICAL_ALERT';
      suicideMessage = `Presencia de ideación suicida activa (SUI T=${suiScore.tScore} >= 65)`;
    }
  }

  // Summary
  let summary = 'Perfil dentro de límites normales.';
  if (!validation.validity.isValidProtocol) {
    summary = `Protocolo INVÁLIDO y no interpretable clínicamente: ${validation.validity.invalidationReason}`;
  } else if (primaryElevations.length > 0) {
    summary = `Elevaciones clínicas significativas en: ${primaryElevations.join(', ')}.`;
  }

  return {
    scales: scalesRecord,
    validity: validation.validity,
    clinicalProfileInterpretable: validation.validity.isValidProtocol,
    primaryElevations,
    suicideRiskAlert: {
      triggered: suicideTriggered,
      level: suicideLevel,
      message: suicideMessage,
    },
    clinicalClassification: summary,
  };
}

// ============================================================================
// PAI Calculator
// ============================================================================

export function validatePai(input: PaiInput): {
  isValid: boolean;
  errors: string[];
  validity: ProtocolValidityResult;
} {
  const errors: string[] = [];
  const invalidationReasons: string[] = [];
  const cautionFlags: string[] = [];

  const omitted = input.omittedCount ?? 0;
  if (omitted > 17) {
    invalidationReasons.push(
      `Omisiones = ${omitted} > 17: Protocolo globalmente INVÁLIDO por falta de respuesta`
    );
  } else if (omitted >= 10) {
    cautionFlags.push(`Omisiones = ${omitted}: Omisión moderada (10-17 ítems)`);
  }

  const getT = (scaleId: string): number | undefined => {
    if (input.tScores && input.tScores[scaleId as any] !== undefined) {
      return input.tScores[scaleId as any];
    }
    if (input.rawScores && input.rawScores[scaleId as any] !== undefined) {
      const meta = PAI_SCALES[scaleId];
      if (meta) {
        return Math.round(50 + 10 * ((input.rawScores[scaleId as any]! - meta.mean) / meta.sd));
      }
    }
    return undefined;
  };

  const icn = getT('ICN');
  if (icn !== undefined) {
    if (icn >= 73) {
      invalidationReasons.push(
        `ICN T=${icn} >= 73: Protocolo INVÁLIDO por respuestas al azar/inconsistentes`
      );
    } else if (icn >= 64) {
      cautionFlags.push(`ICN T=${icn}: Inconsistencia moderada`);
    }
  }

  const inf = getT('INF');
  if (inf !== undefined) {
    if (inf >= 75) {
      invalidationReasons.push(
        `INF T=${inf} >= 75: Protocolo INVÁLIDO por confusión o lectura errática`
      );
    } else if (inf >= 60) {
      cautionFlags.push(`INF T=${inf}: Respuestas atípicas moderadas`);
    }
  }

  const nim = getT('NIM');
  if (nim !== undefined) {
    if (nim >= 92) {
      invalidationReasons.push(
        `NIM T=${nim} >= 92: Distorsión negativa extrema, patrón no creíble o simulación deliberada`
      );
    } else if (nim >= 73) {
      cautionFlags.push(`NIM T=${nim}: Posible exageración de síntomas o llamada de auxilio`);
    }
  }

  const pim = getT('PIM');
  if (pim !== undefined) {
    if (pim >= 68) {
      cautionFlags.push(
        `PIM T=${pim} >= 68: Defensividad extrema / faking good (posible supresión patológica)`
      );
    } else if (pim >= 57) {
      cautionFlags.push(`PIM T=${pim}: Defensividad moderada`);
    }
  }

  const isValidProtocol = invalidationReasons.length === 0;
  return {
    isValid: isValidProtocol,
    errors,
    validity: {
      isValidProtocol,
      invalidationReason: invalidationReasons[0],
      invalidationReasons,
      cautionFlags,
      omittedCount: omitted,
    },
  };
}

export function calculatePai(input: PaiInput): PaiCalculationResult {
  const validation = validatePai(input);
  const scalesRecord: Record<string, PaiScaleScore> = {};
  const subscalesRecord: Record<string, PaiScaleScore> = {};
  const elevations: string[] = [];

  const allKeys = new Set<string>([
    ...(input.tScores ? Object.keys(input.tScores) : []),
    ...(input.rawScores ? Object.keys(input.rawScores) : []),
  ]);

  for (const scaleId of allKeys) {
    const meta = PAI_SCALES[scaleId];
    let tScore: number;
    let rawScore: number;

    if (input.tScores && input.tScores[scaleId as any] !== undefined) {
      tScore = Math.max(30, Math.min(120, Math.round(input.tScores[scaleId as any]!)));
      rawScore =
        input.rawScores && input.rawScores[scaleId as any] !== undefined
          ? input.rawScores[scaleId as any]!
          : meta
          ? Math.round(meta.mean + ((tScore - 50) / 10) * meta.sd)
          : tScore;
    } else if (input.rawScores && input.rawScores[scaleId as any] !== undefined) {
      rawScore = input.rawScores[scaleId as any]!;
      tScore = meta
        ? Math.max(30, Math.min(120, Math.round(50 + 10 * ((rawScore - meta.mean) / meta.sd))))
        : 50;
    } else {
      continue;
    }

    const z = (tScore - 50) / 10;
    const percentile = Math.min(99.9, Math.max(0.1, Math.round(normalCdf(z) * 1000) / 10));

    let elevation: 'normal' | 'moderate' | 'clinical' | 'marked' = 'normal';
    if (tScore >= 82) {
      elevation = 'marked';
      if (!scaleId.includes('-') && !['ICN', 'INF', 'NIM', 'PIM'].includes(scaleId)) {
        elevations.push(`${scaleId} (T=${tScore}, Severa)`);
      }
    } else if (tScore >= 70) {
      elevation = 'clinical';
      if (!scaleId.includes('-') && !['ICN', 'INF', 'NIM', 'PIM'].includes(scaleId)) {
        elevations.push(`${scaleId} (T=${tScore}, Clínica)`);
      }
    } else if (tScore >= 60) {
      elevation = 'moderate';
    }

    const item: PaiScaleScore = {
      scaleId,
      rawScore,
      tScore,
      percentile,
      elevation,
    };

    if (scaleId.includes('-')) {
      subscalesRecord[scaleId] = item;
    } else {
      scalesRecord[scaleId] = item;
    }
  }

  // SUI Alert
  const suiScore = scalesRecord['SUI'];
  let suiTriggered = false;
  let suiLevel: 'NONE' | 'CLINICAL_ALERT' | 'CRITICAL_RISK' = 'NONE';
  let suiMessage = 'Sin alerta de ideación suicida.';

  if (suiScore) {
    if (suiScore.tScore >= 80) {
      suiTriggered = true;
      suiLevel = 'CRITICAL_RISK';
      suiMessage = `Alerta crítica de riesgo inminente de suicidio (SUI T=${suiScore.tScore} >= 80)`;
    } else if (suiScore.tScore >= 70) {
      suiTriggered = true;
      suiLevel = 'CLINICAL_ALERT';
      suiMessage = `Alerta clínica de riesgo de suicidio (SUI T=${suiScore.tScore} >= 70)`;
    }
  }

  // Substance Alert
  const alc = scalesRecord['ALC'];
  const drg = scalesRecord['DRG'];
  let substanceTriggered = false;
  let substanceMessage = 'Sin alerta de abuso de sustancias.';
  if ((alc && alc.tScore >= 70) || (drg && drg.tScore >= 70)) {
    substanceTriggered = true;
    substanceMessage = `Alerta de abuso o dependencia de sustancias: ${[
      alc && alc.tScore >= 70 ? `Alcohol (T=${alc.tScore})` : null,
      drg && drg.tScore >= 70 ? `Drogas (T=${drg.tScore})` : null,
    ]
      .filter(Boolean)
      .join(', ')}`;
  }

  let summary = 'Perfil PAI dentro de límites normales.';
  if (!validation.validity.isValidProtocol) {
    summary = `Protocolo INVÁLIDO: ${validation.validity.invalidationReason}`;
  } else if (elevations.length > 0) {
    summary = `Elevaciones diagnósticas significativas en: ${elevations.join(', ')}.`;
  }

  return {
    scales: scalesRecord,
    subscales: subscalesRecord,
    validity: validation.validity,
    clinicalProfileInterpretable: validation.validity.isValidProtocol,
    meetsClinicalCutoff: elevations.length > 0,
    elevations,
    suicideRiskAlert: {
      triggered: suiTriggered,
      level: suiLevel,
      message: suiMessage,
    },
    substanceAlert: {
      triggered: substanceTriggered,
      message: substanceMessage,
    },
    summary,
  };
}

// ============================================================================
// MCMI-IV Calculator
// ============================================================================

export function validateMcmi4(input: Mcmi4Input): {
  isValid: boolean;
  errors: string[];
  validity: ProtocolValidityResult;
} {
  const errors: string[] = [];
  const invalidationReasons: string[] = [];
  const cautionFlags: string[] = [];

  const omitted = input.omittedCount ?? 0;
  if (omitted > 14) {
    invalidationReasons.push(
      `Omisiones = ${omitted} > 14: Protocolo INVÁLIDO por exceso de ítems no contestados`
    );
  }

  const getRaw = (scaleId: Mcmi4ScaleId): number | undefined => {
    if (input.rawScores && input.rawScores[scaleId] !== undefined) {
      return input.rawScores[scaleId];
    }
    return undefined;
  };

  const v = getRaw('V');
  if (v !== undefined) {
    if (v >= 2) {
      invalidationReasons.push(
        `Escala V = ${v} >= 2: Contenido extravagante o inverosímil detectado, protocolo INVÁLIDO`
      );
    } else if (v === 1) {
      cautionFlags.push('Escala V = 1: Validez cuestionable, interpretar con reservas');
    }
  }

  const w = getRaw('W');
  if (w !== undefined) {
    if (w >= 20) {
      invalidationReasons.push(
        `Escala W = ${w} >= 20: Protocolo INVÁLIDO por inconsistencia de respuestas`
      );
    }
  }

  const x = getRaw('X');
  if (x !== undefined) {
    if (x < 7) {
      invalidationReasons.push(
        `Escala X = ${x} < 7: Protocolo INVÁLIDO por falta de apertura / ocultamiento extremo`
      );
    } else if (x > 114) {
      invalidationReasons.push(
        `Escala X = ${x} > 114: Protocolo INVÁLIDO por auto-revelación patológicamente exagerada`
      );
    }
  }

  const isValidProtocol = invalidationReasons.length === 0;
  return {
    isValid: isValidProtocol,
    errors,
    validity: {
      isValidProtocol,
      invalidationReason: invalidationReasons[0],
      invalidationReasons,
      cautionFlags,
      omittedCount: omitted,
    },
  };
}

export function calculateMcmi4(input: Mcmi4Input): Mcmi4CalculationResult {
  const validation = validateMcmi4(input);
  const scalesRecord: Record<string, Mcmi4ScaleScore> = {};
  const presenceScales: string[] = [];
  const prominenceScales: string[] = [];

  const allKeys = new Set<Mcmi4ScaleId>([
    ...(input.baseRates ? Object.keys(input.baseRates) : []),
    ...(input.rawScores ? Object.keys(input.rawScores) : []),
  ] as Mcmi4ScaleId[]);

  // Check Scale X disclosure adjustment
  const rawX = input.rawScores ? input.rawScores['X'] : undefined;
  let disclosureDelta = 0;
  if (rawX !== undefined) {
    if (rawX > 61) {
      disclosureDelta = -Math.min(10, Math.round((rawX - 61) * 0.2));
    } else if (rawX < 61) {
      disclosureDelta = Math.min(10, Math.round((61 - rawX) * 0.2));
    }
  }

  for (const scaleId of allKeys) {
    const meta = MCMI4_SCALES[scaleId];
    if (!meta) continue;

    let baseRate: number;
    let rawScore: number = 0;

    if (input.baseRates && input.baseRates[scaleId] !== undefined) {
      baseRate = input.baseRates[scaleId]!;
      rawScore =
        input.rawScores && input.rawScores[scaleId] !== undefined
          ? input.rawScores[scaleId]!
          : meta.medianRaw;
    } else if (input.rawScores && input.rawScores[scaleId] !== undefined) {
      rawScore = input.rawScores[scaleId]!;
      // Base Rate empirical estimation from median
      const diff = rawScore - meta.medianRaw;
      baseRate = Math.round(60 + diff * 3.5);
      // Apply disclosure delta to personality and syndrome scales
      if (meta.category !== 'modifying') {
        baseRate += disclosureDelta;
      }
    } else {
      continue;
    }

    baseRate = Math.max(0, Math.min(115, Math.round(baseRate)));

    const presence = baseRate >= 75 && baseRate < 85;
    const prominence = baseRate >= 85;

    let qualitativeLevel: 'No significativo' | 'Estilo' | 'Presencia' | 'Prominencia' = 'No significativo';
    if (prominence) {
      qualitativeLevel = 'Prominencia';
      if (meta.category !== 'modifying') prominenceScales.push(`${scaleId} (TB=${baseRate})`);
    } else if (baseRate >= 75) {
      qualitativeLevel = 'Presencia';
      if (meta.category !== 'modifying') presenceScales.push(`${scaleId} (TB=${baseRate})`);
    } else if (baseRate >= 60) {
      qualitativeLevel = 'Estilo';
    }

    scalesRecord[scaleId] = {
      scaleId,
      rawScore,
      baseRate,
      presence: baseRate >= 75,
      prominence,
      qualitativeLevel,
    };
  }

  let diagnosticSummary = 'Perfil MCMI-IV dentro de características adaptativas de estilo.';
  if (!validation.validity.isValidProtocol) {
    diagnosticSummary = `Protocolo INVÁLIDO: ${validation.validity.invalidationReason}`;
  } else if (prominenceScales.length > 0 || presenceScales.length > 0) {
    const parts: string[] = [];
    if (prominenceScales.length > 0) {
      parts.push(`Prominencia clínica en: ${prominenceScales.join(', ')}`);
    }
    if (presenceScales.length > 0) {
      parts.push(`Presencia de rasgos/síndromes en: ${presenceScales.join(', ')}`);
    }
    diagnosticSummary = parts.join('. ') + '.';
  }

  return {
    scales: scalesRecord,
    validity: validation.validity,
    clinicalProfileInterpretable: validation.validity.isValidProtocol,
    presenceScales,
    prominenceScales,
    diagnosticSummary,
  };
}
