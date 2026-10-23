import React, { useMemo, useCallback } from 'react';
import { useClinicalSession } from '../../context/ClinicalSessionContext';
import {
  calculateRaven2,
  validateRaven2,
  calculateToni4,
  validateToni4,
} from '../../../core';
import { Sparkles, RotateCcw, Brain, CheckCircle2, AlertTriangle } from 'lucide-react';

export type NonVerbalMatrixId = 'raven_2' | 'toni_4';

interface Raven2InputCardProps {
  instrumentId?: NonVerbalMatrixId;
}

export const Raven2InputCard: React.FC<Raven2InputCardProps> = ({
  instrumentId = 'raven_2',
}) => {
  const { testData, setBatteryData, demographics } = useClinicalSession();

  const data = testData[instrumentId] || {};
  const isToni4 = instrumentId === 'toni_4';
  const maxRaw = isToni4 ? 60 : 48;
  const maxAge = isToni4 ? 89 : 69;
  const minAge = isToni4 ? 6 : 4;

  const patientAge = demographics.birthDate
    ? Math.max(
        minAge,
        Math.min(
          maxAge,
          Math.floor(
            (new Date().getTime() - new Date(demographics.birthDate).getTime()) /
              (365.25 * 24 * 3600 * 1000)
          )
        )
      )
    : 10;

  const rawScore = typeof data.rawScore === 'number' ? data.rawScore : 0;
  const abilityScore = typeof data.abilityScore === 'number' ? data.abilityScore : undefined;
  const ageYears =
    typeof data.ageYears === 'number' && data.ageYears > 0 ? data.ageYears : patientAge;
  const ageMonths = typeof data.ageMonths === 'number' ? data.ageMonths : 0;

  // Validation
  const validation = useMemo(() => {
    if (isToni4) {
      return validateToni4({ rawScore, ageYears });
    }
    return validateRaven2({ rawScore, abilityScore, ageYears, ageMonths });
  }, [isToni4, rawScore, abilityScore, ageYears, ageMonths]);

  // Calculation
  const result = useMemo(() => {
    if (rawScore <= 0 && abilityScore === undefined) return null;
    try {
      if (isToni4) {
        const res = calculateToni4({ rawScore, ageYears });
        return {
          standardScore: res.indexScore,
          percentile: res.percentile,
          qualitative: res.qualitative,
          abilityScore: res.rawScore,
          ci95: res.ci95,
          ci90: res.ci90,
        };
      }
      return calculateRaven2({ rawScore, abilityScore, ageYears, ageMonths });
    } catch {
      return null;
    }
  }, [isToni4, rawScore, abilityScore, ageYears, ageMonths]);

  // Handle score change
  const handleScoreChange = useCallback(
    (field: 'rawScore' | 'abilityScore' | 'ageYears' | 'ageMonths', val: number) => {
      setBatteryData(instrumentId, (prev: any = {}) => ({
        ...prev,
        [field]: val,
      }));
    },
    [instrumentId, setBatteryData]
  );

  // Clear
  const handleClear = useCallback(() => {
    setBatteryData(instrumentId, {
      rawScore: 0,
      abilityScore: undefined,
      ageYears: 10,
      ageMonths: 0,
    });
  }, [instrumentId, setBatteryData]);

  // Presets
  const handleLoadSample = useCallback(
    (preset: 'average' | 'superior') => {
      if (isToni4) {
        if (preset === 'average') {
          setBatteryData('toni_4', { rawScore: 30, ageYears: 12, ageMonths: 0 });
        } else {
          setBatteryData('toni_4', { rawScore: 50, ageYears: 12, ageMonths: 0 });
        }
        return;
      }

      if (preset === 'average') {
        setBatteryData('raven_2', { rawScore: 24, ageYears: 10, ageMonths: 6 });
      } else {
        setBatteryData('raven_2', { rawScore: 40, ageYears: 10, ageMonths: 6 });
      }
    },
    [instrumentId, isToni4, setBatteryData]
  );

  return (
    <div className="space-y-6" data-testid={isToni4 ? 'toni4-form' : 'raven2-form'}>
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                <Brain className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {isToni4
                  ? 'TONI-4 — Test de Inteligencia No Verbal (Cuarta Edición)'
                  : 'Raven 2 — Matrices Progresivas de Raven (Segunda Edición)'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isToni4
                ? 'Evaluación de resolución abstracta de problemas libre de influencia lingüística y motriz (6 a 89 años).'
                : 'Evaluación de razonamiento analítico y aptitud cognitiva no verbal (4:0 a 69:11 años).'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleLoadSample('average')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Muestra Promedio</span>
            </button>

            <button
              type="button"
              onClick={() => handleLoadSample('superior')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition-all shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Capacidad Superior</span>
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

      {/* Validation */}
      {!validation.isValid && (
        <div
          data-testid="raven2-validation-error"
          className="bg-red-50 border-l-4 border-red-600 p-4 rounded-xl text-red-900 flex items-start gap-3 shadow-xs"
        >
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-black">ENTRADA FUERA DE RANGO</h4>
            <p className="text-xs text-red-800 mt-1">{validation.errors.join('; ')}</p>
          </div>
        </div>
      )}

      {/* Inputs */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label htmlFor="raven-raw-input" className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Aciertos Directos (0 - {maxRaw}):
          </label>
          <input
            id="raven-raw-input"
            type="number"
            min="0"
            max={maxRaw}
            aria-label={isToni4 ? 'Aciertos directos TONI-4' : 'Aciertos directos Raven 2'}
            aria-invalid={!validation.isValid}
            value={rawScore || ''}
            onChange={(e) => handleScoreChange('rawScore', parseInt(e.target.value, 10) || 0)}
            className="psych-score-input w-full py-2 px-3 text-lg font-mono tabular-nums font-black text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="0"
          />
        </div>

        <div>
          <label htmlFor="raven-age-years-input" className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Edad en Años ({minAge} - {maxAge}):
          </label>
          <input
            id="raven-age-years-input"
            type="number"
            min={minAge}
            max={maxAge}
            aria-label="Edad en años"
            value={ageYears}
            onChange={(e) => handleScoreChange('ageYears', parseInt(e.target.value, 10) || minAge)}
            className="psych-score-input w-full py-2 px-3 text-lg font-mono tabular-nums font-black text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label htmlFor="raven-age-months-input" className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Meses (0 - 11):
          </label>
          <input
            id="raven-age-months-input"
            type="number"
            min="0"
            max="11"
            aria-label="Edad en meses"
            value={ageMonths}
            onChange={(e) => handleScoreChange('ageMonths', parseInt(e.target.value, 10) || 0)}
            className="psych-score-input w-full py-2 px-3 text-lg font-mono tabular-nums font-black text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Puntuación Estándar No Verbal ({isToni4 ? 'TONI-4' : 'Raven 2'})
            </h4>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-900/50 text-blue-200 border border-blue-700">
              M = 100, DE = 15
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <span className="text-slate-400 block mb-1">CI Estándar No Verbal:</span>
              <span className="text-3xl font-mono tabular-nums font-black text-blue-400">
                {result.standardScore}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                Percentil: {result.percentile}
              </span>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <span className="text-slate-400 block mb-1">Clasificación Cualitativa:</span>
              <span className="text-base font-bold text-white mt-1 block">
                {result.qualitative}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {isToni4 ? `Puntuación Directa: ${result.abilityScore}/60` : `Aptitud Rasch: ${result.abilityScore}`}
              </span>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <span className="text-slate-400 block mb-1">Intervalo de Confianza (95%):</span>
              <span className="text-base font-mono tabular-nums font-bold text-indigo-300 mt-1 block">
                [{result.ci95[0]} - {result.ci95[1]}]
              </span>
              <span className="text-[10px] font-mono text-slate-400 block mt-1">
                IC 90%: [{result.ci90[0]} - {result.ci90[1]}]
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
