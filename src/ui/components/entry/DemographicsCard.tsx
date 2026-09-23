import React from 'react';
import { BatteryType, PatientDemographics, validateAgeAndBattery } from '../../../core';
import { Lock, Unlock, Calendar, User, Stethoscope, FileQuestion, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DemographicsCardProps {
  battery: BatteryType;
  demographics: PatientDemographics;
  onUpdateDemographics: (updater: Partial<PatientDemographics>) => void;
  onToggleAnonymize: () => void;
  displayName: string;
  ageValidation: ReturnType<typeof validateAgeAndBattery>;
}

export const DemographicsCard: React.FC<DemographicsCardProps> = ({
  battery,
  demographics,
  onUpdateDemographics,
  onToggleAnonymize,
  displayName,
  ageValidation,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Datos del Evaluado y Protocolo
            </h2>
            <p className="text-xs text-slate-500">
              Filiación clínica, fechas de administración y verificación de edad normativa
            </p>
          </div>
        </div>

        {/* 1-Click Anonimizar Button */}
        <button
          type="button"
          onClick={onToggleAnonymize}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            demographics.isAnonymized
              ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
          title={
            demographics.isAnonymized
              ? 'Restaurar nombre original'
              : 'Anonimizar nombre a iniciales (cumplimiento pericial y protección de datos)'
          }
        >
          {demographics.isAnonymized ? (
            <>
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Anonimizado: {displayName}</span>
              <span className="text-[10px] bg-amber-200/80 px-1 py-0.5 rounded text-amber-900">
                Deshacer
              </span>
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5 text-slate-500" />
              <span>1-Clic Anonimizar</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Patient Name / ID */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nombre / Identificador
          </label>
          <input
            type="text"
            value={demographics.isAnonymized ? displayName : demographics.nameOrId}
            disabled={demographics.isAnonymized}
            onChange={(e) => onUpdateDemographics({ nameOrId: e.target.value })}
            placeholder="Ej. Lucas Fernández Gómez"
            className={`w-full px-3 py-1.5 text-sm rounded-lg border transition-all ${
              demographics.isAnonymized
                ? 'bg-amber-50/50 text-amber-900 border-amber-200 cursor-not-allowed font-medium'
                : 'bg-white text-slate-800 border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Fecha de Nacimiento
          </label>
          <div className="relative">
            <input
              type="date"
              value={demographics.birthDate}
              onChange={(e) => onUpdateDemographics({ birthDate: e.target.value })}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Test Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Fecha de Evaluación
          </label>
          <div className="relative">
            <input
              type="date"
              value={demographics.testDate}
              onChange={(e) => onUpdateDemographics({ testDate: e.target.value })}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Computed Exact Chronological Age */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Edad Cronológica Exacta
          </label>
          <div
            className={`px-3 py-1.5 rounded-lg border text-sm flex items-center justify-between font-medium ${
              ageValidation.isValid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-300 text-red-900'
            }`}
          >
            {ageValidation.isValid ? (
              <>
                <span className="truncate">
                  {ageValidation.years} a, {ageValidation.months} m, {ageValidation.days} d
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
              </>
            ) : (
              <>
                <span className="text-xs truncate">
                  {ageValidation.errorMessage || 'Edad no válida'}
                </span>
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 ml-1" />
              </>
            )}
          </div>
        </div>

        {/* Examiner */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Profesional Evaluador / Nº Colegiado
          </label>
          <div className="relative">
            <input
              type="text"
              value={demographics.examiner}
              onChange={(e) => onUpdateDemographics({ examiner: e.target.value })}
              placeholder="Ej. Lic. Roberto Gómez (Col. M-3918)"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Reason for evaluation */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Motivo de Consulta / Demanda Diagnóstica
          </label>
          <input
            type="text"
            value={demographics.reasonForEvaluation || ''}
            onChange={(e) => onUpdateDemographics({ reasonForEvaluation: e.target.value })}
            placeholder="Ej. Evaluación de altas capacidades / dificultades de aprendizaje"
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Age Warning Notice if Incompatible */}
      {!ageValidation.isValid && (
        <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Incompatibilidad etaria con {battery}: </span>
            {ageValidation.errorMessage}
          </div>
        </div>
      )}

      {ageValidation.isOverlappingAge && (
        <div className="mt-3 p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
          <span className="font-semibold">Nota clínica:</span>
          <span>
            El evaluado tiene 16 años (rango de superposición). Tanto WISC-V como WAIS-IV disponen de baremos estandarizados válidos para esta edad.
          </span>
        </div>
      )}
    </div>
  );
};
