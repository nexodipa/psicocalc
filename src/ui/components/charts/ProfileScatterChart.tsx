import React from 'react';
import {
  BatteryType,
  StrengthWeaknessResult,
  SubtestId,
  SubtestMeta,
  WISC_V_SUBTESTS,
  WAIS_IV_SUBTESTS,
} from '../../../core';

interface ProfileScatterChartProps {
  battery: BatteryType;
  subtests: Partial<Record<SubtestId, number>>;
  strengthsWeaknesses: StrengthWeaknessResult[];
}

export const ProfileScatterChart: React.FC<ProfileScatterChartProps> = ({
  battery,
  subtests,
  strengthsWeaknesses,
}) => {
  // Domain color mappings
  const getDomainColor = (domain: string): { fill: string; stroke: string; light: string } => {
    switch (domain) {
      case 'ICV':
        return { fill: '#2563eb', stroke: '#1d4ed8', light: '#dbeafe' };
      case 'IVE':
      case 'IRP':
        return { fill: '#4f46e5', stroke: '#4338ca', light: '#e0e7ff' };
      case 'IRF':
        return { fill: '#059669', stroke: '#047857', light: '#d1fae5' };
      case 'IMT':
        return { fill: '#d97706', stroke: '#b45309', light: '#fef3c7' };
      case 'IVP':
        return { fill: '#7c3aed', stroke: '#6d28d9', light: '#ede9fe' };
      default:
        return { fill: '#475569', stroke: '#334155', light: '#f1f5f9' };
    }
  };

  // Build array of administered subtests in order
  const administeredItems = React.useMemo(() => {
    const entries = (battery === 'WISC-V'
      ? Object.values(WISC_V_SUBTESTS)
      : Object.values(WAIS_IV_SUBTESTS)) as SubtestMeta[];

    const result: Array<{
      id: SubtestId;
      name: string;
      code: string;
      domain: string;
      score: number;
      classification?: 'Fortaleza' | 'Debilidad' | 'Promedio';
      diff?: number;
    }> = [];

    entries.forEach((meta) => {
      const score = subtests[meta.id];
      if (typeof score === 'number' && !isNaN(score) && score >= 1 && score <= 19) {
        const sw = strengthsWeaknesses.find((item) => item.subtestId === meta.id);
        result.push({
          id: meta.id,
          name: meta.name,
          code: meta.code,
          domain: meta.index,
          score,
          classification: sw?.classification,
          diff: sw?.difference,
        });
      }
    });

    return result;
  }, [battery, subtests, strengthsWeaknesses]);

  // Compute subject mean (PE bar)
  const subjectMean = React.useMemo(() => {
    if (administeredItems.length === 0) return 10;
    const sum = administeredItems.reduce((acc, item) => acc + item.score, 0);
    return Math.round((sum / administeredItems.length) * 10) / 10;
  }, [administeredItems]);

  // Chart SVG Dimensions
  const width = 760;
  const height = 360;
  const padding = { top: 40, right: 40, bottom: 65, left: 60 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Y coordinate mapping: score 1 at bottom, 19 at top
  const getY = (score: number) => {
    return padding.top + innerHeight - ((score - 1) / 18) * innerHeight;
  };

  // X coordinate mapping
  const getX = (index: number, total: number) => {
    if (total <= 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (total - 1)) * innerWidth;
  };

  const ySubjectMean = getY(subjectMean);
  const yPopMean = getY(10);
  const ySuperior = getY(13); // +1 SD
  const yInferior = getY(7);  // -1 SD

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800">
              Gráfico de Dispersión y Perfil Cognitivo de Subtests
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              Vectorial Puro (0 KB)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Puntuaciones escalares (PE 1 – 19), media personal ($\bar&#123;PE&#125; = {subjectMean}$) y análisis ipsativo de fortalezas/debilidades
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600 inline-block" />
            <span className="font-semibold text-slate-700">Fortaleza [F]</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-600 inline-block" />
            <span className="font-semibold text-slate-700">Debilidad [D]</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-cyan-600 inline-block" />
            <span className="font-semibold text-cyan-800">Media Personal ({subjectMean})</span>
          </div>
        </div>
      </div>

      {administeredItems.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400 italic">
          Ingrese puntuaciones escalares para visualizar el perfil cognitivo
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <svg
            className="psychometric-chart w-full h-auto min-w-[620px]"
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="Perfil Cognitivo de Puntuaciones Escalares"
          >
            {/* Background Grid Lines (1..19) */}
            {Array.from({ length: 19 }, (_, i) => i + 1).map((s) => {
              const y = getY(s);
              const isMajor = s === 10 || s === 13 || s === 7 || s === 1 || s === 19;
              return (
                <g key={`grid-${s}`}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke={isMajor ? '#cbd5e1' : '#f1f5f9'}
                    strokeWidth={isMajor ? 1 : 0.7}
                    strokeDasharray={s === 10 ? '4 3' : s === 13 || s === 7 ? '2 2' : undefined}
                  />
                  {/* Y Axis Number */}
                  <text
                    x={padding.left - 10}
                    y={y + 3.5}
                    textAnchor="end"
                    fontSize="10"
                    fontWeight={isMajor ? '700' : '400'}
                    fill={isMajor ? '#334155' : '#94a3b8'}
                  >
                    {s}
                  </text>
                </g>
              );
            })}

            {/* Population Standard Range Shaded Band (7 to 13) */}
            <rect
              x={padding.left}
              y={ySuperior}
              width={innerWidth}
              height={yInferior - ySuperior}
              fill="#f8fafc"
              opacity="0.6"
            />

            {/* Population Reference Line Labels */}
            <text
              x={width - padding.right - 4}
              y={ySuperior - 4}
              textAnchor="end"
              fontSize="9"
              fill="#64748b"
              fontWeight="600"
            >
              +1 DT (13)
            </text>
            <text
              x={width - padding.right - 4}
              y={yPopMean - 4}
              textAnchor="end"
              fontSize="9"
              fill="#64748b"
              fontWeight="600"
            >
              Media Poblacional (10)
            </text>
            <text
              x={width - padding.right - 4}
              y={yInferior + 11}
              textAnchor="end"
              fontSize="9"
              fill="#64748b"
              fontWeight="600"
            >
              -1 DT (7)
            </text>

            {/* Subject Mean Personal Line */}
            <line
              x1={padding.left}
              y1={ySubjectMean}
              x2={width - padding.right}
              y2={ySubjectMean}
              stroke="#0891b2"
              strokeWidth="2"
            />
            <rect
              x={padding.left + 4}
              y={ySubjectMean - 9}
              width={105}
              height={18}
              rx="4"
              fill="#0891b2"
            />
            <text
              x={padding.left + 8}
              y={ySubjectMean + 3.5}
              fontSize="10"
              fontWeight="700"
              fill="#ffffff"
            >
              Media Sujeto: {subjectMean}
            </text>

            {/* Lollipop stems connecting points to personal mean line */}
            {administeredItems.map((item, idx) => {
              const cx = getX(idx, administeredItems.length);
              const cy = getY(item.score);
              const colors = getDomainColor(item.domain);

              return (
                <line
                  key={`stem-${item.id}`}
                  x1={cx}
                  y1={ySubjectMean}
                  x2={cx}
                  y2={cy}
                  stroke={colors.fill}
                  strokeWidth="2"
                  strokeDasharray="2 2"
                />
              );
            })}

            {/* Trend polygon line connecting all points */}
            {administeredItems.length > 1 && (
              <polyline
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
                strokeLinejoin="round"
                opacity="0.4"
                points={administeredItems
                  .map((item, idx) => `${getX(idx, administeredItems.length)},${getY(item.score)}`)
                  .join(' ')}
              />
            )}

            {/* Data Points and Badges */}
            {administeredItems.map((item, idx) => {
              const cx = getX(idx, administeredItems.length);
              const cy = getY(item.score);
              const colors = getDomainColor(item.domain);
              const isFortaleza = item.classification === 'Fortaleza';
              const isDebilidad = item.classification === 'Debilidad';

              return (
                <g key={`point-${item.id}`} className="cursor-pointer">
                  {/* Point Outer Ring / Glow */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isFortaleza || isDebilidad ? 9 : 7}
                    fill={isFortaleza ? '#10b981' : isDebilidad ? '#f59e0b' : colors.fill}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className="transition-transform hover:scale-125"
                  />

                  {/* S/W Tag Badge Inside / Beside */}
                  {isFortaleza && (
                    <text
                      x={cx}
                      y={cy + 3.5}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="900"
                      fill="#ffffff"
                    >
                      F
                    </text>
                  )}
                  {isDebilidad && (
                    <text
                      x={cx}
                      y={cy + 3.5}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="900"
                      fill="#ffffff"
                    >
                      D
                    </text>
                  )}

                  {/* Value Above Point */}
                  <text
                    x={cx}
                    y={cy - 12}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="800"
                    fill={isFortaleza ? '#047857' : isDebilidad ? '#b45309' : '#1e293b'}
                  >
                    {item.score}
                  </text>

                  {/* X Axis Subtest Code Label */}
                  <text
                    x={cx}
                    y={height - padding.bottom + 18}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill="#1e293b"
                  >
                    {item.code}
                  </text>

                  {/* Domain Tag Under Subtest */}
                  <rect
                    x={cx - 14}
                    y={height - padding.bottom + 23}
                    width={28}
                    height={15}
                    rx="3"
                    fill={colors.light}
                  />
                  <text
                    x={cx}
                    y={height - padding.bottom + 34}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill={colors.stroke}
                  >
                    {item.domain}
                  </text>
                </g>
              );
            })}

            {/* Y Axis Title */}
            <text
              transform={`rotate(-90)`}
              x={-(height / 2)}
              y={18}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#475569"
            >
              Puntuación Escalar (PE)
            </text>
          </svg>
        </div>
      )}
    </div>
  );
};
