import React from 'react';
import {
  BatteryType,
  CompositeResult,
  PatientDemographics,
  StrengthWeaknessResult,
  SubtestId,
  validateAgeAndBattery,
} from '../../../core';
import { useOptionalClinicalSession } from '../../context/ClinicalSessionContext';
import { InstitutionalHeader } from './InstitutionalHeader';
import { DemographicsTable } from './DemographicsTable';
import { PrimaryIndicesTable } from './PrimaryIndicesTable';
import { SubtestSummaryTable } from './SubtestSummaryTable';
import { AutomatedNarrative } from './AutomatedNarrative';
import { SignatureBlock } from './SignatureBlock';
import { ProfileScatterChart } from '../charts/ProfileScatterChart';
import { GaussianBellCurve } from '../charts/GaussianBellCurve';
import { SdqProfileBarChart } from '../clinical/SdqProfileBarChart';
import { AlertOctagon, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

export interface ClinicalReportViewProps {
  battery?: BatteryType;
  demographics?: PatientDemographics;
  displayName?: string;
  ageValidation?: ReturnType<typeof validateAgeAndBattery>;
  cit?: CompositeResult | null;
  primaryIndices?: Record<string, CompositeResult | null>;
  subtests?: Partial<Record<SubtestId, number>>;
  strengthsWeaknesses?: StrengthWeaknessResult[];
  isCompleteCit?: boolean;
}

export const ClinicalReportView: React.FC<ClinicalReportViewProps> = (props) => {
  const session = useOptionalClinicalSession();

  // Resolve values prioritizing direct props, falling back to session context
  const battery = props.battery ?? session?.currentBattery ?? 'WISC-V';
  const demographics = props.demographics ?? session?.demographics ?? {
    nameOrId: 'Lucas Fernández Gómez',
    birthDate: '2016-04-08',
    testDate: '2026-09-22',
    examiner: 'Lic. Roberto Gómez',
    reasonForEvaluation: 'Evaluación del perfil neurocognitivo',
    isAnonymized: false,
  };
  const displayName = props.displayName ?? session?.displayName ?? demographics.nameOrId;
  const ageValidation =
    props.ageValidation ??
    (session
      ? battery === 'WISC-V'
        ? session.ageValidationWisc
        : session.ageValidationWais
      : validateAgeAndBattery(demographics.birthDate, demographics.testDate, battery));

  const cit = props.cit !== undefined ? props.cit : session?.cit ?? null;
  const primaryIndices = props.primaryIndices ?? session?.primaryIndices ?? {};
  const subtests = props.subtests ?? session?.subtests ?? {};
  const strengthsWeaknesses = props.strengthsWeaknesses ?? session?.strengthsWeaknesses ?? [];
  const isCompleteCit = props.isCompleteCit !== undefined ? props.isCompleteCit : session?.isCompleteCit ?? false;

  // Multi-instrument session data
  const administered = session?.administered ?? {
    wiscV: Object.keys(subtests).length > 0 && battery === 'WISC-V',
    waisIV: Object.keys(subtests).length > 0 && battery === 'WAIS-IV',
    sdq: false,
    phq9: false,
    gad7: false,
    moca: false,
    htp: false,
  };

  const sdqCalculation = session?.sdqCalculation ?? null;
  const phq9Calculation = session?.phq9Calculation ?? null;
  const isPhq9Item9AlertActive = session?.isPhq9Item9AlertActive ?? false;
  const gad7Calculation = session?.gad7Calculation ?? null;
  const mocaCalculation = session?.mocaCalculation ?? null;
  const htpReport = session?.htpReport ?? null;
  const isHtpCompleted = session?.isHtpCompleted ?? false;

  const isWechslerAdministered =
    Object.keys(subtests).length > 0 || cit !== null || isCompleteCit;

  return (
    <div
      className="max-w-4xl mx-auto my-6 bg-white border border-slate-200 shadow-xl rounded-2xl p-6 sm:p-10 page-container print:p-0 print:border-none print:shadow-none print:m-0 print:max-w-full space-y-6"
      data-testid="clinical-report-view"
    >
      {/* =================================================================== */}
      {/* 1. Institutional Header & Demographics                              */}
      {/* =================================================================== */}
      <div className="report-instrument-section avoid-break">
        <InstitutionalHeader battery={battery} />

        <DemographicsTable
          demographics={demographics}
          displayName={displayName}
          ageValidation={ageValidation}
        />
      </div>

      {/* =================================================================== */}
      {/* 2. Wechsler Intelligence Battery (WISC-V / WAIS-IV)                */}
      {/* =================================================================== */}
      {isWechslerAdministered && (
        <div className="report-instrument-section space-y-6" data-testid="report-wechsler-section">
          {/* Composite indices table & charts */}
          <div className="avoid-break">
            <PrimaryIndicesTable
              battery={battery}
              cit={cit}
              primaryIndices={primaryIndices}
              isCompleteCit={isCompleteCit}
            />

            {/* Embedded Pure Vector SVG Charts */}
            <div className="avoid-break space-y-4 my-6">
              <ProfileScatterChart
                battery={battery}
                subtests={subtests}
                strengthsWeaknesses={strengthsWeaknesses}
              />

              <GaussianBellCurve
                battery={battery}
                cit={cit}
                primaryIndices={primaryIndices}
                isCompleteCit={isCompleteCit}
              />
            </div>
          </div>

          <div className="print-page-break my-6 border-t border-slate-200 print:border-none print:m-0" />

          {/* Subtest summary & automated clinical narrative */}
          <div className="avoid-break">
            <SubtestSummaryTable
              battery={battery}
              subtests={subtests}
              strengthsWeaknesses={strengthsWeaknesses}
            />

            <AutomatedNarrative
              battery={battery}
              displayName={displayName}
              cit={cit}
              primaryIndices={primaryIndices}
              subtests={subtests}
              strengthsWeaknesses={strengthsWeaknesses}
              isCompleteCit={isCompleteCit}
            />
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. Neurocognitive Screening (MoCA)                                 */}
      {/* =================================================================== */}
      {mocaCalculation && administered.moca && (
        <div className="report-instrument-section avoid-break space-y-3 pt-4 border-t border-slate-200 print:border-slate-300" data-testid="report-moca-section">
          <h2 className="report-section text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-300 pb-1">
            V. Cribado Neurocognitivo Rápido (MoCA - Montreal Cognitive Assessment)
          </h2>

          {/* MoCA Cutoff Alert Banner */}
          {mocaCalculation.meetsClinicalCutoff ? (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-400 text-amber-950 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Alerta de Rendimiento Neurocognitivo:</strong> Puntuación inferior al punto de corte clínico estándar (&lt; 26). Sugiere presencia de Deterioro Cognitivo Leve (DCL).
                </span>
              </div>
              <span className="font-mono font-bold text-amber-900 shrink-0">
                Puntaje: {mocaCalculation.adjustedScore} / 30
              </span>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Rendimiento neurocognitivo global dentro de los límites normales esperados (≥ 26).</span>
              </div>
              <span className="font-mono font-bold text-emerald-900 shrink-0">
                Puntaje: {mocaCalculation.adjustedScore} / 30
              </span>
            </div>
          )}

          {/* MoCA Domains Table */}
          <table className="clinical-table w-full text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold">
                <th className="p-2 border border-slate-300 text-left">Dominio Neurocognitivo</th>
                <th className="p-2 border border-slate-300 text-center w-24">Puntuación</th>
                <th className="p-2 border border-slate-300 text-center w-24">Máximo</th>
                <th className="p-2 border border-slate-300 text-center w-28">% Rendimiento</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(mocaCalculation.domains).map(([id, dom]) => {
                const pct = Math.round((dom.score / dom.maxScore) * 100);
                return (
                  <tr key={id} className="border-b border-slate-200">
                    <td className="p-2 border border-slate-200 font-medium text-slate-800">{dom.name}</td>
                    <td className="p-2 border border-slate-200 text-center font-bold">{dom.score}</td>
                    <td className="p-2 border border-slate-200 text-center text-slate-500">{dom.maxScore}</td>
                    <td className="p-2 border border-slate-200 text-center font-semibold">{pct}%</td>
                  </tr>
                );
              })}
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-400">
                <td className="p-2 border border-slate-300">Puntuación Directa Total (Suma de Dominios)</td>
                <td className="p-2 border border-slate-300 text-center">{mocaCalculation.rawScore}</td>
                <td className="p-2 border border-slate-300 text-center">30</td>
                <td className="p-2 border border-slate-300 text-center">-</td>
              </tr>
              <tr className="bg-purple-50/60 text-purple-950 font-semibold">
                <td className="p-2 border border-slate-300" colSpan={2}>
                  Ajuste por Escolaridad ({mocaCalculation.educationYears} años declarados)
                </td>
                <td className="p-2 border border-slate-300 text-center" colSpan={2}>
                  {mocaCalculation.educationAdjustment === 1 ? '+1 punto (Escolaridad ≤ 12 años)' : '0 puntos (Escolaridad > 12 años)'}
                </td>
              </tr>
              <tr className="bg-indigo-50 font-black text-indigo-950 text-sm border-t-2 border-indigo-400">
                <td className="p-2 border border-slate-300">PUNTUACIÓN TOTAL AJUSTADA FINAL</td>
                <td className="p-2 border border-slate-300 text-center text-base" colSpan={2}>
                  {mocaCalculation.adjustedScore} / 30
                </td>
                <td className="p-2 border border-slate-300 text-center text-xs">
                  {mocaCalculation.classification}
                </td>
              </tr>
            </tbody>
          </table>

          <p className="text-xs text-slate-700 leading-relaxed pt-1">
            <strong>Juicio Clínico MoCA:</strong> {mocaCalculation.interpretation} {mocaCalculation.recommendation}
          </p>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. Behavioral & Socioemotional Screening (SDQ)                     */}
      {/* =================================================================== */}
      {sdqCalculation && administered.sdq && (
        <div className="report-instrument-section avoid-break space-y-3 pt-4 border-t border-slate-200 print:border-slate-300" data-testid="report-sdq-section">
          <h2 className="report-section text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-300 pb-1">
            VI. Evaluación Conductual y Socioemocional (SDQ - Cuestionario de Cualidades y Dificultades)
          </h2>

          <div className="flex items-center justify-between text-xs text-slate-600 pb-1">
            <span>
              Informante del Protocolo: <strong>{sdqCalculation.informant === 'parent' ? 'Padres / Cuidadores' : sdqCalculation.informant === 'teacher' ? 'Profesores / Escuela' : 'Autoinforme'}</strong>
            </span>
            <span>
              Total de Dificultades: <strong>{sdqCalculation.totalDifficulties.score} / 40</strong> ({sdqCalculation.totalDifficulties.classification})
            </span>
          </div>

          {/* SDQ Subscales Table */}
          <table className="clinical-table w-full text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold">
                <th className="p-2 border border-slate-300 text-left">Subescala SDQ</th>
                <th className="p-2 border border-slate-300 text-center w-24">Puntuación</th>
                <th className="p-2 border border-slate-300 text-center w-24">Máximo</th>
                <th className="p-2 border border-slate-300 text-center w-36">Clasificación Normativa</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(sdqCalculation.subscales).map((sub) => {
                const rowClass =
                  sub.classification === 'Abnormal'
                    ? 'severity-clinical'
                    : sub.classification === 'Borderline'
                    ? 'severity-borderline'
                    : 'severity-normal';

                return (
                  <tr key={sub.id} className={`border-b border-slate-200 ${rowClass}`}>
                    <td className="p-2 border border-slate-200 font-medium">
                      {sub.name} {sub.isStrengthScale && '(Escala de Fortaleza)'}
                    </td>
                    <td className="p-2 border border-slate-200 text-center font-bold">{sub.rawScore}</td>
                    <td className="p-2 border border-slate-200 text-center text-slate-500">10</td>
                    <td className="p-2 border border-slate-200 text-center font-bold">
                      {sub.classification === 'Normal' ? 'Normal' : sub.classification === 'Borderline' ? 'Limítrofe' : 'Anormal / Clínico'}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-400">
                <td className="p-2 border border-slate-300">TOTAL DE DIFICULTADES (Excluye Prosocial)</td>
                <td className="p-2 border border-slate-300 text-center text-sm">{sdqCalculation.totalDifficulties.score}</td>
                <td className="p-2 border border-slate-300 text-center">40</td>
                <td className="p-2 border border-slate-300 text-center uppercase">
                  {sdqCalculation.totalDifficulties.classification}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Embedded SDQ Profile Bar Chart */}
          <div className="my-4 avoid-break">
            <SdqProfileBarChart sdqResult={sdqCalculation} />
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. Affective Symptomatology: Depression & Anxiety (PHQ-9 & GAD-7)  */}
      {/* =================================================================== */}
      {(phq9Calculation || gad7Calculation) && (administered.phq9 || administered.gad7) && (
        <div className="report-instrument-section avoid-break space-y-3 pt-4 border-t border-slate-200 print:border-slate-300" data-testid="report-affective-section">
          <h2 className="report-section text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-300 pb-1">
            VII. Sintomatología Afectiva: Depresión y Ansiedad (PHQ-9 &amp; GAD-7)
          </h2>

          {/* Critical Suicide Risk Banner in Print / Report */}
          {isPhq9Item9AlertActive && (
            <div className="p-3 rounded-lg bg-red-100 border-2 border-red-600 text-red-950 text-xs space-y-1 print-critical-alert" data-testid="report-suicide-alert">
              <div className="flex items-center gap-2 font-black uppercase text-red-900">
                <AlertOctagon className="w-4 h-4 text-red-700" />
                <span>⚠️ Alerta Pericial Deontológica: Detección de Riesgo Autolítico (Ítem 9 del PHQ-9 ≥ 1)</span>
              </div>
              <p className="text-[11px] leading-relaxed text-red-950">
                El evaluado ha puntuado de forma afirmativa al ítem 9 de pensamientos de muerte o deseos de lastimarse. Se requiere intervención pericial prioritaria, valoración exhaustiva de la intencionalidad/letalidad del plan, movilización de la red de apoyo y activación inmediata del protocolo asistencial de seguridad vital.
              </p>
            </div>
          )}

          {/* Affective Instruments Scores Table */}
          <table className="clinical-table w-full text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold">
                <th className="p-2 border border-slate-300 text-left">Prueba / Cuestionario</th>
                <th className="p-2 border border-slate-300 text-center w-24">Puntuación</th>
                <th className="p-2 border border-slate-300 text-center w-24">Máximo</th>
                <th className="p-2 border border-slate-300 text-center w-36">Estratificación de Severidad</th>
                <th className="p-2 border border-slate-300 text-center w-36">Punto de Corte (≥ 10)</th>
              </tr>
            </thead>
            <tbody>
              {phq9Calculation && (
                <tr className="border-b border-slate-200">
                  <td className="p-2 border border-slate-200 font-medium">
                    PHQ-9 (Cuestionario de Salud del Paciente - Depresión)
                  </td>
                  <td className="p-2 border border-slate-200 text-center font-bold text-sm">
                    {phq9Calculation.totalScore}
                  </td>
                  <td className="p-2 border border-slate-200 text-center text-slate-500">27</td>
                  <td className="p-2 border border-slate-200 text-center font-bold">
                    {phq9Calculation.severity}
                  </td>
                  <td className="p-2 border border-slate-200 text-center font-semibold">
                    {phq9Calculation.meetsClinicalCutoff ? 'Superado (Clínico)' : 'No superado'}
                  </td>
                </tr>
              )}
              {gad7Calculation && (
                <tr className="border-b border-slate-200">
                  <td className="p-2 border border-slate-200 font-medium">
                    GAD-7 (Trastorno de Ansiedad Generalizada)
                  </td>
                  <td className="p-2 border border-slate-200 text-center font-bold text-sm">
                    {gad7Calculation.totalScore}
                  </td>
                  <td className="p-2 border border-slate-200 text-center text-slate-500">21</td>
                  <td className="p-2 border border-slate-200 text-center font-bold">
                    {gad7Calculation.severity}
                  </td>
                  <td className="p-2 border border-slate-200 text-center font-semibold">
                    {gad7Calculation.meetsClinicalCutoff ? 'Superado (Clínico)' : 'No superado'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {phq9Calculation && (
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong>Interpretación Depresión (PHQ-9):</strong> {phq9Calculation.interpretation} {phq9Calculation.recommendation}
              {phq9Calculation.meetsMajorDepressionCriteria && (
                <span className="block font-bold text-red-900 mt-1">
                  * El perfil de respuestas satisface los criterios algorítmicos DSM-5 para Episodio Depresivo Mayor.
                </span>
              )}
            </p>
          )}

          {gad7Calculation && (
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong>Interpretación Ansiedad (GAD-7):</strong> {gad7Calculation.interpretation} {gad7Calculation.recommendation}
            </p>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. Qualitative Projective Assessment (HTP)                         */}
      {/* =================================================================== */}
      {htpReport && (administered.htp || isHtpCompleted) && (
        <div className="report-instrument-section avoid-break space-y-3 pt-4 border-t border-slate-200 print:border-slate-300" data-testid="report-htp-section">
          <h2 className="report-section text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-300 pb-1">
            VIII. Evaluación Proyectiva Gráfica HTP (Casa - Árbol - Persona)
          </h2>

          <div className="text-xs text-slate-500 italic pb-1">
            Análisis cualitativo y gestáltico estructurado según la metodología clínica de Buck, Hammer y Koppitz.
          </div>

          <div className="space-y-3 text-xs text-slate-800 leading-relaxed">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <h4 className="font-bold text-slate-900">a) Indicadores Expresivos y Formales Transversales</h4>
              <p>{htpReport.summaryFormal}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <h4 className="font-bold text-slate-900">b) Dinámica Familiar y Área Afectiva (Casa)</h4>
              <p>{htpReport.houseAnalysis}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <h4 className="font-bold text-slate-900">c) Estructura del Yo y Estabilidad Emocional Profunda (Árbol)</h4>
              <p>{htpReport.treeAnalysis}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <h4 className="font-bold text-slate-900">d) Imagen Corporal y Relaciones Interpersonales (Persona)</h4>
              <p>{htpReport.personAnalysis}</p>
            </div>

            <div className="p-3 bg-indigo-50/70 rounded-lg border border-indigo-200 space-y-1">
              <h4 className="font-bold text-indigo-950">e) Conclusión Cualitativa Integrada</h4>
              <p className="text-indigo-950">{htpReport.integratedConclusion}</p>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 7. Signature Block                                                  */}
      {/* =================================================================== */}
      <div className="avoid-break pt-4">
        <SignatureBlock
          examinerName={demographics.examiner}
          testDate={demographics.testDate}
        />
      </div>
    </div>
  );
};
