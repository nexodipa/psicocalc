import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface NarrativeParagraphCardProps {
  badge: string;
  title: string;
  content: string;
  isConclusion?: boolean;
}

export const NarrativeParagraphCard: React.FC<NarrativeParagraphCardProps> = ({
  badge,
  title,
  content,
  isConclusion = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${title}:\n${content}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback si navigator.clipboard no está disponible
      setCopied(false);
    }
  };

  return (
    <div
      className={`rounded-xl p-3.5 border transition-all ${
        isConclusion
          ? 'bg-slate-50 border-slate-300 ring-1 ring-slate-400/20 shadow-sm'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[11px] font-bold ${
              isConclusion
                ? 'bg-blue-900 text-white'
                : 'bg-slate-200 text-slate-800'
            }`}
          >
            {badge}
          </span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {title}
          </h4>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors focus:outline-none"
          title="Copiar párrafo al portapapeles"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" />
              <span className="text-emerald-700 font-medium">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-slate-500" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-slate-700 leading-relaxed text-justify font-sans">
        {content}
      </p>
    </div>
  );
};
