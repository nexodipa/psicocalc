import React from 'react';
import { useClinicalSession } from '../../context/ClinicalSessionContext';
import { SDQ_ITEMS } from '../../../core/tables/clinicalNorms';
import { SdqProfileBarChart } from './SdqProfileBarChart';
import { SdqInformantType } from '../../../core/types/clinical';
import { Users, RotateCcw, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const SdqInputCard: React.FC = () => {
  const {
    sdqState,
    setSdqResponse,
    setSdqInformant,
    clearSdq,
    loadSdqSample,
    sdqCalculation,
    isSdqCompleted,
  } = useClinicalSession();

  const answeredCount = Object.keys(sdqState.responses).length;

  const handleInformantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSdqInformant(e.target.value as SdqInformantType);
  };

  return (
    <div className="space-y-6" data-testid="sdq-input-card">
      {/* 1. Header & Configuration Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Cuestionario de Cualidades y Dificultades (SDQ - Goodman)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  Infanto-Juvenil (4-17 a)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluación comportamental y socioemocional: 5 subescalas (25 ítems) y puntuación total de dificultades.
              </p>
            </div>
          </div>

          {/* Quick presets & action bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => loadSdqSample('normal')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ejemplo Normal</span>
            </button>
            <button
              type="button"
              onClick={() => loadSdqSample('clinical')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 transition-all shadow-xs"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Ejemplo Clínico</span>
            </button>
            <button
              type="button"
              onClick={clearSdq}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>

        {/* Informant Selector & Progress Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <label htmlFor="sdq-informant-select" className="text-xs font-bold text-slate-700">
              Versión / Informante del Protocolo:
            </label>
            <select
              id="sdq-informant-select"
              value={sdqState.informant}
              onChange={handleInformantChange}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="parent">Padres / Cuidadores (Población 4-17 años)</option>
              <option value="teacher">Profesores / Maestros (Entorno Escolar)</option>
              <option value="self">Autoinforme (Adolescentes 11-17 años)</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-600">
              Progreso de ítems: <strong>{answeredCount} / 25</strong>
            </span>
            <div className="w-28 h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isSdqCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${(answeredCount / 25) * 100}%` }}
              />
            </div>
            {isSdqCompleted && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                <span>Completo</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Questionnaire Grid (25 items) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
            Registro de Respuestas por Ítem
          </h4>
          <span className="text-[11px] text-slate-400">
            0 = No es verdad | 1 = Un tanto verdad | 2 = Totalmente verdad
          </span>
        </div>

        <div className="space-y-2">
          {SDQ_ITEMS.map((item) => {
            const currentVal = sdqState.responses[item.itemNumber];
            const isAnswered = currentVal !== undefined;

            return (
              <div
                key={item.itemNumber}
                className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isAnswered
                    ? 'bg-slate-50/70 border-slate-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start sm:items-center gap-2.5 flex-1">
                  <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center shrink-0">
                    {item.itemNumber}
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-slate-800">
                      {item.text}
                    </span>
                    {item.isReversed && (
                      <span className="ml-2 text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                        Ítem inverso
                      </span>
                    )}
                  </div>
                </div>

                {/* 3-Option Button Segment */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                  {([0, 1, 2] as const).map((opt) => {
                    const isSelected = currentVal === opt;
                    const labels = ['No es verdad', 'Un tanto verdad', 'Totalmente verdad'];

                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSdqResponse(item.itemNumber, opt)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-700 text-white font-bold shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        aria-pressed={isSelected}
                      >
                        <span className="font-bold mr-1">{opt}</span>
                        <span className="hidden md:inline text-[11px]">({labels[opt]})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Reactive Visual Results & SdqProfileBarChart */}
      {sdqCalculation && (
        <div className="space-y-4">
          <SdqProfileBarChart sdqResult={sdqCalculation} />

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(sdqCalculation.subscales).map(([key, sub]) => {
              const badgeClass =
                sub.classification === 'Normal'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : sub.classification === 'Borderline'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-red-100 text-red-800 border-red-200';

              return (
                <div
                  key={key}
                  className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1 text-center"
                >
                  <p className="text-[10px] font-bold text-slate-500 uppercase truncate">
                    {sub.name}
                  </p>
                  <p className="text-xl font-black text-slate-900">
                    {sub.rawScore}
                    <span className="text-xs font-normal text-slate-400">/10</span>
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}
                  >
                    {sub.classification === 'Normal'
                      ? 'Normal'
                      : sub.classification === 'Borderline'
                      ? 'Limítrofe'
                      : 'Anormal'}
                  </span>
                </div>
              );
            })}

            {/* Total Difficulties Card */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-6 p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">
                  Total de Dificultades SDQ (Suma de 4 subescalas problema, excluye prosocial)
                </span>
                <h4 className="text-lg font-black text-white">
                  Puntuación Total: {sdqCalculation.totalDifficulties.score} / 40
                </h4>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    sdqCalculation.totalDifficulties.classification === 'Normal'
                      ? 'bg-emerald-500 text-white'
                      : sdqCalculation.totalDifficulties.classification === 'Borderline'
                      ? 'bg-amber-500 text-white'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  Clasificación: {sdqCalculation.totalDifficulties.classification === 'Normal' ? 'Normal' : sdqCalculation.totalDifficulties.classification === 'Borderline' ? 'Limítrofe' : 'Clínico / Anormal'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
