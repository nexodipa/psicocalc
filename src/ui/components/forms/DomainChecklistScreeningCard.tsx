import React, { useMemo, useCallback } from 'react';
import { useClinicalSession } from '../../context/ClinicalSessionContext';
import {
  calculateNeuropsiBreve,
  validateNeuropsiBreve,
  calculateMmse,
  validateMmse,
  NeuropsiBreveCalculationResult,
  MmseCalculationResult,
  getNormacodemDelta,
  getNeuropsiEducationLevel,
  getNeuropsiAgeGroup,
} from '../../../core';
import {
  Sparkles,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  GraduationCap,
  Calendar,
  Layers,
} from 'lucide-react';

export type ScreeningInstrumentId = 'neuropsi_breve' | 'mmse';

interface DomainChecklistScreeningCardProps {
  instrumentId: ScreeningInstrumentId;
}

export const DomainChecklistScreeningCard: React.FC<DomainChecklistScreeningCardProps> = ({
  instrumentId,
}) => {
  const { testData, setBatteryData, demographics } = useClinicalSession();

  const data = testData[instrumentId] || {};

  // Age and education defaults
  const patientAge = demographics.birthDate
    ? Math.max(16, Math.floor((new Date().getTime() - new Date(demographics.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000)))
    : 45;
  const age = typeof data.age === 'number' && data.age > 0 ? data.age : patientAge;
  const educationYears =
    typeof data.educationYears === 'number'
      ? data.educationYears
      : demographics.educationYears ?? 12;

  // Domain configurations
  const domainsConfig = useMemo(() => {
    if (instrumentId === 'neuropsi_breve') {
      return [
        { id: 'orientation', name: 'Orientación', max: 6, desc: 'Tiempo, espacio y persona' },
        { id: 'attentionConcentration', name: 'Atención y Concentración', max: 27, desc: 'Dígitos en regresión, detección visual y resta seriada' },
        { id: 'encodingMemory', name: 'Memoria de Codificación', max: 18, desc: 'Curva de memoria verbal y figura de Rey' },
        { id: 'language', name: 'Lenguaje', max: 26, desc: 'Denominación, repetición y comprensión' },
        { id: 'readingWriting', name: 'Lectoescritura', max: 5, desc: 'Lectura y escritura de enunciados' },
        { id: 'executiveFunctions', name: 'Funciones Ejecutivas', max: 18, desc: 'Fluidez verbal, semejanzas y secuencias motoras' },
        { id: 'recallMemory', name: 'Memoria de Evocación', max: 25, desc: 'Evocación libre y con claves de lista y figura' },
      ];
    } else {
      return [
        { id: 'orientationTime', name: 'Orientación Temporal', max: 5, desc: 'Día, fecha, mes, año, estación' },
        { id: 'orientationSpace', name: 'Orientación Espacial', max: 5, desc: 'Lugar, planta, ciudad, provincia, país' },
        { id: 'registration', name: 'Fijación / Memoria Inmediata', max: 3, desc: '3 palabras (ej. balón, bandera, árbol)' },
        { id: 'attentionCalculation', name: 'Atención y Cálculo', max: 5, desc: 'Resta de 7 en 7 o palabra MUNDO al revés' },
        { id: 'recall', name: 'Memoria Diferida', max: 3, desc: 'Recuerdo de las 3 palabras' },
        { id: 'languagePraxis', name: 'Lenguaje y Praxias', max: 9, desc: 'Nombrar objetos, repetir frase, orden 3 pasos, copiar pentágonos' },
      ];
    }
  }, [instrumentId]);

  // Current domain scores
  const domainScores: Record<string, number> = useMemo(() => {
    return data.domainScores || {};
  }, [data.domainScores]);

  // Total raw sum
  const computedRawSum = useMemo(() => {
    return domainsConfig.reduce((acc, d) => acc + (domainScores[d.id] || 0), 0);
  }, [domainsConfig, domainScores]);

  const rawScore =
    instrumentId === 'neuropsi_breve'
      ? data.totalRawScore !== undefined
        ? data.totalRawScore
        : computedRawSum
      : data.rawScore !== undefined
      ? data.rawScore
      : computedRawSum;

  // Real-time calculation
  const result = useMemo(() => {
    try {
      if (instrumentId === 'neuropsi_breve') {
        return calculateNeuropsiBreve({
          domainScores,
          totalRawScore: rawScore,
          age,
          educationYears,
        });
      } else {
        return calculateMmse({
          domainScores,
          rawScore,
          age,
          educationYears,
        });
      }
    } catch {
      return null;
    }
  }, [instrumentId, domainScores, rawScore, age, educationYears]);

  // Domain score update
  const handleDomainScoreChange = useCallback(
    (domainId: string, maxVal: number, val: number) => {
      const clamped = Math.max(0, Math.min(maxVal, val));
      setBatteryData(instrumentId, (prev: any = {}) => {
        const nextDomains = { ...(prev.domainScores || {}), [domainId]: clamped };
        const nextTotal = domainsConfig.reduce(
          (acc, d) => acc + (d.id === domainId ? clamped : nextDomains[d.id] || 0),
          0
        );

        return {
          ...prev,
          domainScores: nextDomains,
          ...(instrumentId === 'neuropsi_breve'
            ? { totalRawScore: nextTotal }
            : { rawScore: nextTotal }),
        };
      });
    },
    [instrumentId, domainsConfig, setBatteryData]
  );

  // Direct total update
  const handleDirectTotalChange = useCallback(
    (val: number) => {
      const maxTotal = instrumentId === 'neuropsi_breve' ? 130 : 30;
      const clamped = Math.max(0, Math.min(maxTotal, val));
      setBatteryData(instrumentId, (prev: any = {}) => ({
        ...prev,
        ...(instrumentId === 'neuropsi_breve'
          ? { totalRawScore: clamped }
          : { rawScore: clamped }),
      }));
    },
    [instrumentId, setBatteryData]
  );

  // Demographics update
  const handleDemographicChange = useCallback(
    (field: 'age' | 'educationYears', val: number) => {
      setBatteryData(instrumentId, (prev: any = {}) => ({
        ...prev,
        [field]: Math.max(0, val),
      }));
    },
    [instrumentId, setBatteryData]
  );

  // Clear
  const handleClear = useCallback(() => {
    setBatteryData(instrumentId, {
      domainScores: {},
      ...(instrumentId === 'neuropsi_breve' ? { totalRawScore: 0 } : { rawScore: 0 }),
      age: 45,
      educationYears: 12,
    });
  }, [instrumentId, setBatteryData]);

  // Presets
  const handleLoadSample = useCallback(
    (preset: 'normal' | 'moderate' | 'severe') => {
      if (instrumentId === 'neuropsi_breve') {
        if (preset === 'normal') {
          setBatteryData('neuropsi_breve', {
            age: 24,
            educationYears: 16,
            totalRawScore: 122,
            domainScores: {
              orientation: 6,
              attentionConcentration: 26,
              encodingMemory: 17,
              language: 25,
              readingWriting: 5,
              executiveFunctions: 18,
              recallMemory: 25,
            },
          });
        } else if (preset === 'moderate') {
          // Benchmark Case 9
          setBatteryData('neuropsi_breve', {
            age: 68,
            educationYears: 7,
            totalRawScore: 76,
            domainScores: {
              orientation: 5,
              attentionConcentration: 16,
              encodingMemory: 10,
              language: 18,
              readingWriting: 3,
              executiveFunctions: 11,
              recallMemory: 13,
            },
          });
        } else {
          setBatteryData('neuropsi_breve', {
            age: 72,
            educationYears: 0,
            totalRawScore: 35,
            domainScores: {
              orientation: 3,
              attentionConcentration: 8,
              encodingMemory: 4,
              language: 9,
              readingWriting: 1,
              executiveFunctions: 5,
              recallMemory: 5,
            },
          });
        }
      } else {
        // MMSE
        if (preset === 'normal') {
          // Benchmark 10B
          setBatteryData('mmse', {
            age: 32,
            educationYears: 18,
            rawScore: 30,
            domainScores: {
              orientationTime: 5,
              orientationSpace: 5,
              registration: 3,
              attentionCalculation: 5,
              recall: 3,
              languagePraxis: 9,
            },
          });
        } else if (preset === 'moderate') {
          // Benchmark 10A
          setBatteryData('mmse', {
            age: 78,
            educationYears: 6,
            rawScore: 23,
            domainScores: {
              orientationTime: 4,
              orientationSpace: 4,
              registration: 3,
              attentionCalculation: 3,
              recall: 1,
              languagePraxis: 8,
            },
          });
        } else {
          setBatteryData('mmse', {
            age: 80,
            educationYears: 4,
            rawScore: 18,
            domainScores: {
              orientationTime: 2,
              orientationSpace: 3,
              registration: 2,
              attentionCalculation: 2,
              recall: 1,
              languagePraxis: 8,
            },
          });
        }
      }
    },
    [instrumentId, setBatteryData]
  );

  return (
    <div className="space-y-6" data-testid={`screening-form-${instrumentId}`}>
      {/* 1. Header & Demographic Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-100 text-indigo-800 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {instrumentId === 'neuropsi_breve'
                  ? 'NEUROPSI Breve — Evaluación Neuropsicológica en Español'
                  : 'MMSE — Mini-Mental State Examination (Folstein / NORMACODEM)'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {instrumentId === 'neuropsi_breve'
                ? 'Matriz normativa de 16 celdas según estratificación por edad y escolaridad formal'
                : 'Cribado cognitivo con ajuste demográfico edad × escolaridad (estudio NORMACODEM)'}
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleLoadSample('normal')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Normal</span>
            </button>

            <button
              type="button"
              onClick={() => handleLoadSample('moderate')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-all shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Deterioro Moderado</span>
            </button>

            <button
              type="button"
              onClick={() => handleLoadSample('severe')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 transition-all shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Alteración Severa</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>

        {/* Demographic Adjustment Fields */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label htmlFor="screening-age-input" className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Edad del Paciente (años):</span>
            </label>
            <input
              id="screening-age-input"
              type="number"
              min="16"
              max="99"
              aria-label="Edad del paciente"
              value={age}
              onChange={(e) => handleDemographicChange('age', parseInt(e.target.value, 10) || 0)}
              className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {instrumentId === 'neuropsi_breve' && (
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Estrato: {getNeuropsiAgeGroup(age)} años
              </span>
            )}
          </div>

          <div>
            <label htmlFor="screening-edu-input" className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
              <span>Años de Escolaridad Formal:</span>
            </label>
            <input
              id="screening-edu-input"
              type="number"
              min="0"
              max="25"
              aria-label="Años de escolaridad"
              value={educationYears}
              onChange={(e) => handleDemographicChange('educationYears', parseInt(e.target.value, 10) || 0)}
              className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              {instrumentId === 'neuropsi_breve'
                ? `Estrato: ${getNeuropsiEducationLevel(educationYears)}`
                : `Ajuste NORMACODEM: ${getNormacodemDelta(age, educationYears) >= 0 ? '+' : ''}${getNormacodemDelta(age, educationYears)} ptos`}
            </span>
          </div>

          <div>
            <label htmlFor="screening-total-input" className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Puntuación Total Directa:</span>
            </label>
            <input
              id="screening-total-input"
              type="number"
              min="0"
              max={instrumentId === 'neuropsi_breve' ? 130 : 30}
              aria-label="Puntuación total directa"
              value={rawScore}
              onChange={(e) => handleDirectTotalChange(parseInt(e.target.value, 10) || 0)}
              className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg font-black text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Máximo: {instrumentId === 'neuropsi_breve' ? '130 puntos' : '30 puntos'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Clinical Cutoff Alert Banner */}
      {result && result.meetsClinicalCutoff && (
        <div
          data-testid="screening-cutoff-alert"
          className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded-xl text-amber-900 flex items-start gap-3 shadow-xs"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-black">
              ALERTA DE CRIBADO NEUROPSICOLÓGICO — PUNTUACIÓN BAJO PUNTO DE CORTE
            </h4>
            <p className="text-xs text-amber-800 mt-1">
              {result.alertMessage ||
                (instrumentId === 'mmse'
                  ? `Puntuación ajustada (${(result as MmseCalculationResult).adjustedScore} / 30) inferior al punto de corte clínico (< 24).`
                  : `Clasificación diagnóstica en rango de: ${(result as NeuropsiBreveCalculationResult).classification}`)}
            </p>
          </div>
        </div>
      )}

      {/* 3. Subdomain Breakdown Checklist Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Desglose por Subdominios Cognitivos
          </span>
          <span className="text-xs text-slate-500">
            Suma calculada: {computedRawSum} puntos
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {domainsConfig.map((dom) => {
            const val = domainScores[dom.id] ?? 0;
            return (
              <div
                key={dom.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{dom.name}</h4>
                  <p className="text-[11px] text-slate-500">{dom.desc}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-medium">
                    (0 a {dom.max})
                  </span>

                  <input
                    type="number"
                    min="0"
                    max={dom.max}
                    aria-label={`Puntuación para ${dom.name}`}
                    value={val}
                    onChange={(e) =>
                      handleDomainScoreChange(
                        dom.id,
                        dom.max,
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                    className="w-16 py-1.5 px-2 text-center font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-sm"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Real-time Summary Card */}
      {result && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Diagnóstico y Clasificación Normativa
            </h4>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-900/40 text-indigo-300 border border-indigo-700">
              {instrumentId === 'neuropsi_breve' ? 'Baremo UNAM / Ostrosky' : 'Baremo Lobo / Blesa'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {(() => {
              const isMmse = instrumentId === 'mmse';
              const mmseRes = isMmse ? (result as MmseCalculationResult) : null;
              const neuroRes = !isMmse ? (result as NeuropsiBreveCalculationResult) : null;
              return (
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block mb-1">
                    {isMmse ? 'Puntuación Ajustada:' : 'Puntuación Directa:'}
                  </span>
                  <span className="text-2xl font-black text-indigo-400">
                    {mmseRes ? mmseRes.adjustedScore : (neuroRes?.totalScore ?? 0)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {mmseRes
                      ? `Directa: ${mmseRes.rawScore} ptos (Delta: ${mmseRes.adjustmentDelta >= 0 ? '+' : ''}${mmseRes.adjustmentDelta})`
                      : `Sobre 130 puntos posibles`}
                  </span>
                </div>
              );
            })()}

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <span className="text-slate-400 block mb-1">Estado de Corte:</span>
              <span
                className={`text-base font-bold flex items-center gap-1.5 mt-1 ${
                  result.meetsClinicalCutoff ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {result.meetsClinicalCutoff ? 'BAJO PUNTO DE CORTE' : 'NORMAL / ADECUADO'}
              </span>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <span className="text-slate-400 block mb-1">Clasificación Clínica:</span>
              <span className="text-base font-bold text-white mt-1 block">
                {result.classification}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
