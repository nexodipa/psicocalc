/**
 * Normative parameters, skill mappings, and qualitative descriptors for:
 * - ABAS-3
 * - Vineland-3
 */

import {
  Abas3SkillAreaId,
  Abas3DomainId,
  Vineland3Descriptor,
} from '../types/adaptive';

// ============================================================================
// ABAS-3 Normative Data
// ============================================================================

export const ABAS3_DOMAIN_MAPPING: Record<Abas3DomainId, Abas3SkillAreaId[]> = {
  conceptual: ['COM', 'HAF', 'AD'],
  social: ['OC', 'SOC'],
  practical: ['UC', 'VH', 'SS', 'AC'],
};

export const ABAS3_AREA_NAMES: Record<Abas3SkillAreaId, string> = {
  COM: 'Comunicación',
  HAF: 'Habilidades Académicas Funcionales',
  AD: 'Autodirección',
  OC: 'Ocio',
  SOC: 'Social',
  UC: 'Utilización de la Comunidad',
  VH: 'Vida en el Hogar / Escuela',
  SS: 'Salud y Seguridad',
  AC: 'Autocuidado',
};

export function getAbas3Qualitative(composite: number): string {
  if (composite >= 130) return 'Muy Superior';
  if (composite >= 120) return 'Superior';
  if (composite >= 110) return 'Promedio Alto';
  if (composite >= 90) return 'Promedio';
  if (composite >= 80) return 'Promedio Bajo';
  if (composite >= 70) return 'Limítrofe';
  return 'Extremadamente Bajo';
}

// ============================================================================
// Vineland-3 Normative Descriptors
// ============================================================================

export function getVineland3VScaleDescriptor(vScore: number): Vineland3Descriptor {
  if (vScore >= 21) return 'High';
  if (vScore >= 18) return 'Moderately High';
  if (vScore >= 13) return 'Adequate';
  if (vScore >= 10) return 'Moderately Low';
  return 'Low';
}

export function getVineland3StandardDescriptor(standardScore: number): Vineland3Descriptor {
  if (standardScore >= 130) return 'High';
  if (standardScore >= 115) return 'Moderately High';
  if (standardScore >= 86) return 'Adequate';
  if (standardScore >= 71) return 'Moderately Low';
  return 'Low';
}
