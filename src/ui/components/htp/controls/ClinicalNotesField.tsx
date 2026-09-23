import React from 'react';
import { FileText } from 'lucide-react';

interface ClinicalNotesFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  rows?: number;
}

export const ClinicalNotesField: React.FC<ClinicalNotesFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Observaciones clínicas directas (latencia, actitud, preguntas, comentarios del sujeto)...',
  helperText,
  rows = 3,
}) => {
  return (
    <div className="space-y-1.5 pt-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>{label}</span>
        </label>
        <span className="text-[11px] text-slate-400 font-mono">
          {value.length} car.
        </span>
      </div>

      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400 leading-relaxed resize-y"
      />

      {helperText && (
        <p className="text-[11px] text-slate-500 italic">{helperText}</p>
      )}
    </div>
  );
};
