import { describe, it, expect } from 'vitest';
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
  TestRegistry,
  CLINICAL_VIGNETTES,
  DEFAULT_INSTITUTIONAL_BRANDING,
} from '../../core';

describe('Extended 16-Instrument Psychometric Suite (35 Total Instruments)', () => {
  it('calculates and validates TONI-4 nonverbal intelligence accurately', () => {
    const valid = validateToni4({ rawScore: 30, ageYears: 12 });
    expect(valid.isValid).toBe(true);

    const avgRes = calculateToni4({ rawScore: 30, ageYears: 12 });
    expect(avgRes.indexScore).toBeGreaterThanOrEqual(95);
    expect(avgRes.indexScore).toBeLessThanOrEqual(105);
    expect(avgRes.qualitative).toBe('Promedio');

    const supRes = calculateToni4({ rawScore: 52, ageYears: 12 });
    expect(supRes.indexScore).toBeGreaterThanOrEqual(120);
    expect(supRes.percentile).toBeGreaterThan(90);
  });

  it('calculates and validates DP-3 developmental profile & IGD cutoff', () => {
    const valid = validateDp3({
      scales: { MOT: 100, ADP: 100, SOC: 100, COG: 100, COM: 100 },
    });
    expect(valid.isValid).toBe(true);

    const avgRes = calculateDp3({
      scales: { MOT: 100, ADP: 100, SOC: 100, COG: 100, COM: 100 },
    });
    expect(avgRes.igd.standardScore).toBe(100);
    expect(avgRes.meetsClinicalCutoff).toBe(false);

    const delayRes = calculateDp3({
      scales: { MOT: 65, ADP: 64, SOC: 68, COG: 62, COM: 61 },
    });
    expect(delayRes.igd.standardScore).toBeLessThanOrEqual(69);
    expect(delayRes.meetsClinicalCutoff).toBe(true);
    expect(delayRes.clinicalAlert).toBeDefined();
  });

  it('calculates CUMANES, NEURO-KID and LOLE pediatric neuropsych checklists', () => {
    for (const id of ['cumanes', 'neuro_kid', 'lole'] as const) {
      const v = validateNeuroChecklist(id, { totalRawScore: 50, age: 7 });
      expect(v.isValid).toBe(true);

      const normal = calculateNeuroChecklist(id, {
        totalRawScore: id === 'cumanes' ? 95 : 64,
        age: 7,
      });
      expect(normal.meetsClinicalCutoff).toBe(false);
      expect(normal.decatype).toBeGreaterThanOrEqual(5);

      const low = calculateNeuroChecklist(id, {
        totalRawScore: 18,
        age: 7,
      });
      expect(low.meetsClinicalCutoff).toBe(true);
      expect(low.alertMessage).toBeDefined();
    }
  });

  it('calculates MACI-IV adolescent Millon Base Rates and suicide alert (GG)', () => {
    const valid = validateMaci4({
      rawScores: { V: 0, W: 4 },
      baseRates: { '1': 55, '9': 88, FF: 80, GG: 78 },
    });
    expect(valid.isValid).toBe(true);

    const res = calculateMaci4({
      rawScores: { V: 0, W: 4 },
      baseRates: { '1': 55, '9': 88, FF: 80, GG: 78 },
    });
    expect(res.validity.isValidProtocol).toBe(true);
    expect(res.prominenceScales).toContain('9');
    expect(res.presenceScales).toContain('FF');
    expect(res.suicideRiskAlert.triggered).toBe(true);

    const invalidRes = calculateMaci4({
      rawScores: { V: 2 },
      baseRates: { '9': 88 },
    });
    expect(invalidRes.validity.isValidProtocol).toBe(false);
  });

  it('calculates all 10 extended Likert / T-Score batteries and registers all 35 instruments', () => {
    const extendedIds = [
      'mmpi_rf',
      'mmpi_a_rf',
      'bfq',
      'staxi_2',
      'lsb_50',
      'cecad',
      'brief_a',
      'iac',
      'iccp',
      'ipp_r',
    ] as const;

    for (const id of extendedIds) {
      expect(TestRegistry.has(id)).toBe(true);
      const valid = validateExtendedLikert({ tScores: { SCALE_A: 50, SCALE_B: 72 } });
      expect(valid.isValid).toBe(true);

      const res = calculateExtendedLikert(id, {
        tScores: { SCALE_A: 50, SCALE_B: 72 },
      });
      expect(res.validity.isValidProtocol).toBe(true);
      expect(res.summary.length).toBeGreaterThan(10);
    }
  });

  it('validates all 6 simulated clinical case vignettes and their multi-instrument data slices', () => {
    expect(CLINICAL_VIGNETTES).toHaveLength(6);
    expect(DEFAULT_INSTITUTIONAL_BRANDING.clinicName).toContain('Centro de Neuropsicología');

    for (const vignette of CLINICAL_VIGNETTES) {
      expect(vignette.id.length).toBeGreaterThan(3);
      expect(vignette.code).toMatch(/^SIM-2026-0[1-6]$/);
      expect(vignette.anamnesis.length).toBeGreaterThan(20);
      expect(vignette.expectedDiagnosis.length).toBeGreaterThan(20);
      expect(vignette.keyFindings.length).toBeGreaterThanOrEqual(3);
      expect(vignette.therapeuticRecommendations.length).toBeGreaterThanOrEqual(3);

      // Verify every non-Wechsler battery in vignette.testData computes cleanly via TestRegistry
      for (const [bId, bData] of Object.entries(vignette.testData)) {
        const def = TestRegistry.get(bId);
        expect(def).toBeDefined();
        if (def) {
          expect(def.isCompleted(bData)).toBe(true);
          const calcRes = def.calculate(bData, vignette.demographics);
          expect(calcRes).toBeDefined();
        }
      }
    }
  });
});
