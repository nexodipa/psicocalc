import React from 'react';
import { BatteryType, CompositeResult, QualitativeCategory, formatPercentile } from '../../../core';
import { Award, Brain, Target, Compass, Sparkles, Zap, Layers } from 'lucide-react';

interface CompositeScoreCardsProps {
  battery: BatteryType;
  cit: CompositeResult | null;
  primaryIndices: Record<string, CompositeResult | null>;
  isCompleteCit: boolean;
  hasInvalidScores: boolean;
}

export function getQualitativeColorClasses(category?: QualitativeCategory): {
  badge: string;
  cardBorder: string;
  bgLight: string;
} {
  switch (category) {
    case 'Muy Superior':
      return {
        badge: 'bg-purple-100 text-purple-900 border-purple-300',
        cardBorder: 'border-purple-300',
        bgLight: 'bg-purple-50/40',
      };
    case 'Superior':
      return {
        badge: 'bg-indigo-100 text-indigo-900 border-indigo-300',
        cardBorder: 'border-indigo-300',
        bgLight: 'bg-indigo-50/40',
      };
    case 'Promedio Alto':
      return {
        badge: 'bg-cyan-100 text-cyan-900 border-cyan-300',
        cardBorder: 'border-cyan-300',
        bgLight: 'bg-cyan-50/40',
      };
    case 'Promedio':
      return {
        badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        cardBorder: 'border-emerald-200',
        bgLight: 'bg-emerald-50/30',
      };
    case 'Promedio Bajo':
      return {
        badge: 'bg-amber-100 text-amber-900 border-amber-300',
        cardBorder: 'border-amber-200',
        bgLight: 'bg-amber-50/30',
      };
    case 'Limítrofe':
      return {
        badge: 'bg-orange-100 text-orange-900 border-orange-300',
        cardBorder: 'border-orange-300',
        bgLight: 'bg-orange-50/40',
      };
    case 'Extremadamente Bajo':
      return {
        badge: 'bg-red-100 text-red-900 border-red-300',
        cardBorder: 'border-red-300',
        bgLight: 'bg-red-50/40',
      };
    default:
      return {
        badge: 'bg-slate-100 text-slate-700 border-slate-300',
        cardBorder: 'border-slate-200',
        bgLight: 'bg-white',
      };
  }
}

export const CompositeScoreCards: React.FC<CompositeScoreCardsProps> = ({
  battery,
  cit,
  primaryIndices,
  isCompleteCit,
  hasInvalidScores,
}) => {
  // Indices to display depending on battery
  const indexKeys = battery === 'WISC-V'
    ? ['ICV', 'IVE', 'IRF', 'IMT', 'IVP']
    : ['ICV', 'IRP', 'IMT', 'IVP'];

  const citColors = cit ? getQualitativeColorClasses(cit.qualitative) : getQualitativeColorClasses();

  return (
    <div className="space-y-4">
      {/* 1. Coeficiente Intelectual Total (CIT) Hero Card */}
      <div
        className={`rounded-2xl border p-5 shadow-sm transition-all duration-200 ${
          cit && !hasInvalidScores
            ? `bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border-blue-800 shadow-blue-900/10`
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Title & Description */}
          <div className="flex items-center gap-3.5">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                cit && !hasInvalidScores
                  ? 'bg-white/10 text-white border border-white/20 shadow-inner'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              <Brain className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    cit && !hasInvalidScores
                      ? 'bg-blue-500/30 text-blue-200 border border-blue-400/30'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Puntuación Global
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {battery === 'WISC-V' ? 'Escala WISC-V (7 core)' : 'Escala WAIS-IV (10 core)'}
                </span>
              </div>
              <h3 className="text-lg font-bold tracking-tight mt-0.5">
                Coeficiente Intelectual Total (CIT / FSIQ)
              </h3>
            </div>
          </div>

          {/* Metric Values */}
          {hasInvalidScores ? (
            <div className="text-xs font-semibold px-4 py-2 rounded-lg bg-red-100 text-red-900 border border-red-300">
              Cálculo bloqueado por datos fuera de rango
            </div>
          ) : cit && isCompleteCit ? (
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              {/* Composite Score Value */}
              <div className="text-right">
                <span className="text-xs text-blue-200 font-medium block">Puntuación</span>
                <span className="text-4xl font-extrabold tracking-tight text-white">
                  {cit.compositeScore}
                </span>
              </div>

              {/* Percentile Rank */}
              <div className="text-right border-l border-white/20 pl-4">
                <span className="text-xs text-blue-200 font-medium block">Percentil</span>
                <span className="text-2xl font-bold text-white">
                  Pc {formatPercentile(cit.percentile, cit.compositeScore)}
                </span>
              </div>

              {/* 95% Confidence Interval */}
              <div className="text-right border-l border-white/20 pl-4">
                <span className="text-xs text-blue-200 font-medium block">Intervalo 95%</span>
                <span className="text-sm font-semibold text-blue-100 block">
                  [{cit.ci95.lower} – {cit.ci95.upper}]
                </span>
              </div>

              {/* Qualitative Wechsler Badge */}
              <div className="border-l border-white/20 pl-4">
                <span className="text-xs text-blue-200 font-medium block mb-0.5">Clasificación</span>
                <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-white text-blue-950 shadow-sm">
                  {cit.qualitative}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-medium italic">
              Pendiente de completar los subtests requeridos para CIT
            </div>
          )}
        </div>
      </div>

      {/* 2. Primary Cognitive Indices Grid */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${
          battery === 'WISC-V' ? 'xl:grid-cols-5' : 'xl:grid-cols-4'
        } gap-3.5`}
      >
        {indexKeys.map((key) => {
          const result = primaryIndices[key];
          const colors = result ? getQualitativeColorClasses(result.qualitative) : getQualitativeColorClasses();

          return (
            <div
              key={key}
              className={`rounded-xl border p-3.5 transition-all flex flex-col justify-between ${
                result && !hasInvalidScores
                  ? `${colors.bgLight} ${colors.cardBorder} shadow-xs`
                  : 'bg-white border-slate-200/80 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                  <span className="text-xs font-bold text-slate-800 tracking-wider">
                    {key}
                  </span>
                  {result && !hasInvalidScores ? (
                    <span className="text-[10px] font-semibold text-slate-500">
                      Suma: {result.sumScaled}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Pendiente</span>
                  )}
                </div>

                <div className="text-xs font-medium text-slate-600 truncate mb-2">
                  {result?.name || key}
                </div>

                {result && !hasInvalidScores ? (
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {result.compositeScore}
                      </span>
                      <span className="text-xs font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                        Pc {formatPercentile(result.percentile, result.compositeScore)}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-medium">
                      IC 95%: <span className="font-semibold text-slate-700">[{result.ci95.lower} – {result.ci95.upper}]</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400 italic">
                    Sin datos completos
                  </div>
                )}
              </div>

              {result && !hasInvalidScores && (
                <div className="mt-3 pt-2 border-t border-slate-200/50">
                  <span
                    className={`inline-block w-full text-center px-2 py-0.5 rounded text-[11px] font-bold border truncate ${colors.badge}`}
                  >
                    {result.qualitative}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
