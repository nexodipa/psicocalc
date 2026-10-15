# Original User Request

## Initial Request — 2026-09-22T20:07:47Z

Plataforma web interactiva para psicólogos, neuropsicólogos y psiquiatras que automatiza el cálculo de puntuaciones directas a escalares, percentiles, índices primarios y Coeficiente Intelectual Total (CIT) para las baterías WISC-V y WAIS-IV, con gráficos de dispersión de perfil cognitivo y generación de informes clínicos descargables en PDF.

Working directory: C:\Users\USUARIO\OneDrive\Escritorio\trabajos\programas\psicocalc
Integrity mode: development

## Requirements

### R1. Motor de Cálculo Psicométrico Estandarizado (WISC-V y WAIS-IV)
Implementar la lógica matemática de conversión y cálculo para subtests obligatorios y optativos de WISC-V (para rango infanto-juvenil) y WAIS-IV (para adultos), calculando puntuaciones escalares, índices primarios (Comprensión Verbal, Visoespacial, Razonamiento Fluido, Memoria de Trabajo, Velocidad de Procesamiento) y el Coeficiente Intelectual Total (CIT/FSIQ), junto con percentiles e intervalos de confianza estándar.

### R2. Interfaz Interactiva de Entrada Rápida y Gráfico de Perfil
Desarrollar una interfaz de usuario fluida, minimalista y profesional que permita la entrada ágil de puntuaciones con validación en tiempo real de rangos válidos, renderizando de forma inmediata el gráfico de dispersión de fortalezas y debilidades y la curva de distribución normal con las puntuaciones del evaluado.

### R3. Exportación de Informe Clínico Formal (PDF / Imprimible)
Generar un reporte clínico estructurado con diseño formal (estilo informe pericial/clínico), que incluya datos anonimizados del evaluado, tabla de puntuaciones con clasificación cualitativa estandarizada (Muy Superior, Superior, Promedio, etc.), gráficos del perfil cognitivo y resumen interpretativo listo para guardar como PDF o imprimir en 1 clic.

## Acceptance Criteria

### Exactitud y Validación Psicométrica
- [ ] La suite de pruebas automatizadas valida con 100% de precisión matemática casos testigo conocidos de suma de puntuaciones escalares a CIT e índices primarios para WISC-V y WAIS-IV.
- [ ] El sistema rechaza o alerta de forma inmediata entradas inválidas (valores fuera del rango del subtest o edades no cubiertas).

### Visualización e Interactividad
- [ ] La interfaz gráfica despliega los gráficos de perfil cognitivo de manera interactiva y reactiva a medida que se ingresan o modifican las puntuaciones.
- [ ] La aplicación es completamente funcional y ejecutable en entorno web/local con arranque en un clic.

### Calidad de Exportación
- [ ] La exportación genera un documento clínico formal con tipografía médica/editorial, sin controles de interfaz web visibles y con paginación limpia lista para impresión o archivo en expediente.

## Follow-up — 2026-09-23T17:36:50Z

Expansión de la plataforma Psicocalc para incorporar un catálogo multimodular de pruebas psicométricas y cuestionarios clínicos estandarizados (SDQ para dificultades conductuales infanto-juveniles, PHQ-9 para depresión, GAD-7 para ansiedad, MoCA para cribado cognitivo) y un módulo de guía clínica interactiva para evaluación cualitativa de pruebas proyectivas (HTP: Casa-Árbol-Persona), con perfiles visuales de severidad e integración en el informe clínico formal para PDF.

Working directory: C:\Users\USUARIO\OneDrive\Escritorio\trabajos\programas\psicocalc
Integrity mode: development

## Requirements

### R1. Motores de Cálculo y Baremos Estandarizados (SDQ, PHQ-9, GAD-7, MoCA)
Implementar la lógica de puntuación, puntos de corte validados y categorización de severidad para:
- **SDQ (Strengths and Difficulties Questionnaire - Goodman):** 25 ítems con las 5 subescalas (Síntomas Emocionales, Problemas de Conducta, Hiperactividad, Problemas con Compañeros y Conducta Prosocial), total de dificultades y clasificación de corte (Normal, Limítrofe, Anormal/Clínico).
- **PHQ-9 (Patient Health Questionnaire):** Puntuación de 0 a 27 con estratificación de severidad y detección con alerta visual destacada del ítem 9 (ideación/riesgo).
- **GAD-7 (Generalized Anxiety Disorder):** Puntuación de 0 a 21 con estratificación de ansiedad (Mínima, Leve, Moderada, Severa).
- **MoCA (Montreal Cognitive Assessment):** Puntuación de 0 a 30 por dominios cognitivos (visuoespacial, memoria, atención, lenguaje, abstracción, orientación) con regla de ajuste por escolaridad (+1 punto si ≤ 12 años de estudio) y punto de corte clínico (< 26 alerta de posible deterioro cognitivo leve).

### R2. Módulo de Guía Clínica Estructurada para Test Proyectivo HTP (Casa-Árbol-Persona)
Diseñar un sistema interactivo de registro y guía pericial para la prueba proyectiva HTP que permita al evaluador documentar observaciones formales (emplazamiento, tamaño, presión de trazo, simetría, sombreado) y de contenido específico para cada dibujo (Casa: dinámica familiar/vínculos; Árbol: autoimagen profunda/estabilidad; Persona: esquema corporal/relaciones sociales), generando un resumen analítico cualitativo formal sin asignación de puntajes numéricos artificiales.

### R3. Navegación Multimodal, Visualizaciones Reactivas e Informe Clínico Integral
Integrar en la interfaz de Psicocalc un selector jerárquico o pestañas organizadas por categorías (Inteligencia: WISC-V/WAIS-IV; Conducta & Emoción: SDQ, PHQ-9, GAD-7; Neurocognitivo: MoCA; Proyectivos: HTP), con semáforos de riesgo/gráficos de barras reactivos por dimensión y consolidación de todos los resultados aplicados dentro del módulo de exportación de reporte clínico formal en PDF.

## Acceptance Criteria

### Precisión y Validación de Pruebas Clínicas
- [ ] La suite de pruebas automatizadas valida al 100% las sumas, rangos, puntos de corte normativos y ajustes por escolaridad de SDQ, PHQ-9, GAD-7 y MoCA frente a casos clínicos de referencia.
- [ ] El sistema activa alertas visuales específicas ante puntuaciones críticas (como respuesta afirmativa en el ítem 9 del PHQ-9 o puntuación MoCA < 26).

### Guía Cualitativa HTP
- [ ] La guía de HTP proporciona selectores cualitativos claros organizados por dimensiones formales y de contenido, generando una síntesis narrativa clínica coherente para el informe.

### Integración de Interfaz y Reporte Clínico
- [ ] La barra de navegación permite alternar de forma inmediata entre cualquiera de los módulos e instrumentos sin pérdida de datos en la sesión activa.
- [ ] El generador de informes (`print.css` / PDF) incluye de forma organizada y elegante las nuevas pruebas completadas junto con las tablas demográficas y firmas periciales.

## Follow-up — 2026-10-13T17:23:53Z

Transformación de la plataforma Psicocalc en una Suite Psicométrica Universal para profesionales de la salud mental y neuropsicología, implementando una arquitectura de Catálogo Extensible (TestRegistry) y los motores de cálculo, baremos en puntuaciones T/percentiles y reportes para instrumentos clave en Personalidad (MMPI-3, PAI, MCMI-IV), Neuropsicología y Atención (D2-R, NEUROPSI Breve, MMSE), Conducta Adaptativa (ABAS-3, Vineland-3), Evaluación Infanto-Juvenil (SENA, CBCL, BYI-2) e Inteligencia No Verbal (Raven 2).

Working directory: C:\Users\USUARIO\OneDrive\Escritorio\trabajos\programas\psicocalc
Integrity mode: development

## Requirements

### R1. Arquitectura de Catálogo Universal y Registro Extensible (TestRegistry)
Diseñar una arquitectura modular desacoplada mediante un Registro Central de Instrumentos que categorice la suite en 6 áreas clínicas (Inteligencia & Aptitudes, Neuropsicología & Atención, Personalidad & Psicopatología, Conducta Adaptativa, Infanto-Juvenil & Emocional, y Guías Proyectivas), permitiendo el descubrimiento, búsqueda por palabras clave, filtrado por rango de edad (infantil, adolescente, adulto) y la activación dinámica de cualquier test sin riesgo de colisión de estado.

### R2. Motores de Cálculo Psicométrico Estandarizado (Puntuaciones T, Percentiles y Baremos)
Implementar y verificar matemáticamente la lógica de puntuación para los instrumentos prioritarios:
- Personalidad & Psicopatología: 
  - MMPI-3 / PAI: Escalas de validez (inconsistencia, infrecuencia, impresión negativa/positiva), escalas clínicas con conversión a Puntuaciones T (media 50, DE 10) y alertas visuales de significación clínica (T ≥ 65 / T ≥ 70).
  - MCMI-IV: Puntuaciones de Tasa Base (TB) para patrones de personalidad y síndromes clínicos con líneas de corte (TB 75 presencia, TB 85 prominencia).
- Neuropsicología & Atención:
  - D2-R: Cálculo de Velocidad de Procesamiento (TR), Concentración (TOT, CON, CP) y precisión (errores E1 y E2).
  - NEUROPSI Breve & MMSE: Puntuaciones globales y de subdominios con ajustes por edad y nivel de escolaridad.
- Conducta Adaptativa & Desarrollo:
  - ABAS-3 / Vineland-3: Puntuaciones escalares por dominios (Conceptual, Social, Práctico) y Puntuación Compuesta General de Conducta Adaptativa.
- Evaluación Infanto-Juvenil:
  - SENA / CBCL / BYI-2: Índices de problemas internalizantes, externalizantes y síntomas emocionales/conductuales con conversión a percentiles y puntuaciones T.
- Inteligencia No Verbal:
  - Raven 2: Conversión de aciertos a puntuación de habilidad no verbal y percentiles.

### R3. Interfaz Multitest, Formularios Especializados y Reporte Pericial Consolidado
Desarrollar una interfaz con explorador de catálogo dinámico, formularios de entrada de datos adaptados al formato de cada prueba (escalas Likert, respuestas numéricas directas, índices de acierto/error), visualizaciones reactivas de perfiles psicométricos (gráficos de barras y perfiles de Puntuaciones T con líneas de corte clínico) y unificación en el informe pericial A4 imprimible en PDF con formato confidencial y anonimización en 1 clic.

## Acceptance Criteria

### Precisión Psicométrica y Validación Matemática
- [ ] La suite de pruebas automatizadas valida al 100% las conversiones a Puntuaciones T, Tasa Base, Puntuaciones Escalares, percentiles y alertas de corte clínico para cada uno de los instrumentos implementados frente a casos de referencia.
- [ ] El sistema detecta y alerta ante protocolos inválidos en pruebas de personalidad (índices de inconsistencia o respuestas omitidas fuera de tolerancia).

### Arquitectura y Catálogo Extensible
- [ ] El catálogo permite buscar por texto y filtrar por categoría o rango de edad de manera reactiva y sin recarga.
- [ ] La adición o activación de cualquier batería del catálogo mantiene intacto el estado de las demás pruebas administradas al evaluado.

### Calidad de Visualización y Reporte Pericial
- [ ] Los perfiles psicométricos de Puntuaciones T renderizan las líneas de referencia clínicas (T=65 / T=70) en gráficos vectoriales SVG limpios.
- [ ] La exportación a PDF genera un informe clínico formal consolidado que incluye automáticamente solo las pruebas aplicadas, sin tablas vacías ni desbordamientos tipográficos.
