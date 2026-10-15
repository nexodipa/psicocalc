/**
 * Centralized Test Registry for Psicocalc:
 * Extensible singleton catalog holding definitions for all 19 psychometric instruments
 * across the 6 clinical domains:
 *
 * 1. intelligence_aptitudes: WISC-V, WAIS-IV, Raven 2
 * 2. neuropsychology_attention: D2-R, NEUROPSI Breve, MMSE, MoCA
 * 3. personality_psychopathology: MMPI-3, PAI, MCMI-IV
 * 4. adaptive_behavior: ABAS-3, Vineland-3
 * 5. child_adolescent_emotional: SENA, CBCL, BYI-2, SDQ, PHQ-9, GAD-7
 * 6. projective_guides: HTP
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
    const q = query.trim().toLowerCase();
    if (!q) return this.getAll();
    return this.getAll().filter((inst) => {
      const { id, name, fullName, keywords, metadata } = {
        ...inst,
        ...inst.metadata,
      };
      return (
        id.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q) ||
        fullName.toLowerCase().includes(q) ||
        keywords.some((k) => k.toLowerCase().includes(q))
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
        const q = options.query.trim().toLowerCase();
        const matches =
          inst.metadata.id.toLowerCase().includes(q) ||
          inst.metadata.name.toLowerCase().includes(q) ||
          inst.metadata.fullName.toLowerCase().includes(q) ||
          inst.metadata.keywords.some((k) => k.toLowerCase().includes(q));
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
    // 1. Intelligence & Aptitudes
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
      validateInput: (input) => ({ isValid: true, errors: [] }),
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
      validateInput: (input) => ({ isValid: true, errors: [] }),
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
      isCompleted: (input, res) => (input.rawScore !== undefined && input.rawScore > 0) || input.abilityScore !== undefined,
    });

    // ------------------------------------------------------------------------
    // 2. Neuropsychology & Attention
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

    // ------------------------------------------------------------------------
    // 3. Personality & Psychopathology
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

    // ------------------------------------------------------------------------
    // 4. Adaptive Behavior & Development
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

    // ------------------------------------------------------------------------
    // 5. Child-Adolescent & Emotional
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

    // ------------------------------------------------------------------------
    // 6. Projective Guides
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
