import React from 'react';
import { BatteryType, DEFAULT_INSTITUTIONAL_BRANDING } from '../../../core';

interface InstitutionalHeaderProps {
  battery: BatteryType;
  reportRef?: string;
  clinicName?: string;
  clinicSubtitle?: string;
}

export const InstitutionalHeader: React.FC<InstitutionalHeaderProps> = ({
  battery,
  reportRef = DEFAULT_INSTITUTIONAL_BRANDING.reportRef,
  clinicName = DEFAULT_INSTITUTIONAL_BRANDING.clinicName,
  clinicSubtitle = DEFAULT_INSTITUTIONAL_BRANDING.clinicSubtitle,
}) => {
  const fullBatteryTitle =
    battery === 'WISC-V'
      ? 'Escala de Inteligencia de Wechsler para Niños — Quinta Edición (WISC-V)'
      : 'Escala de Inteligencia de Wechsler para Adultos — Cuarta Edición (WAIS-IV)';

  return (
    <div className="border-b-2 border-slate-900 pb-4 mb-5">
      {/* Top Clinical Institution Bar */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-serif text-2xl font-bold tracking-tight shadow-sm">
            Ψ
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-widest text-slate-800 uppercase">
              {clinicName || DEFAULT_INSTITUTIONAL_BRANDING.clinicName}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {clinicSubtitle || DEFAULT_INSTITUTIONAL_BRANDING.clinicSubtitle}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
            Nº Expediente / Protocolo
          </span>
          <span className="text-xs font-mono font-bold text-slate-800">
            {reportRef || DEFAULT_INSTITUTIONAL_BRANDING.reportRef}
          </span>
        </div>
      </div>

      {/* Main Document Title */}
      <div className="text-center pt-2">
        <h1 className="report-title text-xl font-bold text-slate-900 tracking-tight uppercase">
          Informe de Evaluación Psicométrica y Perfil Cognitivo
        </h1>
        <p className="text-sm font-semibold text-blue-900 mt-1">
          {fullBatteryTitle}
        </p>
      </div>
    </div>
  );
};
