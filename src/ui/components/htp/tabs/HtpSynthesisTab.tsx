import React from 'react';
import { HtpAssessmentRecord, HtpNarrativeReport } from '../../../../core';
import { ClinicalNotesField } from '../controls/ClinicalNotesField';
import { UserCheck, Calendar, ShieldCheck, AlertTriangle } from 'lucide-react';

interface HtpSynthesisTabProps {
  record: HtpAssessmentRecord;
  report: HtpNarrativeReport;
  onUpdateGeneralNotes: (notes: string) => void;
  onUpdateMetadata: (patch: { evaluator?: string; testDate?: string }) => void;
}

export const HtpSynthesisTab: React.FC<HtpSynthesisTabProps> = ({
  record,
  report,
  onUpdateGeneralNotes,
  onUpdateMetadata,
}) => {
  // Conteo de indicadores de alerta
  const alerts: string[] = [];
  if (record.formal.hasExcessiveErasures) alerts.push('Borraduras reiteradas en producción');
  if (record.formal.hasTransparencies) alerts.push('Transparencias estructurales patentes');
  if (record.formal.hasOmissions) alerts.push('Omisiones de partes clave');
  if (record.formal.shading === 'excessive') alerts.push('Sombreado focalizado intenso');
  if (record.tree.hasKnotsOrHoles) alerts.push('Nudos o huecos traumáticos en tronco');
  if (record.tree.groundLine === 'floating_absent') alerts.push('Árbol flotante (carencia de suelo)');
  if (record.house.walls === 'weak_broken') alerts.push('Paredes débiles o discontinuas en la casa');

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-blue-800" />
          <span>Datos Periciales de la Evaluación HTP</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Profesional Evaluador / Perito:
            </label>
            <input
              type="text"
              value={record.evaluator}
              onChange={(e) => onUpdateMetadata({ evaluator: e.target.value })}
              placeholder="Ej: Lic. / Dr. Especialista en Psicodiagnóstico"
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Fecha de Aplicación:</span>
            </label>
            <input
              type="date"
              value={record.testDate}
              onChange={(e) => onUpdateMetadata({ testDate: e.target.value })}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
        <ClinicalNotesField
          label="Observaciones de Actitud y Conducta Durante la Administración"
          value={record.generalClinicalNotes}
          onChange={onUpdateGeneralNotes}
          rows={4}
          placeholder="Documente la conducta del evaluado: nivel de cooperación, latencia previa a dibujar, preguntas realizadas, gestos de desagrado, comentarios espontáneos o verbalizaciones asociativas..."
          helperText="Estas observaciones se articularán directamente en la Conclusión Cualitativa Integrada (Párrafo E)."
        />
      </div>

      {alerts.length > 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Indicadores Críticos Detectados en la Producción Gráfica ({alerts.length})</span>
          </div>
          <ul className="list-disc list-inside text-xs text-amber-800 space-y-0.5">
            {alerts.map((alert, idx) => (
              <li key={idx}>{alert}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>No se han registrado anomalías críticas severas en la estructuración gráfica.</span>
        </div>
      )}

      <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">
          Síntesis de la Conclusión Pericial Integrada:
        </h4>
        <p className="text-xs text-slate-200 leading-relaxed font-sans text-justify">
          {report.integratedConclusion}
        </p>
      </div>
    </div>
  );
};
