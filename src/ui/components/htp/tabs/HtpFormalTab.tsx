import React from 'react';
import { HtpFormalFeatures } from '../../../../core';
import { QualitativeChipGroup, QualitativeOption } from '../controls/QualitativeChipGroup';
import { MultiToggleCheck } from '../controls/MultiToggleCheck';

interface HtpFormalTabProps {
  formal: HtpFormalFeatures;
  onChange: (patch: Partial<HtpFormalFeatures>) => void;
}

const SIZE_OPTIONS: QualitativeOption<HtpFormalFeatures['size']>[] = [
  {
    value: 'macrography',
    label: 'Macrografía (> 2/3 lámina)',
    interpretation: 'Sentimientos expansivos, desinhibición motora, reactividad impulsiva; compensación frente a vivencias de pequeñez interna.',
    citation: 'Hammer (1958)',
  },
  {
    value: 'normal',
    label: 'Normal (1/3 - 2/3 lámina)',
    interpretation: 'Adecuado equilibrio entre energía pulsional y recursos yoicos de autocontrol; adaptabilidad ambiental normal.',
    citation: 'Buck (1948)',
  },
  {
    value: 'micrography',
    label: 'Micrografía (< 1/3 lámina)',
    interpretation: 'Inhibición afectiva, vivencias de inseguridad, retraimiento defensivo y tendencia a evitar la confrontación externa.',
    citation: 'Hammer (1958)',
  },
];

const VERTICAL_OPTIONS: QualitativeOption<HtpFormalFeatures['verticalPlacement']>[] = [
  {
    value: 'upper',
    label: 'Superior',
    interpretation: 'Predominio de la fantasía, idealización, distanciamiento de la realidad concreta o defensas intelectualizadas.',
    citation: 'Buck (1966)',
  },
  {
    value: 'center',
    label: 'Centro',
    interpretation: 'Equilibrio afectivo, anclaje en el aquí y el ahora; control defensivo si es matemáticamente exacto.',
    citation: 'Hammer (1980)',
  },
  {
    value: 'lower',
    label: 'Inferior',
    interpretation: 'Preocupación por lo concreto y fáctico, necesidad de soporte y arraigo; posibles afectos de decaimiento vital.',
    citation: 'Portuondo (1973)',
  },
];

const HORIZONTAL_OPTIONS: QualitativeOption<HtpFormalFeatures['horizontalPlacement']>[] = [
  {
    value: 'left',
    label: 'Izquierda',
    interpretation: 'Orientación hacia el pasado, apego a figuras nutricias primarias, timidez social e inhibición de la acción.',
    citation: 'Buck (1948)',
  },
  {
    value: 'center',
    label: 'Centro',
    interpretation: 'Focalización en el presente inmediato y neutralidad actitudinal frente a polaridades.',
    citation: 'Koppitz (1968)',
  },
  {
    value: 'right',
    label: 'Derecha',
    interpretation: 'Orientación teleológica hacia el futuro, extroversión, vinculación con el polo paterno/autoridad y asertividad.',
    citation: 'Hammer (1958)',
  },
];

const PRESSURE_OPTIONS: QualitativeOption<HtpFormalFeatures['strokePressure']>[] = [
  {
    value: 'heavy',
    label: 'Fuerte / Pesada',
    interpretation: 'Elevado nivel de energía pulsional, asertividad; sobrecarga tensional o agresividad latente.',
    citation: 'Hammer (1958)',
  },
  {
    value: 'normal',
    label: 'Normal / Firme',
    interpretation: 'Nivel óptimo de vitalidad psicofísica, constancia y adaptabilidad adecuada.',
    citation: 'Buck (1966)',
  },
  {
    value: 'weak',
    label: 'Débil / Tenue',
    interpretation: 'Hipovitalidad, fragilidad yoica, fatiga psíquica, timidez acusada o vacilación motora.',
    citation: 'Hammer (1980)',
  },
];

const LINE_OPTIONS: QualitativeOption<HtpFormalFeatures['lineQuality']>[] = [
  {
    value: 'curved',
    label: 'Líneas Curvas',
    interpretation: 'Flexibilidad psíquica, plasticidad adaptativa, adecuada resonancia emocional y empatía vincular.',
    citation: 'Buck (1948)',
  },
  {
    value: 'straight_rigid',
    label: 'Rectilínea Rígida',
    interpretation: 'Rigidez defensiva, obstinación, hipervigilancia y mecanismos de autocontrol forzado.',
    citation: 'Hammer (1958)',
  },
  {
    value: 'fragmented',
    label: 'Entrecortada / Discontinua',
    interpretation: 'Ansiedad difusa, inseguridad, titubeo y temor a perder el control pulsional.',
    citation: 'Koppitz (1984)',
  },
  {
    value: 'reinforced',
    label: 'Reforzada / Repasada',
    interpretation: 'Intento de reaseguro compulsivo ante la duda interna, necesidad obsesiva de delimitación.',
    citation: 'Portuondo (1973)',
  },
];

const SHADING_OPTIONS: QualitativeOption<HtpFormalFeatures['shading']>[] = [
  {
    value: 'absent',
    label: 'Ausente',
    interpretation: 'Espontaneidad expresiva sin acumulación de angustia manifiesta.',
    citation: 'Buck (1966)',
  },
  {
    value: 'moderate',
    label: 'Moderado',
    interpretation: 'Plasticidad gráfica y madurez en el enriquecimiento representativo.',
    citation: 'Hammer (1958)',
  },
  {
    value: 'excessive',
    label: 'Excesivo / Intenso',
    interpretation: 'Ansiedad focalizada e intensa, reactividad disfórica o conflicto intrapsíquico.',
    citation: 'Koppitz (1968)',
  },
];

const SYMMETRY_OPTIONS: QualitativeOption<HtpFormalFeatures['symmetry']>[] = [
  {
    value: 'balanced',
    label: 'Equilibrada',
    interpretation: 'Integración armoniosa de las polaridades internas y estabilidad psicomotriz.',
    citation: 'Buck (1948)',
  },
  {
    value: 'rigid',
    label: 'Rígida / Simétrica forzada',
    interpretation: 'Control obsesivo-compulsivo de la personalidad para contener afectos disruptivos.',
    citation: 'Hammer (1980)',
  },
  {
    value: 'asymmetric',
    label: 'Asimétrica marcada',
    interpretation: 'Labilidad psicomotora, fallas en la coordinación visoespacial o inconsistencia en la autoimagen.',
    citation: 'Koppitz (1984)',
  },
];

export const HtpFormalTab: React.FC<HtpFormalTabProps> = ({
  formal,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-900 leading-relaxed">
        <strong>Pautas Formales y Expresivas Transversales:</strong> Evalúan el estilo motriz, tono vital y defensas básicas del evaluado a través del tamaño, emplazamiento en la lámina, trazo, presión y modulación del espacio.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
          <QualitativeChipGroup
            title="Tamaño de la Producción"
            subtitle="Extensión ocupada en la lámina"
            options={SIZE_OPTIONS}
            selectedValue={formal.size}
            onChange={(val) => onChange({ size: val })}
          />

          <QualitativeChipGroup
            title="Emplazamiento Vertical"
            subtitle="Eje Y del papel"
            options={VERTICAL_OPTIONS}
            selectedValue={formal.verticalPlacement}
            onChange={(val) => onChange({ verticalPlacement: val })}
          />

          <QualitativeChipGroup
            title="Emplazamiento Horizontal"
            subtitle="Eje X del papel"
            options={HORIZONTAL_OPTIONS}
            selectedValue={formal.horizontalPlacement}
            onChange={(val) => onChange({ horizontalPlacement: val })}
          />
        </div>

        <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
          <QualitativeChipGroup
            title="Presión del Trazo"
            subtitle="Vigor y fuerza motriz"
            options={PRESSURE_OPTIONS}
            selectedValue={formal.strokePressure}
            onChange={(val) => onChange({ strokePressure: val })}
          />

          <QualitativeChipGroup
            title="Calidad de la Línea"
            subtitle="Continuidad y modulación"
            options={LINE_OPTIONS}
            selectedValue={formal.lineQuality}
            onChange={(val) => onChange({ lineQuality: val })}
          />

          <QualitativeChipGroup
            title="Sombreado Gráfico"
            subtitle="Indicador de angustia/conflicto"
            options={SHADING_OPTIONS}
            selectedValue={formal.shading}
            onChange={(val) => onChange({ shading: val })}
          />
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
        <QualitativeChipGroup
          title="Simetría y Estructuración"
          options={SYMMETRY_OPTIONS}
          selectedValue={formal.symmetry}
          onChange={(val) => onChange({ symmetry: val })}
        />

        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Indicadores Críticos y Anomalías de Alerta
          </label>
          <div className="flex flex-wrap gap-2">
            <MultiToggleCheck
              label="Borraduras Excesivas"
              checked={formal.hasExcessiveErasures}
              onChange={(checked) => onChange({ hasExcessiveErasures: checked })}
              interpretation="Autocrítica severa, perfeccionismo angustioso, insatisfacción marcada con el rendimiento."
              citation="Hammer (1958)"
              alertType="amber"
            />

            <MultiToggleCheck
              label="Transparencias Estructurales"
              checked={formal.hasTransparencies}
              onChange={(checked) => onChange({ hasTransparencies: checked })}
              interpretation="Falla transitoria en el criterio de realidad, porosidad en los límites psíquicos o confusión entre adentro y afuera."
              citation="Buck (1948)"
              alertType="rose"
            />

            <MultiToggleCheck
              label="Omisiones Estructurales Clave"
              checked={formal.hasOmissions}
              onChange={(checked) => onChange({ hasOmissions: checked })}
              interpretation="Negación defensiva deliberada, evitación fóbica o conflicto activo en el área representada."
              citation="Koppitz (1968)"
              alertType="rose"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
