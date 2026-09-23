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
