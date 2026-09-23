import React from 'react';
import { BatteryType, CompositeResult, formatPercentile } from '../../../core';

interface GaussianBellCurveProps {
  battery: BatteryType;
  cit: CompositeResult | null;
  primaryIndices: Record<string, CompositeResult | null>;
  isCompleteCit: boolean;
}

export const GaussianBellCurve: React.FC<GaussianBellCurveProps> = ({
  cit,
  primaryIndices,
  isCompleteCit,
}) => {
  // Constants for normal distribution (Wechsler standard: Mean = 100, SD = 15)
  const mu = 100;
  const sigma = 15;
  const peakDensity = 1 / (sigma * Math.sqrt(2 * Math.PI)); // ~0.026596

  // Normal PDF function
  const normalPdf = (x: number): number => {
    const z = (x - mu) / sigma;
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
  };

  // Dimensions
  const width = 760;
  const height = 340;
  const padding = { top: 60, right: 50, bottom: 85, left: 60 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const baselineY = padding.top + innerHeight; // Y coordinate of the axis baseline

  // Domain of x: 45 to 155
  const xMin = 45;
  const xMax = 155;

  const toSvgX = (x: number): number => {
    const clamped = Math.max(xMin, Math.min(xMax, x));
    return padding.left + ((clamped - xMin) / (xMax - xMin)) * innerWidth;
  };

  const toSvgY = (density: number): number => {
    return baselineY - (density / peakDensity) * innerHeight;
  };

  // 7 Qualitative Zones
  const zones = [
    { name: 'Muy Bajo', min: 45, max: 70, fill: '#fee2e2', textFill: '#991b1b', pct: '< 2.2%' },
    { name: 'Limítrofe', min: 70, max: 80, fill: '#ffedd5', textFill: '#9a3412', pct: '6.7%' },
    { name: 'Promedio Bajo', min: 80, max: 90, fill: '#fef3c7', textFill: '#92400e', pct: '16.1%' },
    { name: 'Promedio', min: 90, max: 110, fill: '#dcfce7', textFill: '#166534', pct: '50.0%' },
    { name: 'Promedio Alto', min: 110, max: 120, fill: '#e0f2fe', textFill: '#075985', pct: '16.1%' },
    { name: 'Superior', min: 120, max: 130, fill: '#e0e7ff', textFill: '#3730a3', pct: '6.7%' },
    { name: 'Muy Superior', min: 130, max: 155, fill: '#f3e8ff', textFill: '#6b21a8', pct: '< 2.2%' },
  ];

  // Helper to generate shaded SVG path under the curve for a zone
  const generateZonePath = (zMin: number, zMax: number, step = 0.5): string => {
    const points: string[] = [];
    // Start at baseline (xMin, baselineY)
    points.push(`M ${toSvgX(zMin)} ${baselineY}`);

    // Curve along top
    for (let x = zMin; x <= zMax; x += step) {
      points.push(`L ${toSvgX(x)} ${toSvgY(normalPdf(x))}`);
    }
    // Ensure exact endpoint
    points.push(`L ${toSvgX(zMax)} ${toSvgY(normalPdf(zMax))}`);

    // Close down to baseline
    points.push(`L ${toSvgX(zMax)} ${baselineY} Z`);
    return points.join(' ');
  };

  // Main continuous curve line
  const generateFullCurvePath = (step = 0.5): string => {
    const points: string[] = [];
    let isFirst = true;
    for (let x = xMin; x <= xMax; x += step) {
      const sx = toSvgX(x);
      const sy = toSvgY(normalPdf(x));
      if (isFirst) {
        points.push(`M ${sx} ${sy}`);
        isFirst = false;
      } else {
        points.push(`L ${sx} ${sy}`);
      }
    }
    return points.join(' ');
  };

  // Valid Primary Indices to plot
  const primaryIndexEntries = Object.entries(primaryIndices).filter(
    (entry): entry is [string, CompositeResult] => entry[1] !== null
  );

  const indexColors: Record<string, string> = {
    ICV: '#2563eb', // Blue
    IVE: '#4f46e5', // Indigo
    IRP: '#4f46e5', // Indigo
    IRF: '#059669', // Emerald
    IMT: '#d97706', // Amber
    IVP: '#7c3aed', // Purple
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800">
              Distribución Normal de Gauss y Zonas Diagnósticas
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
              Puntuaciones Compuestas ($\mu=100, \sigma=15$)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Curva teórica poblacional con 7 franjas diagnósticas estandarizadas y posicionamiento del evaluado
          </p>
        </div>

        {/* Legend */}
        {cit && isCompleteCit && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-900 text-white text-xs font-bold shadow-sm">
            <span>CIT: {cit.compositeScore}</span>
            <span>•</span>
            <span>Pc {formatPercentile(cit.percentile, cit.compositeScore)}</span>
            <span>•</span>
            <span className="text-blue-200">{cit.qualitative}</span>
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          className="psychometric-chart w-full h-auto min-w-[620px]"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Campana de Gauss y Zonas Diagnósticas Wechsler"
        >
          {/* Shaded Qualitative Zones */}
          {zones.map((zone) => {
            const pathData = generateZonePath(zone.min, zone.max);
            const midX = toSvgX((zone.min + zone.max) / 2);

            return (
              <g key={zone.name}>
                <path d={pathData} fill={zone.fill} opacity="0.85" />
                {/* Zone Label in bottom half */}
                <text
                  x={midX}
                  y={baselineY - 14}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  fill={zone.textFill}
                  className="select-none pointer-events-none"
                >
                  {zone.name}
                </text>
                <text
                  x={midX}
                  y={baselineY - 3}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="500"
                  fill={zone.textFill}
                  opacity="0.8"
                  className="select-none pointer-events-none"
                >
                  {zone.pct}
                </text>
              </g>
            );
          })}

          {/* Smooth Bell Curve Stroke Outline */}
          <path
            d={generateFullCurvePath()}
            fill="none"
            stroke="#1e293b"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Standard Deviation Boundary Vertical Dashed Dividers */}
          {[-3, -2, -1, 0, 1, 2, 3].map((sd) => {
            const xVal = mu + sd * sigma;
            const sx = toSvgX(xVal);
            const sy = toSvgY(normalPdf(xVal));
            const isCenter = sd === 0;

            return (
              <line
                key={`sd-line-${sd}`}
                x1={sx}
                y1={sy}
                x2={sx}
                y2={baselineY}
                stroke={isCenter ? '#0f172a' : '#94a3b8'}
                strokeWidth={isCenter ? 1.5 : 1}
                strokeDasharray={isCenter ? undefined : '3 3'}
              />
            );
          })}

          {/* Horizontal Baseline Axis */}
          <line
            x1={padding.left}
            y1={baselineY}
            x2={width - padding.right}
            y2={baselineY}
            stroke="#0f172a"
            strokeWidth="1.5"
          />

          {/* Axis Scale Ticks and Labels */}
          {/* Row 1: Composite Scores (55, 70, 85, 100, 115, 130, 145) */}
          {[-3, -2, -1, 0, 1, 2, 3].map((sd) => {
            const scoreVal = mu + sd * sigma;
            const sx = toSvgX(scoreVal);
            return (
              <g key={`axis-labels-${sd}`}>
                {/* Tick mark */}
                <line x1={sx} y1={baselineY} x2={sx} y2={baselineY + 5} stroke="#0f172a" strokeWidth="1" />
                {/* Composite score */}
                <text
                  x={sx}
                  y={baselineY + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="#0f172a"
                >
                  {scoreVal}
                </text>
                {/* Standard deviations */}
                <text
                  x={sx}
                  y={baselineY + 28}
                  textAnchor="middle"
                  fontSize="8.5"
                  fontWeight="600"
                  fill="#64748b"
                >
                  {sd === 0 ? 'Media (μ)' : sd > 0 ? `+${sd}σ` : `${sd}σ`}
                </text>
              </g>
            );
          })}

          {/* Axis Legend on Left */}
          <text
            x={padding.left - 10}
            y={baselineY + 16}
            textAnchor="end"
            fontSize="9"
            fontWeight="700"
            fill="#334155"
          >
            Punt. Compuesta:
          </text>
          <text
            x={padding.left - 10}
            y={baselineY + 28}
            textAnchor="end"
            fontSize="8.5"
            fontWeight="600"
            fill="#64748b"
          >
            Desviación Típica:
          </text>

          {/* Row 3: Percentile Scale Row */}
          <text
            x={padding.left - 10}
            y={baselineY + 41}
            textAnchor="end"
            fontSize="8.5"
            fontWeight="600"
            fill="#64748b"
          >
            Percentil Teórico:
          </text>
          {[
            { sd: -3, pc: '0.1' },
            { sd: -2, pc: '2' },
            { sd: -1, pc: '16' },
            { sd: 0, pc: '50' },
            { sd: 1, pc: '84' },
            { sd: 2, pc: '98' },
            { sd: 3, pc: '99.9' },
          ].map((item) => (
            <text
              key={`pc-${item.sd}`}
              x={toSvgX(mu + item.sd * sigma)}
              y={baselineY + 41}
              textAnchor="middle"
              fontSize="8.5"
              fontWeight="600"
              fill="#64748b"
            >
              {item.pc}
            </text>
          ))}

          {/* Primary Indices Dynamic Markers */}
          {primaryIndexEntries.map(([key, item]) => {
            const sx = toSvgX(item.compositeScore);
            const sy = toSvgY(normalPdf(item.compositeScore));
            const color = indexColors[key] || '#3b82f6';

            return (
              <g key={`index-marker-${key}`}>
                {/* Thin drop line */}
                <line
                  x1={sx}
                  y1={sy}
                  x2={sx}
                  y2={baselineY}
                  stroke={color}
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                {/* Node */}
                <circle
                  cx={sx}
                  cy={sy}
                  r="4.5"
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                {/* Tiny tag */}
                <rect
                  x={sx - 12}
                  y={sy - 18}
                  width={24}
                  height={13}
                  rx="3"
                  fill={color}
                />
                <text
                  x={sx}
                  y={sy - 9}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="800"
                  fill="#ffffff"
                >
                  {key}
                </text>
              </g>
            );
          })}

          {/* Coeficiente Intelectual Total (CIT) Dynamic Pin & Floating Banner */}
          {cit && isCompleteCit && (
            <g className="cursor-pointer">
              {(() => {
                const citX = toSvgX(cit.compositeScore);
                const citY = toSvgY(normalPdf(cit.compositeScore));
                const badgeWidth = 148;
                const badgeHeight = 26;
                // Position badge above curve, clamped inside chart
                const badgeX = Math.max(padding.left, Math.min(width - padding.right - badgeWidth, citX - badgeWidth / 2));
                const badgeY = Math.max(8, citY - 44);

                return (
                  <>
                    {/* Vertical Navy Drop-line */}
                    <line
                      x1={citX}
                      y1={citY}
                      x2={citX}
                      y2={baselineY}
                      stroke="#1e3a8a"
                      strokeWidth="2.5"
                      strokeDasharray="4 3"
                    />

                    {/* Indicator line connecting point to floating badge */}
                    <line
                      x1={citX}
                      y1={citY}
                      x2={badgeX + badgeWidth / 2}
                      y2={badgeY + badgeHeight}
                      stroke="#1e3a8a"
                      strokeWidth="1.5"
                    />

                    {/* Pulsing Outer Ring */}
                    <circle
                      cx={citX}
                      cy={citY}
                      r="9"
                      fill="#3b82f6"
                      opacity="0.3"
                    />

                    {/* Main Node */}
                    <circle
                      cx={citX}
                      cy={citY}
                      r="6"
                      fill="#1e3a8a"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* Floating Badge Container */}
                    <rect
                      x={badgeX}
                      y={badgeY}
                      width={badgeWidth}
                      height={badgeHeight}
                      rx="6"
                      fill="#1e3a8a"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.25))"
                    />

                    {/* Badge Content Text */}
                    <text
                      x={badgeX + badgeWidth / 2}
                      y={badgeY + 16.5}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="800"
                      fill="#ffffff"
                    >
                      CIT: {cit.compositeScore} | Pc {formatPercentile(cit.percentile, cit.compositeScore)}
                    </text>
                  </>
                );
              })()}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
