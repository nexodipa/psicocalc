import React from 'react';
import { AlertOctagon, PhoneCall, ShieldAlert } from 'lucide-react';

interface Phq9SuicideAlertBannerProps {
  item9Score: number;
}

export const Phq9SuicideAlertBanner: React.FC<Phq9SuicideAlertBannerProps> = ({ item9Score }) => {
  if (item9Score <= 0) return null;

  const scoreLabels: Record<number, string> = {
    1: 'Varios días (1)',
    2: 'Más de la mitad de los días (2)',
    3: 'Casi todos los días (3)',
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="p-4 sm:p-5 rounded-2xl bg-red-50 border-2 border-red-600 shadow-lg text-red-950 flex flex-col sm:flex-row items-start gap-4 print-critical-alert"
      data-testid="phq9-suicide-alert-banner"
    >
      <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
        <AlertOctagon className="w-7 h-7 animate-pulse" />
      </div>

      <div className="space-y-2 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-xs uppercase tracking-wider">
              Crítico
            </span>
            <h3 className="text-base font-extrabold tracking-tight text-red-900 uppercase">
              Alerta Deontológica: Riesgo de Autolesión o Ideación Suicida (Ítem 9 ≥ 1)
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-red-700 text-white shadow-xs">
            Ítem 9 = {scoreLabels[item9Score] || `${item9Score}`}
          </span>
        </div>

        <p className="text-xs sm:text-sm font-semibold text-red-900 leading-relaxed">
          El evaluado ha respondido de forma afirmativa al ítem 9: <em>«¿Ha tenido pensamientos de que estaría mejor muerto/a, o de lastimarse de alguna manera?»</em>.
          Conforme al código deontológico y las directrices clínicas periciales, este indicador exige intervención inmediata y valoración estructurada del riesgo autolítico.
        </p>

        <div className="p-3.5 bg-white/90 rounded-xl border border-red-300 text-xs text-red-950 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-red-900">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Protocolo de Actuación Pericial y Asistencial Obligatorio:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] sm:text-xs text-red-900">
            <li><strong>Evaluación exhaustiva:</strong> Explorar ideación activa, grado de intencionalidad, existencia de un plan estructurado, letalidad del método y acceso a medios letales.</li>
            <li><strong>Factores de protección:</strong> Identificar red de apoyo sociofamiliar inmediata, razones para vivir y adherencia terapéutica.</li>
            <li><strong>Medidas de seguridad:</strong> No dejar al paciente solo o sin supervisión. Establecer contrato de seguridad o pacto de no agresión si procede.</li>
            <li><strong>Derivación y notificación:</strong> Activar protocolo de urgencias en salud mental, contactar al familiar responsable o derivar a Urgencias Psiquiátricas.</li>
          </ul>
          <div className="pt-1 flex items-center gap-2 text-[11px] text-red-800 font-semibold border-t border-red-200 mt-2">
            <PhoneCall className="w-3.5 h-3.5 text-red-700" />
            <span>Línea 024 de Atención a la Conducta Suicida / Emergencias 112</span>
          </div>
        </div>
      </div>
    </div>
  );
};
