import React from 'react';
import {
  BatteryType,
  StrengthWeaknessResult,
  SubtestId,
  WISC_V_SUBTESTS,
  WAIS_IV_SUBTESTS,
  normalCdf,
} from '../../../core';

interface SubtestSummaryTableProps {
  battery: BatteryType;
  subtests: Partial<Record<SubtestId, number>>;
  strengthsWeaknesses: StrengthWeaknessResult[];
}

export const SubtestSummaryTable: React.FC<SubtestSummaryTableProps> = ({
  battery,
  subtests,
  strengthsWeaknesses,
}) => {
  const metaRegistry = battery === 'WISC-V' ? WISC_V_SUBTESTS : WAIS_IV_SUBTESTS;

  const validItems = React.useMemo(() => {
    const list: Array<{
      id: SubtestId;
      name: string;
      code: string;
      domain: string;
      isCoreCit: boolean;
      score: number;
      pct: number;
      diff: number;
      classification: 'Fortaleza' | 'Debilidad' | 'Promedio';
    }> = [];

    Object.entries(metaRegistry).forEach(([key, meta]) => {
      const id = key as SubtestId;
      const score = subtests[id];
      if (typeof score === 'number' && !isNaN(score) && score >= 1 && score <= 19) {
        const sw = strengthsWeaknesses.find((item) => item.subtestId === id);
        const z = (score - 10) / 3;
        const pct = Math.round(normalCdf(z) * 100);

        list.push({
          id,
          name: meta.name,
          code: meta.code,
          domain: meta.index,
          isCoreCit: meta.isCoreCit,
          score,
          pct,
          diff: sw ? sw.difference : 0,
          classification: sw ? sw.classification : 'Promedio',
        });
      }
    });

    return list;
  }, [battery, subtests, strengthsWeaknesses, metaRegistry]);

  return (
    <div className="avoid-break mb-6">
      <h2 className="report-section text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
        III. Puntuaciones Escalares y Análisis de Dispersión Intraindividual
      </h2>

      <table className="clinical-table w-full text-xs border border-slate-300">
        <thead>
          <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 text-center font-bold">
            <th className="px-2.5 py-2 border-r border-slate-300 text-left">Subtest (Escala Wechsler)</th>
            <th className="px-2 py-2 border-r border-slate-300 w-20">Dominio</th>
            <th className="px-2 py-2 border-r border-slate-300 w-24">Punt. Escalar (1-19)</th>
            <th className="px-2 py-2 border-r border-slate-300 w-24">Percentil Eq.</th>
            <th className="px-2 py-2 border-r border-slate-300 w-28">Dif. con Media ($\bar&#123;PE&#125;$)</th>
            <th className="px-2.5 py-2 text-left w-44">Significación Clínica</th>
          </tr>
        </thead>
        <tbody>
          {validItems.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-4 text-center text-slate-400 italic">
                No hay puntuaciones registradas
              </td>
            </tr>
          ) : (
            validItems.map((item) => {
              const isFortaleza = item.classification === 'Fortaleza';
              const isDebilidad = item.classification === 'Debilidad';

              return (
                <tr
                  key={item.id}
                  className={`border-b border-slate-200 ${
                    isFortaleza
                      ? 'bg-emerald-50/40'
                      : isDebilidad
                      ? 'bg-amber-50/40'
                      : 'hover:bg-slate-50/30'
                  }`}
                >
                  <td className="px-2.5 py-1.5 font-medium text-slate-800 border-r border-slate-200">
                    <span className="font-semibold">{item.name}</span>{' '}
                    <span className="text-slate-500">({item.code})</span>
                    {item.isCoreCit && (
                      <span className="ml-1.5 text-[9px] font-bold text-blue-700 bg-blue-100/70 px-1 py-0.2 rounded">
                        CIT
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-center font-bold text-slate-700 border-r border-slate-200">
                    {item.domain}
                  </td>
                  <td className="px-2 py-1.5 text-center font-extrabold text-slate-900 border-r border-slate-200">
                    {item.score}
                  </td>
                  <td className="px-2 py-1.5 text-center font-semibold text-slate-700 border-r border-slate-200">
                    Pc {item.pct}
                  </td>
                  <td className="px-2 py-1.5 text-center font-mono font-bold text-slate-800 border-r border-slate-200">
                    {item.diff > 0 ? `+${item.diff}` : item.diff}
                  </td>
                  <td className="px-2.5 py-1.5 font-semibold">
                    {isFortaleza && (
                      <span className="text-emerald-800 font-bold">
                        ★ Fortaleza Personal (F)
                      </span>
                    )}
                    {isDebilidad && (
                      <span className="text-amber-800 font-bold">
                        ▼ Debilidad Personal (D)
                      </span>
                    )}
                    {!isFortaleza && !isDebilidad && (
                      <span className="text-slate-500 font-normal">
                        Rango Promedio
                      </span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
