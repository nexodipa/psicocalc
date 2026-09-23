import React from 'react';
import { useClinicalSession } from '../../context/ClinicalSessionContext';
import { PHQ9_ITEMS } from '../../../core/tables/clinicalNorms';
import { Phq9SuicideAlertBanner } from './Phq9SuicideAlertBanner';
import { HeartPulse, RotateCcw, Sparkles, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

export const Phq9InputCard: React.FC = () => {
  const {
    phq9State,
    setPhq9Response,
    clearPhq9,
    loadPhq9Sample,
    phq9Calculation,
    isPhq9Completed,
    isPhq9Item9AlertActive,
  } = useClinicalSession();

  const answeredCount = Object.keys(phq9State.responses).length;
  const item9Value = phq9State.responses[9] ?? 0;

  const optionLabels = [
    'Para nada (0)',
    'Varios días (1)',
    'Más de la mitad de los días (2)',
    'Casi todos los días (3)',
  ];

  return (
    <div className="space-y-6" data-testid="phq9-input-card">
      {/* 1. Header & Configuration Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center shrink-0 shadow-sm">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Cuestionario de Salud del Paciente (PHQ-9 - Kroenke &amp; Spitzer)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                  Cribado y Severidad de Depresión
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                9 ítems según criterios diagnósticos DSM-5 para el episodio depresivo mayor y detección de ideación autolítica.
              </p>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => loadPhq9Sample('minimal')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Normal (0-4)</span>
            </button>
            <button
              type="button"
              onClick={() => loadPhq9Sample('moderate')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all shadow-xs"
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Moderada (11)</span>
            </button>
            <button
              type="button"
              onClick={() => loadPhq9Sample('critical')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 transition-all shadow-xs"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
              <span>Alerta Ítem 9 (Crítico)</span>
            </button>
            <button
              type="button"
              onClick={clearPhq9}
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
              {answeredCount} / 9 ítems
            </span>
            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${isPhq9Completed ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                style={{ width: `${(answeredCount / 9) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Critical Suicide Alert Banner (Reactively displayed when item 9 >= 1) */}
      <Phq9SuicideAlertBanner item9Score={item9Value} />

      {/* 3. Items List */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
            Escala de Frecuencia de Síntomas
          </h4>
          <span className="text-[11px] text-slate-400">
            0 = Para nada | 1 = Varios días | 2 = Más de la mitad | 3 = Casi todos los días
          </span>
        </div>

        <div className="space-y-2.5">
          {PHQ9_ITEMS.map((item) => {
            const currentVal = phq9State.responses[item.itemNumber];
            const isAnswered = currentVal !== undefined;
            const isItem9 = item.itemNumber === 9;
            const isItem9Critical = isItem9 && currentVal !== undefined && currentVal >= 1;

            return (
              <div
                key={item.itemNumber}
                className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isItem9Critical
                    ? 'bg-red-50/80 border-red-300 ring-1 ring-red-400'
                    : isAnswered
                    ? 'bg-slate-50/70 border-slate-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start md:items-center gap-3 flex-1">
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                      isItem9
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {item.itemNumber}
                  </span>
                  <div>
                    <span className={`text-xs font-semibold ${isItem9Critical ? 'text-red-950 font-bold' : 'text-slate-800'}`}>
                      {item.text}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{item.symptom}</span>
                      {isItem9 && (
                        <span className="px-1.5 py-0.2 rounded font-bold text-[10px] bg-red-100 text-red-800 border border-red-200">
                          Ítem de Seguridad Vital
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4-Option Button Segment (0, 1, 2, 3) */}
                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                  {([0, 1, 2, 3] as const).map((opt) => {
                    const isSelected = currentVal === opt;
                    const optBg =
                      isItem9 && opt >= 1 && isSelected
                        ? 'bg-red-600 text-white'
                        : isSelected
                        ? 'bg-indigo-700 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700';

                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setPhq9Response(item.itemNumber, opt)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${optBg} ${
                          isSelected ? 'font-bold shadow-xs' : ''
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

      {/* 4. Score Summary & Severity Stratification */}
      {phq9Calculation && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Puntuación Total PHQ-9
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-slate-900">
                  {phq9Calculation.totalScore}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 27</span>
                <span
                  className={`ml-2 px-3 py-1 rounded-full text-xs font-black uppercase ${
                    phq9Calculation.totalScore <= 4
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : phq9Calculation.totalScore <= 9
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : phq9Calculation.totalScore <= 14
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : phq9Calculation.totalScore <= 19
                      ? 'bg-orange-100 text-orange-900 border border-orange-300'
                      : 'bg-red-100 text-red-900 border border-red-300'
                  }`}
                >
                  {phq9Calculation.severity}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {phq9Calculation.meetsClinicalCutoff ? (
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  ⚠️ Supera Punto de Corte Clínico (≥ 10)
                </span>
              ) : (
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  ✓ Por debajo del Punto de Corte Clínico (&lt; 10)
                </span>
              )}

              {phq9Calculation.meetsMajorDepressionCriteria && (
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-900 border border-red-300">
                  Cumple Criterios Algorítmicos DSM-5 para Trastorno Depresivo Mayor
                </span>
              )}
            </div>
          </div>

          {/* Interpretative Guidance */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <p className="font-bold text-slate-800">Juicio Clínico e Interpretación:</p>
            <p className="text-slate-600">{phq9Calculation.interpretation}</p>
            <p className="text-slate-600 mt-1">
              <strong>Recomendación pericial:</strong> {phq9Calculation.recommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
