import React from 'react';
import { PersonFeatures } from '../../../../core';
import { QualitativeChipGroup, QualitativeOption } from '../controls/QualitativeChipGroup';
import { ClinicalNotesField } from '../controls/ClinicalNotesField';

interface HtpPersonTabProps {
  person: PersonFeatures;
  onChange: (patch: Partial<PersonFeatures>) => void;
}

const HEAD_OPTIONS: QualitativeOption<PersonFeatures['head']>[] = [
  {
    value: 'proportionate',
    label: 'Proporcionada',
    interpretation: 'Autoconcepto armónico y valoración adecuada del propio cuerpo y de los recursos mentales.',
    citation: 'Buck (1948)',
  },
  {
    value: 'macrocephalic',
    label: 'Macrocefálica / Grande',
    interpretation: 'Sobrevaloración del pensamiento lógico, intelectualización defensiva o egocentrismo.',
    citation: 'Hammer (1958)',
  },
  {
    value: 'tiny',
    label: 'Pequeña',
    interpretation: 'Sentimientos de incompetencia mental, minusvalía o desvalorización del autoconcepto.',
    citation: 'Machover (1949)',
  },
];

const EXPRESSION_OPTIONS: QualitativeOption<PersonFeatures['expression']>[] = [
  {
    value: 'serene_smiling',
    label: 'Serena / Sonriente',
    interpretation: 'Buena disposición social, calidez y actitud receptiva hacia los semejantes.',
    citation: 'Buck (1966)',
  },
  {
    value: 'hostile_frowning',
    label: 'Adusta / Ceño Fruncido',
    interpretation: 'Actitud de confrontación, enfado persistente, irritabilidad o desafío a la autoridad.',
    citation: 'Hammer (1958)',
  },
  {
    value: 'flat_neutral',
    label: 'Neutra / Inexpresiva',
    interpretation: 'Aplanamiento afectivo, distanciamiento defensivo o apatía en el contacto interpersonal.',
    citation: 'Koppitz (1968)',
  },
  {
    value: 'anguished_vacant',
    label: 'Extraviada / Angustiada',
    interpretation: 'Angustia manifiesta, confusión identitaria o vivencia de desamparo psicológico.',
    citation: 'Machover (1949)',
  },
];

const EYES_OPTIONS: QualitativeOption<PersonFeatures['eyes']>[] = [
  {
    value: 'detailed_pupils',
    label: 'Detallados con Pupila',
    interpretation: 'Curiosidad sana, observación precisa del entorno y contacto visual adaptativo.',
    citation: 'Hammer (1958)',
  },
  {
    value: 'large_vigilant',
    label: 'Grandes e Hipervigilantes',
    interpretation: 'Hipervigilancia, suspicacia ante intenciones ajenas, rasgos paranoides o alerta fóbica.',
    citation: 'Machover (1949)',
  },
  {
    value: 'empty_dots',
    label: 'Puntos Vacíos / Esquemáticos',
    interpretation: 'Egocentrismo inmaduro, visión superficial del mundo social y dependencia afectiva.',
    citation: 'Koppitz (1968)',
  },
  {
    value: 'closed',
    label: 'Cerrados',
    interpretation: 'Negación voluntaria o defensiva del mundo exterior; huida hacia el mundo interno.',
    citation: 'Buck (1948)',
  },
];

const MOUTH_OPTIONS: QualitativeOption<PersonFeatures['mouth']>[] = [
  {
    value: 'open_receptive',
    label: 'Abierta / Receptiva',
    interpretation: 'Actitud de demanda afectiva, necesidad de nutrición y gratificación oral.',
    citation: 'Machover (1949)',
  },
  {
    value: 'toothed_aggressive',
    label: 'Con Dientes Expuestos',
    interpretation: 'Agresividad oral primaria, sarcasmo o disposición combativa verbal directa.',
    citation: 'Hammer (1958)',
  },
  {
    value: 'tight_line',
    label: 'Línea Recta Tensa',
    interpretation: 'Rigidez de autocontrol, inhibición de la expresividad verbal y contención emocional.',
    citation: 'Buck (1966)',
  },
  {
    value: 'slash_concave',
    label: 'Cóncava / En Hendidura',
    interpretation: 'Dependencia afectiva o demanda forzada de complacencia social.',
    citation: 'Koppitz (1984)',
  },
];

const NECK_OPTIONS: QualitativeOption<PersonFeatures['neck']>[] = [
  {
    value: 'adequate',
    label: 'Adecuado / Proporcionado',
    interpretation: 'Adecuada coordinación entre los impulsos afectivos/instintivos y el control cortical reflexivo.',
    citation: 'Buck (1948)',
  },
  {
    value: 'long_thin',
    label: 'Largo y Delgado',
    interpretation: 'Escisión entre la esfera afectivo-pulsional y la racionalización; excesivo esfuerzo inhibitorio.',
    citation: 'Hammer (1958)',
  },
  {
    value: 'absent_choked',
    label: 'Ausente / Corto',
    interpretation: 'Predominio directo de las pulsiones sin adecuado filtro intelectual; propensión a la conducta inmediata.',
    citation: 'Machover (1949)',
  },
];

const ARMS_OPTIONS: QualitativeOption<PersonFeatures['arms']>[] = [
  {
    value: 'extended_welcoming',
    label: 'Abiertos y Receptivos',
    interpretation: 'Actitud de apertura y búsqueda sincera de interacción y afecto con los semejantes.',
    citation: 'Buck (1966)',
  },
  {
    value: 'crossed_protective',
    label: 'Cruzados sobre el Pecho',
    interpretation: 'Actitud defensiva, retraimiento y necesidad de protegerse de demandas o juicios externos.',
    citation: 'Hammer (1980)',
  },
  {
    value: 'behind_back',
    label: 'Ocultos tras la Espalda',
    interpretation: 'Ocultamiento intencional, culpa, reticencia al contacto directo o timidez extrema.',
    citation: 'Machover (1949)',
  },
  {
    value: 'in_pockets',
    label: 'En los Bolsillos',
    interpretation: 'Evasión pasiva de la acción, desinterés en cooperar o introversión reservada.',
    citation: 'Koppitz (1968)',
  },
  {
    value: 'rigid_vertical',
    label: 'Pegados Rígidamente',
    interpretation: 'Rigidez postural en los vínculos sociales, temor a la espontaneidad y formalismo defensivo.',
    citation: 'Hammer (1958)',
  },
];

const HANDS_OPTIONS: QualitativeOption<PersonFeatures['hands']>[] = [
  {
    value: 'differentiated',
    label: 'Diferenciadas con Dedos',
    interpretation: 'Capacidad operativa madura, destreza y contacto social adaptativo.',
    citation: 'Buck (1948)',
  },
  {
    value: 'clenched_fists',
    label: 'Puños Cerrados',
    interpretation: 'Agresividad contenida, rebeldía reprimida y hostilidad latente.',
    citation: 'Hammer (1958)',
  },
  {
    value: 'claw_pointed',
    label: 'En Garra / Puntiagudos',
    interpretation: 'Hostilidad manifiesta, agresividad punitiva en el actuar y fallas en el control de impulsos.',
    citation: 'Machover (1949)',
  },
  {
    value: 'mittens_hidden',
    label: 'En Manopla / Difusas',
    interpretation: 'Represión de impulsos agresivos, torpeza social percibida o vivencias de culpa.',
    citation: 'Koppitz (1984)',
  },
  {
    value: 'absent',
    label: 'Ausentes / Sin Manos',
    interpretation: 'Sentimientos de incapacidad operatoria, castración funcional o desamparo social.',
    citation: 'Hammer (1980)',
  },
];

const LEGS_OPTIONS: QualitativeOption<PersonFeatures['legsFeet']>[] = [
  {
    value: 'grounded_stable',
    label: 'Firmes y Apoyadas',
    interpretation: 'Seguridad en la motilidad autónoma, firmeza en la posición social y adecuada autonomía.',
    citation: 'Buck (1966)',
  },
  {
    value: 'tense_pressed',
    label: 'Juntas y Rígidas',
    interpretation: 'Tensión psicomotora, inhibición en el avance vital o defensas rígidas ante la proximidad.',
    citation: 'Machover (1949)',
  },
  {
    value: 'tiny_shaky',
    label: 'Pequeños o Vacilantes',
    interpretation: 'Inseguridad básica en el desplazamiento vital y dependencia de soporte externo.',
    citation: 'Hammer (1958)',
  },
  {
    value: 'spread_stance',
    label: 'Separadas Desafiantes',
    interpretation: 'Actitud desafiante de reafirmación de poder y necesidad de imponer presencia física.',
    citation: 'Portuondo (1973)',
  },
  {
    value: 'absent',
    label: 'Ausentes / Sin Pies',
    interpretation: 'Carencia de cimientos de soporte vital, indefensión extrema o inmovilidad psicológica.',
    citation: 'Koppitz (1968)',
  },
];

const CLOTHING_OPTIONS: QualitativeOption<PersonFeatures['clothing']>[] = [
  {
    value: 'adequate_casual',
    label: 'Adecuada / Cotidiana',
    interpretation: 'Adaptación armónica a las convenciones y expectativas socioculturales.',
    citation: 'Buck (1948)',
  },
  {
    value: 'overdressed_formal',
    label: 'Recargada / Muy Formal',
    interpretation: 'Rigidez narcisista, necesidad imperiosa de proyectar estatus y aprobación social impecable.',
    citation: 'Hammer (1958)',
  },
  {
    value: 'underdressed_scanty',
    label: 'Escasa o En Desnudez',
    interpretation: 'Desapego de las normas sociales, exhibicionismo o regresión de los frenos inhibitorios.',
    citation: 'Machover (1949)',
  },
  {
    value: 'power_accessories',
    label: 'Accesorios de Poder / Armas',
    interpretation: 'Necesidad compensatoria de poder, afirmación fálica o defensas agresivas hipertrofiadas.',
    citation: 'Portuondo (1973)',
  },
];

export const HtpPersonTab: React.FC<HtpPersonTabProps> = ({
  person,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3 text-xs text-indigo-900 leading-relaxed">
        <strong>Lámina de la Persona:</strong> Proyecta el esquema corporal consciente, la autoimagen social, la identidad psicosexual, la vivencia de competencia motriz y los patrones de contacto interpersonal.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
          <QualitativeChipGroup
            title="Conformación Cefálica (Head)"
            subtitle="Autoconcepto y control intelectual"
            options={HEAD_OPTIONS}
            selectedValue={person.head}
            onChange={(val) => onChange({ head: val })}
          />

          <QualitativeChipGroup
            title="Expresión Facial"
            subtitle="Tono afectivo en el contacto"
            options={EXPRESSION_OPTIONS}
            selectedValue={person.expression}
            onChange={(val) => onChange({ expression: val })}
          />

          <QualitativeChipGroup
            title="Ojos (Eyes)"
            subtitle="Contacto visual y vigilancia"
            options={EYES_OPTIONS}
            selectedValue={person.eyes}
            onChange={(val) => onChange({ eyes: val })}
          />

          <QualitativeChipGroup
            title="Boca (Mouth)"
            subtitle="Expresión verbal y agresividad oral"
            options={MOUTH_OPTIONS}
            selectedValue={person.mouth}
            onChange={(val) => onChange({ mouth: val })}
          />

          <QualitativeChipGroup
            title="Cuello (Neck)"
            subtitle="Integración cortical vs pulsional"
            options={NECK_OPTIONS}
            selectedValue={person.neck}
            onChange={(val) => onChange({ neck: val })}
          />
        </div>

        <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
          <QualitativeChipGroup
            title="Brazos (Arms)"
            subtitle="Aproximación y defensas sociales"
            options={ARMS_OPTIONS}
            selectedValue={person.arms}
            onChange={(val) => onChange({ arms: val })}
          />

          <QualitativeChipGroup
            title="Manos (Hands)"
            subtitle="Órganos de acción y agresividad"
            options={HANDS_OPTIONS}
            selectedValue={person.hands}
            onChange={(val) => onChange({ hands: val })}
          />

          <QualitativeChipGroup
            title="Piernas y Pies (Legs & Feet)"
            subtitle="Soporte y autonomía motriz"
            options={LEGS_OPTIONS}
            selectedValue={person.legsFeet}
            onChange={(val) => onChange({ legsFeet: val })}
          />

          <QualitativeChipGroup
            title="Vestimenta y Accesorios"
            subtitle="Fachada social y narcisismo"
            options={CLOTHING_OPTIONS}
            selectedValue={person.clothing}
            onChange={(val) => onChange({ clothing: val })}
          />
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
        <ClinicalNotesField
          label="Observaciones Cualitativas de la Persona"
          value={person.observations}
          onChange={(val) => onChange({ observations: val })}
          placeholder="Ej: El evaluado comenzó por los pies y borró varias veces el rostro; describe que la figura tiene miedo de mirar a los demás..."
          helperText="Estas observaciones se integrarán en el Párrafo D del informe pericial formal."
        />
      </div>
    </div>
  );
};
