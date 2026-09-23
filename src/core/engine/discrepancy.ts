import { BatteryType, CompositeResult, DiscrepancyResult } from '../types/psychometrics';
import { WISC_V_DISCREPANCY_CRITICAL } from '../tables/wisc_v_norms';
import { WAIS_IV_DISCREPANCY_CRITICAL } from '../tables/wais_iv_norms';

/**
 * Estimates clinical base rate description based on observed absolute difference.
 */
export function estimateBaseRateDesc(diffAbs: number): string {
  if (diffAbs >= 30) return '< 1.5% (Extremadamente infrecuente)';
  if (diffAbs >= 25) return '< 2.5% (Muy infrecuente)';
  if (diffAbs >= 20) return '< 5.0% (Inusual / Clínicamente relevante)';
  if (diffAbs >= 15) return '< 10.0% (Infrecuente)';
  if (diffAbs >= 10) return '10% – 15%';
  return '> 15% (Frecuente en población general)';
}

/**
 * Evaluates statistical significance and clinical rarity for a single index pair.
 */
export function calculatePairDiscrepancy(
  id1: string,
  score1: number,
  id2: string,
  score2: number,
  battery: BatteryType,
  sem1 = 4.24,
  sem2 = 4.24
): DiscrepancyResult {
  const diff = score1 - score2;
  const absDiff = Math.abs(diff);

  const key1 = `${id1}-${id2}`;
  const key2 = `${id2}-${id1}`;

  let cv05: number;
  let cv01: number;

  const table = battery === 'WISC-V' ? WISC_V_DISCREPANCY_CRITICAL : WAIS_IV_DISCREPANCY_CRITICAL;
  const entry = table[key1] || table[key2];

  if (entry) {
    cv05 = entry.cv05;
    cv01 = entry.cv01;
  } else {
    const seDiff = Math.sqrt(sem1 * sem1 + sem2 * sem2);
    cv05 = Math.round(1.96 * seDiff * 10) / 10;
    cv01 = Math.round(2.576 * seDiff * 10) / 10;
  }

  const isSignificant05 = absDiff >= cv05;
  const isSignificant01 = absDiff >= cv01;

  return {
    pair: [id1, id2],
    diff,
    isSignificant05,
    isSignificant01,
    baseRateDesc: estimateBaseRateDesc(absDiff),
  };
}

/**
 * Computes all canonical pairwise discrepancies for the available primary indices.
 */
export function calculateAllDiscrepancies(
  indices: Partial<Record<string, CompositeResult | null>>,
  battery: BatteryType
): DiscrepancyResult[] {
  const results: DiscrepancyResult[] = [];

  const indexKeys = battery === 'WISC-V'
    ? ['ICV', 'IVE', 'IRF', 'IMT', 'IVP']
    : ['ICV', 'IRP', 'IMT', 'IVP'];

  for (let i = 0; i < indexKeys.length; i++) {
    for (let j = i + 1; j < indexKeys.length; j++) {
      const id1 = indexKeys[i];
      const id2 = indexKeys[j];

      const res1 = indices[id1];
      const res2 = indices[id2];

      if (res1 && res2) {
        results.push(
          calculatePairDiscrepancy(
            id1,
            res1.compositeScore,
            id2,
            res2.compositeScore,
            battery
          )
        );
      }
    }
  }

  return results;
}
