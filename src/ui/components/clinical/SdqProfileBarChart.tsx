import React from 'react';
import { SdqCalculationResult, SdqInformantType, SdqSubscaleId } from '../../../core/types/clinical';
import { SDQ_NORMS } from '../../../core/tables/clinicalNorms';

interface SdqProfileBarChartProps {
  sdqResult: SdqCalculationResult;
}

interface ScaleRowData {
  id: SdqSubscaleId | 'total';
  name: string;
  score: number;
  maxScore: number;
  classification: 'Normal' | 'Borderline' | 'Abnormal';
  isStrengthScale: boolean;
  normalRangeText: string;
  borderlineRangeText: string;
  abnormalRangeText: string;
}

export const SdqProfileBarChart: React.FC<SdqProfileBarChartProps> = ({ sdqResult }) => {
  const informant = sdqResult.informant || 'parent';
  const norms = SDQ_NORMS[informant];

  const rows: ScaleRowData[] = [
    {
      id: 'emotional',
      name: 'Síntomas Emocionales',
      score: sdqResult.subscales.emotional.rawScore,
      maxScore: 10,
      classification: sdqResult.subscales.emotional.classification,
      isStrengthScale: false,
      normalRangeText: `0-${norms.emotional.normal.max}`,
      borderlineRangeText: `${norms.emotional.borderline.min}-${norms.emotional.borderline.max}`,
      abnormalRangeText: `≥${norms.emotional.abnormal.min}`,
    },
    {
      id: 'conduct',
      name: 'Problemas de Conducta',
      score: sdqResult.subscales.conduct.rawScore,
      maxScore: 10,
      classification: sdqResult.subscales.conduct.classification,
      isStrengthScale: false,
      normalRangeText: `0-${norms.conduct.normal.max}`,
      borderlineRangeText: `${norms.conduct.borderline.min}-${norms.conduct.borderline.max}`,
      abnormalRangeText: `≥${norms.conduct.abnormal.min}`,
    },
    {
      id: 'hyperactivity',
      name: 'Hiperactividad / Inatención',
      score: sdqResult.subscales.hyperactivity.rawScore,
      maxScore: 10,
      classification: sdqResult.subscales.hyperactivity.classification,
      isStrengthScale: false,
      normalRangeText: `0-${norms.hyperactivity.normal.max}`,
      borderlineRangeText: `${norms.hyperactivity.borderline.min}-${norms.hyperactivity.borderline.max}`,
      abnormalRangeText: `≥${norms.hyperactivity.abnormal.min}`,
    },
    {
      id: 'peer',
      name: 'Problemas con Compañeros',
      score: sdqResult.subscales.peer.rawScore,
      maxScore: 10,
      classification: sdqResult.subscales.peer.classification,
      isStrengthScale: false,
      normalRangeText: `0-${norms.peer.normal.max}`,
      borderlineRangeText: `${norms.peer.borderline.min}-${norms.peer.borderline.max}`,
      abnormalRangeText: `≥${norms.peer.abnormal.min}`,
    },
    {
      id: 'prosocial',
      name: 'Conducta Prosocial (Fortaleza)',
      score: sdqResult.subscales.prosocial.rawScore,
      maxScore: 10,
      classification: sdqResult.subscales.prosocial.classification,
      isStrengthScale: true,
      normalRangeText: `≥${norms.prosocial.normal.min}`,
      borderlineRangeText: `${norms.prosocial.borderline.min}`,
      abnormalRangeText: `0-${norms.prosocial.abnormal.max}`,
    },
    {
      id: 'total',
      name: 'TOTAL DE DIFICULTADES',
      score: sdqResult.totalDifficulties.score,
      maxScore: 40,
      classification: sdqResult.totalDifficulties.classification,
      isStrengthScale: false,
      normalRangeText: `0-${norms.totalDifficulties.normal.max}`,
      borderlineRangeText: `${norms.totalDifficulties.borderline.min}-${norms.totalDifficulties.borderline.max}`,
      abnormalRangeText: `≥${norms.totalDifficulties.abnormal.min}`,
    },
  ];

  // SVG Layout dimensions
  const svgWidth = 720;
  const svgHeight = 270;
  const labelWidth = 230;
  const barStartX = labelWidth + 10;
  const barAreaWidth = 340;
  const rowHeight = 36;
  const barHeight = 16;
  const startY = 30;

  const getColor = (classification: 'Normal' | 'Borderline' | 'Abnormal') => {
    switch (classification) {
      case 'Normal':
        return '#059669'; // Emerald-600
      case 'Borderline':
        return '#d97706'; // Amber-600
      case 'Abnormal':
        return '#dc2626'; // Red-600
    }
  };

  const getBadgeBg = (classification: 'Normal' | 'Borderline' | 'Abnormal') => {
    switch (classification) {
      case 'Normal':
        return '#ecfdf5';
      case 'Borderline':
        return '#fef3c7';
      case 'Abnormal':
        return '#fee2e2';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3 avoid-break">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div>
          <h4 className="font-bold text-sm text-slate-900 tracking-tight">
            Perfil Gráfico de Severidad SDQ (Baremo: {informant === 'parent' ? 'Padres' : informant === 'teacher' ? 'Profesores' : 'Autoinforme'})
          </h4>
          <p className="text-[11px] text-slate-500">
            Zonas normativas estandarizadas: Verde (Normal), Ámbar (Limítrofe), Rojo (Clínico). *Conducta Prosocial tiene polaridad inversa.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-semibold">
          <span className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Normal
          </span>
          <span className="flex items-center gap-1.5 text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            Limítrofe
          </span>
          <span className="flex items-center gap-1.5 text-red-700">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
            Clínico
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto sdq-chart psychometric-chart"
          aria-label="Gráfico de perfil de dificultades SDQ"
        >
          {/* Header row */}
          <text x={10} y={16} fill="#64748b" fontSize="10" fontWeight="bold">
            DIMENSIÓN
          </text>
          <text x={barStartX} y={16} fill="#64748b" fontSize="10" fontWeight="bold">
            ESCALA RELATIVA &amp; CORTE NORMATIVO
          </text>
          <text x={barStartX + barAreaWidth + 15} y={16} fill="#64748b" fontSize="10" fontWeight="bold">
            PUNT.
          </text>
          <text x={barStartX + barAreaWidth + 65} y={16} fill="#64748b" fontSize="10" fontWeight="bold">
            CLASIFICACIÓN
          </text>

          {rows.map((row, idx) => {
            const y = startY + idx * rowHeight;
            const isTotal = row.id === 'total';
            const barW = Math.max(4, (row.score / row.maxScore) * barAreaWidth);
            const barColor = getColor(row.classification);
            const badgeBg = getBadgeBg(row.classification);

            return (
              <g key={row.id}>
                {/* Row divider line */}
                {isTotal && (
                  <line
                    x1={10}
                    y1={y - 8}
                    x2={svgWidth - 10}
                    y2={y - 8}
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                )}

                {/* Scale Label */}
                <text
                  x={10}
                  y={y + 12}
                  fill={isTotal ? '#0f172a' : '#334155'}
                  fontSize={isTotal ? '11' : '10.5'}
                  fontWeight={isTotal ? 'bold' : '600'}
                >
                  {row.name}
                </text>

                {/* Background track */}
                <rect
                  x={barStartX}
                  y={y}
                  width={barAreaWidth}
                  height={barHeight}
                  rx="4"
                  fill="#f1f5f9"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />

                {/* Filled Value Bar */}
                <rect
                  x={barStartX}
                  y={y}
                  width={barW}
                  height={barHeight}
                  rx="4"
                  fill={barColor}
                  opacity="0.9"
                />

                {/* Numerical Score */}
                <text
                  x={barStartX + barAreaWidth + 25}
                  y={y + 12}
                  fill="#0f172a"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {row.score}
                </text>

                {/* Max score indication */}
                <text
                  x={barStartX + barAreaWidth + 45}
                  y={y + 12}
                  fill="#94a3b8"
                  fontSize="9.5"
                >
                  /{row.maxScore}
                </text>

                {/* Classification Pill Badge */}
                <rect
                  x={barStartX + barAreaWidth + 62}
                  y={y - 1}
                  width={80}
                  height={barHeight + 2}
                  rx="4"
                  fill={badgeBg}
                  stroke={barColor}
                  strokeWidth="0.8"
                />
                <text
                  x={barStartX + barAreaWidth + 102}
                  y={y + 11}
                  fill={barColor}
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {row.classification === 'Normal'
                    ? 'Normal'
                    : row.classification === 'Borderline'
                    ? 'Limítrofe'
                    : 'Anormal'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
