/**
 * Interactive Clinical Case Simulator — Synthetic Vignettes Library
 *
 * Provides 6 comprehensive, multi-instrument synthetic clinical cases across the lifespan
 * for academic training, clinical reasoning practice, and platform demonstration.
 */

import { BatteryType, SubtestId } from '../types/psychometrics';
import { HTP_BENCHMARK_PROFILES } from '../types/htp';

export interface InstitutionalBranding {
  clinicName: string;
  clinicSubtitle: string;
  reportRef: string;
  city: string;
  specialistRole: string;
}

export const DEFAULT_INSTITUTIONAL_BRANDING: InstitutionalBranding = {
  clinicName: 'Centro de Neuropsicología y Psicología Clínica',
  clinicSubtitle: 'Encabezado de ejemplo para un documento de demostración',
  reportRef: 'EXP-2026-CLIN-01',
  city: 'Madrid',
  specialistRole: 'Psicólogo/a Colegiado/a Especialista',
};

export interface ClinicalVignette {
  id: string;
  code: string;
  title: string;
  patientSummary: string;
  ageGroupLabel: string;
  clinicalDomainBadge: string;
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
  primaryBattery: BatteryType;
  defaultInstrumentView: string;
  activeBatteryIds: string[];
  anamnesis: string;
  behavioralObservations: string;
  expectedDiagnosis: string;
  keyFindings: string[];
  therapeuticRecommendations: string[];
  demographics: {
    nameOrId: string;
    birthDate: string;
    testDate: string;
    examiner: string;
    reasonForEvaluation: string;
    isAnonymized: boolean;
    educationYears: number;
    schoolGrade?: string;
  };
  wiscSubtests?: Partial<Record<SubtestId, number>>;
  waisSubtests?: Partial<Record<SubtestId, number>>;
  testData: Record<string, any>;
}

export const CLINICAL_VIGNETTES: ClinicalVignette[] = [
  {
    id: 'caso_tdah_infantil',
    code: 'SIM-2026-01',
    title: 'Caso 1: TDAH Combinado y Disfunción Ejecutiva Escolar (9 años)',
    patientSummary: 'Mateo R. V. · 9 años · 4º Primaria',
    ageGroupLabel: 'Infantil (9 años)',
    clinicalDomainBadge: 'Neuropsicología & TDAH',
    difficulty: 'Básico',
    primaryBattery: 'WISC-V',
    defaultInstrumentView: 'wisc_v',
    activeBatteryIds: ['wisc_v', 'd2_r', 'sdq', 'sena', 'cumanes'],
    anamnesis:
      ' Escolar de 9 años derivado por orientación escolar por marcada distractibilidad, olvido frecuente de materiales, dificultad para terminar exámenes a tiempo a pesar de comprender los conceptos verbalmente, e interrupciones constantes en el aula desde 2º de Primaria.',
    behavioralObservations:
      'Colaborador y entusiasta al inicio, pero con inquietud motora progresiva en tareas de rastreo visual y retención de dígitos. Necesitó segmentación de consignas largas.',
    expectedDiagnosis:
      'Perfil neurocognitivo compatible con Trastorno por Déficit de Atención/Hiperactividad (TDAH) de presentación combinada (DSM-5-TR F90.2), con capacidad intelectual general preservada (CIT Promedio) pero caída significativa en Memoria de Trabajo (IMT), Velocidad de Procesamiento (IVP) y Atención Concentrada (D2-R CON bajo).',
    keyFindings: [
      'WISC-V: Discrepancia intra-individual marcada entre Comprensión Verbal/Razonamiento Fluido (escalares 12-13) y Memoria de Trabajo/Velocidad de Procesamiento (escalares 5-7).',
      'D2-R: Capacidad de Concentración (CON) en rango bajo con elevada tasa de errores de omisión (E1) por fluctuación atencional.',
      'SDQ y SENA: Elevación clínica en Hiperactividad-Impulsividad (T=74) y Problemas de Atención, sin patología afectiva mayor.',
      'CUMANES: Función ejecutiva e inhibición por debajo de su grupo normativo (Decatipo 3).',
    ],
    therapeuticRecommendations: [
      'Entrenamiento neuropsicológico en funciones ejecutivas, autoinstrucciones verbales y memoria de trabajo.',
      'Adaptaciones metodológicas no significativas en el aula: ubicación cercana al docente, fragmentación de exámenes largos y tiempo adicional (+25%).',
      'Pautas psicoeducativas parentales de economía de fichas y estructuración visual de rutinas en casa.',
    ],
    demographics: {
      nameOrId: 'Mateo Rivas Valdés (Caso Simulado 01)',
      birthDate: '2017-03-14',
      testDate: '2026-10-15',
      examiner: 'Dra. Elena Mendoza · Neuropsicóloga Clínica',
      reasonForEvaluation:
        'Sospecha de TDAH, inatención sostenida en el aula y discrepancia entre capacidad oral y rendimiento escrito',
      isAnonymized: false,
      educationYears: 4,
      schoolGrade: '4º Educación Primaria',
    },
    wiscSubtests: {
      S: 13, V: 12, C: 12, PV: 11, M: 12, B: 12, D: 6, SD: 7, CL: 5, BS: 6,
    },
    testData: {
      d2_r: {
        tr: 480,
        ta: 160,
        o: 25,
        c: 45,
        e1: 25,
        e2: 45,
      },
      sdq: {
        informant: 'parent',
        responses: {
          1: 2, 2: 2, 3: 0, 4: 2, 5: 1,
          6: 0, 7: 1, 8: 1, 9: 2, 10: 2,
          11: 2, 12: 0, 13: 0, 14: 2, 15: 2,
          16: 1, 17: 2, 18: 1, 19: 0, 20: 2,
          21: 0, 22: 0, 23: 0, 24: 0, 25: 0,
        },
      },
      sena: {
        tScores: {
          depresion: 48, ansiedad: 52, somatizacion: 46, aislamiento: 45,
          problemas_conducta: 58, hiperactividad: 76, rigidez: 54,
          autoestima: 46, integracion_social: 52, inc: 48, neg: 50, pos: 48,
        },
        criticalItems: { suicidalIdeation: false },
      },
      cumanes: {
        age: 9,
        totalRawScore: 52,
        domainScores: {
          lenguaje_comprensivo: 14,
          lenguaje_expresivo: 13,
          visopercepcion: 12,
          funcion_ejecutiva: 5,
          memoria_verbal_visual: 4,
          ritmo: 4,
        },
      },
    },
  },
  {
    id: 'caso_riesgo_adolescente',
    code: 'SIM-2026-02',
    title: 'Caso 2: Depresión Adolescente y Alerta Deontológica de Riesgo (15 años)',
    patientSummary: 'Sofía L. M. · 15 años · 4º ESO / Bachillerato',
    ageGroupLabel: 'Adolescente (15 años)',
    clinicalDomainBadge: 'Infanto-Juvenil & Riesgo Crítico',
    difficulty: 'Intermedio',
    primaryBattery: 'WISC-V',
    defaultInstrumentView: 'phq_9',
    activeBatteryIds: ['wisc_v', 'phq_9', 'gad_7', 'byi_2', 'maci_iv', 'cecad', 'htp'],
    anamnesis:
      'Adolescente de 15 años que acude acompañada por sus padres tras caída abrupta del rendimiento escolar en el último trimestre, aislamiento progresivo en su habitación, insomnio de conciliación, irritabilidad y comentarios de desesperanza e inutilidad personal.',
    behavioralObservations:
      'Tono de voz hipofónico, latencia de respuesta aumentada, postura encorvada y llanto contenido al abordar reactivos sobre autoimagen y futuro. Protocolo válido sin magnificación.',
    expectedDiagnosis:
      'Episodio Depresivo Mayor de severidad moderada-grave con ansiedad comórbida y Alerta Deontológica Prioritaria por ideación autolítica activa (PHQ-9 Ítem 9 ≥ 1, BYI-2 BDI-Y T=74, MACI-IV Escala FF=88 y GG=78).',
    keyFindings: [
      'PHQ-9: Puntuación total de 19/27 (Depresión Moderadamente Severa) con respuesta afirmativa en Ítem 9 (riesgo autolítico activo).',
      'BYI-2 y CECAD: Elevación clínica en Depresión (T=74) y Ansiedad (T=68), con Autoconcepto severamente disminuido (BSCI-Y T=34).',
      'MACI-IV: Prominencia en Afecto Depresivo (FF TB=88), Desvalorización de Sí Mismo (B TB=85) y presencia en Tendencia al Suicidio (GG TB=78).',
      'HTP: Indicadores cualitativos de retraimiento afectivo, trazo débil y emplazamiento inferior.',
    ],
    therapeuticRecommendations: [
      'Activación inmediata del protocolo de seguridad vital: entrevista clínica de letalidad, plan de seguridad escrito con la familia y supervisión continua.',
      'Interconsulta prioritaria con Psiquiatría Infanto-Juvenil para valoración psicofarmacológica.',
      'Psicoterapia Cognitivo-Conductual / DBT-A focalizada en regulación emocional, reestructuración cognitiva y activación conductual.',
    ],
    demographics: {
      nameOrId: 'Sofía Lozano Morales (Caso Simulado 02)',
      birthDate: '2011-05-20',
      testDate: '2026-10-18',
      examiner: 'Lic. Carlos Salgado · Psicólogo Clínico Especialista',
      reasonForEvaluation:
        'Aislamiento social, apatía, insomnio y verbalizaciones de desesperanza en el contexto escolar y familiar',
      isAnonymized: false,
      educationYears: 10,
      schoolGrade: '4º ESO',
    },
    wiscSubtests: {
      S: 12, V: 13, C: 11, PV: 11, M: 11, B: 11, D: 9, SD: 9, CL: 7, BS: 8,
    },
    testData: {
      phq_9: {
        responses: { 1: 3, 2: 3, 3: 2, 4: 3, 5: 2, 6: 3, 7: 2, 8: 1, 9: 2 },
      },
      gad_7: {
        responses: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 1, 6: 2, 7: 2 },
      },
      byi_2: {
        tScores: { BDI_Y: 74, BAI_Y: 68, BANI_Y: 54, BDBI_Y: 46, BSCI_Y: 34 },
        suicidalItemResponse: 2,
      },
      maci_iv: {
        omittedCount: 0,
        rawScores: { V: 0, W: 4 },
        baseRates: {
          X: 68, Y: 38, Z: 82,
          '1': 76, '2A': 80, '2B': 86, '8B': 78, '9': 74,
          A: 78, B: 85, E: 79,
          EE: 76, FF: 88, GG: 78,
        },
      },
      cecad: {
        tScores: { DEP: 75, ANS: 68, INU: 74, IRR: 62, PEN: 69, PSI: 64 },
      },
      htp: {
        ...JSON.parse(JSON.stringify(HTP_BENCHMARK_PROFILES.inhibited)),
        id: 'htp-sim-02',
      },
    },
  },
  {
    id: 'caso_tlp_depresion_adulto',
    code: 'SIM-2026-03',
    title: 'Caso 3: Desregulación Emocional Límite y Psicopatología Adulta (29 años)',
    patientSummary: 'Valeria G. T. · 29 años · Universitaria',
    ageGroupLabel: 'Adulto (29 años)',
    clinicalDomainBadge: 'Personalidad & Psicopatología',
    difficulty: 'Avanzado',
    primaryBattery: 'WAIS-IV',
    defaultInstrumentView: 'pai',
    activeBatteryIds: ['wais_iv', 'pai', 'mmpi_3', 'mcmi_iv', 'brief_a', 'staxi_2'],
    anamnesis:
      'Mujer de 29 años que consulta por inestabilidad afectiva crónica, relaciones interpersonales tormentosas con temor intenso al abandono, episodios de ira explosiva seguidos de culpa profunda y dificultades para mantener la organización en su empleo.',
    behavioralObservations:
      'Discurso fluido y articulado, afecto lábil con cambios rápidos entre ironía defensiva y angustia genuina. Completó las pruebas de personalidad con consistencia interna adecuada (ICN/VRIN dentro de norma).',
    expectedDiagnosis:
      'Estructura de personalidad con prominencia en Rasgos Límite (MCMI-IV Escala C TB=89; PAI Escala BOR T=81), acompañada de Disfunción Emocional Internalizante (MMPI-3 EID T=76, RCd T=75) y desregulación ejecutiva emocional en BRIEF-A (BRI T=72).',
    keyFindings: [
      'PAI: Elevación clínicamente significativa en Rasgos Límite (BOR T=81), Depresión (DEP T=76), Ansiedad (ANX T=72) y Estrés (STR T=70), con protocolo válido (ICN=54, INF=51).',
      'MCMI-IV: Prominencia patológica en escala C — Límite (TB=89) y presencia en 2B — Melancólico (TB=80) y A — Ansiedad (TB=78).',
      'MMPI-3: Elevación en EID (T=76), Desmoralización RCd (T=75) y Emociones Negativas Disfuncionales RC7 (T=73).',
      'STAXI-2 y BRIEF-A: Índice de Expresión de Ira elevado (IEI T=71) con bajo Control Interno (AC-I T=35) y alteración en Control Emocional ejecutivo (BRI T=72).',
    ],
    therapeuticRecommendations: [
      'Terapia Dialéctico-Conductual (DBT) estructurada: módulos de tolerancia al malestar, regulación emocional, eficacia interpersonal y mindfulness.',
      'Acuerdo terapéutico claro sobre manejo de crisis y prevención de conductas impulsivas.',
      'Revisión psiquiátrica para estabilización afectiva y manejo de sintomatología ansioso-depresiva.',
    ],
    demographics: {
      nameOrId: 'Valeria Guzmán Torres (Caso Simulado 03)',
      birthDate: '1997-02-11',
      testDate: '2026-10-20',
      examiner: 'Dr. Alejandro Vega · Psicólogo Especialista en Personalidad',
      reasonForEvaluation:
        'Evaluación diagnóstica diferencial de personalidad, labilidad emocional e impulsividad relacional',
      isAnonymized: false,
      educationYears: 16,
      schoolGrade: 'Grado Universitario',
    },
    waisSubtests: {
      WAIS_S: 12, WAIS_V: 13, WAIS_I: 12, WAIS_C: 11, WAIS_M: 11,
      WAIS_PV: 11, WAIS_D: 9, WAIS_A: 9, WAIS_BS: 9, WAIS_CN: 9,
    },
    testData: {
      pai: {
        omittedCount: 1,
        tScores: {
          ICN: 54, INF: 51, NIM: 66, PIM: 41,
          SOM: 58, ANX: 72, ARD: 66, DEP: 76, MAN: 54, PAR: 62,
          SCZ: 55, BOR: 81, ANT: 56, ALC: 54, DRG: 50,
          AGG: 68, SUI: 66, STR: 70, NON: 64, RXR: 44, DOM: 52, WRM: 46,
        },
      },
      mmpi_3: {
        omittedCount: 0,
        tScores: {
          CRIN: 52, VRIN: 50, TRIN: 53, F: 61, Fp: 52, L: 47, K: 44,
          EID: 76, THD: 52, BXD: 60,
          RCd: 75, RC1: 56, RC2: 70, RC4: 58, RC6: 56, RC7: 73, RC8: 52, RC9: 56, SUI: 65,
        },
      },
      mcmi_iv: {
        omittedCount: 0,
        rawScores: { V: 0, W: 5, X: 68 },
        baseRates: {
          Y: 40, Z: 78,
          '1': 45, '2A': 68, '2B': 80, '3': 72, '4B': 76, '8A': 75,
          S: 54, C: 89, P: 58,
          A: 78, D: 79, CC: 74,
        },
      },
      brief_a: {
        tScores: {
          NEG: 52, INF: 50, INC: 51,
          Inhibit: 66, Shift: 68, EmotionalControl: 76, SelfMonitor: 67,
          Initiate: 62, WorkingMemory: 60, PlanOrganize: 64, TaskMonitor: 61, OrgMaterials: 58,
          BRI: 72, MI: 62, GEC: 68,
        },
      },
      staxi_2: {
        tScores: {
          S_Ang: 64, S_Ang_F: 66, S_Ang_V: 62, S_Ang_P: 54,
          T_Ang: 72, T_Ang_T: 70, T_Ang_R: 71,
          AX_O: 68, AX_I: 66, AC_O: 38, AC_I: 35, IEI: 71,
        },
      },
    },
  },
  {
    id: 'caso_deterioro_neurogeriatrico',
    code: 'SIM-2026-04',
    title: 'Caso 4: Deterioro Neurocognitivo Amnésico en Adulto Mayor (74 años)',
    patientSummary: 'Don Ernesto P. C. · 74 años · Jubilado (6 años de escolaridad)',
    ageGroupLabel: 'Mayor (74 años)',
    clinicalDomainBadge: 'Neurogeriatría & Memoria',
    difficulty: 'Intermedio',
    primaryBattery: 'WAIS-IV',
    defaultInstrumentView: 'neuropsi_breve',
    activeBatteryIds: ['wais_iv', 'moca', 'mmse', 'neuropsi_breve'],
    anamnesis:
      'Varón de 74 años con 6 años de escolaridad formal que acude con su hija por olvidos progresivos de eventos recientes, repetición de preguntas en el mismo día, dificultad para recordar citas médicas y desorientación temporal ocasional de 14 meses de evolución.',
    behavioralObservations:
      'Trato afable y cooperador, anosognosia parcial respecto a sus fallos mnésicos (minimiza los olvidos atribuyéndolos a la edad). Necesitó claves semánticas en evocación diferida con escaso beneficio.',
    expectedDiagnosis:
      'Perfil neuropsicológico compatible con Trastorno Neurocognitivo Leve-Moderado de perfil predominantemente amnésico-ejecutivo, con puntuaciones bajo el punto de corte en MoCA (19/30 ajustado por escolaridad ≤ 12 años), MMSE (22/30 ajustado NORMACODEM) y NEUROPSI Breve (74/130).',
    keyFindings: [
      'MoCA: Puntuación directa 18/30 + 1 punto de ajuste por escolaridad (6 años ≤ 12) = 19/30 (< 26 alerta clínica), con caída severa en Recuerdo Diferido (1/5) y Función Ejecutiva/Visoespacial.',
      'MMSE: Puntuación directa 22/30 con compromiso en Memoria Diferida (1/3) y Orientación Temporal (3/5).',
      'NEUROPSI Breve: Puntuación total 74/130 (estrato 66-80 años, 5-9 años de escolaridad), mostrando alteración moderada en Memoria de Evocación y Fluidez Ejecutiva.',
      'WAIS-IV: Preservación relativa de Vocabulario e Información cristalizada frente a caída en Memoria de Trabajo y Velocidad de Procesamiento.',
    ],
    therapeuticRecommendations: [
      'Derivación a Neurología / Unidad de Memoria para estudio de neuroimagen estructural (RM cerebral) y analítica completa (B12, ácido fólico, perfil tiroideo).',
      'Programa de estimulación cognitiva estructurada centrado en estrategias compensatorias externas (calendarios visibles, pastillero semanal, rutinas fijas).',
      'Supervisión familiar en gestión financiera compleja y adherencia farmacológica.',
    ],
    demographics: {
      nameOrId: 'Ernesto Paredes Castillo (Caso Simulado 04)',
      birthDate: '1952-06-10',
      testDate: '2026-10-21',
      examiner: 'Dra. Patricia Ortega · Neuropsicóloga Psicogeriatra',
      reasonForEvaluation:
        'Quejas subjetivas y familiares de pérdida de memoria reciente y cribado de deterioro cognitivo',
      isAnonymized: false,
      educationYears: 6,
      schoolGrade: 'Educación Primaria (6 años)',
    },
    waisSubtests: {
      WAIS_S: 9, WAIS_V: 10, WAIS_I: 10, WAIS_C: 7, WAIS_M: 7,
      WAIS_PV: 7, WAIS_D: 6, WAIS_A: 7, WAIS_BS: 6, WAIS_CN: 5,
    },
    testData: {
      moca: {
        educationYears: 6,
        domains: {
          visuospatialExecutive: 3,
          naming: 2,
          attention: 4,
          language: 2,
          abstraction: 1,
          delayedRecall: 1,
          orientation: 5,
        },
      },
      mmse: {
        age: 74,
        educationYears: 6,
        rawScore: 22,
        domainScores: {
          orientationTime: 3,
          orientationSpace: 4,
          registration: 3,
          attentionCalculation: 3,
          recall: 1,
          languagePraxis: 8,
        },
      },
      neuropsi_breve: {
        age: 74,
        educationYears: 6,
        totalRawScore: 74,
        domainScores: {
          orientation: 4,
          attentionConcentration: 15,
          encodingMemory: 10,
          language: 18,
          readingWriting: 3,
          executiveFunctions: 11,
          recallMemory: 13,
        },
      },
    },
  },
  {
    id: 'caso_discapacidad_adaptativa',
    code: 'SIM-2026-05',
    title: 'Caso 5: Compromiso Intelectual y Déficit en Conducta Adaptativa (8 años)',
    patientSummary: 'Diego M. S. · 8 años · 2º Primaria (Apoyo Educativo)',
    ageGroupLabel: 'Infantil (8 años)',
    clinicalDomainBadge: 'Conducta Adaptativa & Desarrollo',
    difficulty: 'Intermedio',
    primaryBattery: 'WISC-V',
    defaultInstrumentView: 'abas_3',
    activeBatteryIds: ['wisc_v', 'abas_3', 'vineland_3', 'dp_3', 'toni_4'],
    anamnesis:
      'Niño de 8 años remitido para valoración psicopedagógica y de grado de autonomía funcional. Presenta retraso en la adquisición de lectoescritura y cálculo básico, así como necesidad de apoyo constante en autocuidado, manejo del tiempo y seguridad en entornos comunitarios.',
    behavioralObservations:
      'Actitud dócil y esforzada; requiere instrucciones concretas y demostraciones visuales. Se fatiga ante tareas de abstracción verbal, mejorando levemente con apoyo manipulativo.',
    expectedDiagnosis:
      'Perfil convergente con Discapacidad Intelectual Leve (DSM-5-TR F70), evidenciado por funcionamiento intelectual significativamente inferior al promedio (WISC-V CIT ≤ 70, TONI-4 CI No Verbal = 68) concurrente con déficit clínicamente significativo en conducta adaptativa en ABAS-3 (CAG = 62 ≤ 69), Vineland-3 (ABC = 63 ≤ 70) y DP-3 (IGD = 63).',
    keyFindings: [
      'WISC-V y TONI-4: Puntuaciones escalares homogéneamente bajas (4 a 5), situando el CIT y la inteligencia no verbal en rango Muy Bajo (Percentil 1-2).',
      'ABAS-3: Compuesto General de Adaptación (CAG = 62) bajo el punto de corte AAIDD/DSM-5 (≤ 69) en los dominios Conceptual, Social y Práctico.',
      'Vineland-3 y DP-3: Compuesto ABC = 63 e Índice General de Desarrollo IGD = 63, confirmando limitación funcional adaptativa.',
    ],
    therapeuticRecommendations: [
      'Adaptación Curricular Individualizada Significativa (ACIS) con apoyo de Pedagogía Terapéutica (PT) y Audición y Lenguaje (AL).',
      'Programa de habilitación en habilidades instrumentales de la vida diaria (autocuidado, vestido, rutinas de higiene y seguridad vial básica).',
      'Orientación a la familia sobre recursos de apoyo socioeducativo y fomento de la autodeterminación guiada.',
    ],
    demographics: {
      nameOrId: 'Diego Morales Serrano (Caso Simulado 05)',
      birthDate: '2018-07-04',
      testDate: '2026-10-22',
      examiner: 'Lic. Laura Domínguez · Psicóloga Educativa y del Desarrollo',
      reasonForEvaluation:
        'Valoración psicopedagógica integral de capacidad intelectual y funcionamiento adaptativo (criterios DSM-5 / AAIDD)',
      isAnonymized: false,
      educationYears: 2,
      schoolGrade: '2º Educación Primaria',
    },
    wiscSubtests: {
      S: 4, V: 4, C: 5, PV: 5, M: 4, B: 5, D: 4, SD: 5, CL: 5, BS: 5,
    },
    testData: {
      abas_3: {
        skillAreas: {
          COM: 4, HAF: 3, AD: 4,
          OC: 5, SOC: 4,
          UC: 3, VH: 4, SS: 3, AC: 4,
        },
      },
      vineland_3: {
        subdomains: {
          receptive: 8, expressive: 6, written: 7,
          personal: 11, domestic: 10, community: 9,
          interpersonal: 5, playLeisure: 5, coping: 6,
        },
      },
      dp_3: {
        scales: { MOT: 68, ADP: 64, SOC: 66, COG: 62, COM: 60 },
      },
      toni_4: {
        rawScore: 12,
        ageYears: 8,
        ageMonths: 3,
      },
    },
  },
  {
    id: 'caso_altas_capacidades',
    code: 'SIM-2026-06',
    title: 'Caso 6: Altas Capacidades Intelectuales y Disincronía Escolar (11 años)',
    patientSummary: 'Lucía V. R. · 11 años · 6º Primaria',
    ageGroupLabel: 'Infantil (11 años)',
    clinicalDomainBadge: 'Altas Capacidades & Vocacional',
    difficulty: 'Básico',
    primaryBattery: 'WISC-V',
    defaultInstrumentView: 'wisc_v',
    activeBatteryIds: ['wisc_v', 'raven_2', 'toni_4', 'bfq', 'iccp'],
    anamnesis:
      'Alumna de 11 años derivada para evaluación de enriquecimiento curricular por aprendizaje autodidacta precoz, vocabulario altamente sofisticado, aburrimiento en tareas repetitivas de aula y marcada curiosidad por ciencias experimentales y programación.',
    behavioralObservations:
      'Alta motivación de logro, rapidez en la deducción de reglas analógicas en matrices y excelente autorregulación atencional. Disfrutó especialmente los retos de razonamiento fluido.',
    expectedDiagnosis:
      'Sobredotación / Altas Capacidades Intelectuales con rendimiento Muy Superior (CIT ≥ 130, Percentil > 98), respaldado por puntuaciones superiores en Matrices Progresivas Raven 2 y TONI-4, junto con alta Apertura Mental (BFQ) y competencia prosocial preservada (ICCP).',
    keyFindings: [
      'WISC-V: Puntuaciones escalares entre 15 y 18 en Comprensión Verbal y Razonamiento Fluido (CIT en rango Muy Superior, > 99º percentil).',
      'Raven 2 y TONI-4: Aptitud analítica no verbal en rango Muy Superior (42/48 aciertos en Raven 2; 50/60 en TONI-4).',
      'BFQ e ICCP: Elevada Apertura Mental (AM T=66) y Tesón (T=62), con adecuada integración y empatía escolar (ICCP PRO T=58).',
    ],
    therapeuticRecommendations: [
      'Programa de enriquecimiento curricular de ampliación vertical y horizontal mediante aprendizaje basado en proyectos (STEAM).',
      'Evitar la repetición mecánica de ejercicios ya dominados en aula ordinaria (compactación curricular).',
      'Fomentar espacios de socialización con pares de intereses afines manteniendo el equilibrio socioemocional.',
    ],
    demographics: {
      nameOrId: 'Lucía Vargas Romero (Caso Simulado 06)',
      birthDate: '2015-01-25',
      testDate: '2026-10-23',
      examiner: 'Dr. Roberto Gómez · Unidad de Altas Capacidades',
      reasonForEvaluation:
        'Identificación de Altas Capacidades Intelectuales y orientación para enriquecimiento curricular',
      isAnonymized: false,
      educationYears: 6,
      schoolGrade: '6º Educación Primaria',
    },
    wiscSubtests: {
      S: 17, V: 18, C: 16, PV: 15, M: 17, B: 17, D: 15, SD: 15, CL: 13, BS: 14,
    },
    testData: {
      raven_2: {
        rawScore: 42,
        ageYears: 11,
        ageMonths: 8,
      },
      toni_4: {
        rawScore: 50,
        ageYears: 11,
        ageMonths: 8,
      },
      bfq: {
        tScores: {
          E: 58, A: 56, T: 62, EE: 57, AM: 66,
          Di: 59, Do: 55, Cp: 57, Co: 55, Es: 61, Pe: 63, Ce: 56, Ci: 58, Ac: 67, Ae: 64, D: 50,
        },
      },
      iccp: {
        tScores: { EMP: 58, RES: 60, SOC: 56, ASE: 57, PRO: 58 },
      },
    },
  },
];
