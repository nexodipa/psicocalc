import React, { useMemo, useCallback } from 'react';
import { useClinicalSession } from '../../context/ClinicalSessionContext';
import {
  calculateMcmi4,
  validateMcmi4,
  calculateMaci4,
  validateMaci4,
} from '../../../core';
import { Mcmi4ScaleId } from '../../../core/types/personality';
import {
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Bookmark,
  Activity,
} from 'lucide-react';

export type MillonInstrumentId = 'mcmi_iv' | 'maci_iv';

interface BaseRateMultiScaleCardProps {
  instrumentId?: MillonInstrumentId;
}

interface ScaleSection {
  title: string;
  category: 'modifying' | 'personality' | 'severe_personality' | 'syndrome' | 'severe_syndrome';
  scales: { id: string; name: string; isRawOnly?: boolean }[];
}

const MCMI4_SECTIONS: ScaleSection[] = [
  {
    title: 'Índices Modificadores y Validez',
    category: 'modifying',
    scales: [
      { id: 'V', name: 'Validez (V, 0-3 ítems absurdos)', isRawOnly: true },
      { id: 'W', name: 'Inconsistencia (W, < 20)', isRawOnly: true },
      { id: 'X', name: 'Sinceridad / Apertura (X, 7-114)', isRawOnly: true },
      { id: 'Y', name: 'Deseabilidad Social (Y)' },
      { id: 'Z', name: 'Devaluación (Z)' },
    ],
  },
  {
    title: 'Patrones Clínicos de Personalidad',
    category: 'personality',
    scales: [
      { id: '1', name: '1 — Esquizoide' },
      { id: '2A', name: '2A — Evitativo' },
      { id: '2B', name: '2B — Melancólico' },
      { id: '3', name: '3 — Dependiente' },
      { id: '4A', name: '4A — Histriónico' },
      { id: '4B', name: '4B — Tempestuoso' },
      { id: '5', name: '5 — Narcisista' },
      { id: '6A', name: '6A — Antisocial' },
      { id: '6B', name: '6B — Sádico' },
      { id: '7', name: '7 — Compulsivo' },
      { id: '8A', name: '8A — Negativista' },
      { id: '8B', name: '8B — Masoquista' },
    ],
  },
  {
    title: 'Patología Grave de la Personalidad',
    category: 'severe_personality',
    scales: [
      { id: 'S', name: 'S — Esquizotípico' },
      { id: 'C', name: 'C — Límite' },
      { id: 'P', name: 'P — Paranoide' },
    ],
  },
  {
    title: 'Síndromes Clínicos',
    category: 'syndrome',
    scales: [
      { id: 'A', name: 'A — Ansiedad Generalizada' },
      { id: 'H', name: 'H — Síntomas Somatomorfos' },
      { id: 'N', name: 'N — Espectro Bipolar' },
      { id: 'D', name: 'D — Depresión Persistente' },
      { id: 'B', name: 'B — Consumo de Alcohol' },
      { id: 'T', name: 'T — Consumo de Drogas' },
      { id: 'R', name: 'R — Estrés Postraumático' },
    ],
  },
  {
    title: 'Síndromes Clínicos Graves',
    category: 'severe_syndrome',
    scales: [
      { id: 'SS', name: 'SS — Espectro Esquizofrénico' },
      { id: 'CC', name: 'CC — Depresión Mayor' },
      { id: 'PP', name: 'PP — Trastorno Delirante' },
    ],
  },
];

const MACI4_SECTIONS: ScaleSection[] = [
  {
    title: 'Índices Modificadores y Validez',
    category: 'modifying',
    scales: [
      { id: 'V', name: 'Fiabilidad / Validez (V, 0-2)', isRawOnly: true },
      { id: 'W', name: 'Inconsistencia (W, < 20)', isRawOnly: true },
      { id: 'X', name: 'Transparencia / Apertura (X)' },
      { id: 'Y', name: 'Deseabilidad (Y)' },
      { id: 'Z', name: 'Alteración / Autodevaluación (Z)' },
    ],
  },
  {
    title: 'Prototipos de Personalidad Adolescente',
    category: 'personality',
    scales: [
      { id: '1', name: '1 — Introvertido' },
      { id: '2A', name: '2A — Inhibido' },
      { id: '2B', name: '2B — Pesimista' },
      { id: '3', name: '3 — Sumiso' },
      { id: '4', name: '4 — Histriónico' },
      { id: '5', name: '5 — Egocéntrico' },
      { id: '6A', name: '6A — Rebelde' },
      { id: '6B', name: '6B — Rudo / Sádico' },
      { id: '7', name: '7 — Conformista' },
      { id: '8A', name: '8A — Oposicionista' },
      { id: '8B', name: '8B — Autopunitivo' },
      { id: '9', name: '9 — Tendencia Límite' },
    ],
  },
  {
    title: 'Preocupaciones Expresadas',
    category: 'severe_personality',
    scales: [
      { id: 'A', name: 'A — Difusión de la Identidad' },
      { id: 'B', name: 'B — Desvalorización de Sí Mismo' },
      { id: 'C', name: 'C — Desagrado por el Propio Cuerpo' },
      { id: 'D', name: 'D — Incomodidad Respecto al Sexo' },
      { id: 'E', name: 'E — Inseguridad con los Iguales' },
      { id: 'F', name: 'F — Insensibilidad Social' },
      { id: 'G', name: 'G — Discordancia Familiar' },
      { id: 'H', name: 'H — Abusos en la Infancia' },
    ],
  },
  {
    title: 'Síndromes Clínicos Adolescentes',
    category: 'syndrome',
    scales: [
      { id: 'AA', name: 'AA — Trastornos de la Alimentación' },
      { id: 'BB', name: 'BB — Inclinación al Abuso de Sustancias' },
      { id: 'CC', name: 'CC — Predisposición a la Delincuencia' },
      { id: 'DD', name: 'DD — Propensión a la Impulsividad' },
      { id: 'EE', name: 'EE — Sentimientos de Ansiedad' },
      { id: 'FF', name: 'FF — Afecto Depresivo' },
      { id: 'GG', name: 'GG — Tendencia al Suicidio (Ítem Crítico)' },
    ],
  },
];

export const BaseRateMultiScaleCard: React.FC<BaseRateMultiScaleCardProps> = ({
  instrumentId = 'mcmi_iv',
}) => {
  const { testData, setBatteryData } = useClinicalSession();

  const data = testData[instrumentId] || {};
  const baseRates = data.baseRates || {};
  const rawScores = data.rawScores || {};

  const sections = instrumentId === 'maci_iv' ? MACI4_SECTIONS : MCMI4_SECTIONS;

  // Validation
  const validation = useMemo(() => {
    return instrumentId === 'maci_iv' ? validateMaci4(data) : validateMcmi4(data);
  }, [instrumentId, data]);

  // Reactive calculation
  const result = useMemo(() => {
    if (Object.keys(baseRates).length === 0 && Object.keys(rawScores).length === 0) {
      return null;
    }
    try {
      return instrumentId === 'maci_iv' ? calculateMaci4(data) : calculateMcmi4(data);
    } catch {
      return null;
    }
  }, [instrumentId, data, baseRates, rawScores]);

  // Update Base Rate
  const handleBaseRateChange = useCallback(
    (scaleId: string, val: number) => {
      const clamped = Math.max(0, Math.min(115, val));
      setBatteryData(instrumentId, (prev: any = {}) => ({
        ...prev,
        baseRates: {
          ...(prev.baseRates || {}),
          [scaleId]: clamped,
        },
      }));
    },
    [instrumentId, setBatteryData]
  );

  // Update Raw Score (for V, W, X)
  const handleRawScoreChange = useCallback(
    (scaleId: string, val: number) => {
      setBatteryData(instrumentId, (prev: any = {}) => ({
        ...prev,
        rawScores: {
          ...(prev.rawScores || {}),
          [scaleId]: Math.max(0, val),
        },
      }));
    },
    [instrumentId, setBatteryData]
  );

  // Clear
  const handleClear = useCallback(() => {
    setBatteryData(instrumentId, { baseRates: {}, rawScores: {}, omittedCount: 0 });
  }, [instrumentId, setBatteryData]);

  // Presets
  const handleLoadSample = useCallback(
    (preset: 'typical' | 'clinical' | 'invalid') => {
      if (instrumentId === 'maci_iv') {
        if (preset === 'typical') {
          setBatteryData('maci_iv', {
            omittedCount: 0,
            rawScores: { V: 0, W: 3 },
            baseRates: {
              X: 52, Y: 58, Z: 44,
              '1': 45, '2A': 48, '3': 55, '4': 60, '5': 52, '7': 58,
              A: 45, E: 50, EE: 48, FF: 44, GG: 30,
            },
          });
        } else if (preset === 'clinical') {
          setBatteryData('maci_iv', {
            omittedCount: 0,
            rawScores: { V: 0, W: 5 },
            baseRates: {
              X: 72, Y: 35, Z: 84,
              '2B': 82, '8B': 78, '9': 88,
              A: 79, B: 85, G: 81,
              EE: 78, FF: 88, GG: 76,
            },
          });
        } else {
          setBatteryData('maci_iv', {
            rawScores: { V: 2, W: 14 },
            baseRates: { '9': 86, FF: 80 },
          });
        }
        return;
      }

      if (preset === 'typical') {
        setBatteryData('mcmi_iv', {
          omittedCount: 0,
          rawScores: { V: 0, W: 4, X: 58 },
          baseRates: {
            '1': 45, '2A': 48, '3': 52, '4A': 55, '5': 50,
            '7': 54, S: 40, C: 45, P: 42, A: 50, D: 48,
          },
        });
      } else if (preset === 'clinical') {
        setBatteryData('mcmi_iv', {
          omittedCount: 0,
          rawScores: { V: 0, W: 6, X: 65 },
          baseRates: {
            '1': 45,
            '2B': 82,
            C: 88,
            A: 78,
            CC: 86,
          },
        });
      } else {
        setBatteryData('mcmi_iv', {
          rawScores: { V: 2, W: 12, X: 70 },
          baseRates: { C: 78 },
        });
      }
    },
    [instrumentId, setBatteryData]
  );

  // All TB scales for SVG Base Rate bar chart
  const tbPlotScales = useMemo(() => {
    return sections
      .flatMap((s) => s.scales)
      .filter((sc) => !sc.isRawOnly)
      .map((sc) => ({
        id: sc.id,
        name: sc.name,
        val: typeof baseRates[sc.id as Mcmi4ScaleId] === 'number' ? baseRates[sc.id as Mcmi4ScaleId] : 0,
      }));
  }, [sections, baseRates]);

  return (
    <div className="space-y-6" data-testid="base-rate-form">
      {/* 1. Header & Presets */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-purple-100 text-purple-800 rounded-xl">
                <Bookmark className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                  Theodore Millon · Pearson Clinical
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                  {instrumentId === 'maci_iv'
                    ? 'MACI-IV — Inventario Clínico para Adolescentes de Millon'
                    : 'MCMI-IV — Inventario Clínico Multiaxial de Millon - IV'}
                </h2>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Puntuaciones de Tasa Base (TB 0–115) con líneas de corte en TB 75 (Presencia de rasgo/síndrome) y TB 85 (Prominencia patológica).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleLoadSample('typical')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Muestra Típica</span>
            </button>

            <button
              type="button"
              onClick={() => handleLoadSample('clinical')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-all shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />
              <span>Límite & Depresión</span>
            </button>

            <button
              type="button"
              onClick={() => handleLoadSample('invalid')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 transition-all shadow-xs"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              <span>Protocolo Inválido (V=2)</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>

        {/* Clinical Cutoff Reference Banner */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <span className="font-bold text-slate-800">Cortes Normativos Millon:</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span>TB &lt; 75: Estilo / No Significativo</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>TB 75 - 84: Presencia de Rasgo / Síndrome</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>TB ≥ 85: Prominencia Patológica / Severidad</span>
          </span>
        </div>
      </div>

      {/* 2. Invalidation Banner */}
      {result && result.validity && !result.validity.isValidProtocol && (
        <div
          data-testid="mcmi4-invalidation-banner"
          className="bg-red-50 border-l-4 border-red-600 p-4 rounded-xl text-red-900 flex items-start gap-3 shadow-xs"
        >
          <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-black">
              PROTOCOLO {instrumentId === 'maci_iv' ? 'MACI-IV' : 'MCMI-IV'} PROTOCOLARMENTE INVÁLIDO
            </h4>
            <p className="text-xs text-red-800 mt-1">
              {result.validity.invalidationReason ||
                'El perfil no es clínicamente interpretable debido a respuestas incoherentes o fuera de norma.'}
            </p>
          </div>
        </div>
      )}

      {/* 2.5 Live SVG Base Rate Psychogram */}
      {Object.keys(baseRates).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Perfil Gráfico de Tasas Base (TB 0–115)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Líneas de corte: TB=75 (Presencia) · TB=85 (Prominencia)
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox="0 0 760 190" className="w-full h-auto min-w-[540px]" role="img" aria-label="Perfil de Tasas Base Millon">
              {/* Cutoff Lines */}
              {[60, 75, 85, 100].map((tb) => {
                const y = 155 - (tb / 115) * 130;
                const is85 = tb === 85;
                const is75 = tb === 75;
                return (
                  <g key={tb}>
                    <line
                      x1={42}
                      y1={y}
                      x2={740}
                      y2={y}
                      stroke={is85 ? '#dc2626' : is75 ? '#f59e0b' : '#e2e8f0'}
                      strokeWidth={is85 || is75 ? 1.5 : 1}
                      strokeDasharray={is85 || is75 ? '5,4' : undefined}
                    />
                    <text x={36} y={y + 3} textAnchor="end" className="text-[9px] font-mono font-bold fill-slate-500">
                      TB{tb}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {tbPlotScales.map((sc, i) => {
                const barW = Math.max(10, Math.floor(660 / tbPlotScales.length) - 6);
                const x = 48 + i * (685 / tbPlotScales.length);
                const h = (Math.min(115, sc.val) / 115) * 130;
                const y = 155 - h;
                const fill = sc.val >= 85 ? '#dc2626' : sc.val >= 75 ? '#f59e0b' : '#7c3aed';
                return (
                  <g key={sc.id}>
                    <rect x={x} y={y} width={barW} height={Math.max(2, h)} rx={3} fill={fill} opacity={sc.val > 0 ? 0.9 : 0.2} />
                    {sc.val > 0 && (
                      <text x={x + barW / 2} y={y - 4} textAnchor="middle" className="text-[8px] font-mono font-bold fill-slate-800">
                        {sc.val}
                      </text>
                    )}
                    <text x={x + barW / 2} y={172} textAnchor="middle" className="text-[9px] font-bold fill-slate-600">
                      {sc.id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* 3. Scale Groups Grid */}
      <div className="space-y-5">
        {sections.map((section) => (
          <div
            key={section.title}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
          >
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {section.title}
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                {section.category === 'modifying'
                  ? 'Rango esperado: Directa / TB (0–115)'
                  : 'Rango esperado: Tasa Base entera (0–115)'}
              </span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {section.scales.map((scale) => {
                const isRaw = scale.isRawOnly;
                const currentVal = isRaw
                  ? rawScores[scale.id] ?? ''
                  : baseRates[scale.id] ?? '';
                const numVal = typeof currentVal === 'number' ? currentVal : 0;

                let badge = null;
                if (!isRaw && typeof currentVal === 'number') {
                  if (numVal >= 85) {
                    badge = (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300">
                        TB ≥ 85 Prominencia
                      </span>
                    );
                  } else if (numVal >= 75) {
                    badge = (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        TB ≥ 75 Presencia
                      </span>
                    );
                  } else if (numVal > 0) {
                    badge = (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        TB &lt; 75 Estilo
                      </span>
                    );
                  }
                } else if (scale.id === 'V' && typeof currentVal === 'number' && numVal >= 2) {
                  badge = (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      V ≥ 2 Inválido
                    </span>
                  );
                }

                return (
                  <div
                    key={scale.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate" title={scale.name}>
                        {scale.name}
                      </div>
                      {badge && <div className="mt-1">{badge}</div>}
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max={isRaw ? 120 : 115}
                        aria-label={`Puntuación para ${scale.name}`}
                        aria-invalid={!validation.isValid}
                        value={currentVal}
                        onChange={(e) => {
                          const n = parseInt(e.target.value, 10);
                          if (isRaw) {
                            handleRawScoreChange(scale.id, isNaN(n) ? 0 : n);
                          } else {
                            handleBaseRateChange(scale.id, isNaN(n) ? 0 : n);
                          }
                        }}
                        className={`psych-score-input w-16 py-1.5 px-2 text-center font-mono tabular-nums font-bold text-sm rounded-lg border focus:outline-none focus:ring-2 ${
                          numVal >= 85
                            ? 'border-red-400 bg-red-50 text-red-950 focus:ring-red-500'
                            : numVal >= 75
                            ? 'border-amber-400 bg-amber-50 text-amber-950 focus:ring-amber-500'
                            : 'border-slate-300 bg-white text-slate-900 focus:ring-purple-600'
                        }`}
                        placeholder={isRaw ? '0' : 'TB'}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Real-Time Results Summary */}
      {result && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Diagnóstico Multiaxial {instrumentId === 'maci_iv' ? 'MACI-IV' : 'MCMI-IV'} en Tiempo Real
            </h4>
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-900/50 text-purple-200 border border-purple-700">
              Baremos Theodore Millon
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mb-4">
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
              <span className="text-slate-400 block mb-1">Validez Protocolar:</span>
              <span
                className={`font-bold text-sm flex items-center gap-1.5 ${
                  result.validity.isValidProtocol ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {result.validity.isValidProtocol ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Protocolo VÁLIDO</span>
                  </>
                ) : (
                  <>
                    <AlertOctagon className="w-4 h-4" />
                    <span>Protocolo INVÁLIDO</span>
                  </>
                )}
              </span>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
              <span className="text-slate-400 block mb-1">Presencia de Rasgos (TB 75-84):</span>
              <span className="font-bold text-amber-300 text-sm">
                {result.presenceScales.length > 0
                  ? result.presenceScales.join(', ')
                  : 'Ninguna escala'}
              </span>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
              <span className="text-slate-400 block mb-1">Prominencia Patológica (TB ≥ 85):</span>
              <span className="font-bold text-red-400 text-sm">
                {result.prominenceScales.length > 0
                  ? result.prominenceScales.join(', ')
                  : 'Ninguna escala'}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            {result.diagnosticSummary}
          </p>
        </div>
      )}
    </div>
  );
};
