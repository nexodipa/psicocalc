import React from 'react';
import { BatteryType } from '../../../core';
import { BatterySelector } from './BatterySelector';
import { Printer, Calculator, FileText, Activity } from 'lucide-react';

interface AppHeaderProps {
  currentBattery: BatteryType;
  onSelectBattery: (battery: BatteryType) => void;
  activeTab: 'calculator' | 'report';
  onSelectTab: (tab: 'calculator' | 'report') => void;
  onPrint: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentBattery,
  onSelectBattery,
  activeTab,
  onSelectTab,
  onPrint,
}) => {
  return (
    <header className="app-nav no-print sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-400/30">
                <span className="font-bold text-xl tracking-tight">Ψ</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    PSICOCALC
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                    Clínico
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  Plataforma Psicométrica y Generador de Informes WISC-V / WAIS-IV
                </p>
              </div>
            </div>

            {/* Mobile battery selector */}
            <div className="md:hidden">
              <BatterySelector
                currentBattery={currentBattery}
                onSelectBattery={onSelectBattery}
              />
            </div>
          </div>

          {/* Desktop Battery Selector */}
          <div className="hidden md:flex items-center">
            <BatterySelector
              currentBattery={currentBattery}
              onSelectBattery={onSelectBattery}
            />
          </div>

          {/* View Toggles & Print Action */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200/80">
              <button
                type="button"
                onClick={() => onSelectTab('calculator')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'calculator'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calculator className="w-3.5 h-3.5 text-blue-600" />
                <span>Calculadora</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('report')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'report'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Informe Clínico</span>
              </button>
            </div>

            {/* 1-Click Print / PDF Export */}
            <button
              type="button"
              onClick={onPrint}
              aria-label="Imprimir o guardar como PDF"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 active:bg-slate-950 transition-all shadow-sm shadow-slate-900/10 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <Printer className="w-3.5 h-3.5 text-slate-200" />
              <span>Imprimir / Guardar PDF</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
