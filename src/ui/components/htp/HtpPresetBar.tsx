import React from 'react';
import { HtpBenchmarkPreset } from '../../../core';
import { Sparkles, Shield, UserMinus, Flame, RotateCcw } from 'lucide-react';

interface HtpPresetBarProps {
  onLoadPreset: (preset: HtpBenchmarkPreset) => void;
  onClear: () => void;
}

export const HtpPresetBar: React.FC<HtpPresetBarProps> = ({
  onLoadPreset,
  onClear,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
        <Sparkles className="w-3.5 h-3.5 text-blue-800" />
        <span>Cargar Perfiles Clínicos Benchmark:</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onLoadPreset('balanced')}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 transition-colors"
          title="Cargar perfil equilibrado/adaptativo con defensas sanas"
        >
          <Shield className="w-3 h-3 text-emerald-600" />
          <span>Equilibrado</span>
        </button>

        <button
          type="button"
          onClick={() => onLoadPreset('inhibited')}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-sky-50 text-sky-800 border border-sky-300 hover:bg-sky-100 hover:border-sky-400 transition-colors"
          title="Cargar perfil inhibido/ansioso con micrografía y retraimiento"
        >
          <UserMinus className="w-3 h-3 text-sky-600" />
          <span>Inhibido / Ansioso</span>
        </button>

        <button
          type="button"
          onClick={() => onLoadPreset('expansive')}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 hover:border-amber-400 transition-colors"
          title="Cargar perfil expansivo/impulsivo con macrografía y reactividad"
        >
          <Flame className="w-3 h-3 text-amber-600" />
          <span>Expansivo / Impulsivo</span>
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-600 border border-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors"
          title="Restablecer todas las dimensiones a los valores por defecto"
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
          <span>Restablecer</span>
        </button>
      </div>
    </div>
  );
};
