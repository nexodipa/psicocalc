/**
 * Normative parameters, scale metadata, and cutoffs for:
 * - MMPI-3 (Minnesota Multiphasic Personality Inventory - 3)
 * - PAI (Personality Assessment Inventory)
 * - MCMI-IV (Millon Clinical Multiaxial Inventory - IV)
 */

import {
  Mmpi3ScaleId,
  PaiMainScaleId,
  PaiSubscaleId,
  Mcmi4ScaleId,
} from '../types/personality';

// ============================================================================
// MMPI-3 Norms & Metadata
// ============================================================================

export interface Mmpi3ScaleMeta {
  id: Mmpi3ScaleId;
  name: string;
  fullName: string;
  category:
    | 'validity'
    | 'higher_order'
    | 'restructured_clinical'
    | 'somatic_cognitive'
    | 'internalizing'
    | 'externalizing'
    | 'interpersonal'
    | 'psy5';
  mean: number;
  sd: number;
  isUniformT?: boolean;
}

export const MMPI3_SCALES: Record<Mmpi3ScaleId, Mmpi3ScaleMeta> = {
  // Validity
  CNS: { id: 'CNS', name: 'No puedo decir', fullName: 'Cannot Say (Omitidos)', category: 'validity', mean: 1.5, sd: 2.5 },
  CRIN: { id: 'CRIN', name: 'Inconsistencia combinada', fullName: 'Combined Response Inconsistency', category: 'validity', mean: 5.0, sd: 2.2 },
  VRIN: { id: 'VRIN', name: 'Inconsistencia variable', fullName: 'Variable Response Inconsistency', category: 'validity', mean: 4.8, sd: 2.1 },
  TRIN: { id: 'TRIN', name: 'Inconsistencia verdadera', fullName: 'True Response Inconsistency', category: 'validity', mean: 10.0, sd: 2.0 },
  F: { id: 'F', name: 'Infrecuentes', fullName: 'Infrequent Responses', category: 'validity', mean: 3.5, sd: 3.0 },
  Fp: { id: 'Fp', name: 'Infrecuentes psicopatología', fullName: 'Infrequent Psychopathology Responses', category: 'validity', mean: 1.2, sd: 1.5 },
  Fs: { id: 'Fs', name: 'Infrecuentes somáticas', fullName: 'Infrequent Somatic Responses', category: 'validity', mean: 2.0, sd: 2.0 },
  FBS: { id: 'FBS', name: 'Validez de síntomas', fullName: 'Symptom Validity Scale', category: 'validity', mean: 7.0, sd: 3.5 },
  RBS: { id: 'RBS', name: 'Sesgo de respuesta', fullName: 'Response Bias Scale', category: 'validity', mean: 6.5, sd: 3.2 },
  L: { id: 'L', name: 'Virtudes poco comunes', fullName: 'Uncommon Virtues', category: 'validity', mean: 3.0, sd: 2.2 },
  K: { id: 'K', name: 'Validez de ajuste', fullName: 'Adjustment Validity', category: 'validity', mean: 8.5, sd: 3.5 },

  // Higher-Order
  EID: { id: 'EID', name: 'Disfunción emocional', fullName: 'Emotional / Internalizing Dysfunction', category: 'higher_order', mean: 14.0, sd: 8.5, isUniformT: true },
  THD: { id: 'THD', name: 'Disfunción del pensamiento', fullName: 'Thought Dysfunction', category: 'higher_order', mean: 4.5, sd: 4.8, isUniformT: true },
  BXD: { id: 'BXD', name: 'Disfunción conductual', fullName: 'Behavioral / Externalizing Dysfunction', category: 'higher_order', mean: 8.0, sd: 5.5, isUniformT: true },

  // Restructured Clinical
  RCd: { id: 'RCd', name: 'Desmoralización', fullName: 'Demoralization', category: 'restructured_clinical', mean: 7.5, sd: 5.5, isUniformT: true },
  RC1: { id: 'RC1', name: 'Quejas somáticas', fullName: 'Somatic Complaints', category: 'restructured_clinical', mean: 4.5, sd: 4.5, isUniformT: true },
  RC2: { id: 'RC2', name: 'Escasas emociones positivas', fullName: 'Low Positive Emotions', category: 'restructured_clinical', mean: 5.0, sd: 4.0, isUniformT: true },
  RC4: { id: 'RC4', name: 'Conducta antisocial', fullName: 'Antisocial Behavior', category: 'restructured_clinical', mean: 4.0, sd: 3.5, isUniformT: true },
  RC6: { id: 'RC6', name: 'Ideas de persecución', fullName: 'Ideas of Persecution', category: 'restructured_clinical', mean: 2.0, sd: 2.5, isUniformT: true },
  RC7: { id: 'RC7', name: 'Emociones negativas disfuncionales', fullName: 'Dysfunctional Negative Emotions', category: 'restructured_clinical', mean: 6.0, sd: 4.5, isUniformT: true },
  RC8: { id: 'RC8', name: 'Experiencias anómalas', fullName: 'Aberrant Experiences', category: 'restructured_clinical', mean: 2.5, sd: 3.0, isUniformT: true },
  RC9: { id: 'RC9', name: 'Activación hipomaníaca', fullName: 'Hypomanic Activation', category: 'restructured_clinical', mean: 8.0, sd: 4.2, isUniformT: true },

  // Somatic / Cognitive
  MLS: { id: 'MLS', name: 'Malestar general', fullName: 'Malaise', category: 'somatic_cognitive', mean: 2.0, sd: 2.0 },
  NUC: { id: 'NUC', name: 'Quejas neurológicas', fullName: 'Neurological Complaints', category: 'somatic_cognitive', mean: 1.5, sd: 1.8 },
  EAT: { id: 'EAT', name: 'Preocupaciones alimentarias', fullName: 'Eating Concerns', category: 'somatic_cognitive', mean: 1.2, sd: 1.6 },
  COG: { id: 'COG', name: 'Quejas cognitivas', fullName: 'Cognitive Complaints', category: 'somatic_cognitive', mean: 2.2, sd: 2.5 },

  // Internalizing
  SUI: { id: 'SUI', name: 'Ideación suicida / muerte', fullName: 'Suicidal / Death Ideation', category: 'internalizing', mean: 0.5, sd: 1.2 },
  HLP: { id: 'HLP', name: 'Indefensión / desesperanza', fullName: 'Helplessness / Hopelessness', category: 'internalizing', mean: 1.0, sd: 1.5 },
  SFD: { id: 'SFD', name: 'Inseguridad en uno mismo', fullName: 'Self-Doubt', category: 'internalizing', mean: 1.5, sd: 1.8 },
  NFC: { id: 'NFC', name: 'Ineficacia', fullName: 'Inefficacy', category: 'internalizing', mean: 2.0, sd: 2.2 },
  STR: { id: 'STR', name: 'Estrés', fullName: 'Stress', category: 'internalizing', mean: 3.0, sd: 2.8 },
  WRY: { id: 'WRY', name: 'Preocupación', fullName: 'Worry', category: 'internalizing', mean: 3.5, sd: 2.8 },
  CMP: { id: 'CMP', name: 'Compulsividad', fullName: 'Compulsivity', category: 'internalizing', mean: 2.2, sd: 2.0 },
  ARX: { id: 'ARX', name: 'Experiencias de ansiedad', fullName: 'Anxiety-Related Experiences', category: 'internalizing', mean: 2.5, sd: 2.4 },
  ANP: { id: 'ANP', name: 'Propensión a la ira', fullName: 'Anger Proneness', category: 'internalizing', mean: 2.8, sd: 2.2 },
  BRF: { id: 'BRF', name: 'Miedos restrictivos', fullName: 'Behavior-Restricting Fears', category: 'internalizing', mean: 1.8, sd: 2.0 },

  // Externalizing
  FML: { id: 'FML', name: 'Problemas familiares', fullName: 'Family Problems', category: 'externalizing', mean: 2.0, sd: 2.2 },
  JCP: { id: 'JCP', name: 'Problemas de conducta juvenil', fullName: 'Juvenile Conduct Problems', category: 'externalizing', mean: 1.5, sd: 1.8 },
  SUB: { id: 'SUB', name: 'Abuso de sustancias', fullName: 'Substance Use', category: 'externalizing', mean: 1.0, sd: 1.6 },
  IMP: { id: 'IMP', name: 'Impulsividad', fullName: 'Impulsivity', category: 'externalizing', mean: 2.5, sd: 2.2 },
  ACT: { id: 'ACT', name: 'Activación', fullName: 'Activation', category: 'externalizing', mean: 3.0, sd: 2.4 },

  // Interpersonal
  SFI: { id: 'SFI', name: 'Falta de asertividad', fullName: 'Self-Importance Low / Passivity', category: 'interpersonal', mean: 2.0, sd: 2.0 },
  DOM: { id: 'DOM', name: 'Dominancia', fullName: 'Dominance', category: 'interpersonal', mean: 4.5, sd: 2.8 },
  DSF: { id: 'DSF', name: 'Desafiliación', fullName: 'Disaffiliativeness', category: 'interpersonal', mean: 1.8, sd: 1.9 },
  SAV: { id: 'SAV', name: 'Evitación social', fullName: 'Social Avoidance', category: 'interpersonal', mean: 2.5, sd: 2.5 },
  SHY: { id: 'SHY', name: 'Timidez', fullName: 'Shyness', category: 'interpersonal', mean: 2.2, sd: 2.2 },

  // PSY-5
  AGGR: { id: 'AGGR', name: 'Agresividad', fullName: 'Aggressiveness', category: 'psy5', mean: 4.0, sd: 3.0 },
  PSYC: { id: 'PSYC', name: 'Psicoticismo', fullName: 'Psychoticism', category: 'psy5', mean: 2.0, sd: 2.5 },
  DISC: { id: 'DISC', name: 'Desinhibición', fullName: 'Disconstraint', category: 'psy5', mean: 5.5, sd: 3.2 },
  NEGE: { id: 'NEGE', name: 'Emocionalidad negativa', fullName: 'Negative Emotionality', category: 'psy5', mean: 6.0, sd: 4.0 },
  INTR: { id: 'INTR', name: 'Introversión', fullName: 'Introversion / Low Positive Emotion', category: 'psy5', mean: 4.5, sd: 3.5 },
};

export const MMPI3_INVALIDATION_RULES = {
  CNS_MAX: 14, // >= 15 invalid
  CRIN_MAX: 79, // >= 80 invalid
  VRIN_MAX: 79, // >= 80 invalid
  TRIN_MAX: 79, // >= 80 invalid
  F_MAX: 99, // >= 100 invalid
  FP_MAX: 79, // >= 80 invalid
  L_MAX: 79, // >= 80 invalid
  FS_MAX: 99,
  FBS_MAX: 99,
  RBS_MAX: 99,
  K_MAX: 69,
};

// ============================================================================
// PAI Norms & Metadata
// ============================================================================

export interface PaiScaleMeta {
  id: string;
  name: string;
  fullName: string;
  category: 'validity' | 'clinical' | 'treatment' | 'interpersonal' | 'subscale';
  itemCount: number;
  mean: number;
  sd: number;
}

export const PAI_SCALES: Record<string, PaiScaleMeta> = {
  // Validity
  ICN: { id: 'ICN', name: 'Inconsistencia', fullName: 'Inconsistency', category: 'validity', itemCount: 10, mean: 4.8, sd: 2.2 },
  INF: { id: 'INF', name: 'Infrecuencia', fullName: 'Infrequency', category: 'validity', itemCount: 8, mean: 2.5, sd: 2.0 },
  NIM: { id: 'NIM', name: 'Impresión negativa', fullName: 'Negative Impression Management', category: 'validity', itemCount: 9, mean: 3.2, sd: 2.8 },
  PIM: { id: 'PIM', name: 'Impresión positiva', fullName: 'Positive Impression Management', category: 'validity', itemCount: 9, mean: 12.5, sd: 4.5 },

  // Clinical
  SOM: { id: 'SOM', name: 'Quejas somáticas', fullName: 'Somatic Complaints', category: 'clinical', itemCount: 24, mean: 12.0, sd: 8.5 },
  ANX: { id: 'ANX', name: 'Ansiedad', fullName: 'Anxiety', category: 'clinical', itemCount: 24, mean: 15.0, sd: 9.5 },
  ARD: { id: 'ARD', name: 'Trastornos ansiedad', fullName: 'Anxiety-Related Disorders', category: 'clinical', itemCount: 24, mean: 17.0, sd: 9.0 },
  DEP: { id: 'DEP', name: 'Depresión', fullName: 'Depression', category: 'clinical', itemCount: 24, mean: 14.5, sd: 10.0 },
  MAN: { id: 'MAN', name: 'Manía', fullName: 'Mania', category: 'clinical', itemCount: 24, mean: 22.0, sd: 8.0 },
  PAR: { id: 'PAR', name: 'Paranoia', fullName: 'Paranoia', category: 'clinical', itemCount: 24, mean: 16.0, sd: 8.5 },
  SCZ: { id: 'SCZ', name: 'Esquizofrenia', fullName: 'Schizophrenia', category: 'clinical', itemCount: 24, mean: 12.0, sd: 8.0 },
  BOR: { id: 'BOR', name: 'Rasgos límite', fullName: 'Borderline Features', category: 'clinical', itemCount: 24, mean: 18.0, sd: 9.5 },
  ANT: { id: 'ANT', name: 'Rasgos antisociales', fullName: 'Antisocial Features', category: 'clinical', itemCount: 24, mean: 15.0, sd: 8.5 },
  ALC: { id: 'ALC', name: 'Problemas alcohol', fullName: 'Alcohol Problems', category: 'clinical', itemCount: 12, mean: 4.5, sd: 5.5 },
  DRG: { id: 'DRG', name: 'Problemas drogas', fullName: 'Drug Problems', category: 'clinical', itemCount: 12, mean: 3.0, sd: 4.5 },

  // Treatment Considerations
  AGG: { id: 'AGG', name: 'Agresión', fullName: 'Aggression', category: 'treatment', itemCount: 18, mean: 14.0, sd: 8.0 },
  SUI: { id: 'SUI', name: 'Ideación suicida', fullName: 'Suicidal Ideation', category: 'treatment', itemCount: 12, mean: 3.5, sd: 4.8 },
  STR: { id: 'STR', name: 'Estrés', fullName: 'Stress', category: 'treatment', itemCount: 8, mean: 6.0, sd: 4.0 },
  NON: { id: 'NON', name: 'Falta apoyo social', fullName: 'Nonsupport', category: 'treatment', itemCount: 8, mean: 5.5, sd: 3.8 },
  RXR: { id: 'RXR', name: 'Rechazo tratamiento', fullName: 'Treatment Rejection', category: 'treatment', itemCount: 8, mean: 8.0, sd: 4.2 },

  // Interpersonal
  DOM: { id: 'DOM', name: 'Dominancia', fullName: 'Dominance', category: 'interpersonal', itemCount: 12, mean: 16.0, sd: 5.5 },
  WRM: { id: 'WRM', name: 'Afabilidad / calidez', fullName: 'Warmth', category: 'interpersonal', itemCount: 12, mean: 18.5, sd: 5.0 },
};

export const PAI_INVALIDATION_RULES = {
  MAX_OMISSIONS_TOTAL: 17, // > 17 invalid
  MAX_SCALE_OMISSION_RATIO: 0.20, // >= 20% invalidates scale
  ICN_MAX: 72, // >= 73 invalid
  INF_MAX: 74, // >= 75 invalid
  NIM_MAX: 91, // >= 92 invalid
  PIM_MAX: 67, // >= 68 extreme defensiveness
};

// ============================================================================
// MCMI-IV Norms & Metadata
// ============================================================================

export interface Mcmi4ScaleMeta {
  id: Mcmi4ScaleId;
  name: string;
  fullName: string;
  category: 'modifying' | 'clinical_personality' | 'severe_personality' | 'clinical_syndrome' | 'severe_syndrome';
  itemCount: number;
  medianRaw: number;
}

export const MCMI4_SCALES: Record<Mcmi4ScaleId, Mcmi4ScaleMeta> = {
  // Modifying
  V: { id: 'V', name: 'Invalidez', fullName: 'Validity Index', category: 'modifying', itemCount: 3, medianRaw: 0 },
  W: { id: 'W', name: 'Inconsistencia', fullName: 'Inconsistency Index', category: 'modifying', itemCount: 25, medianRaw: 5 },
  X: { id: 'X', name: 'Sinceridad', fullName: 'Disclosure', category: 'modifying', itemCount: 195, medianRaw: 61 },
  Y: { id: 'Y', name: 'Deseabilidad social', fullName: 'Desirability', category: 'modifying', itemCount: 21, medianRaw: 12 },
  Z: { id: 'Z', name: 'Autodescalificación', fullName: 'Debasement', category: 'modifying', itemCount: 22, medianRaw: 10 },

  // Clinical Personality Patterns
  '1': { id: '1', name: 'Esquizoide', fullName: 'Schizoid', category: 'clinical_personality', itemCount: 24, medianRaw: 12 },
  '2A': { id: '2A', name: 'Evitativo', fullName: 'Avoidant', category: 'clinical_personality', itemCount: 24, medianRaw: 11 },
  '2B': { id: '2B', name: 'Melancólico', fullName: 'Melancholic / Depressive', category: 'clinical_personality', itemCount: 24, medianRaw: 13 },
  '3': { id: '3', name: 'Dependiente', fullName: 'Dependent', category: 'clinical_personality', itemCount: 24, medianRaw: 14 },
  '4A': { id: '4A', name: 'Histriónico', fullName: 'Histrionic', category: 'clinical_personality', itemCount: 24, medianRaw: 18 },
  '4B': { id: '4B', name: 'Tempestuoso', fullName: 'Turbulent', category: 'clinical_personality', itemCount: 24, medianRaw: 15 },
  '5': { id: '5', name: 'Narcisista', fullName: 'Narcissistic', category: 'clinical_personality', itemCount: 24, medianRaw: 17 },
  '6A': { id: '6A', name: 'Antisocial', fullName: 'Antisocial', category: 'clinical_personality', itemCount: 24, medianRaw: 10 },
  '6B': { id: '6B', name: 'Sádico', fullName: 'Sadistic', category: 'clinical_personality', itemCount: 24, medianRaw: 9 },
  '7': { id: '7', name: 'Compulsivo', fullName: 'Compulsive', category: 'clinical_personality', itemCount: 24, medianRaw: 20 },
  '8A': { id: '8A', name: 'Negativista', fullName: 'Negativistic / Passive-Aggressive', category: 'clinical_personality', itemCount: 24, medianRaw: 11 },
  '8B': { id: '8B', name: 'Masoquista', fullName: 'Masochistic', category: 'clinical_personality', itemCount: 24, medianRaw: 10 },

  // Severe Personality
  S: { id: 'S', name: 'Esquizotípico', fullName: 'Schizotypal', category: 'severe_personality', itemCount: 24, medianRaw: 8 },
  C: { id: 'C', name: 'Límite', fullName: 'Borderline', category: 'severe_personality', itemCount: 24, medianRaw: 12 },
  P: { id: 'P', name: 'Paranoide', fullName: 'Paranoid', category: 'severe_personality', itemCount: 24, medianRaw: 10 },

  // Clinical Syndromes
  A: { id: 'A', name: 'Ansiedad generalizada', fullName: 'Generalized Anxiety', category: 'clinical_syndrome', itemCount: 18, medianRaw: 9 },
  H: { id: 'H', name: 'Síntomas somáticos', fullName: 'Somatic Symptom', category: 'clinical_syndrome', itemCount: 18, medianRaw: 7 },
  N: { id: 'N', name: 'Bipolar', fullName: 'Bipolar Spectrum', category: 'clinical_syndrome', itemCount: 18, medianRaw: 8 },
  D: { id: 'D', name: 'Depresión persistente', fullName: 'Persistent Depression', category: 'clinical_syndrome', itemCount: 18, medianRaw: 10 },
  B: { id: 'B', name: 'Consumo de alcohol', fullName: 'Alcohol Use', category: 'clinical_syndrome', itemCount: 15, medianRaw: 4 },
  T: { id: 'T', name: 'Consumo de drogas', fullName: 'Drug Use', category: 'clinical_syndrome', itemCount: 14, medianRaw: 3 },
  R: { id: 'R', name: 'Estrés postraumático', fullName: 'PTSD', category: 'clinical_syndrome', itemCount: 16, medianRaw: 7 },

  // Severe Syndromes
  SS: { id: 'SS', name: 'Espectro esquizofrénico', fullName: 'Schizophrenic Spectrum', category: 'severe_syndrome', itemCount: 18, medianRaw: 6 },
  CC: { id: 'CC', name: 'Depresión mayor', fullName: 'Major Depression', category: 'severe_syndrome', itemCount: 18, medianRaw: 8 },
  PP: { id: 'PP', name: 'Trastorno delirante', fullName: 'Delusional Disorder', category: 'severe_syndrome', itemCount: 18, medianRaw: 5 },
};

export const MCMI4_INVALIDATION_RULES = {
  MAX_OMISSIONS: 14, // > 14 invalid
  MAX_V: 1,          // >= 2 invalid
  MAX_W: 19,         // >= 20 invalid
  MIN_X: 7,          // < 7 invalid
  MAX_X: 114,        // > 114 invalid
};
