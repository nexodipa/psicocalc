/**
 * Type definitions for Child-Adolescent & Emotional instruments:
 * - SENA (Sistema de Evaluación de Niños y Adolescentes)
 * - CBCL / ASEBA (Child Behavior Checklist)
 * - BYI-2 (Beck Youth Inventories - 2nd Ed)
 */

import { ProtocolValidityResult } from '../registry/TestRegistryTypes';

// ============================================================================
// SENA Types
// ============================================================================

export type SenaScaleDirection = 'problem' | 'protective' | 'control';

export interface SenaScaleScore {
  scaleId: string;
  name: string;
  tScore: number;
  percentile: number;
  direction: SenaScaleDirection;
  classification: 'Normal' | 'En Riesgo' | 'Clínico' | 'Clínico / Muy Bajo' | 'En Riesgo / Bajo';
  isAlert: boolean;
}

export interface SenaInput {
  tScores: Record<string, number>;
  criticalItems?: {
    suicidalIdeation?: boolean;
    selfHarm?: boolean;
    abuse?: boolean;
    psychosis?: boolean;
  };
}

export interface SenaCalculationResult {
  scales: Record<string, SenaScaleScore>;
  globalIndices: {
    ipe?: number; // Problemas Emocionales
    ipc?: number; // Problemas Conductuales
    igp?: number; // Índice Global de Problemas
    irp?: number; // Recursos Personales
  };
  validity: ProtocolValidityResult;
  criticalAlerts: {
    hasRedFlag: boolean;
    flags: string[];
    bannerMessage?: string;
  };
  summary: string;
}

// ============================================================================
// CBCL (ASEBA) Types
// ============================================================================

export type CbclScaleCategory = 'broadband' | 'syndrome' | 'dsm';

export interface CbclScaleScore {
  scaleId: string;
  name: string;
  tScore: number;
  percentile: number;
  category: CbclScaleCategory;
  classification: 'Normal' | 'Limítrofe' | 'Clínico';
}

export interface CbclInput {
  tScores: Record<string, number>;
}

export interface CbclCalculationResult {
  broadband: Record<string, CbclScaleScore>;
  syndromes: Record<string, CbclScaleScore>;
  dsmScales: Record<string, CbclScaleScore>;
  clinicalElevations: string[];
  borderlineElevations: string[];
  summary: string;
}

// ============================================================================
// BYI-2 Types
// ============================================================================

export type Byi2InventoryId = 'BDI_Y' | 'BAI_Y' | 'BANI_Y' | 'BDBI_Y' | 'BSCI_Y';

export interface Byi2ScaleScore {
  inventoryId: Byi2InventoryId;
  name: string;
  rawScore?: number;
  tScore: number;
  percentile: number;
  severity: string;
}

export interface Byi2Input {
  rawScores?: Partial<Record<Byi2InventoryId, number>>;
  tScores?: Partial<Record<Byi2InventoryId, number>>;
  suicidalItemResponse?: number; // Item 9 in BDI-Y (0..3)
}

export interface Byi2CalculationResult {
  inventories: Record<Byi2InventoryId, Byi2ScaleScore>;
  suicideRiskAlert: {
    triggered: boolean;
    message: string;
  };
  summary: string;
}
