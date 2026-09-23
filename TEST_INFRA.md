# E2E Test Infra: Psicocalc

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial Testing + Real-World Workload Testing.
- 100% mathematical precision for psychometric conversions, standard composite scores, percentiles, and confidence intervals.

## Feature Inventory
| # | Feature | Source (Requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | WISC-V 10 Subtests Primarios | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | WISC-V 5 Subtests Secundarios | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 3 | WISC-V 5 Índices Primarios | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 4 | WISC-V CIT Fundamental (CIT-7) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 5 | WISC-V Índices Secundarios | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 6 | WAIS-IV 10 Subtests Principales | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 7 | WAIS-IV 5 Subtests Suplementarios | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 8 | WAIS-IV 4 Índices Primarios | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 9 | WAIS-IV CIT Principal (CIT-10) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 10 | WAIS-IV Índices Secundarios | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 11 | Clasificación Cualitativa Wechsler | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 12 | Intervalos de Confianza (SEM) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 13 | Rango Percentil Poblacional | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 14 | Análisis de Discrepancias | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 15 | Fortalezas y Debilidades (Ipsativo) | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 16 | Validación de Rango y Edad | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |

## Test Architecture
- **Test Runner**: Vitest (`npm test` o `npx vitest run`)
- **Execution Script**:
  - `npm run test:tier1` -> `vitest run src/tests/tier1_features`
  - `npm run test:tier2` -> `vitest run src/tests/tier2_boundaries`
  - `npm run test:tier3` -> `vitest run src/tests/tier3_cross_features`
  - `npm run test:tier4` -> `vitest run src/tests/tier4_benchmarks`
- **Pass/Fail Semantics**: All tests must pass with exit code 0 and 0 assertions failed.
- **Directory Layout**:
  ```
  src/tests/
  ├── tier1_features/
  │   ├── wisc_v_subtests.test.ts
  │   ├── wais_iv_subtests.test.ts
  │   └── validators.test.ts
  ├── tier2_boundaries/
  │   ├── floor_ceiling.test.ts
  │   └── edge_ages.test.ts
  ├── tier3_cross_features/
  │   ├── discrepancies.test.ts
  │   └── scatter_strengths.test.ts
  └── tier4_benchmarks/
      ├── wisc_v_benchmarks.test.ts
      └── wais_iv_benchmarks.test.ts
  ```

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | WISC-V Promedio Poblacional Exacto (10a 6m) | F1, F3, F4, F11, F12, F13 | Medium |
| 2 | WISC-V Altas Capacidades / Superdotación (8a 2m) | F1, F3, F4, F11, F12, F13, F14, F15 | High |
| 3 | WISC-V Perfil TDAH / Disarmónico (12a 6m) | F1, F3, F4, F5, F11, F12, F13, F14, F15 | High |
| 4 | WAIS-IV Promedio Poblacional Exacto (25a 0m) | F6, F8, F9, F11, F12, F13 | Medium |
| 5 | WAIS-IV Perfil Superior Profesional (42a 5m) | F6, F8, F9, F10, F11, F12, F13, F14 | High |
| 6 | WAIS-IV Deterioro Neurocognitivo / TCE (68a 3m) | F6, F8, F9, F10, F11, F12, F13, F14, F15 | High |

## Coverage Thresholds
- Tier 1: $\ge 5$ test cases per feature ($5 \times 16 = \ge 80$ test cases).
- Tier 2: $\ge 5$ boundary/corner cases per feature ($5 \times 16 = \ge 80$ test cases).
- Tier 3: Pairwise coverage of major feature interactions ($\ge 16$ test cases).
- Tier 4: $\ge 6$ realistic full clinical benchmark application scenarios.
- **Total Minimum Expected**: $> 180$ rigorous unit/integration test assertions.
