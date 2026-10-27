export type Knot = [number, number]; // [sum, standardScore]

/**
 * Monotonic piecewise knot interpolation function.
 * Maps raw sum to standardized score using anchored knot points.
 * Guarantees that f(s + 1) >= f(s) when knot segments have non-negative slope.
 */
export function interpolateKnots(sum: number, knots: Knot[]): number {
  if (knots.length === 0) return 100;
  if (sum <= knots[0][0]) return knots[0][1];
  if (sum >= knots[knots.length - 1][0]) return knots[knots.length - 1][1];

  for (let i = 0; i < knots.length - 1; i++) {
    const [x0, y0] = knots[i];
    const [x1, y1] = knots[i + 1];
    if (sum >= x0 && sum <= x1) {
      if (x1 === x0) return y0;
      const slope = (y1 - y0) / (x1 - x0);
      return Math.round(y0 + slope * (sum - x0));
    }
  }
  return knots[knots.length - 1][1];
}

/**
 * GENERIC ILLUSTRATIVE NORMS (not official, not derived from any commercial test).
 *
 * Every subtest scaled score is assumed to have mean 10 and SD 3, and every
 * pair of subtests an inter-correlation of GENERIC_INTERCORRELATION. A composite
 * is the sum converted to a z-score and rescaled to mean 100, SD 15. These
 * values are placeholders for demonstration; they do NOT reproduce, approximate
 * or replace the official conversion tables of WISC-V or WAIS-IV.
 */
export const GENERIC_INTERCORRELATION = 0.5;
export const GENERIC_RXX = 0.9;
/** SEM in index points for a reliability of GENERIC_RXX on a SD-15 scale. */
export const GENERIC_SEM = Math.round(15 * Math.sqrt(1 - GENERIC_RXX) * 100) / 100;

export function genericComposite(
  sum: number,
  subtestCount: number,
  min = 45,
  max = 155
): number {
  const n = subtestCount;
  const sdSum = 3 * Math.sqrt(n + n * (n - 1) * GENERIC_INTERCORRELATION);
  const z = (sum - 10 * n) / sdSum;
  return Math.max(min, Math.min(max, Math.round(100 + 15 * z)));
}

/** Pairwise critical differences from the generic SEM (illustrative). */
export function genericCriticalDifferences(
  ids: string[]
): Record<string, { seDiff: number; cv05: number; cv01: number }> {
  const seDiff = Math.round(Math.sqrt(2 * GENERIC_SEM * GENERIC_SEM) * 100) / 100;
  const out: Record<string, { seDiff: number; cv05: number; cv01: number }> = {};
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      out[`${ids[i]}-${ids[j]}`] = {
        seDiff,
        cv05: Math.round(1.96 * seDiff * 10) / 10,
        cv01: Math.round(2.576 * seDiff * 10) / 10,
      };
    }
  }
  return out;
}
