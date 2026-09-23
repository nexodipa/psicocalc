import React, { useState, useMemo } from 'react';
import {
  HtpAssessmentRecord,
  HtpFormalFeatures,
  HouseFeatures,
  TreeFeatures,
  PersonFeatures,
  HtpBenchmarkPreset,
  INITIAL_HTP_RECORD,
  HTP_BENCHMARK_PROFILES,
  generateHtpFullReport,
} from '../../../core';
import { HtpTabNavigation, HtpSubTab } from './HtpTabNavigation';
import { HtpPresetBar } from './HtpPresetBar';
import { HtpFormalTab } from './tabs/HtpFormalTab';
import { HtpHouseTab } from './tabs/HtpHouseTab';
import { HtpTreeTab } from './tabs/HtpTreeTab';
import { HtpPersonTab } from './tabs/HtpPersonTab';
import { HtpSynthesisTab } from './tabs/HtpSynthesisTab';
import { LiveNarrativePreview } from './preview/LiveNarrativePreview';
import { BookOpen, Sparkles, Eye, Edit3 } from 'lucide-react';

interface HtpModuleContainerProps {
  initialRecord?: HtpAssessmentRecord;
  onRecordChange?: (record: HtpAssessmentRecord) => void;
}

export const HtpModuleContainer: React.FC<HtpModuleContainerProps> = ({
  initialRecord,
  onRecordChange,
}) => {
  const [record, setRecord] = useState<HtpAssessmentRecord>(
    initialRecord || INITIAL_HTP_RECORD
  );
  const [activeTab, setActiveTab] = useState<HtpSubTab>('formal');
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

  const updateRecord = (updater: (prev: HtpAssessmentRecord) => HtpAssessmentRecord) => {
    setRecord((prev) => {
      const next = updater(prev);
      if (onRecordChange) onRecordChange(next);
      return next;
    });
  };

  const handleFormalChange = (patch: Partial<HtpFormalFeatures>) => {
    updateRecord((prev) => ({
      ...prev,
      formal: { ...prev.formal, ...patch },
    }));
  };

  const handleHouseChange = (patch: Partial<HouseFeatures>) => {
    updateRecord((prev) => ({
      ...prev,
      house: { ...prev.house, ...patch },
    }));
  };

  const handleTreeChange = (patch: Partial<TreeFeatures>) => {
    updateRecord((prev) => ({
      ...prev,
      tree: { ...prev.tree, ...patch },
    }));
  };

  const handlePersonChange = (patch: Partial<PersonFeatures>) => {
    updateRecord((prev) => ({
      ...prev,
      person: { ...prev.person, ...patch },
    }));
  };

  const handleGeneralNotesChange = (notes: string) => {
    updateRecord((prev) => ({
      ...prev,
      generalClinicalNotes: notes,
    }));
  };

  const handleMetadataChange = (patch: { evaluator?: string; testDate?: string }) => {
    updateRecord((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  const handleLoadPreset = (preset: HtpBenchmarkPreset) => {
    const selectedPreset = HTP_BENCHMARK_PROFILES[preset];
    if (selectedPreset) {
      const loaded: HtpAssessmentRecord = {
        ...JSON.parse(JSON.stringify(selectedPreset)),
        id: record.id,
      };
      setRecord(loaded);
      if (onRecordChange) onRecordChange(loaded);
    }
  };

  const handleClear = () => {
    const cleared: HtpAssessmentRecord = {
      ...JSON.parse(JSON.stringify(INITIAL_HTP_RECORD)),
      id: record.id,
    };
    setRecord(cleared);
    if (onRecordChange) onRecordChange(cleared);
  };

  // Síntesis narrativa pura y determinista en tiempo real
  const report = useMemo(() => generateHtpFullReport(record), [record]);

  return (
    <div className="space-y-4">
      {/* Encabezado del Módulo con justificación deontológica */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-900 text-white rounded-xl shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Guía Clínica Cualitativa HTP (Casa-Árbol-Persona)
                </h2>
                <span className="hidden md:inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                  R2 Forense
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Protocolo estandarizado de registro cualitativo y motor de síntesis pericial según Buck, Hammer y Koppitz.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-blue-800" />
            <span>Sin puntuaciones numéricas artificiales</span>
          </div>
        </div>

        {/* Barra de Presets Benchmark */}
        <div className="mt-3">
          <HtpPresetBar onLoadPreset={handleLoadPreset} onClear={handleClear} />
        </div>
      </div>

      {/* Selector de vista móvil (Editor vs Previsualización) */}
      <div className="flex xl:hidden justify-center">
        <div className="inline-flex p-1 bg-slate-200 rounded-xl border border-slate-300">
          <button
            type="button"
            onClick={() => setMobileView('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mobileView === 'editor'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor de Indicadores</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileView('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mobileView === 'preview'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Previsualización Narrativa</span>
          </button>
        </div>
      </div>

      {/* Grid Principal: Split-Screen en pantallas grandes */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
        {/* Columna Izquierda: Pestañas de Registro Clínico */}
        <div className={`space-y-3 ${mobileView === 'preview' ? 'hidden xl:block' : 'block'}`}>
          <HtpTabNavigation activeTab={activeTab} onSelectTab={setActiveTab} />

          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 shadow-sm min-h-[500px]">
            {activeTab === 'formal' && (
              <HtpFormalTab formal={record.formal} onChange={handleFormalChange} />
            )}
            {activeTab === 'house' && (
              <HtpHouseTab house={record.house} onChange={handleHouseChange} />
            )}
            {activeTab === 'tree' && (
              <HtpTreeTab tree={record.tree} onChange={handleTreeChange} />
            )}
            {activeTab === 'person' && (
              <HtpPersonTab person={record.person} onChange={handlePersonChange} />
            )}
            {activeTab === 'synthesis' && (
              <HtpSynthesisTab
                record={record}
                report={report}
                onUpdateGeneralNotes={handleGeneralNotesChange}
                onUpdateMetadata={handleMetadataChange}
              />
            )}
          </div>
        </div>

        {/* Columna Derecha: Previsualización Reactiva del Informe Pericial */}
        <div className={`${mobileView === 'editor' ? 'hidden xl:block' : 'block'} sticky top-4`}>
          <LiveNarrativePreview report={report} />
        </div>
      </div>
    </div>
  );
};
