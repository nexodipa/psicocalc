/**
 * Centralized Test Registry for Psicocalc:
 * Extensible singleton catalog holding definitions for all 35 psychometric instruments
 * across the 6 clinical domains:
 *
 * 1. intelligence_aptitudes (5): WISC-V, WAIS-IV, Raven 2, TONI-4, IPP-R
 * 2. neuropsychology_attention (8): D2-R, NEUROPSI Breve, MMSE, MoCA, BRIEF-A, CUMANES, NEURO-KID, LOLE
 * 3. personality_psychopathology (9): MMPI-3, PAI, MCMI-IV, MMPI-2-RF, MMPI-A-RF, BFQ, STAXI-2, LSB-50, MACI-IV
 * 4. adaptive_behavior (3): ABAS-3, Vineland-3, DP-3
 * 5. child_adolescent_emotional (9): SENA, CBCL, BYI-2, SDQ, PHQ-9, GAD-7, CECAD, IAC, ICCP
 * 6. projective_guides (1): HTP
 */

import {
  ClinicalDomainId,
  InstrumentDefinition,
  TargetAgeGroup,
} from './TestRegistryTypes';

// Calculators & Validators
import { calculateWiscV } from '../engine/wisc_v_calculator';
import { calculateWaisIV } from '../engine/wais_iv_calculator';
import {
  calculateSdq,
  calculatePhq9,
  calculateGad7,
  calculateMoca,
} from '../engine/clinicalCalculators';
import { generateHtpFullReport } from '../engine/htpNarrativeEngine';
import { INITIAL_HTP_RECORD } from '../types/htp';

import {
  calculateMmpi3,
  validateMmpi3,
  calculatePai,
  validatePai,
  calculateMcmi4,
  validateMcmi4,
} from '../engine/personalityCalculators';

import {
  calculateD2r,
  validateD2r,
  calculateNeuropsiBreve,
  validateNeuropsiBreve,
  calculateMmse,
  validateMmse,
} from '../engine/neuropsychCalculators';

import {
  calculateAbas3,
  validateAbas3,
  calculateVineland3,
  validateVineland3,
} from '../engine/adaptiveCalculators';

import {
  calculateSena,
  validateSena,
  calculateCbcl,
  validateCbcl,
  calculateByi2,
  validateByi2,
} from '../engine/childAdolescentCalculators';

import { calculateRaven2, validateRaven2 } from '../engine/raven2Calculator';

import {
  calculateToni4,
  validateToni4,
  calculateDp3,
  validateDp3,
  calculateNeuroChecklist,
  validateNeuroChecklist,
  calculateMaci4,
  validateMaci4,
  calculateExtendedLikert,
  validateExtendedLikert,
} from '../engine/extendedSuiteCalculators';

// Normalize string for accent-insensitive search
function normalizeSearchText(str: string): string {
  return str.toLowerCase();
}

export class TestRegistryClass {
  private instruments: Map<string, InstrumentDefinition> = new Map();

  constructor() {
    this.registerDefaultInstruments();
  }

  public register(instrument: InstrumentDefinition): void {
    this.instruments.set(instrument.metadata.id, instrument);
  }

  public get(id: string): InstrumentDefinition | undefined {
    return this.instruments.get(id);
  }

  public has(id: string): boolean {
    return this.instruments.has(id);
  }

  public getAll(): InstrumentDefinition[] {
    return Array.from(this.instruments.values());
  }

  public getByDomain(domain: ClinicalDomainId): InstrumentDefinition[] {
    return this.getAll().filter((inst) => inst.metadata.domain === domain);
  }

  public search(query: string): InstrumentDefinition[] {
    const q = normalizeSearchText(query.trim());
    if (!q) return this.getAll();
    return this.getAll().filter((inst) => {
      const { id, name, fullName, keywords } = inst.metadata;
      return (
        normalizeSearchText(id).includes(q) ||
        normalizeSearchText(name).includes(q) ||
        normalizeSearchText(fullName).includes(q) ||
        keywords.some((k) => normalizeSearchText(k).includes(q))
      );
    });
  }

  public filterByAge(ageYears: number): InstrumentDefinition[] {
    return this.getAll().filter((inst) => {
      const { minYears, maxYears } = inst.metadata.ageRange;
      return ageYears >= minYears && ageYears <= maxYears;
    });
  }

  public filter(options: {
    domain?: ClinicalDomainId | 'all';
    ageGroup?: TargetAgeGroup | 'all';
    ageYears?: number;
    query?: string;
  }): InstrumentDefinition[] {
    return this.getAll().filter((inst) => {
      if (options.domain && options.domain !== 'all' && inst.metadata.domain !== options.domain) {
        return false;
      }
      if (
        options.ageGroup &&
        options.ageGroup !== 'all' &&
        !inst.metadata.targetGroups.includes(options.ageGroup) &&
        !inst.metadata.targetGroups.includes('all')
      ) {
        return false;
      }
      if (options.ageYears !== undefined) {
        const { minYears, maxYears } = inst.metadata.ageRange;
        if (options.ageYears < minYears || options.ageYears > maxYears) {
          return false;
        }
      }
      if (options.query && options.query.trim().length > 0) {
        const q = normalizeSearchText(options.query.trim());
        const matches =
          normalizeSearchText(inst.metadata.id).includes(q) ||
          normalizeSearchText(inst.metadata.name).includes(q) ||
          normalizeSearchText(inst.metadata.fullName).includes(q) ||
          inst.metadata.keywords.some((k) => normalizeSearchText(k).includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }

  public reset(): void {
    this.instruments.clear();
    this.registerDefaultInstruments();
  }

  private registerDefaultInstruments(): void {
    // ------------------------------------------------------------------------
    // 1. Intelligence & Aptitudes (5 instruments)
    // ------------------------------------------------------------------------
    this.register({
      metadata: {
        id: 'wisc_v',
        name: 'WISC-V',
        fullName: 'Escala de Inteligencia de Wechsler para Niños - Quinta Edición',
        domain: 'intelligence_aptitudes',
        scoringType: 'standard_iq',
        ageRange: { minYears: 6, maxYears: 16.92, description: '6:0 a 16:11 años' },
        targetGroups: ['child', 'adolescent'],
        estimatedMinutes: 65,
        keywords: ['inteligencia', 'ci', 'wisc', 'cognitivo', 'escalares', 'aptitud'],
        normReference: 'Wechsler (2014, Pearson)',
      },
      createInitialState: () => ({ subtests: {}, rawInputs: {}, invalidSubtests: {} }),
      calculate: (input) => calculateWiscV(input.subtests || input),
      validateInput: () => ({ isValid: true, errors: [] }),
      isCompleted: (input) => Object.keys(input.subtests || input).length >= 7,
    });

    this.register({
      metadata: {
        id: 'wais_iv',
        name: 'WAIS-IV',
        fullName: 'Escala de Inteligencia de Wechsler para Adultos - Cuarta Edición',
        domain: 'intelligence_aptitudes',
        scoringType: 'standard_iq',
        ageRange: { minYears: 16, maxYears: 90.92, description: '16:0 a 90:11 años' },
        targetGroups: ['adolescent', 'adult', 'elderly'],
        estimatedMinutes: 75,
        keywords: ['inteligencia', 'ci', 'wais', 'adultos', 'cognitivo', 'escalares'],
        normReference: 'Wechsler (2008, Pearson)',
      },
      createInitialState: () => ({ subtests: {}, rawInputs: {}, invalidSubtests: {} }),
      calculate: (input) => calculateWaisIV(input.subtests || input),
      validateInput: () => ({ isValid: true, errors: [] }),
      isCompleted: (input) => Object.keys(input.subtests || input).length >= 10,
    });

    this.register({
      metadata: {
        id: 'raven_2',
        name: 'Raven 2',
        fullName: 'Matrices Progresivas de Raven - Segunda Edición',
        domain: 'intelligence_aptitudes',
        scoringType: 'standard_iq',
        ageRange: { minYears: 4, maxYears: 69.92, description: '4:0 a 69:11 años' },
        targetGroups: ['child', 'adolescent', 'adult'],
        estimatedMinutes: 45,
        keywords: ['raven', 'matrices', 'no verbal', 'razonamiento fluido', 'aptitud general'],
        normReference: 'Raven (Pearson Clinical)',
      },
      createInitialState: () => ({ rawScore: 0, ageYears: 10 }),
      calculate: (input) => calculateRaven2(input),
      validateInput: (input) => validateRaven2(input),
      isCompleted: (input) => (input.rawScore !== undefined && input.rawScore > 0) || input.abilityScore !== undefined,
    });

    this.register({
      metadata: {
        id: 'toni_4',
        name: 'TONI-4',
        fullName: 'Test de Inteligencia No Verbal - Cuarta Edición',
        domain: 'intelligence_aptitudes',
        scoringType: 'standard_iq',
        ageRange: { minYears: 6, maxYears: 89.92, description: '6:0 a 89:11 años' },
        targetGroups: ['child', 'adolescent', 'adult', 'elderly'],
        estimatedMinutes: 20,
        keywords: ['toni', 'inteligencia no verbal', 'matrices', 'abstracto', 'libre de lenguaje'],
        normReference: 'Brown, Sherbenou & Johnsen (TEA Ediciones / PRO-ED)',
      },
      createInitialState: () => ({ rawScore: 0, ageYears: 12, form: 'A' }),
      calculate: (input) => calculateToni4(input),
      validateInput: (input) => validateToni4(input),
      isCompleted: (input) => input.rawScore !== undefined && input.rawScore > 0,
      hasActiveAlert: (res) => ({
        active: Boolean(res && res.meetsClinicalCutoff),
        label: `Alerta en TONI-4: Cociente No Verbal bajo (CI = ${res?.indexScore} ≤ 70)`,
        severity: 'warning',
      }),
    });

    this.register({
      metadata: {
        id: 'ipp_r',
        name: 'IPP-R',
        fullName: 'Intereses y Preferencias Profesionales - Revisado',
        domain: 'intelligence_aptitudes',
        scoringType: 't_score',
        ageRange: { minYears: 13, maxYears: 65, description: '13 a 65 años' },
        targetGroups: ['adolescent', 'adult'],
        estimatedMinutes: 30,
        keywords: ['ipp-r', 'vocacional', 'orientacion profesional', 'intereses', 'carrera', 'aptitudes'],
        normReference: 'de la Cruz López (TEA Ediciones)',
      },
      createInitialState: () => ({ tScores: {}, rawScores: {} }),
      calculate: (input) => calculateExtendedLikert('ipp_r', input),
      validateInput: (input) => validateExtendedLikert('ipp_r', input),
      isCompleted: (input) => Object.keys(input.tScores || input.rawScores || {}).length > 0,
    });

    // ------------------------------------------------------------------------
    // 2. Neuropsychology & Attention (8 instruments)
    // ------------------------------------------------------------------------
    this.register({
      metadata: {
        id: 'd2_r',
        name: 'D2-R',
        fullName: 'Test de Atención d2-R (Revisado)',
        domain: 'neuropsychology_attention',
        scoringType: 'speed_accuracy',
        ageRange: { minYears: 9, maxYears: 99, description: '9 a 99 años' },
        targetGroups: ['child', 'adolescent', 'adult', 'elderly'],
        estimatedMinutes: 10,
        keywords: ['atencion', 'concentracion', 'velocidad', 'precision', 'd2', 'impulsividad'],
        normReference: 'Brickenkamp, Schmidt-Atzert & Liepmann (TEA / Hogrefe)',
      },
      createInitialState: () => ({ tr: 0, ta: 0, o: 0, c: 0 }),
      calculate: (input) => calculateD2r(input),
      validateInput: (input) => validateD2r(input),
      isCompleted: (input) => input.tr > 0,
      hasActiveAlert: (res) => ({
        active: Boolean(res && res.clinicalNote),
        label: res?.clinicalNote || 'Alerta de estilo impulsivo o baja concentración',
        severity: 'warning',
      }),
    });

    this.register({
      metadata: {
        id: 'neuropsi_breve',
        name: 'NEUROPSI Breve',
        fullName: 'Evaluación Neuropsicológica Breve en Español',
        domain: 'neuropsychology_attention',
        scoringType: 'screening_cutoff',
        ageRange: { minYears: 16, maxYears: 85, description: '16 a 85 años' },
        targetGroups: ['adult', 'elderly'],
        estimatedMinutes: 30,
        keywords: ['neuropsi', 'memoria', 'lenguaje', 'funciones ejecutivas', 'escolaridad', 'demencia'],
        requiresEducationAdjustment: true,
        normReference: 'Ostrosky-Solís, Ardila & Rosselli (Manual Moderno / UNAM)',
      },
      createInitialState: () => ({ totalRawScore: 0, age: 30, educationYears: 12 }),
      calculate: (input) => calculateNeuropsiBreve(input),
      validateInput: (input) => validateNeuropsiBreve(input),
      isCompleted: (input) => (input.totalRawScore !== undefined && input.totalRawScore > 0) || Boolean(input.domainScores),
      hasActiveAlert: (res) => ({
        active: Boolean(res && res.meetsClinicalCutoff),
        label: res?.alertMessage || 'Alerta de alteración neuropsicológica',
        severity: res?.classification === 'Alteración Severa' ? 'critical' : 'warning',
      }),
    });

    this.register({
      metadata: {
        id: 'mmse',
        name: 'MMSE',
        fullName: 'Mini-Mental State Examination (Folstein / NORMACODEM)',
        domain: 'neuropsychology_attention',
        scoringType: 'screening_cutoff',
        ageRange: { minYears: 18, maxYears: 99, description: '18 a 99 años' },
        targetGroups: ['adult', 'elderly'],
        estimatedMinutes: 10,
        keywords: ['mmse', 'mini mental', 'folstein', 'cribado', 'deterioro cognitivo', 'normacodem'],
        requiresEducationAdjustment: true,
        normReference: 'Folstein et al. / NORMACODEM (Blesa et al.)',
      },
      createInitialState: () => ({ rawScore: 0, age: 65, educationYears: 12 }),
      calculate: (input) => calculateMmse(input),
      validateInput: (input) => validateMmse(input),
      isCompleted: (input) => input.rawScore !== undefined && input.rawScore > 0,
      hasActiveAlert: (res) => ({
        active: Boolean(res && res.meetsClinicalCutoff),
        label: res?.alertMessage || 'Alerta de posible deterioro cognitivo (< 24)',
        severity: 'warning',
      }),
    });

    this.register({
      metadata: {
        id: 'moca',
        name: 'MoCA',
        fullName: 'Montreal Cognitive Assessment (Evaluación Cognitiva Montreal)',
        domain: 'neuropsychology_attention',
        scoringType: 'screening_cutoff',
        ageRange: { minYears: 18, maxYears: 99, description: '18 a 99 años' },
        targetGroups: ['adult', 'elderly'],
        estimatedMinutes: 12,
        keywords: ['moca', 'cognitivo', 'deterioro', 'screening', 'escolaridad'],
        requiresEducationAdjustment: true,
        normReference: 'Nasreddine et al. (2005)',
      },
      createInitialState: () => ({
        domains: {
          visuospatialExecutive: 0,
          naming: 0,
          attention: 0,
          language: 0,
          abstraction: 0,
          delayedRecall: 0,
          orientation: 0,
        },
        educationYears: 12,
      }),
      calculate: (input) => calculateMoca(input),
      validateInput: () => ({ isValid: true, errors: [] }),
      isCompleted: (input) =>
        Object.values((input.domains || {}) as Record<string, number>).reduce(
          (a: number, b: number) => a + (b || 0),
          0
        ) > 0,
      hasActiveAlert: (res) => ({
        active: Boolean(res && res.meetsClinicalCutoff),
        label: 'Alerta: Puntuación MoCA < 26 (posible Deterioro Cognitivo Leve)',
        severity: 'warning',
      }),
    });

    this.register({
      metadata: {
        id: 'brief_a',
        name: 'BRIEF-A',
        fullName: 'Evaluación Conductual de la Función Ejecutiva - Versión Adultos',
        domain: 'neuropsychology_attention',
        scoringType: 't_score',
        ageRange: { minYears: 18, maxYears: 90, description: '18 a 90 años' },
        targetGroups: ['adult', 'elderly'],
        estimatedMinutes: 15,
        keywords: ['brief-a', 'funciones ejecutivas', 'inhibicion', 'flexibilidad', 'metacognicion', 'planificacion'],
        normReference: 'Roth, Isquith & Gioia (PAR / TEA Ediciones)',
      },
      createInitialState: () => ({ tScores: {}, rawScores: {} }),
      calculate: (input) => calculateExtendedLikert('brief_a', input),
      validateInput: (input) => validateExtendedLikert('brief_a', input),
      isCompleted: (input) => Object.keys(input.tScores || input.rawScores || {}).length > 0,
      hasActiveAlert: (res) => ({
        active: Boolean(res && (res.suicideRiskAlert?.triggered || res.clinicalElevations?.length > 0)),
        label: res?.suicideRiskAlert?.message || 'Alerta de disfunción ejecutiva clínica (T ≥ 65)',
        severity: 'warning',
      }),
    });

    this.register({
      metadata: {
        id: 'cumanes',
        name: 'CUMANES',
        fullName: 'Cuestionario de Madurez Neuropsicológica Escolar',
        domain: 'neuropsychology_attention',
        scoringType: 'screening_cutoff',
        ageRange: { minYears: 7, maxYears: 11.92, description: '7:0 a 11:11 años' },
        targetGroups: ['child'],
        estimatedMinutes: 45,
        keywords: ['cumanes', 'madurez neuropsicologica', 'escolar', 'portellano', 'lenguaje', 'visopercepcion'],
        normReference: 'Portellano, Mateos & Martínez-Arias (TEA Ediciones)',
      },
      createInitialState: () => ({ totalRawScore: 0, domainScores: {}, age: 9 }),
      calculate: (input) => calculateNeuroChecklist('cumanes', input),
      validateInput: (input) => validateNeuroChecklist('cumanes', input),
      isCompleted: (input) =>
        (input.totalRawScore !== undefined && input.totalRawScore > 0) ||
        Object.values((input.domainScores || {}) as Record<string, number>).some((v) => v > 0),
      hasActiveAlert: (res) => ({
        active: Boolean(res && res.meetsClinicalCutoff),
        label: res?.alertMessage || 'Alerta de inmadurez neuropsicológica escolar en CUMANES',
        severity: 'warning',
      }),
    });

    this.register({
      metadata: {
        id: 'neuro_kid',
        name: 'NEURO-KID',
        fullName: 'Evaluación Neuropsicológica Rápida Infantil',
        domain: 'neuropsychology_attention',
        scoringType: 'screening_cutoff',
        ageRange: { minYears: 3, maxYears: 7.92, description: '3:0 a 7:11 años' },
        targetGroups: ['child'],
        estimatedMinutes: 20,
        keywords: ['neuro-kid', 'neuropsicologia infantil', 'portellano', 'desarrollo', 'cribado infantil'],
        normReference: 'Portellano, Mateos & Martínez-Arias (TEA Ediciones)',
      },
      createInitialState: () => ({ totalRawScore: 0, domainScores: {}, age: 5 }),
      calculate: (input) => calculateNeuroChecklist('neuro_kid', input),
      validateInput: (input) => validateNeuroChecklist('neuro_kid', input),
      isCompleted: (input) =>
        (input.totalRawScore !== undefined && input.totalRawScore > 0) ||
        Object.values((input.domainScores || {}) as Record<string, number>).some((v) => v > 0),
      hasActiveAlert: (res) => ({
        active: Boolean(res && res.meetsClinicalCutoff),
        label: res?.alertMessage || 'Alerta de riesgo neuropsicológico temprano en NEURO-KID',
        severity: 'warning',
      }),
    });

    this.register({
      metadata: {
        id: 'lole',
        name: 'LOLE',
        fullName: 'Del Lenguaje Oral al Lenguaje Escrito (Evaluación de Conciencia Fonológica)',
        domain: 'neuropsychology_attention',
        scoringType: 'screening_cutoff',
        ageRange: { minYears: 4, maxYears: 7.92, description: '4:0 a 7:11 años' },
        targetGroups: ['child'],
        estimatedMinutes: 25,
        keywords: ['lole', 'lenguaje oral', 'lenguaje escrito', 'conciencia fonologica', 'lectoescritura', 'rima'],
        normReference: 'Mayor Sánchez & Zubiauz (TEA / EOS)',
      },
      createInitialState: () => ({ totalRawScore: 0, domainScores: {}, age: 5 }),
      calculate: (input) => calculateNeuroChecklist('lole', input),
      validateInput: (input) => validateNeuroChecklist('lole', input),
      isCompleted: (input) =>
        (input.totalRawScore !== undefined && input.totalRawScore > 0) ||
        Object.values((input.domainScores || {}) as Record<string, number>).some((v) => v > 0),
      hasActiveAlert: (res) => ({
        active: Boolean(res && res.meetsClinicalCutoff),
        label: res?.alertMessage || 'Alerta de vulnerabilidad en conciencia fonológica y prelectura (LOLE)',
        severity: 'warning',
      }),
    });

    // ------------------------------------------------------------------------
    // 3. Personality & Psychopathology (9 instruments)
    // ------------------------------------------------------------------------
    this.register({
      metadata: {
        id: 'mmpi_3',
        name: 'MMPI-3',
        fullName: 'Inventario Multifásico de Personalidad de Minnesota - 3',
        domain: 'personality_psychopathology',
        scoringType: 't_score',
        ageRange: { minYears: 18, maxYears: 99, description: '18 a 99 años' },
        targetGroups: ['adult', 'elderly'],
        estimatedMinutes: 45,
        keywords: ['personalidad', 'psicopatologia', 'mmpi', 'validez', 'suicidio', 't-scores'],
        clinicalAlertsSupported: ['suicide_risk', 'invalid_protocol'],
        normReference: 'Ben-Porath & Tellegen (2020, Pearson / TEA)',
      },
      createInitialState: () => ({ tScores: {}, rawScores: {}, omittedCount: 0 }),
      calculate: (input) => calculateMmpi3(input),
      validateInput: (input) => validateMmpi3(input),
      isCompleted: (input) => Object.keys(input.tScores || input.rawScores || {}).length > 0,
      hasActiveAlert: (res) => ({
        active: Boolean(res && res.suicideRiskAlert.triggered),
        label: res?.suicideRiskAlert.message || 'Alerta de riesgo suicida en MMPI-3 (SUI)',
        severity: res?.suicideRiskAlert.level === 'CRITICAL_RISK' ? 'critical' : 'warning',
      }),
    });

    this.register({
      metadata: {
        id: 'pai',
        name: 'PAI',
        fullName: 'Inventario de Evaluación de la Personalidad (Personality Assessment Inventory)',
        domain: 'personality_psychopathology',
        scoringType: 't_score',
        ageRange: { minYears: 18, maxYears: 99, description: '18 a 99 años' },
        targetGroups: ['adult', 'elderly'],
        estimatedMinutes: 50,
        keywords: ['pai', 'personalidad', 'clinica', 'ansiedad', 'depresion', 'suicidio', 'drogas'],
        clinicalAlertsSupported: ['suicide_risk', 'substance_risk', 'invalid_protocol'],
        normReference: 'Morey (1991, 2007, PAR / TEA)',
      },
      createInitialState: () => ({ tScores: {}, rawScores: {}, omittedCount: 0 }),
      calculate: (input) => calculatePai(input),
      validateInput: (input) => validatePai(input),
      isCompleted: (input) => Object.keys(input.tScores || input.rawScores || {}).length > 0,
      hasActiveAlert: (res) => ({
        active: Boolean(res && res.suicideRiskAlert.triggered),
        label: res?.suicideRiskAlert.message || 'Alerta clínica en PAI',
        severity: res?.suicideRiskAlert.level === 'CRITICAL_RISK' ? 'critical' : 'warning',
      }),
    });

    this.register({
      metadata: {
        id: 'mcmi_iv',
        name: 'MCMI-IV',
        fullName: 'Inventario Clínico Multiaxial de Millon - IV',
        domain: 'personality_psychopathology',
        scoringType: 'base_rate',
        ageRange: { minYears: 18, maxYears: 99, description: '18 a 99 años' },
        targetGroups: ['adult', 'elderly'],
        estimatedMinutes: 35,
        keywords: ['millon', 'mcmi', 'tasa base', 'trastornos de personalidad', 'sindromes clinicos'],
        clinicalAlertsSupported: ['invalid_protocol', 'prominence_cutoff'],
        normReference: 'Millon, Grossman & Millon (2015, Pearson / TEA)',
      },
      createInitialState: () => ({ baseRates: {}, rawScores: {}, omittedCount: 0 }),
      calculate: (input) => calculateMcmi4(input),
      validateInput: (input) => validateMcmi4(input),
      isCompleted: (input) => Object.keys(input.baseRates || input.rawScores || {}).length > 0,
      hasActiveAlert: (res) => ({
        active: Boolean(res && res.prominenceScales.length > 0),
        label: res?.prominenceScales.length
          ? `Prominencia patológica (TB >= 85) en: ${res.prominenceScales.join(', ')}`
          : 'Alerta clínica de prominencia MCMI-IV',
        severity: 'critical',
      }),
    });

    this.register({
      metadata: {
        id: 'mmpi_rf',
        name: 'MMPI-2-RF',
        fullName: 'Inventario Multifásico de Personalidad de Minnesota-2 Reestructurado',
        domain: 'personality_psychopathology',
        scoringType: 't_score',
        ageRange: { minYears: 18, maxYears: 99, description: '18 a 99 años' },
        targetGroups: ['adult', 'elderly'],
        estimatedMinutes: 40,
        keywords: ['mmpi-2-rf', 'mmpi-rf', 'personalidad', 'reestructurado', 'clinicas', 'validez'],
        clinicalAlertsSupported: ['suicide_risk', 'invalid_protocol'],
        normReference: 'Ben-Porath & Tellegen (2008, University of Minnesota / TEA)',
      },
      createInitialState: () => ({ tScores: {}, rawScores: {}, omittedCount: 0 }),
      calculate: (input) => calculateExtendedLikert('mmpi_rf', input),
      validateInput: (input) => validateExtendedLikert('mmpi_rf', input),
      isCompleted: (input) => Object.keys(input.tScores || input.rawScores || {}).length > 0,
      hasActiveAlert: (res) => ({
        active: Boolean(res && (res.suicideRiskAlert?.triggered || res.clinicalElevations?.length > 0)),
        label: res?.suicideRiskAlert?.message || 'Elevaciones clínicas significativas en MMPI-2-RF',
        severity: res?.suicideRiskAlert?.triggered ? 'critical' : 'warning',
      }),
    });

    this.register({
      metadata: {
        id: 'mmpi_a_rf',
        name: 'MMPI-A-RF',
        fullName: 'Inventario Multifásico de Personalidad de Minnesota para Adolescentes Reestructurado',
        domain: 'personality_psychopathology',
        scoringType: 't_score',
        ageRange: { minYears: 14, maxYears: 18.92, description: '14:0 a 18:11 años' },
        targetGroups: ['adolescent'],
        estimatedMinutes: 35,
        keywords: ['mmpi-a-rf', 'adolescentes', 'personalidad', 'conducta juvenil', 'suicidio'],
        clinicalAlertsSupported: ['suicide_risk', 'invalid_protocol'],
        normReference: 'Archer, Handel, Ben-Porath & Tellegen (2016, Pearson / TEA)',
      },
      createInitialState: () => ({ tScores: {}, rawScores: {}, omittedCount: 0 }),
      calculate: (input) => calculateExtendedLikert('mmpi_a_rf', input),
      validateInput: (input) => validateExtendedLikert('mmpi_a_rf', input),
      isCompleted: (input) => Object.keys(input.tScores || input.rawScores || {}).length > 0,
      hasActiveAlert: (res) => ({
        active: Boolean(res && (res.suicideRiskAlert?.triggered || res.clinicalElevations?.length > 0)),
        label: res?.suicideRiskAlert?.message || 'Elevaciones clínicas en MMPI-A-RF',
        severity: res?.suicideRiskAlert?.triggered ? 'critical' : 'warning',
      }),
    });

    this.register({
      metadata: {
        id: 'bfq',
        name: 'BFQ',
        fullName: 'Cuestionario "Big Five" de Personalidad (Cinco Grandes Factores)',
        domain: 'personality_psychopathology',
        scoringType: 't_score',
        ageRange: { minYears: 16, maxYears: 99, description: '16 a 99 años' },
        targetGroups: ['adolescent', 'adult', 'elderly'],
        estimatedMinutes: 25,
        keywords: ['bfq', 'big five', 'cinco grandes', 'energia', 'afabilidad', 'teson', 'estabilidad emocional', 'apertura'],
        normReference: 'Caprara, Barbaranelli & Borgogni (TEA Ediciones)',
      },
      createInitialState: () => ({ tScores: {}, rawScores: {} }),
      calculate: (input) => calculateExtendedLikert('bfq', input),
      validateInput: (input) => validateExtendedLikert('bfq', input),
      isCompleted: (input) => Object.keys(input.tScores || input.rawScores || {}).length > 0,
    });

    this.register({
      metadata: {
        id: 'staxi_2',
        name: 'STAXI-2',
        fullName: 'Inventario de Expresión de Ira Estado-Rasgo - 2',
        domain: 'personality_psychopathology',
        scoringType: 't_score',
        ageRange: { minYears: 16, maxYears: 99, description: '16 a 99 años' },
        targetGroups: ['adolescent', 'adult', 'elderly'],
        estimatedMinutes: 15,
        keywords: ['staxi-2', 'ira', 'estado', 'rasgo', 'autocontrol', 'hostilidad', 'spielberger'],
        normReference: 'Spielberger / Miguel-Tobal et al. (TEA Ediciones)',
      },
      createInitialState: () => ({ tScores: {}, rawScores: {} }),
      calculate: (input) => calculateExtendedLikert('staxi_2', input),
      validateInput: (input) => validateExtendedLikert('staxi_2', input),
      isCompleted: (input) => Object.keys(input.tScores || input.rawScores || {}).length > 0,
      hasActiveAlert: (res) => ({
        active: Boolean(res && (res.suicideRiskAlert?.triggered || res.clinicalElevations?.length > 0)),
        label: res?.suicideRiskAlert?.message || 'Elevación significativa en Expresión de la Ira (STAXI-2)',
        severity: 'warning',
      }),
    });

    this.register({
      metadata: {
        id: 'lsb_50',
        name: 'LSB-50',
        fullName: 'Listado de Síntomas Breve (50 Ítems)',
        domain: 'personality_psychopathology',
        scoringType: 't_score',
        ageRange: { minYears: 18, maxYears: 99, description: '18 a 99 años' },
        targetGroups: ['adult', 'elderly'],
        estimatedMinutes: 12,
        keywords: ['lsb-50', 'sintomas', 'somatizacion', 'obsesion', 'ansiedad', 'hostilidad', 'irpsi', 'psicopatologia'],
        normReference: 'de Rivera & Abuín (TEA Ediciones)',
      },
      createInitialState: () => ({ tScores: {}, rawScores: {} }),
      calculate: (input) => calculateExtendedLikert('lsb_50', input),
      validateInput: (input) => validateExtendedLikert('lsb_50', input),
      isCompleted: (input) => Object.keys(input.tScores || input.rawScores || {}).length > 0,
      hasActiveAlert: (res) => ({
        active: Boolean(res && (res.suicideRiskAlert?.triggered || res.clinicalElevations?.length > 0)),
        label: res?.suicideRiskAlert?.message || 'Riesgo psicopatológico elevado en LSB-50',
        severity: res?.suicideRiskAlert?.triggered ? 'critical' : 'warning',
      }),
    });

    this.register({
      metadata: {
        id: 'maci_iv',
        name: 'MACI-IV',
        fullName: 'Inventario Clínico para Adolescentes de Millon',
        domain: 'personality_psychopathology',
        scoringType: 'base_rate',
        ageRange: { minYears: 13, maxYears: 19, description: '13 a 19 años' },
        targetGroups: ['adolescent'],
        estimatedMinutes: 30,
        keywords: ['maci', 'millon', 'adolescentes', 'tasa base', 'prototipos personalidad', 'sindromes'],
        clinicalAlertsSupported: ['suicide_risk', 'prominence_cutoff'],
        normReference: 'Millon (Pearson / TEA Ediciones)',
      },
      createInitialState: () => ({ baseRates: {}, rawScores: {}, omittedCount: 0 }),
      calculate: (input) => calculateMaci4(input),
      validateInput: (input) => validateMaci4(input),
      isCompleted: (input) => Object.keys(input.baseRates || input.rawScores || {}).length > 0,
      hasActiveAlert: (res) => ({
        active: Boolean(res && (res.suicideRiskAlert?.triggered || res.prominenceScales?.length > 0)),
        label:
          res?.suicideRiskAlert?.message ||
          `Prominencia clínica adolescente (TB ≥ 85) en: ${res?.prominenceScales?.join(', ')}`,
        severity: 'critical',
      }),
    });

    // ------------------------------------------------------------------------
    // 4. Adaptive Behavior & Development (3 instruments)
    // ------------------------------------------------------------------------
    this.register({
      metadata: {
        id: 'abas_3',
        name: 'ABAS-3',
        fullName: 'Sistema de Evaluación de la Conducta Adaptativa - Tercera Edición',
        domain: 'adaptive_behavior',
        scoringType: 'standard_iq',
        ageRange: { minYears: 0, maxYears: 89, description: '0 a 89 años' },
        targetGroups: ['child', 'adolescent', 'adult', 'elderly'],
        estimatedMinutes: 25,
        keywords: ['conducta adaptativa', 'abas', 'discapacidad intelectual', 'autonomia', 'habilidades funcionales'],
        normReference: 'Harrison & Oakland (WPS / TEA)',
      },
      createInitialState: () => ({ skillAreas: {} }),
      calculate: (input) => calculateAbas3(input),
      validateInput: (input) => validateAbas3(input),
      isCompleted: (input) => Object.keys(input.skillAreas || {}).length >= 9,
      hasActiveAlert: (res) => ({
        active: Boolean(res && res.meetsClinicalCutoff),
        label: res?.clinicalAlert || 'Alerta de déficit adaptativo significativo (CAG <= 69)',
        severity: 'critical',
      }),
    });

    this.register({
      metadata: {
        id: 'vineland_3',
        name: 'Vineland-3',
        fullName: 'Escalas de Conducta Adaptativa de Vineland - Tercera Edición',
        domain: 'adaptive_behavior',
        scoringType: 'standard_iq',
        ageRange: { minYears: 0, maxYears: 90, description: '0 a 90 años' },
        targetGroups: ['child', 'adolescent', 'adult', 'elderly'],
        estimatedMinutes: 30,
        keywords: ['vineland', 'conducta adaptativa', 'autismo', 'tea', 'comunicacion', 'vida diaria'],
        normReference: 'Sparrow, Cicchetti & Saulnier (Pearson Clinical)',
      },
      createInitialState: () => ({ subdomains: {} }),
      calculate: (input) => calculateVineland3(input),
      validateInput: (input) => validateVineland3(input),
      isCompleted: (input) => Object.keys(input.subdomains || {}).length >= 9,
      hasActiveAlert: (res) => ({
        active: Boolean(res && res.meetsClinicalCutoff),
        label: res?.clinicalAlert || 'Alerta de compromiso adaptativo global (ABC <= 70)',
        severity: 'critical',
      }),
    });

    this.register({
      metadata: {
        id: 'dp_3',
        name: 'DP-3',
        fullName: 'Perfil de Desarrollo - 3',
        domain: 'adaptive_behavior',
        scoringType: 'standard_iq',
        ageRange: { minYears: 0, maxYears: 12.92, description: '0:0 a 12:11 años' },
        targetGroups: ['child', 'adolescent'],
        estimatedMinutes: 20,
        keywords: ['dp-3', 'perfil de desarrollo', 'motricidad', 'socioemocional', 'cognicion', 'atencion temprana'],
        normReference: 'Alpern / Sánchez-Sánchez et al. (WPS / TEA Ediciones)',
      },
      createInitialState: () => ({ scales: {} }),
      calculate: (input) => calculateDp3(input),
      validateInput: (input) => validateDp3(input),
      isCompleted: (input) => Object.keys(input.scales || {}).length >= 5,
      hasActiveAlert: (res) => ({
        active: Boolean(res && res.meetsClinicalCutoff),
        label: res?.clinicalAlert || 'Alerta de retraso general del desarrollo en DP-3 (IGD ≤ 70)',
        severity: 'critical',
      }),
    });

    // ------------------------------------------------------------------------
    // 5. Child-Adolescent & Emotional (9 instruments)
    // ------------------------------------------------------------------------
    this.register({
      metadata: {
        id: 'sena',
        name: 'SENA',
        fullName: 'Sistema de Evaluación de Niños y Adolescentes',
        domain: 'child_adolescent_emotional',
        scoringType: 't_score',
        ageRange: { minYears: 3, maxYears: 18.92, description: '3:0 a 18:11 años' },
        targetGroups: ['child', 'adolescent'],
        estimatedMinutes: 30,
        keywords: ['sena', 'emocional', 'conductual', 'recursos personales', 'suicidio', 'infanto-juvenil'],
        clinicalAlertsSupported: ['suicide_risk', 'red_flags'],
        normReference: 'Fernández-Pinto et al. (TEA Ediciones)',
      },
      createInitialState: () => ({ tScores: {}, criticalItems: {} }),
      calculate: (input) => calculateSena(input),
      validateInput: (input) => validateSena(input),
      isCompleted: (input) => Object.keys(input.tScores || {}).length > 0,
      hasActiveAlert: (res) => ({
        active: Boolean(res && res.criticalAlerts.hasRedFlag),
        label: res?.criticalAlerts.bannerMessage || 'Alerta roja de ítem crítico en SENA',
        severity: 'critical',
      }),
    });

    this.register({
      metadata: {
        id: 'cbcl',
        name: 'CBCL',
        fullName: 'Child Behavior Checklist / 6-18 (ASEBA - Achenbach)',
        domain: 'child_adolescent_emotional',
        scoringType: 't_score',
        ageRange: { minYears: 1.5, maxYears: 18, description: '1:6 a 18:0 años' },
        targetGroups: ['child', 'adolescent'],
        estimatedMinutes: 25,
        keywords: ['cbcl', 'aseba', 'achenbach', 'internalizante', 'externalizante', 'sindromes'],
        normReference: 'Achenbach (ASEBA, University of Vermont)',
      },
      createInitialState: () => ({ tScores: {} }),
      calculate: (input) => calculateCbcl(input),
      validateInput: (input) => validateCbcl(input),
      isCompleted: (input) => Object.keys(input.tScores || {}).length > 0,
      hasActiveAlert: (res) => ({
        active: Boolean(res && res.clinicalElevations.length > 0),
        label: res?.clinicalElevations.length
          ? `Elevaciones clínicas en CBCL: ${res.clinicalElevations.join(', ')}`
          : 'Alerta clínica en CBCL',
        severity: 'warning',
      }),
    });

    this.register({
      metadata: {
        id: 'byi_2',
        name: 'BYI-2',
        fullName: 'Inventarios de Beck para Jóvenes - Segunda Edición',
        domain: 'child_adolescent_emotional',
        scoringType: 't_score',
        ageRange: { minYears: 7, maxYears: 18.92, description: '7:0 a 18:11 años' },
        targetGroups: ['child', 'adolescent'],
        estimatedMinutes: 20,
        keywords: ['byi', 'beck', 'depresion', 'ansiedad', 'ira', 'autoconcepto', 'suicidio'],
        clinicalAlertsSupported: ['suicide_risk'],
        normReference: 'Beck, Beck, Jolly & Steer (Pearson Clinical)',
      },
      createInitialState: () => ({ rawScores: {}, tScores: {}, suicidalItemResponse: 0 }),
      calculate: (input) => calculateByi2(input),
      validateInput: (input) => validateByi2(input),
      isCompleted: (input) => Object.keys(input.rawScores || input.tScores || {}).length > 0,
      hasActiveAlert: (res) => ({
        active: Boolean(res && res.suicideRiskAlert.triggered),
        label: res?.suicideRiskAlert.message || 'Alerta de ideación suicida en BYI-2',
        severity: 'critical',
      }),
    });

    this.register({
      metadata: {
        id: 'sdq',
        name: 'SDQ',
        fullName: 'Cuestionario de Cualidades y Dificultades (Strengths and Difficulties Questionnaire)',
        domain: 'child_adolescent_emotional',
        scoringType: 'screening_cutoff',
        ageRange: { minYears: 4, maxYears: 17.92, description: '4:0 a 17:11 años' },
        targetGroups: ['child', 'adolescent'],
        estimatedMinutes: 10,
        keywords: ['sdq', 'goodman', 'conducta', 'emocional', 'hiperactividad', 'prosocial'],
        normReference: 'Goodman (1997, 2001)',
      },
      createInitialState: () => ({ informant: 'parent', responses: {} }),
      calculate: (input) => calculateSdq(input),
      validateInput: () => ({ isValid: true, errors: [] }),
      isCompleted: (input) => Object.keys(input.responses || {}).length >= 15,
      hasActiveAlert: (res) => ({
        active: Boolean(res && res.totalDifficulties.classification === 'abnormal'),
        label: 'Alerta: Total de dificultades SDQ en rango clínico (anormal)',
        severity: 'warning',
      }),
    });

    this.register({
      metadata: {
        id: 'phq_9',
        name: 'PHQ-9',
        fullName: 'Cuestionario sobre la Salud del Paciente - 9 (Depresión)',
        domain: 'child_adolescent_emotional',
        scoringType: 'screening_cutoff',
        ageRange: { minYears: 12, maxYears: 99, description: '12 a 99 años' },
        targetGroups: ['adolescent', 'adult', 'elderly'],
        estimatedMinutes: 5,
        keywords: ['phq-9', 'depresion', 'suicidio', 'animo', 'screening'],
        clinicalAlertsSupported: ['suicide_risk'],
        normReference: 'Kroenke, Spitzer & Williams (2001)',
      },
      createInitialState: () => ({ responses: {} }),
      calculate: (input) => calculatePhq9(input.responses || input),
      validateInput: () => ({ isValid: true, errors: [] }),
      isCompleted: (input) => Object.keys(input.responses || input).length === 9,
      hasActiveAlert: (res) => ({
        active: Boolean(res && res.suicideAlert.isItem9AlertActive),
        label: res?.suicideAlert.alertMessage || 'Alerta Deontológica: Riesgo de ideación suicida (Ítem 9)',
        severity: 'critical',
      }),
    });

    this.register({
      metadata: {
        id: 'gad_7',
        name: 'GAD-7',
        fullName: 'Escala del Trastorno de Ansiedad Generalizada - 7',
        domain: 'child_adolescent_emotional',
        scoringType: 'screening_cutoff',
        ageRange: { minYears: 12, maxYears: 99, description: '12 a 99 años' },
        targetGroups: ['adolescent', 'adult', 'elderly'],
        estimatedMinutes: 5,
        keywords: ['gad-7', 'ansiedad', 'preocupacion', 'screening', 'panico'],
        normReference: 'Spitzer et al. (2006)',
      },
      createInitialState: () => ({ responses: {} }),
      calculate: (input) => calculateGad7(input.responses || input),
      validateInput: () => ({ isValid: true, errors: [] }),
      isCompleted: (input) => Object.keys(input.responses || input).length === 7,
      hasActiveAlert: (res) => ({
        active: Boolean(res && res.meetsClinicalCutoff),
        label: 'Alerta: Puntuación GAD-7 >= 10 (probable trastorno de ansiedad)',
        severity: 'warning',
      }),
    });

    this.register({
      metadata: {
        id: 'cecad',
        name: 'CECAD',
        fullName: 'Cuestionario Educativo-Clínico: Ansiedad y Depresión',
        domain: 'child_adolescent_emotional',
        scoringType: 't_score',
        ageRange: { minYears: 7, maxYears: 19, description: '7 a 19 años' },
        targetGroups: ['child', 'adolescent'],
        estimatedMinutes: 15,
        keywords: ['cecad', 'ansiedad', 'depresion', 'inutilidad', 'irritabilidad', 'pensamiento', 'escolar'],
        normReference: 'Lozano, García-Cueto & Lozano (TEA Ediciones)',
      },
      createInitialState: () => ({ tScores: {}, rawScores: {} }),
      calculate: (input) => calculateExtendedLikert('cecad', input),
      validateInput: (input) => validateExtendedLikert('cecad', input),
      isCompleted: (input) => Object.keys(input.tScores || input.rawScores || {}).length > 0,
      hasActiveAlert: (res) => ({
        active: Boolean(res && (res.suicideRiskAlert?.triggered || res.clinicalElevations?.length > 0)),
        label: res?.suicideRiskAlert?.message || 'Elevación clínica ansioso-depresiva en CECAD (T ≥ 65)',
        severity: res?.suicideRiskAlert?.triggered ? 'critical' : 'warning',
      }),
    });

    this.register({
      metadata: {
        id: 'iac',
        name: 'IAC',
        fullName: 'Inventario de Adaptación de Conducta',
        domain: 'child_adolescent_emotional',
        scoringType: 't_score',
        ageRange: { minYears: 12, maxYears: 18, description: '12 a 18 años' },
        targetGroups: ['adolescent'],
        estimatedMinutes: 15,
        keywords: ['iac', 'adaptacion', 'personal', 'familiar', 'escolar', 'social', 'adolescentes'],
        normReference: 'de la Cruz & Cordero (TEA Ediciones)',
      },
      createInitialState: () => ({ tScores: {}, rawScores: {} }),
      calculate: (input) => calculateExtendedLikert('iac', input),
      validateInput: (input) => validateExtendedLikert('iac', input),
      isCompleted: (input) => Object.keys(input.tScores || input.rawScores || {}).length > 0,
      hasActiveAlert: (res) => ({
        active: Boolean(res && res.clinicalElevations?.length > 0),
        label: 'Alerta de inadaptación conductual significativa en IAC (T ≤ 30)',
        severity: 'warning',
      }),
    });

    this.register({
      metadata: {
        id: 'iccp',
        name: 'ICCP',
        fullName: 'Inventario de Competencias y Conducta Psicosocial Infanto-Juvenil',
        domain: 'child_adolescent_emotional',
        scoringType: 't_score',
        ageRange: { minYears: 6, maxYears: 16, description: '6 a 16 años' },
        targetGroups: ['child', 'adolescent'],
        estimatedMinutes: 15,
        keywords: ['iccp', 'competencias', 'socioemocional', 'empatia', 'asertividad', 'conducta'],
        normReference: 'Baremos Clínicos y Educativos Estandarizados',
      },
      createInitialState: () => ({ tScores: {}, rawScores: {} }),
      calculate: (input) => calculateExtendedLikert('iccp', input),
      validateInput: (input) => validateExtendedLikert('iccp', input),
      isCompleted: (input) => Object.keys(input.tScores || input.rawScores || {}).length > 0,
      hasActiveAlert: (res) => ({
        active: Boolean(res && res.clinicalElevations?.length > 0),
        label: 'Alerta de vulnerabilidad psicosocial en ICCP',
        severity: 'warning',
      }),
    });

    // ------------------------------------------------------------------------
    // 6. Projective Guides (1 instrument)
    // ------------------------------------------------------------------------
    this.register({
      metadata: {
        id: 'htp',
        name: 'HTP',
        fullName: 'Test Proyectivo Casa - Árbol - Persona (House-Tree-Person)',
        domain: 'projective_guides',
        scoringType: 'qualitative',
        ageRange: { minYears: 4, maxYears: 99, description: '4 a 99 años' },
        targetGroups: ['child', 'adolescent', 'adult', 'elderly'],
        estimatedMinutes: 30,
        keywords: ['htp', 'proyectivo', 'casa', 'arbol', 'persona', 'dibujo', 'cualitativo'],
        normReference: 'Buck (1948) / Hammer (1958)',
      },
      createInitialState: () => ({ ...INITIAL_HTP_RECORD }),
      calculate: (input) => generateHtpFullReport(input),
      validateInput: () => ({ isValid: true, errors: [] }),
      isCompleted: (input) =>
        Boolean(
          input.generalClinicalNotes?.trim() ||
            input.house?.observations?.trim() ||
            input.tree?.observations?.trim() ||
            input.person?.observations?.trim()
        ),
    });
  }
}

export const TestRegistry = new TestRegistryClass();
