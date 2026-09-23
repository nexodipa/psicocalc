import React, { useState, useCallback } from 'react';
import { usePsychometrics } from './ui/hooks/usePsychometrics';
import { AppHeader } from './ui/components/layout/AppHeader';
import { DemographicsCard } from './ui/components/entry/DemographicsCard';
import { SubtestInputGrid } from './ui/components/entry/SubtestInputGrid';
import { ValidationBanner } from './ui/components/entry/ValidationBanner';
import { CompositeScoreCards } from './ui/components/entry/CompositeScoreCards';
import { ProfileScatterChart } from './ui/components/charts/ProfileScatterChart';
import { GaussianBellCurve } from './ui/components/charts/GaussianBellCurve';
import { ClinicalReportView } from './ui/components/report/ClinicalReportView';
import { FileText, Sparkles, Printer, ArrowRight } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'report'>('calculator');

  const {
    battery,
    setBattery,
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
    ancillaryIndices,
    discrepancies,
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. App Header with Battery Selector & Tab Switcher (hidden in print) */}
      <AppHeader
        currentBattery={battery}
        onSelectBattery={setBattery}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onPrint={handlePrint}
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* On-screen view: Calculator Tab */}
        <div className={`space-y-6 ${activeTab === 'calculator' ? 'block' : 'hidden print:hidden'}`}>
          {/* Validation Alert Banner */}
          <ValidationBanner
            battery={battery}
            invalidSubtests={invalidSubtests}
            hasInvalidScores={hasInvalidScores}
            ageValidation={ageValidation}
            isCompleteCit={isCompleteCit}
            administeredSubtestCount={administeredSubtestCount}
          />

          {/* Demographics Card */}
          <DemographicsCard
            battery={battery}
            demographics={demographics}
            onUpdateDemographics={setDemographics}
            onToggleAnonymize={toggleAnonymize}
            displayName={displayName}
            ageValidation={ageValidation}
          />

          {/* Real-Time Composite Score Metric Cards */}
          <CompositeScoreCards
            battery={battery}
            cit={cit}
            primaryIndices={primaryIndices}
            isCompleteCit={isCompleteCit}
            hasInvalidScores={hasInvalidScores}
          />

          {/* Fast Keyboard-First Subtests Input Grid */}
          <SubtestInputGrid
            battery={battery}
            subtests={subtests}
            rawInputs={rawInputs}
            invalidSubtests={invalidSubtests}
            onSetScore={setSubtestScore}
            onClearAll={clearAllScores}
            onLoadSample={loadSampleProfile}
          />

          {/* Pure React Vector SVG Charts Grid */}
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

          {/* Quick CTA to jump to Formal Clinical Report */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm no-print">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-200">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">
                  Informe Pericial y Clínico Completo Listo
                </h4>
                <p className="text-xs text-blue-200">
                  Previsualice el informe editorial formal A4 con narrativa diagnóstica automatizada y firma colegial.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('report')}
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

        {/* On-screen view: Report Tab */}
        <div className={`${activeTab === 'report' ? 'block' : 'hidden print:block'}`}>
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
            <span className="font-bold text-slate-700">Psicocalc v1.0</span>
            <span>—</span>
            <span>Motor Psicométrico WISC-V y WAIS-IV</span>
          </div>
          <div>
            <span>100% Offline y Privado — Los datos no salen de su navegador</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
