import React from 'react';
import { QualitativeTooltip } from './QualitativeTooltip';

export interface QualitativeOption<T extends string = string> {
  value: T;
  label: string;
  interpretation?: string;
  citation?: string;
}

interface QualitativeChipGroupProps<T extends string = string> {
  title: string;
  subtitle?: string;
  options: QualitativeOption<T>[];
  selectedValue: T;
  onChange: (value: T) => void;
}

export function QualitativeChipGroup<T extends string = string>({
  title,
  subtitle,
  options,
  selectedValue,
  onChange,
}: QualitativeChipGroupProps<T>) {
  return (
    <div className="space-y-1.5 py-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {title}
        </label>
        {subtitle && (
          <span className="text-[11px] text-slate-400 italic">{subtitle}</span>
        )}
      </div>

      <div
        role="radiogroup"
        aria-label={title}
        className="flex flex-wrap gap-1.5"
      >
        {options.map((option) => {
          const isSelected = option.value === selectedValue;
          return (
            <div
              key={option.value}
              className={`inline-flex items-center rounded-lg border transition-all text-xs font-medium ${
                isSelected
                  ? 'bg-blue-900 border-blue-900 text-white shadow-sm ring-1 ring-blue-900/30'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChange(option.value)}
                className="px-2.5 py-1.5 rounded-l-lg focus:outline-none"
              >
                {option.label}
              </button>

              {option.interpretation && (
                <div className="pr-1.5">
                  <QualitativeTooltip
                    content={option.interpretation}
                    authorCitation={option.citation || 'Buck / Hammer'}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
