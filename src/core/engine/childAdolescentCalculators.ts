/**
 * Pure deterministic psychometric calculators for Child-Adolescent & Emotional instruments:
 * - SENA (Fernández-Pinto et al.)
 * - CBCL / ASEBA (Achenbach)
 * - BYI-2 (Beck et al.)
 *
 * All functions have ZERO UI dependencies.
 */

import { normalCdf } from './normalDist';
import {
  SenaInput,
  SenaCalculationResult,
  SenaScaleScore,
  SenaScaleDirection,
  CbclInput,
  CbclCalculationResult,
  CbclScaleScore,
  Byi2Input,
  Byi2CalculationResult,
  Byi2InventoryId,
  Byi2ScaleScore,
} from '../types/child_adolescent';

import {
  SENA_PROTECTIVE_SCALES,
  SENA_CONTROL_SCALES,
  CBCL_BROADBAND_SCALES,
  CBCL_DSM_SCALES,
  BYI2_INVENTORIES,
} from '../tables/childAdolescentNorms';
import { ProtocolValidityResult } from '../registry/TestRegistryTypes';

// ============================================================================
// SENA Calculator
// ============================================================================

export function validateSena(input: SenaInput): {
  isValid: boolean;
  errors: string[];
  validity: ProtocolValidityResult;
} {
  const errors: string[] = [];
  const invalidationReasons: string[] = [];
  const cautionFlags: string[] = [];

  const inc = input.tScores.inc ?? input.tScores.INC;
  if (inc !== undefined && inc >= 70) {
    invalidationReasons.push(
      `Inconsistencia INC T=${inc} >= 70: Protocolo INVÁLIDO por inconsistencia de respuestas`
    );
  }

  const neg = input.tScores.neg ?? input.tScores.NEG;
  if (neg !== undefined && neg >= 70) {
    cautionFlags.push(`Impresión negativa NEG T=${neg} >= 70: Posible sobrerreporte de problemas`);
  }

  const pos = input.tScores.pos ?? input.tScores.POS;
  if (pos !== undefined && pos >= 70) {
    cautionFlags.push(`Impresión positiva POS T=${pos} >= 70: Posible disimulación / faking good`);
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
    },
  };
}

export function calculateSena(input: SenaInput): SenaCalculationResult {
  const validation = validateSena(input);
  const scalesRecord: Record<string, SenaScaleScore> = {};

  Object.entries(input.tScores).forEach(([rawKey, tScore]) => {
    const key = rawKey.toLowerCase();
    let direction: SenaScaleDirection = 'problem';

    if (SENA_PROTECTIVE_SCALES.has(key)) {
      direction = 'protective';
    } else if (SENA_CONTROL_SCALES.has(key)) {
      direction = 'control';
    }

    const z = (tScore - 50) / 10;
    const percentile = Math.min(99.9, Math.max(0.1, Math.round(normalCdf(z) * 1000) / 10));

    let classification:
      | 'Normal'
      | 'En Riesgo'
      | 'Clínico'
      | 'Clínico / Muy Bajo'
      | 'En Riesgo / Bajo' = 'Normal';
    let isAlert = false;

    if (direction === 'protective') {
      if (tScore <= 30) {
        classification = 'Clínico / Muy Bajo';
        isAlert = true;
      } else if (tScore <= 40) {
        classification = 'En Riesgo / Bajo';
        isAlert = true;
      } else {
        classification = 'Normal';
      }
    } else if (direction === 'problem') {
      if (tScore >= 70) {
        classification = 'Clínico';
        isAlert = true;
      } else if (tScore >= 60) {
        classification = 'En Riesgo';
      } else {
        classification = 'Normal';
      }
    } else {
      classification = tScore >= 70 ? 'En Riesgo' : 'Normal';
    }

    scalesRecord[rawKey] = {
      scaleId: rawKey,
      name: rawKey,
      tScore,
      percentile,
      direction,
      classification,
      isAlert,
    };
  });

  // Critical Alerts
  const flags: string[] = [];
  if (input.criticalItems) {
    if (input.criticalItems.suicidalIdeation) {
      flags.push('Ideación suicida detectada');
    }
    if (input.criticalItems.selfHarm) {
      flags.push('Conductas autolesivas no suicidas detectadas');
    }
    if (input.criticalItems.abuse) {
      flags.push('Sospecha de abuso o maltrato');
    }
    if (input.criticalItems.psychosis) {
      flags.push('Presencia de experiencias psicóticas');
    }
  }

  const hasRedFlag = flags.length > 0;
  const bannerMessage = hasRedFlag
    ? `ALERTA ROJA PRIORITARIA: ${flags.join('; ')}`
    : undefined;

  // Global Indices
  const getIndex = (name: string): number | undefined => {
    return (
      input.tScores[name] ??
      input.tScores[name.toUpperCase()] ??
      input.tScores[name.toLowerCase()]
    );
  };

  const globalIndices = {
    ipe: getIndex('ipe') ?? getIndex('IPE'),
    ipc: getIndex('ipc') ?? getIndex('IPC'),
    igp: getIndex('igp') ?? getIndex('IGP'),
    irp: getIndex('irp') ?? getIndex('IRP'),
  };

  let summary = 'Perfil SENA evaluado dentro de límites normativos.';
  if (hasRedFlag) {
    summary = `${bannerMessage}. Se requiere intervención clínica prioritaria.`;
  } else if (!validation.validity.isValidProtocol) {
    summary = `Protocolo SENA INVÁLIDO: ${validation.validity.invalidationReason}`;
  }

  return {
    scales: scalesRecord,
    globalIndices,
    validity: validation.validity,
    criticalAlerts: {
      hasRedFlag,
      flags,
      bannerMessage,
    },
    summary,
  };
}

// ============================================================================
// CBCL Calculator
// ============================================================================

export function validateCbcl(input: CbclInput): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  Object.entries(input.tScores).forEach(([k, v]) => {
    if (v < 30 || v > 120) {
      errors.push(`Escala ${k} (${v}) con Puntuación T fuera de rango verosímil (30-120)`);
    }
  });
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function calculateCbcl(input: CbclInput): CbclCalculationResult {
  const broadband: Record<string, CbclScaleScore> = {};
  const syndromes: Record<string, CbclScaleScore> = {};
  const dsmScales: Record<string, CbclScaleScore> = {};
  const clinicalElevations: string[] = [];
  const borderlineElevations: string[] = [];

  Object.entries(input.tScores).forEach(([scaleKey, tScore]) => {
    const key = scaleKey.toLowerCase();
    const z = (tScore - 50) / 10;
    const percentile = Math.min(99.9, Math.max(0.1, Math.round(normalCdf(z) * 1000) / 10));

    if (CBCL_BROADBAND_SCALES.has(key)) {
      let classification: 'Normal' | 'Limítrofe' | 'Clínico' = 'Normal';
      if (tScore >= 64) {
        classification = 'Clínico';
        clinicalElevations.push(`${scaleKey} (T=${tScore})`);
      } else if (tScore >= 60) {
        classification = 'Limítrofe';
        borderlineElevations.push(`${scaleKey} (T=${tScore})`);
      }
      broadband[scaleKey] = {
        scaleId: scaleKey,
        name: scaleKey,
        tScore,
        percentile,
        category: 'broadband',
        classification,
      };
    } else if (CBCL_DSM_SCALES.has(key)) {
      let classification: 'Normal' | 'Limítrofe' | 'Clínico' = 'Normal';
      if (tScore >= 70) {
        classification = 'Clínico';
        clinicalElevations.push(`${scaleKey} (T=${tScore})`);
      } else if (tScore >= 65) {
        classification = 'Limítrofe';
        borderlineElevations.push(`${scaleKey} (T=${tScore})`);
      }
      dsmScales[scaleKey] = {
        scaleId: scaleKey,
        name: scaleKey,
        tScore,
        percentile,
        category: 'dsm',
        classification,
      };
    } else {
      let classification: 'Normal' | 'Limítrofe' | 'Clínico' = 'Normal';
      if (tScore >= 70) {
        classification = 'Clínico';
        clinicalElevations.push(`${scaleKey} (T=${tScore})`);
      } else if (tScore >= 65) {
        classification = 'Limítrofe';
        borderlineElevations.push(`${scaleKey} (T=${tScore})`);
      }
      syndromes[scaleKey] = {
        scaleId: scaleKey,
        name: scaleKey,
        tScore,
        percentile,
        category: 'syndrome',
        classification,
      };
    }
  });

  let summary = 'Perfil CBCL / ASEBA dentro del rango normal.';
  if (clinicalElevations.length > 0) {
    summary = `Elevaciones en rango clínico para: ${clinicalElevations.join(', ')}.`;
  } else if (borderlineElevations.length > 0) {
    summary = `Elevaciones en rango limítrofe para: ${borderlineElevations.join(', ')}.`;
  }

  return {
    broadband,
    syndromes,
    dsmScales,
    clinicalElevations,
    borderlineElevations,
    summary,
  };
}

// ============================================================================
// BYI-2 Calculator
// ============================================================================

export function validateByi2(input: Byi2Input): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (input.rawScores) {
    Object.entries(input.rawScores).forEach(([k, v]) => {
      if (v !== undefined && (v < 0 || v > 60)) {
        errors.push(`Inventario ${k} (${v}) fuera de rango directo válido (0-60)`);
      }
    });
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function calculateByi2(input: Byi2Input): Byi2CalculationResult {
  const inventories: Record<Byi2InventoryId, Byi2ScaleScore> = {} as any;

  (Object.keys(BYI2_INVENTORIES) as Byi2InventoryId[]).forEach((invId) => {
    const meta = BYI2_INVENTORIES[invId];
    let tScore: number;
    let rawScore: number | undefined;

    if (input.tScores && input.tScores[invId] !== undefined) {
      tScore = Math.max(30, Math.min(100, Math.round(input.tScores[invId]!)));
      rawScore = input.rawScores?.[invId];
    } else if (input.rawScores && input.rawScores[invId] !== undefined) {
      rawScore = input.rawScores[invId]!;
      tScore = Math.max(
        30,
        Math.min(100, Math.round(50 + 10 * ((rawScore - meta.meanRaw) / meta.sdRaw)))
      );
    } else {
      tScore = 50;
    }

    const z = (tScore - 50) / 10;
    const percentile = Math.min(99.9, Math.max(0.1, Math.round(normalCdf(z) * 1000) / 10));

    let severity = 'Promedio';
    if (meta.isPositiveConstruct) {
      // BSCI-Y (Self-Concept)
      if (tScore > 55) severity = 'Superior al Promedio';
      else if (tScore >= 45) severity = 'Promedio';
      else if (tScore >= 40) severity = 'Inferior al Promedio';
      else severity = 'Muy Inferior al Promedio';
    } else {
      // Symptom inventories
      if (tScore >= 70) severity = 'Elevación Extremadamente Alta';
      else if (tScore >= 60) severity = 'Elevación Moderada';
      else if (tScore >= 55) severity = 'Elevación Leve';
      else severity = 'Promedio';
    }

    inventories[invId] = {
      inventoryId: invId,
      name: meta.name,
      rawScore,
      tScore,
      percentile,
      severity,
    };
  });

  const suicideTriggered =
    input.suicidalItemResponse !== undefined && input.suicidalItemResponse > 0;
  const suicideMessage = suicideTriggered
    ? `ALERTA CRÍTICA: Deseos de muerte / ideación suicida reportada en BDI-Y (ítem 9 = ${input.suicidalItemResponse})`
    : 'Sin alerta suicida en BDI-Y.';

  let summary = 'Perfil de inventarios de Beck (BYI-2) evaluado.';
  if (suicideTriggered) {
    summary = `${suicideMessage}. Atención psiquiátrica o psicológica prioritaria recomendada.`;
  }

  return {
    inventories,
    suicideRiskAlert: {
      triggered: suicideTriggered,
      message: suicideMessage,
    },
    summary,
  };
}
