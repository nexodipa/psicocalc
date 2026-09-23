import React from 'react';
import {
  BatteryType,
  CompositeResult,
  StrengthWeaknessResult,
  SubtestId,
  WISC_V_SUBTESTS,
  WAIS_IV_SUBTESTS,
  formatPercentile,
} from '../../../core';

interface AutomatedNarrativeProps {
  battery: BatteryType;
  displayName: string;
  cit: CompositeResult | null;
  primaryIndices: Record<string, CompositeResult | null>;
  subtests: Partial<Record<SubtestId, number>>;
  strengthsWeaknesses: StrengthWeaknessResult[];
  isCompleteCit: boolean;
}

export const AutomatedNarrative: React.FC<AutomatedNarrativeProps> = ({
  battery,
  displayName,
  cit,
  primaryIndices,
  subtests,
  strengthsWeaknesses,
  isCompleteCit,
}) => {
  const metaRegistry = battery === 'WISC-V' ? WISC_V_SUBTESTS : WAIS_IV_SUBTESTS;

  // 1. Discrepancy analysis & CIT homogeneity
  const validIndexEntries = Object.entries(primaryIndices).filter(
    (entry): entry is [string, CompositeResult] => entry[1] !== null
  );

  let maxIndexEntry: [string, CompositeResult] | null = null;
  let minIndexEntry: [string, CompositeResult] | null = null;
  let delta = 0;
  let isHeterogeneous = false;

  if (validIndexEntries.length >= 2) {
    validIndexEntries.sort((a, b) => b[1].compositeScore - a[1].compositeScore);
    maxIndexEntry = validIndexEntries[0];
    minIndexEntry = validIndexEntries[validIndexEntries.length - 1];
    delta = maxIndexEntry[1].compositeScore - minIndexEntry[1].compositeScore;
    isHeterogeneous = delta >= 23;
  }

  // 2. Intra-individual strengths & weaknesses
  const fortalezas = strengthsWeaknesses.filter((sw) => sw.classification === 'Fortaleza');
  const debilidades = strengthsWeaknesses.filter((sw) => sw.classification === 'Debilidad');

  // Compute personal mean
  const validSubtestScores = Object.values(subtests).filter(
    (val): val is number => typeof val === 'number' && !isNaN(val) && val >= 1 && val <= 19
  );
  const meanPersonal = validSubtestScores.length > 0
    ? Math.round((validSubtestScores.reduce((a, b) => a + b, 0) / validSubtestScores.length) * 10) / 10
    : 10;

  const getSubtestName = (id: string): string => {
    const metaMap = metaRegistry as unknown as Record<string, { name: string }>;
    const meta = metaMap[id];
    return meta ? meta.name : id;
  };

  return (
    <div className="avoid-break mb-6 text-xs text-slate-800 space-y-3.5 leading-relaxed">
      <h2 className="report-section text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
        IV. Interpretación Clínica y Juicio Diagnóstico Automatizado
      </h2>

      {/* Paragraph 1: Global Cognitive Functioning & CIT Homogeneity */}
      {cit && isCompleteCit ? (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <p>
            <strong>1. Nivel de Funcionamiento Intelectual General:</strong>{' '}
            El evaluado, <strong>{displayName}</strong>, obtiene un Coeficiente Intelectual Total de{' '}
            <strong>CIT = {cit.compositeScore}</strong>, lo que corresponde al percentil{' '}
            <strong>Pc {formatPercentile(cit.percentile, cit.compositeScore)}</strong> y se sitúa cualitativamente en el rango{' '}
            <strong>{cit.qualitative}</strong>. Con un nivel de confianza del 95%, el rango en el que se ubica su verdadera puntuación se estima entre {cit.ci95.lower} y {cit.ci95.upper}.
          </p>

          {isHeterogeneous && maxIndexEntry && minIndexEntry ? (
            <p className="text-amber-950 bg-amber-50/80 p-2 rounded border border-amber-200">
              <strong>Advertencia de Heterogeneidad Clínica:</strong> Se constata una{' '}
              <strong>heterogeneidad inter-índices estadísticamente significativa</strong> (discrepancia máxima{' '}
              $\Delta = {delta}$ puntos entre el índice más alto,{' '}
              <strong>{maxIndexEntry[1].name} ({maxIndexEntry[0]} = {maxIndexEntry[1].compositeScore})</strong>, y el más bajo,{' '}
              <strong>{minIndexEntry[1].name} ({minIndexEntry[0]} = {minIndexEntry[1].compositeScore})</strong>, $p &lt; .05$). Esta acusada dispersión indica que el funcionamiento cognitivo no es uniforme, por lo que el Coeficiente Intelectual Total (CIT = {cit.compositeScore}) debe interpretarse con cautela, ya que no representa un constructo unitario. Se recomienda priorizar el análisis pormenorizado de las aptitudes específicas y valorar el Índice de Capacidad General (ICG/IAG).
            </p>
          ) : (
            <p className="text-emerald-950 bg-emerald-50/60 p-2 rounded border border-emerald-200">
              <strong>Homogeneidad del Perfil:</strong> El perfil entre los índices primarios del evaluado se muestra{' '}
              <strong>homogéneo y equilibrado</strong>, sin observarse discrepancias clínicamente significativas entre las diferentes áreas evaluadas ($\Delta = {delta}$ puntos). En consecuencia, el Coeficiente Intelectual Total (<strong>CIT = {cit.compositeScore}</strong>) constituye una estimación global <strong>fiable y unitaria</strong> de su capacidad cognitiva general.
            </p>
          )}
        </div>
      ) : (
        <p className="italic text-slate-500">
          Pendiente de completar la totalidad de subtests obligatorios para emitir el resumen global del CIT.
        </p>
      )}

      {/* Paragraph 2: Domain-by-Domain Interpretive Synthesis */}
      <div className="space-y-1.5">
        <p className="font-bold text-slate-900">
          2. Síntesis por Dominios Cognitivos Específicos:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          {primaryIndices.ICV && (
            <li>
              <strong>Comprensión Verbal (ICV = {primaryIndices.ICV.compositeScore}, Pc {formatPercentile(primaryIndices.ICV.percentile, primaryIndices.ICV.compositeScore)} — {primaryIndices.ICV.qualitative}):</strong>{' '}
              Mide razonamiento verbal, formación de conceptos, riqueza léxica y conocimientos adquiridos del entorno sociocultural. Refleja la habilidad para aplicar habilidades lingüísticas a la solución de problemas.
            </li>
          )}
          {(primaryIndices.IVE || primaryIndices.IRP) && (
            <li>
              <strong>
                {battery === 'WISC-V' ? 'Visoespacial (IVE' : 'Razonamiento Perceptivo (IRP'}{' '}
                = {(primaryIndices.IVE || primaryIndices.IRP)?.compositeScore}, Pc{' '}
                {formatPercentile(
                  (primaryIndices.IVE || primaryIndices.IRP)?.percentile ?? 50,
                  (primaryIndices.IVE || primaryIndices.IRP)?.compositeScore
                )}{' '}
                — {(primaryIndices.IVE || primaryIndices.IRP)?.qualitative}):
              </strong>{' '}
              {battery === 'WISC-V'
                ? 'Evalúa la capacidad para procesar detalles visuales, percibir relaciones espaciales y realizar construcciones bidimensionales y tridimensionales a partir de modelos geométricos.'
                : 'Evalúa razonamiento fluido no verbal, organización perceptiva, integración visomotriz y razonamiento espacial.'}
            </li>
          )}
          {primaryIndices.IRF && (
            <li>
              <strong>Razonamiento Fluido (IRF = {primaryIndices.IRF.compositeScore}, Pc {formatPercentile(primaryIndices.IRF.percentile, primaryIndices.IRF.compositeScore)} — {primaryIndices.IRF.qualitative}):</strong>{' '}
              Evalúa la capacidad para resolver problemas novedosos mediante lógica abstracta, razonamiento inductivo y deducción visual sin requerir mediación lingüística explícita.
            </li>
          )}
          {primaryIndices.IMT && (
            <li>
              <strong>Memoria de Trabajo (IMT = {primaryIndices.IMT.compositeScore}, Pc {formatPercentile(primaryIndices.IMT.percentile, primaryIndices.IMT.compositeScore)} — {primaryIndices.IMT.qualitative}):</strong>{' '}
              Refleja la atención focalizada, capacidad de retención inmediata y manipulación activa de información verbal o secuencial en la memoria operativa antes de generar una respuesta.
            </li>
          )}
          {primaryIndices.IVP && (
            <li>
              <strong>Velocidad de Procesamiento (IVP = {primaryIndices.IVP.compositeScore}, Pc {formatPercentile(primaryIndices.IVP.percentile, primaryIndices.IVP.compositeScore)} — {primaryIndices.IVP.qualitative}):</strong>{' '}
              Mide la eficiencia en el rastreo visual, discriminación perceptiva rápida y coordinación visomotora fina bajo presión de tiempo.
            </li>
          )}
        </ul>
      </div>

      {/* Paragraph 3: Intra-Individual Strengths and Weaknesses */}
      <div className="space-y-1.5">
        <p className="font-bold text-slate-900">
          3. Análisis Intraindividual de Fortalezas y Debilidades:
        </p>
        <p>
          En la comparación de cada subtest respecto a la media de rendimiento del propio evaluado ($\bar&#123;PE&#125; = {meanPersonal}$):
        </p>
        {fortalezas.length > 0 ? (
          <p>
            • Se identifican como <strong>Fortalezas Personales Significativas</strong>:{' '}
            {fortalezas
              .map((f) => `${getSubtestName(f.subtestId)} (PE = ${f.score}, dif: +${f.difference})`)
              .join(', ')}
            . Estas aptitudes destacan por encima del promedio general del sujeto, representando recursos cognitivos privilegiados para el aprendizaje y la resolución adaptativa de problemas.
          </p>
        ) : (
          <p className="text-slate-600">
            • No se registran fortalezas intraindividuales con significación estadística respecto a su media general.
          </p>
        )}

        {debilidades.length > 0 ? (
          <p>
            • Se identifican como <strong>Debilidades Personales Relativas</strong>:{' '}
            {debilidades
              .map((d) => `${getSubtestName(d.subtestId)} (PE = ${d.score}, dif: ${d.difference})`)
              .join(', ')}
            . Estas áreas reflejan una menor solidez relativa que conviene monitorizar o compensar activamente mediante apoyos psicoeducativos o ajustes ambientales.
          </p>
        ) : (
          <p className="text-slate-600">
            • No se detectan debilidades intraindividuales acusadas respecto a su media personal.
          </p>
        )}
      </div>

      {/* Paragraph 4: Clinical Recommendations */}
      <div className="space-y-1.5 pt-1">
        <p className="font-bold text-slate-900">
          4. Orientaciones y Recomendaciones Clínico-Educativas:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          {primaryIndices.IVP && primaryIndices.IVP.compositeScore < 90 && (
            <li>
              <strong>Ajustes en tiempo de ejecución:</strong> Conceder tiempo adicional en pruebas escritas y reducir la carga de copia mecanizada para no penalizar el rendimiento por limitaciones de velocidad grafomotora.
            </li>
          )}
          {primaryIndices.IMT && primaryIndices.IMT.compositeScore < 90 && (
            <li>
              <strong>Secuenciación de instrucciones:</strong> Fragmentar instrucciones complejas en pasos sencillos, apoyarse en soportes visuales y verificar la comprensión activa de la tarea para evitar saturación de la memoria operativa.
            </li>
          )}
          {((primaryIndices.IRF && primaryIndices.IRF.compositeScore >= 115) || (cit && cit.compositeScore >= 120)) && (
            <li>
              <strong>Enriquecimiento cognitivo:</strong> Ofrecer tareas de alta demanda conceptual, retos lógicos y metodologías de aprendizaje por descubrimiento que mantengan la motivación y el aprovechamiento de su elevado potencial abstracto.
            </li>
          )}
          <li>
            <strong>Devolución diagnóstica:</strong> Compartir las conclusiones de este informe con la familia y el equipo psicopedagógico para consensuar un plan de intervención coordinado.
          </li>
        </ul>
      </div>
    </div>
  );
};
