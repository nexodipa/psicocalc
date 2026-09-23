import React from 'react';
import { TreeFeatures } from '../../../../core';
import { QualitativeChipGroup, QualitativeOption } from '../controls/QualitativeChipGroup';
import { MultiToggleCheck } from '../controls/MultiToggleCheck';
import { ClinicalNotesField } from '../controls/ClinicalNotesField';

interface HtpTreeTabProps {
  tree: TreeFeatures;
  onChange: (patch: Partial<TreeFeatures>) => void;
}

const GROUND_OPTIONS: QualitativeOption<TreeFeatures['groundLine']>[] = [
  {
    value: 'firm_connected',
    label: 'Firme y Continua',
    interpretation: 'Adecuado contacto con la realidad fáctica, soporte adaptativo y sensación de estabilidad.',
    citation: 'Hammer (1958)',
  },
  {
    value: 'hilltop_elevated',
    label: 'Colina Elevada',
    interpretation: 'Necesidad de destacar, aislamiento protector o búsqueda compensatoria de superioridad.',
    citation: 'Buck (1948)',
  },
  {
    value: 'floating_absent',
    label: 'Ausente / Flotante',
    interpretation: 'Sentimientos de desarraigo, inseguridad básica existencial y falta de anclaje firme.',
    citation: 'Koppitz (1968)',
  },
];

const ROOTS_OPTIONS: QualitativeOption<TreeFeatures['roots']>[] = [
  {
    value: 'hidden_normal',
    label: 'Normales / Ocultas',
    interpretation: 'Control saludable de las pulsiones primitivas con anclaje implícito armónico.',
    citation: 'Hammer (1980)',
  },
  {
    value: 'exposed_prominent',
    label: 'Expuestas / Prominentes',
    interpretation: 'Intensa necesidad de aferramiento afectivo, apego dependiente a la historia primaria.',
    citation: 'Buck (1966)',
  },
  {
    value: 'claw_like',
    label: 'En Garra / Aferradas',
    interpretation: 'Aprehensión angustiosa y esfuerzo tenso por aferrarse a la seguridad afectiva o material.',
    citation: 'Portuondo (1973)',
  },
];

const TRUNK_OPTIONS: QualitativeOption<TreeFeatures['trunk']>[] = [
  {
    value: 'robust_straight',
    label: 'Robusto y Recto',
    interpretation: 'Solidez en la fuerza del Yo (Ego strength), capacidad de afrontamiento y tolerancia al estrés.',
    citation: 'Hammer (1958)',
  },
  {
    value: 'slender_fragile',
    label: 'Delgado / Frágil',
    interpretation: 'Debilidad estructural del Yo, elevada vulnerabilidad y bajo umbral ante frustraciones.',
    citation: 'Koppitz (1984)',
  },
  {
    value: 'broken_scarred',
    label: 'Quebrado o con Cicatrices',
    interpretation: 'Huellas de vivencias traumáticas en el desarrollo que han dejado secuelas emocionales activas.',
    citation: 'Hammer (1980)',
  },
  {
    value: 'constricted',
    label: 'Estrechado / Constreñido',
    interpretation: 'Represión severa de los impulsos vitales, inhibición motora o afectiva.',
    citation: 'Portuondo (1973)',
  },
  {
    value: 'bifurcated',
    label: 'Bifurcado / Doble',
    interpretation: 'Escisión o ambivalencia interna entre dos orientaciones vitales o identificaciones.',
    citation: 'Buck (1948)',
  },
];

const BRANCHES_OPTIONS: QualitativeOption<TreeFeatures['branches']>[] = [
  {
    value: 'harmonious_open',
    label: 'Armoniosas y Abiertas',
    interpretation: 'Canalización madura y expansiva de la energía hacia metas y relaciones constructivas.',
    citation: 'Buck (1966)',
  },
  {
    value: 'spiky_hostile',
    label: 'Afiladas / Espinosas',
    interpretation: 'Reactividad agresiva defensiva, hostilidad y actitud de confrontación hacia el medio.',
    citation: 'Hammer (1958)',
  },
  {
    value: 'drooping_weeping',
    label: 'Caídas / Estilo Sauce',
    interpretation: 'Afectos de abatimiento, desánimo vital, vivencias de pérdida o duelo irresuelto.',
    citation: 'Koppitz (1968)',
  },
  {
    value: 'severed_truncated',
    label: 'Cortadas / Truncadas',
    interpretation: 'Vivencias de castración psíquica, frustración severa de proyectos o daño en capacidades.',
    citation: 'Portuondo (1973)',
  },
  {
    value: 'club_like',
    label: 'En Forma de Maza',
    interpretation: 'Hostilidad contenida con potencial riesgo de descargas impulsivas bruscas.',
    citation: 'Hammer (1980)',
  },
  {
    value: 'absent',
    label: 'Ausentes / Sin Ramas',
    interpretation: 'Restricción severa en la capacidad para buscar gratificaciones en el entorno externo.',
    citation: 'Buck (1948)',
  },
];

const CROWN_OPTIONS: QualitativeOption<TreeFeatures['foliageCrown']>[] = [
  {
    value: 'cloud_lobed',
    label: 'Lobulada en Bucles',
    interpretation: 'Defensas adaptativas elásticas, empatía, amabilidad social y adecuada articulación.',
    citation: 'Hammer (1958)',
  },
  {
    value: 'sparse_bare',
    label: 'Desnuda o Empobrecida',
    interpretation: 'Vivencias de vacío interior, déficit imaginativo y empobrecimiento afectivo.',
    citation: 'Buck (1966)',
  },
  {
    value: 'flattened_compressed',
    label: 'Aplanada / Comprimida',
    interpretation: 'Vivencia de aplastamiento bajo exigencias ambientales excesivas y frustración sentida.',
    citation: 'Koppitz (1984)',
  },
  {
    value: 'overwhelming',
    label: 'Desbordante / Excesiva',
    interpretation: 'Fantasía exuberante y desbordante que puede amenazar el control de la realidad.',
    citation: 'Portuondo (1973)',
  },
  {
    value: 'fruit_flower_loaded',
    label: 'Cargada de Frutos / Flores',
    interpretation: 'Necesidad manifiesta de demostrar productividad, éxito o recibir aprobación y halago externo.',
    citation: 'Hammer (1958)',
  },
];

export const HtpTreeTab: React.FC<HtpTreeTabProps> = ({
  tree,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-900 leading-relaxed">
        <strong>Lámina del Árbol:</strong> Explora la autoimagen inconsciente más profunda, la fuerza básica del Yo (Ego strength), el arraigo instintivo primordial, las memorias de traumas en el desarrollo y la canalización de la energía hacia el medio.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
          <QualitativeChipGroup
            title="Línea de Suelo (Ground Line)"
            subtitle="Contacto básico con la realidad"
            options={GROUND_OPTIONS}
            selectedValue={tree.groundLine}
            onChange={(val) => onChange({ groundLine: val })}
          />

          <QualitativeChipGroup
            title="Raíces (Roots)"
            subtitle="Arraigo y pulsiones arcaicas"
            options={ROOTS_OPTIONS}
            selectedValue={tree.roots}
            onChange={(val) => onChange({ roots: val })}
          />

          <QualitativeChipGroup
            title="Tronco (Trunk)"
            subtitle="Fuerza del Yo y tolerancia al estrés"
            options={TRUNK_OPTIONS}
            selectedValue={tree.trunk}
            onChange={(val) => onChange({ trunk: val })}
          />
        </div>

        <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
          <QualitativeChipGroup
            title="Ramas (Branches)"
            subtitle="Canalización de impulsos hacia metas"
            options={BRANCHES_OPTIONS}
            selectedValue={tree.branches}
            onChange={(val) => onChange({ branches: val })}
          />

          <QualitativeChipGroup
            title="Copa y Follaje (Foliage Crown)"
            subtitle="Vida de fantasía y recursos adaptativos"
            options={CROWN_OPTIONS}
            selectedValue={tree.foliageCrown}
            onChange={(val) => onChange({ foliageCrown: val })}
          />
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center gap-2">
          <MultiToggleCheck
            label="Presencia de Nudos o Huecos en el Tronco"
            checked={tree.hasKnotsOrHoles}
            onChange={(checked) => onChange({ hasKnotsOrHoles: checked })}
            interpretation="Registro mnémico de traumas afectivos pasados; presencia de angustia residual asociada a heridas vitales."
            citation="Hammer (1958) / Koch (1962)"
            alertType="amber"
          />
        </div>

        <ClinicalNotesField
          label="Observaciones Cualitativas del Árbol"
          value={tree.observations}
          onChange={(val) => onChange({ observations: val })}
          placeholder="Ej: El sujeto dibujó un nudo profundo en la parte media izquierda del tronco; verbaliza que una tormenta casi lo derriba..."
          helperText="Estas observaciones se integrarán en el Párrafo C del informe pericial formal."
        />
      </div>
    </div>
  );
};
