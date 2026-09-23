import React from 'react';
import { useClinicalSession } from '../../context/ClinicalSessionContext';
import { GAD7_ITEMS } from '../../../core/tables/clinicalNorms';
import { Activity, RotateCcw, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Gad7InputCard: React.FC = () => {
  const {
    gad7State,
    setGad7Response,
    clearGad7,
    loadGad7Sample,
    gad7Calculation,
    isGad7Completed,
  } = useClinicalSession();

  const answeredCount = Object.keys(gad7State.responses).length;

  return (
    <div className="space-y-6" data-testid="gad7-input-card">
      {/* 1. Header & Configuration Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Escala del Trastorno de Ansiedad Generalizada (GAD-7 - Spitzer et al.)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                  Cribado y Severidad de Ansiedad
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                7 ítems para la identificación rápida y graduación de severidad de sintomatología ansiosa generalizada.
              </p>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => loadGad7Sample('minimal')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Normal (0-4)</span>
            </button>
            <button
              type="button"
              onClick={() => loadGad7Sample('moderate')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all shadow-xs"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Moderada (11)</span>
            </button>
            <button
              type="button"
              onClick={() => loadGad7Sample('severe')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 transition-all shadow-xs"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Severa (18)</span>
            </button>
            <button
              type="button"
              onClick={clearGad7}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-600 font-medium">
            Durante las <strong>últimas 2 semanas</strong>, ¿con qué frecuencia le han molestado los siguientes problemas?
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">
              {answeredCount} / 7 ítems
            </span>
            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${isGad7Completed ? 'bg-emerald-500' : 'bg-teal-600'}`}
                style={{ width: `${(answeredCount / 7) * 100}%` }}
              />
            </div>
            {isGad7Completed && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                <span>Completo</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Items List */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
            Registro de Respuestas por Ítem
          </h4>
          <span className="text-[11px] text-slate-400">
            0 = Para nada | 1 = Varios días | 2 = Más de la mitad | 3 = Casi todos los días
          </span>
        </div>

        <div className="space-y-2.5">
          {GAD7_ITEMS.map((item) => {
            const currentVal = gad7State.responses[item.itemNumber];
            const isAnswered = currentVal !== undefined;

            return (
              <div
                key={item.itemNumber}
                className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isAnswered
                    ? 'bg-slate-50/70 border-slate-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start md:items-center gap-3 flex-1">
                  <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center shrink-0">
                    {item.itemNumber}
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-slate-800">
                      {item.text}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.symptom}
                    </p>
                  </div>
                </div>

                {/* 4-Option Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                  {([0, 1, 2, 3] as const).map((opt) => {
                    const isSelected = currentVal === opt;

                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setGad7Response(item.itemNumber, opt)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-teal-700 text-white font-bold shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        aria-pressed={isSelected}
                      >
                        <span className="font-bold">{opt}</span>
                        <span className="hidden lg:inline text-[11px] ml-1">
                          ({opt === 0 ? 'Para nada' : opt === 1 ? 'Varios d.' : opt === 2 ? '&gt; mitad' : 'Casi todos'})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Score Summary & Severity Stratification */}
      {gad7Calculation && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Puntuación Total GAD-7
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-slate-900">
                  {gad7Calculation.totalScore}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 21</span>
                <span
                  className={`ml-2 px-3 py-1 rounded-full text-xs font-black uppercase ${
                    gad7Calculation.totalScore <= 4
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : gad7Calculation.totalScore <= 9
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : gad7Calculation.totalScore <= 14
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-red-100 text-red-900 border border-red-300'
                  }`}
                >
                  {gad7Calculation.severity}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {gad7Calculation.meetsClinicalCutoff ? (
                <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Punto de Corte Superado (≥ 10): Sugiere Probable TAG</span>
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Por debajo del punto de corte clínico (&lt; 10)</span>
                </span>
              )}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <p className="font-bold text-slate-800">Interpretación Pericial de Ansiedad:</p>
            <p className="text-slate-600">{gad7Calculation.interpretation}</p>
            <p className="text-slate-600 mt-1">
              <strong>Recomendación pericial:</strong> {gad7Calculation.recommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
