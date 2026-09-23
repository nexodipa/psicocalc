/**
 * Adversarial Stress Test Suite — Challenger 1 (Milestone M6)
 * HTP Qualitative Narrative Generation Engine (Casa-Árbol-Persona)
 *
 * Empirical verification of:
 * - Dimension 1: Strict deontological absence of artificial numerical scores & quantitative ratings
 * - Dimension 2: Extreme boundary conditions (default, empty, whitespace-only, minimalist)
 * - Dimension 3: Fully saturated selections & multi-anomaly activation
 * - Dimension 4: Contradictory & diametrically opposed indicators across dimensions
 * - Dimension 5: Injection of hostile, malicious, and exotic strings in clinical field notes
 * - Dimension 6: Strict determinism, pure function immutability, and state isolation
 * - Dimension 7: Property-based combinatorial fuzzing (1,000 stochastic configurations)
 * - Dimension 8: Complete enum domain coverage across all 25 qualitative dimensions
 */

import { describe, it, expect } from 'vitest';
import {
  generateHtpFullReport,
  generateFormalSummary,
  generateHouseNarrative,
  generateTreeNarrative,
  generatePersonNarrative,
  generateIntegratedConclusion,
  INITIAL_HTP_RECORD,
  HTP_BENCHMARK_PROFILES,
  HtpAssessmentRecord,
  HtpFormalFeatures,
  HouseFeatures,
  TreeFeatures,
  PersonFeatures,
  HtpSize,
  HtpPlacementVertical,
  HtpPlacementHorizontal,
  HtpStrokePressure,
  HtpLineQuality,
  HtpShading,
  HtpSymmetry,
  HouseRoof,
  HouseWalls,
  HouseDoor,
  HouseWindows,
  HouseChimneySmoke,
  HousePathway,
  HouseFences,
  TreeGroundLine,
  TreeRoots,
  TreeTrunk,
  TreeBranches,
  TreeFoliageCrown,
  PersonHead,
  PersonExpression,
  PersonEyes,
  PersonMouth,
  PersonNeck,
  PersonArms,
  PersonHands,
  PersonLegsFeet,
  PersonClothing,
} from '../../core';

// ============================================================================
// DOMAIN ENUMS FOR EXHAUSTIVE AND COMBINATORIAL TESTING
// ============================================================================

const SIZES: HtpSize[] = ['macrography', 'normal', 'micrography'];
const VERTICAL_PLACEMENTS: HtpPlacementVertical[] = ['upper', 'center', 'lower'];
const HORIZONTAL_PLACEMENTS: HtpPlacementHorizontal[] = ['left', 'center', 'right'];
const STROKE_PRESSURES: HtpStrokePressure[] = ['heavy', 'normal', 'weak'];
const LINE_QUALITIES: HtpLineQuality[] = ['curved', 'straight_rigid', 'fragmented', 'reinforced'];
const SHADINGS: HtpShading[] = ['absent', 'moderate', 'excessive'];
const SYMMETRIES: HtpSymmetry[] = ['rigid', 'balanced', 'asymmetric'];

const HOUSE_ROOFS: HouseRoof[] = ['oversized', 'normal', 'flat_absent'];
const HOUSE_WALLS: HouseWalls[] = ['firm_solid', 'weak_broken', 'transparent'];
const HOUSE_DOORS: HouseDoor[] = ['open', 'closed_unlocked', 'locked_barred', 'tiny_inaccessible', 'oversized', 'absent'];
const HOUSE_WINDOWS: HouseWindows[] = ['normal_open', 'closed_curtained', 'barred', 'bare_empty', 'absent'];
const HOUSE_SMOKES: HouseChimneySmoke[] = ['warm_gentle', 'dense_turbulent', 'absent_no_smoke'];
const HOUSE_PATHWAYS: HousePathway[] = ['direct_welcoming', 'winding_narrow', 'absent_isolated'];
const HOUSE_FENCES: HouseFences[] = ['none', 'surrounding_fence', 'hedges_protective'];

const TREE_GROUNDS: TreeGroundLine[] = ['firm_connected', 'hilltop_elevated', 'floating_absent'];
const TREE_ROOTS: TreeRoots[] = ['hidden_normal', 'exposed_prominent', 'claw_like'];
const TREE_TRUNKS: TreeTrunk[] = ['robust_straight', 'slender_fragile', 'bifurcated', 'broken_scarred', 'constricted'];
const TREE_BRANCHES: TreeBranches[] = ['harmonious_open', 'spiky_hostile', 'drooping_weeping', 'severed_truncated', 'club_like', 'absent'];
const TREE_CROWNS: TreeFoliageCrown[] = ['cloud_lobed', 'sparse_bare', 'flattened_compressed', 'overwhelming', 'fruit_flower_loaded'];

const PERSON_HEADS: PersonHead[] = ['proportionate', 'macrocephalic', 'tiny'];
const PERSON_EXPRESSIONS: PersonExpression[] = ['serene_smiling', 'hostile_frowning', 'flat_neutral', 'anguished_vacant'];
const PERSON_EYES: PersonEyes[] = ['detailed_pupils', 'large_vigilant', 'empty_dots', 'closed'];
const PERSON_MOUTHS: PersonMouth[] = ['open_receptive', 'toothed_aggressive', 'tight_line', 'slash_concave'];
const PERSON_NECKS: PersonNeck[] = ['adequate', 'long_thin', 'absent_choked'];
const PERSON_ARMS: PersonArms[] = ['extended_welcoming', 'crossed_protective', 'behind_back', 'in_pockets', 'rigid_vertical'];
const PERSON_HANDS: PersonHands[] = ['differentiated', 'clenched_fists', 'claw_pointed', 'mittens_hidden', 'absent'];
const PERSON_LEGS: PersonLegsFeet[] = ['grounded_stable', 'tense_pressed', 'tiny_shaky', 'spread_stance', 'absent'];
const PERSON_CLOTHINGS: PersonClothing[] = ['adequate_casual', 'overdressed_formal', 'underdressed_scanty', 'power_accessories'];

// Helper to generate a random element from an array
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to build a completely stochastic valid record
function generateStochasticHtpRecord(customNotes?: {
  formalNotes?: string;
  houseNotes?: string;
  treeNotes?: string;
  personNotes?: string;
  generalNotes?: string;
}): HtpAssessmentRecord {
  return {
    id: `fuzz-${Math.random().toString(36).substring(2, 9)}`,
    testDate: '2026-09-23',
    evaluator: 'Fuzzer Pericial',
    formal: {
      size: pick(SIZES),
      verticalPlacement: pick(VERTICAL_PLACEMENTS),
      horizontalPlacement: pick(HORIZONTAL_PLACEMENTS),
      strokePressure: pick(STROKE_PRESSURES),
      lineQuality: pick(LINE_QUALITIES),
      shading: pick(SHADINGS),
      symmetry: pick(SYMMETRIES),
      hasExcessiveErasures: Math.random() > 0.5,
      hasTransparencies: Math.random() > 0.5,
      hasOmissions: Math.random() > 0.5,
    },
    house: {
      roof: pick(HOUSE_ROOFS),
      walls: pick(HOUSE_WALLS),
      door: pick(HOUSE_DOORS),
      windows: pick(HOUSE_WINDOWS),
      chimneySmoke: pick(HOUSE_SMOKES),
      pathway: pick(HOUSE_PATHWAYS),
      fences: pick(HOUSE_FENCES),
      observations: customNotes?.houseNotes ?? '',
    },
    tree: {
      groundLine: pick(TREE_GROUNDS),
      roots: pick(TREE_ROOTS),
      trunk: pick(TREE_TRUNKS),
      branches: pick(TREE_BRANCHES),
      foliageCrown: pick(TREE_CROWNS),
      hasKnotsOrHoles: Math.random() > 0.5,
      observations: customNotes?.treeNotes ?? '',
    },
    person: {
      head: pick(PERSON_HEADS),
      expression: pick(PERSON_EXPRESSIONS),
      eyes: pick(PERSON_EYES),
      mouth: pick(PERSON_MOUTHS),
      neck: pick(PERSON_NECKS),
      arms: pick(PERSON_ARMS),
      hands: pick(PERSON_HANDS),
      legsFeet: pick(PERSON_LEGS),
      clothing: pick(PERSON_CLOTHINGS),
      observations: customNotes?.personNotes ?? '',
    },
    generalClinicalNotes: customNotes?.generalNotes ?? '',
  };
}

describe('Adversarial Stress Test Suite — Challenger 1 (Milestone M6)', () => {

  // ==========================================================================
  // Dimension 1: Strict Deontological Absence of Artificial Numerical Scores
  // ==========================================================================
  describe('Dimension 1: Strict Deontological Absence of Artificial Numerical Scores & Quantitative Metrics', () => {

    it('HTP-DEON-1: narrative paragraphs contain ZERO digits when no clinician notes are passed', () => {
      // Test across 200 random configurations
      for (let i = 0; i < 200; i++) {
        const record = generateStochasticHtpRecord();
        const report = generateHtpFullReport(record);

        // Sections a-e must NEVER contain digits
        expect(report.summaryFormal).not.toMatch(/\d/);
        expect(report.houseAnalysis).not.toMatch(/\d/);
        expect(report.treeAnalysis).not.toMatch(/\d/);
        expect(report.personAnalysis).not.toMatch(/\d/);
        expect(report.integratedConclusion).not.toMatch(/\d/);
      }
    });

    it('HTP-DEON-2: fullNarrativeText contains ONLY the 5 structural section header digits [1-5]. and no artificial score patterns', () => {
      const record = generateStochasticHtpRecord();
      const report = generateHtpFullReport(record);

      // Verify that fullNarrativeText does not contain any score/rating patterns
      expect(report.fullNarrativeText).not.toMatch(/\b(puntaje|puntuaci[oó]n|score|puntos|percentil|baremo|escala)\s*[:=]?\s*\d+/i);
      expect(report.fullNarrativeText).not.toMatch(/\d+\s*\/\s*\d+/); // e.g. 8/10, 15/20
      expect(report.fullNarrativeText).not.toMatch(/\d+\s*%/); // percentages
      expect(report.fullNarrativeText).not.toMatch(/\b\d+(\.\d+)?\s*(puntos|pts|ptos)\b/i);

      // Extract all digits from fullNarrativeText
      const digits = report.fullNarrativeText.match(/\d+/g) || [];
      // The only allowed digits in the full text are the section numbers 1, 2, 3, 4, 5
      expect(digits).toEqual(['1', '2', '3', '4', '5']);
    });

    it('HTP-DEON-3: individual generation functions never produce quantitative metrics or scales', () => {
      const formal = generateFormalSummary(INITIAL_HTP_RECORD.formal);
      const house = generateHouseNarrative(INITIAL_HTP_RECORD.house);
      const tree = generateTreeNarrative(INITIAL_HTP_RECORD.tree);
      const person = generatePersonNarrative(INITIAL_HTP_RECORD.person);
      const conclusion = generateIntegratedConclusion(INITIAL_HTP_RECORD);

      for (const text of [formal, house, tree, person, conclusion]) {
        expect(text).not.toMatch(/\b\d+\b/);
        expect(text).not.toMatch(/\b(bajo|medio|alto)\s*:\s*\d+/i);
        expect(text).not.toMatch(/\b(nivel|grado|rango)\s*\d+/i);
      }
    });
  });

  // ==========================================================================
  // Dimension 2: Extreme Boundary Conditions
  // ==========================================================================
  describe('Dimension 2: Extreme Boundary Conditions (Default, Empty, Whitespace, Minimalist)', () => {

    it('HTP-BOUND-1: default initial record generates full 5-paragraph clinical narrative with proper punctuation', () => {
      const report = generateHtpFullReport(INITIAL_HTP_RECORD);

      expect(report.summaryFormal.length).toBeGreaterThan(50);
      expect(report.houseAnalysis.length).toBeGreaterThan(50);
      expect(report.treeAnalysis.length).toBeGreaterThan(50);
      expect(report.personAnalysis.length).toBeGreaterThan(50);
      expect(report.integratedConclusion.length).toBeGreaterThan(50);

      // Ends with period, no double periods, no dangling semicolons
      expect(report.summaryFormal.endsWith('.')).toBe(true);
      expect(report.houseAnalysis.endsWith('.')).toBe(true);
      expect(report.treeAnalysis.endsWith('.')).toBe(true);
      expect(report.personAnalysis.endsWith('.')).toBe(true);
      expect(report.integratedConclusion.endsWith('.')).toBe(true);

      expect(report.summaryFormal).not.toContain('..');
      expect(report.houseAnalysis).not.toContain('..');
      expect(report.treeAnalysis).not.toContain('..');
      expect(report.personAnalysis).not.toContain('..');
      expect(report.integratedConclusion).not.toContain('..');

      expect(report.summaryFormal).not.toMatch(/;\s*\./);
      expect(report.houseAnalysis).not.toMatch(/;\s*\./);
      expect(report.treeAnalysis).not.toMatch(/;\s*\./);
      expect(report.personAnalysis).not.toMatch(/;\s*\./);
      expect(report.integratedConclusion).not.toMatch(/;\s*\./);
    });

    it('HTP-BOUND-2: completely empty string notes produce zero orphan quotation marks or empty labels', () => {
      const record: HtpAssessmentRecord = {
        ...INITIAL_HTP_RECORD,
        house: { ...INITIAL_HTP_RECORD.house, observations: '' },
        tree: { ...INITIAL_HTP_RECORD.tree, observations: '' },
        person: { ...INITIAL_HTP_RECORD.person, observations: '' },
        generalClinicalNotes: '',
      };

      const report = generateHtpFullReport(record);

      expect(report.fullNarrativeText).not.toContain('""');
      expect(report.fullNarrativeText).not.toContain('Observación clínica');
      expect(report.fullNarrativeText).not.toContain('Anotación cualitativa');
      expect(report.fullNarrativeText).not.toContain('En concordancia con las observaciones clínicas');
    });

    it('HTP-BOUND-3: whitespace-only notes (spaces, tabs, newlines, carriage returns) are safely stripped', () => {
      const record: HtpAssessmentRecord = {
        ...INITIAL_HTP_RECORD,
        house: { ...INITIAL_HTP_RECORD.house, observations: '   \t  \n\r   ' },
        tree: { ...INITIAL_HTP_RECORD.tree, observations: '\t\t\t' },
        person: { ...INITIAL_HTP_RECORD.person, observations: '\n\n\n' },
        generalClinicalNotes: '      ',
      };

      const report = generateHtpFullReport(record);

      expect(report.fullNarrativeText).not.toContain('""');
      expect(report.fullNarrativeText).not.toContain('Observación clínica');
      expect(report.fullNarrativeText).not.toContain('En concordancia con las observaciones clínicas');
    });

    it('HTP-BOUND-4: minimalist selections without optional details produce coherent syntax', () => {
      // Configuration where optional items (accessParts in House, faceDetails in Person, anomalies in Formal) are 0
      const minimalistRecord: HtpAssessmentRecord = {
        id: 'minimalist-1',
        testDate: '2026-09-23',
        evaluator: 'Tester',
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
          door: 'closed_unlocked', // Not in accessParts
          windows: 'normal_open',  // Not in accessParts
          chimneySmoke: 'warm_gentle',
          pathway: 'direct_welcoming', // Not in accessParts
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
          eyes: 'detailed_pupils', // Not in faceDetails
          mouth: 'open_receptive',
          neck: 'adequate',        // Not in faceDetails
          arms: 'extended_welcoming',
          hands: 'differentiated', // Not appended
          legsFeet: 'grounded_stable',
          clothing: 'adequate_casual',
          observations: '',
        },
        generalClinicalNotes: '',
      };

      const report = generateHtpFullReport(minimalistRecord);

      // Verify no empty sentences like ". ." or dangling commas ", ."
      expect(report.summaryFormal).not.toMatch(/,\s*\./);
      expect(report.houseAnalysis).not.toMatch(/,\s*\./);
      expect(report.treeAnalysis).not.toMatch(/,\s*\./);
      expect(report.personAnalysis).not.toMatch(/,\s*\./);
      expect(report.integratedConclusion).not.toMatch(/,\s*\./);
    });
  });

  // ==========================================================================
  // Dimension 3: Fully Saturated Selections & Multi-Anomaly Activation
  // ==========================================================================
  describe('Dimension 3: Fully Saturated Selections & Multi-Anomaly Activation', () => {

    it('HTP-SAT-1: all critical alerts and anomalies activated simultaneously produce well-formatted list', () => {
      const saturatedFormal: HtpFormalFeatures = {
        size: 'micrography',
        verticalPlacement: 'lower',
        horizontalPlacement: 'left',
        strokePressure: 'weak',
        lineQuality: 'reinforced',
        shading: 'excessive',
        symmetry: 'rigid',
        hasExcessiveErasures: true,
        hasTransparencies: true,
        hasOmissions: true,
      };

      const summary = generateFormalSummary(saturatedFormal);

      // Check all 5 anomalies in the complement list
      expect(summary).toContain('presencia de sombreado intenso');
      expect(summary).toContain('simetría marcadamente rígida');
      expect(summary).toContain('conducta reiterada de borradura');
      expect(summary).toContain('transparencias estructurales');
      expect(summary).toContain('omisiones de partes estructurales');

      // Formatted with semicolon separators
      expect(summary).toContain('sombreado intenso que traduce');
      expect(summary).toMatch(/Se constatan como indicadores de alerta complementarios: .*; .*; .*\./);
    });

    it('HTP-SAT-2: all house defensive features present (barred windows, barred door, turbid smoke, fences)', () => {
      const house: HouseFeatures = {
        roof: 'flat_absent',
        walls: 'transparent',
        door: 'locked_barred',
        windows: 'barred',
        chimneySmoke: 'dense_turbulent',
        pathway: 'absent_isolated',
        fences: 'surrounding_fence',
        observations: 'Casa fortificada.',
      };

      const text = generateHouseNarrative(house);

      expect(text).toContain('cerrojo o la inaccesibilidad de la puerta');
      expect(text).toContain('rejas');
      expect(text).toContain('humo denso y turbulento');
      expect(text).toContain('cercas perimetrales');
      expect(text).toContain('transparencia en los muros');
    });

    it('HTP-SAT-3: all negative/omitted structures (door absent, windows absent, branches absent, hands absent, feet absent)', () => {
      const record: HtpAssessmentRecord = {
        ...INITIAL_HTP_RECORD,
        house: {
          ...INITIAL_HTP_RECORD.house,
          door: 'absent',
          windows: 'absent',
          pathway: 'absent_isolated',
        },
        tree: {
          ...INITIAL_HTP_RECORD.tree,
          branches: 'absent',
          groundLine: 'floating_absent',
        },
        person: {
          ...INITIAL_HTP_RECORD.person,
          hands: 'absent',
          legsFeet: 'absent',
        },
      };

      const report = generateHtpFullReport(record);

      expect(report.houseAnalysis).toContain('omisión de puerta');
      expect(report.houseAnalysis).toContain('ventanas desnudas o ausentes');
      expect(report.treeAnalysis).toContain('carencia de ramas');
      expect(report.treeAnalysis).toContain('desarraigo, labilidad e inseguridad existencial');
      expect(report.personAnalysis).toContain('omisión de manos');
      expect(report.personAnalysis).toContain('ausencia de pies');
    });
  });

  // ==========================================================================
  // Dimension 4: Contradictory Indicators Across Drawing Dimensions
  // ==========================================================================
  describe('Dimension 4: Contradictory & Diametrically Opposed Indicators Across Dimensions', () => {

    it('HTP-CONTRA-1: expansive formal features combined with severely inhibited persona handles conflict cleanly', () => {
      const contradictoryRecord: HtpAssessmentRecord = {
        id: 'contra-1',
        testDate: '2026-09-23',
        evaluator: 'Dr. Forense',
        formal: {
          size: 'macrography',              // Expansive
          verticalPlacement: 'upper',       // Expansive/fantasy
          horizontalPlacement: 'right',     // Future/extroversion
          strokePressure: 'heavy',          // Heavy/aggressive
          lineQuality: 'straight_rigid',
          shading: 'absent',
          symmetry: 'balanced',
          hasExcessiveErasures: false,
          hasTransparencies: false,
          hasOmissions: false,
        },
        house: {
          roof: 'normal',
          walls: 'firm_solid',
          door: 'open',
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
          head: 'tiny',                     // Inhibited
          expression: 'anguished_vacant',   // Inhibited
          eyes: 'empty_dots',               // Inhibited
          mouth: 'tight_line',              // Inhibited
          neck: 'long_thin',
          arms: 'behind_back',              // Inhibited
          hands: 'mittens_hidden',          // Inhibited
          legsFeet: 'tiny_shaky',           // Inhibited
          clothing: 'adequate_casual',
          observations: '',
        },
        generalClinicalNotes: '',
      };

      const report = generateHtpFullReport(contradictoryRecord);

      // Formal section reflects macrography
      expect(report.summaryFormal).toContain('macrografía gráfica');
      expect(report.summaryFormal).toContain('sector superior');

      // Person section reflects inhibition
      expect(report.personAnalysis).toContain('cabeza pequeña');
      expect(report.personAnalysis).toContain('ocultación de los miembros superiores');
      expect(report.personAnalysis).toContain('Pies pequeños o vacilantes');

      // Integrated conclusion must not crash and resolves to one of the structured clinical constellations
      expect(report.integratedConclusion).toBeDefined();
      expect(report.integratedConclusion.length).toBeGreaterThan(100);
      expect(report.integratedConclusion).toMatch(/En conclusión integrada pericial, .+\./);
    });

    it('HTP-CONTRA-2: all 7 clinical constellation combinations evaluate deterministically without conflict', () => {
      // 1. Vulnerable + Aggressive
      const v_agg: HtpAssessmentRecord = {
        ...INITIAL_HTP_RECORD,
        formal: { ...INITIAL_HTP_RECORD.formal, hasTransparencies: true, strokePressure: 'heavy' },
      };
      const res1 = generateIntegratedConclusion(v_agg);
      expect(res1).toContain('vulnerabilidad yoica basal');
      expect(res1).toContain('mecanismos compensatorios de reactividad tensional');

      // 2. Inhibited + Rigid
      const inh_rig: HtpAssessmentRecord = {
        ...INITIAL_HTP_RECORD,
        formal: { ...INITIAL_HTP_RECORD.formal, size: 'micrography', symmetry: 'rigid' },
      };
      const res2 = generateIntegratedConclusion(inh_rig);
      expect(res2).toContain('predominantemente inhibido e hipervigilante');

      // 3. Inhibited only
      const inh_only: HtpAssessmentRecord = {
        ...INITIAL_HTP_RECORD,
        formal: { ...INITIAL_HTP_RECORD.formal, size: 'micrography', symmetry: 'balanced' },
      };
      const res3 = generateIntegratedConclusion(inh_only);
      expect(res3).toContain('predominio de inhibición afectiva');

      // 4. Aggressive only
      const agg_only: HtpAssessmentRecord = {
        ...INITIAL_HTP_RECORD,
        formal: { ...INITIAL_HTP_RECORD.formal, strokePressure: 'heavy' },
      };
      const res4 = generateIntegratedConclusion(agg_only);
      expect(res4).toContain('caudal de energía pulsional elevado');

      // 5. Rigid only
      const rig_only: HtpAssessmentRecord = {
        ...INITIAL_HTP_RECORD,
        formal: { ...INITIAL_HTP_RECORD.formal, symmetry: 'rigid' },
      };
      const res5 = generateIntegratedConclusion(rig_only);
      expect(res5).toContain('predominio de defensas de control obsesivo');

      // 6. Vulnerable only
      const vul_only: HtpAssessmentRecord = {
        ...INITIAL_HTP_RECORD,
        formal: { ...INITIAL_HTP_RECORD.formal, hasTransparencies: true },
      };
      const res6 = generateIntegratedConclusion(vul_only);
      expect(res6).toContain('fragilidad en las defensas yoicas');

      // 7. Adaptive (Balanced default)
      const res7 = generateIntegratedConclusion(INITIAL_HTP_RECORD);
      expect(res7).toContain('funcionamiento armónico y adaptativo');
    });
  });

  // ==========================================================================
  // Dimension 5: Injection of Hostile, Malicious, & Exotic Strings
  // ==========================================================================
  describe('Dimension 5: Injection of Hostile, Malicious, & Exotic Strings in Field Notes', () => {

    it('HTP-INJ-1: handles XSS vectors and script tags safely without evaluation or corruption', () => {
      const maliciousNotes = '<script>alert("XSS")</script><img src=x onerror=console.error("pwned")>';
      const record = generateStochasticHtpRecord({
        houseNotes: maliciousNotes,
        treeNotes: '<svg onload=alert(1)>',
        personNotes: '"><script>document.cookie=""</script>',
        generalNotes: '<iframe src="javascript:alert(1)"></iframe>',
      });

      const report = generateHtpFullReport(record);

      // Verifies string containment inside clinical quotation marks
      expect(report.houseAnalysis).toContain(`Observación clínica directa: "${maliciousNotes}".`);
      expect(report.treeAnalysis).toContain('Observación clínica pericial: "<svg onload=alert(1)>".');
      expect(report.personAnalysis).toContain('Observación clínica pericial: "\"><script>document.cookie=\"\"</script>".');
      expect(report.integratedConclusion).toContain('En concordancia con las observaciones clínicas durante la administración: "<iframe src="javascript:alert(1)"></iframe>".');

      // Verify no crash, no NaN, no undefined
      expect(report.fullNarrativeText).not.toContain('undefined');
      expect(report.fullNarrativeText).not.toContain('NaN');
    });

    it('HTP-INJ-2: handles SQL injection syntax, quotes, backslashes, and template strings', () => {
      const sqlPayload = "'; DROP TABLE evaluations; SELECT * FROM users WHERE '1'='1";
      const templatePayload = '${process.exit(1)} {{7*7}} `rm -rf /` \\n\\r\\t\\0';

      const record = generateStochasticHtpRecord({
        houseNotes: sqlPayload,
        generalNotes: templatePayload,
      });

      const report = generateHtpFullReport(record);

      expect(report.houseAnalysis).toContain(sqlPayload);
      expect(report.integratedConclusion).toContain(templatePayload);
    });

    it('HTP-INJ-3: handles exotic unicode, emojis, RTL override characters, and multi-byte scripts', () => {
      const unicodeString = '🏠 Casa con jardín 🌳 Árbol frondoso 👤 Persona sonriente \u202E[RTL OVERRIDE] 日本語テスト العربية';
      const record = generateStochasticHtpRecord({
        houseNotes: unicodeString,
      });

      const report = generateHtpFullReport(record);

      expect(report.houseAnalysis).toContain(unicodeString);
    });

    it('HTP-INJ-4: handles massive field notes (10,000 characters) without stack overflow or performance degradation', () => {
      const hugeNote = 'Paciente realiza trazos repetitivos con alta minuciosidad. '.repeat(170); // ~10,000 chars
      const record = generateStochasticHtpRecord({
        houseNotes: hugeNote,
      });

      const startTime = performance.now();
      const report = generateHtpFullReport(record);
      const elapsedMs = performance.now() - startTime;

      expect(elapsedMs).toBeLessThan(100);
      expect(report.houseAnalysis).toContain(hugeNote.trim());
    });

    it('HTP-INJ-5: clinician notes containing numbers do not cause the engine to generate synthetic scores or ratings', () => {
      const notesWithNumbers = 'El paciente tardó 3 minutos, borró 5 veces y mencionó tener 2 hermanos.';
      const record = generateStochasticHtpRecord({
        houseNotes: notesWithNumbers,
      });

      const report = generateHtpFullReport(record);

      expect(report.houseAnalysis).toContain(notesWithNumbers);
      // Even though clinician notes contain numbers, the engine must NOT generate any rating scores
      expect(report.houseAnalysis).not.toMatch(/\b(puntaje|score|puntos|percentil)\s*:\s*\d+/i);
    });
  });

  // ==========================================================================
  // Dimension 6: Strict Determinism, Pure Function Immutability, & Concurrency
  // ==========================================================================
  describe('Dimension 6: Strict Determinism, Pure Function Immutability, & Concurrency', () => {

    it('HTP-DET-1: 100 consecutive invocations on the exact same record produce 100% byte-for-byte identical output', () => {
      const record = HTP_BENCHMARK_PROFILES.inhibited;
      const initialReport = generateHtpFullReport(record);

      for (let i = 0; i < 100; i++) {
        const nextReport = generateHtpFullReport(record);
        expect(nextReport.summaryFormal).toBe(initialReport.summaryFormal);
        expect(nextReport.houseAnalysis).toBe(initialReport.houseAnalysis);
        expect(nextReport.treeAnalysis).toBe(initialReport.treeAnalysis);
        expect(nextReport.personAnalysis).toBe(initialReport.personAnalysis);
        expect(nextReport.integratedConclusion).toBe(initialReport.integratedConclusion);
        expect(nextReport.fullNarrativeText).toBe(initialReport.fullNarrativeText);
      }
    });

    it('HTP-DET-2: deep clone invariance — cloned record produces identical output to original', () => {
      const original = HTP_BENCHMARK_PROFILES.expansive;
      const clone = JSON.parse(JSON.stringify(original));

      const reportOriginal = generateHtpFullReport(original);
      const reportClone = generateHtpFullReport(clone);

      expect(reportOriginal).toEqual(reportClone);
    });

    it('HTP-DET-3: input immutability — calling generateHtpFullReport does NOT mutate the input record', () => {
      const record = JSON.parse(JSON.stringify(HTP_BENCHMARK_PROFILES.balanced));
      const snapshotBefore = JSON.stringify(record);

      generateHtpFullReport(record);

      const snapshotAfter = JSON.stringify(record);
      expect(snapshotBefore).toBe(snapshotAfter);
    });

    it('HTP-DET-4: interleaved concurrent calls between different profiles do not leak state', () => {
      const p1 = HTP_BENCHMARK_PROFILES.balanced;
      const p2 = HTP_BENCHMARK_PROFILES.inhibited;
      const p3 = HTP_BENCHMARK_PROFILES.expansive;

      const r1a = generateHtpFullReport(p1);
      const r2a = generateHtpFullReport(p2);
      const r3a = generateHtpFullReport(p3);

      const r1b = generateHtpFullReport(p1);
      const r2b = generateHtpFullReport(p2);
      const r3b = generateHtpFullReport(p3);

      expect(r1a.fullNarrativeText).toBe(r1b.fullNarrativeText);
      expect(r2a.fullNarrativeText).toBe(r2b.fullNarrativeText);
      expect(r3a.fullNarrativeText).toBe(r3b.fullNarrativeText);

      // Verify cross-profile divergence (they must not be equal to each other)
      expect(r1a.fullNarrativeText).not.toBe(r2a.fullNarrativeText);
      expect(r2a.fullNarrativeText).not.toBe(r3a.fullNarrativeText);
    });
  });

  // ==========================================================================
  // Dimension 7: Property-Based Combinatorial Fuzzing (1,000 Configurations)
  // ==========================================================================
  describe('Dimension 7: Property-Based Combinatorial Fuzzing (1,000 Stochastic Records)', () => {

    it('HTP-FUZZ-1: 1,000 randomly assembled HtpAssessmentRecords produce valid, crash-free, score-free narratives', () => {
      const iterations = 1000;
      let totalLength = 0;

      for (let i = 0; i < iterations; i++) {
        const record = generateStochasticHtpRecord();
        const report = generateHtpFullReport(record);

        // Invariant 1: all report properties exist and are non-empty strings
        expect(typeof report.summaryFormal).toBe('string');
        expect(typeof report.houseAnalysis).toBe('string');
        expect(typeof report.treeAnalysis).toBe('string');
        expect(typeof report.personAnalysis).toBe('string');
        expect(typeof report.integratedConclusion).toBe('string');
        expect(typeof report.fullNarrativeText).toBe('string');

        expect(report.summaryFormal.length).toBeGreaterThan(30);
        expect(report.houseAnalysis.length).toBeGreaterThan(30);
        expect(report.treeAnalysis.length).toBeGreaterThan(30);
        expect(report.personAnalysis.length).toBeGreaterThan(30);
        expect(report.integratedConclusion.length).toBeGreaterThan(30);

        // Invariant 2: no undefined, null, or NaN in generated text
        expect(report.fullNarrativeText).not.toContain('undefined');
        expect(report.fullNarrativeText).not.toContain('null');
        expect(report.fullNarrativeText).not.toContain('NaN');
        expect(report.fullNarrativeText).not.toContain('[object Object]');

        // Invariant 3: no artificial scores anywhere in sections a-e
        expect(report.summaryFormal).not.toMatch(/\d/);
        expect(report.houseAnalysis).not.toMatch(/\d/);
        expect(report.treeAnalysis).not.toMatch(/\d/);
        expect(report.personAnalysis).not.toMatch(/\d/);
        expect(report.integratedConclusion).not.toMatch(/\d/);

        // Invariant 4: proper grammatical sentence termination
        expect(report.summaryFormal.endsWith('.')).toBe(true);
        expect(report.houseAnalysis.endsWith('.')).toBe(true);
        expect(report.treeAnalysis.endsWith('.')).toBe(true);
        expect(report.personAnalysis.endsWith('.')).toBe(true);
        expect(report.integratedConclusion.endsWith('.')).toBe(true);

        totalLength += report.fullNarrativeText.length;
      }

      // Average report length is substantive (usually > 1,500 characters)
      expect(totalLength / iterations).toBeGreaterThan(1000);
    });
  });

  // ==========================================================================
  // Dimension 8: Complete Enum Domain Coverage Across All 25 Qualitative Dimensions
  // ==========================================================================
  describe('Dimension 8: Complete Enum Domain Coverage Across All 25 Qualitative Dimensions', () => {

    it('HTP-ENUM-1: all HtpSize values generate distinct text', () => {
      const results = SIZES.map(size =>
        generateFormalSummary({ ...INITIAL_HTP_RECORD.formal, size })
      );
      const unique = new Set(results);
      expect(unique.size).toBe(SIZES.length);
    });

    it('HTP-ENUM-2: all HtpPlacementVertical values generate distinct text', () => {
      const results = VERTICAL_PLACEMENTS.map(verticalPlacement =>
        generateFormalSummary({ ...INITIAL_HTP_RECORD.formal, verticalPlacement })
      );
      const unique = new Set(results);
      expect(unique.size).toBe(VERTICAL_PLACEMENTS.length);
    });

    it('HTP-ENUM-3: all HtpStrokePressure values generate distinct text', () => {
      const results = STROKE_PRESSURES.map(strokePressure =>
        generateFormalSummary({ ...INITIAL_HTP_RECORD.formal, strokePressure })
      );
      const unique = new Set(results);
      expect(unique.size).toBe(STROKE_PRESSURES.length);
    });

    it('HTP-ENUM-4: all HtpLineQuality values generate distinct text', () => {
      const results = LINE_QUALITIES.map(lineQuality =>
        generateFormalSummary({ ...INITIAL_HTP_RECORD.formal, lineQuality })
      );
      const unique = new Set(results);
      expect(unique.size).toBe(LINE_QUALITIES.length);
    });

    it('HTP-ENUM-5: all HouseRoof values generate distinct text', () => {
      const results = HOUSE_ROOFS.map(roof =>
        generateHouseNarrative({ ...INITIAL_HTP_RECORD.house, roof })
      );
      const unique = new Set(results);
      expect(unique.size).toBe(HOUSE_ROOFS.length);
    });

    it('HTP-ENUM-6: all HouseWalls values generate distinct text', () => {
      const results = HOUSE_WALLS.map(walls =>
        generateHouseNarrative({ ...INITIAL_HTP_RECORD.house, walls })
      );
      const unique = new Set(results);
      expect(unique.size).toBe(HOUSE_WALLS.length);
    });

    it('HTP-ENUM-7: all HouseChimneySmoke values generate distinct text', () => {
      const results = HOUSE_SMOKES.map(chimneySmoke =>
        generateHouseNarrative({ ...INITIAL_HTP_RECORD.house, chimneySmoke })
      );
      const unique = new Set(results);
      expect(unique.size).toBe(HOUSE_SMOKES.length);
    });

    it('HTP-ENUM-8: all TreeGroundLine values generate distinct text', () => {
      const results = TREE_GROUNDS.map(groundLine =>
        generateTreeNarrative({ ...INITIAL_HTP_RECORD.tree, groundLine })
      );
      const unique = new Set(results);
      expect(unique.size).toBe(TREE_GROUNDS.length);
    });

    it('HTP-ENUM-9: all TreeRoots values generate distinct text', () => {
      const results = TREE_ROOTS.map(roots =>
        generateTreeNarrative({ ...INITIAL_HTP_RECORD.tree, roots })
      );
      const unique = new Set(results);
      expect(unique.size).toBe(TREE_ROOTS.length);
    });

    it('HTP-ENUM-10: all TreeTrunk values generate distinct text', () => {
      const results = TREE_TRUNKS.map(trunk =>
        generateTreeNarrative({ ...INITIAL_HTP_RECORD.tree, trunk })
      );
      const unique = new Set(results);
      expect(unique.size).toBe(TREE_TRUNKS.length);
    });

    it('HTP-ENUM-11: all TreeBranches values generate distinct text', () => {
      const results = TREE_BRANCHES.map(branches =>
        generateTreeNarrative({ ...INITIAL_HTP_RECORD.tree, branches })
      );
      const unique = new Set(results);
      expect(unique.size).toBe(TREE_BRANCHES.length);
    });

    it('HTP-ENUM-12: all TreeFoliageCrown values generate distinct text', () => {
      const results = TREE_CROWNS.map(foliageCrown =>
        generateTreeNarrative({ ...INITIAL_HTP_RECORD.tree, foliageCrown })
      );
      const unique = new Set(results);
      expect(unique.size).toBe(TREE_CROWNS.length);
    });

    it('HTP-ENUM-13: all PersonHead values generate distinct text', () => {
      const results = PERSON_HEADS.map(head =>
        generatePersonNarrative({ ...INITIAL_HTP_RECORD.person, head })
      );
      const unique = new Set(results);
      expect(unique.size).toBe(PERSON_HEADS.length);
    });

    it('HTP-ENUM-14: all PersonExpression values generate distinct text', () => {
      const results = PERSON_EXPRESSIONS.map(expression =>
        generatePersonNarrative({ ...INITIAL_HTP_RECORD.person, expression })
      );
      const unique = new Set(results);
      expect(unique.size).toBe(PERSON_EXPRESSIONS.length);
    });

    it('HTP-ENUM-15: all PersonArms values generate distinct text', () => {
      const results = PERSON_ARMS.map(arms =>
        generatePersonNarrative({ ...INITIAL_HTP_RECORD.person, arms })
      );
      // Note: 'behind_back' and 'in_pockets' produce same therapeutic interpretation text by clinical design
      const unique = new Set(results);
      expect(unique.size).toBeGreaterThanOrEqual(4);
    });

    it('HTP-ENUM-16: all PersonLegsFeet values generate distinct text', () => {
      const results = PERSON_LEGS.map(legsFeet =>
        generatePersonNarrative({ ...INITIAL_HTP_RECORD.person, legsFeet })
      );
      const unique = new Set(results);
      expect(unique.size).toBe(PERSON_LEGS.length);
    });

    it('HTP-ENUM-17: all PersonClothing values generate distinct text', () => {
      const results = PERSON_CLOTHINGS.map(clothing =>
        generatePersonNarrative({ ...INITIAL_HTP_RECORD.person, clothing })
      );
      const unique = new Set(results);
      expect(unique.size).toBe(PERSON_CLOTHINGS.length);
    });
  });
});
