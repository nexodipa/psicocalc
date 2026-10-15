/**
 * Pure deterministic psychometric calculators for Adaptive Behavior:
 * - ABAS-3 (Harrison & Oakland)
 * - Vineland-3 (Sparrow, Cicchetti & Saulnier)
 *
 * All functions have ZERO UI dependencies.
 */

import { compositeToPercentile, normalCdf } from './normalDist';
import {
  Abas3Input,
  Abas3CalculationResult,
  Abas3SkillAreaId,
  Abas3DomainId,
  Abas3DomainScore,
  Vineland3Input,
  Vineland3CalculationResult,
  Vineland3SubdomainId,
  Vineland3DomainId,
  Vineland3SubdomainScore,
  Vineland3DomainScore,
} from '../types/adaptive';

import {
  ABAS3_DOMAIN_MAPPING,
  getAbas3Qualitative,
  getVineland3VScaleDescriptor,
  getVineland3StandardDescriptor,
} from '../tables/adaptiveNorms';

// ============================================================================
// ABAS-3 Calculator
// ============================================================================

export function validateAbas3(input: Abas3Input): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const areas = input.skillAreas || {};

  Object.entries(areas).forEach(([k, v]) => {
    if (v !== undefined && (v < 1 || v > 19)) {
      errors.push(`Área ${k} (${v}) fuera de rango válido de puntuación escalar (1-19)`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function calculateAbas3(input: Abas3Input): Abas3CalculationResult {
  const skillAreas = input.skillAreas || {};
  const validatedAreas: Record<Abas3SkillAreaId, number> = {
    COM: skillAreas.COM ?? 10,
    HAF: skillAreas.HAF ?? 10,
    AD: skillAreas.AD ?? 10,
    OC: skillAreas.OC ?? 10,
    SOC: skillAreas.SOC ?? 10,
    UC: skillAreas.UC ?? 10,
    VH: skillAreas.VH ?? 10,
    SS: skillAreas.SS ?? 10,
    AC: skillAreas.AC ?? 10,
  };

  // 1. Calculate domain sums and composite scores
  const conceptualSum = validatedAreas.COM + validatedAreas.HAF + validatedAreas.AD;
  const socialSum = validatedAreas.OC + validatedAreas.SOC;
  const practicalSum =
    validatedAreas.UC + validatedAreas.VH + validatedAreas.SS + validatedAreas.AC;
  const totalSum = conceptualSum + socialSum + practicalSum;

  const conceptualComposite = Math.max(
    40,
    Math.min(160, Math.round(100 + (conceptualSum - 30) * 2.0))
  );
  const socialComposite = Math.max(
    40,
    Math.min(160, Math.round(100 + (socialSum - 20) * 2.7))
  );
  const practicalComposite = Math.max(
    40,
    Math.min(160, Math.round(100 + (practicalSum - 40) * 1.5))
  );
  const gacComposite = Math.max(
    40,
    Math.min(160, Math.round(100 + (totalSum - 90) * 0.67))
  );

  const getPercentile = (comp: number): number => {
    const z = (comp - 100) / 15;
    const p = Math.round(normalCdf(z) * 1000) / 10;
    if (p < 1) return Math.max(0.1, Math.round(p * 10) / 10);
    return Math.round(p);
  };

  const domains: Record<Abas3DomainId, Abas3DomainScore> = {
    conceptual: {
      domainId: 'conceptual',
      rawSum: conceptualSum,
      compositeScore: conceptualComposite,
      percentile: getPercentile(conceptualComposite),
      ci95: [conceptualComposite - 6, conceptualComposite + 6],
      qualitative: getAbas3Qualitative(conceptualComposite),
    },
    social: {
      domainId: 'social',
      rawSum: socialSum,
      compositeScore: socialComposite,
      percentile: getPercentile(socialComposite),
      ci95: [socialComposite - 7, socialComposite + 7],
      qualitative: getAbas3Qualitative(socialComposite),
    },
    practical: {
      domainId: 'practical',
      rawSum: practicalSum,
      compositeScore: practicalComposite,
      percentile: getPercentile(practicalComposite),
      ci95: [practicalComposite - 6, practicalComposite + 6],
      qualitative: getAbas3Qualitative(practicalComposite),
    },
  };

  // 2. Ipsative Scatter (Strengths & Weaknesses against patient's mean area score)
  const meanAreaScore = totalSum / 9;
  const strengthsWeaknesses = (Object.keys(validatedAreas) as Abas3SkillAreaId[]).map((id) => {
    const score = validatedAreas[id];
    const diff = Math.round((score - meanAreaScore) * 10) / 10;
    let classification: 'Fortaleza relativa' | 'Debilidad relativa' | 'Promedio' = 'Promedio';
    if (diff >= 2.5) classification = 'Fortaleza relativa';
    else if (diff <= -2.5) classification = 'Debilidad relativa';
    return {
      areaId: id,
      score,
      meanDiff: diff,
      classification,
    };
  });

  const meetsClinicalCutoff = gacComposite <= 69;
  let clinicalAlert: string | undefined;
  if (meetsClinicalCutoff) {
    clinicalAlert = `Déficit adaptativo clínico significativo detectado (CAG = ${gacComposite} <= 69, criterio diagnóstico DI / AAIDD)`;
  }

  return {
    skillAreas: validatedAreas,
    domains,
    gac: {
      rawSum: totalSum,
      compositeScore: gacComposite,
      percentile: getPercentile(gacComposite),
      ci95: [gacComposite - 5, gacComposite + 5],
      qualitative: getAbas3Qualitative(gacComposite),
    },
    strengthsWeaknesses,
    meetsClinicalCutoff,
    clinicalAlert,
  };
}

// ============================================================================
// Vineland-3 Calculator
// ============================================================================

export function validateVineland3(input: Vineland3Input): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const subs = input.subdomains || {};

  Object.entries(subs).forEach(([k, v]) => {
    if (v !== undefined && (v < 1 || v > 24)) {
      errors.push(`Subdominio ${k} (${v}) fuera de rango válido de puntuación v-scale (1-24)`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function calculateVineland3(input: Vineland3Input): Vineland3CalculationResult {
  const subs = input.subdomains || {};
  const vScores: Record<Vineland3SubdomainId, number> = {
    receptive: subs.receptive ?? 15,
    expressive: subs.expressive ?? 15,
    written: subs.written ?? 15,
    personal: subs.personal ?? 15,
    domestic: subs.domestic ?? 15,
    community: subs.community ?? 15,
    interpersonal: subs.interpersonal ?? 15,
    playLeisure: subs.playLeisure ?? 15,
    coping: subs.coping ?? 15,
  };

  const subdomainsRecord: Record<Vineland3SubdomainId, Vineland3SubdomainScore> = {
    receptive: { subdomainId: 'receptive', vScore: vScores.receptive, descriptor: getVineland3VScaleDescriptor(vScores.receptive) },
    expressive: { subdomainId: 'expressive', vScore: vScores.expressive, descriptor: getVineland3VScaleDescriptor(vScores.expressive) },
    written: { subdomainId: 'written', vScore: vScores.written, descriptor: getVineland3VScaleDescriptor(vScores.written) },
    personal: { subdomainId: 'personal', vScore: vScores.personal, descriptor: getVineland3VScaleDescriptor(vScores.personal) },
    domestic: { subdomainId: 'domestic', vScore: vScores.domestic, descriptor: getVineland3VScaleDescriptor(vScores.domestic) },
    community: { subdomainId: 'community', vScore: vScores.community, descriptor: getVineland3VScaleDescriptor(vScores.community) },
    interpersonal: { subdomainId: 'interpersonal', vScore: vScores.interpersonal, descriptor: getVineland3VScaleDescriptor(vScores.interpersonal) },
    playLeisure: { subdomainId: 'playLeisure', vScore: vScores.playLeisure, descriptor: getVineland3VScaleDescriptor(vScores.playLeisure) },
    coping: { subdomainId: 'coping', vScore: vScores.coping, descriptor: getVineland3VScaleDescriptor(vScores.coping) },
  };

  // Domain raw sums
  const comSum = vScores.receptive + vScores.expressive + vScores.written;
  const dlsSum = vScores.personal + vScores.domestic + vScores.community;
  const socSum = vScores.interpersonal + vScores.playLeisure + vScores.coping;

  // Domain standard scores (Mean=100, SD=15, 3 subdomains of Mean=15, Sum=45)
  // For Com: 100 + (comSum - 45) * 1.5
  // For Dls: 100 + (dlsSum - 45) * 1.467
  // For Soc: 100 + (socSum - 45) * 1.45
  const comStandard = Math.max(20, Math.min(140, Math.round(100 + (comSum - 45) * 1.5)));
  const dlsStandard = Math.max(20, Math.min(140, Math.round(100 + (dlsSum - 45) * 1.467)));
  const socStandard = Math.max(20, Math.min(140, Math.round(100 + (socSum - 45) * 1.45)));

  const getPercentile = (standard: number): number => {
    const z = (standard - 100) / 15;
    const p = Math.round(normalCdf(z) * 1000) / 10;
    if (p < 1) return Math.max(0.1, Math.round(p * 10) / 10);
    return Math.round(p);
  };

  const domains: Record<Vineland3DomainId, Vineland3DomainScore> = {
    communication: {
      domainId: 'communication',
      rawSum: comSum,
      standardScore: comStandard,
      percentile: getPercentile(comStandard),
      descriptor: getVineland3StandardDescriptor(comStandard),
    },
    dailyLivingSkills: {
      domainId: 'dailyLivingSkills',
      rawSum: dlsSum,
      standardScore: dlsStandard,
      percentile: getPercentile(dlsStandard),
      descriptor: getVineland3StandardDescriptor(dlsStandard),
    },
    socialization: {
      domainId: 'socialization',
      rawSum: socSum,
      standardScore: socStandard,
      percentile: getPercentile(socStandard),
      descriptor: getVineland3StandardDescriptor(socStandard),
    },
  };

  // ABC standard score
  const sumOfDomains = comStandard + dlsStandard + socStandard;
  const abcStandard = Math.max(
    20,
    Math.min(140, Math.round(100 + (sumOfDomains - 300) * 0.375))
  );

  const meetsClinicalCutoff = abcStandard <= 70;
  let clinicalAlert: string | undefined;
  if (meetsClinicalCutoff) {
    clinicalAlert = `Compromiso adaptativo global significativo (Compuesto ABC = ${abcStandard} <= 70, descriptor 'Low')`;
  }

  return {
    subdomains: subdomainsRecord,
    domains,
    abc: {
      sumOfDomains,
      standardScore: abcStandard,
      percentile: getPercentile(abcStandard),
      ci95: [abcStandard - 5, abcStandard + 5],
      descriptor: getVineland3StandardDescriptor(abcStandard),
    },
    meetsClinicalCutoff,
    clinicalAlert,
  };
}
