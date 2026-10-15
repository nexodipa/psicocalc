/**
 * Type definitions for Adaptive Behavior instruments:
 * - ABAS-3 (Adaptive Behavior Assessment System - 3rd Ed)
 * - Vineland-3 (Vineland Adaptive Behavior Scales - 3rd Ed)
 */

// ============================================================================
// ABAS-3 Types
// ============================================================================

export type Abas3SkillAreaId =
  | 'COM'  // Comunicación
  | 'HAF'  // Habilidades Académicas Funcionales
  | 'AD'   // Autodirección
  | 'OC'   // Ocio
  | 'SOC'  // Social
  | 'UC'   // Utilización de la Comunidad
  | 'VH'   // Vida en el Hogar / Escuela
  | 'SS'   // Salud y Seguridad
  | 'AC';  // Autocuidado

export type Abas3DomainId = 'conceptual' | 'social' | 'practical';

export interface Abas3DomainScore {
  domainId: Abas3DomainId;
  rawSum: number;
  compositeScore: number;
  percentile: number;
  ci95: [number, number];
  qualitative: string;
}

export interface Abas3Input {
  skillAreas: Partial<Record<Abas3SkillAreaId, number>>; // Scaled scores 1..19
  workSkillArea?: number; // Optional work area for adults
}

export interface Abas3CalculationResult {
  skillAreas: Record<Abas3SkillAreaId, number>;
  domains: Record<Abas3DomainId, Abas3DomainScore>;
  gac: {
    rawSum: number;
    compositeScore: number;
    percentile: number;
    ci95: [number, number];
    qualitative: string;
  };
  strengthsWeaknesses: {
    areaId: Abas3SkillAreaId;
    score: number;
    meanDiff: number;
    classification: 'Fortaleza relativa' | 'Debilidad relativa' | 'Promedio';
  }[];
  meetsClinicalCutoff: boolean; // GAC <= 69
  clinicalAlert?: string;
}

// ============================================================================
// Vineland-3 Types
// ============================================================================

export type Vineland3SubdomainId =
  | 'receptive'
  | 'expressive'
  | 'written'
  | 'personal'
  | 'domestic'
  | 'community'
  | 'interpersonal'
  | 'playLeisure'
  | 'coping';

export type Vineland3DomainId = 'communication' | 'dailyLivingSkills' | 'socialization';

export type Vineland3Descriptor =
  | 'High'
  | 'Moderately High'
  | 'Adequate'
  | 'Moderately Low'
  | 'Low';

export interface Vineland3SubdomainScore {
  subdomainId: Vineland3SubdomainId;
  vScore: number; // 1..24
  descriptor: Vineland3Descriptor;
}

export interface Vineland3DomainScore {
  domainId: Vineland3DomainId;
  rawSum: number;
  standardScore: number; // 20..140
  percentile: number;
  descriptor: Vineland3Descriptor;
}

export interface Vineland3Input {
  subdomains: Partial<Record<Vineland3SubdomainId, number>>; // v-scores 1..24
}

export interface Vineland3CalculationResult {
  subdomains: Record<Vineland3SubdomainId, Vineland3SubdomainScore>;
  domains: Record<Vineland3DomainId, Vineland3DomainScore>;
  abc: {
    sumOfDomains: number;
    standardScore: number; // 20..140
    percentile: number;
    ci95: [number, number];
    descriptor: Vineland3Descriptor;
  };
  meetsClinicalCutoff: boolean; // ABC <= 70
  clinicalAlert?: string;
}
