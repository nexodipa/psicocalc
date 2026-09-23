import React from 'react';
import { AlertTriangle, CheckCircle2, GraduationCap, Info } from 'lucide-react';

interface MocaScoreAlertProps {
  adjustedScore: number;
  rawScore?: number;
  educationYears: number;
  educationAdjustment: 0 | 1;
  meetsClinicalCutoff: boolean; // adjustedScore < 26
  classification?: string;
}

export const MocaScoreAlert: React.FC<MocaScoreAlertProps> = ({
  adjustedScore,
  rawScore,
  educationYears,
  educationAdjustment,
  meetsClinicalCutoff,
  classification,
}) => {
  const isAdjustmentApplied = educationAdjustment === 1;

  return (
    <div className="space-y-3" data-testid="moca-score-alert">
      {/* 1. Primary Cutoff Alert / Status Banner */}
      {meetsClinicalCutoff ? (
        <div
          role="alert"
          aria-live="polite"
          className="p-4 rounded-xl bg-amber-50 border-2 border-amber-500 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm uppercase tracking-wide text-amber-900">
                  Alerta de Cribado Neurocognitivo (Puntuación &lt; 26)
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-200 text-amber-900">
                  {classification || 'Deterioro Cognitivo Leve'}
                </span>
              </div>
              <p className="text-xs text-amber-900 mt-0.5">
                La puntuación final ajustada de <strong>{adjustedScore}/30</strong> se sitúa por debajo del punto de corte normativo de 26 puntos.
                Sugiere presencia de alteración neurocognitiva o Deterioro Cognitivo Leve (DCL) y justifica evaluación neuropsicológica profunda.
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-2xl font-black text-amber-900">{adjustedScore}</span>
            <span className="text-xs font-bold text-amber-700"> / 30</span>
          </div>
        </div>
      ) : (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm uppercase tracking-wide text-emerald-900">
                  Cribado Neurocognitivo Normal (Puntuación ≥ 26)
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-200 text-emerald-900">
                  {classification || 'Normal'}
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                La puntuación final ajustada de <strong>{adjustedScore}/30</strong> se encuentra dentro de los límites normativos esperados para la edad y escolaridad.
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-2xl font-black text-emerald-900">{adjustedScore}</span>
            <span className="text-xs font-bold text-emerald-700"> / 30</span>
          </div>
        </div>
      )}

      {/* 2. Education Adjustment Explicit Notification */}
      <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-indigo-600" />
          <span>
            Escolaridad declarada: <strong>{educationYears} años</strong>
          </span>
          <span>•</span>
          {isAdjustmentApplied ? (
            <span className="font-semibold text-indigo-800">
              Ajuste por escolaridad aplicado (+1 punto por escolaridad ≤ 12 años)
            </span>
          ) : (
            <span className="text-slate-600">
              Sin ajuste de escolaridad aplicado (escolaridad &gt; 12 años)
            </span>
          )}
        </div>
        {rawScore !== undefined && (
          <div className="text-[11px] text-slate-500">
            Directa: <strong>{rawScore}</strong> {isAdjustmentApplied ? '+ 1 = ' : ' = '} <strong>{adjustedScore}</strong>
          </div>
        )}
      </div>
    </div>
  );
};
