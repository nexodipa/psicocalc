import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  BatteryType,
  SubtestId,
  calculateWiscV,
  calculateWaisIV,
  validateAgeAndBattery,
  validateScaledScore,
  CLINICAL_VIGNETTES,
  DEFAULT_INSTITUTIONAL_BRANDING,
  InstitutionalBranding,
} from '../../core';
import {
  calculateSdq,
  calculatePhq9,
  calculateGad7,
  calculateMoca,
} from '../../core/engine/clinicalCalculators';
import {
  SdqInformantType,
  MocaDomainScores,
} from '../../core/types/clinical';
import {
  HtpAssessmentRecord,
  HtpBenchmarkPreset,
  INITIAL_HTP_RECORD,
  HTP_BENCHMARK_PROFILES,
} from '../../core/types/htp';
import { generateHtpFullReport } from '../../core/engine/htpNarrativeEngine';
import { TestRegistry } from '../../core/registry/TestRegistry';
import {
  ClinicalCategory,
  ClinicalInstrument,
  ClinicalSessionContextValue,
  ExtendedPatientDemographics,
  WechslerSessionState,
  SdqSessionState,
  Phq9SessionState,
  Gad7SessionState,
  MocaSessionState,
  AdministeredInstruments,
  CatalogFilterState,
  SavedClinicalSession,
} from './ClinicalSessionTypes';
import { anonymizeName } from '../hooks/usePsychometrics';

const SAVED_SESSIONS_STORAGE_KEY = 'psicocalc_saved_sessions_v1';

function readStoredSessions(): SavedClinicalSession[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = window.localStorage.getItem(SAVED_SESSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredSessions(sessions: SavedClinicalSession[]) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(SAVED_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    }
  } catch {
    // Ignore storage quota errors in sandboxed environments
  }
}

// Default initial state presets
const INITIAL_DEMOGRAPHICS: ExtendedPatientDemographics = {
  nameOrId: 'Lucas Fernández Gómez',
  birthDate: '2016-04-08',
  testDate: '2026-09-22',
  examiner: 'Lic. Roberto Gómez (Col. M-3918)',
  reasonForEvaluation:
    'Evaluación del perfil neurocognitivo y descarte de dificultades específicas de aprendizaje',
  isAnonymized: false,
  educationYears: 12,
  schoolGrade: '5º Educación Primaria',
};

const INITIAL_WISC_SUBTESTS: Partial<Record<SubtestId, number>> = {
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
};

const INITIAL_WISC_RAW: Record<string, string> = {
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
};

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

const INITIAL_MOCA_DOMAINS: MocaDomainScores = {
  visuospatialExecutive: 0,
  naming: 0,
  attention: 0,
  language: 0,
  abstraction: 0,
  delayedRecall: 0,
  orientation: 0,
};

const DEFAULT_ACTIVE_BATTERY_IDS = [
  'wisc_v',
  'wais_iv',
  'sdq',
  'phq_9',
  'gad_7',
  'moca',
  'htp',
];

const ClinicalSessionContext = createContext<ClinicalSessionContextValue | undefined>(undefined);

export const ClinicalSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Navigation state
  const [activeCategory, setActiveCategory] = useState<ClinicalCategory>('intelligence');
  const [activeInstrument, setActiveInstrument] = useState<ClinicalInstrument>('wisc_v');

  // 2. Demographics & 1-click anonymization
  const [demographics, setDemographicsState] = useState<ExtendedPatientDemographics>(INITIAL_DEMOGRAPHICS);
  const [originalName, setOriginalName] = useState<string>(INITIAL_DEMOGRAPHICS.nameOrId);

  // 3. Layer 2: Sandboxed Battery Slices Map (State Isolation)
  const [testData, setTestData] = useState<Record<string, any>>(() => ({
    wisc_v: {
      subtests: { ...INITIAL_WISC_SUBTESTS },
      rawInputs: { ...INITIAL_WISC_RAW },
      invalidSubtests: {},
    },
    wais_iv: {
      subtests: {},
      rawInputs: {},
      invalidSubtests: {},
    },
    sdq: {
      informant: 'parent',
      responses: {},
    },
    phq_9: {
      responses: {},
    },
    gad_7: {
      responses: {},
    },
    moca: {
      domains: { ...INITIAL_MOCA_DOMAINS },
      educationYears: INITIAL_DEMOGRAPHICS.educationYears ?? 12,
    },
    htp: { ...INITIAL_HTP_RECORD },
  }));

  const [activeBatteryIds, setActiveBatteryIds] = useState<string[]>(DEFAULT_ACTIVE_BATTERY_IDS);
  const [catalogFilters, setCatalogFiltersState] = useState<CatalogFilterState>({
    search: '',
    domain: 'all',
    ageBand: 'all',
  });

  // 4. Independent Wechsler States (Legacy lenses)
  const [currentBattery, setCurrentBatteryState] = useState<BatteryType>('WISC-V');
  const [wiscState, setWiscState] = useState<WechslerSessionState>({
    subtests: { ...INITIAL_WISC_SUBTESTS },
    rawInputs: { ...INITIAL_WISC_RAW },
    invalidSubtests: {},
  });
  const [waisState, setWaisState] = useState<WechslerSessionState>({
    subtests: {},
    rawInputs: {},
    invalidSubtests: {},
  });

  // 5. Clinical questionnaire states (Legacy lenses)
  const [sdqState, setSdqState] = useState<SdqSessionState>({
    informant: 'parent',
    responses: {},
  });
  const [phq9State, setPhq9State] = useState<Phq9SessionState>({
    responses: {},
  });
  const [gad7State, setGad7State] = useState<Gad7SessionState>({
    responses: {},
  });
  const [mocaState, setMocaState] = useState<MocaSessionState>({
    domains: { ...INITIAL_MOCA_DOMAINS },
    educationYears: INITIAL_DEMOGRAPHICS.educationYears ?? 12,
  });
  const [htpRecord, setHtpRecordState] = useState<HtpAssessmentRecord>({ ...INITIAL_HTP_RECORD });

  // 6. Clinical Case Simulator & Academic Training Suite state
  const [activeVignetteId, setActiveVignetteId] = useState<string | null>(null);
  const [trainingMode, setTrainingModeState] = useState<boolean>(false);
  const [isDiagnosisRevealed, setIsDiagnosisRevealed] = useState<boolean>(true);
  const [clinicianHypothesisNotes, setClinicianHypothesisNotes] = useState<string>('');
  const [branding, setBrandingState] = useState<InstitutionalBranding>({
    ...DEFAULT_INSTITUTIONAL_BRANDING,
  });
  const [savedSessions, setSavedSessions] = useState<SavedClinicalSession[]>(() =>
    readStoredSessions()
  );

  const activeVignette = useMemo(() => {
    if (!activeVignetteId) return null;
    return CLINICAL_VIGNETTES.find((v) => v.id === activeVignetteId) ?? null;
  }, [activeVignetteId]);

  const setTrainingMode = useCallback((val: boolean) => {
    setTrainingModeState(val);
    setIsDiagnosisRevealed(!val);
  }, []);

  const setBranding = useCallback((updater: Partial<InstitutionalBranding>) => {
    setBrandingState((prev) => ({ ...prev, ...updater }));
  }, []);

  const resetBranding = useCallback(() => {
    setBrandingState({ ...DEFAULT_INSTITUTIONAL_BRANDING });
  }, []);

  // --------------------------------------------------------------------------
  // Layer 2 Battery Partition Operations
  // --------------------------------------------------------------------------
  const activateBattery = useCallback((id: string) => {
    setActiveBatteryIds((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
    setTestData((prev) => {
      if (prev[id] !== undefined) return prev;
      const def = TestRegistry.get(id);
      const initial = def ? def.createInitialState() : {};
      return { ...prev, [id]: initial };
    });
  }, []);

  const deactivateBattery = useCallback((id: string) => {
    setActiveBatteryIds((prev) => prev.filter((bId) => bId !== id));
    // Notice: testData is preserved in memory to prevent accidental loss
  }, []);

  const setBatteryData = useCallback(<T = any>(batteryId: string, updater: T | ((prev: T) => T)) => {
    setTestData((prev) => {
      const prevData = prev[batteryId];
      const nextData = typeof updater === 'function' ? (updater as any)(prevData) : updater;

      // Sync legacy states if updating one of the 7 legacy batteries
      if (batteryId === 'wisc_v') {
        setWiscState(nextData);
      } else if (batteryId === 'wais_iv') {
        setWaisState(nextData);
      } else if (batteryId === 'sdq') {
        setSdqState(nextData);
      } else if (batteryId === 'phq_9') {
        setPhq9State(nextData);
      } else if (batteryId === 'gad_7') {
        setGad7State(nextData);
      } else if (batteryId === 'moca') {
        setMocaState(nextData);
      } else if (batteryId === 'htp') {
        setHtpRecordState(nextData);
      }

      return {
        ...prev,
        [batteryId]: nextData,
      };
    });
  }, []);

  const getBatteryData = useCallback(<T = any>(batteryId: string): T | undefined => {
    return testData[batteryId];
  }, [testData]);

  const setCatalogFilters = useCallback((filters: Partial<CatalogFilterState>) => {
    setCatalogFiltersState((prev) => ({ ...prev, ...filters }));
  }, []);

  // --------------------------------------------------------------------------
  // Demographics Handlers
  // --------------------------------------------------------------------------
  const setDemographics = useCallback((updater: Partial<ExtendedPatientDemographics>) => {
    setDemographicsState((prev) => {
      const next = { ...prev, ...updater };
      if (updater.nameOrId !== undefined && !next.isAnonymized) {
        setOriginalName(updater.nameOrId);
      }
      if (updater.educationYears !== undefined) {
        setMocaState((mPrev) => ({ ...mPrev, educationYears: updater.educationYears! }));
        setTestData((tPrev) => ({
          ...tPrev,
          moca: { ...tPrev.moca, educationYears: updater.educationYears! },
        }));
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

  const displayName = useMemo(() => {
    return demographics.isAnonymized
      ? anonymizeName(demographics.nameOrId)
      : demographics.nameOrId;
  }, [demographics.isAnonymized, demographics.nameOrId]);

  const ageValidationWisc = useMemo(() => {
    return validateAgeAndBattery(demographics.birthDate, demographics.testDate, 'WISC-V');
  }, [demographics.birthDate, demographics.testDate]);

  const ageValidationWais = useMemo(() => {
    return validateAgeAndBattery(demographics.birthDate, demographics.testDate, 'WAIS-IV');
  }, [demographics.birthDate, demographics.testDate]);

  // Battery Switcher without losing data
  const setBattery = useCallback((battery: BatteryType) => {
    setCurrentBatteryState(battery);
    setActiveInstrument(battery === 'WISC-V' ? 'wisc_v' : 'wais_iv');
  }, []);

  // --------------------------------------------------------------------------
  // Wechsler Active Accessors & Sync
  // --------------------------------------------------------------------------
  const activeWechslerState = currentBattery === 'WISC-V' ? wiscState : waisState;

  const setSubtestScore = useCallback(
    (id: SubtestId, score: number | null, rawText?: string) => {
      const isWisc = currentBattery === 'WISC-V';
      const batteryKey = isWisc ? 'wisc_v' : 'wais_iv';
      const updater = isWisc ? setWiscState : setWaisState;

      updater((prev) => {
        const nextRaw = {
          ...prev.rawInputs,
          [id]: rawText !== undefined ? rawText : score !== null ? String(score) : '',
        };
        const nextSubtests = { ...prev.subtests };
        const nextInvalid = { ...prev.invalidSubtests };

        if (score === null) {
          delete nextSubtests[id];
          delete nextInvalid[id];
        } else {
          const validation = validateScaledScore(score);
          if (!validation.isValid) {
            nextInvalid[id] = validation.errorMessage || 'Puntuación fuera de rango (1-19)';
            delete nextSubtests[id];
          } else {
            delete nextInvalid[id];
            nextSubtests[id] = score;
          }
        }

        const nextState = {
          subtests: nextSubtests,
          rawInputs: nextRaw,
          invalidSubtests: nextInvalid,
        };

        // Sync into testData partition
        setTestData((tPrev) => ({ ...tPrev, [batteryKey]: nextState }));

        return nextState;
      });
    },
    [currentBattery]
  );

  const clearAllScores = useCallback(() => {
    const isWisc = currentBattery === 'WISC-V';
    const batteryKey = isWisc ? 'wisc_v' : 'wais_iv';
    const updater = isWisc ? setWiscState : setWaisState;
    const cleared = {
      subtests: {},
      rawInputs: {},
      invalidSubtests: {},
    };
    updater(cleared);
    setTestData((tPrev) => ({ ...tPrev, [batteryKey]: cleared }));
  }, [currentBattery]);

  const loadSampleProfile = useCallback(
    (type: 'average' | 'gifted' | 'adhd') => {
      const isWisc = currentBattery === 'WISC-V';
      const batteryKey = isWisc ? 'wisc_v' : 'wais_iv';
      const sample = isWisc ? WISC_V_SAMPLES[type] : WAIS_IV_SAMPLES[type];
      const raw: Record<string, string> = {};
      Object.entries(sample).forEach(([k, v]) => {
        raw[k] = String(v);
      });
      const updater = isWisc ? setWiscState : setWaisState;
      const loaded = {
        subtests: { ...sample },
        rawInputs: raw,
        invalidSubtests: {},
      };
      updater(loaded);
      setTestData((tPrev) => ({ ...tPrev, [batteryKey]: loaded }));
    },
    [currentBattery]
  );

  // Wechsler Calculations
  const wechslerCalcResult = useMemo(() => {
    if (currentBattery === 'WISC-V') {
      return calculateWiscV(wiscState.subtests);
    } else {
      return calculateWaisIV(waisState.subtests);
    }
  }, [currentBattery, wiscState.subtests, waisState.subtests]);

  const hasInvalidScores = Object.keys(activeWechslerState.invalidSubtests).length > 0;
  const administeredSubtestCount = useMemo(() => {
    return Object.keys(activeWechslerState.subtests).filter(
      (k) => activeWechslerState.subtests[k as SubtestId] !== undefined
    ).length;
  }, [activeWechslerState.subtests]);

  // --------------------------------------------------------------------------
  // SDQ Handlers & Calculations
  // --------------------------------------------------------------------------
  const setSdqResponse = useCallback((itemNumber: number, value: 0 | 1 | 2) => {
    setSdqState((prev) => {
      const next = {
        ...prev,
        responses: {
          ...prev.responses,
          [itemNumber]: value,
        },
      };
      setTestData((tPrev) => ({ ...tPrev, sdq: next }));
      return next;
    });
  }, []);

  const setSdqInformant = useCallback((informant: SdqInformantType) => {
    setSdqState((prev) => {
      const next = { ...prev, informant };
      setTestData((tPrev) => ({ ...tPrev, sdq: next }));
      return next;
    });
  }, []);

  const clearSdq = useCallback(() => {
    const next = { informant: 'parent' as SdqInformantType, responses: {} };
    setSdqState(next);
    setTestData((tPrev) => ({ ...tPrev, sdq: next }));
  }, []);

  const loadSdqSample = useCallback((preset: 'normal' | 'clinical' = 'normal') => {
    let sample: Record<number, number>;
    if (preset === 'normal') {
      sample = {
        1: 1, 2: 0, 3: 0, 4: 0, 5: 0,
        6: 0, 7: 2, 8: 0, 9: 1, 10: 0,
        11: 2, 12: 0, 13: 0, 14: 2, 15: 0,
        16: 0, 17: 1, 18: 0, 19: 0, 20: 1,
        21: 2, 22: 0, 23: 0, 24: 0, 25: 2,
      };
    } else {
      sample = {
        1: 2, 2: 2, 3: 2, 4: 2, 5: 1,
        6: 1, 7: 0, 8: 2, 9: 2, 10: 2,
        11: 0, 12: 2, 13: 1, 14: 0, 15: 2,
        16: 2, 17: 1, 18: 2, 19: 2, 20: 0,
        21: 0, 22: 2, 23: 1, 24: 2, 25: 0,
      };
    }
    setSdqState((prev) => {
      const next = { ...prev, responses: sample };
      setTestData((tPrev) => ({ ...tPrev, sdq: next }));
      return next;
    });
  }, []);

  const sdqCalculation = useMemo(() => {
    const answeredCount = Object.keys(sdqState.responses).length;
    if (answeredCount < 15) return null;
    try {
      return calculateSdq({
        informant: sdqState.informant,
        responses: sdqState.responses,
      });
    } catch {
      return null;
    }
  }, [sdqState.informant, sdqState.responses]);

  const isSdqCompleted = useMemo(() => {
    return Object.keys(sdqState.responses).length === 25;
  }, [sdqState.responses]);

  // --------------------------------------------------------------------------
  // PHQ-9 Handlers & Calculations
  // --------------------------------------------------------------------------
  const setPhq9Response = useCallback((itemNumber: number, value: 0 | 1 | 2 | 3) => {
    setPhq9State((prev) => {
      const next = {
        ...prev,
        responses: {
          ...prev.responses,
          [itemNumber]: value,
        },
      };
      setTestData((tPrev) => ({ ...tPrev, phq_9: next }));
      return next;
    });
  }, []);

  const clearPhq9 = useCallback(() => {
    const next = { responses: {} };
    setPhq9State(next);
    setTestData((tPrev) => ({ ...tPrev, phq_9: next }));
  }, []);

  const loadPhq9Sample = useCallback((preset: 'minimal' | 'moderate' | 'critical' = 'minimal') => {
    let next: Phq9SessionState;
    if (preset === 'minimal') {
      next = { responses: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 } };
    } else if (preset === 'moderate') {
      next = { responses: { 1: 2, 2: 2, 3: 1, 4: 2, 5: 1, 6: 1, 7: 1, 8: 1, 9: 0 } };
    } else {
      next = { responses: { 1: 3, 2: 3, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 1, 9: 2 } };
    }
    setPhq9State(next);
    setTestData((tPrev) => ({ ...tPrev, phq_9: next }));
  }, []);

  const phq9Calculation = useMemo(() => {
    if (Object.keys(phq9State.responses).length < 9) return null;
    try {
      return calculatePhq9(phq9State.responses);
    } catch {
      return null;
    }
  }, [phq9State.responses]);

  const isPhq9Completed = useMemo(() => {
    return Object.keys(phq9State.responses).length === 9;
  }, [phq9State.responses]);

  const isPhq9Item9AlertActive = useMemo(() => {
    const val = phq9State.responses[9];
    return val !== undefined && val >= 1;
  }, [phq9State.responses]);

  // --------------------------------------------------------------------------
  // GAD-7 Handlers & Calculations
  // --------------------------------------------------------------------------
  const setGad7Response = useCallback((itemNumber: number, value: 0 | 1 | 2 | 3) => {
    setGad7State((prev) => {
      const next = {
        ...prev,
        responses: {
          ...prev.responses,
          [itemNumber]: value,
        },
      };
      setTestData((tPrev) => ({ ...tPrev, gad_7: next }));
      return next;
    });
  }, []);

  const clearGad7 = useCallback(() => {
    const next = { responses: {} };
    setGad7State(next);
    setTestData((tPrev) => ({ ...tPrev, gad_7: next }));
  }, []);

  const loadGad7Sample = useCallback((preset: 'minimal' | 'moderate' | 'severe' = 'minimal') => {
    let next: Gad7SessionState;
    if (preset === 'minimal') {
      next = { responses: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } };
    } else if (preset === 'moderate') {
      next = { responses: { 1: 2, 2: 2, 3: 1, 4: 1, 5: 2, 6: 1, 7: 2 } };
    } else {
      next = { responses: { 1: 3, 2: 3, 3: 2, 4: 3, 5: 2, 6: 2, 7: 3 } };
    }
    setGad7State(next);
    setTestData((tPrev) => ({ ...tPrev, gad_7: next }));
  }, []);

  const gad7Calculation = useMemo(() => {
    if (Object.keys(gad7State.responses).length < 7) return null;
    try {
      return calculateGad7(gad7State.responses);
    } catch {
      return null;
    }
  }, [gad7State.responses]);

  const isGad7Completed = useMemo(() => {
    return Object.keys(gad7State.responses).length === 7;
  }, [gad7State.responses]);

  // --------------------------------------------------------------------------
  // MoCA Handlers & Calculations
  // --------------------------------------------------------------------------
  const setMocaDomainScore = useCallback((domain: keyof MocaDomainScores, score: number) => {
    setMocaState((prev) => {
      const next = {
        ...prev,
        domains: {
          ...prev.domains,
          [domain]: score,
        },
      };
      setTestData((tPrev) => ({ ...tPrev, moca: next }));
      return next;
    });
  }, []);

  const setMocaEducationYears = useCallback((years: number) => {
    setMocaState((prev) => {
      const next = { ...prev, educationYears: years };
      setTestData((tPrev) => ({ ...tPrev, moca: next }));
      return next;
    });
  }, []);

  const clearMoca = useCallback(() => {
    const next = {
      domains: { ...INITIAL_MOCA_DOMAINS },
      educationYears: demographics.educationYears ?? 12,
    };
    setMocaState(next);
    setTestData((tPrev) => ({ ...tPrev, moca: next }));
  }, [demographics.educationYears]);

  const loadMocaSample = useCallback((preset: 'normal' | 'mci' = 'normal') => {
    let nextDomains: MocaDomainScores;
    if (preset === 'normal') {
      nextDomains = {
        visuospatialExecutive: 5,
        naming: 3,
        attention: 6,
        language: 3,
        abstraction: 2,
        delayedRecall: 4,
        orientation: 6,
      };
    } else {
      nextDomains = {
        visuospatialExecutive: 3,
        naming: 2,
        attention: 4,
        language: 2,
        abstraction: 1,
        delayedRecall: 1,
        orientation: 5,
      };
    }
    setMocaState((prev) => {
      const next = {
        ...prev,
        domains: nextDomains,
      };
      setTestData((tPrev) => ({ ...tPrev, moca: next }));
      return next;
    });
  }, []);

  const mocaCalculation = useMemo(() => {
    try {
      return calculateMoca({
        domains: mocaState.domains,
        educationYears: mocaState.educationYears,
      });
    } catch {
      return null;
    }
  }, [mocaState.domains, mocaState.educationYears]);

  const isMocaCompleted = useMemo(() => {
    const sum = Object.values(mocaState.domains).reduce((a, b) => a + b, 0);
    return sum > 0;
  }, [mocaState.domains]);

  const isMocaAlertActive = useMemo(() => {
    return mocaCalculation ? mocaCalculation.meetsClinicalCutoff : false;
  }, [mocaCalculation]);

  // --------------------------------------------------------------------------
  // HTP Handlers & Calculations
  // --------------------------------------------------------------------------
  const setHtpRecord = useCallback(
    (updater: HtpAssessmentRecord | ((prev: HtpAssessmentRecord) => HtpAssessmentRecord)) => {
      setHtpRecordState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        setTestData((tPrev) => ({ ...tPrev, htp: next }));
        return next;
      });
    },
    []
  );

  const clearHtp = useCallback(() => {
    const next = { ...INITIAL_HTP_RECORD };
    setHtpRecordState(next);
    setTestData((tPrev) => ({ ...tPrev, htp: next }));
  }, []);

  const loadHtpPreset = useCallback((preset: HtpBenchmarkPreset) => {
    const selected = HTP_BENCHMARK_PROFILES[preset];
    if (selected) {
      const next = {
        ...JSON.parse(JSON.stringify(selected)),
        id: 'htp-preset-' + preset,
      };
      setHtpRecordState(next);
      setTestData((tPrev) => ({ ...tPrev, htp: next }));
    }
  }, []);

  const htpReport = useMemo(() => {
    return generateHtpFullReport(htpRecord);
  }, [htpRecord]);

  const isHtpCompleted = useMemo(() => {
    return (
      htpRecord.generalClinicalNotes.trim().length > 0 ||
      htpRecord.house.observations.trim().length > 0 ||
      htpRecord.tree.observations.trim().length > 0 ||
      htpRecord.person.observations.trim().length > 0 ||
      htpRecord.formal.size !== 'normal'
    );
  }, [htpRecord]);

  // --------------------------------------------------------------------------
  // Administered Instruments Tracking
  // --------------------------------------------------------------------------
  const administered: AdministeredInstruments = useMemo(() => {
    const wiscAdministered = Object.keys(wiscState.subtests).length > 0;
    const waisAdministered = Object.keys(waisState.subtests).length > 0;
    const adminMap: AdministeredInstruments = {
      wiscV: wiscAdministered,
      waisIV: waisAdministered,
      sdq: isSdqCompleted || Object.keys(sdqState.responses).length >= 15,
      phq9: isPhq9Completed,
      gad7: isGad7Completed,
      moca: isMocaCompleted,
      htp: isHtpCompleted,
    };

    // Also populate any dynamically registered instruments in testData
    Object.entries(testData).forEach(([bId, bData]) => {
      if (bData) {
        const def = TestRegistry.get(bId);
        if (def) {
          adminMap[bId] = def.isCompleted(bData);
        }
      }
    });

    return adminMap;
  }, [
    wiscState.subtests,
    waisState.subtests,
    isSdqCompleted,
    sdqState.responses,
    isPhq9Completed,
    isGad7Completed,
    isMocaCompleted,
    isHtpCompleted,
    testData,
  ]);

  const administeredBatteries: string[] = useMemo(() => {
    const list: string[] = [];
    if (administered.wiscV) list.push('wisc_v');
    if (administered.waisIV) list.push('wais_iv');
    if (administered.sdq) list.push('sdq');
    if (administered.phq9) list.push('phq_9');
    if (administered.gad7) list.push('gad_7');
    if (administered.moca) list.push('moca');
    if (administered.htp) list.push('htp');

    Object.keys(testData).forEach((bId) => {
      if (!list.includes(bId)) {
        const def = TestRegistry.get(bId);
        if (def && def.isCompleted(testData[bId])) {
          list.push(bId);
        }
      }
    });

    return list;
  }, [administered, testData]);

  // --------------------------------------------------------------------------
  // Clinical Case Simulator Vignette Loader & Local Sessions
  // --------------------------------------------------------------------------
  const loadClinicalVignette = useCallback(
    (vignetteId: string, openReport = false) => {
      const vignette = CLINICAL_VIGNETTES.find((v) => v.id === vignetteId);
      if (!vignette) return;

      setActiveVignetteId(vignette.id);
      setIsDiagnosisRevealed(!trainingMode);
      setClinicianHypothesisNotes('');

      setDemographicsState({ ...vignette.demographics });
      setOriginalName(vignette.demographics.nameOrId);
      setCurrentBatteryState(vignette.primaryBattery);

      const nextWiscSubtests = vignette.wiscSubtests ? { ...vignette.wiscSubtests } : {};
      const nextWiscRaw: Record<string, string> = {};
      Object.entries(nextWiscSubtests).forEach(([k, v]) => {
        nextWiscRaw[k] = String(v);
      });
      const nextWisc: WechslerSessionState = {
        subtests: nextWiscSubtests,
        rawInputs: nextWiscRaw,
        invalidSubtests: {},
      };

      const nextWaisSubtests = vignette.waisSubtests ? { ...vignette.waisSubtests } : {};
      const nextWaisRaw: Record<string, string> = {};
      Object.entries(nextWaisSubtests).forEach(([k, v]) => {
        nextWaisRaw[k] = String(v);
      });
      const nextWais: WechslerSessionState = {
        subtests: nextWaisSubtests,
        rawInputs: nextWaisRaw,
        invalidSubtests: {},
      };

      setWiscState(nextWisc);
      setWaisState(nextWais);

      const nextSdq: SdqSessionState = vignette.testData.sdq
        ? JSON.parse(JSON.stringify(vignette.testData.sdq))
        : { informant: 'parent', responses: {} };
      const nextPhq9: Phq9SessionState = vignette.testData.phq_9
        ? JSON.parse(JSON.stringify(vignette.testData.phq_9))
        : { responses: {} };
      const nextGad7: Gad7SessionState = vignette.testData.gad_7
        ? JSON.parse(JSON.stringify(vignette.testData.gad_7))
        : { responses: {} };
      const nextMoca: MocaSessionState = vignette.testData.moca
        ? JSON.parse(JSON.stringify(vignette.testData.moca))
        : { domains: { ...INITIAL_MOCA_DOMAINS }, educationYears: vignette.demographics.educationYears };
      const nextHtp: HtpAssessmentRecord = vignette.testData.htp
        ? JSON.parse(JSON.stringify(vignette.testData.htp))
        : { ...INITIAL_HTP_RECORD };

      setSdqState(nextSdq);
      setPhq9State(nextPhq9);
      setGad7State(nextGad7);
      setMocaState(nextMoca);
      setHtpRecordState(nextHtp);

      const mergedTestData: Record<string, any> = {
        wisc_v: nextWisc,
        wais_iv: nextWais,
        sdq: nextSdq,
        phq_9: nextPhq9,
        gad_7: nextGad7,
        moca: nextMoca,
        htp: nextHtp,
        ...JSON.parse(JSON.stringify(vignette.testData)),
      };
      setTestData(mergedTestData);

      const mergedActiveIds = Array.from(
        new Set([...DEFAULT_ACTIVE_BATTERY_IDS, ...vignette.activeBatteryIds])
      );
      setActiveBatteryIds(mergedActiveIds);

      if (openReport) {
        setActiveCategory('report');
      } else {
        setActiveInstrument(vignette.defaultInstrumentView);
        setActiveCategory('intelligence');
      }
    },
    [trainingMode]
  );

  const saveCurrentSession = useCallback(
    (label?: string) => {
      const id = `session-${Date.now()}`;
      const newEntry: SavedClinicalSession = {
        id,
        label: label?.trim() || `${demographics.nameOrId} (${demographics.testDate})`,
        savedAt: new Date().toISOString(),
        patientName: demographics.nameOrId,
        primaryBattery: currentBattery,
        activeBatteryIds: [...activeBatteryIds],
        demographics: { ...demographics },
        wiscState: JSON.parse(JSON.stringify(wiscState)),
        waisState: JSON.parse(JSON.stringify(waisState)),
        testData: JSON.parse(JSON.stringify(testData)),
        activeVignetteId,
      };
      setSavedSessions((prev) => {
        const next = [newEntry, ...prev].slice(0, 20);
        writeStoredSessions(next);
        return next;
      });
    },
    [
      demographics,
      currentBattery,
      activeBatteryIds,
      wiscState,
      waisState,
      testData,
      activeVignetteId,
    ]
  );

  const loadSavedSession = useCallback((id: string) => {
    setSavedSessions((prev) => {
      const target = prev.find((s) => s.id === id);
      if (!target) return prev;

      setDemographicsState({ ...target.demographics });
      setOriginalName(target.demographics.nameOrId);
      setCurrentBatteryState(target.primaryBattery);
      setWiscState(JSON.parse(JSON.stringify(target.wiscState)));
      setWaisState(JSON.parse(JSON.stringify(target.waisState)));
      const loadedData = JSON.parse(JSON.stringify(target.testData));
      setTestData(loadedData);
      if (loadedData.sdq) setSdqState(loadedData.sdq);
      if (loadedData.phq_9) setPhq9State(loadedData.phq_9);
      if (loadedData.gad_7) setGad7State(loadedData.gad_7);
      if (loadedData.moca) setMocaState(loadedData.moca);
      if (loadedData.htp) setHtpRecordState(loadedData.htp);
      setActiveBatteryIds(target.activeBatteryIds || DEFAULT_ACTIVE_BATTERY_IDS);
      setActiveVignetteId(target.activeVignetteId ?? null);
      return prev;
    });
  }, []);

  const deleteSavedSession = useCallback((id: string) => {
    setSavedSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      writeStoredSessions(next);
      return next;
    });
  }, []);

  // --------------------------------------------------------------------------
  // Global Session Reset & Demo Loader
  // --------------------------------------------------------------------------
  const resetFullSession = useCallback(() => {
    setActiveVignetteId(null);
    setClinicianHypothesisNotes('');
    setDemographicsState({ ...INITIAL_DEMOGRAPHICS });
    setOriginalName(INITIAL_DEMOGRAPHICS.nameOrId);
    setWiscState({ subtests: {}, rawInputs: {}, invalidSubtests: {} });
    setWaisState({ subtests: {}, rawInputs: {}, invalidSubtests: {} });
    setSdqState({ informant: 'parent', responses: {} });
    setPhq9State({ responses: {} });
    setGad7State({ responses: {} });
    setMocaState({ domains: { ...INITIAL_MOCA_DOMAINS }, educationYears: 12 });
    setHtpRecordState({ ...INITIAL_HTP_RECORD });
    setTestData({
      wisc_v: { subtests: {}, rawInputs: {}, invalidSubtests: {} },
      wais_iv: { subtests: {}, rawInputs: {}, invalidSubtests: {} },
      sdq: { informant: 'parent', responses: {} },
      phq_9: { responses: {} },
      gad_7: { responses: {} },
      moca: { domains: { ...INITIAL_MOCA_DOMAINS }, educationYears: 12 },
      htp: { ...INITIAL_HTP_RECORD },
    });
    setActiveBatteryIds(DEFAULT_ACTIVE_BATTERY_IDS);
  }, []);

  const loadDemoSession = useCallback(() => {
    setActiveVignetteId(null);
    setDemographicsState({
      nameOrId: 'Lucas Fernández Gómez',
      birthDate: '2016-04-08',
      testDate: '2026-09-22',
      examiner: 'Lic. Roberto Gómez (Col. M-3918)',
      reasonForEvaluation: 'Evaluación neuropsicológica comprensiva y de regulación conductual',
      isAnonymized: false,
      educationYears: 12,
      schoolGrade: '5º Educación Primaria',
    });
    setOriginalName('Lucas Fernández Gómez');
    setWiscState({
      subtests: { ...INITIAL_WISC_SUBTESTS },
      rawInputs: { ...INITIAL_WISC_RAW },
      invalidSubtests: {},
    });
    loadSdqSample('clinical');
    loadPhq9Sample('moderate');
    loadGad7Sample('moderate');
    loadMocaSample('normal');
    loadHtpPreset('inhibited');
  }, [loadSdqSample, loadPhq9Sample, loadGad7Sample, loadMocaSample, loadHtpPreset]);

  const value: ClinicalSessionContextValue = {
    state: {
      activeCategory,
      activeInstrument,
      demographics,
      originalName,
      testData,
      activeBatteryIds,
      catalogFilters,
      wiscState,
      waisState,
      currentBattery,
      sdqState,
      phq9State,
      gad7State,
      mocaState,
      htpRecord,
    },
    administered,
    administeredBatteries,

    // Layer 2 Partitioned State Management
    testData,
    activeBatteryIds,
    activateBattery,
    deactivateBattery,
    setBatteryData,
    getBatteryData,

    // Catalog filters
    catalogFilters,
    setCatalogFilters,

    activeCategory,
    activeInstrument,
    setActiveCategory,
    setActiveInstrument,

    demographics,
    displayName,
    setDemographics,
    toggleAnonymize,
    ageValidationWisc,
    ageValidationWais,

    currentBattery,
    setBattery,
    subtests: activeWechslerState.subtests,
    rawInputs: activeWechslerState.rawInputs,
    invalidSubtests: activeWechslerState.invalidSubtests,
    hasInvalidScores,
    administeredSubtestCount,
    setSubtestScore,
    clearAllScores,
    loadSampleProfile,
    primaryIndices: wechslerCalcResult.primaryIndices,
    cit: wechslerCalcResult.cit,
    ancillaryIndices: wechslerCalcResult.ancillaryIndices,
    discrepancies: wechslerCalcResult.discrepancies,
    strengthsWeaknesses: wechslerCalcResult.strengthsWeaknesses,
    isCompleteCit: wechslerCalcResult.isCompleteCit,

    sdqState,
    setSdqResponse,
    setSdqInformant,
    clearSdq,
    loadSdqSample,
    sdqCalculation,
    isSdqCompleted,

    phq9State,
    setPhq9Response,
    clearPhq9,
    loadPhq9Sample,
    phq9Calculation,
    isPhq9Completed,
    isPhq9Item9AlertActive,

    gad7State,
    setGad7Response,
    clearGad7,
    loadGad7Sample,
    gad7Calculation,
    isGad7Completed,

    mocaState,
    setMocaDomainScore,
    setMocaEducationYears,
    clearMoca,
    loadMocaSample,
    mocaCalculation,
    isMocaCompleted,
    isMocaAlertActive,

    htpRecord,
    setHtpRecord,
    clearHtp,
    loadHtpPreset,
    htpReport,
    isHtpCompleted,

    activeVignetteId,
    activeVignette,
    trainingMode,
    setTrainingMode,
    isDiagnosisRevealed,
    setIsDiagnosisRevealed,
    clinicianHypothesisNotes,
    setClinicianHypothesisNotes,
    loadClinicalVignette,

    branding,
    setBranding,
    resetBranding,
    savedSessions,
    saveCurrentSession,
    loadSavedSession,
    deleteSavedSession,

    resetFullSession,
    loadDemoSession,
  };

  return (
    <ClinicalSessionContext.Provider value={value}>
      {children}
    </ClinicalSessionContext.Provider>
  );
};

export const useClinicalSession = (): ClinicalSessionContextValue => {
  const context = useContext(ClinicalSessionContext);
  if (!context) {
    throw new Error('useClinicalSession must be used within a ClinicalSessionProvider');
  }
  return context;
};

export const useOptionalClinicalSession = (): ClinicalSessionContextValue | undefined => {
  return useContext(ClinicalSessionContext);
};
