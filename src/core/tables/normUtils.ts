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
