import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface QualitativeTooltipProps {
  content: string;
  authorCitation?: string;
}

export const QualitativeTooltip: React.FC<QualitativeTooltipProps> = ({
  content,
  authorCitation,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-1">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible((prev) => !prev);
        }}
        className="text-slate-400 hover:text-blue-600 focus:outline-none focus:text-blue-700 p-0.5 rounded transition-colors"
        aria-label="Información clínica"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isVisible && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl pointer-events-none transition-all duration-200"
        >
          <div className="leading-snug">{content}</div>
          {authorCitation && (
            <div className="mt-1.5 pt-1 border-t border-slate-700 text-[10px] text-blue-300 font-medium">
              Ref: {authorCitation}
            </div>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
};
