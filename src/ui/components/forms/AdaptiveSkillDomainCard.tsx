import React, { useMemo, useCallback } from 'react';
import { useClinicalSession } from '../../context/ClinicalSessionContext';
import {
  calculateAbas3,
  validateAbas3,
  calculateVineland3,
  validateVineland3,
  calculateDp3,
  validateDp3,
  Abas3CalculationResult,
  Vineland3CalculationResult,
  Dp3CalculationResult,
} from '../../../core';
import {
  Abas3SkillAreaId,
  Vineland3SubdomainId,
} from '../../../core/types/adaptive';
import {
  Sparkles,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  HeartHandshake,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export type AdaptiveBatteryId = 'abas_3' | 'vineland_3' | 'dp_3';

interface AdaptiveSkillDomainCardProps {
  batteryId: AdaptiveBatteryId;
}

export const AdaptiveSkillDomainCard: React.FC<AdaptiveSkillDomainCardProps> = ({ batteryId }) => {
  const { testData, setBatteryData } = useClinicalSession();

  const data = testData[batteryId] || {};

  // --------------------------------------------------------------------------
  // Battery Configurations
  // --------------------------------------------------------------------------
  const config = useMemo(() => {
    if (batteryId === 'abas_3') {
      return {
        title: 'ABAS-3 — Sistema de Evaluación de la Conducta Adaptativa (3ª Edición)',
        subtitle: 'Puntuaciones escalares (1-19) por áreas y Compuesto General de Adaptación (CAG/GAC, 100±15)',
        scaleMin: 1,
        scaleMax: 19,
        scalePlaceholder: '10',
        minAreasRequired: 9,
        domains: [
          {
            name: 'Dominio Conceptual',
            key: 'conceptual',
            areas: [
              { id: 'COM', name: 'Comunicación' },
              { id: 'HAF', name: 'Habilidades Académicas Funcionales' },
              { id: 'AD', name: 'Autodirección' },
            ],
          },
          {
            name: 'Dominio Social',
            key: 'social',
            areas: [
              { id: 'OC', name: 'Ocio' },
              { id: 'SOC', name: 'Social' },
            ],
          },
          {
            name: 'Dominio Práctico',
            key: 'practical',
            areas: [
              { id: 'UC', name: 'Utilización de la Comunidad' },
              { id: 'VH', name: 'Vida en el Hogar / Escuela' },
              { id: 'SS', name: 'Salud y Seguridad' },
              { id: 'AC', name: 'Autocuidado' },
            ],
          },
        ],
      };
    } else if (batteryId === 'vineland_3') {
      return {
        title: 'Vineland-3 — Escalas de Conducta Adaptativa de Vineland (3ª Edición)',
        subtitle: 'Puntuaciones v-scale (1-24) y Compuesto de Conducta Adaptativa (ABC, 100±15)',
        scaleMin: 1,
        scaleMax: 24,
        scalePlaceholder: '15',
        minAreasRequired: 9,
        domains: [
          {
            name: 'Comunicación',
            key: 'communication',
            areas: [
              { id: 'receptive', name: 'Receptivo' },
              { id: 'expressive', name: 'Expresivo' },
              { id: 'written', name: 'Escrito' },
            ],
          },
          {
            name: 'Habilidades de la Vida Diaria',
            key: 'dailyLivingSkills',
            areas: [
              { id: 'personal', name: 'Personal' },
              { id: 'domestic', name: 'Doméstico' },
              { id: 'community', name: 'Comunitario' },
            ],
          },
          {
            name: 'Socialización',
            key: 'socialization',
            areas: [
              { id: 'interpersonal', name: 'Relaciones Interpersonales' },
              { id: 'playLeisure', name: 'Juego y Ocio' },
              { id: 'coping', name: 'Habilidades de Afrontamiento' },
            ],
          },
        ],
      };
    } else {
      return {
        title: 'DP-3 — Perfil de Desarrollo - 3 (Alpern · TEA Ediciones)',
        subtitle: 'Puntuaciones estándar (40-160, M=100, DE=15) en 5 escalas del desarrollo infantil e Índice General (IGD)',
        scaleMin: 40,
        scaleMax: 160,
        scalePlaceholder: '100',
        minAreasRequired: 5,
        domains: [
          {
            name: 'Desarrollo Psicomotor y Adaptativo',
            key: 'MOT',
            areas: [
              { id: 'MOT', name: 'Motricidad (MOT)' },
              { id: 'ADP', name: 'Conducta Adaptativa (ADP)' },
            ],
          },
          {
            name: 'Desarrollo Socioemocional',
            key: 'SOC',
            areas: [
              { id: 'SOC', name: 'Socioemocional (SOC)' },
            ],
          },
          {
            name: 'Desarrollo Cognitivo y Comunicativo',
            key: 'COG',
            areas: [
              { id: 'COG', name: 'Cognición (COG)' },
              { id: 'COM', name: 'Comunicación (COM)' },
            ],
          },
        ],
      };
    }
  }, [batteryId]);

  // Current values
  const currentInputs: Record<string, number> = useMemo(() => {
    if (batteryId === 'abas_3') return data.skillAreas || {};
    if (batteryId === 'vineland_3') return data.subdomains || {};
    return data.scales || {};
  }, [batteryId, data]);

  // Validation
  const validation = useMemo(() => {
    if (batteryId === 'abas_3') {
      return validateAbas3({ skillAreas: currentInputs });
    } else if (batteryId === 'vineland_3') {
      return validateVineland3({ subdomains: currentInputs });
    } else {
      return validateDp3({ scales: currentInputs });
    }
  }, [batteryId, currentInputs]);

  // Calculation
  const result = useMemo(() => {
    const answeredCount = Object.keys(currentInputs).length;
    if (answeredCount < config.minAreasRequired) return null;

    try {
      if (batteryId === 'abas_3') {
        return calculateAbas3({ skillAreas: currentInputs as Record<Abas3SkillAreaId, number> });
      } else if (batteryId === 'vineland_3') {
        return calculateVineland3({ subdomains: currentInputs as Record<Vineland3SubdomainId, number> });
      } else {
        return calculateDp3({ scales: currentInputs });
      }
    } catch {
      return null;
    }
  }, [batteryId, currentInputs, config.minAreasRequired]);

  // Change a single score
  const handleScoreChange = useCallback(
    (areaId: string, val: number) => {
      const clamped = Math.max(config.scaleMin, Math.min(config.scaleMax, val));
      setBatteryData(batteryId, (prev: any = {}) => {
        const key =
          batteryId === 'abas_3'
            ? 'skillAreas'
            : batteryId === 'vineland_3'
            ? 'subdomains'
            : 'scales';
        return {
          ...prev,
          [key]: {
            ...(prev[key] || {}),
            [areaId]: clamped,
          },
        };
      });
    },
    [batteryId, config, setBatteryData]
  );

  // Clear
  const handleClear = useCallback(() => {
    setBatteryData(
      batteryId,
      batteryId === 'abas_3'
        ? { skillAreas: {} }
        : batteryId === 'vineland_3'
        ? { subdomains: {} }
        : { scales: {} }
    );
  }, [batteryId, setBatteryData]);

  // Presets
  const handleLoadSample = useCallback(
    (preset: 'typical' | 'deficit' | 'superior') => {
      if (batteryId === 'abas_3') {
        if (preset === 'typical') {
          setBatteryData('abas_3', {
            skillAreas: {
              COM: 10, HAF: 10, AD: 10,
              OC: 10, SOC: 10,
              UC: 10, VH: 10, SS: 10, AC: 10,
            },
          });
        } else if (preset === 'deficit') {
          setBatteryData('abas_3', {
            skillAreas: {
              COM: 4, HAF: 3, AD: 4,
              OC: 5, SOC: 4,
              UC: 3, VH: 4, SS: 3, AC: 4,
            },
          });
        } else {
          setBatteryData('abas_3', {
            skillAreas: {
              COM: 14, HAF: 15, AD: 13,
              OC: 13, SOC: 14,
              UC: 14, VH: 14, SS: 15, AC: 14,
            },
          });
        }
      } else if (batteryId === 'vineland_3') {
        if (preset === 'typical') {
          setBatteryData('vineland_3', {
            subdomains: {
              receptive: 15, expressive: 15, written: 15,
              personal: 15, domestic: 15, community: 15,
              interpersonal: 15, playLeisure: 15, coping: 15,
            },
          });
        } else if (preset === 'deficit') {
          setBatteryData('vineland_3', {
            subdomains: {
              receptive: 8, expressive: 6, written: 7,
              personal: 11, domestic: 10, community: 9,
              interpersonal: 5, playLeisure: 5, coping: 6,
            },
          });
        } else {
          setBatteryData('vineland_3', {
            subdomains: {
              receptive: 18, expressive: 19, written: 18,
              personal: 18, domestic: 17, community: 18,
              interpersonal: 18, playLeisure: 17, coping: 18,
            },
          });
        }
      } else {
        // DP-3
        if (preset === 'typical') {
          setBatteryData('dp_3', {
            scales: { MOT: 102, ADP: 100, SOC: 98, COG: 101, COM: 99 },
          });
        } else if (preset === 'deficit') {
          setBatteryData('dp_3', {
            scales: { MOT: 68, ADP: 64, SOC: 66, COG: 62, COM: 60 },
          });
        } else {
          setBatteryData('dp_3', {
            scales: { MOT: 122, ADP: 120, SOC: 118, COG: 126, COM: 124 },
          });
        }
      }
    },
    [batteryId, setBatteryData]
  );

  return (
    <div className="space-y-6" data-testid={`adaptive-form-${batteryId}`}>
      {/* 1. Header & Presets */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <HeartHandshake className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {config.title}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">{config.subtitle}</p>
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
              onClick={() => handleLoadSample('deficit')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-all shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Déficit Adaptativo (≤ 69/70)</span>
            </button>

            <button
              type="button"
              onClick={() => handleLoadSample('superior')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-all shadow-xs"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Rendimiento Superior</span>
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
      </div>

      {/* 2. Validation / Clinical Deficit Banner */}
      {!validation.isValid && (
        <div
          data-testid="adaptive-validation-error"
          className="bg-red-50 border-l-4 border-red-600 p-4 rounded-xl text-red-900 flex items-start gap-3 shadow-xs"
        >
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-black">PUNTUACIÓN FUERA DE RANGO NORMATIVO</h4>
            <p className="text-xs text-red-800 mt-1">{validation.errors.join('; ')}</p>
          </div>
        </div>
      )}

      {result && result.meetsClinicalCutoff && (
        <div
          data-testid="adaptive-deficit-alert"
          className="bg-red-50 border-l-4 border-red-600 p-4 rounded-xl text-red-900 flex items-start gap-3 shadow-xs"
        >
          <TrendingDown className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-black">
              ALERTA CLÍNICA DE DÉFICIT EN CONDUCTA ADAPTATIVA / DESARROLLO (DSM-5 / AAIDD)
            </h4>
            <p className="text-xs text-red-800 mt-1">
              {result.clinicalAlert ||
                'Puntuación compuesta en rango clínico significativo (≤ 69/70). Cumple criterio de limitación funcional o retraso evolutivo.'}
            </p>
          </div>
        </div>
      )}

      {/* 3. Domain Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {config.domains.map((dom) => (
          <div
            key={dom.name}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {dom.name}
                </h3>
                <span className="text-[10px] font-mono text-slate-500">
                  Rango {config.scaleMin}..{config.scaleMax}
                </span>
              </div>

              <div className="p-4 space-y-3">
                {dom.areas.map((area) => {
                  const val = currentInputs[area.id] ?? '';
                  return (
                    <div
                      key={area.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <label htmlFor={`adaptive-${area.id}-input`} className="text-xs font-semibold text-slate-700">
                        {area.name}
                      </label>

                      <input
                        id={`adaptive-${area.id}-input`}
                        type="number"
                        min={config.scaleMin}
                        max={config.scaleMax}
                        aria-label={`Puntuación para ${area.name}`}
                        aria-invalid={!validation.isValid}
                        value={val}
                        onChange={(e) => {
                          const n = parseInt(e.target.value, 10);
                          handleScoreChange(area.id, isNaN(n) ? config.scaleMin : n);
                        }}
                        className="psych-score-input w-16 py-1.5 px-2 text-center font-mono tabular-nums font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm focus:bg-white"
                        placeholder={config.scalePlaceholder}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subdomain summary footer if computed */}
            {result && (
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Puntaje Compuesto:</span>
                <span className="font-mono tabular-nums font-black text-emerald-800 text-sm">
                  {batteryId === 'abas_3'
                    ? (result.domains as any)[dom.key]?.compositeScore ?? '—'
                    : (result.domains as any)[dom.key]?.standardScore ?? '—'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 4. Global Composite Summary */}
      {result && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              {batteryId === 'abas_3'
                ? 'Compuesto General de Adaptación (CAG / GAC)'
                : batteryId === 'vineland_3'
                ? 'Compuesto de Conducta Adaptativa (ABC)'
                : 'Índice General de Desarrollo (IGD - DP-3)'}
            </h4>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-700">
              M = 100, DE = 15
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {(() => {
              const abasRes = batteryId === 'abas_3' ? (result as Abas3CalculationResult) : null;
              const vineRes = batteryId === 'vineland_3' ? (result as Vineland3CalculationResult) : null;
              const dp3Res = batteryId === 'dp_3' ? (result as Dp3CalculationResult) : null;

              const globalScore = abasRes
                ? abasRes.gac.compositeScore
                : vineRes
                ? vineRes.abc.standardScore
                : dp3Res?.igd.standardScore ?? 0;

              const globalPct = abasRes
                ? abasRes.gac.percentile
                : vineRes
                ? vineRes.abc.percentile
                : dp3Res?.igd.percentile ?? 0;

              const globalQual = abasRes
                ? abasRes.gac.qualitative
                : vineRes
                ? vineRes.abc.descriptor
                : dp3Res?.igd.qualitative ?? '';

              return (
                <>
                  <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block mb-1">Puntuación Estándar Global:</span>
                    <span className="text-3xl font-mono tabular-nums font-black text-emerald-400">
                      {globalScore}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Percentil: {globalPct}
                    </span>
                  </div>

                  <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block mb-1">Clasificación Cualitativa:</span>
                    <span className="text-base font-bold text-white mt-1 block">
                      {globalQual}
                    </span>
                  </div>
                </>
              );
            })()}

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <span className="text-slate-400 block mb-1">Corte Clínico AAIDD/DSM-5:</span>
              <span
                className={`text-base font-bold flex items-center gap-1.5 mt-1 ${
                  result.meetsClinicalCutoff ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {result.meetsClinicalCutoff ? (
                  <>
                    <TrendingDown className="w-4 h-4" />
                    <span>DÉFICIT SIGNIFICATIVO</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>SIN DÉFICIT CLÍNICO</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
