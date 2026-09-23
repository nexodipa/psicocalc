/**
 * TIPOS DE DOMINIO PARA EL MÓDULO CUALITATIVO HTP (CASA-ÁRBOL-PERSONA)
 * Basado en la literatura de Buck (1948, 1966), Hammer (1958, 1980), Koppitz (1968, 1984) y Portuondo (1973).
 *
 * Enfoque Estrictamente Cualitativo y Gestáltico:
 * Sin asignación de puntuaciones numéricas artificiales.
 */

// ============================================================================
// 1. INDICADORES EXPRESIVOS FORMALES (TRANSVERSALES)
// ============================================================================

export type HtpSize = 'macrography' | 'normal' | 'micrography';
export type HtpPlacementVertical = 'upper' | 'center' | 'lower';
export type HtpPlacementHorizontal = 'left' | 'center' | 'right';
export type HtpStrokePressure = 'heavy' | 'normal' | 'weak';
export type HtpLineQuality = 'curved' | 'straight_rigid' | 'fragmented' | 'reinforced';
export type HtpShading = 'absent' | 'moderate' | 'excessive';
export type HtpSymmetry = 'rigid' | 'balanced' | 'asymmetric';

export interface HtpFormalFeatures {
  size: HtpSize;
  verticalPlacement: HtpPlacementVertical;
  horizontalPlacement: HtpPlacementHorizontal;
  strokePressure: HtpStrokePressure;
  lineQuality: HtpLineQuality;
  shading: HtpShading;
  symmetry: HtpSymmetry;
  hasExcessiveErasures: boolean;
  hasTransparencies: boolean;
  hasOmissions: boolean;
}

// ============================================================================
// 2. DIMENSIONES DE CONTENIDO: CASA (HOUSE) — VÍNCULOS Y DINÁMICA FAMILIAR
// ============================================================================

export type HouseRoof = 'oversized' | 'normal' | 'flat_absent';
export type HouseWalls = 'firm_solid' | 'weak_broken' | 'transparent';
export type HouseDoor = 'open' | 'closed_unlocked' | 'locked_barred' | 'tiny_inaccessible' | 'oversized' | 'absent';
export type HouseWindows = 'normal_open' | 'closed_curtained' | 'barred' | 'bare_empty' | 'absent';
export type HouseChimneySmoke = 'warm_gentle' | 'dense_turbulent' | 'absent_no_smoke';
export type HousePathway = 'direct_welcoming' | 'winding_narrow' | 'absent_isolated';
export type HouseFences = 'none' | 'surrounding_fence' | 'hedges_protective';

export interface HouseFeatures {
  roof: HouseRoof;
  walls: HouseWalls;
  door: HouseDoor;
  windows: HouseWindows;
  chimneySmoke: HouseChimneySmoke;
  pathway: HousePathway;
  fences: HouseFences;
  observations: string; // Notas cualitativas libres del evaluador
}

// ============================================================================
// 3. DIMENSIONES DE CONTENIDO: ÁRBOL (TREE) — AUTOIMAGEN INCONSCIENTE
// ============================================================================

export type TreeGroundLine = 'firm_connected' | 'hilltop_elevated' | 'floating_absent';
export type TreeRoots = 'hidden_normal' | 'exposed_prominent' | 'claw_like';
export type TreeTrunk = 'robust_straight' | 'slender_fragile' | 'bifurcated' | 'broken_scarred' | 'constricted';
export type TreeBranches = 'harmonious_open' | 'spiky_hostile' | 'drooping_weeping' | 'severed_truncated' | 'club_like' | 'absent';
export type TreeFoliageCrown = 'cloud_lobed' | 'sparse_bare' | 'flattened_compressed' | 'overwhelming' | 'fruit_flower_loaded';

export interface TreeFeatures {
  groundLine: TreeGroundLine;
  roots: TreeRoots;
  trunk: TreeTrunk;
  branches: TreeBranches;
  foliageCrown: TreeFoliageCrown;
  hasKnotsOrHoles: boolean;
  observations: string; // Notas cualitativas libres del evaluador
}

// ============================================================================
// 4. DIMENSIONES DE CONTENIDO: PERSONA (PERSON) — ESQUEMA CORPORAL Y CONTACTO
// ============================================================================

export type PersonHead = 'proportionate' | 'macrocephalic' | 'tiny';
export type PersonExpression = 'serene_smiling' | 'hostile_frowning' | 'flat_neutral' | 'anguished_vacant';
export type PersonEyes = 'detailed_pupils' | 'large_vigilant' | 'empty_dots' | 'closed';
export type PersonMouth = 'open_receptive' | 'toothed_aggressive' | 'tight_line' | 'slash_concave';
export type PersonNeck = 'adequate' | 'long_thin' | 'absent_choked';
export type PersonArms = 'extended_welcoming' | 'crossed_protective' | 'behind_back' | 'in_pockets' | 'rigid_vertical';
export type PersonHands = 'differentiated' | 'clenched_fists' | 'claw_pointed' | 'mittens_hidden' | 'absent';
export type PersonLegsFeet = 'grounded_stable' | 'tense_pressed' | 'tiny_shaky' | 'spread_stance' | 'absent';
export type PersonClothing = 'adequate_casual' | 'overdressed_formal' | 'underdressed_scanty' | 'power_accessories';

export interface PersonFeatures {
  head: PersonHead;
  expression: PersonExpression;
  eyes: PersonEyes;
  mouth: PersonMouth;
  neck: PersonNeck;
  arms: PersonArms;
  hands: PersonHands;
  legsFeet: PersonLegsFeet;
  clothing: PersonClothing;
  observations: string; // Notas cualitativas libres del evaluador
}

// ============================================================================
// 5. REGISTRO MAESTRO DE EVALUACIÓN HTP Y SÍNTESIS INTEGRADA
// ============================================================================

export interface HtpAssessmentRecord {
  id: string;
  testDate: string;
  evaluator: string;
  formal: HtpFormalFeatures;
  house: HouseFeatures;
  tree: TreeFeatures;
  person: PersonFeatures;
  generalClinicalNotes: string; // Observaciones de actitud, latencia de respuesta, preguntas del sujeto
}

export interface HtpNarrativeReport {
  summaryFormal: string;       // Párrafo a: Resumen de Indicadores Expresivos Generales
  houseAnalysis: string;       // Párrafo b: Dinámica Familiar y Área Afectiva (Casa)
  treeAnalysis: string;        // Párrafo c: Estructura del Yo y Estabilidad Emocional Profunda (Árbol)
  personAnalysis: string;      // Párrafo d: Imagen Corporal y Relaciones Interpersonales (Persona)
  integratedConclusion: string;// Párrafo e: Conclusión Cualitativa Integrada y Recomendaciones Periciales
  fullNarrativeText: string;   // Texto concatenado con formato pericial para informe o portapapeles
}

// ============================================================================
// 6. PERFILES CLÍNICOS BENCHMARK PREDEFINIDOS
// ============================================================================

export type HtpBenchmarkPreset = 'balanced' | 'inhibited' | 'expansive';

export const INITIAL_HTP_RECORD: HtpAssessmentRecord = {
  id: 'htp-session-default',
  testDate: new Date().toISOString().slice(0, 10),
  evaluator: '',
  formal: {
    size: 'normal',
    verticalPlacement: 'center',
    horizontalPlacement: 'center',
    strokePressure: 'normal',
    lineQuality: 'curved',
    shading: 'absent',
    symmetry: 'balanced',
    hasExcessiveErasures: false,
    hasTransparencies: false,
    hasOmissions: false,
  },
  house: {
    roof: 'normal',
    walls: 'firm_solid',
    door: 'closed_unlocked',
    windows: 'normal_open',
    chimneySmoke: 'warm_gentle',
    pathway: 'direct_welcoming',
    fences: 'none',
    observations: '',
  },
  tree: {
    groundLine: 'firm_connected',
    roots: 'hidden_normal',
    trunk: 'robust_straight',
    branches: 'harmonious_open',
    foliageCrown: 'cloud_lobed',
    hasKnotsOrHoles: false,
    observations: '',
  },
  person: {
    head: 'proportionate',
    expression: 'serene_smiling',
    eyes: 'detailed_pupils',
    mouth: 'open_receptive',
    neck: 'adequate',
    arms: 'extended_welcoming',
    hands: 'differentiated',
    legsFeet: 'grounded_stable',
    clothing: 'adequate_casual',
    observations: '',
  },
  generalClinicalNotes: '',
};

export const HTP_BENCHMARK_PROFILES: Record<HtpBenchmarkPreset, HtpAssessmentRecord> = {
  balanced: {
    id: 'htp-preset-balanced',
    testDate: new Date().toISOString().slice(0, 10),
    evaluator: 'Dr. Evaluador Clínico',
    formal: {
      size: 'normal',
      verticalPlacement: 'center',
      horizontalPlacement: 'center',
      strokePressure: 'normal',
      lineQuality: 'curved',
      shading: 'absent',
      symmetry: 'balanced',
      hasExcessiveErasures: false,
      hasTransparencies: false,
      hasOmissions: false,
    },
    house: {
      roof: 'normal',
      walls: 'firm_solid',
      door: 'closed_unlocked',
      windows: 'normal_open',
      chimneySmoke: 'warm_gentle',
      pathway: 'direct_welcoming',
      fences: 'none',
      observations: 'Producción gráfica espontánea y fluida, adecuada distribución del espacio.',
    },
    tree: {
      groundLine: 'firm_connected',
      roots: 'hidden_normal',
      trunk: 'robust_straight',
      branches: 'harmonious_open',
      foliageCrown: 'cloud_lobed',
      hasKnotsOrHoles: false,
      observations: 'Árbol vigoroso y bien emplazado, proporciones armónicas entre copa y tronco.',
    },
    person: {
      head: 'proportionate',
      expression: 'serene_smiling',
      eyes: 'detailed_pupils',
      mouth: 'open_receptive',
      neck: 'adequate',
      arms: 'extended_welcoming',
      hands: 'differentiated',
      legsFeet: 'grounded_stable',
      clothing: 'adequate_casual',
      observations: 'Figura humana completa con adecuado esquema corporal y postura abierta.',
    },
    generalClinicalNotes: 'Evaluado colaborador, con actitud receptiva y tiempo de ejecución adecuado.',
  },

  inhibited: {
    id: 'htp-preset-inhibited',
    testDate: new Date().toISOString().slice(0, 10),
    evaluator: 'Dr. Evaluador Clínico',
    formal: {
      size: 'micrography',
      verticalPlacement: 'lower',
      horizontalPlacement: 'left',
      strokePressure: 'weak',
      lineQuality: 'fragmented',
      shading: 'excessive',
      symmetry: 'rigid',
      hasExcessiveErasures: true,
      hasTransparencies: false,
      hasOmissions: false,
    },
    house: {
      roof: 'oversized',
      walls: 'weak_broken',
      door: 'tiny_inaccessible',
      windows: 'closed_curtained',
      chimneySmoke: 'absent_no_smoke',
      pathway: 'winding_narrow',
      fences: 'none',
      observations: 'Casa pequeña ubicada en el cuadrante inferior izquierdo; reiteradas borraduras en la puerta.',
    },
    tree: {
      groundLine: 'floating_absent',
      roots: 'exposed_prominent',
      trunk: 'slender_fragile',
      branches: 'drooping_weeping',
      foliageCrown: 'flattened_compressed',
      hasKnotsOrHoles: true,
      observations: 'Árbol sin apoyo en el suelo con ramas caídas; presencia de nudo visible en el tronco.',
    },
    person: {
      head: 'tiny',
      expression: 'anguished_vacant',
      eyes: 'empty_dots',
      mouth: 'tight_line',
      neck: 'long_thin',
      arms: 'behind_back',
      hands: 'mittens_hidden',
      legsFeet: 'tiny_shaky',
      clothing: 'adequate_casual',
      observations: 'Figura humana con manos ocultas tras la espalda y expresión facial de desamparo.',
    },
    generalClinicalNotes: 'Manifiesta timidez, vacilación y dudas continuas sobre su capacidad de dibujar.',
  },

  expansive: {
    id: 'htp-preset-expansive',
    testDate: new Date().toISOString().slice(0, 10),
    evaluator: 'Dr. Evaluador Clínico',
    formal: {
      size: 'macrography',
      verticalPlacement: 'upper',
      horizontalPlacement: 'right',
      strokePressure: 'heavy',
      lineQuality: 'straight_rigid',
      shading: 'absent',
      symmetry: 'rigid',
      hasExcessiveErasures: false,
      hasTransparencies: false,
      hasOmissions: false,
    },
    house: {
      roof: 'flat_absent',
      walls: 'firm_solid',
      door: 'locked_barred',
      windows: 'barred',
      chimneySmoke: 'dense_turbulent',
      pathway: 'absent_isolated',
      fences: 'surrounding_fence',
      observations: 'Dibujo que ocupa casi la totalidad de la lámina; rejas marcadas en ventanas y cerca perimetral.',
    },
    tree: {
      groundLine: 'hilltop_elevated',
      roots: 'claw_like',
      trunk: 'robust_straight',
      branches: 'spiky_hostile',
      foliageCrown: 'overwhelming',
      hasKnotsOrHoles: false,
      observations: 'Árbol en cima de colina con ramas afiladas en punta y raíces en garra fuertemente afianzadas.',
    },
    person: {
      head: 'macrocephalic',
      expression: 'hostile_frowning',
      eyes: 'large_vigilant',
      mouth: 'toothed_aggressive',
      neck: 'absent_choked',
      arms: 'rigid_vertical',
      hands: 'clenched_fists',
      legsFeet: 'spread_stance',
      clothing: 'power_accessories',
      observations: 'Figura imponente con puños cerrados, postura desafiante con piernas separadas y ceño fruncido.',
    },
    generalClinicalNotes: 'Ejecución rápida y enérgica, con comentarios desafiantes hacia la consigna.',
  },
};
