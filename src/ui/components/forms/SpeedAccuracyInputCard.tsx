import React, { useMemo, useCallback } from 'react';
import { useClinicalSession } from '../../context/ClinicalSessionContext';
import { calculateD2r, validateD2r } from '../../../core';
import {
  Sparkles,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  RotateCcw,
  Gauge,
  Activity,
  Zap,
} from 'lucide-react';

export const SpeedAccuracyInputCard: React.FC = () => {
  const { testData, setBatteryData } = useClinicalSession();

  const data = testData['d2_r'] || { tr: 0, ta: 0, o: 0, c: 0 };

  const tr = typeof data.tr === 'number' ? data.tr : 0;
  const ta = typeof data.ta === 'number' ? data.ta : 0;
  const o = typeof data.o === 'number' ? data.o : typeof data.e1 === 'number' ? data.e1 : 0;
  const c = typeof data.c === 'number' ? data.c : typeof data.e2 === 'number' ? data.e2 : 0;

  // Validation
  const validation = useMemo(() => {
    return validateD2r({ tr, ta, o, c });
  }, [tr, ta, o, c]);

  // Reactive calculation
  const result = useMemo(() => {
    if (tr <= 0) return null;
    try {
      return calculateD2r({ tr, ta, o, c });
    } catch {
      return null;
    }
  }, [tr, ta, o, c]);

  // Update fields
  const handleFieldChange = useCallback(
    (field: 'tr' | 'ta' | 'o' | 'c', val: number) => {
      setBatteryData('d2_r', (prev: any = {}) => ({
        ...prev,
        [field]: Math.max(0, val),
        ...(field === 'o' ? { e1: Math.max(0, val) } : {}),
        ...(field === 'c' ? { e2: Math.max(0, val) } : {}),
      }));
    },
    [setBatteryData]
  );

  // Clear
  const handleClear = useCallback(() => {
    setBatteryData('d2_r', { tr: 0, ta: 0, o: 0, c: 0, e1: 0, e2: 0 });
  }, [setBatteryData]);

  // Presets
  const handleLoadSample = useCallback(
    (preset: 'optimal' | 'impulsive' | 'invalid') => {
      if (preset === 'optimal') {
        // Benchmark Case 7
        setBatteryData('d2_r', { tr: 540, ta: 220, o: 8, c: 4, e1: 8, e2: 4 });
      } else if (preset === 'impulsive') {
        // Benchmark Case 8
        setBatteryData('d2_r', { tr: 480, ta: 160, o: 25, c: 45, e1: 25, e2: 45 });
      } else {
        // Invalidation CP% > 40%
        setBatteryData('d2_r', { tr: 200, ta: 80, o: 45, c: 45, e1: 45, e2: 45 });
      }
    },
    [setBatteryData]
  );

  return (
    <div className="space-y-6" data-testid="speed-accuracy-form">
      {/* 1. Header & Presets */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <Gauge className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                D2-R — Test de Atención y Concentración (Velocidad y Precisión)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registro cuantitativo de elementos revisados, aciertos y errores de omisión y comisión.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleLoadSample('optimal')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Muestra Óptima</span>
            </button>

            <button
              type="button"
              onClick={() => handleLoadSample('impulsive')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-all shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Estilo Impulsivo</span>
            </button>

            <button
              type="button"
              onClick={() => handleLoadSample('invalid')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 transition-all shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Protocolo Inválido</span>
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
      </div>

      {/* 2. Validation Errors or Protocol Invalidation */}
      {!validation.isValid && (
        <div
          data-testid="d2r-validation-error"
          className="bg-red-50 border-l-4 border-red-600 p-4 rounded-xl text-red-900 flex items-start gap-3 shadow-xs"
        >
          <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-black">INVARIANTE MATEMÁTICO NO VÁLIDO EN D2-R</h4>
            <p className="text-xs text-red-800 mt-1">
              {validation.errors.join('; ')}
            </p>
          </div>
        </div>
      )}

      {result && result.validity && !result.validity.isValidProtocol && (
        <div
          data-testid="d2r-invalidation-banner"
          className="bg-rose-50 border-l-4 border-rose-600 p-4 rounded-xl text-rose-900 flex items-start gap-3 shadow-xs"
        >
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-black">
              PROTOCOLO D2-R PROTOCOLARMENTE NO INTERPRETABLE
            </h4>
            <p className="text-xs text-rose-800 mt-1">
              {result.validity.invalidationReason || 'El índice de errores supera el límite psicométrico tolerable (CP% > 40%).'}
            </p>
          </div>
        </div>
      )}

      {/* Impulsive style alert */}
      {result && result.clinicalNote && (
        <div
          data-testid="d2r-clinical-note"
          className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded-xl text-amber-900 flex items-start gap-3 shadow-xs"
        >
          <Activity className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-black">OBSERVACIÓN DE ESTILO ATENCIONAL</h4>
            <p className="text-xs text-amber-800 mt-1">{result.clinicalNote}</p>
          </div>
        </div>
      )}

      {/* 3. Numeric Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TR */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <label htmlFor="d2r-tr-input" className="block text-xs font-bold text-slate-700 uppercase">
            TR — Total Revisados
          </label>
          <p className="text-[11px] text-slate-400">Total de caracteres marcados (0..658)</p>
          <input
            id="d2r-tr-input"
            type="number"
            min="0"
            max="658"
            aria-label="Total Caracteres Revisados (TR)"
            value={tr || ''}
            onChange={(e) => handleFieldChange('tr', parseInt(e.target.value, 10) || 0)}
            placeholder="0"
            className="w-full py-2.5 px-3 text-lg font-black text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        {/* TA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <label htmlFor="d2r-ta-input" className="block text-xs font-bold text-slate-700 uppercase">
            TA — Total Aciertos
          </label>
          <p className="text-[11px] text-slate-400">Dianas correctas marcadas (&apos;d&apos; con 2 rayas)</p>
          <input
            id="d2r-ta-input"
            type="number"
            min="0"
            max="658"
            aria-label="Total Aciertos (TA)"
            value={ta || ''}
            onChange={(e) => handleFieldChange('ta', parseInt(e.target.value, 10) || 0)}
            placeholder="0"
            className="w-full py-2.5 px-3 text-lg font-black text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        {/* O / E1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <label htmlFor="d2r-o-input" className="block text-xs font-bold text-slate-700 uppercase">
            O / E1 — Omisiones
          </label>
          <p className="text-[11px] text-slate-400">Dianas no marcadas en la línea</p>
          <input
            id="d2r-o-input"
            type="number"
            min="0"
            max="658"
            aria-label="Omisiones (O/E1)"
            value={o || ''}
            onChange={(e) => handleFieldChange('o', parseInt(e.target.value, 10) || 0)}
            placeholder="0"
            className="w-full py-2.5 px-3 text-lg font-black text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        {/* C / E2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <label htmlFor="d2r-c-input" className="block text-xs font-bold text-slate-700 uppercase">
            C / E2 — Comisiones
          </label>
          <p className="text-[11px] text-slate-400">Elementos distractores marcados</p>
          <input
            id="d2r-c-input"
            type="number"
            min="0"
            max="658"
            aria-label="Comisiones (C/E2)"
            value={c || ''}
            onChange={(e) => handleFieldChange('c', parseInt(e.target.value, 10) || 0)}
            placeholder="0"
            className="w-full py-2.5 px-3 text-lg font-black text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>
      </div>

      {/* 4. Real-Time Computed Indices & Scores */}
      {result && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Índices Atencionales Computados en Tiempo Real
            </h4>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-900/40 text-amber-300 border border-amber-700">
              D2-R Baremo Adulto
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-xs block">TOT (Total Errores):</span>
              <span className="text-2xl font-black text-white mt-1 block">{result.tot}</span>
              <span className="text-[10px] text-slate-400">E1 + E2</span>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-xs block">CON (Concentración):</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">{result.con}</span>
              <span className="text-[10px] text-slate-400">TA - C</span>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-xs block">CP% (Precisión):</span>
              <span className="text-2xl font-black text-white mt-1 block">
                {result.cpPercent.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400">(O+C) / TR</span>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-xs block">Puntuación T:</span>
              <span className="text-2xl font-black text-indigo-400 mt-1 block">T = {result.tScore}</span>
              <span className="text-[10px] text-slate-400">Percentil {result.percentile}</span>
            </div>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400 mr-2">Decatipo:</span>
              <span className="font-bold text-white text-sm mr-4">DE = {result.decatype}</span>
              <span className="text-slate-400 mr-2">Nivel de Concentración:</span>
              <span className="font-bold text-amber-300 text-sm">
                {result.qualitativeConcentration}
              </span>
            </div>

            <div>
              <span className="text-slate-400 mr-2">Nivel de Precisión:</span>
              <span className="font-bold text-slate-100">{result.qualitativePrecision}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
