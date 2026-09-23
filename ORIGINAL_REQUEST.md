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
