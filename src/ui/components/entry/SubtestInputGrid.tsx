import React, { useState } from 'react';
import {
  BatteryType,
  SubtestId,
  WISC_V_SUBTESTS,
  WAIS_IV_SUBTESTS,
  normalCdf,
} from '../../../core';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { ChevronDown, ChevronUp, RotateCcw, Sparkles, Check, AlertCircle } from 'lucide-react';

interface SubtestInputGridProps {
  battery: BatteryType;
  subtests: Partial<Record<SubtestId, number>>;
  rawInputs: Record<string, string>;
  invalidSubtests: Record<string, string>;
  onSetScore: (id: SubtestId, score: number | null, rawText?: string) => void;
  onClearAll: () => void;
  onLoadSample: (type: 'average' | 'gifted' | 'adhd') => void;
}

interface SubtestItemDef {
  id: SubtestId;
  name: string;
  code: string;
  domain: string;
  isCoreCit: boolean;
  isSecondary: boolean;
}

export const SubtestInputGrid: React.FC<SubtestInputGridProps> = ({
  battery,
  subtests,
  rawInputs,
  invalidSubtests,
  onSetScore,
  onClearAll,
  onLoadSample,
}) => {
  const [showSecondary, setShowSecondary] = useState(false);

  // Group subtests based on active battery
  const subtestList: SubtestItemDef[] = React.useMemo(() => {
    if (battery === 'WISC-V') {
      const keys: SubtestId[] = [
        'S', 'V', 'C', 'PV', 'M', 'B', 'D', 'SD', 'CL', 'BS',
        'I', 'CO', 'A', 'LN', 'CA',
      ];
      return keys.map((key) => {
        const meta = WISC_V_SUBTESTS[key as keyof typeof WISC_V_SUBTESTS];
        return {
          id: key,
          name: meta.name,
          code: meta.code,
          domain: meta.index,
          isCoreCit: meta.isCoreCit,
          isSecondary: !meta.isPrimary,
        };
      });
    } else {
      const keys: SubtestId[] = [
        'WAIS_C', 'WAIS_S', 'WAIS_D', 'WAIS_M', 'WAIS_V',
        'WAIS_A', 'WAIS_BS', 'WAIS_PV', 'WAIS_I', 'WAIS_CN',
        'WAIS_LN', 'WAIS_B', 'WAIS_CO', 'WAIS_CA', 'WAIS_FI',
      ];
      return keys.map((key) => {
        const meta = WAIS_IV_SUBTESTS[key as keyof typeof WAIS_IV_SUBTESTS];
        return {
          id: key,
          name: meta.name,
          code: meta.code,
          domain: meta.index,
          isCoreCit: meta.isCoreCit,
          isSecondary: !meta.isPrimary,
        };
      });
    }
  }, [battery]);

  const visibleSubtests = React.useMemo(() => {
    return showSecondary ? subtestList : subtestList.filter((s) => !s.isSecondary);
  }, [subtestList, showSecondary]);

  // Hook for keyboard navigation and smart numpad auto-advance
  const { registerInput, handleScoreKeyDown, handleScoreChange } = useKeyboardNavigation({
    totalInputs: visibleSubtests.length,
  });

  // Calculate scaled score percentile equivalent
  const getPercentileEq = (score: number | null | undefined): string => {
    if (score === null || score === undefined || isNaN(score) || score < 1 || score > 19) {
      return '';
    }
    const z = (score - 10) / 3;
    const p = Math.round(normalCdf(z) * 100);
    return `Pc ${p}`;
  };

  // Group visible subtests by cognitive domain
  const domains = React.useMemo(() => {
    const map = new Map<string, SubtestItemDef[]>();
    visibleSubtests.forEach((s) => {
      const list = map.get(s.domain) || [];
      list.push(s);
      map.set(s.domain, list);
    });
    return Array.from(map.entries());
  }, [visibleSubtests]);

  // Helper to get index in the flat visible list for keyboard navigation
  const getFlatIndex = (subtestId: SubtestId): number => {
    return visibleSubtests.findIndex((s) => s.id === subtestId);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
      {/* Header and Quick Action Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              Entrada Rápida de Puntuaciones Escalares (PE 1 – 19)
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Navegación Inteligente
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Atajos: <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px]">Enter</kbd> o <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px]">Tab</kbd> avanza. Dígitos <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px]">2..9</kbd> y <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px]">10..19</kbd> auto-avanzan. Flechas <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px]">↑↓</kbd> ajustan valor.
          </p>
        </div>

        {/* Demo profiles and Clear button */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-1">Casos:</span>
          <button
            type="button"
            onClick={() => onLoadSample('average')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Cargar perfil normativo promedio (todas las PE = 10)"
          >
            Promedio
          </button>
          <button
            type="button"
            onClick={() => onLoadSample('gifted')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors"
            title="Cargar caso de Altas Capacidades / Talento"
          >
            Altas Cap.
          </button>
          <button
            type="button"
            onClick={() => onLoadSample('adhd')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 transition-colors"
            title="Cargar caso clínico de TDAH / Dislexia"
          >
            TDAH
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors"
            title="Limpiar todas las puntuaciones"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpiar</span>
          </button>
        </div>
      </div>

      {/* Domain-Organized Subtests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {domains.map(([domainKey, items]) => (
          <div
            key={domainKey}
            className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80">
                <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                  {domainKey}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {items.length} {items.length === 1 ? 'subtest' : 'subtests'}
                </span>
              </div>

              <div className="space-y-2">
                {items.map((subtest) => {
                  const flatIdx = getFlatIndex(subtest.id);
                  const currentVal = subtests[subtest.id] ?? null;
                  const rawVal = rawInputs[subtest.id] ?? '';
                  const errMessage = invalidSubtests[subtest.id];
                  const isErr = !!errMessage;
                  const pct = getPercentileEq(currentVal);

                  return (
                    <div
                      key={subtest.id}
                      className={`p-2 rounded-lg transition-all ${
                        isErr
                          ? 'bg-red-50 border border-red-300'
                          : currentVal !== null
                          ? 'bg-white border border-slate-200/80 shadow-xs'
                          : 'bg-white/80 border border-slate-200/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <label
                          htmlFor={`subtest-input-${subtest.id}`}
                          className="text-xs font-semibold text-slate-800 flex items-center gap-1 truncate"
                          title={`${subtest.name} (${subtest.code})`}
                        >
                          <span className="truncate">{subtest.name}</span>
                          <span className="text-[10px] font-normal text-slate-500">
                            ({subtest.code})
                          </span>
                        </label>
                        {subtest.isCoreCit ? (
                          <span
                            className="text-[9px] font-bold px-1 py-0.2 rounded bg-blue-100 text-blue-800 shrink-0"
                            title="Subtest obligatorio para el Coeficiente Intelectual Total"
                          >
                            CIT
                          </span>
                        ) : (
                          <span
                            className="text-[9px] font-medium px-1 py-0.2 rounded bg-slate-100 text-slate-500 shrink-0"
                            title="Subtest optativo / complementario"
                          >
                            Opt.
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          id={`subtest-input-${subtest.id}`}
                          ref={registerInput(flatIdx)}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={rawVal}
                          placeholder="PE"
                          aria-invalid={isErr}
                          aria-errormessage={isErr ? `err-${subtest.id}` : undefined}
                          onKeyDown={(e) =>
                            handleScoreKeyDown(
                              e,
                              flatIdx,
                              currentVal,
                              (newScore) => onSetScore(subtest.id, newScore)
                            )
                          }
                          onChange={(e) =>
                            handleScoreChange(
                              e.target.value,
                              flatIdx,
                              (newScore) => onSetScore(subtest.id, newScore, e.target.value)
                            )
                          }
                          className={`w-14 text-center font-bold text-sm py-1 px-1 rounded-md border transition-all ${
                            isErr
                              ? 'border-red-500 bg-red-100/70 text-red-900 focus:ring-1 focus:ring-red-500'
                              : currentVal !== null
                              ? 'border-blue-500 bg-blue-50/30 text-blue-900 font-extrabold focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                              : 'border-slate-300 bg-white text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          }`}
                        />

                        {/* Percentile or Error display */}
                        <div className="flex-1 min-w-0">
                          {isErr ? (
                            <span
                              id={`err-${subtest.id}`}
                              className="text-[10px] font-semibold text-red-600 truncate block flex items-center gap-0.5"
                            >
                              <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                              <span>Rango 1-19</span>
                            </span>
                          ) : pct ? (
                            <span className="text-[11px] font-medium text-slate-500 truncate block">
                              {pct}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-300 italic">vacío</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toggle Secondary / Supplementary Subtests */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowSecondary(!showSecondary)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors"
        >
          {showSecondary ? (
            <>
              <ChevronUp className="w-4 h-4 text-blue-600" />
              <span>Ocultar subtests secundarios / suplementarios</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 text-blue-600" />
              <span>Mostrar subtests secundarios / suplementarios (+5)</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-slate-400 hidden sm:block">
          Los subtests primarios obligatorios garantizan el cálculo directo de todos los índices primarios y el CIT.
        </p>
      </div>
    </div>
  );
};
