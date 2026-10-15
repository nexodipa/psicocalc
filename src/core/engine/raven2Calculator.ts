/**
 * Pure deterministic psychometric calculator for Raven 2 (Raven's Progressive Matrices).
 * ZERO UI dependencies.
 */

import { normalCdf } from './normalDist';
import { Raven2Input, Raven2CalculationResult } from '../types/nonverbal';
import { getRaven2AgeNorm, getRaven2Qualitative } from '../tables/nonverbalNorms';

export function validateRaven2(input: Raven2Input): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (input.rawScore !== undefined && (input.rawScore < 0 || input.rawScore > 48)) {
    errors.push(`Puntuación directa de aciertos (${input.rawScore}) debe estar entre 0 y 48`);
  }
  if (input.abilityScore !== undefined && (input.abilityScore < 300 || input.abilityScore > 750)) {
    errors.push(`Puntuación de habilidad (${input.abilityScore}) debe estar entre 300 y 750`);
  }
  if (input.ageYears < 4 || input.ageYears > 69) {
    errors.push(`Edad (${input.ageYears}) fuera del rango normativo de Raven 2 (4-69 años)`);
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function calculateRaven2(input: Raven2Input): Raven2CalculationResult {
  let rawScore = input.rawScore ?? 0;
  let abilityScore: number;

  if (input.abilityScore !== undefined) {
    abilityScore = input.abilityScore;
    if (input.rawScore === undefined) {
      rawScore = Math.max(0, Math.min(48, Math.round((abilityScore - 350) / 6.25)));
    }
  } else {
    rawScore = Math.max(0, Math.min(48, rawScore));
    abilityScore = Math.round((350 + rawScore * 6.25) * 10) / 10;
  }

  const norm = getRaven2AgeNorm(input.ageYears);
  const z = (abilityScore - norm.meanAbility) / norm.sdAbility;
  const standardScore = Math.max(40, Math.min(160, Math.round(100 + z * 15)));

  const p = Math.round(normalCdf((standardScore - 100) / 15) * 1000) / 10;
  const percentile = Math.min(99.9, Math.max(0.1, p));

  const qualitative = getRaven2Qualitative(standardScore);

  return {
    rawScore,
    abilityScore: Math.round(abilityScore),
    standardScore,
    percentile,
    ci90: [standardScore - 6, standardScore + 6],
    ci95: [standardScore - 7, standardScore + 7],
    qualitative,
  };
}
