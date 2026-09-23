import React from 'react';
import { PatientDemographics, validateAgeAndBattery } from '../../../core';

interface DemographicsTableProps {
  demographics: PatientDemographics;
  displayName: string;
  ageValidation: ReturnType<typeof validateAgeAndBattery>;
}

export const DemographicsTable: React.FC<DemographicsTableProps> = ({
  demographics,
  displayName,
  ageValidation,
}) => {
  // Format date helper from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (isoStr: string) => {
    if (!isoStr) return '-';
    const parts = isoStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoStr;
  };

  return (
    <div className="avoid-break mb-6">
      <h2 className="report-section text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
        I. Datos de Identificación y Filiación Clínica
      </h2>

      <table className="clinical-table w-full text-xs border border-slate-300">
        <tbody>
          <tr className="border-b border-slate-200">
            <td className="w-1/4 bg-slate-50 font-semibold text-slate-700 px-3 py-1.5 border-r border-slate-200">
              Nombre / Sujeto:
            </td>
            <td className="w-1/4 px-3 py-1.5 font-bold text-slate-900 border-r border-slate-200">
              {displayName}
              {demographics.isAnonymized && (
                <span className="ml-1.5 text-[10px] font-normal text-amber-700 bg-amber-100/60 px-1 py-0.5 rounded">
                  (Anonimizado)
                </span>
              )}
            </td>
            <td className="w-1/4 bg-slate-50 font-semibold text-slate-700 px-3 py-1.5 border-r border-slate-200">
              Fecha de Evaluación:
            </td>
            <td className="w-1/4 px-3 py-1.5 text-slate-900">
              {formatDate(demographics.testDate)}
            </td>
          </tr>

          <tr className="border-b border-slate-200">
            <td className="bg-slate-50 font-semibold text-slate-700 px-3 py-1.5 border-r border-slate-200">
              Fecha de Nacimiento:
            </td>
            <td className="px-3 py-1.5 text-slate-900 border-r border-slate-200">
              {formatDate(demographics.birthDate)}
            </td>
            <td className="bg-slate-50 font-semibold text-slate-700 px-3 py-1.5 border-r border-slate-200">
              Edad Cronológica Exacta:
            </td>
            <td className="px-3 py-1.5 font-bold text-blue-950">
              {ageValidation.isValid
                ? `${ageValidation.years} años, ${ageValidation.months} meses y ${ageValidation.days} días`
                : 'Edad fuera de rango normativo'}
            </td>
          </tr>

          <tr className="border-b border-slate-200">
            <td className="bg-slate-50 font-semibold text-slate-700 px-3 py-1.5 border-r border-slate-200">
              Profesional Evaluador:
            </td>
            <td className="px-3 py-1.5 text-slate-900 border-r border-slate-200" colSpan={3}>
              {demographics.examiner || 'Lic. Especialista en Psicología Clínica / Neuropsicología'}
            </td>
          </tr>

          <tr>
            <td className="bg-slate-50 font-semibold text-slate-700 px-3 py-1.5 border-r border-slate-200">
              Motivo de Evaluación:
            </td>
            <td className="px-3 py-1.5 text-slate-900" colSpan={3}>
              {demographics.reasonForEvaluation || 'Evaluación del funcionamiento cognitivo general y perfil de aptitudes intelectuales.'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
