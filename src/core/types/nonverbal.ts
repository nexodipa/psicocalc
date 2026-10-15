/**
 * Type definitions for Nonverbal Intelligence:
 * - Raven 2 (Raven's Progressive Matrices - 2nd Ed)
 */

export interface Raven2Input {
  rawScore?: number;      // 0..48 direct correct items
  abilityScore?: number;  // 300..700 Rasch / IRT ability score
  ageYears: number;       // 4..69
  ageMonths?: number;     // 0..11
}

export interface Raven2CalculationResult {
  rawScore: number;
  abilityScore: number;
  standardScore: number; // 40..160 Standard Score (Mean 100, SD 15)
  percentile: number;
  ci90: [number, number];
  ci95: [number, number];
  qualitative: string;
}
