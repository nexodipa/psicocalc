import {
  CompositeResult,
  DiscrepancyResult,
  StrengthWeaknessResult,
  SubtestId,
} from '../types/psychometrics';
import {
  CanonicalWaisSubtestId,
  normalizeWaisSubtestKey,
  WAIS_IV_ANCILLARY_INDICES,
  WAIS_IV_CIT_META,
  WAIS_IV_PRIMARY_INDICES,
  wais2SubtestSumToComposite,
  wais3SubtestSumToComposite,
  waisAncillarySumToComposite,
  waisCitSumToComposite,
} from '../tables/wais_iv_norms';
import { getQualitativeCategory } from '../tables/qualitative';
import { compositeToPercentile } from './normalDist';
import { calculateBothConfidenceIntervals } from './confidence';
import { calculateAllDiscrepancies } from './discrepancy';
import { calculateStrengthsWeaknesses } from './scatter';

export interface WaisIVCalculationResult {
  primaryIndices: Record<'ICV' | 'IRP' | 'IMT' | 'IVP', CompositeResult | null>;
  cit: CompositeResult | null;
  ancillaryIndices: Record<'IAG' | 'ICC', CompositeResult | null>;
  discrepancies: DiscrepancyResult[];
  strengthsWeaknesses: StrengthWeaknessResult[];
  isCompleteCit: boolean;
}

function isValidScore(val: unknown): val is number {
  return typeof val === 'number' && !isNaN(val) && Number.isInteger(val) && val >= 1 && val <= 19;
}

/**
 * Calculates all primary indices, CIT, ancillary indices, discrepancy matrix,
 * and ipsative scatter profile for WAIS-IV.
 */
export function calculateWaisIV(
  subtests: Partial<Record<SubtestId, number>>
): WaisIVCalculationResult {
  // Normalize input keys to canonical WAIS keys (e.g. BD -> WAIS_C, SI -> WAIS_S)
  const normalized: Partial<Record<CanonicalWaisSubtestId, number>> = {};
  for (const [key, val] of Object.entries(subtests)) {
    const canonicalKey = normalizeWaisSubtestKey(key);
    if (canonicalKey && isValidScore(val)) {
      normalized[canonicalKey] = val;
    }
  }

  // 1. Primary Indices
  const primaryIndices: Record<'ICV' | 'IRP' | 'IMT' | 'IVP', CompositeResult | null> = {
    ICV: null,
    IRP: null,
    IMT: null,
    IVP: null,
  };

  // ICV (3 subtests: S, V, I; optional substitution: CO)
  const icvCore: CanonicalWaisSubtestId[] = ['WAIS_S', 'WAIS_V', 'WAIS_I'];
  const icvScores = icvCore.map((k) => normalized[k]);
  let icvSum: number | null = null;
  if (icvScores.every(isValidScore)) {
    icvSum = icvScores.reduce((a, b) => a + (b as number), 0);
  } else {
    // Check single substitution
    const validScores = icvScores.filter(isValidScore);
    if (validScores.length === 2 && isValidScore(normalized['WAIS_CO'])) {
      icvSum = validScores.reduce((a, b) => a + b, 0) + normalized['WAIS_CO']!;
    }
  }
  if (icvSum !== null) {
    const compositeScore = wais3SubtestSumToComposite('ICV', icvSum);
    const percentile = compositeToPercentile(compositeScore);
    const { ci90, ci95 } = calculateBothConfidenceIntervals(compositeScore, WAIS_IV_PRIMARY_INDICES.ICV.sem);
    primaryIndices.ICV = {
      id: 'ICV',
      name: WAIS_IV_PRIMARY_INDICES.ICV.name,
      sumScaled: icvSum,
      compositeScore,
      percentile,
      ci90,
      ci95,
      qualitative: getQualitativeCategory(compositeScore),
    };
  }

  // IRP (3 subtests: C, M, PV; optional substitution: B or FI)
  const irpCore: CanonicalWaisSubtestId[] = ['WAIS_C', 'WAIS_M', 'WAIS_PV'];
  const irpScores = irpCore.map((k) => normalized[k]);
  let irpSum: number | null = null;
  if (irpScores.every(isValidScore)) {
    irpSum = irpScores.reduce((a, b) => a + (b as number), 0);
  } else {
    const validScores = irpScores.filter(isValidScore);
    if (validScores.length === 2) {
      if (isValidScore(normalized['WAIS_B'])) {
        irpSum = validScores.reduce((a, b) => a + b, 0) + normalized['WAIS_B']!;
      } else if (isValidScore(normalized['WAIS_FI'])) {
        irpSum = validScores.reduce((a, b) => a + b, 0) + normalized['WAIS_FI']!;
      }
    }
  }
  if (irpSum !== null) {
    const compositeScore = wais3SubtestSumToComposite('IRP', irpSum);
    const percentile = compositeToPercentile(compositeScore);
    const { ci90, ci95 } = calculateBothConfidenceIntervals(compositeScore, WAIS_IV_PRIMARY_INDICES.IRP.sem);
    primaryIndices.IRP = {
      id: 'IRP',
      name: WAIS_IV_PRIMARY_INDICES.IRP.name,
      sumScaled: irpSum,
      compositeScore,
      percentile,
      ci90,
      ci95,
      qualitative: getQualitativeCategory(compositeScore),
    };
  }

  // IMT (2 subtests: D, A; optional substitution: LN)
  const imtCore: CanonicalWaisSubtestId[] = ['WAIS_D', 'WAIS_A'];
  const imtScores = imtCore.map((k) => normalized[k]);
  let imtSum: number | null = null;
  if (imtScores.every(isValidScore)) {
    imtSum = imtScores.reduce((a, b) => a + (b as number), 0);
  } else {
    const validScores = imtScores.filter(isValidScore);
    if (validScores.length === 1 && isValidScore(normalized['WAIS_LN'])) {
      imtSum = validScores[0] + normalized['WAIS_LN']!;
    }
  }
  if (imtSum !== null) {
    const compositeScore = wais2SubtestSumToComposite('IMT', imtSum);
    const percentile = compositeToPercentile(compositeScore);
    const { ci90, ci95 } = calculateBothConfidenceIntervals(compositeScore, WAIS_IV_PRIMARY_INDICES.IMT.sem);
    primaryIndices.IMT = {
      id: 'IMT',
      name: WAIS_IV_PRIMARY_INDICES.IMT.name,
      sumScaled: imtSum,
      compositeScore,
      percentile,
      ci90,
      ci95,
      qualitative: getQualitativeCategory(compositeScore),
    };
  }

  // IVP (2 subtests: BS, CN; optional substitution: CA)
  const ivpCore: CanonicalWaisSubtestId[] = ['WAIS_BS', 'WAIS_CN'];
  const ivpScores = ivpCore.map((k) => normalized[k]);
  let ivpSum: number | null = null;
  if (ivpScores.every(isValidScore)) {
    ivpSum = ivpScores.reduce((a, b) => a + (b as number), 0);
  } else {
    const validScores = ivpScores.filter(isValidScore);
    if (validScores.length === 1 && isValidScore(normalized['WAIS_CA'])) {
      ivpSum = validScores[0] + normalized['WAIS_CA']!;
    }
  }
  if (ivpSum !== null) {
    const compositeScore = wais2SubtestSumToComposite('IVP', ivpSum);
    const percentile = compositeToPercentile(compositeScore);
    const { ci90, ci95 } = calculateBothConfidenceIntervals(compositeScore, WAIS_IV_PRIMARY_INDICES.IVP.sem);
    primaryIndices.IVP = {
      id: 'IVP',
      name: WAIS_IV_PRIMARY_INDICES.IVP.name,
      sumScaled: ivpSum,
      compositeScore,
      percentile,
      ci90,
      ci95,
      qualitative: getQualitativeCategory(compositeScore),
    };
  }

  // 2. CIT Calculation (10 core subtests)
  const citCore = WAIS_IV_CIT_META.coreSubtests;
  const missingCore: CanonicalWaisSubtestId[] = [];
  const validCoreScores: number[] = [];

  for (const id of citCore) {
    const score = normalized[id];
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
    const missing = missingCore[0];
    let substituteScore: number | null = null;

    if (missing === 'WAIS_S' || missing === 'WAIS_V' || missing === 'WAIS_I') {
      if (isValidScore(normalized['WAIS_CO'])) substituteScore = normalized['WAIS_CO']!;
    } else if (missing === 'WAIS_C' || missing === 'WAIS_M' || missing === 'WAIS_PV') {
      if (isValidScore(normalized['WAIS_B'])) substituteScore = normalized['WAIS_B']!;
      else if (isValidScore(normalized['WAIS_FI'])) substituteScore = normalized['WAIS_FI']!;
    } else if (missing === 'WAIS_D' || missing === 'WAIS_A') {
      if (isValidScore(normalized['WAIS_LN'])) substituteScore = normalized['WAIS_LN']!;
    } else if (missing === 'WAIS_BS' || missing === 'WAIS_CN') {
      if (isValidScore(normalized['WAIS_CA'])) substituteScore = normalized['WAIS_CA']!;
    }

    if (substituteScore !== null) {
      finalCitSum = validCoreScores.reduce((a, b) => a + b, 0) + substituteScore;
      isCompleteCit = true;
    }
  }

  let cit: CompositeResult | null = null;
  if (isCompleteCit && finalCitSum !== null) {
    const compositeScore = waisCitSumToComposite(finalCitSum);
    const percentile = compositeToPercentile(compositeScore);
    const { ci90, ci95 } = calculateBothConfidenceIntervals(compositeScore, WAIS_IV_CIT_META.sem);
    const qualitative = getQualitativeCategory(compositeScore);

    cit = {
      id: WAIS_IV_CIT_META.id,
      name: WAIS_IV_CIT_META.name,
      sumScaled: finalCitSum,
      compositeScore,
      percentile,
      ci90,
      ci95,
      qualitative,
    };
  }

  // 3. Ancillary Indices (IAG & ICC)
  const ancillaryIndices: Record<'IAG' | 'ICC', CompositeResult | null> = {
    IAG: null,
    ICC: null,
  };

  // IAG (WAIS_S, WAIS_V, WAIS_I, WAIS_C, WAIS_M, WAIS_PV)
  const iagSubtests = WAIS_IV_ANCILLARY_INDICES.IAG.subtests;
  const iagScores = iagSubtests.map((id) => normalized[id]);
  if (iagScores.every(isValidScore)) {
    const sum = iagScores.reduce((a, b) => a + (b as number), 0);
    const compositeScore = waisAncillarySumToComposite('IAG', sum);
    const percentile = compositeToPercentile(compositeScore);
    const { ci90, ci95 } = calculateBothConfidenceIntervals(compositeScore, WAIS_IV_ANCILLARY_INDICES.IAG.sem);
    ancillaryIndices.IAG = {
      id: 'IAG',
      name: WAIS_IV_ANCILLARY_INDICES.IAG.name,
      sumScaled: sum,
      compositeScore,
      percentile,
      ci90,
      ci95,
      qualitative: getQualitativeCategory(compositeScore),
    };
  }

  // ICC (WAIS_D, WAIS_A, WAIS_BS, WAIS_CN)
  const iccSubtests = WAIS_IV_ANCILLARY_INDICES.ICC.subtests;
  const iccScores = iccSubtests.map((id) => normalized[id]);
  if (iccScores.every(isValidScore)) {
    const sum = iccScores.reduce((a, b) => a + (b as number), 0);
    const compositeScore = waisAncillarySumToComposite('ICC', sum);
    const percentile = compositeToPercentile(compositeScore);
    const { ci90, ci95 } = calculateBothConfidenceIntervals(compositeScore, WAIS_IV_ANCILLARY_INDICES.ICC.sem);
    ancillaryIndices.ICC = {
      id: 'ICC',
      name: WAIS_IV_ANCILLARY_INDICES.ICC.name,
      sumScaled: sum,
      compositeScore,
      percentile,
      ci90,
      ci95,
      qualitative: getQualitativeCategory(compositeScore),
    };
  }

  // 4. Discrepancies
  const discrepancies = calculateAllDiscrepancies(primaryIndices, 'WAIS-IV');

  // 5. Strengths and Weaknesses
  const strengthsWeaknesses = calculateStrengthsWeaknesses(normalized as Partial<Record<SubtestId, number>>);

  return {
    primaryIndices,
    cit,
    ancillaryIndices,
    discrepancies,
    strengthsWeaknesses,
    isCompleteCit,
  };
}
