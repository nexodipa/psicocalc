/**
 * Normative parameters for Raven 2 Progressive Matrices:
 * - Age-based mean and SD ability score lookup
 * - Standard score qualitative classification
 */

export interface Raven2AgeNorm {
  meanAbility: number;
  sdAbility: number;
}

export function getRaven2AgeNorm(ageYears: number): Raven2AgeNorm {
  if (ageYears < 6) return { meanAbility: 420.0, sdAbility: 40.0 };
  if (ageYears < 8) return { meanAbility: 460.0, sdAbility: 38.0 };
  if (ageYears < 10) return { meanAbility: 490.0, sdAbility: 37.5 };
  if (ageYears < 11) return { meanAbility: 512.5, sdAbility: 37.5 };
  if (ageYears < 13) return { meanAbility: 532.5, sdAbility: 37.5 };
  if (ageYears < 15) return { meanAbility: 545.0, sdAbility: 37.5 };
  if (ageYears < 18) return { meanAbility: 522.5, sdAbility: 37.5 };
  if (ageYears < 30) return { meanAbility: 540.0, sdAbility: 37.5 };
  if (ageYears < 50) return { meanAbility: 530.0, sdAbility: 38.0 };
  return { meanAbility: 510.0, sdAbility: 40.0 };
}

export function getRaven2Qualitative(standardScore: number): string {
  if (standardScore >= 130) return 'Muy Superior';
  if (standardScore >= 120) return 'Superior';
  if (standardScore >= 110) return 'Promedio Alto';
  if (standardScore >= 90) return 'Promedio';
  if (standardScore >= 80) return 'Promedio Bajo';
  if (standardScore >= 70) return 'Limítrofe';
  return 'Extremadamente Bajo';
}
