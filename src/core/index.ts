// Core domain types
export * from './types/psychometrics';

// Normative tables and classifications
export * from './tables/qualitative';
export * from './tables/normUtils';
export * from './tables/wisc_v_norms';
export * from './tables/wais_iv_norms';

// Mathematical and distribution engine
export * from './engine/normalDist';

// Confidence intervals
export * from './engine/confidence';

// Validators and age logic
export * from './engine/validator';

// Calculators
export * from './engine/wisc_v_calculator';
export * from './engine/wais_iv_calculator';

// Discrepancy & scatter profile engines
export * from './engine/discrepancy';
export * from './engine/scatter';

// Clinical psychometrics (SDQ, PHQ-9, GAD-7, MoCA)
export * from './types/clinical';
export * from './tables/clinicalNorms';
export * from './engine/clinicalCalculators';

// Projective qualitative evaluation (HTP: Casa-Árbol-Persona)
export * from './types/htp';
export * from './engine/htpNarrativeEngine';

// Centralized Universal Registry
export * from './registry';

// Universal Psychometric Suite (Phase 3)
export * from './types/personality';
export * from './tables/personalityNorms';
export * from './engine/personalityCalculators';

export * from './types/neuropsych';
export * from './tables/neuropsychNorms';
export * from './engine/neuropsychCalculators';

export * from './types/adaptive';
export * from './tables/adaptiveNorms';
export * from './engine/adaptiveCalculators';

export * from './types/child_adolescent';
export * from './tables/childAdolescentNorms';
export * from './engine/childAdolescentCalculators';

export * from './types/nonverbal';
export * from './tables/nonverbalNorms';
export * from './engine/raven2Calculator';
export * from './engine/extendedSuiteCalculators';
