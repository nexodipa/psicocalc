/**
 * Normative tables, cutoff thresholds, items, and qualitative classifications
 * for clinical instruments: SDQ, PHQ-9, GAD-7, and MoCA.
 */

import {
  SdqInformantType,
  SdqSubscaleId,
  SdqBandClassification,
  SdqItemDefinition,
  Phq9ItemDefinition,
  Phq9SeverityBand,
  Gad7ItemDefinition,
  Gad7SeverityBand,
  MocaDomainId,
  MocaDomainDefinition,
  MocaClassification
} from '../types/clinical';

// ============================================================================
// SDQ (Strengths and Difficulties Questionnaire) Norms & Items
// ============================================================================

export const SDQ_REVERSED_ITEMS: readonly number[] = [7, 11, 14, 21, 25] as const;

export const SDQ_ITEMS: readonly SdqItemDefinition[] = [
  {
    itemNumber: 1,
    text: 'Es considerado/a con los sentimientos de los demás',
    subscale: 'prosocial',
    isReversed: false
  },
  {
    itemNumber: 2,
    text: 'Es inquieto/a, hiperactivo/a, no puede permanecer quieto/a por mucho tiempo',
    subscale: 'hyperactivity',
    isReversed: false
  },
  {
    itemNumber: 3,
    text: 'Se queja a menudo de dolores de cabeza, de estómago o de náuseas',
    subscale: 'emotional',
    isReversed: false
  },
  {
    itemNumber: 4,
    text: 'Comparte fácilmente con otros niños y niñas (comida, juguetes, lápices, etc.)',
    subscale: 'prosocial',
    isReversed: false
  },
  {
    itemNumber: 5,
    text: 'A menudo tiene rabietas o mal genio',
    subscale: 'conduct',
    isReversed: false
  },
  {
    itemNumber: 6,
    text: 'Es más bien solitario/a, tiende a jugar solo/a o estar solo/a',
    subscale: 'peer',
    isReversed: false
  },
  {
    itemNumber: 7,
    text: 'Por lo general es obediente, suele hacer lo que le piden los adultos',
    subscale: 'conduct',
    isReversed: true
  },
  {
    itemNumber: 8,
    text: 'Tiene muchas preocupaciones, a menudo parece inquieto/a o preocupado/a',
    subscale: 'emotional',
    isReversed: false
  },
  {
    itemNumber: 9,
    text: 'Ayuda si alguien resulta herido/a, disgustado/a o enfermo/a',
    subscale: 'prosocial',
    isReversed: false
  },
  {
    itemNumber: 10,
    text: 'Continuamente se mueve o se retuerce',
    subscale: 'hyperactivity',
    isReversed: false
  },
  {
    itemNumber: 11,
    text: 'Tiene por lo menos un buen amigo o amiga',
    subscale: 'peer',
    isReversed: true
  },
  {
    itemNumber: 12,
    text: 'A menudo pelea con otros niños o se burla de ellos',
    subscale: 'conduct',
    isReversed: false
  },
  {
    itemNumber: 13,
    text: 'A menudo parece triste, desanimado/a o lloroso/a',
    subscale: 'emotional',
    isReversed: false
  },
  {
    itemNumber: 14,
    text: 'Por lo general cae bien a otros niños',
    subscale: 'peer',
    isReversed: true
  },
  {
    itemNumber: 15,
    text: 'Se distrae fácilmente, le cuesta concentrarse',
    subscale: 'hyperactivity',
    isReversed: false
  },
  {
    itemNumber: 16,
    text: 'Se pone nervioso/a en situaciones nuevas, pierde fácilmente la confianza en sí mismo/a',
    subscale: 'emotional',
    isReversed: false
  },
  {
    itemNumber: 17,
    text: 'Es bondadoso/a con los niños y niñas más pequeños',
    subscale: 'prosocial',
    isReversed: false
  },
  {
    itemNumber: 18,
    text: 'A menudo miente o engaña',
    subscale: 'conduct',
    isReversed: false
  },
  {
    itemNumber: 19,
    text: 'Los otros niños se meten con él/ella o se burlan de él/ella',
    subscale: 'peer',
    isReversed: false
  },
  {
    itemNumber: 20,
    text: 'A menudo se ofrece como voluntario/a para ayudar a otros (padres, maestros, otros niños)',
    subscale: 'prosocial',
    isReversed: false
  },
  {
    itemNumber: 21,
    text: 'Piensa las cosas antes de hacerlas',
    subscale: 'hyperactivity',
    isReversed: true
  },
  {
    itemNumber: 22,
    text: 'Coge cosas que no son suyas (en casa, en la escuela o en otros sitios)',
    subscale: 'conduct',
    isReversed: false
  },
  {
    itemNumber: 23,
    text: 'Se lleva mejor con adultos que con otros niños',
    subscale: 'peer',
    isReversed: false
  },
  {
    itemNumber: 24,
    text: 'Tiene muchos miedos, se asusta fácilmente',
    subscale: 'emotional',
    isReversed: false
  },
  {
    itemNumber: 25,
    text: 'Termina lo que empieza, tiene buena capacidad de concentración',
    subscale: 'hyperactivity',
    isReversed: true
  }
] as const;

export interface SdqSubscaleMeta {
  id: SdqSubscaleId;
  name: string;
  itemNumbers: readonly number[];
  maxScore: number;
  isStrengthScale: boolean;
}

export const SDQ_SUBSCALE_METAS: Record<SdqSubscaleId, SdqSubscaleMeta> = {
  emotional: {
    id: 'emotional',
    name: 'Síntomas Emocionales',
    itemNumbers: [3, 8, 13, 16, 24],
    maxScore: 10,
    isStrengthScale: false
  },
  conduct: {
    id: 'conduct',
    name: 'Problemas de Conducta',
    itemNumbers: [5, 7, 12, 18, 22],
    maxScore: 10,
    isStrengthScale: false
  },
  hyperactivity: {
    id: 'hyperactivity',
    name: 'Hiperactividad',
    itemNumbers: [2, 10, 15, 21, 25],
    maxScore: 10,
    isStrengthScale: false
  },
  peer: {
    id: 'peer',
    name: 'Problemas con Compañeros',
    itemNumbers: [6, 11, 14, 19, 23],
    maxScore: 10,
    isStrengthScale: false
  },
  prosocial: {
    id: 'prosocial',
    name: 'Conducta Prosocial',
    itemNumbers: [1, 4, 9, 17, 20],
    maxScore: 10,
    isStrengthScale: true
  }
};

export interface ScoreBandRange {
  min: number;
  max: number;
}

export interface SdqScaleCutoffs {
  normal: ScoreBandRange;
  borderline: ScoreBandRange;
  abnormal: ScoreBandRange;
}

export interface SdqInformantNorms {
  totalDifficulties: SdqScaleCutoffs;
  emotional: SdqScaleCutoffs;
  conduct: SdqScaleCutoffs;
  hyperactivity: SdqScaleCutoffs;
  peer: SdqScaleCutoffs;
  prosocial: SdqScaleCutoffs;
}

export const SDQ_NORMS: Record<SdqInformantType, SdqInformantNorms> = {
  parent: {
    totalDifficulties: {
      normal: { min: 0, max: 13 },
      borderline: { min: 14, max: 16 },
      abnormal: { min: 17, max: 40 }
    },
    emotional: {
      normal: { min: 0, max: 3 },
      borderline: { min: 4, max: 4 },
      abnormal: { min: 5, max: 10 }
    },
    conduct: {
      normal: { min: 0, max: 2 },
      borderline: { min: 3, max: 3 },
      abnormal: { min: 4, max: 10 }
    },
    hyperactivity: {
      normal: { min: 0, max: 5 },
      borderline: { min: 6, max: 6 },
      abnormal: { min: 7, max: 10 }
    },
    peer: {
      normal: { min: 0, max: 2 },
      borderline: { min: 3, max: 3 },
      abnormal: { min: 4, max: 10 }
    },
    prosocial: {
      // In Prosocial, lower score is difficulty
      normal: { min: 6, max: 10 },
      borderline: { min: 5, max: 5 },
      abnormal: { min: 0, max: 4 }
    }
  },
  self: {
    totalDifficulties: {
      normal: { min: 0, max: 15 },
      borderline: { min: 16, max: 19 },
      abnormal: { min: 20, max: 40 }
    },
    emotional: {
      normal: { min: 0, max: 5 },
      borderline: { min: 6, max: 6 },
      abnormal: { min: 7, max: 10 }
    },
    conduct: {
      normal: { min: 0, max: 3 },
      borderline: { min: 4, max: 4 },
      abnormal: { min: 5, max: 10 }
    },
    hyperactivity: {
      normal: { min: 0, max: 5 },
      borderline: { min: 6, max: 6 },
      abnormal: { min: 7, max: 10 }
    },
    peer: {
      normal: { min: 0, max: 3 },
      borderline: { min: 4, max: 5 },
      abnormal: { min: 6, max: 10 }
    },
    prosocial: {
      normal: { min: 6, max: 10 },
      borderline: { min: 5, max: 5 },
      abnormal: { min: 0, max: 4 }
    }
  },
  teacher: {
    totalDifficulties: {
      normal: { min: 0, max: 11 },
      borderline: { min: 12, max: 15 },
      abnormal: { min: 16, max: 40 }
    },
    emotional: {
      normal: { min: 0, max: 4 },
      borderline: { min: 5, max: 5 },
      abnormal: { min: 6, max: 10 }
    },
    conduct: {
      normal: { min: 0, max: 2 },
      borderline: { min: 3, max: 3 },
      abnormal: { min: 4, max: 10 }
    },
    hyperactivity: {
      normal: { min: 0, max: 5 },
      borderline: { min: 6, max: 6 },
      abnormal: { min: 7, max: 10 }
    },
    peer: {
      normal: { min: 0, max: 3 },
      borderline: { min: 4, max: 4 },
      abnormal: { min: 5, max: 10 }
    },
    prosocial: {
      normal: { min: 6, max: 10 },
      borderline: { min: 5, max: 5 },
      abnormal: { min: 0, max: 4 }
    }
  }
};

// ============================================================================
// PHQ-9 (Patient Health Questionnaire - 9) Norms & Items
// ============================================================================

export const PHQ9_ITEMS: readonly Phq9ItemDefinition[] = [
  {
    itemNumber: 1,
    text: 'Poco interés o placer en hacer las cosas',
    symptom: 'Anhedonia / Pérdida de interés'
  },
  {
    itemNumber: 2,
    text: 'Se ha sentido desanimado/a, deprimido/a o sin esperanzas',
    symptom: 'Estado de ánimo deprimido'
  },
  {
    itemNumber: 3,
    text: 'Con problemas para dormir o para mantenerse dormido/a, o dormir demasiado',
    symptom: 'Alteración del sueño (insomnio / hipersomnia)'
  },
  {
    itemNumber: 4,
    text: 'Se ha sentido cansado/a o con poca energía',
    symptom: 'Fatiga o pérdida de energía'
  },
  {
    itemNumber: 5,
    text: 'Con poco apetito o ha comido en exceso',
    symptom: 'Alteración del apetito o del peso'
  },
  {
    itemNumber: 6,
    text: 'Se ha sentido mal consigo mismo/a — o que es un/a fracasado/a o que ha quedado mal con usted mismo/a o con su familia',
    symptom: 'Sentimientos de inutilidad o culpa excesiva'
  },
  {
    itemNumber: 7,
    text: 'Con dificultad para concentrarse en cosas tales como leer el periódico o ver televisión',
    symptom: 'Dificultad de concentración o indecisión'
  },
  {
    itemNumber: 8,
    text: '¿Se ha movido o hablado tan lento que otras personas podrían haberlo notado? O por el contrario, ¿ha estado tan inquieto/a o intranquilo/a que se ha estado moviendo mucho más de lo normal?',
    symptom: 'Agitación o enlentecimiento psicomotor'
  },
  {
    itemNumber: 9,
    text: 'Pensamientos de que estaría mejor muerto/a, o con deseos de lastimarse de alguna manera',
    symptom: 'Ideación suicida / Riesgo de autolesión (ÍTEM CRÍTICO)'
  }
] as const;

export interface Phq9BandConfig {
  severity: Phq9SeverityBand;
  minScore: number;
  maxScore: number;
  interpretation: string;
  recommendation: string;
}

export const PHQ9_SEVERITY_BANDS: readonly Phq9BandConfig[] = [
  {
    severity: 'Ninguna / Mínima',
    minScore: 0,
    maxScore: 4,
    interpretation: 'Síntomas depresivos mínimos o ausentes.',
    recommendation: 'No requiere intervención médica activa. Mantener psicoeducación preventiva y hábitos de vida saludables.'
  },
  {
    severity: 'Leve',
    minScore: 5,
    maxScore: 9,
    interpretation: 'Sintomatología depresiva leve.',
    recommendation: 'Seguimiento clínico expectante en atención primaria o consulta. Evaluar apoyo psicoterapéutico si los síntomas persisten o generan disfunción.'
  },
  {
    severity: 'Moderada',
    minScore: 10,
    maxScore: 14,
    interpretation: 'Depresión clínicamente significativa. Supera el punto de corte clínico estándar (>= 10).',
    recommendation: 'Formular plan terapéutico activo con psicoterapia estructurada (TCC, interpersonal) y/o valorar tratamiento farmacológico según comorbilidad y preferencia.'
  },
  {
    severity: 'Moderadamente Severa',
    minScore: 15,
    maxScore: 19,
    interpretation: 'Episodio depresivo moderadamente grave con compromiso funcional notable.',
    recommendation: 'Tratamiento activo inmediato combinando psicoterapia focalizada y farmacoterapia antidepresiva. Monitorización estrecha de la respuesta clínica.'
  },
  {
    severity: 'Severa',
    minScore: 20,
    maxScore: 27,
    interpretation: 'Episodio depresivo mayor severo. Alto impacto funcional.',
    recommendation: 'Intervención psiquiátrica especializada urgente. Farmacoterapia combinada, psicoterapia intensiva y valoración inmediata de la necesidad de derivación a salud mental especializada.'
  }
] as const;

export const PHQ9_SUICIDE_ALERT_MESSAGE =
  'ALERTA CLÍNICA CRÍTICA: Se ha detectado ideación suicida o riesgo de autolesión en el ítem 9. ' +
  'Requiere valoración clínica presencial inmediata del riesgo suicida e implementación del protocolo de seguridad del centro.';

// ============================================================================
// GAD-7 (Generalized Anxiety Disorder - 7) Norms & Items
// ============================================================================

export const GAD7_ITEMS: readonly Gad7ItemDefinition[] = [
  {
    itemNumber: 1,
    text: 'Sentirse nervioso/a, intranquilo/a o con los nervios de punta',
    symptom: 'Tensión psicomotora / Nerviosismo'
  },
  {
    itemNumber: 2,
    text: 'No poder parar o controlar las preocupaciones',
    symptom: 'Incontrolabilidad de la preocupación'
  },
  {
    itemNumber: 3,
    text: 'Preocuparse demasiado por diferentes cosas',
    symptom: 'Preocupación excesiva generalizada'
  },
  {
    itemNumber: 4,
    text: 'Dificultad para relajarse',
    symptom: 'Incapacidad de relajación psicofísica'
  },
  {
    itemNumber: 5,
    text: 'Estar tan inquieto/a que le cuesta permanecer quieto/a',
    symptom: 'Inquietud motora'
  },
  {
    itemNumber: 6,
    text: 'Molestarse o irritarse fácilmente',
    symptom: 'Irritabilidad'
  },
  {
    itemNumber: 7,
    text: 'Sentir miedo como si algo terrible fuera a pasar',
    symptom: 'Aprensión catastrófica / Miedo difuso'
  }
] as const;

export interface Gad7BandConfig {
  severity: Gad7SeverityBand;
  minScore: number;
  maxScore: number;
  interpretation: string;
  recommendation: string;
}

export const GAD7_SEVERITY_BANDS: readonly Gad7BandConfig[] = [
  {
    severity: 'Ansiedad mínima',
    minScore: 0,
    maxScore: 4,
    interpretation: 'Nivel basal de ansiedad no patológico.',
    recommendation: 'No requiere intervención clínica activa. Reforzar pautas generales de autocuidado y manejo del estrés.'
  },
  {
    severity: 'Ansiedad leve',
    minScore: 5,
    maxScore: 9,
    interpretation: 'Sintomatología ansiosa leve.',
    recommendation: 'Vigilancia clínica expectante. Intervenciones psicoeducativas breves, técnicas de respiración/relajación y reevaluación si persisten los estresores.'
  },
  {
    severity: 'Ansiedad moderada',
    minScore: 10,
    maxScore: 14,
    interpretation: 'Ansiedad moderada. Supera el punto de corte clínico validado (>= 10), indicando probable Trastorno de Ansiedad Generalizada.',
    recommendation: 'Confirmación diagnóstica clínica estructurada y formulación de plan terapéutico con psicoterapia cognitivo-conductual u orientación clínica especializada.'
  },
  {
    severity: 'Ansiedad severa',
    minScore: 15,
    maxScore: 21,
    interpretation: 'Cuadro de ansiedad severo con probable interferencia significativa en la vida diaria.',
    recommendation: 'Tratamiento clínico activo y prioritario. Evaluación multidisciplinaria para psicoterapia intensiva y/o consideración de tratamiento psicofarmacológico.'
  }
] as const;

// ============================================================================
// MoCA (Montreal Cognitive Assessment) Domains & Classifications
// ============================================================================

export const MOCA_DOMAINS: readonly MocaDomainDefinition[] = [
  {
    id: 'visuospatialExecutive',
    name: 'Visuoespacial / Ejecutiva',
    maxScore: 5,
    description: 'Trail Making alternante (1 pt), Copia del cubo tridimensional (1 pt), Test del reloj (3 pts: contorno, números, manecillas).'
  },
  {
    id: 'naming',
    name: 'Denominación',
    maxScore: 3,
    description: 'Identificación y denominación de 3 animales (León, Rinoceronte, Camello/Dromedario; 1 pt c/u).'
  },
  {
    id: 'attention',
    name: 'Atención',
    maxScore: 6,
    description: 'Dígitos en orden directo (1 pt), orden inverso (1 pt), detección auditiva de letra A (1 pt), resta consecutiva de 7 desde 100 (3 pts).'
  },
  {
    id: 'language',
    name: 'Lenguaje',
    maxScore: 3,
    description: 'Repetición exacta de dos oraciones complejas (1 pt c/u) y fluidez verbal fonológica de la letra P (>= 11 palabras en 60s: 1 pt).'
  },
  {
    id: 'abstraction',
    name: 'Abstracción',
    maxScore: 2,
    description: 'Semejanza categorial abstracta Tren-Bicicleta (1 pt) y Regla-Reloj (1 pt).'
  },
  {
    id: 'delayedRecall',
    name: 'Recuerdo Diferido',
    maxScore: 5,
    description: 'Evocación libre y espontánea de 5 palabras sin pistas tras ~5 minutos (1 pt por palabra: Rostro, Seda, Iglesia, Clavel, Rojo).'
  },
  {
    id: 'orientation',
    name: 'Orientación',
    maxScore: 6,
    description: 'Orientación temporal y espacial: Día del mes, Mes, Año, Día de la semana, Lugar exacto, Ciudad (1 pt c/u).'
  }
] as const;

export interface MocaBandConfig {
  classification: MocaClassification;
  minScore: number;
  maxScore: number;
  interpretation: string;
  recommendation: string;
}

export const MOCA_CLASSIFICATIONS: readonly MocaBandConfig[] = [
  {
    classification: 'Normal',
    minScore: 26,
    maxScore: 30,
    interpretation: 'Función cognitiva general dentro de límites normales esperados para la edad y escolaridad.',
    recommendation: 'No se observan indicios de deterioro cognitivo. Mantener estimulación cognitiva regular y control médico de rutina.'
  },
  {
    classification: 'Deterioro Cognitivo Leve',
    minScore: 18,
    maxScore: 25,
    interpretation: 'Puntuación por debajo del punto de corte clínico (< 26). Compatible con sospecha de Deterioro Cognitivo Leve (DCL / MCI).',
    recommendation: 'Se recomienda evaluación neuropsicológica comprensiva formal, valoración neurológica, pruebas de laboratorio y neuroimagen.'
  },
  {
    classification: 'Deterioro Cognitivo Moderado',
    minScore: 10,
    maxScore: 17,
    interpretation: 'Deterioro cognitivo moderado con probable afectación funcional en actividades cotidianas.',
    recommendation: 'Derivación prioritaria a Neurología / Psicogeriatría. Valoración de actividades básicas e instrumentales de la vida diaria (ABVD / AIVD).'
  },
  {
    classification: 'Deterioro Cognitivo Severo',
    minScore: 0,
    maxScore: 9,
    interpretation: 'Compromiso cognitivo severo y global.',
    recommendation: 'Atención médica y neurológica especializada urgente. Evaluación de la seguridad personal, dependencia funcional y plan integral de cuidados continuos.'
  }
] as const;

/**
 * MoCA Serial 7s scoring lookup:
 * Counts of correct subtractions (from 100: 93, 86, 79, 72, 65):
 * 4 or 5 correct -> 3 points
 * 2 or 3 correct -> 2 points
 * 1 correct -> 1 point
 * 0 correct -> 0 points
 */
export function getMocaSerial7Score(correctSubtractions: number): number {
  if (correctSubtractions >= 4) return 3;
  if (correctSubtractions >= 2) return 2;
  if (correctSubtractions >= 1) return 1;
  return 0;
}
