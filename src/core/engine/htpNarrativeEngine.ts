/**
 * MOTOR DE SÍNTESIS NARRATIVA CUALITATIVA HTP (CASA-ÁRBOL-PERSONA)
 * Genera informes periciales clínicos estructurados en 5 párrafos cualitativos
 * sin asignación de puntuaciones numéricas artificiales.
 *
 * Marco Teórico: John N. Buck, Emanuel F. Hammer, Elizabeth Koppitz, Juan A. Portuondo.
 */

import {
  HtpAssessmentRecord,
  HtpFormalFeatures,
  HouseFeatures,
  TreeFeatures,
  PersonFeatures,
  HtpNarrativeReport,
} from '../types/htp';

// ============================================================================
// 1. PÁRRAFO A: RESUMEN DE INDICADORES EXPRESIVOS GENERALES
// ============================================================================

export function generateFormalSummary(formal: HtpFormalFeatures, notes?: string): string {
  const parts: string[] = [];

  // Tamaño
  let sizeText = '';
  if (formal.size === 'macrography') {
    sizeText = 'se observa una tendencia a la macrografía gráfica, denotando un estilo expresivo expansivo con reactividad emocional activa y posible dificultad en el refrenamiento pulsional';
  } else if (formal.size === 'micrography') {
    sizeText = 'se evidencia una marcada micrografía, indicativa de inhibición afectiva, vivencias de inseguridad y una actitud general de retraimiento o prudencia restrictiva';
  } else {
    sizeText = 'se advierte un tamaño gráfico adecuado y proporcionado, lo que sugiere un equilibrio funcional adaptativo entre la energía pulsional y los recursos de autocontrol';
  }

  // Emplazamiento vertical y horizontal
  let placementText = '';
  if (formal.verticalPlacement === 'upper') {
    placementText = 'el emplazamiento en el sector superior de la lámina refleja una marcada tendencia al refugio en la fantasía, el idealismo y los recursos intelectualizados';
  } else if (formal.verticalPlacement === 'lower') {
    placementText = 'la ubicación predominante en la zona inferior manifiesta una fuerte necesidad de arraigo concreto y apego a lo fáctico, con posibles sentimientos de decaimiento vital o abatimiento';
  } else {
    placementText = 'la localización centrada en el eje vertical denota estabilidad y centramiento en el presente';
  }

  if (formal.horizontalPlacement === 'left') {
    placementText += ', mientras que la inclinación hacia el margen izquierdo sugiere orientación regresiva, apego al pasado e inhibición de la acción hacia el entorno';
  } else if (formal.horizontalPlacement === 'right') {
    placementText += ', en tanto que la desviación hacia el margen derecho señala extroversión, orientación teleológica hacia el futuro y búsqueda de vinculación con figuras de autoridad';
  }

  parts.push(`En el análisis de las pautas formales transversales de la producción, ${sizeText}. Asimismo, ${placementText}.`);

  // Presión y línea
  let strokeText = '';
  if (formal.strokePressure === 'heavy') {
    strokeText = 'La presión del trazo es intensa y firme, lo que refleja un tono vital vigoroso, asertividad y una carga tensional acumulada que demanda vías de canalización';
  } else if (formal.strokePressure === 'weak') {
    strokeText = 'El trazo se presenta tenue y vacilante, compatible con hipovitalidad, fatiga o sentimientos de fragilidad e inseguridad en el despliegue motor';
  } else {
    strokeText = 'El calibre y la presión del trazo se muestran de firmeza media y homogénea, evidenciando un tono vital adecuado y constancia adaptativa';
  }

  let lineText = '';
  if (formal.lineQuality === 'curved') {
    lineText = 'con predominio de líneas curvas que señalan plasticidad emocional, receptividad y empatía vincular';
  } else if (formal.lineQuality === 'straight_rigid') {
    lineText = 'con acento en trazados rectilíneos rígidos que denotan mecanismos defensivos de inflexibilidad, tenacidad y autocontrol forzado';
  } else if (formal.lineQuality === 'fragmented') {
    lineText = 'mediante líneas entrecortadas o discontinuas que trasuntan ansiedad difusa y titubeo ante la tarea';
  } else if (formal.lineQuality === 'reinforced') {
    lineText = 'apreciándose repasados y reforzamientos de trazo que indican hipervigilancia obsesiva y necesidad de reaseguro continuo';
  }
  parts.push(`${strokeText}, ${lineText}.`);

  // Sombreado, simetría y anomalías críticas
  const anomalies: string[] = [];
  if (formal.shading === 'excessive') {
    anomalies.push('presencia de sombreado intenso que traduce focalización de angustia y vivencias de tensión intrapsíquica en áreas específicas');
  }
  if (formal.symmetry === 'rigid') {
    anomalies.push('simetría marcadamente rígida sugerente de defensas compensatorias de control frente al temor a la desestabilización interna');
  } else if (formal.symmetry === 'asymmetric') {
    anomalies.push('asimetrías notorias compatibles con labilidad emocional o fallas en la integración visoespacial');
  }
  if (formal.hasExcessiveErasures) {
    anomalies.push('conducta reiterada de borradura y rectificación que denota elevada autoexigencia, ambivalencia y angustia de rendimiento');
  }
  if (formal.hasTransparencies) {
    anomalies.push('transparencias estructurales que evidencian debilitamiento transitorio del criterio de realidad o porosidad en los límites psíquicos');
  }
  if (formal.hasOmissions) {
    anomalies.push('omisiones de partes estructurales clave que señalan evitación selectiva de áreas conflictivas de la experiencia');
  }

  if (anomalies.length > 0) {
    parts.push(`Se constatan como indicadores de alerta complementarios: ${anomalies.join('; ')}.`);
  }

  if (notes && notes.trim().length > 0) {
    parts.push(`Anotación cualitativa formal: "${notes.trim()}".`);
  }

  return parts.join(' ');
}

// ============================================================================
// 2. PÁRRAFO B: DINÁMICA FAMILIAR Y ÁREA AFECTIVA (CASA)
// ============================================================================

export function generateHouseNarrative(house: HouseFeatures): string {
  const parts: string[] = [];

  // Techo y paredes
  let roofText = '';
  if (house.roof === 'oversized') {
    roofText = 'Un techo notablemente sobredimensionado refleja una tendencia predominante a refugiarse en la fantasía intelectualizada como mecanismo de escape frente a los conflictos del hogar';
  } else if (house.roof === 'flat_absent') {
    roofText = 'La ausencia o aplanamiento del techo manifiesta un estilo marcadamente pragmático y concreto, con escasez de recursos imaginativos o dificultad para la sublimación afectiva';
  } else {
    roofText = 'El techo proporcionado señala un adecuado equilibrio entre los recursos de la imaginación y la aceptación de la realidad fáctica';
  }

  let wallsText = '';
  if (house.walls === 'firm_solid') {
    wallsText = 'mientras que las paredes sólidas y bien delimitadas evidencian un sólido apuntalamiento yoico y capacidad para mantener los límites de la intimidad frente a las presiones del entorno';
  } else if (house.walls === 'weak_broken') {
    wallsText = 'en tanto que las paredes débiles o discontinuas reflejan vulnerabilidad yoica y sentimientos de desprotección o permeabilidad frente a la atmósfera intrafamiliar';
  } else if (house.walls === 'transparent') {
    wallsText = 'mientras que la transparencia en los muros constituye una manifestación de confusión de límites intrafamiliares o debilitamiento en la diferenciación entre lo público y lo privado';
  }
  parts.push(`En el análisis proyectivo del hogar (Casa), ${roofText}, ${wallsText}.`);

  // Accesibilidad (Puerta, Ventanas, Camino)
  const accessParts: string[] = [];
  if (house.door === 'open') {
    accessParts.push('la puerta abierta denota una intensa búsqueda de contacto y necesidad de afecto externo');
  } else if (house.door === 'locked_barred' || house.door === 'tiny_inaccessible') {
    accessParts.push('el cerrojo o la inaccesibilidad de la puerta trasunta recelo defensivo, hermetismo y resistencia a permitir la aproximación íntima ajena');
  } else if (house.door === 'absent') {
    accessParts.push('la omisión de puerta de acceso exterioriza una vivencia de aislamiento severo y desconexión con el entorno nutricio');
  } else if (house.door === 'oversized') {
    accessParts.push('el gran tamaño de la puerta traduce una demanda de apego y dependencia vincular acentuada');
  }

  if (house.windows === 'closed_curtained' || house.windows === 'barred') {
    accessParts.push('las ventanas cerradas o guarnecidas con rejas sugieren cautela hipervigilante, suspicacia o vivencia del medio exterior como amenazante');
  } else if (house.windows === 'bare_empty' || house.windows === 'absent') {
    accessParts.push('las ventanas desnudas o ausentes denotan dificultades en la modulación y cualificación del intercambio social');
  }

  if (house.pathway === 'winding_narrow') {
    accessParts.push('el sendero sinuoso o estrecho da cuenta de lentitud para establecer confianza afectiva y necesidad de cautela previa en los vínculos');
  } else if (house.pathway === 'absent_isolated') {
    accessParts.push('la ausencia de camino de acceso remarca la percepción de distancia o inaccesibilidad hacia el ámbito familiar');
  }

  if (accessParts.length > 0) {
    parts.push(`En cuanto al intercambio vincular y la accesibilidad al núcleo doméstico, ${accessParts.join('; asimismo, ')}.`);
  }

  // Clima emocional: Chimenea y Humo
  if (house.chimneySmoke === 'dense_turbulent') {
    parts.push('La presencia de humo denso y turbulento emerge como un indicador elocuente de tensión, discordia o agresividad latente en la convivencia hogareña.');
  } else if (house.chimneySmoke === 'warm_gentle') {
    parts.push('El humo que asciende suavemente desde la chimenea testimonia vivencias de calidez afectiva, confort emocional y relaciones nutricias en el ámbito del hogar.');
  } else if (house.chimneySmoke === 'absent_no_smoke') {
    parts.push('La ausencia de chimenea o de emanación de humo es consistente con una percepción de enfriamiento afectivo, carencia de confort o vivencia de desapego en el entorno familiar.');
  }

  if (house.fences === 'surrounding_fence') {
    parts.push('La inclusión de cercas perimetrales subraya la necesidad de erigir barreras defensivas para salvaguardar la intimidad familiar de intromisiones ajenas.');
  } else if (house.fences === 'hedges_protective') {
    parts.push('La presencia de setos protectores denota un esfuerzo adaptativo y socialmente modulado por salvaguardar la privacidad.');
  }

  // Integración de notas de campo del clínico
  if (house.observations && house.observations.trim().length > 0) {
    parts.push(`Observación clínica directa: "${house.observations.trim()}".`);
  }

  return parts.join(' ');
}

// ============================================================================
// 3. PÁRRAFO C: ESTRUCTURA DEL YO Y ESTABILIDAD EMOCIONAL PROFUNDA (ÁRBOL)
// ============================================================================

export function generateTreeNarrative(tree: TreeFeatures): string {
  const parts: string[] = [];

  // Enraizamiento y suelo
  let groundText = '';
  if (tree.groundLine === 'firm_connected') {
    groundText = 'El trazo firme y continuo de la línea de suelo indica un adecuado contacto con la realidad fáctica y estabilidad básica de soporte';
  } else if (tree.groundLine === 'floating_absent') {
    groundText = 'La ausencia de línea de suelo o la apariencia flotante del ejemplar sugiere vivencias de desarraigo, labilidad e inseguridad existencial';
  } else if (tree.groundLine === 'hilltop_elevated') {
    groundText = 'La ubicación del árbol sobre una colina solitaria refleja una necesidad compensatoria de autoafirmación, distanciamiento protector o búsqueda de superioridad';
  }

  let rootText = '';
  if (tree.roots === 'exposed_prominent') {
    rootText = 'las raíces expuestas y sobredimensionadas denotan una acentuada necesidad de sostén y apego dependiente a las figuras arcaicas de cuidado';
  } else if (tree.roots === 'claw_like') {
    rootText = 'las raíces en garra testimonian una aprehensión angustiosa y un esfuerzo tenso por aferrarse a la seguridad afectiva o material';
  } else {
    rootText = 'el adecuado ocultamiento o integración de las raíces sugiere un anclaje instintivo adaptado y armónico';
  }
  parts.push(`En la exploración de la autoimagen inconsciente y el desarrollo psíquico profundo (Árbol), ${groundText}; asimismo, ${rootText}.`);

  // Fortaleza yoica (Tronco)
  let trunkText = '';
  if (tree.trunk === 'robust_straight') {
    trunkText = 'El tronco robusto y equilibrado da cuenta de solidez en la fuerza del Yo (Ego strength), capacidad de afrontamiento frente al estrés y adecuada tolerancia a las frustraciones';
  } else if (tree.trunk === 'slender_fragile') {
    trunkText = 'El tronco frágil o delgado traduce debilidad estructural del Yo, con elevada vulnerabilidad ante las demandas ambientales y temor a ser desbordado';
  } else if (tree.trunk === 'broken_scarred') {
    trunkText = 'El tronco quebrado o con marcas lesionales patentes indica la existencia de vivencias traumáticas en la historia del desarrollo que han dejado una huella emocional aún no cicatrizada';
  } else if (tree.trunk === 'constricted') {
    trunkText = 'El estrechamiento o constricción del tronco señala una severa inhibición afectiva y freno forzado a la espontaneidad vital';
  } else if (tree.trunk === 'bifurcated') {
    trunkText = 'La bifurcación del tronco pone de manifiesto una escisión o ambivalencia interna entre dos orientaciones vitales o identificaciones contrapuestas';
  }

  if (tree.hasKnotsOrHoles) {
    trunkText += ', confirmándose la presencia de nudos o huecos que representan memorias de dolor emocional y angustia focalizada';
  }
  parts.push(`${trunkText}.`);

  // Ramas y Copa: Intercambio con el medio y productividad
  let branchText = '';
  if (tree.branches === 'harmonious_open') {
    branchText = 'Las ramas armoniosas y desplegadas hacia el espacio reflejan adecuada capacidad para canalizar los impulsos hacia metas constructivas e intercambio social fluido';
  } else if (tree.branches === 'spiky_hostile') {
    branchText = 'Las ramas afiladas, puntiagudas o espinosas denotan reactividad defensiva hostil, suspicacia y tendencia a la confrontación agresiva ante el acercamiento ajeno';
  } else if (tree.branches === 'drooping_weeping') {
    branchText = 'Las ramas caídas o en disposición descendente traducen afectos de abatimiento, desánimo, vivencias de pérdida o duelo irresuelto';
  } else if (tree.branches === 'severed_truncated') {
    branchText = 'Las ramas cortadas o truncadas testimonian vivencias de frustración severa, cercenamiento de proyectos vitales y sentimientos de castración';
  } else if (tree.branches === 'club_like') {
    branchText = 'Las ramas en forma de maza o clava señalan hostilidad reprimida con riesgo de descargas impulsivas';
  } else if (tree.branches === 'absent') {
    branchText = 'La carencia de ramas evidencia una marcada restricción en la capacidad para buscar gratificaciones en el entorno externo';
  }

  let crownText = '';
  if (tree.foliageCrown === 'cloud_lobed') {
    crownText = 'La copa lobulada y en bucles suaves corrobora empatía, amabilidad social y defensas elásticas';
  } else if (tree.foliageCrown === 'sparse_bare') {
    crownText = 'La copa desnuda o empobrecida exterioriza vivencias de vacío interior y déficit de recursos imaginativos';
  } else if (tree.foliageCrown === 'flattened_compressed') {
    crownText = 'El achatamiento superior del follaje indica opresión ambiental sentida y sentimientos de frustración impuesta';
  } else if (tree.foliageCrown === 'overwhelming') {
    crownText = 'Una copa desbordante y envolvente señala una actividad fantaseosa que puede sobrepasar la capacidad de control del sujeto';
  } else if (tree.foliageCrown === 'fruit_flower_loaded') {
    crownText = 'La presencia de flores o frutos manifiesta una imperiosa necesidad de reconocimiento, de demostrar productividad o de obtener valor afectivo del entorno';
  }
  parts.push(`${branchText}. ${crownText}.`);

  // Notas de campo
  if (tree.observations && tree.observations.trim().length > 0) {
    parts.push(`Observación clínica pericial: "${tree.observations.trim()}".`);
  }

  return parts.join(' ');
}

// ============================================================================
// 4. PÁRRAFO D: IMAGEN CORPORAL Y RELACIONES INTERPERSONALES (PERSONA)
// ============================================================================

export function generatePersonNarrative(person: PersonFeatures): string {
  const parts: string[] = [];

  // Cabeza y expresión facial
  let headText = '';
  if (person.head === 'macrocephalic') {
    headText = 'La macrocefalia gráfica denota un marcado esfuerzo de intelectualización defensiva y egocentrismo, con sobrevaloración del control racional';
  } else if (person.head === 'tiny') {
    headText = 'La cabeza pequeña refleja sentimientos de incompetencia intelectual o minusvalía en el autoconcepto consciente';
  } else {
    headText = 'La conformación cefálica proporcionada es consistente con un autoconcepto armónico';
  }

  let facialText = '';
  if (person.expression === 'serene_smiling') {
    facialText = 'con una expresión facial serena que comunica adaptación y receptividad social';
  } else if (person.expression === 'hostile_frowning') {
    facialText = 'destacándose una expresión adusta o tensa que exterioriza distanciamiento, irritabilidad o recelo hacia el semejante';
  } else if (person.expression === 'anguished_vacant') {
    facialText = 'apreciándose una mirada extraviada o angustiada que trasluce perplejidad identitaria o desamparo afectivo';
  } else if (person.expression === 'flat_neutral') {
    facialText = 'observándose neutralidad inexpresiva indicativa de aplanamiento defensivo';
  }
  parts.push(`En la proyección del esquema corporal consciente y el contacto social (Persona), ${headText}, ${facialText}.`);

  // Ojos, boca y cuello
  const faceDetails: string[] = [];
  if (person.eyes === 'large_vigilant') {
    faceDetails.push('ojos grandes y acentuados que denotan hipervigilancia suspicaz y alerta paranoide frente a las intenciones ajenas');
  } else if (person.eyes === 'empty_dots') {
    faceDetails.push('ojos vacíos o esquemáticos compatibles con egocentrismo inmaduro y visión superficial del entorno');
  } else if (person.eyes === 'closed') {
    faceDetails.push('ojos cerrados que expresan negación defensiva y aislamiento voluntario del mundo exterior');
  }

  if (person.mouth === 'toothed_aggressive') {
    faceDetails.push('boca con piezas dentarias expuestas que manifiesta agresividad oral primaria y predisposición a la confrontación verbal');
  } else if (person.mouth === 'open_receptive') {
    faceDetails.push('boca abierta de carácter receptivo que evidencia demandas afectivas y dependencia de gratificación externa');
  } else if (person.mouth === 'tight_line') {
    faceDetails.push('labios tensos en línea recta que traducen rigidez, contención verbal estricta e inhibición de afectos');
  } else if (person.mouth === 'slash_concave') {
    faceDetails.push('boca en trazo cóncavo o hendidura que denota dependencia afectiva y búsqueda forzada de complacencia');
  }

  if (person.neck === 'long_thin') {
    faceDetails.push('cuello alargado que evidencia dificultades en la integración entre los impulsos biológicos/afectivos y el control moral o racional');
  } else if (person.neck === 'absent_choked') {
    faceDetails.push('ausencia de cuello que indica inmadurez en la contención de impulsos, con propensión a la respuesta reactiva inmediata');
  }

  if (faceDetails.length > 0) {
    parts.push(`Se detallan a nivel fisonómico: ${faceDetails.join('; ')}.`);
  }

  // Extremidades superiores (Brazos y Manos)
  let limbsText = '';
  if (person.arms === 'extended_welcoming') {
    limbsText = 'Los brazos abiertos hacia afuera expresan una actitud de contacto sincera y búsqueda de interacción social';
  } else if (person.arms === 'crossed_protective') {
    limbsText = 'Los brazos cruzados revelan una actitud defensiva de resguardo, cautela y resistencia al acercamiento';
  } else if (person.arms === 'behind_back' || person.arms === 'in_pockets') {
    limbsText = 'La ocultación de los miembros superiores (manos en bolsillos o tras la espalda) pone de manifiesto timidez, culpa, reticencia o evasión activa del contacto operativo';
  } else if (person.arms === 'rigid_vertical') {
    limbsText = 'Los brazos pegados rígidamente al cuerpo denotan rigidez conductual e inhibición de la espontaneidad';
  }

  if (person.hands === 'clenched_fists') {
    limbsText += ', combinándose con puños cerrados que delatan agresividad reprimida y hostilidad contenida';
  } else if (person.hands === 'claw_pointed') {
    limbsText += ', con dedos en garra o afilados que advierten potencial de agresión motora o descontrol impulsivo';
  } else if (person.hands === 'absent') {
    limbsText += ', contrastando con la omisión de manos que denota vivencias de indefensión, incompetencia manipulatoria o castración operativa';
  } else if (person.hands === 'mittens_hidden') {
    limbsText += ', con manos en manopla o difuminadas que indican represión de impulsos agresivos o torpeza social sentida';
  }
  parts.push(`${limbsText}.`);

  // Piernas y vestimenta
  let legsText = '';
  if (person.legsFeet === 'grounded_stable') {
    legsText = 'Las extremidades inferiores firmes y bien apoyadas confirman estabilidad motriz y seguridad en el posicionamiento social';
  } else if (person.legsFeet === 'tense_pressed') {
    legsText = 'Las piernas juntas y rígidas revelan tensión psicomotora, timidez o defensas severas ante la proximidad';
  } else if (person.legsFeet === 'tiny_shaky') {
    legsText = 'Pies pequeños o vacilantes exteriorizan inseguridad básica en el desplazamiento autónomo y necesidad de apoyo externo';
  } else if (person.legsFeet === 'spread_stance') {
    legsText = 'La postura con piernas ampliamente separadas sugiere un esfuerzo de afirmación de poder y desafío desafiante';
  } else if (person.legsFeet === 'absent') {
    legsText = 'La ausencia de pies refleja falta de cimientos de soporte psíquico e inestabilidad vital';
  }

  let clothingText = '';
  if (person.clothing === 'overdressed_formal') {
    clothingText = 'La vestimenta recargada o excesivamente formal denota una fachada de rigidez narcisista y marcada necesidad de aprobación del estatus social';
  } else if (person.clothing === 'underdressed_scanty') {
    clothingText = 'La escasez de vestimenta sugiere desapego de las convenciones normativas o exhibicionismo regresivo';
  } else if (person.clothing === 'power_accessories') {
    clothingText = 'La presencia de accesorios de poder o armas confirma mecanismos de sobrecompensación agresiva';
  } else {
    clothingText = 'La indumentaria adecuada es consistente con una adaptación social normativa';
  }
  parts.push(`${legsText}. ${clothingText}.`);

  // Notas de campo
  if (person.observations && person.observations.trim().length > 0) {
    parts.push(`Observación clínica pericial: "${person.observations.trim()}".`);
  }

  return parts.join(' ');
}

// ============================================================================
// 5. PÁRRAFO E: CONCLUSIÓN CUALITATIVA INTEGRADA Y RECOMENDACIONES PERICIALES
// ============================================================================

export function generateIntegratedConclusion(record: HtpAssessmentRecord): string {
  const { formal, house, tree, person } = record;
  const constellations: string[] = [];
  const recommendations: string[] = [];

  // Constelación 1: Inhibición, Retraimiento y Angustia Insegura
  const isInhibited =
    formal.size === 'micrography' ||
    formal.strokePressure === 'weak' ||
    person.arms === 'behind_back' ||
    person.arms === 'in_pockets' ||
    tree.trunk === 'slender_fragile' ||
    house.door === 'tiny_inaccessible' ||
    person.legsFeet === 'tiny_shaky';

  // Constelación 2: Tensión Agresiva / Reactividad Impulsiva
  const isAggressiveImpulsive =
    formal.strokePressure === 'heavy' ||
    person.hands === 'clenched_fists' ||
    person.hands === 'claw_pointed' ||
    tree.branches === 'spiky_hostile' ||
    person.mouth === 'toothed_aggressive' ||
    house.chimneySmoke === 'dense_turbulent';

  // Constelación 3: Defensividad Rígida y Control Obsesivo
  const isRigidObsessive =
    formal.symmetry === 'rigid' ||
    formal.lineQuality === 'straight_rigid' ||
    person.clothing === 'overdressed_formal' ||
    formal.hasExcessiveErasures ||
    person.expression === 'flat_neutral';

  // Constelación 4: Vulnerabilidad del Yo y Labilidad en Límites
  const isVulnerable =
    formal.hasTransparencies ||
    formal.shading === 'excessive' ||
    house.walls === 'weak_broken' ||
    house.walls === 'transparent' ||
    tree.groundLine === 'floating_absent' ||
    tree.hasKnotsOrHoles ||
    tree.branches === 'severed_truncated' ||
    tree.trunk === 'broken_scarred';

  // Alerta de indicadores críticos periciales
  const criticalAnomalies: string[] = [];
  if (formal.hasTransparencies || house.walls === 'transparent') {
    criticalAnomalies.push('transparencias estructurales (porosidad en límites yoicos o criterio de realidad debilitado)');
  }
  if (tree.trunk === 'broken_scarred') {
    criticalAnomalies.push('tronco quebrado o con marcas lesionales (evidencia de vivencias traumáticas residuales)');
  }
  if (tree.branches === 'severed_truncated') {
    criticalAnomalies.push('ramas cortadas o truncadas (bloqueo vital severo o frustración traumática)');
  }
  if (formal.shading === 'excessive') {
    criticalAnomalies.push('sombreado excesivo o intenso (focalización aguda de angustia y conflicto intrapsíquico)');
  }

  // Redacción de la constelación predominante y recomendaciones
  if (isVulnerable && isAggressiveImpulsive) {
    constellations.push(
      'La producción proyectiva gráfica conjunta evidencia una estructura de personalidad caracterizada por vulnerabilidad yoica basal, frente a la cual el sujeto despliega mecanismos compensatorios de reactividad tensional y defensas agresivas ante situaciones de frustración'
    );
    recommendations.push(
      'Se aconseja brindar espacios terapéuticos focalizados en la contención afectiva, la elaboración de vivencias traumáticas residuales y el fortalecimiento de la tolerancia a la frustración'
    );
  } else if (isInhibited && isRigidObsessive) {
    constellations.push(
      'La evaluación cualitativa global pone de relieve un funcionamiento predominantemente inhibido e hipervigilante, con marcado esfuerzo de control racional y rigidez defensiva orientado a contener la emergencia de angustia e inseguridad en los vínculos interpersonales'
    );
    recommendations.push(
      'Se recomienda favorecer intervenciones clínicas orientadas a flexibilizar las defensas perfeccionistas, promover la expresión espontánea de afectos y fortalecer la seguridad en las relaciones sociales'
    );
  } else if (isInhibited) {
    constellations.push(
      'La constelación gráfica proyecta un estilo de personalidad con predominio de inhibición afectiva, vivencias de minusvalía o timidez social y tendencia al retraimiento frente a las demandas del entorno'
    );
    recommendations.push(
      'Se sugiere un abordaje psicoterapéutico de apoyo destinado a robustecer el autoconcepto, legitimar la asertividad y facilitar experiencias de socialización seguras'
    );
  } else if (isAggressiveImpulsive) {
    constellations.push(
      'El perfil gráfico refleja un caudal de energía pulsional elevado acompañado de tensión contenida y propensión a la respuesta reactiva asertivo-agresiva, existiendo dificultades en la modulación y sublimación de los impulsos hostiles'
    );
    recommendations.push(
      'Se orienta hacia el entrenamiento en habilidades de autorregulación emocional, resolución asertiva de conflictos y canalización motriz estructurada'
    );
  } else if (isVulnerable && isRigidObsessive) {
    constellations.push(
      'La evaluación proyectiva conjunta evidencia fragilidad en las defensas yoicas y vulnerabilidad basal, frente a las cuales se erigen mecanismos compensatorios de rígido control obsesivo y autoexigencia para contener la angustia y estructurar la relación con el medio'
    );
    recommendations.push(
      'Se aconseja abordaje psicoterapéutico focalizado en el apuntalamiento de límites yoicos y reaseguro emocional, facilitando gradualmente la flexibilización de las defensas de control obsesivo'
    );
  } else if (isVulnerable) {
    constellations.push(
      'Se aprecian indicadores de fragilidad en las defensas yoicas y permeabilidad en los límites subjetivos, con vivencias de desprotección e inseguridad básica'
    );
    recommendations.push(
      'Se recomienda apuntalamiento psicoterapéutico centrado en la consolidación de límites yoicos y reaseguro en el medio relacional'
    );
  } else if (isRigidObsessive) {
    constellations.push(
      'La producción gráfica evidencia predominio de defensas de control obsesivo, perfeccionismo e hipervigilancia orientados a contener la angustia y estructurar rígidamente la relación con el medio'
    );
    recommendations.push(
      'Se recomienda promover la flexibilidad cognitiva, la tolerancia a la imperfección y la espontaneidad afectiva'
    );
  } else {
    constellations.push(
      'La síntesis proyectiva gráfica denota un funcionamiento armónico y adaptativo, con adecuada integración entre la vida de fantasía, la fortaleza de los recursos yoicos profundos y la modulación del contacto interpersonal'
    );
    recommendations.push(
      'No se aprecian descompensaciones estructurales de gravedad; los indicadores formales son compatibles con recursos de afrontamiento preservados'
    );
  }

  // Integración con notas generales del evaluador
  let clinicianGeneralNote = '';
  if (record.generalClinicalNotes && record.generalClinicalNotes.trim().length > 0) {
    clinicianGeneralNote = ` En concordancia con las observaciones clínicas durante la administración: "${record.generalClinicalNotes.trim()}".`;
  }

  // Alerta destacada de indicadores críticos periciales
  let criticalAlertText = '';
  if (criticalAnomalies.length > 0) {
    criticalAlertText = ` Alerta clínica de indicadores críticos: se constata la presencia de ${criticalAnomalies.join('; ')}, requiriéndose priorización en el seguimiento clínico pericial.`;
  }

  return `En conclusión integrada pericial, ${constellations.join('. ')}.${clinicianGeneralNote} ${recommendations.join('. ')}.${criticalAlertText}`;
}

// ============================================================================
// 6. GENERACIÓN DEL REPORTE COMPLETO HTP
// ============================================================================

export function generateHtpFullReport(record: HtpAssessmentRecord): HtpNarrativeReport {
  const summaryFormal = generateFormalSummary(record.formal);
  const houseAnalysis = generateHouseNarrative(record.house);
  const treeAnalysis = generateTreeNarrative(record.tree);
  const personAnalysis = generatePersonNarrative(record.person);
  const integratedConclusion = generateIntegratedConclusion(record);

  const fullNarrativeText = [
    'INFORME DE EVALUACIÓN CUALITATIVA PROYECTIVA HTP (CASA-ÁRBOL-PERSONA)',
    '========================================================================\n',
    '1. Resumen de Indicadores Expresivos Generales:\n' + summaryFormal + '\n',
    '2. Dinámica Familiar y Área Afectiva (Casa):\n' + houseAnalysis + '\n',
    '3. Estructura del Yo y Estabilidad Emocional Profunda (Árbol):\n' + treeAnalysis + '\n',
    '4. Imagen Corporal y Relaciones Interpersonales (Persona):\n' + personAnalysis + '\n',
    '5. Conclusión Cualitativa Integrada:\n' + integratedConclusion,
  ].join('\n');

  return {
    summaryFormal,
    houseAnalysis,
    treeAnalysis,
    personAnalysis,
    integratedConclusion,
    fullNarrativeText,
  };
}
