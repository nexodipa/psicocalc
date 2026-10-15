import React, { useMemo, useCallback } from 'react';
import { useClinicalSession } from '../../context/ClinicalSessionContext';
import {
  calculateMmpi3,
  validateMmpi3,
  calculatePai,
  validatePai,
  calculateSena,
  validateSena,
  calculateCbcl,
  validateCbcl,
  calculateByi2,
  validateByi2,
} from '../../../core';
import { MMPI3_SCALES } from '../../../core/tables/personalityNorms';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';

export type LikertBatteryId = 'mmpi_3' | 'pai' | 'sena' | 'cbcl' | 'byi_2';

interface LikertMatrixInputCardProps {
  batteryId: LikertBatteryId;
}

export const LikertMatrixInputCard: React.FC<LikertMatrixInputCardProps> = ({ batteryId }) => {
  const { testData, setBatteryData } = useClinicalSession();

  const data = testData[batteryId] || {};

  // --------------------------------------------------------------------------
  // Battery Configurations & Scale Definitions
  // --------------------------------------------------------------------------
  const config = useMemo(() => {
    switch (batteryId) {
      case 'mmpi_3':
        return {
          title: 'MMPI-3 — Inventario Multifásico de Personalidad de Minnesota - 3',
          subtitle: 'Entrada estandarizada de puntuaciones T (M=50, DE=10) y escalas de validez',
          scales: [
            // Validity
            { id: 'CNS', name: 'Omitidos (CNS)', category: 'Validez', isOmission: true },
            { id: 'CRIN', name: 'Inconsistencia Combinada (CRIN)', category: 'Validez' },
            { id: 'VRIN', name: 'Inconsistencia Variable (VRIN)', category: 'Validez' },
            { id: 'TRIN', name: 'Inconsistencia Verdadera (TRIN)', category: 'Validez' },
            { id: 'F', name: 'Infrecuencia (F)', category: 'Validez' },
            { id: 'Fp', name: 'Infrecuencia Psicopatología (Fp)', category: 'Validez' },
            { id: 'L', name: 'Virtudes Poco Comunes (L)', category: 'Validez' },
            { id: 'K', name: 'Ajuste / Defensividad (K)', category: 'Validez' },
            // Higher-order
            { id: 'EID', name: 'Disfunción Emocional (EID)', category: 'Orden Superior' },
            { id: 'THD', name: 'Disfunción del Pensamiento (THD)', category: 'Orden Superior' },
            { id: 'BXD', name: 'Disfunción Conductual (BXD)', category: 'Orden Superior' },
            // Restructured Clinical
            { id: 'RCd', name: 'Desmoralización (RCd)', category: 'Clínicas Reestructuradas' },
            { id: 'RC1', name: 'Quejas Somáticas (RC1)', category: 'Clínicas Reestructuradas' },
            { id: 'RC2', name: 'Escasas Emociones Positivas (RC2)', category: 'Clínicas Reestructuradas' },
            { id: 'RC4', name: 'Conducta Antisocial (RC4)', category: 'Clínicas Reestructuradas' },
            { id: 'RC6', name: 'Ideas de Persecución (RC6)', category: 'Clínicas Reestructuradas' },
            { id: 'RC7', name: 'Emociones Negativas (RC7)', category: 'Clínicas Reestructuradas' },
            { id: 'RC8', name: 'Experiencias Anómalas (RC8)', category: 'Clínicas Reestructuradas' },
            { id: 'RC9', name: 'Activación Hipomaníaca (RC9)', category: 'Clínicas Reestructuradas' },
            // Critical
            { id: 'SUI', name: 'Ideación Suicida (SUI)', category: 'Ítems Críticos / Específicas' },
          ],
        };

      case 'pai':
        return {
          title: 'PAI — Inventario de Evaluación de la Personalidad',
          subtitle: 'Puntuaciones T en 22 escalas clínicas, de validez y tratamiento (M=50, DE=10)',
          scales: [
            // Validity
            { id: 'ICN', name: 'Inconsistencia (ICN)', category: 'Validez' },
            { id: 'INF', name: 'Infrecuencia (INF)', category: 'Validez' },
            { id: 'NIM', name: 'Impresión Negativa (NIM)', category: 'Validez' },
            { id: 'PIM', name: 'Impresión Positiva (PIM)', category: 'Validez' },
            // Clinical
            { id: 'SOM', name: 'Quejas Somáticas (SOM)', category: 'Clínicas' },
            { id: 'ANX', name: 'Ansiedad (ANX)', category: 'Clínicas' },
            { id: 'ARD', name: 'Trastornos Relacionados con Ansiedad (ARD)', category: 'Clínicas' },
            { id: 'DEP', name: 'Depresión (DEP)', category: 'Clínicas' },
            { id: 'MAN', name: 'Manía (MAN)', category: 'Clínicas' },
            { id: 'PAR', name: 'Paranoia (PAR)', category: 'Clínicas' },
            { id: 'SCZ', name: 'Esquizofrenia (SCZ)', category: 'Clínicas' },
            { id: 'BOR', name: 'Rasgos Límite (BOR)', category: 'Clínicas' },
            { id: 'ANT', name: 'Rasgos Antisociales (ANT)', category: 'Clínicas' },
            { id: 'ALC', name: 'Problemas con Alcohol (ALC)', category: 'Clínicas' },
            { id: 'DRG', name: 'Problemas con Drogas (DRG)', category: 'Clínicas' },
            // Treatment
            { id: 'AGG', name: 'Agresión (AGG)', category: 'Tratamiento' },
            { id: 'SUI', name: 'Ideaciones Suicidas (SUI)', category: 'Tratamiento' },
            { id: 'STR', name: 'Estrés (STR)', category: 'Tratamiento' },
            { id: 'NON', name: 'Falta de Apoyo Social (NON)', category: 'Tratamiento' },
            { id: 'RXR', name: 'Rechazo al Tratamiento (RXR)', category: 'Tratamiento' },
            // Interpersonal
            { id: 'DOM', name: 'Dominancia (DOM)', category: 'Interpersonal' },
            { id: 'WRM', name: 'Afabilidad (WRM)', category: 'Interpersonal' },
          ],
        };

      case 'sena':
        return {
          title: 'SENA — Sistema de Evaluación de Niños y Adolescentes',
          subtitle: 'Puntuaciones T en problemas emocionales, conductuales y recursos protectores',
          scales: [
            { id: 'depresion', name: 'Depresión', category: 'Problemas Emocionales' },
            { id: 'ansiedad', name: 'Ansiedad', category: 'Problemas Emocionales' },
            { id: 'somatizacion', name: 'Somatización', category: 'Problemas Emocionales' },
            { id: 'aislamiento', name: 'Aislamiento', category: 'Problemas Emocionales' },
            { id: 'problemas_conducta', name: 'Problemas de Conducta', category: 'Problemas Conductuales' },
            { id: 'hiperactividad', name: 'Hiperactividad / Impulsividad', category: 'Problemas Conductuales' },
            { id: 'rigidez', name: 'Rigidez / Inflexibilidad', category: 'Problemas Contextuales' },
            { id: 'autoestima', name: 'Autoestima (Recurso Protector)', category: 'Recursos Personales' },
            { id: 'integracion_social', name: 'Integración Social (Recurso Protector)', category: 'Recursos Personales' },
            { id: 'inc', name: 'Inconsistencia (INC)', category: 'Control de Respuesta' },
            { id: 'neg', name: 'Impresión Negativa (NEG)', category: 'Control de Respuesta' },
            { id: 'pos', name: 'Impresión Positiva (POS)', category: 'Control de Respuesta' },
          ],
        };

      case 'cbcl':
        return {
          title: 'CBCL — Child Behavior Checklist (ASEBA - Achenbach)',
          subtitle: 'Puntuaciones T en escalas de banda ancha, síndromes y orientadas al DSM',
          scales: [
            { id: 'internalizing', name: 'Problemas Internalizantes', category: 'Banda Ancha (Corte 60/64)' },
            { id: 'externalizing', name: 'Problemas Externalizantes', category: 'Banda Ancha (Corte 60/64)' },
            { id: 'total_problems', name: 'Total de Problemas', category: 'Banda Ancha (Corte 60/64)' },
            { id: 'anxious_depressed', name: 'Ansiedad / Depresión', category: 'Síndromes Empíricos (Corte 65/70)' },
            { id: 'withdrawn_depressed', name: 'Aislamiento / Depresión', category: 'Síndromes Empíricos (Corte 65/70)' },
            { id: 'somatic_complaints', name: 'Quejas Somáticas', category: 'Síndromes Empíricos (Corte 65/70)' },
            { id: 'social_problems', name: 'Problemas Sociales', category: 'Síndromes Empíricos (Corte 65/70)' },
            { id: 'thought_problems', name: 'Problemas de Pensamiento', category: 'Síndromes Empíricos (Corte 65/70)' },
            { id: 'attention', name: 'Problemas de Atención', category: 'Síndromes Empíricos (Corte 65/70)' },
            { id: 'rule_breaking', name: 'Conducta de Ruptura de Reglas', category: 'Síndromes Empíricos (Corte 65/70)' },
            { id: 'aggressive', name: 'Conducta Agresiva', category: 'Síndromes Empíricos (Corte 65/70)' },
            { id: 'dsm_depressive', name: 'DSM: Problemas Depresivos', category: 'Orientadas al DSM (Corte 65/70)' },
            { id: 'dsm_anxiety', name: 'DSM: Problemas de Ansiedad', category: 'Orientadas al DSM (Corte 65/70)' },
          ],
        };

      case 'byi_2':
        return {
          title: 'BYI-2 — Inventarios de Beck para Jóvenes - 2ª Edición',
          subtitle: '5 inventarios autoinformados para niños y adolescentes de 7 a 18 años',
          scales: [
            { id: 'BDI_Y', name: 'Inventario de Depresión (BDI-Y)', category: 'Inventarios Clínicos' },
            { id: 'BAI_Y', name: 'Inventario de Ansiedad (BAI-Y)', category: 'Inventarios Clínicos' },
            { id: 'BANI_Y', name: 'Inventario de Ira (BANI-Y)', category: 'Inventarios Clínicos' },
            { id: 'BDBI_Y', name: 'Conducta Disruptiva (BDBI-Y)', category: 'Inventarios Clínicos' },
            { id: 'BSCI_Y', name: 'Autoconcepto (BSCI-Y)', category: 'Autoconcepto (Invertido)' },
          ],
        };
    }
  }, [batteryId]);

  // Current values
  const currentScores: Record<string, number> = useMemo(() => {
    return data.tScores || {};
  }, [data.tScores]);

  // Answers count
  const answeredCount = Object.keys(currentScores).length;
  const totalCount = config.scales.length;
  const progressPercent = Math.min(100, Math.round((answeredCount / totalCount) * 100));

  // --------------------------------------------------------------------------
  // Calculation & Clinical Results
  // --------------------------------------------------------------------------
  const result = useMemo(() => {
    if (answeredCount === 0) return null;

    try {
      if (batteryId === 'mmpi_3') {
        return calculateMmpi3(data);
      }
      if (batteryId === 'pai') {
        return calculatePai(data);
      }
      if (batteryId === 'sena') {
        return calculateSena(data);
      }
      if (batteryId === 'cbcl') {
        return calculateCbcl(data);
      }
      if (batteryId === 'byi_2') {
        return calculateByi2(data);
      }
    } catch {
      return null;
    }
    return null;
  }, [batteryId, data, answeredCount]);

  // Type-safe extractors from result union
  const validity = useMemo(() => {
    if (!result) return null;
    if ('validity' in result && result.validity) {
      return result.validity;
    }
    return null;
  }, [result]);

  const suicideOrCriticalAlert = useMemo(() => {
    if (!result) return null;
    if ('suicideRiskAlert' in result && (result.suicideRiskAlert as any)?.triggered) {
      return { triggered: true, message: (result.suicideRiskAlert as any).message };
    }
    if ('criticalAlerts' in result && (result.criticalAlerts as any)?.hasRedFlag) {
      return { triggered: true, message: (result.criticalAlerts as any).bannerMessage || 'Alerta crítica identificada.' };
    }
    return null;
  }, [result]);

  const summaryMetrics = useMemo(() => {
    if (!result) return null;

    let elevationsCount = 0;
    if ('primaryElevations' in result && Array.isArray((result as any).primaryElevations)) {
      elevationsCount = (result as any).primaryElevations.length;
    } else if ('elevations' in result && Array.isArray((result as any).elevations)) {
      elevationsCount = (result as any).elevations.length;
    } else if ('clinicalElevations' in result && Array.isArray((result as any).clinicalElevations)) {
      elevationsCount = (result as any).clinicalElevations.length;
    }

    let classification = 'Completado';
    if ('clinicalClassification' in result && typeof (result as any).clinicalClassification === 'string') {
      classification = (result as any).clinicalClassification;
    } else if ('summary' in result && typeof (result as any).summary === 'string') {
      classification = (result as any).summary;
    }

    return {
      elevationsCount,
      classification,
    };
  }, [result]);

  // Update a single score
  const handleScoreChange = useCallback(
    (scaleId: string, val: number) => {
      setBatteryData(batteryId, (prev: any = {}) => {
        const nextTScores = { ...(prev.tScores || {}), [scaleId]: val };
        return {
          ...prev,
          tScores: nextTScores,
        };
      });
    },
    [batteryId, setBatteryData]
  );

  // Clear all scores
  const handleClear = useCallback(() => {
    setBatteryData(batteryId, { tScores: {}, omittedCount: 0 });
  }, [batteryId, setBatteryData]);

  // Load Presets
  const handleLoadSample = useCallback(
    (preset: 'typical' | 'clinical' | 'invalid') => {
      let nextState: any = { tScores: {} };

      if (batteryId === 'mmpi_3') {
        if (preset === 'typical') {
          nextState = {
            omittedCount: 0,
            tScores: {
              CRIN: 50, VRIN: 50, TRIN: 50, F: 52, Fp: 48, L: 50, K: 52,
              EID: 50, THD: 48, BXD: 50, RCd: 48, RC1: 50, RC2: 50, RC4: 52,
              RC6: 48, RC7: 50, RC8: 48, RC9: 50, SUI: 45,
            },
          };
        } else if (preset === 'clinical') {
          nextState = {
            omittedCount: 1,
            tScores: {
              CRIN: 52, VRIN: 50, TRIN: 54, F: 62, Fp: 51, L: 48, K: 45,
              EID: 78, THD: 48, BXD: 52, RCd: 76, RC2: 74, SUI: 72,
            },
          };
        } else {
          // Invalid preset
          nextState = {
            omittedCount: 2,
            tScores: { VRIN: 85, CRIN: 82, EID: 88, RCd: 85 },
          };
        }
      } else if (batteryId === 'pai') {
        if (preset === 'typical') {
          nextState = {
            omittedCount: 0,
            tScores: {
              ICN: 50, INF: 48, NIM: 50, PIM: 50, SOM: 50, ANX: 52,
              ARD: 50, DEP: 48, MAN: 50, PAR: 50, SCZ: 48, BOR: 50,
              ANT: 50, ALC: 48, DRG: 46, AGG: 50, SUI: 45, STR: 50,
              NON: 50, RXR: 50, DOM: 50, WRM: 50,
            },
          };
        } else if (preset === 'clinical') {
          nextState = {
            omittedCount: 2,
            tScores: {
              ICN: 55, INF: 52, NIM: 68, PIM: 42, SOM: 58, ANX: 74,
              ARD: 65, DEP: 82, MAN: 48, PAR: 60, SCZ: 56, BOR: 78,
              ANT: 52, ALC: 50, DRG: 46, SUI: 84, AGG: 62, STR: 70,
            },
          };
        } else {
          nextState = {
            tScores: { ICN: 60, INF: 58, NIM: 96, PIM: 32, DEP: 95 },
          };
        }
      } else if (batteryId === 'sena') {
        if (preset === 'typical') {
          nextState = {
            tScores: {
              depresion: 50, ansiedad: 48, somatizacion: 50, aislamiento: 48,
              problemas_conducta: 50, hiperactividad: 52, rigidez: 48,
              autoestima: 54, integracion_social: 52, inc: 48, neg: 50, pos: 50,
            },
            criticalItems: { suicidalIdeation: false },
          };
        } else {
          nextState = {
            tScores: {
              depresion: 76, ansiedad: 72, somatizacion: 64, problemas_conducta: 48,
              hiperactividad: 50, aislamiento: 74, rigidez: 62,
              autoestima: 28, integracion_social: 34, inc: 48, neg: 62, pos: 40,
            },
            criticalItems: { suicidalIdeation: true },
          };
        }
      } else if (batteryId === 'cbcl') {
        if (preset === 'typical') {
          nextState = {
            tScores: {
              internalizing: 50, externalizing: 48, total_problems: 49,
              anxious_depressed: 50, withdrawn_depressed: 48, somatic_complaints: 50,
              social_problems: 50, thought_problems: 48, attention: 52,
              rule_breaking: 48, aggressive: 50, dsm_depressive: 50, dsm_anxiety: 48,
            },
          };
        } else {
          nextState = {
            tScores: {
              internalizing: 72, externalizing: 62, total_problems: 68,
              anxious_depressed: 74, withdrawn_depressed: 66, somatic_complaints: 58,
              social_problems: 60, thought_problems: 52, attention: 61,
              rule_breaking: 56, aggressive: 68, dsm_depressive: 75, dsm_anxiety: 70,
            },
          };
        }
      } else if (batteryId === 'byi_2') {
        if (preset === 'typical') {
          nextState = {
            tScores: {
              BDI_Y: 48, BAI_Y: 50, BANI_Y: 48, BDBI_Y: 46, BSCI_Y: 54,
            },
            suicidalItemResponse: 0,
          };
        } else {
          nextState = {
            tScores: {
              BDI_Y: 72, BAI_Y: 64, BANI_Y: 52, BDBI_Y: 48, BSCI_Y: 36,
            },
            suicidalItemResponse: 2,
          };
        }
      }

      setBatteryData(batteryId, nextState);
    },
    [batteryId, setBatteryData]
  );

  return (
    <div className="space-y-6" data-testid={`likert-form-${batteryId}`}>
      {/* 1. Header with Presets & Progress */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {config.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">{config.subtitle}</p>
          </div>

          {/* Preset Buttons */}
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-all shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Muestra Clínica</span>
            </button>

            {['mmpi_3', 'pai'].includes(batteryId) && (
              <button
                type="button"
                onClick={() => handleLoadSample('invalid')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 transition-all shadow-xs"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Protocolo Inválido</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
              title="Borrar todas las respuestas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Counter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Progreso de cumplimentación</span>
            <span>
              {answeredCount} / {totalCount} escalas ingresadas ({progressPercent}%)
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Critical Alerts & Protocol Invalidation Banners */}
      {validity && !validity.isValidProtocol && (
        <div
          data-testid="protocol-invalid-banner"
          className="bg-red-50 border-l-4 border-red-600 p-4 rounded-xl text-red-900 flex items-start gap-3 shadow-xs"
        >
          <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-black">
              PROTOCOLO PROTOCOLARMENTE INVÁLIDO — PERFIL NO INTERPRETABLE
            </h4>
            <p className="text-xs text-red-800 mt-1">
              {validity.invalidationReason ||
                validity.invalidationReasons?.join('; ') ||
                'Se detectó una tasa excesiva de omisiones o inconsistencia extrema que anula la validez del protocolo.'}
            </p>
          </div>
        </div>
      )}

      {/* Suicide Alert Banner */}
      {suicideOrCriticalAlert?.triggered && (
        <div
          data-testid="critical-suicide-banner"
          className="bg-red-600 text-white p-4 rounded-xl flex items-start gap-3 shadow-md animate-pulse"
        >
          <AlertOctagon className="w-6 h-6 text-white shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-black tracking-wide">
              ALERTA DE SEGURIDAD CLÍNICA PRIORITARIA (RIESGO SUICIDA / ÍTEM CRÍTICO)
            </h4>
            <p className="text-xs text-red-100 mt-1 font-medium">
              {suicideOrCriticalAlert.message ||
                'Se ha identificado respuesta afirmativa en reactivos críticos de ideación suicida o autolesión.'}
            </p>
          </div>
        </div>
      )}

      {/* 3. Responsive Likert / Scale Matrix Input Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Matriz de Escalas Psicométricas
          </span>
          <span className="text-xs text-slate-500">
            Ingresa la puntuación T directa o usa los botones rápidos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/60 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                <th className="py-2.5 px-4">Escala</th>
                <th className="py-2.5 px-4">Categoría</th>
                <th className="py-2.5 px-4 text-center">Puntuación T</th>
                <th className="py-2.5 px-4 text-center">Selectores Rápidos</th>
                <th className="py-2.5 px-4">Clasificación Clínica</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {config.scales.map((scale) => {
                const val = currentScores[scale.id] ?? '';
                const numVal = typeof val === 'number' ? val : 50;

                // Determine classification level
                let qual = 'Normal';
                let qualColor = 'text-slate-600 bg-slate-100';

                if (scale.id === 'CNS' && typeof val === 'number') {
                  qual = val >= 15 ? 'Inválido (>= 15)' : 'Aceptable';
                  qualColor = val >= 15 ? 'text-red-700 bg-red-100' : 'text-emerald-700 bg-emerald-100';
                } else if (typeof val === 'number') {
                  if (scale.category === 'Recursos Personales') {
                    // SENA protective: lower is worse
                    if (val <= 30) {
                      qual = 'Clínico / Muy Bajo';
                      qualColor = 'text-red-700 bg-red-100 font-bold';
                    } else if (val <= 40) {
                      qual = 'En Riesgo / Bajo';
                      qualColor = 'text-amber-700 bg-amber-100 font-bold';
                    } else {
                      qual = 'Normal / Adecuado';
                      qualColor = 'text-emerald-700 bg-emerald-100';
                    }
                  } else if (scale.id === 'BSCI_Y') {
                    // BYI-2 Self-concept inverted
                    if (val < 40) {
                      qual = 'Muy Inferior al Promedio';
                      qualColor = 'text-red-700 bg-red-100 font-bold';
                    } else if (val < 45) {
                      qual = 'Inferior al Promedio';
                      qualColor = 'text-amber-700 bg-amber-100';
                    } else {
                      qual = 'Promedio';
                      qualColor = 'text-emerald-700 bg-emerald-100';
                    }
                  } else if (val >= 80) {
                    qual = 'Marcada / Severa';
                    qualColor = 'text-red-700 bg-red-100 font-black';
                  } else if (val >= 70) {
                    qual = 'Clínicamente Significativa';
                    qualColor = 'text-red-700 bg-red-100 font-bold';
                  } else if (val >= 65) {
                    qual = 'Límite / En Riesgo';
                    qualColor = 'text-amber-700 bg-amber-100 font-bold';
                  } else if (val >= 60 && batteryId === 'cbcl' && scale.category.includes('Banda Ancha')) {
                    qual = 'Limítrofe';
                    qualColor = 'text-amber-700 bg-amber-100 font-bold';
                  } else {
                    qual = 'Normal / No significativa';
                    qualColor = 'text-slate-600 bg-slate-50';
                  }
                }

                return (
                  <tr
                    key={scale.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {scale.name}
                    </td>

                    <td className="py-2.5 px-4 text-slate-500">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100">
                        {scale.category}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="120"
                        aria-label={`Puntuación para ${scale.name}`}
                        value={val}
                        onChange={(e) => {
                          const n = parseInt(e.target.value, 10);
                          handleScoreChange(scale.id, isNaN(n) ? 0 : n);
                        }}
                        className="w-16 py-1 px-2 text-center font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        placeholder="50"
                      />
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        {[45, 50, 65, 75, 85].map((presetVal) => (
                          <button
                            key={presetVal}
                            type="button"
                            onClick={() => handleScoreChange(scale.id, presetVal)}
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-all ${
                              val === presetVal
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            T={presetVal}
                          </button>
                        ))}
                      </div>
                    </td>

                    <td className="py-2.5 px-4">
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full ${qualColor}`}
                      >
                        {qual}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Real-time Results Summary Card */}
      {result && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Resumen Interpretativo Psicométrico
            </h4>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-900/50 text-blue-200 border border-blue-700">
              Cálculo Reactivo en Tiempo Real
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
              <span className="text-slate-400 block mb-1">Validez del Protocolo:</span>
              <span
                className={`font-bold text-sm flex items-center gap-1.5 ${
                  !validity || validity.isValidProtocol ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {!validity || validity.isValidProtocol ? (
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
              <span className="text-slate-400 block mb-1">Elevaciones Clínicas:</span>
              <span className="font-bold text-white text-sm">
                {(summaryMetrics?.elevationsCount ?? 0)}{' '}
                escalas elevadas
              </span>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
              <span className="text-slate-400 block mb-1">Clasificación Global:</span>
              <span className="font-bold text-slate-100 text-sm">
                {summaryMetrics?.classification || 'Completado'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
