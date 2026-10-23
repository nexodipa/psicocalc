import React, { useCallback } from 'react';
import {
  ClinicalSessionProvider,
  useClinicalSession,
} from './ui/context/ClinicalSessionContext';
import { usePsychometrics } from './ui/hooks/usePsychometrics';
import { AppHeader } from './ui/components/layout/AppHeader';
import { MultimodalNav } from './ui/components/navigation/MultimodalNav';
import { DemographicsCard } from './ui/components/entry/DemographicsCard';
import { SubtestInputGrid } from './ui/components/entry/SubtestInputGrid';
import { ValidationBanner } from './ui/components/entry/ValidationBanner';
import { CompositeScoreCards } from './ui/components/entry/CompositeScoreCards';
import { ProfileScatterChart } from './ui/components/charts/ProfileScatterChart';
import { GaussianBellCurve } from './ui/components/charts/GaussianBellCurve';
import { ClinicalReportView } from './ui/components/report/ClinicalReportView';
import { SdqInputCard } from './ui/components/clinical/SdqInputCard';
import { Phq9InputCard } from './ui/components/clinical/Phq9InputCard';
import { Gad7InputCard } from './ui/components/clinical/Gad7InputCard';
import { MocaInputCard } from './ui/components/clinical/MocaInputCard';
import { HtpModuleContainer } from './ui/components/htp/HtpModuleContainer';
import { CatalogExplorer } from './ui/components/catalog/CatalogExplorer';
import {
  LikertMatrixInputCard,
  SpeedAccuracyInputCard,
  DomainChecklistScreeningCard,
  BaseRateMultiScaleCard,
  AdaptiveSkillDomainCard,
  Raven2InputCard,
} from './ui/components/forms';
import { FileText, ArrowRight, Printer } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeCategory,
    activeInstrument,
    setActiveCategory,
    setBattery,
    htpRecord,
    setHtpRecord,
  } = useClinicalSession();

  const {
    battery,
    demographics,
    setDemographics,
    toggleAnonymize,
    displayName,
    subtests,
    rawInputs,
    setSubtestScore,
    clearAllScores,
    loadSampleProfile,
    primaryIndices,
    cit,
    strengthsWeaknesses,
    isCompleteCit,
    ageValidation,
    invalidSubtests,
    hasInvalidScores,
    administeredSubtestCount,
  } = usePsychometrics();

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const headerActiveTab =
    activeCategory === 'report' ? 'report' : activeCategory === 'catalog' ? 'catalog' : 'calculator';

  const handleSelectHeaderTab = useCallback(
    (tab: 'calculator' | 'report' | 'catalog') => {
      if (tab === 'report') {
        setActiveCategory('report');
      } else if (tab === 'catalog') {
        setActiveCategory('catalog');
      } else {
        if (activeCategory === 'report' || activeCategory === 'catalog') {
          setActiveCategory('intelligence');
        }
      }
    },
    [activeCategory, setActiveCategory]
  );

  const isNonWechslerAptitude = ['raven_2', 'toni_4', 'ipp_r'].includes(activeInstrument);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. App Header with Battery Selector & Tab Switcher (hidden in print) */}
      <AppHeader
        currentBattery={battery}
        onSelectBattery={setBattery}
        activeTab={headerActiveTab}
        onSelectTab={handleSelectHeaderTab}
        onPrint={handlePrint}
        onToggleAnonymize={toggleAnonymize}
        isAnonymized={demographics.isAnonymized}
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <aside
          aria-label="Alcance de la demostración"
          className="mb-6 border-l-4 border-amber-600 bg-amber-50 p-4 text-sm text-slate-900 print:hidden rounded-r-xl"
        >
          <strong>Demostración técnica, no validada para uso clínico ni pericial.</strong>
          <p>
            Los nombres, fechas, credenciales y puntuaciones precargados son ejemplos sintéticos del
            programa. No introduzcas datos de pacientes. Los cálculos, interpretaciones e informes
            no deben usarse para diagnóstico ni decisiones sobre personas.
          </p>
        </aside>

        {/* Multimodal Navigation Bar */}
        <MultimodalNav onPrint={handlePrint} />

        {/* =================================================================== */}
        {/* On-screen view: Universal Catalog Explorer                         */}
        {/* =================================================================== */}
        {activeCategory === 'catalog' && (
          <div className="space-y-6 block print:hidden" data-testid="catalog-module">
            <CatalogExplorer />
          </div>
        )}

        {/* =================================================================== */}
        {/* On-screen view: Intelligence & Cognition (WISC-V / WAIS-IV)        */}
        {/* =================================================================== */}
        {(activeCategory === 'intelligence' || activeCategory === 'intelligence_aptitudes') &&
          !isNonWechslerAptitude && (
            <div className="space-y-6 block print:hidden" data-testid="intelligence-module">
              <ValidationBanner
                battery={battery}
                invalidSubtests={invalidSubtests}
                hasInvalidScores={hasInvalidScores}
                ageValidation={ageValidation}
                isCompleteCit={isCompleteCit}
                administeredSubtestCount={administeredSubtestCount}
              />

              <DemographicsCard
                battery={battery}
                demographics={demographics}
                onUpdateDemographics={setDemographics}
                onToggleAnonymize={toggleAnonymize}
                displayName={displayName}
                ageValidation={ageValidation}
              />

              <CompositeScoreCards
                battery={battery}
                cit={cit}
                primaryIndices={primaryIndices}
                isCompleteCit={isCompleteCit}
                hasInvalidScores={hasInvalidScores}
              />

              <SubtestInputGrid
                battery={battery}
                subtests={subtests}
                rawInputs={rawInputs}
                invalidSubtests={invalidSubtests}
                onSetScore={setSubtestScore}
                onClearAll={clearAllScores}
                onLoadSample={loadSampleProfile}
              />

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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

              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm no-print">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-200">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Vista de informe de demostración</h4>
                    <p className="text-xs text-blue-200">
                      Ejemplo de composición A4 con resultados y texto generado. No es un informe clínico
                      ni pericial válido.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCategory('report')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-blue-950 hover:bg-blue-50 transition-all shadow-sm"
                  >
                    <span>Ver Informe Clínico</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Nonverbal Intelligence & Vocational Views (Raven 2, TONI-4, IPP-R) */}
        {(activeCategory === 'intelligence_aptitudes' || activeCategory === 'intelligence') &&
          isNonWechslerAptitude && (
            <div className="space-y-6 block print:hidden" data-testid="raven-module">
              {activeInstrument === 'raven_2' && <Raven2InputCard instrumentId="raven_2" />}
              {activeInstrument === 'toni_4' && <Raven2InputCard instrumentId="toni_4" />}
              {activeInstrument === 'ipp_r' && <LikertMatrixInputCard batteryId="ipp_r" />}
            </div>
          )}

        {/* =================================================================== */}
        {/* On-screen view: Behavior & Emotion (SDQ, PHQ-9, GAD-7, SENA, CBCL, BYI-2, CECAD, IAC, ICCP) */}
        {/* =================================================================== */}
        {(activeCategory === 'behavior_emotion' ||
          activeCategory === 'child_adolescent_emotional') && (
          <div className="space-y-6 block print:hidden" data-testid="behavior-module">
            {activeInstrument === 'sdq' && <SdqInputCard />}
            {activeInstrument === 'phq_9' && <Phq9InputCard />}
            {activeInstrument === 'gad_7' && <Gad7InputCard />}
            {activeInstrument === 'sena' && <LikertMatrixInputCard batteryId="sena" />}
            {activeInstrument === 'cbcl' && <LikertMatrixInputCard batteryId="cbcl" />}
            {activeInstrument === 'byi_2' && <LikertMatrixInputCard batteryId="byi_2" />}
            {activeInstrument === 'cecad' && <LikertMatrixInputCard batteryId="cecad" />}
            {activeInstrument === 'iac' && <LikertMatrixInputCard batteryId="iac" />}
            {activeInstrument === 'iccp' && <LikertMatrixInputCard batteryId="iccp" />}
          </div>
        )}

        {/* =================================================================== */}
        {/* On-screen view: Neurocognitive Screening & Attention               */}
        {/* =================================================================== */}
        {(activeCategory === 'neurocognitive' ||
          activeCategory === 'neuropsychology_attention') && (
          <div className="space-y-6 block print:hidden" data-testid="neurocognitive-module">
            {activeInstrument === 'moca' && <MocaInputCard />}
            {activeInstrument === 'd2_r' && <SpeedAccuracyInputCard />}
            {activeInstrument === 'neuropsi_breve' && (
              <DomainChecklistScreeningCard instrumentId="neuropsi_breve" />
            )}
            {activeInstrument === 'mmse' && (
              <DomainChecklistScreeningCard instrumentId="mmse" />
            )}
            {activeInstrument === 'brief_a' && (
              <LikertMatrixInputCard batteryId="brief_a" />
            )}
            {activeInstrument === 'cumanes' && (
              <DomainChecklistScreeningCard instrumentId="cumanes" />
            )}
            {activeInstrument === 'neuro_kid' && (
              <DomainChecklistScreeningCard instrumentId="neuro_kid" />
            )}
            {activeInstrument === 'lole' && (
              <DomainChecklistScreeningCard instrumentId="lole" />
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* On-screen view: Personality & Psychopathology (9 Batteries)        */}
        {/* =================================================================== */}
        {activeCategory === 'personality_psychopathology' && (
          <div className="space-y-6 block print:hidden" data-testid="personality-module">
            {activeInstrument === 'mmpi_3' && <LikertMatrixInputCard batteryId="mmpi_3" />}
            {activeInstrument === 'pai' && <LikertMatrixInputCard batteryId="pai" />}
            {activeInstrument === 'mcmi_iv' && <BaseRateMultiScaleCard instrumentId="mcmi_iv" />}
            {activeInstrument === 'maci_iv' && <BaseRateMultiScaleCard instrumentId="maci_iv" />}
            {activeInstrument === 'mmpi_rf' && <LikertMatrixInputCard batteryId="mmpi_rf" />}
            {activeInstrument === 'mmpi_a_rf' && <LikertMatrixInputCard batteryId="mmpi_a_rf" />}
            {activeInstrument === 'bfq' && <LikertMatrixInputCard batteryId="bfq" />}
            {activeInstrument === 'staxi_2' && <LikertMatrixInputCard batteryId="staxi_2" />}
            {activeInstrument === 'lsb_50' && <LikertMatrixInputCard batteryId="lsb_50" />}
            {![
              'mmpi_3',
              'pai',
              'mcmi_iv',
              'maci_iv',
              'mmpi_rf',
              'mmpi_a_rf',
              'bfq',
              'staxi_2',
              'lsb_50',
            ].includes(activeInstrument) && (
              <LikertMatrixInputCard batteryId="mmpi_3" />
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* On-screen view: Adaptive Behavior & Development (ABAS-3, Vineland-3, DP-3) */}
        {/* =================================================================== */}
        {activeCategory === 'adaptive_behavior' && (
          <div className="space-y-6 block print:hidden" data-testid="adaptive-module">
            {activeInstrument === 'abas_3' && <AdaptiveSkillDomainCard batteryId="abas_3" />}
            {activeInstrument === 'vineland_3' && (
              <AdaptiveSkillDomainCard batteryId="vineland_3" />
            )}
            {activeInstrument === 'dp_3' && <AdaptiveSkillDomainCard batteryId="dp_3" />}
            {!['abas_3', 'vineland_3', 'dp_3'].includes(activeInstrument) && (
              <AdaptiveSkillDomainCard batteryId="abas_3" />
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* On-screen view: Projective Assessment (HTP)                        */}
        {/* =================================================================== */}
        {(activeCategory === 'projective' || activeCategory === 'projective_guides') && (
          <div className="space-y-6 block print:hidden" data-testid="projective-module">
            <HtpModuleContainer
              key={htpRecord.id}
              initialRecord={htpRecord}
              onRecordChange={setHtpRecord}
            />
          </div>
        )}

        {/* =================================================================== */}
        {/* On-screen view: Integrated Formal Clinical Report                  */}
        {/* =================================================================== */}
        <div className={`${activeCategory === 'report' ? 'block' : 'hidden print:block'}`}>
          <ClinicalReportView
            battery={battery}
            demographics={demographics}
            displayName={displayName}
            ageValidation={ageValidation}
            cit={cit}
            primaryIndices={primaryIndices}
            subtests={subtests}
            strengthsWeaknesses={strengthsWeaknesses}
            isCompleteCit={isCompleteCit}
          />
        </div>
      </main>

      {/* Minimal Footer (hidden in print) */}
      <footer className="app-footer no-print border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Psicocalc · Suite Psicométrica Universal (35 Pruebas)</span>
            <span>—</span>
            <span>Interfaz de puntuaciones, psicogramas vectoriales y documentos de muestra</span>
          </div>
          <div>
            <span>Usa únicamente datos sintéticos. No es un sistema de historia clínica.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ClinicalSessionProvider>
      <AppContent />
    </ClinicalSessionProvider>
  );
};

export default App;
