/**
 * Adversarial Clinical Validity & Linguistic Coherence Test Suite
 * Challenger 2 (Milestone M6 — HTP Qualitative Narrative Generator)
 *
 * Objectives:
 * 1. Verify the 3 benchmark profiles (balanced, inhibited, expansive):
 *    - Exactly 5 distinct clinical paragraphs.
 *    - Clinically distinct vocabulary and interpretations (Buck, Hammer, Koppitz).
 *    - Lexical divergence and theoretical concordance.
 * 2. Empirically challenge the treatment of critical indicators:
 *    - Cut/scarred trunks (broken_scarred), severed branches (severed_truncated).
 *    - Excessive shading (excessive).
 *    - Transparencies (hasTransparencies).
 *    - Test whether they are prominently highlighted in the narrative conclusion (Paragraph 5)
 *      or if they are lost/omitted in conclusion logic.
 * 3. Evaluate clean execution and determinism.
 */

import { describe, it, expect } from 'vitest';
import {
  generateHtpFullReport,
  generateFormalSummary,
  generateHouseNarrative,
  generateTreeNarrative,
  generatePersonNarrative,
  generateIntegratedConclusion,
  HTP_BENCHMARK_PROFILES,
  INITIAL_HTP_RECORD,
  HtpAssessmentRecord,
} from '../../core';

describe('Challenger 2: HTP Clinical Validity & Linguistic Coherence Audit', () => {
  // ==========================================================================
  // DIMENSION 1: BENCHMARK PROFILES 5-PARAGRAPH INTEGRITY & DISTINCTIVENESS
  // ==========================================================================
  describe('Dimension 1: Benchmark Profiles (Balanced, Inhibited, Expansive)', () => {
    const presets: ('balanced' | 'inhibited' | 'expansive')[] = ['balanced', 'inhibited', 'expansive'];

    it('C2-BENCH-1: each benchmark profile generates all 5 structurally non-empty narrative paragraphs', () => {
      for (const preset of presets) {
        const record = HTP_BENCHMARK_PROFILES[preset];
        const report = generateHtpFullReport(record);

        // Paragraph 1: Formal Summary
        expect(report.summaryFormal).toBeDefined();
        expect(report.summaryFormal.trim().length).toBeGreaterThan(50);

        // Paragraph 2: House Analysis
        expect(report.houseAnalysis).toBeDefined();
        expect(report.houseAnalysis.trim().length).toBeGreaterThan(50);

        // Paragraph 3: Tree Analysis
        expect(report.treeAnalysis).toBeDefined();
        expect(report.treeAnalysis.trim().length).toBeGreaterThan(50);

        // Paragraph 4: Person Analysis
        expect(report.personAnalysis).toBeDefined();
        expect(report.personAnalysis.trim().length).toBeGreaterThan(50);

        // Paragraph 5: Integrated Conclusion
        expect(report.integratedConclusion).toBeDefined();
        expect(report.integratedConclusion.trim().length).toBeGreaterThan(50);

        // Full narrative text contains all 5 section headers
        expect(report.fullNarrativeText).toContain('1. Resumen de Indicadores Expresivos Generales:');
        expect(report.fullNarrativeText).toContain('2. Dinámica Familiar y Área Afectiva (Casa):');
        expect(report.fullNarrativeText).toContain('3. Estructura del Yo y Estabilidad Emocional Profunda (Árbol):');
        expect(report.fullNarrativeText).toContain('4. Imagen Corporal y Relaciones Interpersonales (Persona):');
        expect(report.fullNarrativeText).toContain('5. Conclusión Cualitativa Integrada:');
      }
    });

    it('C2-BENCH-2: benchmark profiles demonstrate clinically distinct, non-overlapping semantic profiles', () => {
      const balancedReport = generateHtpFullReport(HTP_BENCHMARK_PROFILES.balanced);
      const inhibitedReport = generateHtpFullReport(HTP_BENCHMARK_PROFILES.inhibited);
      const expansiveReport = generateHtpFullReport(HTP_BENCHMARK_PROFILES.expansive);

      // 1. Balanced: must reflect equilibrium, adaptability, warmth, and preserved coping
      expect(balancedReport.fullNarrativeText).toMatch(/equilibrio funcional adaptativo/i);
      expect(balancedReport.fullNarrativeText).toMatch(/calidez afectiva/i);
      expect(balancedReport.fullNarrativeText).toMatch(/adecuado contacto con la realidad/i);
      expect(balancedReport.fullNarrativeText).toMatch(/funcionamiento arm\u00f3nico y adaptativo/i);

      // Balanced must NOT contain pathology markers
      expect(balancedReport.fullNarrativeText).not.toMatch(/micrograf\u00eda/i);
      expect(balancedReport.fullNarrativeText).not.toMatch(/macrograf\u00eda/i);
      expect(balancedReport.fullNarrativeText).not.toMatch(/reactividad agresiva/i);
      expect(balancedReport.fullNarrativeText).not.toMatch(/desarraigo/i);

      // 2. Inhibited: must reflect micro-dimensions, retreat, weakness, anxiety
      expect(inhibitedReport.fullNarrativeText).toMatch(/marcada micrograf\u00eda/i);
      expect(inhibitedReport.fullNarrativeText).toMatch(/inhibici\u00f3n afectiva/i);
      expect(inhibitedReport.fullNarrativeText).toMatch(/desarraigo, labilidad e inseguridad existencial/i);
      expect(inhibitedReport.fullNarrativeText).toMatch(/predominantemente inhibido/i);
      expect(inhibitedReport.fullNarrativeText).toMatch(/defensas perfeccionistas/i);

      // 3. Expansive: must reflect macro-dimensions, intense stroke, rigid defenses, aggressive tension
      expect(expansiveReport.fullNarrativeText).toMatch(/macrograf\u00eda gr\u00e1fica/i);
      expect(expansiveReport.fullNarrativeText).toMatch(/presi\u00f3n del trazo es intensa/i);
      expect(expansiveReport.fullNarrativeText).toMatch(/trazados rectil\u00edneos r\u00edgidos/i);
      expect(expansiveReport.fullNarrativeText).toMatch(/reactividad defensiva hostil/i);
      expect(expansiveReport.fullNarrativeText).toMatch(/pu\u00f1os cerrados/i);
      expect(expansiveReport.fullNarrativeText).toMatch(/reactiva asertivo-agresiva/i);
    });

    it('C2-BENCH-3: theoretical concordance with Buck, Hammer, and Koppitz literature', () => {
      const inhibitedReport = generateHtpFullReport(HTP_BENCHMARK_PROFILES.inhibited);
      const expansiveReport = generateHtpFullReport(HTP_BENCHMARK_PROFILES.expansive);

      // Buck (House = domestic dynamics, intimacy, family environment)
      expect(inhibitedReport.houseAnalysis).toMatch(/refugiarse en la fantas\u00eda intelectualizada/i);
      expect(inhibitedReport.houseAnalysis).toMatch(/enfriamiento afectivo/i);
      expect(expansiveReport.houseAnalysis).toMatch(/humo denso y turbulento/i);
      expect(expansiveReport.houseAnalysis).toMatch(/cercas perimetrales/i);

      // Hammer (Tree = unconscious ego stability, line quality, grounding, scars)
      expect(inhibitedReport.treeAnalysis).toMatch(/desarraigo, labilidad e inseguridad existencial/i);
      expect(inhibitedReport.treeAnalysis).toMatch(/tronco fr\u00e1gil o delgado/i);
      expect(inhibitedReport.treeAnalysis).toMatch(/nudos o huecos/i);
      expect(expansiveReport.treeAnalysis).toMatch(/colina solitaria/i);
      expect(expansiveReport.treeAnalysis).toMatch(/ra\u00edces en garra/i);
      expect(expansiveReport.treeAnalysis).toMatch(/ramas afiladas, puntiagudas o espinosas/i);

      // Koppitz (Person = conscious social contact, body image, facial & limb expressions)
      expect(inhibitedReport.personAnalysis).toMatch(/cabeza peque\u00f1a/i);
      expect(inhibitedReport.personAnalysis).toMatch(/mirada extraviada o angustiada/i);
      expect(inhibitedReport.personAnalysis).toMatch(/ocultaci\u00f3n de los miembros superiores/i);
      expect(expansiveReport.personAnalysis).toMatch(/macrocefalia gr\u00e1fica/i);
      expect(expansiveReport.personAnalysis).toMatch(/hipervigilancia suspicaz/i);
      expect(expansiveReport.personAnalysis).toMatch(/piezas dentarias expuestas/i);
      expect(expansiveReport.personAnalysis).toMatch(/pu\u00f1os cerrados/i);
    });
  });

  // ==========================================================================
  // DIMENSION 2: CRITICAL INDICATORS IN THE NARRATIVE CONCLUSION (Paragraph 5)
  // ==========================================================================
  describe('Dimension 2: Critical Indicators in Narrative Conclusion (Adversarial Probing)', () => {
    it('C2-CRIT-1: cut/scarred trunk (broken_scarred) triggers ego vulnerability in conclusion', () => {
      const recordWithScarredTrunk: HtpAssessmentRecord = {
        ...INITIAL_HTP_RECORD,
        tree: {
          ...INITIAL_HTP_RECORD.tree,
          trunk: 'broken_scarred',
        },
      };

      const report = generateHtpFullReport(recordWithScarredTrunk);

      // Paragraph 3 (Tree) explains the trauma directly
      expect(report.treeAnalysis).toMatch(/tronco quebrado o con marcas lesionales/i);
      expect(report.treeAnalysis).toMatch(/vivencias traum\u00e1ticas/i);

      // Paragraph 5 (Conclusion) should reflect vulnerability
      expect(report.integratedConclusion).toMatch(/fragilidad en las defensas yoicas/i);
      expect(report.integratedConclusion).not.toMatch(/funcionamiento arm\u00f3nico y adaptativo/i);
    });

    it('C2-CRIT-2: transparencies (hasTransparencies) triggers ego vulnerability in conclusion', () => {
      const recordWithTransparencies: HtpAssessmentRecord = {
        ...INITIAL_HTP_RECORD,
        formal: {
          ...INITIAL_HTP_RECORD.formal,
          hasTransparencies: true,
        },
      };

      const report = generateHtpFullReport(recordWithTransparencies);

      // Paragraph 1 (Formal) highlights transparency as alert indicator
      expect(report.summaryFormal).toMatch(/transparencias estructurales/i);
      expect(report.summaryFormal).toMatch(/indicadores de alerta complementarios/i);

      // Paragraph 5 (Conclusion) shifts away from "armónico y adaptativo"
      expect(report.integratedConclusion).toMatch(/fragilidad en las defensas yoicas/i);
      expect(report.integratedConclusion).not.toMatch(/funcionamiento arm\u00f3nico y adaptativo/i);
    });

    it('C2-CRIT-3: severed branches (severed_truncated) triggers vulnerability and critical indicator alert in conclusion', () => {
      // In clinical projective theory (Hammer, Koppitz), severed/truncated branches represent
      // severe trauma, castration anxiety, or mutilation of vital goals.
      const recordWithSeveredBranches: HtpAssessmentRecord = {
        ...INITIAL_HTP_RECORD,
        tree: {
          ...INITIAL_HTP_RECORD.tree,
          branches: 'severed_truncated',
        },
      };

      const report = generateHtpFullReport(recordWithSeveredBranches);

      // In tree narrative, it is described accurately:
      expect(report.treeAnalysis).toMatch(/ramas cortadas o truncadas/i);

      // Remediated clinical behavior: triggers vulnerability and critical indicator alert
      expect(report.integratedConclusion).toMatch(/fragilidad en las defensas yoicas|vulnerabilidad/i);
      expect(report.integratedConclusion).not.toMatch(/funcionamiento arm\u00f3nico y adaptativo/i);
      expect(report.integratedConclusion).toMatch(/ramas cortadas o truncadas/i);
    });

    it('C2-CRIT-4: excessive shading (shading === excessive) triggers vulnerability and critical indicator alert in conclusion', () => {
      // In Hammer (1958), excessive shading is the primary indicator of acute focalized anxiety/conflict.
      const recordWithExcessiveShading: HtpAssessmentRecord = {
        ...INITIAL_HTP_RECORD,
        formal: {
          ...INITIAL_HTP_RECORD.formal,
          shading: 'excessive',
        },
      };

      const report = generateHtpFullReport(recordWithExcessiveShading);

      // In formal summary (Paragraph 1), it IS prominently highlighted:
      expect(report.summaryFormal).toMatch(/sombreado intenso que traduce focalizaci\u00f3n de angustia/i);
      expect(report.summaryFormal).toMatch(/indicadores de alerta complementarios/i);

      // Remediated clinical behavior: triggers vulnerability and critical indicator alert
      expect(report.integratedConclusion).toMatch(/fragilidad en las defensas yoicas|vulnerabilidad/i);
      expect(report.integratedConclusion).not.toMatch(/funcionamiento arm\u00f3nico y adaptativo/i);
      expect(report.integratedConclusion).toMatch(/sombreado excesivo|sombreado intenso/i);
    });

    it('C2-CRIT-5: multi-anomaly profile with erasures highlights vulnerability/trauma and critical alerts without masking', () => {
      const highAlertRecord: HtpAssessmentRecord = {
        ...INITIAL_HTP_RECORD,
        formal: {
          ...INITIAL_HTP_RECORD.formal,
          shading: 'excessive',
          hasTransparencies: true,
          hasExcessiveErasures: true,
          hasOmissions: true,
        },
        tree: {
          ...INITIAL_HTP_RECORD.tree,
          trunk: 'broken_scarred',
          hasKnotsOrHoles: true,
        },
      };

      const report = generateHtpFullReport(highAlertRecord);

      // Formal summary highlights multiple alerts:
      expect(report.summaryFormal).toContain('sombreado intenso');
      expect(report.summaryFormal).toContain('transparencias estructurales');
      expect(report.summaryFormal).toContain('conducta reiterada de borradura');
      expect(report.summaryFormal).toContain('omisiones de partes estructurales');

      // Remediated clinical behavior: underlying vulnerability is NOT masked by erasures
      expect(report.integratedConclusion).toMatch(/fragilidad en las defensas yoicas|vulnerabilidad/i);
      expect(report.integratedConclusion).not.toMatch(/funcionamiento arm\u00f3nico y adaptativo/i);
      expect(report.integratedConclusion).toMatch(/transparencias estructurales/i);
      expect(report.integratedConclusion).toMatch(/tronco quebrado/i);
      expect(report.integratedConclusion).toMatch(/sombreado/i);
    });
  });

  // ==========================================================================
  // DIMENSION 3: LINGUISTIC COHERENCE & GRAMMATICAL COMPLETION
  // ==========================================================================
  describe('Dimension 3: Linguistic Coherence & Syntactic Structure', () => {
    it('C2-LING-1: each paragraph begins with a capital letter and ends with a period', () => {
      const report = generateHtpFullReport(HTP_BENCHMARK_PROFILES.balanced);

      const paragraphs = [
        report.summaryFormal,
        report.houseAnalysis,
        report.treeAnalysis,
        report.personAnalysis,
        report.integratedConclusion,
      ];

      for (const p of paragraphs) {
        expect(p.length).toBeGreaterThan(0);
        // Starts with uppercase or quote followed by uppercase
        expect(p).toMatch(/^[A-Z"¿¡]/);
        // Ends with period or closing quote + period
        expect(p.trim()).toMatch(/\.$/);
      }
    });

    it('C2-LING-2: no un-interpolated placeholders, undefined, null, or [object Object]', () => {
      for (const preset of ['balanced', 'inhibited', 'expansive'] as const) {
        const report = generateHtpFullReport(HTP_BENCHMARK_PROFILES[preset]);
        const fullText = report.fullNarrativeText;

        expect(fullText).not.toContain('undefined');
        expect(fullText).not.toContain('null');
        expect(fullText).not.toContain('[object Object]');
        expect(fullText).not.toContain('NaN');
        expect(fullText).not.toContain('${');
        expect(fullText).not.toContain('{{');
      }
    });

    it('C2-LING-3: field notes are properly escaped in quotes and do not produce double quotes on whitespace', () => {
      const whitespaceNotesRecord: HtpAssessmentRecord = {
        ...INITIAL_HTP_RECORD,
        house: { ...INITIAL_HTP_RECORD.house, observations: '   ' },
        tree: { ...INITIAL_HTP_RECORD.tree, observations: '\t\n ' },
        person: { ...INITIAL_HTP_RECORD.person, observations: '' },
        generalClinicalNotes: '   ',
      };

      const report = generateHtpFullReport(whitespaceNotesRecord);

      expect(report.houseAnalysis).not.toContain('Observación clínica directa: ""');
      expect(report.treeAnalysis).not.toContain('Observación clínica pericial: ""');
      expect(report.personAnalysis).not.toContain('Observación clínica pericial: ""');
      expect(report.integratedConclusion).not.toContain('En concordancia con las observaciones clínicas: ""');
    });
  });
});
