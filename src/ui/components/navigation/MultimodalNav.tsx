import React from 'react';
import { useClinicalSession } from '../../context/ClinicalSessionContext';
import { ClinicalCategory, ClinicalInstrument } from '../../context/ClinicalSessionTypes';
import {
  Brain,
  Smile,
  Activity,
  Palette,
  FileText,
  AlertOctagon,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Printer,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

interface MultimodalNavProps {
  onPrint?: () => void;
}

export const MultimodalNav: React.FC<MultimodalNavProps> = ({ onPrint }) => {
  const {
    activeCategory,
    activeInstrument,
    setActiveCategory,
    setActiveInstrument,
    administered,
    isPhq9Item9AlertActive,
    isMocaAlertActive,
    demographics,
    toggleAnonymize,
    resetFullSession,
    loadDemoSession,
    setBattery,
    currentBattery,
  } = useClinicalSession();

  const categories: {
    id: ClinicalCategory;
    name: string;
    icon: React.ReactNode;
    hasCriticalAlert?: boolean;
    hasWarningAlert?: boolean;
    isCompleted?: boolean;
  }[] = [
    {
      id: 'intelligence',
      name: 'Inteligencia & Cognición',
      icon: <Brain className="w-4 h-4" />,
      isCompleted: administered.wiscV || administered.waisIV,
    },
    {
      id: 'behavior_emotion',
      name: 'Conducta & Emoción',
      icon: <Smile className="w-4 h-4" />,
      hasCriticalAlert: isPhq9Item9AlertActive,
      isCompleted: administered.sdq || administered.phq9 || administered.gad7,
    },
    {
      id: 'neurocognitive',
      name: 'Cribado Neurocognitivo',
      icon: <Activity className="w-4 h-4" />,
      hasWarningAlert: isMocaAlertActive,
      isCompleted: administered.moca,
    },
    {
      id: 'projective',
      name: 'Evaluación Proyectiva',
      icon: <Palette className="w-4 h-4" />,
      isCompleted: administered.htp,
    },
    {
      id: 'report',
      name: 'Informe Clínico Integrado',
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  const handleCategoryClick = (catId: ClinicalCategory) => {
    setActiveCategory(catId);
    if (catId === 'intelligence') {
      setActiveInstrument(currentBattery === 'WISC-V' ? 'wisc_v' : 'wais_iv');
    } else if (catId === 'behavior_emotion') {
      if (!['sdq', 'phq_9', 'gad_7'].includes(activeInstrument)) {
        setActiveInstrument('sdq');
      }
    } else if (catId === 'neurocognitive') {
      setActiveInstrument('moca');
    } else if (catId === 'projective') {
      setActiveInstrument('htp');
    }
  };

  const handleInstrumentClick = (instId: ClinicalInstrument) => {
    setActiveInstrument(instId);
    if (instId === 'wisc_v') {
      setBattery('WISC-V');
    } else if (instId === 'wais_iv') {
      setBattery('WAIS-IV');
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Está seguro de que desea reiniciar la sesión clínica? Se borrarán las respuestas no guardadas.')) {
      resetFullSession();
    }
  };

  return (
    <div className="space-y-3 no-print mb-6">
      {/* 1. Global Session Utility Bar */}
      <div className="bg-slate-900 text-white rounded-2xl px-4 py-2.5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Patient quick summary & Anonymization */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Evaluado:</span>
            <span className="text-xs font-bold text-white tracking-wide">
              {demographics.isAnonymized ? demographics.nameOrId : (demographics.nameOrId || 'Sin asignar')}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleAnonymize}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
              demographics.isAnonymized
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {demographics.isAnonymized ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Anonimizado (1-Clic)</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                <span>1-Clic Anonimizar</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Quick actions (Demo, Reset, Print) */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={loadDemoSession}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-xs"
            title="Cargar sesión con todos los instrumentos completados para demostración"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cargar Demo Multimodal</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-800 transition-all shadow-xs"
            title="Reiniciar todos los instrumentos de la sesión"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nueva Sesión</span>
          </button>

          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Primary Multimodal Category Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs">
        <nav
          className="flex flex-wrap md:flex-nowrap items-center gap-1 overflow-x-auto"
          aria-label="Categorías Clínicas Multimodales"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative shrink-0 ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>

                {/* Status Dot / Completed Badge */}
                {cat.isCompleted && !isActive && (
                  <span
                    className="w-2 h-2 rounded-full bg-emerald-500"
                    title="Instrumento administrado en la sesión"
                  />
                )}

                {/* Critical PHQ-9 Suicide Risk Flash Alert */}
                {cat.hasCriticalAlert && (
                  <span
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse"
                    title="Alerta Crítica: Ideación suicida detectada en Ítem 9 de PHQ-9"
                  >
                    <AlertOctagon className="w-3 h-3" />
                    <span>ALERTA</span>
                  </span>
                )}

                {/* MoCA Impairment Warning Alert */}
                {cat.hasWarningAlert && !cat.hasCriticalAlert && (
                  <span
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black"
                    title="Alerta Neurocognitiva: MoCA < 26"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>&lt;26</span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. Secondary Sub-tabs for Current Category */}
      {activeCategory === 'intelligence' && (
        <div className="bg-slate-100/90 rounded-xl p-1.5 border border-slate-200/80 flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase px-2">
            Batería Wechsler:
          </span>
          <div className="flex items-center gap-1 flex-1">
            <button
              type="button"
              onClick={() => handleInstrumentClick('wisc_v')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeInstrument === 'wisc_v'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>WISC-V</span>
              <span className="text-[10px] font-normal text-slate-500">(6:0 - 16:11 años)</span>
              {administered.wiscV && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleInstrumentClick('wais_iv')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeInstrument === 'wais_iv'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>WAIS-IV</span>
              <span className="text-[10px] font-normal text-slate-500">(16:0 - 90:11 años)</span>
              {administered.waisIV && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>
        </div>
      )}

      {activeCategory === 'behavior_emotion' && (
        <div className="bg-slate-100/90 rounded-xl p-1.5 border border-slate-200/80 flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase px-2">
            Instrumento:
          </span>
          <div className="flex items-center gap-1 flex-1">
            <button
              type="button"
              onClick={() => handleInstrumentClick('sdq')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeInstrument === 'sdq'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>SDQ (Cualidades y Dificultades)</span>
              {administered.sdq && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleInstrumentClick('phq_9')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeInstrument === 'phq_9'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>PHQ-9 (Depresión)</span>
              {isPhq9Item9AlertActive ? (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-red-600 text-white animate-pulse">
                  Ítem 9!
                </span>
              ) : administered.phq9 ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => handleInstrumentClick('gad_7')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeInstrument === 'gad_7'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>GAD-7 (Ansiedad)</span>
              {administered.gad7 && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>
        </div>
      )}

      {activeCategory === 'neurocognitive' && (
        <div className="bg-slate-100/90 rounded-xl p-1.5 border border-slate-200/80 flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase px-2">
            Instrumento:
          </span>
          <div className="flex items-center gap-1 flex-1">
            <button
              type="button"
              onClick={() => handleInstrumentClick('moca')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-900 shadow-xs border border-slate-200"
            >
              <span>MoCA (Evaluación Cognitiva Montreal)</span>
              {isMocaAlertActive ? (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-500 text-white">
                  &lt;26
                </span>
              ) : administered.moca ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              ) : null}
            </button>
          </div>
        </div>
      )}

      {activeCategory === 'projective' && (
        <div className="bg-slate-100/90 rounded-xl p-1.5 border border-slate-200/80 flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase px-2">
            Instrumento:
          </span>
          <div className="flex items-center gap-1 flex-1">
            <button
              type="button"
              onClick={() => handleInstrumentClick('htp')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-900 shadow-xs border border-slate-200"
            >
              <span>HTP (Test Proyectivo Casa - Árbol - Persona)</span>
              {administered.htp && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
