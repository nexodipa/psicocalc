import React from 'react';
import { BatteryType, CompositeResult, formatPercentile } from '../../../core';

interface PrimaryIndicesTableProps {
  battery: BatteryType;
  cit: CompositeResult | null;
  primaryIndices: Record<string, CompositeResult | null>;
  isCompleteCit: boolean;
}

export const PrimaryIndicesTable: React.FC<PrimaryIndicesTableProps> = ({
  battery,
  cit,
  primaryIndices,
  isCompleteCit,
}) => {
  const indexKeys = battery === 'WISC-V'
    ? ['ICV', 'IVE', 'IRF', 'IMT', 'IVP']
    : ['ICV', 'IRP', 'IMT', 'IVP'];

  return (
    <div className="avoid-break mb-6">
      <h2 className="report-section text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
        II. Resumen de Puntuaciones Compuestas e Índices Primarios
      </h2>

      <table className="clinical-table w-full text-xs border border-slate-300">
        <thead>
          <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 text-center font-bold">
            <th className="px-2.5 py-2 border-r border-slate-300 text-left w-16">Índice</th>
            <th className="px-2.5 py-2 border-r border-slate-300 text-left">Escala / Dimensión Cognitiva</th>
            <th className="px-2 py-2 border-r border-slate-300 w-24">Suma Escalar</th>
            <th className="px-2 py-2 border-r border-slate-300 w-28">Punt. Compuesta</th>
            <th className="px-2 py-2 border-r border-slate-300 w-20">Percentil</th>
            <th className="px-2 py-2 border-r border-slate-300 w-28">Int. Confianza 95%</th>
            <th className="px-2.5 py-2 text-left w-36">Clasificación Cualitativa</th>
          </tr>
        </thead>
        <tbody>
          {indexKeys.map((key) => {
            const item = primaryIndices[key];

            return (
              <tr key={key} className="border-b border-slate-200 hover:bg-slate-50/50">
                <td className="px-2.5 py-1.5 font-bold text-slate-900 border-r border-slate-200">
                  {key}
                </td>
                <td className="px-2.5 py-1.5 text-slate-700 border-r border-slate-200">
                  {item?.name || key}
                </td>
                <td className="px-2 py-1.5 text-center font-medium text-slate-800 border-r border-slate-200">
                  {item?.sumScaled ?? '-'}
                </td>
                <td className="px-2 py-1.5 text-center font-extrabold text-blue-900 border-r border-slate-200">
                  {item?.compositeScore ?? '-'}
                </td>
                <td className="px-2 py-1.5 text-center font-semibold text-slate-800 border-r border-slate-200">
                  {item ? formatPercentile(item.percentile, item.compositeScore) : '-'}
                </td>
                <td className="px-2 py-1.5 text-center text-slate-600 border-r border-slate-200 font-mono text-[11px]">
                  {item ? `[${item.ci95.lower} – ${item.ci95.upper}]` : '-'}
                </td>
                <td className="px-2.5 py-1.5 font-semibold text-slate-800">
                  {item?.qualitative ?? '-'}
                </td>
              </tr>
            );
          })}

          {/* CIT Row (Highlighted) */}
          <tr className="cit-row bg-blue-50/80 border-t-2 border-blue-900 font-bold text-slate-900">
            <td className="px-2.5 py-2 border-r border-slate-300 text-blue-950 font-black">
              CIT
            </td>
            <td className="px-2.5 py-2 border-r border-slate-300 text-blue-950">
              COEFICIENTE INTELECTUAL TOTAL (FSIQ)
            </td>
            <td className="px-2 py-2 text-center border-r border-slate-300">
              {cit && isCompleteCit ? cit.sumScaled : '-'}
            </td>
            <td className="px-2 py-2 text-center text-sm font-black text-blue-950 border-r border-slate-300">
              {cit && isCompleteCit ? cit.compositeScore : '-'}
            </td>
            <td className="px-2 py-2 text-center border-r border-slate-300">
              {cit && isCompleteCit ? formatPercentile(cit.percentile, cit.compositeScore) : '-'}
            </td>
            <td className="px-2 py-2 text-center border-r border-slate-300 font-mono text-[11px]">
              {cit && isCompleteCit ? `[${cit.ci95.lower} – ${cit.ci95.upper}]` : '-'}
            </td>
            <td className="px-2.5 py-2 font-black text-blue-950">
              {cit && isCompleteCit ? cit.qualitative : '-'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
