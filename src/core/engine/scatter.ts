import { StrengthWeaknessResult, SubtestId } from '../types/psychometrics';

export interface ScatterAnalysisResult {
  meanScore: number;
  totalSubtests: number;
  items: StrengthWeaknessResult[];
}

/**
 * Computes ipsative strengths and weaknesses by comparing each administered subtest
 * against the subject's overall mean scaled score.
 *
 * @param subtests Record of subtestId to scaled score [1..19]
 * @param criticalDifference Minimum absolute difference to be flagged as F or D (default 2.5)
 */
export function calculateStrengthsWeaknesses(
  subtests: Partial<Record<SubtestId, number>>,
  criticalDifference = 2.5
): StrengthWeaknessResult[] {
  const validEntries = Object.entries(subtests).filter(
    (entry): entry is [SubtestId, number] =>
      typeof entry[1] === 'number' && !isNaN(entry[1]) && entry[1] >= 1 && entry[1] <= 19
  );

  if (validEntries.length === 0) {
    return [];
  }

  const sum = validEntries.reduce((acc, [, score]) => acc + score, 0);
  const mean = sum / validEntries.length;

  return validEntries.map(([subtestId, score]) => {
    const diff = Math.round((score - mean) * 10) / 10;
    let classification: 'Fortaleza' | 'Debilidad' | 'Promedio' = 'Promedio';

    if (diff >= criticalDifference) {
      classification = 'Fortaleza';
    } else if (diff <= -criticalDifference) {
      classification = 'Debilidad';
    }

    return {
      subtestId,
      score,
      difference: diff,
      classification,
    };
  });
}
