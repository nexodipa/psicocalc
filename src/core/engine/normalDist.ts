/**
 * Pure mathematical implementation of normal cumulative distribution function (CDF),
 * error function (erf), z-score conversion, and psychometric percentile ranking.
 */

/**
 * Error function erf(x) using Abramowitz and Stegun formula 7.1.26.
 * Maximum error |epsilon(x)| <= 1.5e-7.
 */
export function erf(x: number): number {
  if (isNaN(x)) return NaN;
  if (x === 0) return 0;
  if (x < 0) return -erf(-x);

  const p = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;

  const t = 1.0 / (1.0 + p * x);
  const poly = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;
  return 1.0 - poly * Math.exp(-x * x);
}

/**
 * Standard normal cumulative distribution function Phi(z).
 * Returns probability in range [0, 1].
 */
export function normalCdf(z: number): number {
  if (isNaN(z)) return NaN;
  return 0.5 * (1.0 + erf(z / Math.SQRT2));
}

/**
 * Converts a Wechsler composite standard score (Mean = 100, SD = 15) to z-score.
 */
export function compositeToZ(composite: number): number {
  return (composite - 100) / 15;
}

/**
 * Converts a subtest scaled score (Mean = 10, SD = 3) to z-score.
 */
export function scaledToZ(scaled: number): number {
  return (scaled - 10) / 3;
}

/**
 * Calculates the exact psychometric percentile rank for a Wechsler composite score.
 * Clamped strictly to [0.1, 99.9].
 * Follows psychometric reporting convention:
 * - Scores with percentiles between 1 and 99 are rounded to nearest integer (e.g. 50, 82, 98).
 * - Tail scores (>= 99.0 or <= 1.0) maintain 1 decimal place (e.g. 99.4, 99.8, 0.4).
 * - Floor clamped to 0.1 (<0.1) and ceiling clamped to 99.9 (>99.9).
 */
export function compositeToPercentile(composite: number): number {
  if (isNaN(composite)) return NaN;
  const z = compositeToZ(composite);
  const rawP = normalCdf(z) * 100;

  if (rawP >= 99.9) return 99.9;
  if (rawP <= 0.1) return 0.1;

  if (rawP >= 99.0 || rawP <= 1.0) {
    return Math.round(rawP * 10) / 10;
  }
  return Math.round(rawP);
}

/**
 * Formats a percentile for clinical reports, displaying '<0.1' or '>99.9' when at bounds.
 */
export function formatPercentile(percentile: number, originalComposite?: number): string {
  if (isNaN(percentile)) return '-';
  if (originalComposite !== undefined) {
    if (originalComposite <= 45) return '<0.1';
    if (originalComposite >= 155) return '>99.9';
  }
  if (percentile <= 0.1) return '<0.1';
  if (percentile >= 99.9) return '>99.9';
  return percentile.toString();
}
