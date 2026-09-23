import React, { useState } from 'react';
import { HtpNarrativeReport } from '../../../../core';
import { NarrativeParagraphCard } from './NarrativeParagraphCard';
import { Sparkles, Copy, Check, FileCheck2 } from 'lucide-react';

interface LiveNarrativePreviewProps {
  report: HtpNarrativeReport;
}

export const LiveNarrativePreview: React.FC<LiveNarrativePreviewProps> = ({
  report,
}) => {
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(report.fullNarrativeText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      setCopiedAll(false);
    }
  };

  return (
    <div className="bg-slate-100/90 rounded-2xl p-4 border border-slate-200 shadow-inner space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-300">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-900 text-white rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Previsualización Narrativa Pericial
            </h3>
            <p className="text-[11px] text-slate-500">
              Síntesis clínica cualitativa generada en tiempo real
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyAll}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-900 text-white hover:bg-blue-800 shadow-sm transition-all focus:outline-none"
        >
          {copiedAll ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>¡Informe Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Informe Completo</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-3">
        <NarrativeParagraphCard
          badge="A"
          title="Resumen de Indicadores Expresivos Generales"
          content={report.summaryFormal}
        />

        <NarrativeParagraphCard
          badge="B"
          title="Dinámica Familiar y Área Afectiva (Casa)"
          content={report.houseAnalysis}
        />

        <NarrativeParagraphCard
          badge="C"
          title="Estructura del Yo y Estabilidad Emocional Profunda (Árbol)"
          content={report.treeAnalysis}
        />

        <NarrativeParagraphCard
          badge="D"
          title="Imagen Corporal y Relaciones Interpersonales (Persona)"
          content={report.personAnalysis}
        />

        <NarrativeParagraphCard
          badge="E"
          title="Conclusión Cualitativa Integrada y Recomendaciones"
          content={report.integratedConclusion}
          isConclusion={true}
        />
      </div>

      <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 border-t border-slate-200">
        <span className="flex items-center gap-1">
          <FileCheck2 className="w-3.5 h-3.5 text-blue-700" />
          <span>Formato pericial para inclusión directa en informe A4</span>
        </span>
        <span className="italic">
          Metodología: Buck, Hammer & Koppitz
        </span>
      </div>
    </div>
  );
};
