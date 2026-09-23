import React from 'react';
import { useClinicalSession } from '../../context/ClinicalSessionContext';
import { MocaScoreAlert } from './MocaScoreAlert';
import { MocaDomainScores } from '../../../core/types/clinical';
import { Brain, RotateCcw, Sparkles, AlertTriangle, GraduationCap } from 'lucide-react';

interface DomainMeta {
  key: keyof MocaDomainScores;
  name: string;
  maxScore: number;
  description: string;
}

const MOCA_DOMAIN_CONFIGS: DomainMeta[] = [
  {
    key: 'visuospatialExecutive',
    name: 'Visoespacial / Ejecutiva',
    maxScore: 5,
    description: 'Alternancia conceptual (Trail Making B), copia del cubo, y dibujo del reloj (contorno, números, manecillas).',
  },
  {
    key: 'naming',
    name: 'Identificación / Denominación',
    maxScore: 3,
    description: 'Denominación de animales de baja familiaridad (León, Rinoceronte, Camello).',
  },
  {
    key: 'attention',
    name: 'Atención y Memoria de Trabajo',
    maxScore: 6,
    description: 'Dígitos directo/inverso (2 pts), detección de dianas (golpecito en letra A - 1 pt), y sustracción seriada de 7 en 7 (3 pts).',
  },
  {
    key: 'language',
    name: 'Lenguaje y Fluidez',
    maxScore: 3,
    description: 'Repetición de dos frases complejas (2 pts) y evocación fonémica rápida (letra P / F - 1 pt).',
  },
  {
    key: 'abstraction',
    name: 'Abstracción y Razonamiento Conceptual',
    maxScore: 2,
    description: 'Similitudes categoriales (Tren-Bicicleta, Reloj-Regla).',
  },
  {
    key: 'delayedRecall',
    name: 'Recuerdo Diferido de Palabras',
    maxScore: 5,
    description: 'Evocación libre y diferida de 5 palabras sin pistas (Rostro, Seda, Iglesia, Clavel, Rojo).',
  },
  {
    key: 'orientation',
    name: 'Orientación Temporoespacial',
    maxScore: 6,
    description: 'Día del mes, mes, año, día de la semana, lugar específico y localidad.',
  },
];

export const MocaInputCard: React.FC = () => {
  const {
    mocaState,
    setMocaDomainScore,
    setMocaEducationYears,
    clearMoca,
    loadMocaSample,
    mocaCalculation,
    isMocaAlertActive,
  } = useClinicalSession();

  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setMocaEducationYears(isNaN(val) ? 0 : Math.max(0, val));
  };

  return (
    <div className="space-y-6" data-testid="moca-input-card">
      {/* 1. Header & Configuration Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Evaluación Cognitiva Montreal (MoCA - Nasreddine)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                  Cribado Neurocognitivo Rápido
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                30 puntos directos a través de 7 dominios con regla estandarizada de ajuste por baja escolaridad (≤ 12 años).
              </p>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => loadMocaSample('normal')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ejemplo Normal (≥26)</span>
            </button>
            <button
              type="button"
              onClick={() => loadMocaSample('mci')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Ejemplo DCL (&lt;26)</span>
            </button>
            <button
              type="button"
              onClick={clearMoca}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>

        {/* Education Adjustment Configuration */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-purple-50/60 rounded-xl border border-purple-200 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <label htmlFor="moca-education-years" className="font-bold text-purple-950 block">
                Años de Escolaridad Formal del Evaluado:
              </label>
              <span className="text-[11px] text-purple-800">
                Regla de ajuste: Si escolaridad ≤ 12 años, se adiciona automáticamente +1 punto a la puntuación directa (máx. 30).
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <input
              id="moca-education-years"
              type="number"
              min={0}
              max={30}
              value={mocaState.educationYears}
              onChange={handleEducationChange}
              className="w-18 px-3 py-1.5 text-center font-bold text-purple-950 bg-white border border-purple-300 rounded-lg shadow-2xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <span className="text-purple-900 font-semibold text-xs">años</span>
          </div>
        </div>
      </div>

      {/* 2. Reactive Cutoff Alert Banner */}
      {mocaCalculation && (
        <MocaScoreAlert
          adjustedScore={mocaCalculation.adjustedScore}
          rawScore={mocaCalculation.rawScore}
          educationYears={mocaCalculation.educationYears}
          educationAdjustment={mocaCalculation.educationAdjustment}
          meetsClinicalCutoff={mocaCalculation.meetsClinicalCutoff}
          classification={mocaCalculation.classification}
        />
      )}

      {/* 3. 7 Cognitive Domains Input Grid */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
            Registro de Puntuaciones por Dominios Neurocognitivos
          </h4>
          <span className="text-[11px] text-slate-400">
            Puntuación directa acumulada: 0 a 30 puntos
          </span>
        </div>

        <div className="space-y-3">
          {MOCA_DOMAIN_CONFIGS.map((domain) => {
            const currentScore = mocaState.domains[domain.key] || 0;

            return (
              <div
                key={domain.key}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {domain.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      Máx. {domain.maxScore} pts
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {domain.description}
                  </p>
                </div>

                {/* Score Button Selector */}
                <div className="flex items-center gap-1 shrink-0 self-end md:self-auto">
                  {Array.from({ length: domain.maxScore + 1 }, (_, i) => i).map((scoreVal) => {
                    const isSelected = currentScore === scoreVal;

                    return (
                      <button
                        key={scoreVal}
                        type="button"
                        onClick={() => setMocaDomainScore(domain.key, scoreVal)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-purple-700 text-white shadow-xs scale-105'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                        aria-pressed={isSelected}
                      >
                        {scoreVal}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Domain Breakdown Table Summary */}
      {mocaCalculation && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Desglose de Rendimiento Cognitivo por Dominios
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
            {Object.entries(mocaCalculation.domains).map(([id, dom]) => {
              const pct = Math.round((dom.score / dom.maxScore) * 100);
              const isPreserved = pct >= 80;

              return (
                <div
                  key={id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1"
                >
                  <p className="text-[10px] font-bold text-slate-500 uppercase truncate">
                    {dom.name}
                  </p>
                  <p className="text-lg font-black text-slate-900">
                    {dom.score}
                    <span className="text-xs font-normal text-slate-400">/{dom.maxScore}</span>
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[9.5px] font-bold ${
                      isPreserved
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Interpretative text */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <p className="font-bold text-slate-800">Interpretación Neuropsicológica:</p>
            <p className="text-slate-600">{mocaCalculation.interpretation}</p>
            <p className="text-slate-600 mt-1">
              <strong>Recomendación pericial:</strong> {mocaCalculation.recommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
