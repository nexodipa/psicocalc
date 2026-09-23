import { ConfidenceInterval } from '../types/psychometrics';

export const Z_90 = 1.645;
export const Z_95 = 1.960;

/**
 * Calculates a confidence interval for a composite score centered on the observed score,
 * using the Standard Error of Measurement (SEM).
 * Bounded strictly within [40, 160].
 */
export function calculateConfidenceInterval(
  compositeScore: number,
  sem: number,
  level: 90 | 95
): ConfidenceInterval {
  const z = level === 90 ? Z_90 : Z_95;
  const margin = Math.round(z * sem);
  const lower = Math.max(40, compositeScore - margin);
  const upper = Math.min(160, compositeScore + margin);

  return {
    lower,
    upper,
    level,
  };
}

/**
 * Convenience helper that computes both 90% and 95% confidence intervals.
 */
export function calculateBothConfidenceIntervals(
  compositeScore: number,
  sem: number
): { ci90: ConfidenceInterval; ci95: ConfidenceInterval } {
  return {
    ci90: calculateConfidenceInterval(compositeScore, sem, 90),
    ci95: calculateConfidenceInterval(compositeScore, sem, 95),
  };
}
