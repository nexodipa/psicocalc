# 🧠 Psicocalc — Plataforma de Cálculo Psicométrico e Informes Clínicos

**Psicocalc** es una aplicación interactiva, moderna y de alta precisión diseñada para psicólogos, neuropsicólogos y psiquiatras. Automatiza el procesamiento psicométrico, cálculo de puntuaciones escalares, índices primarios, Coeficiente Intelectual Total (CIT/FSIQ) y la generación de perfiles cognitivos visuales e informes clínicos descargables en PDF para las baterías estandarizadas **WISC-V** (infanto-juvenil) y **WAIS-IV** (adultos).

---

## 🚀 Inicio Rápido (En 1 Clic en Windows)

Hemos configurado lanzadores automáticos para que no tengas que escribir comandos en la consola:

1. Ve a la carpeta del proyecto:
   `C:\Users\USUARIO\OneDrive\Escritorio\trabajos\programas\psicocalc`
2. Haz doble clic en **`launch.bat`** (o en **`start.bat`**).
3. La aplicación se abrirá automáticamente en tu navegador web en:
   👉 **http://localhost:5173**

*(Si prefieres usar la terminal, simplemente ejecuta `npm install` y luego `npm run dev`).*

---

## ✨ Características Principales

### 1. Baterías Psicométricas Integradas
* **WISC-V (Escala de Inteligencia de Wechsler para Niños - V):**
  * Subtests primarios: Semejanzas, Vocabulario, Cubos, Puzles Visuales, Matrices, Balanzas, Dígitos, Span de Dibujos, Claves, Búsqueda de Símbolos.
  * Índices calculados:
    * Comprensión Verbal (ICV)
    * Visoespacial (IVE)
    * Razonamiento Fluido (IRF)
    * Memoria de Trabajo (IMT)
    * Velocidad de Procesamiento (IVP)
    * Coeficiente Intelectual Total (CIT / FSIQ)
    * Índices secundarios: Razonamiento Cuantitativo (IRC) y Memoria de Trabajo Auditiva (IMTA).
* **WAIS-IV (Escala de Inteligencia de Wechsler para Adultos - IV):**
  * Subtests esenciales y suplementarios.
  * Cálculo de ICV, IRP, IMT, IVP y CIT global.

### 2. Validación y Rigor Matemático
* **Interpolación Monotónica de Baremos:** Sin atajos empíricos; cálculo riguroso de percentiles e intervalos de confianza estandarizados (90% y 95%).
* **Validación en Tiempo Real:** Detección inmediata de puntuaciones fuera de rango o errores tipográficos.
* **Análisis de Discrepancias:** Identificación automática de fortalezas y debilidades normativas e intraindividuales.

### 3. Visualización Gráfica Interactiva
* **Campana de Gauss Dinámica:** Gráfico interactivo en SVG puro que ubica las puntuaciones del paciente en la curva de distribución normal poblacional.
* **Gráfico de Dispersión del Perfil Cognitivo:** Diagrama visual de las fluctuaciones inter-índices para evaluar la homogeneidad del perfil.

### 4. Generador de Informe Clínico y Exportación a PDF
* Encabezado institucional con datos del evaluador y evaluado.
* Tabla demográfica y resumen cuantitativo formal con clasificaciones cualitativas oficiales (*Muy Superior, Superior, Promedio Alto, Promedio, Promedio Bajo, Limítrofe, Muy Bajo*).
* Síntesis narrativa generada automáticamente.
* Bloque de firma para el profesional de la salud mental.
* **Modo Impresión / PDF:** Al hacer clic en *"Imprimir / Guardar como PDF"*, la interfaz oculta todos los controles de navegación y produce un documento médico/editorial impecable listo para anexar a la historia clínica.

---

## 🧪 Pruebas Automatizadas

El motor de cálculo cuenta con una suite de **363 pruebas unitarias y de estrés automatizadas** que garantizan la exactitud matemática de cada conversión. Para ejecutarlas en la consola:

```bash
npm test
```

---

## 📁 Estructura del Código

```text
psicocalc/
├── launch.bat                     # Lanzador en 1 clic para Windows
├── start.bat                      # Lanzador alternativo
├── package.json                   # Dependencias de React, Vite y TypeScript
├── dist/                          # Compilación de producción optimizada
├── src/
│   ├── core/                      # Motor matemático de cálculo y baremos
│   │   ├── engine/                # Calculadoras WISC-V y WAIS-IV
│   │   ├── tables/                # Baremos normativos y tablas compuestas
│   │   └── types/                 # Tipado estricto en TypeScript
│   ├── ui/                        # Interfaz gráfica de usuario
│   │   ├── components/charts/     # Campana de Gauss y gráficos de perfil
│   │   ├── components/entry/      # Formularios de captura rápida
│   │   └── components/report/     # Módulo de informe clínico y PDF
│   └── tests/                     # Suite de pruebas E2E y de estrés
└── README.md                      # Manual del sistema
```

---
*Desarrollado para profesionales de la psicología clínica, educativa y neuropsicología.*
