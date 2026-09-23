import React from 'react';

interface SignatureBlockProps {
  examinerName: string;
  testDate: string;
}

export const SignatureBlock: React.FC<SignatureBlockProps> = ({
  examinerName,
  testDate,
}) => {
  // Format long date in Spanish, e.g. "22 de septiembre de 2026"
  const formattedDate = React.useMemo(() => {
    if (!testDate) return 'Fecha de evaluación';
    const parts = testDate.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthNum = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
      ];
      const monthName = months[monthNum - 1] || parts[1];
      return `${day} de ${monthName} de ${year}`;
    }
    return testDate;
  }, [testDate]);

  return (
    <div className="signature-block avoid-break pt-8 border-t border-slate-300 mt-8 text-xs text-slate-800">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
        {/* Left: Date and Place */}
        <div className="space-y-1">
          <p className="font-medium text-slate-600">
            Lugar y fecha de emisión:
          </p>
          <p className="font-bold text-slate-900">
            En Madrid, a {formattedDate}.
          </p>
          <p className="text-[11px] text-slate-500 pt-3 max-w-xs">
            Certificación pericial emitida conforme a los estándares de evaluación psicológica y deontológicos del Colegio Oficial de la Psicología.
          </p>
        </div>

        {/* Right: Signature line and Stamp box */}
        <div className="flex items-center gap-6">
          {/* Clinician Signature Line */}
          <div className="w-56 text-center space-y-2">
            <div className="border-b border-slate-800 h-16 flex items-end justify-center pb-1">
              <span className="font-serif italic text-slate-400 text-xs">
                [Firma Electrónica / Manuscrita]
              </span>
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">
                Fdo.: {examinerName || 'Lic. Profesional Evaluador'}
              </p>
              <p className="text-[11px] text-slate-600">
                Psicólogo/a Colegiado/a Especialista
              </p>
            </div>
          </div>

          {/* Stamp Placeholder Box */}
          <div className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-2 text-center text-[10px] text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[9px] text-slate-400">
              Sello
            </span>
            <span className="text-[8px] text-slate-400">Profesional</span>
          </div>
        </div>
      </div>
    </div>
  );
};
