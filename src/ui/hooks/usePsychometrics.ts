import { useMemo, useState, useCallback } from 'react';
import {
  BatteryType,
  CompositeResult,
  DiscrepancyResult,
  PatientDemographics,
  StrengthWeaknessResult,
  SubtestId,
  calculateWiscV,
  calculateWaisIV,
  validateAgeAndBattery,
  validateScaledScore,
  WISC_V_SUBTESTS,
  WAIS_IV_SUBTESTS,
} from '../../core';

export interface UsePsychometricsReturn {
  battery: BatteryType;
  setBattery: (battery: BatteryType) => void;
  demographics: PatientDemographics;
  setDemographics: (updater: Partial<PatientDemographics>) => void;
  toggleAnonymize: () => void;
  displayName: string;
  subtests: Partial<Record<SubtestId, number>>;
  rawInputs: Record<string, string>;
  setSubtestScore: (id: SubtestId, score: number | null, rawText?: string) => void;
  clearAllScores: () => void;
  loadSampleProfile: (type: 'average' | 'gifted' | 'adhd') => void;
  primaryIndices: Record<string, CompositeResult | null>;
  cit: CompositeResult | null;
  ancillaryIndices: Record<string, CompositeResult | null>;
  discrepancies: DiscrepancyResult[];
  strengthsWeaknesses: StrengthWeaknessResult[];
  isCompleteCit: boolean;
  ageValidation: ReturnType<typeof validateAgeAndBattery>;
  invalidSubtests: Record<string, string>;
  hasInvalidScores: boolean;
  administeredSubtestCount: number;
}

export function anonymizeName(fullName: string): string {
  if (!fullName || !fullName.trim()) return '';
  const tokens = fullName.trim().split(/\s+/);
  return tokens.map((t) => (t.length > 0 ? `${t[0].toUpperCase()}.` : '')).join(' ');
}

// Sample presets for quick testing and clinical demonstration
const WISC_V_SAMPLES = {
  average: { S: 10, V: 10, C: 10, PV: 10, M: 10, B: 10, D: 10, SD: 10, CL: 10, BS: 10 },
  gifted: { S: 17, V: 18, C: 16, PV: 15, M: 16, B: 17, D: 14, SD: 15, CL: 12, BS: 13 },
  adhd: { S: 13, V: 12, C: 11, PV: 10, M: 12, B: 11, D: 6, SD: 7, CL: 5, BS: 6 },
};

const WAIS_IV_SAMPLES = {
  average: {
    WAIS_C: 10, WAIS_S: 10, WAIS_D: 10, WAIS_M: 10, WAIS_V: 10,
    WAIS_A: 10, WAIS_BS: 10, WAIS_PV: 10, WAIS_I: 10, WAIS_CN: 10,
  },
  gifted: {
    WAIS_C: 14, WAIS_S: 16, WAIS_D: 15, WAIS_M: 15, WAIS_V: 16,
    WAIS_A: 14, WAIS_BS: 13, WAIS_PV: 14, WAIS_I: 15, WAIS_CN: 13,
  },
  adhd: {
    WAIS_C: 6, WAIS_S: 10, WAIS_D: 5, WAIS_M: 7, WAIS_V: 12,
    WAIS_A: 6, WAIS_BS: 4, WAIS_PV: 6, WAIS_I: 11, WAIS_CN: 3,
  },
};

export function usePsychometrics(): UsePsychometricsReturn {
  const [battery, setBatteryState] = useState<BatteryType>('WISC-V');

  const [demographics, setDemographicsState] = useState<PatientDemographics>({
    nameOrId: 'Lucas Fernández Gómez',
    birthDate: '2016-04-08',
    testDate: '2026-09-22',
    examiner: 'Lic. Roberto Gómez (Col. M-3918)',
    reasonForEvaluation: 'Evaluación del perfil neurocognitivo y descarte de dificultades específicas de aprendizaje',
    isAnonymized: false,
  });

  const [originalName, setOriginalName] = useState<string>('Lucas Fernández Gómez');

  // Subtest scores state
  const [subtests, setSubtests] = useState<Partial<Record<SubtestId, number>>>({
    S: 11,
    V: 11,
    C: 13,
    PV: 12,
    M: 14,
    B: 14,
    D: 9,
    SD: 9,
    CL: 7,
    BS: 9,
  });

  // Raw string inputs to preserve what the user typed in the inputs
  const [rawInputs, setRawInputs] = useState<Record<string, string>>({
    S: '11',
    V: '11',
    C: '13',
    PV: '12',
    M: '14',
    B: '14',
    D: '9',
    SD: '9',
    CL: '7',
    BS: '9',
  });

  // Score validation errors per subtest
  const [invalidSubtests, setInvalidSubtests] = useState<Record<string, string>>({});

  // Switch battery safely
  const setBattery = useCallback((newBattery: BatteryType) => {
    setBatteryState(newBattery);
    if (newBattery === 'WISC-V') {
      setDemographicsState((prev) => ({
        ...prev,
        birthDate: '2016-04-08',
      }));
      setSubtests({ ...WISC_V_SAMPLES.average });
      const raw: Record<string, string> = {};
      Object.entries(WISC_V_SAMPLES.average).forEach(([k, v]) => {
        raw[k] = String(v);
      });
      setRawInputs(raw);
    } else {
      setDemographicsState((prev) => ({
        ...prev,
        birthDate: '1998-05-15',
      }));
      setSubtests({ ...WAIS_IV_SAMPLES.average });
      const raw: Record<string, string> = {};
      Object.entries(WAIS_IV_SAMPLES.average).forEach(([k, v]) => {
        raw[k] = String(v);
      });
      setRawInputs(raw);
    }
    setInvalidSubtests({});
  }, []);

  const setDemographics = useCallback((updater: Partial<PatientDemographics>) => {
    setDemographicsState((prev) => {
      const next = { ...prev, ...updater };
      if (updater.nameOrId !== undefined && !next.isAnonymized) {
        setOriginalName(updater.nameOrId);
      }
      return next;
    });
  }, []);

  const toggleAnonymize = useCallback(() => {
    setDemographicsState((prev) => {
      if (!prev.isAnonymized) {
        return {
          ...prev,
          nameOrId: anonymizeName(prev.nameOrId),
          isAnonymized: true,
        };
      } else {
        return {
          ...prev,
          nameOrId: originalName,
          isAnonymized: false,
        };
      }
    });
  }, [originalName]);

  const displayName = demographics.isAnonymized
    ? anonymizeName(demographics.nameOrId)
    : demographics.nameOrId;

  const setSubtestScore = useCallback((id: SubtestId, score: number | null, rawText?: string) => {
    setRawInputs((prev) => ({
      ...prev,
      [id]: rawText !== undefined ? rawText : score !== null ? String(score) : '',
    }));

    if (score === null) {
      setSubtests((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setInvalidSubtests((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }

    const validation = validateScaledScore(score);
    if (!validation.isValid) {
      setInvalidSubtests((prev) => ({
        ...prev,
        [id]: validation.errorMessage || 'Puntuación fuera de rango (1-19)',
      }));
      setSubtests((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      setInvalidSubtests((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setSubtests((prev) => ({
        ...prev,
        [id]: score,
      }));
    }
  }, []);

  const clearAllScores = useCallback(() => {
    setSubtests({});
    setRawInputs({});
    setInvalidSubtests({});
  }, []);

  const loadSampleProfile = useCallback(
    (type: 'average' | 'gifted' | 'adhd') => {
      const sample = battery === 'WISC-V' ? WISC_V_SAMPLES[type] : WAIS_IV_SAMPLES[type];
      setSubtests({ ...sample });
      const raw: Record<string, string> = {};
      Object.entries(sample).forEach(([k, v]) => {
        raw[k] = String(v);
      });
      setRawInputs(raw);
      setInvalidSubtests({});
    },
    [battery]
  );

  // Age validation
  const ageValidation = useMemo(() => {
    return validateAgeAndBattery(demographics.birthDate, demographics.testDate, battery);
  }, [demographics.birthDate, demographics.testDate, battery]);

  // Execute psychometrics engine reactively
  const calculationResult = useMemo(() => {
    if (battery === 'WISC-V') {
      return calculateWiscV(subtests);
    } else {
      return calculateWaisIV(subtests);
    }
  }, [battery, subtests]);

  const hasInvalidScores = Object.keys(invalidSubtests).length > 0;

  const administeredSubtestCount = useMemo(() => {
    return Object.keys(subtests).filter((k) => subtests[k as SubtestId] !== undefined).length;
  }, [subtests]);

  return {
    battery,
    setBattery,
    demographics,
    setDemographics,
    toggleAnonymize,
    displayName,
    subtests,
    rawInputs,
    setSubtestScore,
    clearAllScores,
    loadSampleProfile,
    primaryIndices: calculationResult.primaryIndices,
    cit: calculationResult.cit,
    ancillaryIndices: calculationResult.ancillaryIndices,
    discrepancies: calculationResult.discrepancies,
    strengthsWeaknesses: calculationResult.strengthsWeaknesses,
    isCompleteCit: calculationResult.isCompleteCit,
    ageValidation,
    invalidSubtests,
    hasInvalidScores,
    administeredSubtestCount,
  };
}
