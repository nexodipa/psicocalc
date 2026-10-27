import React, { useMemo, useState } from 'react';
import { useClinicalSession } from '../../context/ClinicalSessionContext';
import { TestRegistry } from '../../../core/registry/TestRegistry';
import {
  ClinicalDomainId,
  InstrumentDefinition,
  TargetAgeGroup,
} from '../../../core/registry/TestRegistryTypes';
import {
  Search,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  X,
  Filter,
  Sparkles,
  Layers,
  LayoutGrid,
  List,
  Award,
  Activity,
} from 'lucide-react';

export const CLINICAL_DOMAIN_LABELS: Record<ClinicalDomainId | 'all', string> = {
  all: 'Todos',
  intelligence_aptitudes: 'Inteligencia & Aptitudes',
  neuropsychology_attention: 'Neuropsicología & Atención',
  personality_psychopathology: 'Personalidad & Psicopatología',
  adaptive_behavior: 'Conducta Adaptativa & Desarrollo',
  child_adolescent_emotional: 'Infanto-Juvenil & Emocional',
  projective_guides: 'Guías Proyectivas',
};

export const AGE_GROUP_LABELS: Record<TargetAgeGroup | 'all', string> = {
  all: 'Todas las edades',
  child: 'Infantil (0-11)',
  adolescent: 'Adolescente (12-17)',
  adult: 'Adulto (18-64)',
  elderly: 'Mayor (65+)',
};

const DOMAIN_BADGE_COLORS: Record<ClinicalDomainId, string> = {
  intelligence_aptitudes: 'bg-blue-100 text-blue-800 border-blue-200',
  neuropsychology_attention: 'bg-amber-100 text-amber-800 border-amber-200',
  personality_psychopathology: 'bg-purple-100 text-purple-800 border-purple-200',
  adaptive_behavior: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  child_adolescent_emotional: 'bg-rose-100 text-rose-800 border-rose-200',
  projective_guides: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

const DOMAIN_TOP_ACCENT: Record<ClinicalDomainId, string> = {
  intelligence_aptitudes: 'border-t-4 border-t-blue-600',
  neuropsychology_attention: 'border-t-4 border-t-amber-500',
  personality_psychopathology: 'border-t-4 border-t-purple-600',
  adaptive_behavior: 'border-t-4 border-t-emerald-600',
  child_adolescent_emotional: 'border-t-4 border-t-rose-500',
  projective_guides: 'border-t-4 border-t-indigo-600',
};

function getScoringSystemLabel(id: string, domain: ClinicalDomainId): string {
  if (['wisc_v', 'wais_iv', 'raven_2', 'toni_4'].includes(id)) return 'CI Estándar (100±15)';
  if (id === 'ipp_r') return 'Percentil / Puntuación T';
  if (['mcmi_iv', 'maci_iv'].includes(id)) return 'Tasa Base Millon (TB 0-115)';
  if (['abas_3', 'vineland_3', 'dp_3'].includes(id)) return 'Compuesto Estándar (100±15)';
  if (id === 'd2_r') return 'Puntuación Estándar / Pc';
  if (['moca', 'mmse', 'neuropsi_breve'].includes(id)) return 'Punto de Corte Demográfico';
  if (['cumanes', 'neuro_kid', 'lole'].includes(id)) return 'Índice (100±15) & Decatipos';
  if (['sdq', 'phq_9', 'gad_7'].includes(id)) return 'Puntos de Corte Clínicos';
  if (domain === 'projective_guides') return 'Síntesis Cualitativa Pericial';
  return 'Puntuación T (M=50, DE=10)';
}

interface CatalogExplorerProps {
  onSelectInstrument?: (instrumentId: string) => void;
}

export const CatalogExplorer: React.FC<CatalogExplorerProps> = ({ onSelectInstrument }) => {
  const {
    catalogFilters,
    setCatalogFilters,
    testData,
    activeBatteryIds,
    activateBattery,
    setActiveInstrument,
    setActiveCategory,
    administered,
  } = useClinicalSession();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const { search, domain, ageBand } = catalogFilters;

  // Filter instruments dynamically
  const filteredInstruments = useMemo(() => {
    return TestRegistry.filter({
      domain: domain === 'all' ? undefined : domain,
      ageGroup: ageBand === 'all' ? undefined : ageBand,
      query: search,
    });
  }, [domain, ageBand, search]);

  const handleOpenInstrument = (instrument: InstrumentDefinition) => {
    const id = instrument.metadata.id;
    activateBattery(id);
    setActiveInstrument(id);

    // Map instrument to category for smooth display
    if (['wisc_v', 'wais_iv'].includes(id)) {
      setActiveCategory('intelligence');
    } else if (['sdq', 'phq_9', 'gad_7'].includes(id)) {
      setActiveCategory('behavior_emotion');
    } else if (id === 'moca') {
      setActiveCategory('neurocognitive');
    } else if (id === 'htp') {
      setActiveCategory('projective');
    } else {
      setActiveCategory(instrument.metadata.domain);
    }

    if (onSelectInstrument) {
      onSelectInstrument(id);
    }
  };

  // Helper to determine instrument status
  const getInstrumentStatus = (instrument: InstrumentDefinition) => {
    const id = instrument.metadata.id;
    const data = testData[id] || {};

    let isCompleted = false;
    let inProgress = false;
    let hasAlert = false;
    let alertLabel = '';

    // Check legacy vs new
    if (id === 'wisc_v') {
      isCompleted = Boolean(administered.wiscV);
      inProgress = !isCompleted && Object.keys(data.subtests || {}).length > 0;
    } else if (id === 'wais_iv') {
      isCompleted = Boolean(administered.waisIV);
      inProgress = !isCompleted && Object.keys(data.subtests || {}).length > 0;
    } else if (id === 'sdq') {
      isCompleted = Boolean(administered.sdq);
      inProgress = !isCompleted && Object.keys(data.responses || {}).length > 0;
    } else if (id === 'phq_9') {
      isCompleted = Boolean(administered.phq9);
      inProgress = !isCompleted && Object.keys(data.responses || {}).length > 0;
      if (data.responses && (data.responses[9] ?? 0) >= 1) {
        hasAlert = true;
        alertLabel = 'Ideación suicida (Ítem 9)';
      }
    } else if (id === 'gad_7') {
      isCompleted = Boolean(administered.gad7);
      inProgress = !isCompleted && Object.keys(data.responses || {}).length > 0;
    } else if (id === 'moca') {
      isCompleted = Boolean(administered.moca);
      inProgress = !isCompleted && instrument.isCompleted(data);
    } else if (id === 'htp') {
      isCompleted = Boolean(administered.htp);
      inProgress = !isCompleted && instrument.isCompleted(data);
    } else {
      try {
        isCompleted = instrument.isCompleted(data);
        if (isCompleted) {
          const res = instrument.calculate(data, {
            nameOrId: '',
            birthDate: '',
            testDate: '',
            examiner: '',
            isAnonymized: false,
          });
          if (instrument.hasActiveAlert) {
            const alertInfo = instrument.hasActiveAlert(res);
            if (alertInfo.active) {
              hasAlert = true;
              alertLabel = alertInfo.label;
            }
          }
        } else {
          const keys = Object.keys(data);
          inProgress = keys.some((k) => {
            const v = data[k];
            return (
              v !== undefined &&
              v !== null &&
              (typeof v === 'number' ? v > 0 : Object.keys(v).length > 0)
            );
          });
        }
      } catch {
        // Fallback
      }
    }

    return { isCompleted, inProgress, hasAlert, alertLabel };
  };

  const allInstruments = TestRegistry.getAll();

  return (
    <div className="space-y-6" data-testid="catalog-explorer">
      {/* 1. Executive Workstation Header & Live Search Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 bg-gradient-to-br from-blue-700 to-indigo-900 text-white rounded-xl shadow-xs">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                    Suite de instrumentos (demostración)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    v3.5 · 6 Dominios Clínicos
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                  Catálogo Universal de Pruebas Psicométricas
                </h2>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Explora, filtra y administra {allInstruments.length} baterías clínicas tipificadas con baremos normativos, psicogramas vectoriales y consolidación pericial A4.
            </p>
          </div>

          {/* Right: Telemetry Pills & View Switcher */}
          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
            <span className="text-xs font-mono tabular-nums font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
              {filteredInstruments.length} de {allInstruments.length} disponibles
            </span>

            <span className="text-xs font-mono tabular-nums font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>{activeBatteryIds.length} en sesión</span>
            </span>

            {/* Grid / Table View Toggle */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Vista de tarjetas"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Tarjetas</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Vista de matriz clínica compacta"
              >
                <List className="w-3.5 h-3.5" />
                <span>Matriz</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            role="searchbox"
            aria-label="Buscar en el catálogo"
            placeholder="Buscar por sigla (MMPI-3, SENA, TONI-4, BRIEF-A, CUMANES, MACI-IV), síntoma, edad o dominio..."
            value={search}
            onChange={(e) => setCatalogFilters({ search: e.target.value })}
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-inner"
          />
          {search && (
            <button
              type="button"
              onClick={() => setCatalogFilters({ search: '' })}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 2. Filter Chips: 6 Clinical Domains + Todos */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            <span>Áreas Clínicas:</span>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtro por área clínica">
            {(
              [
                'all',
                'intelligence_aptitudes',
                'neuropsychology_attention',
                'personality_psychopathology',
                'adaptive_behavior',
                'child_adolescent_emotional',
                'projective_guides',
              ] as (ClinicalDomainId | 'all')[]
            ).map((domId) => {
              const isSelected = domain === domId;
              const count =
                domId === 'all'
                  ? allInstruments.length
                  : TestRegistry.getByDomain(domId).length;

              return (
                <button
                  key={domId}
                  type="button"
                  onClick={() => setCatalogFilters({ domain: domId })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span>{CLINICAL_DOMAIN_LABELS[domId]}</span>
                  <span
                    className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-full font-semibold ${
                      isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 3. Age Group Segment Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Users className="w-3.5 h-3.5" />
              <span>Rango de Edad:</span>
            </span>

            {(['all', 'child', 'adolescent', 'adult', 'elderly'] as (TargetAgeGroup | 'all')[]).map(
              (group) => {
                const isSelected = ageBand === group;
                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setCatalogFilters({ ageBand: group })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                    aria-pressed={isSelected}
                  >
                    {AGE_GROUP_LABELS[group]}
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* 4. Test Card Grid or Compact Clinical Matrix Rendering */}
      {filteredInstruments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No se encontraron instrumentos para el filtro seleccionado
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Intenta cambiar los términos de búsqueda o selecciona &quot;Todos&quot; en los filtros de
            área clínica o edad.
          </p>
          <button
            type="button"
            onClick={() => setCatalogFilters({ search: '', domain: 'all', ageBand: 'all' })}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Restablecer todos los filtros
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
          data-testid="catalog-grid"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                  <th className="py-3 px-4">Sigla</th>
                  <th className="py-3 px-4">Instrumento Clínico</th>
                  <th className="py-3 px-4">Dominio</th>
                  <th className="py-3 px-4">Edad Normativa</th>
                  <th className="py-3 px-4">Métrica / Baremo</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInstruments.map((instrument) => {
                  const { metadata } = instrument;
                  const { isCompleted, inProgress, hasAlert } =
                    getInstrumentStatus(instrument);
                  return (
                    <tr
                      key={metadata.id}
                      data-testid={`catalog-card-${metadata.id}`}
                      className="hover:bg-slate-50/90 transition-colors"
                    >
                      <td className="py-3 px-4 font-black text-slate-900 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-md bg-slate-900 text-white text-[11px]">
                          {metadata.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {metadata.fullName}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            DOMAIN_BADGE_COLORS[metadata.domain]
                          }`}
                        >
                          {CLINICAL_DOMAIN_LABELS[metadata.domain]}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {metadata.ageRange.description}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {getScoringSystemLabel(metadata.id, metadata.domain)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {hasAlert ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300">
                            Alerta clínica
                          </span>
                        ) : isCompleted ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Completada
                          </span>
                        ) : inProgress ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                            En curso
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            No iniciada
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenInstrument(instrument)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-blue-700 text-white transition-all shadow-xs"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Administrar / Abrir</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          data-testid="catalog-grid"
        >
          {filteredInstruments.map((instrument) => {
            const { metadata } = instrument;
            const { isCompleted, inProgress, hasAlert, alertLabel } =
              getInstrumentStatus(instrument);
            const isActive = activeBatteryIds.includes(metadata.id);
            const scoringMetric = getScoringSystemLabel(metadata.id, metadata.domain);

            return (
              <div
                key={metadata.id}
                data-testid={`catalog-card-${metadata.id}`}
                className={`bg-white rounded-2xl p-5 border ${DOMAIN_TOP_ACCENT[metadata.domain]} transition-all flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
                  hasAlert
                    ? 'border-red-300 ring-1 ring-red-200'
                    : isCompleted
                    ? 'border-emerald-300 ring-1 ring-emerald-100'
                    : isActive
                    ? 'border-blue-300'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Card Header: Acronym Badge, Domain Tag, Status Pill */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white tracking-wider shadow-xs">
                        {metadata.name}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          DOMAIN_BADGE_COLORS[metadata.domain]
                        }`}
                      >
                        {CLINICAL_DOMAIN_LABELS[metadata.domain]}
                      </span>
                    </div>

                    {/* Status Pill */}
                    {hasAlert ? (
                      <span
                        className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300 animate-pulse shrink-0"
                        title={alertLabel}
                      >
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        <span>Alerta clínica</span>
                      </span>
                    ) : isCompleted ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Completada</span>
                      </span>
                    ) : inProgress ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 shrink-0">
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        <span>En curso</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                        No iniciada
                      </span>
                    )}
                  </div>

                  {/* Instrument Full Name */}
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug line-clamp-2">
                    {metadata.fullName}
                  </h3>

                  {/* Normative Reference Subtitle */}
                  {metadata.normReference && (
                    <p className="text-[11px] text-slate-500 mb-3 line-clamp-1 leading-relaxed">
                      Baremo: {metadata.normReference}
                    </p>
                  )}

                  {/* Metadata Specs: Age range, Estimated Time & Scoring System */}
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600 mb-3 bg-slate-50 px-2.5 py-2 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1 font-medium" title="Rango de edad normativa">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{metadata.ageRange.description}</span>
                    </div>

                    <span className="text-slate-300">·</span>

                    <div className="flex items-center gap-1 font-mono tabular-nums" title="Tiempo estimado de administración">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>~{metadata.estimatedMinutes}m</span>
                    </div>

                    <span className="text-slate-300">·</span>

                    <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-indigo-700" title="Escala normativa">
                      <Award className="w-3 h-3 text-indigo-500" />
                      <span>{scoringMetric}</span>
                    </div>
                  </div>

                  {/* Keywords Tag cloud preview */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {metadata.keywords.slice(0, 3).map((kw) => (
                      <span
                        key={kw}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600"
                      >
                        #{kw}
                      </span>
                    ))}
                    {metadata.keywords.length > 3 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{metadata.keywords.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]" title={metadata.normReference}>
                    {isActive ? 'Batería activa en sesión' : metadata.normReference || 'Lista para aplicar'}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleOpenInstrument(instrument)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 ${
                      isActive || isCompleted
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Administrar / Abrir</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
