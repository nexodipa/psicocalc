# Project: Psicocalc — Plataforma Web Psicométrica para WISC-V y WAIS-IV

## Architecture
Psicocalc está estructurada siguiendo una separación estricta entre el dominio matemático/psicométrico puro y la capa de presentación/exportación web:

1. **`src/core/` (Motor Psicométrico Puro — Zero UI Dependencies)**:
   - Contiene tipos de dominio inmutables (`ScaledScore` [1..19], `CompositeScore` [40..160], `BatteryType`, `PatientRecord`).
   - Algoritmos matemáticos deterministas: cálculo de puntuaciones compuestas a partir de suma de escalares, error estándar de medida (SEM), intervalos de confianza (90% y 95%), función de distribución acumulada normal ($\Phi(z)$) para percentiles exactos, y matrices de discrepancia estadística ($p < .05, p < .01$).
   - Tablas normativas y baremos para WISC-V (10 primarios, 5 secundarios, 5 índices primarios, 5 secundarios, CIT-7) y WAIS-IV (10 core, 5 suplementarios, 4 índices primarios, ICG/ICC, CIT-10).
   - Validadores estrictos de entrada (rangos [1..19], enteros, fechas y rangos etarios: WISC-V 6:0-16:11, WAIS-IV 16:0-90:11).

2. **`src/ui/` (Interfaz React 18 + Tailwind CSS + Gráficos SVG Vectoriales)**:
   - Componentes de entrada rápida de datos con navegación lineal por teclado (`Enter`/`Tab`) y atajo de auto-avance numérico (`2..9` y `10..19`).
   - Validación reactiva con alertas visuales inmediatas y bloqueo de cálculos corruptos.
   - Componentes de gráficos vectoriales en SVG puro (`ProfileScatterPlot.tsx` y `BellCurveChart.tsx`): 0 KB de librerías externas, resolución infinita vectorial para pantalla e impresión.
   - Vista de informe clínico formal pericial A4 (`ClinicalReportView.tsx`) con anonimización en 1-clic, cálculo de edad cronológica exacta, motor de narrativa clínica interpretativa automatizada (análisis de homogeneidad del CIT, fortalezas/debilidades) y bloque de certificación colegial.
   - Hoja de estilos `@media print` (`print.css`): supresión total de controles de interfaz web, paginación limpia sin cortes huérfanos y renderizado vectorial nítido para exportación PDF en 1 clic vía `window.print()`.

3. **`src/tests/` (Suite de Pruebas Automatizadas en Vitest)**:
   - Arquitectura de pruebas de 4 Tiers (Tiers 1-4) derivada de requerimientos de usuario para validación con 100% de precisión matemática.

4. **Entorno de Ejecución Local en Windows**:
   - Scripts `start.bat` y `launch.bat` que verifican Node.js, instalan dependencias y ejecutan Vite en modo `--open`.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | WISC-V 10 Subtests Primarios | Entrada y validación de escalares (1-19) para S, V, C, PV, M, B, D, SD, CL, BS | M1 | Survey Spec Miner |
| 2 | WISC-V 5 Subtests Secundarios | Entrada de I, CO, A, LN, CA para índices complementarios o sustitución única | M1 | Survey Spec Miner |
| 3 | WISC-V 5 Índices Primarios | Cálculo exacto de ICV, IVE, IRF, IMT, IVP (suma de pares, puntuación compuesta, percentil, C.I.) | M1 | Survey Spec Miner |
| 4 | WISC-V CIT Fundamental (CIT-7) | Cálculo del Coeficiente Intelectual Total con exactamente 7 subtests core (S, V, C, M, B, D, CL) | M1 | Survey Spec Miner |
| 5 | WISC-V Índices Secundarios | Cómputo de IRC, IMTA, INV, ICG (Capacidad General) e ICC (Competencia Cognitiva) | M1 | Survey Spec Miner |
| 6 | WAIS-IV 10 Subtests Principales | Entrada y validación de escalares (1-19) para C, S, D, M, V, A, BS, PV, I, CN | M1 | Survey Spec Miner |
| 7 | WAIS-IV 5 Subtests Suplementarios | Entrada de LN, B, CO, CA, FI para sustitución o índices ICG/ICC con validación etaria | M1 | Survey Spec Miner |
| 8 | WAIS-IV 4 Índices Primarios | Cálculo de ICV (3 subtests), IRP (3 subtests), IMT (2 subtests), IVP (2 subtests) | M1 | Survey Spec Miner |
| 9 | WAIS-IV CIT Principal (CIT-10) | Cálculo del CI Total con los 10 subtests principales y regla de $\le 1$ sustitución | M1 | Survey Spec Miner |
| 10 | WAIS-IV Índices Secundarios | Cómputo de ICG (6 subtests de ICV+IRP) e ICC (4 subtests de IMT+IVP) | M1 | Survey Spec Miner |
| 11 | Clasificación Cualitativa Wechsler | Mapeo determinista de compuestas a categorías (Muy Superior, Superior, Promedio, etc.) | M1 | Survey Spec Miner |
| 12 | Intervalos de Confianza (SEM) | Cálculo de márgenes al 90% y 95% con truncamiento automático en límites [40, 160] | M1 | Survey Spec Miner |
| 13 | Rango Percentil Poblacional | Mapeo continuo basado en $\Phi(z)$ con extremos controlados ($<0.1$ y $>99.9$) | M1 | Survey Spec Miner |
| 14 | Análisis de Discrepancias | Matriz de discrepancias inter-índices con valores críticos $p < .05$ y $p < .01$ | M1 | Survey Spec Miner |
| 15 | Fortalezas y Debilidades (Ipsativo) | Identificación de F/D comparando subtests frente a la media personal $\overline{PE}$ | M1 | Survey Spec Miner |
| 16 | Validación de Rango y Edad | Rechazo de valores fuera de [1..19], enteros, y edades fuera de rango WISC-V o WAIS-IV | M1 | Survey Spec Miner |
| 17 | Navegación por Teclado Ultra-Rápida | Traversal lineal (Tab/Enter/Shift+Tab) y atajo de auto-avance numérico (2..9 y 10..19) | M2 | Survey UI Explorer |
| 18 | Validación Reactiva en Tiempo Real | Bordes carmesí, alertas visuales inmediatas y bloqueo de cálculos inválidos | M2 | Survey UI Explorer |
| 19 | Gráfico de Perfil Cognitivo SVG | Gráfico vectorial SVG de subtests (1-19), línea de media personal, etiquetas F/D y bigotes C.I. | M2 | Survey UI Explorer |
| 20 | Campana de Gauss Reactiva SVG | Curva normal SVG con 7 zonas diagnósticas sombreadas y marcadores dinámicos para CIT e índices | M2 | Survey UI Explorer |
| 21 | Encabezado Institucional y Paciente | Datos anonimizables en 1-clic, cálculo de edad cronológica exacta (años, meses, días) | M3 | Survey UI Explorer |
| 22 | Tablas Clínicas Estructuradas | Tablas formateadas de índices primarios, subtests, percentiles y clasificaciones | M3 | Survey UI Explorer |
| 23 | Motor de Narrativa Clínica Automática | Generación de informe pericial con análisis de homogeneidad del CIT y síntesis por dominios | M3 | Survey UI Explorer |
| 24 | Exportación PDF Limpia en 1 Clic | Estilos `@media print` A4 sin controles de UI web, paginación limpia y vectores nítidos | M3 | Survey UI Explorer |
| 25 | Ejecutable Local Windows 1-Clic | Scripts `start.bat` y `launch.bat` con verificación de Node.js y auto-apertura del navegador | M3 | Survey Tech Explorer |
| 26 | Test Infraestructura & Runners | Configuración de Vitest con JSDOM y scripts `npm run test:tier1` a `test:tier4` | M-E2E | Survey Tech Explorer |
| 27 | Tier 1: Cobertura Funcional | $\ge 5$ pruebas por subtest, índice, reglas de validación y conversiones | M-E2E | Survey Tech Explorer |
| 28 | Tier 2: Casos Límite y Suelo/Techo | $\ge 5$ pruebas para suelo ($1$), techo ($19$), edades límite y datos malformados | M-E2E | Survey Tech Explorer |
| 29 | Tier 3: Combinaciones Cruzadas | Pruebas de matrices de discrepancia, análisis de dispersión F/D y sustitución | M-E2E | Survey Tech Explorer |
| 30 | Tier 4: Casos Testigo Clínicos Reales | 6 casos clínicos benchmark completos (3 WISC-V y 3 WAIS-IV) con 100% de precisión matemática | M-E2E | Survey Tech Explorer |
| 31 | Acreditación Final E2E y Tier 5 | Ejecución del 100% de la suite de pruebas E2E y endurecimiento adversarial Tier 5 | M4 | Project Orchestrator |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| **M-E2E** | E2E Testing Track | Harness Vitest + Suite Completa Tiers 1-4 derivada de requerimientos (F26-F30) $\to$ Publica `TEST_READY.md` | none | DONE (TEST_READY.md publicado, 248 tests activos) |
| **M1** | Core Psychometric & Math Engine | Tipos puros, modelos de conversión, tablas normativas WISC-V y WAIS-IV, SEM/CI, percentiles, discrepancias, validadores (F1-F16) | none | DONE (Audit CLEAN, 329 tests passing, 0 errors) |
| **M2** | Interactive UI, Rapid Entry & Reactive Charts | UI React/Tailwind, entrada rápida por teclado, validación reactiva, perfil cognitivo SVG y campana de Gauss SVG (F17-F20) | M1 | DONE (Implementado y verificado, componentes reactivos, 0 KB libs externas) |
| **M3** | Clinical Report Engine, PDF Export & 1-Click Launch | Reporte pericial A4, anonimización, narrativa automática, `@media print` para PDF limpio en 1-clic, `start.bat`/`launch.bat` (F21-F25) | M1, M2 | DONE (Implementado y empaquetado, dist/ generado, start.bat verificado) |
| **M4** | Final Milestone & Adversarial Hardening | Fase 1: 100% de pase de pruebas E2E (Tiers 1-4). Fase 2: Auditoría forense y endurecimiento adversarial Tier 5 (F31) | M-E2E, M3 | DONE (Tier 5 implementado, auditoría forense 100% CLEAN, producción lista) |

---

## Interface Contracts

### `src/core/types/psychometrics.ts` ↔ UI y Reportes
```typescript
export type BatteryType = 'WISC-V' | 'WAIS-IV';

export type SubtestId =
  // WISC-V Primarios
  | 'S' | 'V' | 'C' | 'PV' | 'M' | 'B' | 'D' | 'SD' | 'CL' | 'BS'
  // WISC-V Secundarios
  | 'I' | 'CO' | 'A' | 'LN' | 'CA'
  // WAIS-IV Core
  | 'WAIS_C' | 'WAIS_S' | 'WAIS_D' | 'WAIS_M' | 'WAIS_V' | 'WAIS_A' | 'WAIS_BS' | 'WAIS_PV' | 'WAIS_I' | 'WAIS_CN'
  // WAIS-IV Suplementarios
  | 'WAIS_LN' | 'WAIS_B' | 'WAIS_CO' | 'WAIS_CA' | 'WAIS_FI';

export type QualitativeCategory =
  | 'Muy Superior'
  | 'Superior'
  | 'Promedio Alto'
  | 'Promedio'
  | 'Promedio Bajo'
  | 'Limítrofe'
  | 'Extremadamente Bajo';

export interface ConfidenceInterval {
  lower: number;
  upper: number;
  level: 90 | 95;
}

export interface CompositeResult {
  id: string;
  name: string;
  sumScaled: number;
  compositeScore: number;
  percentile: number;
  ci90: ConfidenceInterval;
  ci95: ConfidenceInterval;
  qualitative: QualitativeCategory;
}

export interface DiscrepancyResult {
  pair: [string, string];
  diff: number;
  isSignificant05: boolean;
  isSignificant01: boolean;
  baseRateDesc?: string;
}

export interface StrengthWeaknessResult {
  subtestId: string;
  score: number;
  difference: number;
  classification: 'Fortaleza' | 'Debilidad' | 'Promedio';
}

export interface PatientDemographics {
  nameOrId: string;
  birthDate: string; // YYYY-MM-DD
  testDate: string;  // YYYY-MM-DD
  examiner: string;
  reasonForEvaluation?: string;
  isAnonymized: boolean;
}
```

### `src/core/engine/` Funciones Exportadas
```typescript
// Cálculo WISC-V
export function calculateWiscV(
  subtests: Partial<Record<SubtestId, number>>
): {
  primaryIndices: Record<'ICV' | 'IVE' | 'IRF' | 'IMT' | 'IVP', CompositeResult | null>;
  cit: CompositeResult | null;
  ancillaryIndices: Record<'IAG' | 'ICC' | 'INV', CompositeResult | null>;
  discrepancies: DiscrepancyResult[];
  strengthsWeaknesses: StrengthWeaknessResult[];
  isCompleteCit: boolean;
};

// Cálculo WAIS-IV
export function calculateWaisIV(
  subtests: Partial<Record<SubtestId, number>>
): {
  primaryIndices: Record<'ICV' | 'IRP' | 'IMT' | 'IVP', CompositeResult | null>;
  cit: CompositeResult | null;
  ancillaryIndices: Record<'IAG' | 'ICC', CompositeResult | null>;
  discrepancies: DiscrepancyResult[];
  strengthsWeaknesses: StrengthWeaknessResult[];
  isCompleteCit: boolean;
};

// Validador de Edad
export function validateAgeAndBattery(
  birthDate: string,
  testDate: string,
  battery: BatteryType
): {
  isValid: boolean;
  years: number;
  months: number;
  days: number;
  errorMessage?: string;
};
```

---

## Code Layout
```
C:\Users\USUARIO\OneDrive\Escritorio\trabajos\programas\psicocalc\
├── .agents/                        # Metadatos de orquestación y agentes
├── public/
│   └── favicon.svg
├── src/
│   ├── core/                       # Motor matemático y psicométrico puro (TypeScript, 0 dependencias UI)
│   │   ├── types/
│   │   │   └── psychometrics.ts
│   │   ├── tables/
│   │   │   ├── wisc_v_norms.ts
│   │   │   ├── wais_iv_norms.ts
│   │   │   └── qualitative.ts
│   │   └── engine/
│   │       ├── normalDist.ts
│   │       ├── validator.ts
│   │       ├── wisc_v_calculator.ts
│   │       ├── wais_iv_calculator.ts
│   │       ├── discrepancy.ts
│   │       └── scatter.ts
│   ├── ui/                         # Interfaz React 18 + Tailwind CSS + Gráficos SVG
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppHeader.tsx
│   │   │   │   └── BatterySelector.tsx
│   │   │   ├── entry/
│   │   │   │   ├── DemographicsCard.tsx
│   │   │   │   ├── SubtestInputGrid.tsx
│   │   │   │   └── CompositeScoreCards.tsx
│   │   │   ├── charts/
│   │   │   │   ├── ProfileScatterChart.tsx  # SVG puro interactivo y para impresión
│   │   │   │   └── GaussianBellCurve.tsx    # SVG puro curva normal y franjas cualitativas
│   │   │   └── report/
│   │   │       ├── ClinicalReportView.tsx   # Contenedor del informe pericial formal A4
│   │   │       ├── AutomatedNarrative.tsx   # Motor generador de texto clínico interpretativo
│   │   │       └── SignatureBlock.tsx       # Firma, fecha y acreditación colegial
│   │   ├── hooks/
│   │   │   ├── usePsychometrics.ts
│   │   │   └── useKeyboardNavigation.ts
│   │   ├── styles/
│   │   │   └── print.css                    # Hoja de estilos @media print de alta fidelidad
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── tests/                      # Suite de Pruebas Vitest (Tiers 1 a 4)
│       ├── tier1_features/
│       │   ├── wisc_v_subtests.test.ts
│       │   ├── wais_iv_subtests.test.ts
│       │   └── validators.test.ts
│       ├── tier2_boundaries/
│       │   ├── floor_ceiling.test.ts
│       │   └── edge_ages.test.ts
│       ├── tier3_cross_features/
│       │   ├── discrepancies.test.ts
│       │   └── scatter_strengths.test.ts
│       └── tier4_benchmarks/
│           ├── wisc_v_benchmarks.test.ts
│           └── wais_iv_benchmarks.test.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── start.bat                       # Script 1-clic con detección de Node y apertura de navegador
├── launch.bat                      # Lanzador alternativo con diagnóstico
├── PROJECT.md                      # Registro maestro del proyecto
├── TEST_INFRA.md                   # Especificación técnica del track de pruebas
└── TEST_READY.md                   # Publicado cuando la suite E2E esté lista
```
