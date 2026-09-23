import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { QualitativeTooltip } from './QualitativeTooltip';

interface MultiToggleCheckProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  interpretation?: string;
  citation?: string;
  alertType?: 'amber' | 'rose';
}

export const MultiToggleCheck: React.FC<MultiToggleCheckProps> = ({
  label,
  checked,
  onChange,
  interpretation,
  citation,
  alertType = 'amber',
}) => {
  const activeClass =
    alertType === 'rose'
      ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-sm ring-1 ring-rose-400/30'
      : 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm ring-1 ring-amber-400/30';

  return (
    <div
      className={`inline-flex items-center rounded-lg border text-xs font-medium transition-all ${
        checked
          ? activeClass
          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
      }`}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-l-lg focus:outline-none"
      >
        {checked ? (
          <AlertCircle className={`w-3.5 h-3.5 ${alertType === 'rose' ? 'text-rose-600' : 'text-amber-600'}`} />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-300" />
        )}
        <span>{label}</span>
      </button>

      {interpretation && (
        <div className="pr-2">
          <QualitativeTooltip
            content={interpretation}
            authorCitation={citation || 'Buck / Koppitz'}
          />
        </div>
      )}
    </div>
  );
};
