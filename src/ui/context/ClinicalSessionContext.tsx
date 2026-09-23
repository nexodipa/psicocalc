import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  BatteryType,
  SubtestId,
  calculateWiscV,
  calculateWaisIV,
  validateAgeAndBattery,
  validateScaledScore,
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
import {
  ClinicalCategory,
  ClinicalInstrument,
  ClinicalSessionContextValue,
  ClinicalSessionState,
  ExtendedPatientDemographics,
  WechslerSessionState,
  SdqSessionState,
  Phq9SessionState,
  Gad7SessionState,
  MocaSessionState,
  AdministeredInstruments,
} from './ClinicalSessionTypes';
import { anonymizeName } from '../hooks/usePsychometrics';

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

const ClinicalSessionContext = createContext<ClinicalSessionContextValue | undefined>(undefined);

export const ClinicalSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Navigation state
  const [activeCategory, setActiveCategory] = useState<ClinicalCategory>('intelligence');
  const [activeInstrument, setActiveInstrument] = useState<ClinicalInstrument>('wisc_v');

  // 2. Demographics & 1-click anonymization
  const [demographics, setDemographicsState] = useState<ExtendedPatientDemographics>(INITIAL_DEMOGRAPHICS);
  const [originalName, setOriginalName] = useState<string>(INITIAL_DEMOGRAPHICS.nameOrId);

  // 3. Independent Wechsler States
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

  // 4. SDQ State
  const [sdqState, setSdqState] = useState<SdqSessionState>({
    informant: 'parent',
    responses: {},
  });

  // 5. PHQ-9 State
  const [phq9State, setPhq9State] = useState<Phq9SessionState>({
    responses: {},
  });

  // 6. GAD-7 State
  const [gad7State, setGad7State] = useState<Gad7SessionState>({
    responses: {},
  });

  // 7. MoCA State
  const [mocaState, setMocaState] = useState<MocaSessionState>({
    domains: { ...INITIAL_MOCA_DOMAINS },
    educationYears: INITIAL_DEMOGRAPHICS.educationYears ?? 12,
  });

  // 8. HTP State
  const [htpRecord, setHtpRecordState] = useState<HtpAssessmentRecord>({ ...INITIAL_HTP_RECORD });

  // Demographics Handlers
  const setDemographics = useCallback((updater: Partial<ExtendedPatientDemographics>) => {
    setDemographicsState((prev) => {
      const next = { ...prev, ...updater };
      if (updater.nameOrId !== undefined && !next.isAnonymized) {
        setOriginalName(updater.nameOrId);
      }
      if (updater.educationYears !== undefined) {
        setMocaState((mPrev) => ({ ...mPrev, educationYears: updater.educationYears! }));
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

  // Wechsler Active Accessors
  const activeWechslerState = currentBattery === 'WISC-V' ? wiscState : waisState;
  const setSubtestScore = useCallback(
    (id: SubtestId, score: number | null, rawText?: string) => {
      const isWisc = currentBattery === 'WISC-V';
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
          return {
            subtests: nextSubtests,
            rawInputs: nextRaw,
            invalidSubtests: nextInvalid,
          };
        }

        const validation = validateScaledScore(score);
        if (!validation.isValid) {
          nextInvalid[id] = validation.errorMessage || 'Puntuación fuera de rango (1-19)';
          delete nextSubtests[id];
        } else {
          delete nextInvalid[id];
          nextSubtests[id] = score;
        }

        return {
          subtests: nextSubtests,
          rawInputs: nextRaw,
          invalidSubtests: nextInvalid,
        };
      });
    },
    [currentBattery]
  );

  const clearAllScores = useCallback(() => {
    const isWisc = currentBattery === 'WISC-V';
    const updater = isWisc ? setWiscState : setWaisState;
    updater({
      subtests: {},
      rawInputs: {},
      invalidSubtests: {},
    });
  }, [currentBattery]);

  const loadSampleProfile = useCallback(
    (type: 'average' | 'gifted' | 'adhd') => {
      const isWisc = currentBattery === 'WISC-V';
      const sample = isWisc ? WISC_V_SAMPLES[type] : WAIS_IV_SAMPLES[type];
      const raw: Record<string, string> = {};
      Object.entries(sample).forEach(([k, v]) => {
        raw[k] = String(v);
      });
      const updater = isWisc ? setWiscState : setWaisState;
      updater({
        subtests: { ...sample },
        rawInputs: raw,
        invalidSubtests: {},
      });
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

  // SDQ Handlers & Calculations
  const setSdqResponse = useCallback((itemNumber: number, value: 0 | 1 | 2) => {
    setSdqState((prev) => ({
      ...prev,
      responses: {
        ...prev.responses,
        [itemNumber]: value,
      },
    }));
  }, []);

  const setSdqInformant = useCallback((informant: SdqInformantType) => {
    setSdqState((prev) => ({ ...prev, informant }));
  }, []);

  const clearSdq = useCallback(() => {
    setSdqState((prev) => ({ ...prev, responses: {} }));
  }, []);

  const loadSdqSample = useCallback((preset: 'normal' | 'clinical' = 'normal') => {
    if (preset === 'normal') {
      const sample: Record<number, number> = {
        1: 1, 2: 0, 3: 0, 4: 0, 5: 0,
        6: 0, 7: 2, 8: 0, 9: 1, 10: 0,
        11: 2, 12: 0, 13: 0, 14: 2, 15: 0,
        16: 0, 17: 1, 18: 0, 19: 0, 20: 1,
        21: 2, 22: 0, 23: 0, 24: 0, 25: 2,
      };
      setSdqState((prev) => ({ ...prev, responses: sample }));
    } else {
      // Clinical profile (elevated difficulties)
      const sample: Record<number, number> = {
        1: 2, 2: 2, 3: 2, 4: 2, 5: 1,
        6: 1, 7: 0, 8: 2, 9: 2, 10: 2,
        11: 0, 12: 2, 13: 1, 14: 0, 15: 2,
        16: 2, 17: 1, 18: 2, 19: 2, 20: 0,
        21: 0, 22: 2, 23: 1, 24: 2, 25: 0,
      };
      setSdqState((prev) => ({ ...prev, responses: sample }));
    }
  }, []);

  const sdqCalculation = useMemo(() => {
    const answeredCount = Object.keys(sdqState.responses).length;
    if (answeredCount < 15) return null; // Need sufficient items across scales
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

  // PHQ-9 Handlers & Calculations
  const setPhq9Response = useCallback((itemNumber: number, value: 0 | 1 | 2 | 3) => {
    setPhq9State((prev) => ({
      ...prev,
      responses: {
        ...prev.responses,
        [itemNumber]: value,
      },
    }));
  }, []);

  const clearPhq9 = useCallback(() => {
    setPhq9State({ responses: {} });
  }, []);

  const loadPhq9Sample = useCallback((preset: 'minimal' | 'moderate' | 'critical' = 'minimal') => {
    if (preset === 'minimal') {
      setPhq9State({
        responses: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
      });
    } else if (preset === 'moderate') {
      setPhq9State({
        responses: { 1: 2, 2: 2, 3: 1, 4: 2, 5: 1, 6: 1, 7: 1, 8: 1, 9: 0 },
      });
    } else {
      // Critical suicide risk alert (Item 9 = 2)
      setPhq9State({
        responses: { 1: 3, 2: 3, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 1, 9: 2 },
      });
    }
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

  // GAD-7 Handlers & Calculations
  const setGad7Response = useCallback((itemNumber: number, value: 0 | 1 | 2 | 3) => {
    setGad7State((prev) => ({
      ...prev,
      responses: {
        ...prev.responses,
        [itemNumber]: value,
      },
    }));
  }, []);

  const clearGad7 = useCallback(() => {
    setGad7State({ responses: {} });
  }, []);

  const loadGad7Sample = useCallback((preset: 'minimal' | 'moderate' | 'severe' = 'minimal') => {
    if (preset === 'minimal') {
      setGad7State({
        responses: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
      });
    } else if (preset === 'moderate') {
      setGad7State({
        responses: { 1: 2, 2: 2, 3: 1, 4: 1, 5: 2, 6: 1, 7: 2 },
      });
    } else {
      setGad7State({
        responses: { 1: 3, 2: 3, 3: 2, 4: 3, 5: 2, 6: 2, 7: 3 },
      });
    }
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

  // MoCA Handlers & Calculations
  const setMocaDomainScore = useCallback((domain: keyof MocaDomainScores, score: number) => {
    setMocaState((prev) => ({
      ...prev,
      domains: {
        ...prev.domains,
        [domain]: score,
      },
    }));
  }, []);

  const setMocaEducationYears = useCallback((years: number) => {
    setMocaState((prev) => ({ ...prev, educationYears: years }));
  }, []);

  const clearMoca = useCallback(() => {
    setMocaState((prev) => ({
      ...prev,
      domains: { ...INITIAL_MOCA_DOMAINS },
    }));
  }, []);

  const loadMocaSample = useCallback((preset: 'normal' | 'mci' = 'normal') => {
    if (preset === 'normal') {
      setMocaState((prev) => ({
        ...prev,
        domains: {
          visuospatialExecutive: 5,
          naming: 3,
          attention: 6,
          language: 3,
          abstraction: 2,
          delayedRecall: 4,
          orientation: 6,
        },
      }));
    } else {
      // Mild Cognitive Impairment (< 26)
      setMocaState((prev) => ({
        ...prev,
        domains: {
          visuospatialExecutive: 3,
          naming: 2,
          attention: 4,
          language: 2,
          abstraction: 1,
          delayedRecall: 1,
          orientation: 5,
        },
      }));
    }
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

  // HTP Handlers & Calculations
  const setHtpRecord = useCallback(
    (updater: HtpAssessmentRecord | ((prev: HtpAssessmentRecord) => HtpAssessmentRecord)) => {
      setHtpRecordState((prev) => {
        if (typeof updater === 'function') {
          return updater(prev);
        }
        return updater;
      });
    },
    []
  );

  const clearHtp = useCallback(() => {
    setHtpRecordState({ ...INITIAL_HTP_RECORD });
  }, []);

  const loadHtpPreset = useCallback((preset: HtpBenchmarkPreset) => {
    const selected = HTP_BENCHMARK_PROFILES[preset];
    if (selected) {
      setHtpRecordState({
        ...JSON.parse(JSON.stringify(selected)),
        id: 'htp-preset-' + preset,
      });
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

  // Administered Instruments Tracking
  const administered: AdministeredInstruments = useMemo(() => {
    const wiscAdministered = Object.keys(wiscState.subtests).length > 0;
    const waisAdministered = Object.keys(waisState.subtests).length > 0;
    return {
      wiscV: wiscAdministered,
      waisIV: waisAdministered,
      sdq: isSdqCompleted || Object.keys(sdqState.responses).length >= 15,
      phq9: isPhq9Completed,
      gad7: isGad7Completed,
      moca: isMocaCompleted,
      htp: isHtpCompleted,
    };
  }, [
    wiscState.subtests,
    waisState.subtests,
    isSdqCompleted,
    sdqState.responses,
    isPhq9Completed,
    isGad7Completed,
    isMocaCompleted,
    isHtpCompleted,
  ]);

  // Global Session Reset & Demo Loader
  const resetFullSession = useCallback(() => {
    setDemographicsState({ ...INITIAL_DEMOGRAPHICS });
    setOriginalName(INITIAL_DEMOGRAPHICS.nameOrId);
    setWiscState({ subtests: {}, rawInputs: {}, invalidSubtests: {} });
    setWaisState({ subtests: {}, rawInputs: {}, invalidSubtests: {} });
    setSdqState({ informant: 'parent', responses: {} });
    setPhq9State({ responses: {} });
    setGad7State({ responses: {} });
    setMocaState({ domains: { ...INITIAL_MOCA_DOMAINS }, educationYears: 12 });
    setHtpRecordState({ ...INITIAL_HTP_RECORD });
  }, []);

  const loadDemoSession = useCallback(() => {
    // Populate rich multimodal clinical session for demo
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
