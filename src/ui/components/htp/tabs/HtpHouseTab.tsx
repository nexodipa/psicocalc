import React from 'react';
import { HouseFeatures } from '../../../../core';
import { QualitativeChipGroup, QualitativeOption } from '../controls/QualitativeChipGroup';
import { ClinicalNotesField } from '../controls/ClinicalNotesField';

interface HtpHouseTabProps {
  house: HouseFeatures;
  onChange: (patch: Partial<HouseFeatures>) => void;
}

const ROOF_OPTIONS: QualitativeOption<HouseFeatures['roof']>[] = [
  {
    value: 'oversized',
    label: 'Sobredimensionado',
    interpretation: 'Refugio en la fantasía intelectualizada como mecanismo de escape frente a conflictos domésticos.',
    citation: 'Buck (1948)',
  },
  {
    value: 'normal',
    label: 'Normal / Proporcionado',
    interpretation: 'Equilibrio adecuado entre recursos de la imaginación y principio de realidad.',
    citation: 'Hammer (1958)',
  },
  {
    value: 'flat_absent',
    label: 'Aplanado o Ausente',
    interpretation: 'Empobrecimiento imaginativo, concreción mental y desinterés por la introspección afectiva.',
    citation: 'Portuondo (1973)',
  },
];

const WALLS_OPTIONS: QualitativeOption<HouseFeatures['walls']>[] = [
  {
    value: 'firm_solid',
    label: 'Firmes y Sólidas',
    interpretation: 'Fortaleza yoica y claridad en límites de la intimidad frente al entorno.',
    citation: 'Buck (1966)',
  },
  {
    value: 'weak_broken',
    label: 'Débiles o Quebradas',
    interpretation: 'Vulnerabilidad yoica, vivencias de desprotección o colapso ante presiones intrafamiliares.',
    citation: 'Hammer (1980)',
  },
  {
    value: 'transparent',
    label: 'Transparentes',
    interpretation: 'Confusión de límites intrafamiliares, intrusión o severa falla en el criterio de realidad.',
    citation: 'Koppitz (1968)',
  },
];

const DOOR_OPTIONS: QualitativeOption<HouseFeatures['door']>[] = [
  {
    value: 'open',
    label: 'Abierta',
    interpretation: 'Búsqueda imperiosa de contacto y afecto; permeabilidad y posible vulnerabilidad.',
    citation: 'Hammer (1958)',
  },
  {
    value: 'closed_unlocked',
    label: 'Cerrada sin Cerrojo',
    interpretation: 'Adecuado resguardo de la intimidad con capacidad de apertura selectiva adaptativa.',
    citation: 'Buck (1948)',
  },
  {
    value: 'locked_barred',
    label: 'Con Cerrojo o Candado',
    interpretation: 'Desconfianza marcada, hostilidad defensiva y hermetismo frente al afuera.',
    citation: 'Hammer (1980)',
  },
  {
    value: 'tiny_inaccessible',
    label: 'Pequeña / Inaccesible',
    interpretation: 'Reticencia afectiva, timidez o inaccesibilidad emocional ante figuras parentales.',
    citation: 'Koppitz (1968)',
  },
  {
    value: 'oversized',
    label: 'Sobredimensionada',
    interpretation: 'Búsqueda urgente de gratificación y dependencia vincular acentuada.',
    citation: 'Portuondo (1973)',
  },
  {
    value: 'absent',
    label: 'Ausente / Omitida',
    interpretation: 'Aislamiento severo, desinvestidura del vínculo o vivencia de hermetismo absoluto.',
    citation: 'Hammer (1958)',
  },
];

const WINDOWS_OPTIONS: QualitativeOption<HouseFeatures['windows']>[] = [
  {
    value: 'normal_open',
    label: 'Abiertas / Normales',
    interpretation: 'Intercambio social fluido y receptividad sensorial adecuada hacia el medio.',
    citation: 'Buck (1966)',
  },
  {
    value: 'closed_curtained',
    label: 'Cerradas con Cortinas',
    interpretation: 'Reserva emocional, prudencia acentuada o suspicacia ante la mirada ajena.',
    citation: 'Hammer (1958)',
  },
  {
    value: 'barred',
    label: 'Guarnecidas con Rejas',
    interpretation: 'Percepción del entorno familiar como hostil o amenazante; defensas paranoides.',
    citation: 'Portuondo (1973)',
  },
  {
    value: 'bare_empty',
    label: 'Desnudas / Vacías',
    interpretation: 'Dificultad para cualificar los afectos, contacto social distante y frío.',
    citation: 'Koppitz (1984)',
  },
  {
    value: 'absent',
    label: 'Ausentes / Sin Ventanas',
    interpretation: 'Retraimiento vincular severo y falta de interés en la comunicación intersubjetiva.',
    citation: 'Hammer (1980)',
  },
];

const SMOKE_OPTIONS: QualitativeOption<HouseFeatures['chimneySmoke']>[] = [
  {
    value: 'warm_gentle',
    label: 'Humo Suave y Ondulante',
    interpretation: 'Clima familiar cálido, acogedor, nutritivo y confort emocional en el hogar.',
    citation: 'Buck (1948)',
  },
  {
    value: 'dense_turbulent',
    label: 'Humo Denso y Turbulento',
    interpretation: 'Tensión aguda, conflicto o agresividad soterrada en la convivencia familiar.',
    citation: 'Hammer (1958)',
  },
  {
    value: 'absent_no_smoke',
    label: 'Sin Humo / Sin Chimenea',
    interpretation: 'Percepción de enfriamiento afectivo, carencia de confort o vivencia de desapego.',
    citation: 'Portuondo (1973)',
  },
];

const PATHWAY_OPTIONS: QualitativeOption<HouseFeatures['pathway']>[] = [
  {
    value: 'direct_welcoming',
    label: 'Directo y Accesible',
    interpretation: 'Facilidad de contacto social y apertura espontánea hacia los demás.',
    citation: 'Buck (1966)',
  },
  {
    value: 'winding_narrow',
    label: 'Sinuoso o Estrecho',
    interpretation: 'Recelo inicial, lentitud para establecer confianza y rodeos defensivos.',
    citation: 'Hammer (1980)',
  },
  {
    value: 'absent_isolated',
    label: 'Ausente / Aislado',
    interpretation: 'Vivencia de desarraigo relacional o aislamiento de la dinámica social.',
    citation: 'Koppitz (1968)',
  },
];

const FENCES_OPTIONS: QualitativeOption<HouseFeatures['fences']>[] = [
  {
    value: 'none',
    label: 'Sin Cercas',
    interpretation: 'Espacio vital accesible sin excesivas barreras defensivas periféricas.',
    citation: 'Buck (1948)',
  },
  {
    value: 'surrounding_fence',
    label: 'Cerca Perimetral Cerrada',
    interpretation: 'Necesidad manifiesta de erigir barreras defensivas para salvaguardar la intimidad.',
    citation: 'Hammer (1958)',
  },
  {
    value: 'hedges_protective',
    label: 'Setos Protectores Modulados',
    interpretation: 'Esfuerzo adaptativo y socialmente aceptable por modular la proximidad ajena.',
    citation: 'Portuondo (1973)',
  },
];

export const HtpHouseTab: React.FC<HtpHouseTabProps> = ({
  house,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
        <strong>Lámina de la Casa:</strong> Proyecta la vivencia del ambiente doméstico, las relaciones y vínculos familiares primarios, la calidez nutricia percibida y los límites entre la intimidad y el mundo exterior.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
          <QualitativeChipGroup
            title="Techo (Roof)"
            subtitle="Área de la fantasía e intelecto"
            options={ROOF_OPTIONS}
            selectedValue={house.roof}
            onChange={(val) => onChange({ roof: val })}
          />

          <QualitativeChipGroup
            title="Paredes (Walls)"
            subtitle="Límites yoicos e intrafamiliares"
            options={WALLS_OPTIONS}
            selectedValue={house.walls}
            onChange={(val) => onChange({ walls: val })}
          />

          <QualitativeChipGroup
            title="Puerta de Entrada (Door)"
            subtitle="Accesibilidad vincular íntima"
            options={DOOR_OPTIONS}
            selectedValue={house.door}
            onChange={(val) => onChange({ door: val })}
          />
        </div>

        <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
          <QualitativeChipGroup
            title="Ventanas (Windows)"
            subtitle="Contacto sensorial con el entorno"
            options={WINDOWS_OPTIONS}
            selectedValue={house.windows}
            onChange={(val) => onChange({ windows: val })}
          />

          <QualitativeChipGroup
            title="Chimenea y Humo"
            subtitle="Clima afectivo y calor familiar"
            options={SMOKE_OPTIONS}
            selectedValue={house.chimneySmoke}
            onChange={(val) => onChange({ chimneySmoke: val })}
          />

          <QualitativeChipGroup
            title="Camino de Acceso (Pathway)"
            subtitle="Disponibilidad social"
            options={PATHWAY_OPTIONS}
            selectedValue={house.pathway}
            onChange={(val) => onChange({ pathway: val })}
          />
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
        <QualitativeChipGroup
          title="Cercas y Defensas Perimetrales"
          subtitle="Modulación de la proximidad ajena"
          options={FENCES_OPTIONS}
          selectedValue={house.fences}
          onChange={(val) => onChange({ fences: val })}
        />

        <ClinicalNotesField
          label="Observaciones Cualitativas de la Casa"
          value={house.observations}
          onChange={(val) => onChange({ observations: val })}
          placeholder="Ej: El sujeto comenzó dibujando una puerta pequeña y añadió cerrojos visibles; verbaliza que su casa es muy tranquila pero solitaria..."
          helperText="Estas observaciones se integrarán en el Párrafo B del informe pericial formal."
        />
      </div>
    </div>
  );
};
