import React from 'react';
import { BatteryType } from '../../../core';
import { Sparkles, Users } from 'lucide-react';

interface BatterySelectorProps {
  currentBattery: BatteryType;
  onSelectBattery: (battery: BatteryType) => void;
}

export const BatterySelector: React.FC<BatterySelectorProps> = ({
  currentBattery,
  onSelectBattery,
}) => {
  return (
    <div
      role="radiogroup"
      aria-label="Selección de batería psicométrica"
      className="inline-flex p-1 bg-slate-200/80 rounded-xl shadow-inner border border-slate-300/70"
    >
      <button
        type="button"
        role="radio"
        aria-checked={currentBattery === 'WISC-V'}
        onClick={() => onSelectBattery('WISC-V')}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
          currentBattery === 'WISC-V'
            ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-700/20'
            : 'text-slate-700 hover:text-blue-900 hover:bg-slate-100/60'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        <span>WISC-V</span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
            currentBattery === 'WISC-V'
              ? 'bg-blue-500/80 text-blue-50'
              : 'bg-slate-300 text-slate-700'
          }`}
        >
          6:0 – 16:11
        </span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={currentBattery === 'WAIS-IV'}
        onClick={() => onSelectBattery('WAIS-IV')}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
          currentBattery === 'WAIS-IV'
            ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-700/20'
            : 'text-slate-700 hover:text-indigo-900 hover:bg-slate-100/60'
        }`}
      >
        <Users className="w-4 h-4" />
        <span>WAIS-IV</span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
            currentBattery === 'WAIS-IV'
              ? 'bg-indigo-500/80 text-indigo-50'
              : 'bg-slate-300 text-slate-700'
          }`}
        >
          16:0 – 90:11
        </span>
      </button>
    </div>
  );
};
