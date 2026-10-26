import React, { useState } from 'react';
import {
  CLINICAL_VIGNETTES,
  ClinicalVignette,
  TestRegistry,
} from '../../../core';
import { useClinicalSession } from '../../context/ClinicalSessionContext';
import {
  FlaskConical,
  GraduationCap,
  FolderKanban,
  Building2,
  MessageSquareWarning,
  Play,
  FileText,
  Eye,
  EyeOff,
  CheckCircle2,
  BookmarkPlus,
  Trash2,
  FolderOpen,
  RotateCcw,
  Copy,
  ExternalLink,
  X,
  Sparkles,
  Stethoscope,
  ClipboardList,
  ChevronRight,
} from 'lucide-react';

export type SimulatorPanelTab = 'simulator' | 'sessions' | 'branding' | 'feedback' | null;

interface ClinicalSimulatorSuiteProps {
  activePanel: SimulatorPanelTab;
  onSelectPanel: (tab: SimulatorPanelTab) => void;
}

interface LocalFeedbackItem {
  id: string;
  createdAt: string;
  instrumentId: string;
  category: string;
  details: string;
}

const FEEDBACK_STORAGE_KEY = 'psicocalc_clinical_feedback_v1';

function readFeedbackLog(): LocalFeedbackItem[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = window.localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const ClinicalSimulatorSuite: React.FC<ClinicalSimulatorSuiteProps> = ({
  activePanel,
  onSelectPanel,
}) => {
  const {
    activeVignette,
    activeVignetteId,
    trainingMode,
    setTrainingMode,
    isDiagnosisRevealed,
    setIsDiagnosisRevealed,
    clinicianHypothesisNotes,
    setClinicianHypothesisNotes,
    loadClinicalVignette,
    branding,
    setBranding,
    resetBranding,
    savedSessions,
    saveCurrentSession,
    loadSavedSession,
    deleteSavedSession,
    activeInstrument,
    setActiveInstrument,
    setActiveCategory,
    setBattery,
    activateBattery,
    demographics,
  } = useClinicalSession();

  const [sessionLabelInput, setSessionLabelInput] = useState('');
  const [sessionSavedToast, setSessionSavedToast] = useState(false);

  // Feedback form state
  const [feedbackInstrument, setFeedbackInstrument] = useState<string>(activeInstrument || 'wisc_v');
  const [feedbackCategory, setFeedbackCategory] = useState<string>('Baremo / Punto de Corte');
  const [feedbackDetails, setFeedbackDetails] = useState<string>('');
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [feedbackLog, setFeedbackLog] = useState<LocalFeedbackItem[]>(() => readFeedbackLog());

  const allRegisteredTests = React.useMemo(() => TestRegistry.getAll(), []);

  const handleJumpToInstrument = (instId: string) => {
    activateBattery(instId);
    setActiveInstrument(instId);
    if (instId === 'wisc_v') {
      setBattery('WISC-V');
      setActiveCategory('intelligence');
    } else if (instId === 'wais_iv') {
      setBattery('WAIS-IV');
      setActiveCategory('intelligence');
    } else if (
      ['sdq', 'phq_9', 'gad_7', 'sena', 'cbcl', 'byi_2', 'cecad', 'iac', 'iccp'].includes(
        instId
      )
    ) {
      setActiveCategory('behavior_emotion');
    } else if (
      [
        'moca',
        'd2_r',
        'neuropsi_breve',
        'mmse',
        'brief_a',
        'cumanes',
        'neuro_kid',
        'lole',
      ].includes(instId)
    ) {
      setActiveCategory('neurocognitive');
    } else if (instId === 'htp') {
      setActiveCategory('projective');
    } else if (
      [
        'mmpi_3',
        'pai',
        'mcmi_iv',
        'mmpi_rf',
        'mmpi_a_rf',
        'bfq',
        'staxi_2',
        'lsb_50',
        'maci_iv',
      ].includes(instId)
    ) {
      setActiveCategory('personality_psychopathology');
    } else if (['abas_3', 'vineland_3', 'dp_3'].includes(instId)) {
      setActiveCategory('adaptive_behavior');
    } else if (['raven_2', 'toni_4', 'ipp_r'].includes(instId)) {
      setActiveCategory('intelligence_aptitudes');
    }
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    saveCurrentSession(sessionLabelInput);
    setSessionLabelInput('');
    setSessionSavedToast(true);
    setTimeout(() => setSessionSavedToast(false), 2500);
  };

  const buildFeedbackTicketText = () => {
    const def = TestRegistry.get(feedbackInstrument);
    const instLabel = def ? `${def.metadata.name} (${def.metadata.fullName})` : feedbackInstrument;
    return [
      `### Reporte de Ajuste / Sugerencia Clínica — Psicocalc`,
      `- **Instrumento:** ${instLabel}`,
      `- **Categoría:** ${feedbackCategory}`,
      `- **Caso Activo:** ${activeVignette ? `${activeVignette.code} (${activeVignette.title})` : demographics.nameOrId}`,
      `- **Observación Clínica / Técnica:**`,
      feedbackDetails.trim() || '(Sin descripción adicional)',
    ].join('\n');
  };

  const handleCopyAndLogFeedback = () => {
    const ticket = buildFeedbackTicketText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ticket).catch(() => {});
    }
    const newItem: LocalFeedbackItem = {
      id: `fb-${Date.now()}`,
      createdAt: new Date().toLocaleString('es-ES'),
      instrumentId: feedbackInstrument,
      category: feedbackCategory,
      details: feedbackDetails.trim() || 'Revisión general de instrumento',
    };
    const nextLog = [newItem, ...feedbackLog].slice(0, 15);
    setFeedbackLog(nextLog);
    try {
      window.localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(nextLog));
    } catch {
      // Ignore quota errors
    }
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 2800);
  };

  const githubIssueUrl = React.useMemo(() => {
    const def = TestRegistry.get(feedbackInstrument);
    const title = encodeURIComponent(
      `[Ajuste Clínico] ${def?.metadata.name || feedbackInstrument}: ${feedbackCategory}`
    );
    const body = encodeURIComponent(buildFeedbackTicketText());
    return `https://github.com/nexodipa/psicocalc/issues/new?title=${title}&body=${body}`;
  }, [feedbackInstrument, feedbackCategory, feedbackDetails, activeVignette, demographics.nameOrId]);

  return (
    <div className="space-y-4 no-print">
      {/* =================================================================== */}
      {/* 1. Expandable Professional Launch & Simulator Drawer                */}
      {/* =================================================================== */}
      {activePanel !== null && (
        <section
          aria-label="Panel de Simulador Clínico y Herramientas Profesionales"
          data-testid="clinical-simulator-drawer"
          className="bg-white rounded-2xl border border-slate-200/90 shadow-lg overflow-hidden transition-all"
        >
          {/* Drawer Header Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                  <span>Laboratorio de Simulación Clínica &amp; Kit Profesional</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                    6 Viñetas Multi-Test
                  </span>
                </h2>
                <p className="text-[11px] text-slate-300">
                  Pon a prueba los motores psicométricos con casos clínicos completos, autoevaluación docente y personalización de informes.
                </p>
              </div>
            </div>

            {/* Sub-navigation inside drawer */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => onSelectPanel('simulator')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activePanel === 'simulator'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5 text-blue-500" />
                <span>Casos Simulados (6)</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectPanel('sessions')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activePanel === 'sessions'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <FolderKanban className="w-3.5 h-3.5 text-emerald-400" />
                <span>Expedientes ({savedSessions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectPanel('branding')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activePanel === 'branding'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Membrete PDF</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectPanel('feedback')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activePanel === 'feedback'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <MessageSquareWarning className="w-3.5 h-3.5 text-rose-400" />
                <span>Reportar Ajuste</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectPanel(null)}
                aria-label="Cerrar panel de simulador"
                className="p-1.5 rounded-xl bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition-all ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* =============================================================== */}
          {/* TAB 1: CLINICAL CASE SIMULATOR (6 VIGNETTES + TRAINING MODE)     */}
          {/* =============================================================== */}
          {activePanel === 'simulator' && (
            <div className="p-5 space-y-4">
              {/* Top Academic Training Mode Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-900 text-white flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wide">
                        Modo Entrenamiento / Autoevaluación Docente
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          trainingMode
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {trainingMode ? 'ACTIVO (Diagnóstico Oculto)' : 'DESACTIVADO (Resolución Visible)'}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-900/80">
                      Actívalo para ocultar la impresión diagnóstica DSM-5-TR al cargar un caso y practicar la interpretación ciega de los psicogramas.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTrainingMode(!trainingMode)}
                  data-testid="toggle-training-mode-btn"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    trainingMode
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                      : 'bg-indigo-900 hover:bg-indigo-800 text-white shadow-xs'
                  }`}
                >
                  {trainingMode ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Mostrar Resoluciones por Defecto</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Activar Modo Entrenamiento Ciego</span>
                    </>
                  )}
                </button>
              </div>

              {/* Grid of 6 Clinical Vignettes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CLINICAL_VIGNETTES.map((vignette: ClinicalVignette) => {
                  const isCurrent = activeVignetteId === vignette.id;
                  const diffBadgeColor =
                    vignette.difficulty === 'Básico'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : vignette.difficulty === 'Intermedio'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200';

                  return (
                    <div
                      key={vignette.id}
                      data-testid={`vignette-card-${vignette.id}`}
                      className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                        isCurrent
                          ? 'bg-blue-50/50 border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-2.5">
                        {/* Top metadata badges */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-900 text-white">
                            {vignette.code}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                              {vignette.ageGroupLabel}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${diffBadgeColor}`}
                            >
                              {vignette.difficulty}
                            </span>
                          </div>
                        </div>

                        {/* Title & Patient Summary */}
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                            {vignette.title}
                          </h4>
                          <p className="text-[11px] font-semibold text-blue-800 mt-0.5">
                            {vignette.patientSummary}
                          </p>
                        </div>

                        {/* Anamnesis excerpt */}
                        <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                          {vignette.anamnesis}
                        </p>

                        {/* Administered Batteries Pills */}
                        <div className="pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Baterías Administradas ({vignette.activeBatteryIds.length}):
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {vignette.activeBatteryIds.map((bId) => {
                              const def = TestRegistry.get(bId);
                              return (
                                <span
                                  key={bId}
                                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200"
                                >
                                  {def?.metadata.name || bId.toUpperCase()}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 mt-3 border-t border-slate-200/80 flex items-center gap-2">
                        <button
                          type="button"
                          data-testid={`load-vignette-${vignette.id}`}
                          onClick={() => {
                            loadClinicalVignette(vignette.id, false);
                            onSelectPanel(null);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-blue-900 text-white transition-all shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Simular Caso</span>
                        </button>

                        <button
                          type="button"
                          data-testid={`report-vignette-${vignette.id}`}
                          onClick={() => {
                            loadClinicalVignette(vignette.id, true);
                            onSelectPanel(null);
                          }}
                          className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition-all"
                          title="Cargar caso y abrir directamente el Informe Pericial A4"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Informe A4</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 2: LOCAL SESSION HISTORY MANAGER (localStorage)             */}
          {/* =============================================================== */}
          {activePanel === 'sessions' && (
            <div className="p-5 space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                    Guardar Sesión Clínica Actual en el Navegador (LocalStorage)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Los datos se almacenan exclusivamente en tu dispositivo local sin enviarse a ningún servidor externo.
                  </p>
                </div>

                <form onSubmit={handleSaveSession} className="flex items-center gap-2 w-full md:w-auto">
                  <input
                    type="text"
                    value={sessionLabelInput}
                    onChange={(e) => setSessionLabelInput(e.target.value)}
                    placeholder={`Ej. ${demographics.nameOrId}`}
                    aria-label="Etiqueta para guardar el expediente"
                    className="flex-1 md:w-64 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                  />
                  <button
                    type="submit"
                    data-testid="save-local-session-btn"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white transition-all shrink-0 shadow-xs"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Guardar Expediente</span>
                  </button>
                </form>
              </div>

              {sessionSavedToast && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Expediente guardado correctamente en el almacenamiento local del navegador.</span>
                </div>
              )}

              {savedSessions.length === 0 ? (
                <div className="text-center py-8 bg-slate-50/60 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500">
                  No hay expedientes guardados todavía. Pulsa «Guardar Expediente» para conservar la sesión actual.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {savedSessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{sess.label}</h4>
                        <p className="text-[11px] text-slate-500">
                          Evaluado: <strong>{sess.patientName}</strong> · Batería base: {sess.primaryBattery}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Guardado: {new Date(sess.savedAt).toLocaleString('es-ES')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            loadSavedSession(sess.id);
                            onSelectPanel(null);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Cargar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSavedSession(sess.id)}
                          aria-label={`Eliminar expediente ${sess.label}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 3: INSTITUTIONAL BRANDING CUSTOMIZER                        */}
          {/* =============================================================== */}
          {activePanel === 'branding' && (
            <div className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                    Personalización del Membrete Clínico e Informe A4 (PDF)
                  </h3>
                  <p className="text-xs text-slate-600">
                    Adapta el encabezado institucional, código de expediente, ciudad y cargo profesional para la vista de impresión.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetBranding}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar por Defecto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory('report');
                      onSelectPanel(null);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Ver en Informe A4</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="branding-clinic-name"
                    className="block text-[11px] font-bold text-slate-700 uppercase mb-1"
                  >
                    Nombre del Centro / Institución
                  </label>
                  <input
                    id="branding-clinic-name"
                    type="text"
                    value={branding.clinicName}
                    onChange={(e) => setBranding({ clinicName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="branding-clinic-subtitle"
                    className="block text-[11px] font-bold text-slate-700 uppercase mb-1"
                  >
                    Subtítulo / Unidad Clínica
                  </label>
                  <input
                    id="branding-clinic-subtitle"
                    type="text"
                    value={branding.clinicSubtitle}
                    onChange={(e) => setBranding({ clinicSubtitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="branding-report-ref"
                    className="block text-[11px] font-bold text-slate-700 uppercase mb-1"
                  >
                    Nº Expediente / Protocolo
                  </label>
                  <input
                    id="branding-report-ref"
                    type="text"
                    value={branding.reportRef}
                    onChange={(e) => setBranding({ reportRef: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="branding-city"
                    className="block text-[11px] font-bold text-slate-700 uppercase mb-1"
                  >
                    Ciudad de Emisión (Pie de Firma)
                  </label>
                  <input
                    id="branding-city"
                    type="text"
                    value={branding.city}
                    onChange={(e) => setBranding({ city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="branding-role"
                    className="block text-[11px] font-bold text-slate-700 uppercase mb-1"
                  >
                    Especialidad / Cargo Profesional Bajo Firma
                  </label>
                  <input
                    id="branding-role"
                    type="text"
                    value={branding.specialistRole}
                    onChange={(e) => setBranding({ specialistRole: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 4: CLINICAL FEEDBACK & BAREMO ADJUSTMENT REPORTER           */}
          {/* =============================================================== */}
          {activePanel === 'feedback' && (
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                  Reportar Ajuste de Baremo, Punto de Corte o Sugerencia Clínica
                </h3>
                <p className="text-xs text-slate-600">
                  ¿Detectaste algún punto de corte, percentil o texto narrativo que quieras afinar tras probar un caso? Genera un ticket técnico estructurado para corregirlo al instante.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="feedback-instrument-select"
                    className="block text-[11px] font-bold text-slate-700 uppercase mb-1"
                  >
                    Instrumento Psicométrico
                  </label>
                  <select
                    id="feedback-instrument-select"
                    value={feedbackInstrument}
                    onChange={(e) => setFeedbackInstrument(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {allRegisteredTests.map((t) => (
                      <option key={t.metadata.id} value={t.metadata.id}>
                        {t.metadata.name} — {t.metadata.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="feedback-category-select"
                    className="block text-[11px] font-bold text-slate-700 uppercase mb-1"
                  >
                    Tipo de Ajuste
                  </label>
                  <select
                    id="feedback-category-select"
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Baremo / Punto de Corte">Baremo / Punto de Corte Normativo</option>
                    <option value="Narrativa Clínica">Redacción de Narrativa Clínica / Informe</option>
                    <option value="Interfaz / Gráficos SVG">Visualización / Psicograma SVG</option>
                    <option value="Sugerencia de Nueva Batería">Sugerencia de Nueva Prueba o Caso</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="feedback-details-input"
                    className="block text-[11px] font-bold text-slate-700 uppercase mb-1"
                  >
                    Descripción del Ajuste o Caso Observado
                  </label>
                  <input
                    id="feedback-details-input"
                    type="text"
                    value={feedbackDetails}
                    onChange={(e) => setFeedbackDetails(e.target.value)}
                    placeholder="Ej. Ajustar punto de corte T en escala de ansiedad..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-testid="copy-feedback-ticket-btn"
                    onClick={handleCopyAndLogFeedback}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Guardar y Copiar Ticket Clínico</span>
                  </button>

                  <a
                    href={githubIssueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition-all"
                  >
                    <span>Crear Issue en GitHub</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {copiedFeedback && (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Ticket copiado al portapapeles y registrado en tu bitácora local.
                  </span>
                )}
              </div>

              {feedbackLog.length > 0 && (
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Bitácora Local de Observaciones Registradas ({feedbackLog.length}):
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {feedbackLog.map((item) => (
                      <div
                        key={item.id}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-bold text-slate-900 uppercase">
                            [{item.instrumentId}]
                          </span>{' '}
                          <span className="font-semibold text-blue-800">{item.category}:</span>{' '}
                          <span className="text-slate-700">{item.details}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">{item.createdAt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* =================================================================== */}
      {/* 2. Active Clinical Vignette Banner (Always visible when a case is loaded) */}
      {/* =================================================================== */}
      {activeVignette && (
        <section
          aria-label="Expediente del Caso Clínico Simulado Activo"
          data-testid="active-vignette-banner"
          className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-indigo-500/30 space-y-4"
        >
          {/* Top Row: Case Title, Badges & Quick Switcher */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black uppercase bg-indigo-500 text-white">
                  {activeVignette.code} · Caso Simulado Activo
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-indigo-200">
                  {activeVignette.clinicalDomainBadge}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-emerald-300">
                  Dificultad: {activeVignette.difficulty}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                {activeVignette.title}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onSelectPanel(activePanel === 'simulator' ? null : 'simulator')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Cambiar Caso ({CLINICAL_VIGNETTES.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('report')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Ver Informe Consolidado A4</span>
              </button>
            </div>
          </div>

          {/* Second Row: 1-Click Navigation Pills for All Administered Batteries in This Case */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-indigo-300" />
              <span>Pruebas Administradas al Paciente (1-Clic):</span>
            </span>
            {activeVignette.activeBatteryIds.map((bId) => {
              const def = TestRegistry.get(bId);
              const isCurrentInst = activeInstrument === bId;
              return (
                <button
                  key={bId}
                  type="button"
                  onClick={() => handleJumpToInstrument(bId)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    isCurrentInst
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                >
                  <span>{def?.metadata.name || bId.toUpperCase()}</span>
                  <ChevronRight className="w-3 h-3 opacity-70" />
                </button>
              );
            })}
          </div>

          {/* Third Row: Anamnesis & Behavioral Observations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 block">
                Anamnesis y Motivo de Derivación
              </span>
              <p className="text-slate-200 leading-relaxed">{activeVignette.anamnesis}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 block">
                Observación Conductual Intra-Prueba
              </span>
              <p className="text-slate-200 leading-relaxed">
                {activeVignette.behavioralObservations}
              </p>
            </div>
          </div>

          {/* Fourth Row: Training Mode Hypothesis Scratchpad OR Revealed Diagnostic Synthesis */}
          <div className="pt-1">
            {trainingMode && !isDiagnosisRevealed ? (
              <div
                data-testid="training-mode-masked-box"
                className="p-4 rounded-xl bg-amber-500/15 border border-amber-400/40 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-amber-200 font-bold text-xs">
                    <GraduationCap className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>
                      Modo Entrenamiento Activo: Revisa las puntuaciones y psicogramas de las baterías superiores, redacta tu hipótesis diagnóstica y compárala con el criterio DSM-5-TR.
                    </span>
                  </div>
                  <button
                    type="button"
                    data-testid="reveal-diagnosis-btn"
                    onClick={() => setIsDiagnosisRevealed(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all shrink-0 shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Revelar Diagnóstico DSM-5-TR</span>
                  </button>
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={clinicianHypothesisNotes}
                    onChange={(e) => setClinicianHypothesisNotes(e.target.value)}
                    placeholder="Escribe aquí tu impresión diagnóstica e interpretación de fortalezas/debilidades antes de revelar la solución..."
                    aria-label="Hipótesis diagnóstica del evaluador"
                    className="w-full rounded-xl bg-slate-950/70 border border-white/20 px-3 py-2 text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div
                data-testid="vignette-diagnosis-revealed-box"
                className="p-4 rounded-xl bg-indigo-950/80 border border-indigo-400/30 space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4" />
                    <span>Síntesis Diagnóstica de Referencia (DSM-5-TR) y Hallazgos Clave</span>
                  </span>
                  {trainingMode && (
                    <button
                      type="button"
                      onClick={() => setIsDiagnosisRevealed(false)}
                      className="text-[11px] font-bold text-indigo-200 hover:text-white flex items-center gap-1"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Ocultar Diagnóstico</span>
                    </button>
                  )}
                </div>

                <p className="text-white font-semibold leading-relaxed">
                  {activeVignette.expectedDiagnosis}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-indigo-300 block mb-1">
                      Indicadores Psicométricos Convergentes:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-200">
                      {activeVignette.keyFindings.map((kf, i) => (
                        <li key={i}>{kf}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-300 block mb-1">
                      Líneas de Intervención Recomendadas:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-200">
                      {activeVignette.therapeuticRecommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
