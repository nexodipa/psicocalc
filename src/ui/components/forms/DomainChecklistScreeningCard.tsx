import React, { useMemo, useCallback } from 'react';
import { useClinicalSession } from '../../context/ClinicalSessionContext';
import {
  calculateNeuropsiBreve,
  calculateMmse,
  calculateNeuroChecklist,
  NeuropsiBreveCalculationResult,
  MmseCalculationResult,
  NeuroChecklistResult,
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

export type ScreeningInstrumentId =
  | 'neuropsi_breve'
  | 'mmse'
  | 'cumanes'
  | 'neuro_kid'
  | 'lole';

interface DomainChecklistScreeningCardProps {
  instrumentId: ScreeningInstrumentId;
}

export const DomainChecklistScreeningCard: React.FC<DomainChecklistScreeningCardProps> = ({
  instrumentId,
}) => {
  const { testData, setBatteryData, demographics } = useClinicalSession();

  const data = testData[instrumentId] || {};

  const isPediatricNeuro = ['cumanes', 'neuro_kid', 'lole'].includes(instrumentId);

  // Age and education defaults
  const patientAge = demographics.birthDate
    ? Math.max(
        isPediatricNeuro ? 3 : 16,
        Math.floor(
          (new Date().getTime() - new Date(demographics.birthDate).getTime()) /
            (365.25 * 24 * 3600 * 1000)
        )
      )
    : isPediatricNeuro
    ? 8
    : 45;
  const age = typeof data.age === 'number' && data.age > 0 ? data.age : patientAge;
  const educationYears =
    typeof data.educationYears === 'number'
      ? data.educationYears
      : demographics.educationYears ?? (isPediatricNeuro ? 3 : 12);

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
    } else if (instrumentId === 'mmse') {
      return [
        { id: 'orientationTime', name: 'Orientación Temporal', max: 5, desc: 'Día, fecha, mes, año, estación' },
        { id: 'orientationSpace', name: 'Orientación Espacial', max: 5, desc: 'Lugar, planta, ciudad, provincia, país' },
        { id: 'registration', name: 'Fijación / Memoria Inmediata', max: 3, desc: '3 palabras (ej. balón, bandera, árbol)' },
        { id: 'attentionCalculation', name: 'Atención y Cálculo', max: 5, desc: 'Resta de 7 en 7 o palabra MUNDO al revés' },
        { id: 'recall', name: 'Memoria Diferida', max: 3, desc: 'Recuerdo de las 3 palabras' },
        { id: 'languagePraxis', name: 'Lenguaje y Praxias', max: 9, desc: 'Nombrar objetos, repetir frase, orden 3 pasos, copiar pentágonos' },
      ];
    } else if (instrumentId === 'cumanes') {
      return [
        { id: 'lenguaje_comprensivo', name: 'Lenguaje Comprensivo y Audioverbal', max: 20, desc: 'Comprensión audioverbal y de imágenes' },
        { id: 'lenguaje_expresivo', name: 'Fluidez Fonológica y Semántica', max: 20, desc: 'Fluidez verbal y leximetría' },
        { id: 'visopercepcion', name: 'Visopercepción', max: 20, desc: 'Reproducción gráfica de figuras geométricas' },
        { id: 'funcion_ejecutiva', name: 'Función Ejecutiva (Tiempo / Errores)', max: 20, desc: 'Secuenciación alternante y flexibilidad' },
        { id: 'memoria_verbal_visual', name: 'Memoria Verbal e Icónica', max: 20, desc: 'Evocación libre de palabras y láminas' },
        { id: 'ritmo', name: 'Ritmo y Lateralidad', max: 20, desc: 'Estructuración rítmica secuencial' },
      ];
    } else if (instrumentId === 'neuro_kid') {
      return [
        { id: 'motricidad', name: 'Coordinación y Praxias Motoras', max: 20, desc: 'Motricidad fina y gruesa' },
        { id: 'lenguaje_temprano', name: 'Lenguaje Articulatorio y Comprensivo', max: 20, desc: 'Denominación e identificación temprana' },
        { id: 'visoespacial', name: 'Construcción Visoespacial', max: 20, desc: 'Copia de trazos e integración perceptual' },
        { id: 'memoria_atencion', name: 'Atención y Memoria Inmediata', max: 20, desc: 'Rastreo visual y retención de estímulos' },
      ];
    } else {
      // LOLE
      return [
        { id: 'rima_aliteracion', name: 'Conciencia Silábica (Rima y Aliteración)', max: 20, desc: 'Identificación y emparejamiento de rimas' },
        { id: 'segmentacion_fonemica', name: 'Conciencia Fonémica y Segmentación', max: 20, desc: 'Aislamiento y síntesis de fonemas' },
        { id: 'vocabulario_morfosintaxis', name: 'Vocabulario y Morfosintaxis Oral', max: 20, desc: 'Estructuras gramaticales y cierre morfémico' },
        { id: 'lectura_inicial', name: 'Decodificación y Lectoescritura Inicial', max: 20, desc: 'Conversión grafema-fonema y lectura de palabras' },
      ];
    }
  }, [instrumentId]);

  const maxTotalScore = useMemo(() => {
    if (instrumentId === 'neuropsi_breve') return 130;
    if (instrumentId === 'mmse') return 30;
    if (instrumentId === 'cumanes') return 120;
    return 80;
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
    instrumentId === 'neuropsi_breve' || isPediatricNeuro
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
      } else if (instrumentId === 'mmse') {
        return calculateMmse({
          domainScores,
          rawScore,
          age,
          educationYears,
        });
      } else {
        return calculateNeuroChecklist(instrumentId, {
          domainScores,
          totalRawScore: rawScore,
          age,
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
          ...(instrumentId === 'mmse'
            ? { rawScore: nextTotal }
            : { totalRawScore: nextTotal }),
        };
      });
    },
    [instrumentId, domainsConfig, setBatteryData]
  );

  // Direct total update
  const handleDirectTotalChange = useCallback(
    (val: number) => {
      const clamped = Math.max(0, Math.min(maxTotalScore, val));
      setBatteryData(instrumentId, (prev: any = {}) => ({
        ...prev,
        ...(instrumentId === 'mmse'
          ? { rawScore: clamped }
          : { totalRawScore: clamped }),
      }));
    },
    [instrumentId, maxTotalScore, setBatteryData]
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
      ...(instrumentId === 'mmse' ? { rawScore: 0 } : { totalRawScore: 0 }),
      age: isPediatricNeuro ? 8 : 45,
      educationYears: isPediatricNeuro ? 3 : 12,
    });
  }, [instrumentId, isPediatricNeuro, setBatteryData]);

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
      } else if (instrumentId === 'mmse') {
        if (preset === 'normal') {
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
      } else {
        // Pediatric Neuro (CUMANES / NEURO-KID / LOLE)
        const ratio = preset === 'normal' ? 0.8 : preset === 'moderate' ? 0.42 : 0.22;
        const domMap: Record<string, number> = {};
        let sum = 0;
        domainsConfig.forEach((d) => {
          const v = Math.round(d.max * ratio);
          domMap[d.id] = v;
          sum += v;
        });
        setBatteryData(instrumentId, {
          age: instrumentId === 'neuro_kid' ? 5 : 8,
          totalRawScore: sum,
          domainScores: domMap,
        });
      }
    },
    [instrumentId, domainsConfig, setBatteryData]
  );

  const headerTitle = useMemo(() => {
    switch (instrumentId) {
      case 'neuropsi_breve':
        return 'NEUROPSI Breve — Evaluación Neuropsicológica en Español';
      case 'mmse':
        return 'MMSE — Mini-Mental State Examination (Folstein / NORMACODEM)';
      case 'cumanes':
        return 'CUMANES — Cuestionario de Madurez Neuropsicológica Escolar (7-11 años)';
      case 'neuro_kid':
        return 'NEURO-KID — Cribado Neuropsicológico Infantil Rápido (3-7 años)';
      case 'lole':
        return 'LOLE — Evaluación del Lenguaje Oral al Lenguaje Escrito y Conciencia Fonológica';
    }
  }, [instrumentId]);

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
                {headerTitle}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {instrumentId === 'neuropsi_breve'
                ? 'Matriz normativa de 16 celdas según estratificación por edad y escolaridad formal'
                : instrumentId === 'mmse'
                ? 'Cribado cognitivo con ajuste demográfico edad × escolaridad (estudio NORMACODEM)'
                : 'Evaluación neuropsicológica del desarrollo con Índice General (M=100, DE=15) y Decatipos (1-10)'}
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
              min={isPediatricNeuro ? 3 : 16}
              max={isPediatricNeuro ? 14 : 99}
              aria-label="Edad del paciente"
              value={age}
              onChange={(e) => handleDemographicChange('age', parseInt(e.target.value, 10) || 0)}
              className="psych-score-input w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg font-mono tabular-nums font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="psych-score-input w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg font-mono tabular-nums font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              {instrumentId === 'neuropsi_breve'
                ? `Estrato: ${getNeuropsiEducationLevel(educationYears)}`
                : instrumentId === 'mmse'
                ? `Ajuste NORMACODEM: ${getNormacodemDelta(age, educationYears) >= 0 ? '+' : ''}${getNormacodemDelta(age, educationYears)} ptos`
                : 'Escolaridad infantil / primaria'}
            </span>
          </div>

          <div>
            <label htmlFor="screening-total-input" className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Puntuación Total Directa (0–{maxTotalScore}):</span>
            </label>
            <input
              id="screening-total-input"
              type="number"
              min="0"
              max={maxTotalScore}
              aria-label="Puntuación total directa"
              value={rawScore}
              onChange={(e) => handleDirectTotalChange(parseInt(e.target.value, 10) || 0)}
              className="psych-score-input w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg font-mono tabular-nums font-black text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Máximo: {maxTotalScore} puntos
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
                  : `Clasificación diagnóstica en rango de: ${result.classification}`)}
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
          <span className="text-xs text-slate-500 font-mono tabular-nums">
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
                  <span className="text-xs text-slate-400 font-mono">
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
                    className="psych-score-input w-16 py-1.5 px-2 text-center font-mono tabular-nums font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-sm"
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
              {instrumentId === 'neuropsi_breve'
                ? 'Baremo UNAM / Ostrosky'
                : instrumentId === 'mmse'
                ? 'Baremo Lobo / Blesa'
                : 'Baremo Neuropsicológico Infantil'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {(() => {
              const isMmse = instrumentId === 'mmse';
              const mmseRes = isMmse ? (result as MmseCalculationResult) : null;
              const pedRes = isPediatricNeuro ? (result as NeuroChecklistResult) : null;
              const neuroRes =
                !isMmse && !isPediatricNeuro
                  ? (result as NeuropsiBreveCalculationResult)
                  : null;
              return (
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block mb-1">
                    {isMmse
                      ? 'Puntuación Ajustada:'
                      : isPediatricNeuro
                      ? 'Índice Estándar / Decatipo:'
                      : 'Puntuación Directa:'}
                  </span>
                  <span className="text-2xl font-mono tabular-nums font-black text-indigo-400">
                    {mmseRes
                      ? mmseRes.adjustedScore
                      : pedRes
                      ? `${pedRes.standardIndex} (Decatipo ${pedRes.decatype})`
                      : neuroRes?.totalScore ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {mmseRes
                      ? `Directa: ${mmseRes.rawScore} ptos (Delta: ${mmseRes.adjustmentDelta >= 0 ? '+' : ''}${mmseRes.adjustmentDelta})`
                      : pedRes
                      ? `Percentil ${pedRes.percentile} · PD: ${pedRes.totalScore}/${pedRes.maxScore}`
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
