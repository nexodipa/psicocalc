import {
  CompositeResult,
  DiscrepancyResult,
  StrengthWeaknessResult,
  SubtestId,
  WiscSubtestId,
} from '../types/psychometrics';
import {
  WISC_V_ANCILLARY_INDICES,
  WISC_V_CIT_META,
  WISC_V_PRIMARY_INDICES,
  wiscAncillarySumToComposite,
  wiscCitSumToComposite,
  wiscPrimarySumToComposite,
} from '../tables/wisc_v_norms';
import { getQualitativeCategory } from '../tables/qualitative';
import { compositeToPercentile } from './normalDist';
import { calculateBothConfidenceIntervals } from './confidence';
import { calculateAllDiscrepancies } from './discrepancy';
import { calculateStrengthsWeaknesses } from './scatter';

export interface WiscVCalculationResult {
  primaryIndices: Record<'ICV' | 'IVE' | 'IRF' | 'IMT' | 'IVP', CompositeResult | null>;
  cit: CompositeResult | null;
  ancillaryIndices: Record<'IAG' | 'ICC' | 'INV' | 'IRC' | 'IMTA', CompositeResult | null>;
  discrepancies: DiscrepancyResult[];
  strengthsWeaknesses: StrengthWeaknessResult[];
  isCompleteCit: boolean;
}

function isValidScore(val: unknown): val is number {
  return typeof val === 'number' && !isNaN(val) && Number.isInteger(val) && val >= 1 && val <= 19;
}

/**
 * Calculates all primary indices, CIT, ancillary indices, discrepancy matrix,
 * and ipsative scatter profile for WISC-V.
 */
export function calculateWiscV(
  subtests: Partial<Record<SubtestId, number>>
): WiscVCalculationResult {
  // 1. Primary Indices
  const primaryKeys: Array<'ICV' | 'IVE' | 'IRF' | 'IMT' | 'IVP'> = ['ICV', 'IVE', 'IRF', 'IMT', 'IVP'];
  const primaryIndices: Record<'ICV' | 'IVE' | 'IRF' | 'IMT' | 'IVP', CompositeResult | null> = {
    ICV: null,
    IVE: null,
    IRF: null,
    IMT: null,
    IVP: null,
  };

  for (const key of primaryKeys) {
    const meta = WISC_V_PRIMARY_INDICES[key];
    const [sub1, sub2] = meta.subtests;
    const score1 = subtests[sub1];
    const score2 = subtests[sub2];

    if (isValidScore(score1) && isValidScore(score2)) {
      const sumScaled = score1 + score2;
      const compositeScore = wiscPrimarySumToComposite(key, sumScaled);
      const percentile = compositeToPercentile(compositeScore);
      const { ci90, ci95 } = calculateBothConfidenceIntervals(compositeScore, meta.sem);
      const qualitative = getQualitativeCategory(compositeScore);

      primaryIndices[key] = {
        id: key,
        name: meta.name,
        sumScaled,
        compositeScore,
        percentile,
        ci90,
        ci95,
        qualitative,
      };
    }
  }

  // 2. CIT Calculation (7 core subtests: S, V, C, M, B, D, CL)
  const citCore: WiscSubtestId[] = ['S', 'V', 'C', 'M', 'B', 'D', 'CL'];
  let missingCore: WiscSubtestId[] = [];
  const validCoreScores: number[] = [];

  for (const id of citCore) {
    const score = subtests[id];
    if (isValidScore(score)) {
      validCoreScores.push(score);
    } else {
      missingCore.push(id);
    }
  }

  let finalCitSum: number | null = null;
  let isCompleteCit = false;

  if (missingCore.length === 0) {
    finalCitSum = validCoreScores.reduce((a, b) => a + b, 0);
    isCompleteCit = true;
  } else if (missingCore.length === 1) {
    // Check single substitution rule
    const missing = missingCore[0];
    let substituteScore: number | null = null;

    if (missing === 'S' || missing === 'V') {
      if (isValidScore(subtests['I'])) substituteScore = subtests['I']!;
      else if (isValidScore(subtests['CO'])) substituteScore = subtests['CO']!;
    } else if (missing === 'M' || missing === 'B') {
      if (isValidScore(subtests['A'])) substituteScore = subtests['A']!;
    } else if (missing === 'D') {
      if (isValidScore(subtests['LN'])) substituteScore = subtests['LN']!;
    } else if (missing === 'CL') {
      if (isValidScore(subtests['CA'])) substituteScore = subtests['CA']!;
    }
    // Note: Cubos (C) cannot be substituted in WISC-V CIT

    if (substituteScore !== null) {
      finalCitSum = validCoreScores.reduce((a, b) => a + b, 0) + substituteScore;
      isCompleteCit = true;
    }
  }

  let cit: CompositeResult | null = null;
  if (isCompleteCit && finalCitSum !== null) {
    const compositeScore = wiscCitSumToComposite(finalCitSum);
    const percentile = compositeToPercentile(compositeScore);
    const { ci90, ci95 } = calculateBothConfidenceIntervals(compositeScore, WISC_V_CIT_META.sem);
    const qualitative = getQualitativeCategory(compositeScore);

    cit = {
      id: WISC_V_CIT_META.id,
      name: WISC_V_CIT_META.name,
      sumScaled: finalCitSum,
      compositeScore,
      percentile,
      ci90,
      ci95,
      qualitative,
    };
  }

  // 3. Ancillary Indices
  const ancillaryIndices: Record<'IAG' | 'ICC' | 'INV' | 'IRC' | 'IMTA', CompositeResult | null> = {
    IAG: null,
    ICC: null,
    INV: null,
    IRC: null,
    IMTA: null,
  };

  // IAG (S, V, C, M, B)
  const iagSubtests = WISC_V_ANCILLARY_INDICES.IAG.subtests;
  const iagScores = iagSubtests.map((id) => subtests[id]);
  if (iagScores.every(isValidScore)) {
    const sum = iagScores.reduce((a, b) => a + (b as number), 0);
    const compositeScore = wiscAncillarySumToComposite('IAG', sum);
    const percentile = compositeToPercentile(compositeScore);
    const { ci90, ci95 } = calculateBothConfidenceIntervals(compositeScore, WISC_V_ANCILLARY_INDICES.IAG.sem);
    ancillaryIndices.IAG = {
      id: 'IAG',
      name: WISC_V_ANCILLARY_INDICES.IAG.name,
      sumScaled: sum,
      compositeScore,
      percentile,
      ci90,
      ci95,
      qualitative: getQualitativeCategory(compositeScore),
    };
  }

  // ICC (D, SD, CL, BS)
  const iccSubtests = WISC_V_ANCILLARY_INDICES.ICC.subtests;
  const iccScores = iccSubtests.map((id) => subtests[id]);
  if (iccScores.every(isValidScore)) {
    const sum = iccScores.reduce((a, b) => a + (b as number), 0);
    const compositeScore = wiscAncillarySumToComposite('ICC', sum);
    const percentile = compositeToPercentile(compositeScore);
    const { ci90, ci95 } = calculateBothConfidenceIntervals(compositeScore, WISC_V_ANCILLARY_INDICES.ICC.sem);
    ancillaryIndices.ICC = {
      id: 'ICC',
      name: WISC_V_ANCILLARY_INDICES.ICC.name,
      sumScaled: sum,
      compositeScore,
      percentile,
      ci90,
      ci95,
      qualitative: getQualitativeCategory(compositeScore),
    };
  }

  // INV (C, PV, M, B, SD, CL)
  const invSubtests = WISC_V_ANCILLARY_INDICES.INV.subtests;
  const invScores = invSubtests.map((id) => subtests[id]);
  if (invScores.every(isValidScore)) {
    const sum = invScores.reduce((a, b) => a + (b as number), 0);
    const compositeScore = wiscAncillarySumToComposite('INV', sum);
    const percentile = compositeToPercentile(compositeScore);
    const { ci90, ci95 } = calculateBothConfidenceIntervals(compositeScore, WISC_V_ANCILLARY_INDICES.INV.sem);
    ancillaryIndices.INV = {
      id: 'INV',
      name: WISC_V_ANCILLARY_INDICES.INV.name,
      sumScaled: sum,
      compositeScore,
      percentile,
      ci90,
      ci95,
      qualitative: getQualitativeCategory(compositeScore),
    };
  }

  // IRC (B, A)
  const ircSubtests = WISC_V_ANCILLARY_INDICES.IRC.subtests;
  const ircScores = ircSubtests.map((id) => subtests[id]);
  if (ircScores.every(isValidScore)) {
    const sum = ircScores.reduce((a, b) => a + (b as number), 0);
    const compositeScore = wiscAncillarySumToComposite('IRC', sum);
    const percentile = compositeToPercentile(compositeScore);
    const { ci90, ci95 } = calculateBothConfidenceIntervals(compositeScore, WISC_V_ANCILLARY_INDICES.IRC.sem);
    ancillaryIndices.IRC = {
      id: 'IRC',
      name: WISC_V_ANCILLARY_INDICES.IRC.name,
      sumScaled: sum,
      compositeScore,
      percentile,
      ci90,
      ci95,
      qualitative: getQualitativeCategory(compositeScore),
    };
  }

  // IMTA (D, LN)
  const imtaSubtests = WISC_V_ANCILLARY_INDICES.IMTA.subtests;
  const imtaScores = imtaSubtests.map((id) => subtests[id]);
  if (imtaScores.every(isValidScore)) {
    const sum = imtaScores.reduce((a, b) => a + (b as number), 0);
    const compositeScore = wiscAncillarySumToComposite('IMTA', sum);
    const percentile = compositeToPercentile(compositeScore);
    const { ci90, ci95 } = calculateBothConfidenceIntervals(compositeScore, WISC_V_ANCILLARY_INDICES.IMTA.sem);
    ancillaryIndices.IMTA = {
      id: 'IMTA',
      name: WISC_V_ANCILLARY_INDICES.IMTA.name,
      sumScaled: sum,
      compositeScore,
      percentile,
      ci90,
      ci95,
      qualitative: getQualitativeCategory(compositeScore),
    };
  }

  // 4. Discrepancies
  const discrepancies = calculateAllDiscrepancies(primaryIndices, 'WISC-V');

  // 5. Strengths and Weaknesses
  const strengthsWeaknesses = calculateStrengthsWeaknesses(subtests);

  return {
    primaryIndices,
    cit,
    ancillaryIndices,
    discrepancies,
    strengthsWeaknesses,
    isCompleteCit,
  };
}
