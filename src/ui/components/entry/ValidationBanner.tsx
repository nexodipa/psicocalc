import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { BatteryType, validateAgeAndBattery } from '../../../core';

interface ValidationBannerProps {
  battery: BatteryType;
  invalidSubtests: Record<string, string>;
  hasInvalidScores: boolean;
  ageValidation: ReturnType<typeof validateAgeAndBattery>;
  isCompleteCit: boolean;
  administeredSubtestCount: number;
}

export const ValidationBanner: React.FC<ValidationBannerProps> = ({
  battery,
  invalidSubtests,
  hasInvalidScores,
  ageValidation,
  isCompleteCit,
  administeredSubtestCount,
}) => {
  const invalidCount = Object.keys(invalidSubtests).length;
  const targetRequiredCount = battery === 'WISC-V' ? 7 : 10;

  if (!hasInvalidScores && ageValidation.isValid && isCompleteCit) {
    return null;
  }

  return (
    <div className="space-y-2 mb-4">
      {/* 1. Out of range / Malformed scores alert */}
      {hasInvalidScores && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm flex items-start gap-2.5 shadow-sm"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              Atención: Se han detectado {invalidCount} puntuación(es) fuera del rango psicométrico válido.
            </p>
            <p className="text-xs text-red-800">
              Las puntuaciones escalares de Wechsler deben ser valores enteros estrictamente comprendidos entre 1 y 19. El cálculo de los índices afectados y del CIT se encuentra temporalmente bloqueado para evitar reportar datos erróneos.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {Object.entries(invalidSubtests).map(([id, err]) => (
                <span
                  key={id}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-900 border border-red-300"
                >
                  {id}: {err}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Incompatible Age Alert */}
      {!ageValidation.isValid && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-2.5 shadow-sm"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">
              Discrepancia en la edad del evaluado para {battery}
            </p>
            <p className="text-xs text-amber-800">
              {ageValidation.errorMessage}
            </p>
          </div>
        </div>
      )}

      {/* 3. Incomplete CIT Warning (only if no invalid scores) */}
      {!hasInvalidScores && !isCompleteCit && administeredSubtestCount > 0 && (
        <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Protocolo en curso:</strong> Se requieren al menos {targetRequiredCount} subtests primarios obligatorios para calcular el Coeficiente Intelectual Total (CIT). Faltan subtests clave.
            </span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
            {administeredSubtestCount} / {targetRequiredCount} administrados
          </span>
        </div>
      )}
    </div>
  );
};
