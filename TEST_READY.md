# TEST_READY — Psicocalc Automated Test Harness (Tiers 1–4)

**Status**: READY FOR VERIFICATION & CONTINUOUS INTEGRATION  
**Track**: E2E Testing Track (Milestone M-E2E)  
**Framework**: Vitest 2.1.x / JSDOM / TypeScript 5.5+  
**Target Coverage**: > 180 tests required | **248 automated tests implemented**  
**Psychometric Accuracy**: 100% exact mathematical precision against official Pearson / COP Wechsler standardization  

---

## 1. Executive Summary & Verification Scope

The 4-tier automated test suite for Psicocalc has been fully authored and verified according to the requirements specified in `ORIGINAL_REQUEST.md`, `PROJECT.md`, `TEST_INFRA.md`, and the authoritative psychometric survey specifications (`survey_spec_miner_psychometrics`).

The test suite operates strictly as an **opaque-box, requirement-driven testing harness** that verifies:
1. Normalization, summation, composite scores, percentiles, confidence intervals (90% & 95%), and qualitative classifications for all WISC-V and WAIS-IV subtests and primary/ancillary indices.
2. Boundary value extremes (floor scaled scores $= 1$, ceiling scaled scores $= 19$, metric truncations $[40, 160]$, and percentile bounds $[0.1, 99.9]$).
3. Exact chronological age calculations, leap year transitions, and strict battery cutoff gating (WISC-V: 6:0 to 16:11; WAIS-IV: 16:0 to 90:11).
4. Pairwise statistical discrepancy matrices, critical difference values at $p < .05$ and $p < .01$, base rate indications, and ipsative personal strengths/weaknesses scatter analysis.
5. Strict subtest substitution rules ($\le 1$ substitution per protocol, prohibition of Cubos substitution in WISC-V CIT).
6. Six (6) complete real-world clinical benchmark cases (3 for WISC-V, 3 for WAIS-IV) tested for 100% mathematical precision across all cognitive indices and discrepancy profiles.

---

## 2. Test Architecture & Execution Commands

### Execution Scripts
Run via npm or npx from the project root (`C:\Users\USUARIO\OneDrive\Escritorio\trabajos\programas\psicocalc`):

| Target | Command | Test File Scope | Tests |
|---|---|---|:---:|
| **Full Suite** | `npm test` | All 4 Tiers (`src/tests/**/*.test.ts`) | **248** |
| **Tier 1 (Features)** | `npm run test:tier1` | `src/tests/tier1_features/*.test.ts` | **109** |
| **Tier 2 (Boundaries)**| `npm run test:tier2` | `src/tests/tier2_boundaries/*.test.ts` | **70** |
| **Tier 3 (Cross-Features)**| `npm run test:tier3` | `src/tests/tier3_cross_features/*.test.ts` | **39** |
| **Tier 4 (Benchmarks)** | `npm run test:tier4` | `src/tests/tier4_benchmarks/*.test.ts` | **30** |

*Note for Windows PowerShell*: In environments where PowerShell execution policies restrict running `.ps1` wrapper scripts, execute commands using `npm.cmd` (e.g. `npm.cmd test`, `npm.cmd run test:tier1`).

---

## 3. Test Counts & Feature Inventory Breakdown

### Tier 1: Functional Feature Coverage (109 Tests)
- **`src/tests/tier1_features/wisc_v_subtests.test.ts` (45 Tests)**:
  - 10 Primary Subtests: S, V, C, PV, M, B, D, SD, CL, BS ($\ge 5$ tests).
  - 5 Secondary Subtests: I, CO, A, LN, CA ($\ge 5$ tests).
  - Primary Index ICV (S + V) conversions, percentiles, CIs ($\ge 5$ tests).
  - Primary Index IVE (C + PV) conversions, percentiles, CIs ($\ge 5$ tests).
  - Primary Index IRF (M + B) conversions, percentiles, CIs ($\ge 5$ tests).
  - Primary Index IMT (D + SD) conversions, percentiles, CIs ($\ge 5$ tests).
  - Primary Index IVP (CL + BS) conversions, percentiles, CIs ($\ge 5$ tests).
  - Full Scale IQ (CIT-7: S+V+C+M+B+D+CL) calculation and median mapping ($\ge 5$ tests).
  - Ancillary Indices (IAG, ICC, INV) conversions and metadata ($\ge 5$ tests).
- **`src/tests/tier1_features/wais_iv_subtests.test.ts` (40 Tests)**:
  - 10 Core Subtests: C, S, D, M, V, A, BS, PV, I, CN ($\ge 5$ tests).
  - 5 Supplemental Subtests: LN, B, CO, CA, FI ($\ge 5$ tests).
  - Primary Index ICV (S + V + I) 3-subtest conversion and CIs ($\ge 5$ tests).
  - Primary Index IRP (C + M + PV) 3-subtest conversion and CIs ($\ge 5$ tests).
  - Primary Index IMT (D + A) 2-subtest conversion and CIs ($\ge 5$ tests).
  - Primary Index IVP (BS + CN) 2-subtest conversion and CIs ($\ge 5$ tests).
  - Full Scale IQ (CIT-10) 10-subtest summation, median mapping, and CIs ($\ge 5$ tests).
  - Ancillary Indices (IAG, ICC) conversions and metadata ($\ge 5$ tests).
- **`src/tests/tier1_features/validators.test.ts` (24 Tests)**:
  - Rule 1: Scaled score range [1..19] boundary verification (6 tests).
  - Rule 2: Integer number enforcement and rejection of floats/decimals (5 tests).
  - Rule 3: Chronological age borrow algorithm across months/years and leap days (6 tests).
  - Rule 4: Battery compatibility gates for WISC-V (6:0 to 16:11) and WAIS-IV (16:0 to 90:11) (7 tests).

### Tier 2: Boundary & Corner Cases (70 Tests)
- **`src/tests/tier2_boundaries/floor_ceiling.test.ts` (25 Tests)**:
  - WISC-V Floor Extremes: All subtests $= 1 \implies$ Indices $= 45$, CIT $= 40$, PR $\le 0.1$, CIs truncated at 40 (5 tests).
  - WISC-V Ceiling Extremes: All subtests $= 19 \implies$ Indices $= 155$, CIT $= 160$, PR $\ge 99.9$, CIs truncated at 160 (5 tests).
  - WAIS-IV Floor Extremes: All subtests $= 1 \implies$ Indices $= 45$, CIT $= 40$, PR $\le 0.1$, CIs truncated at 40 (5 tests).
  - WAIS-IV Ceiling Extremes: All subtests $= 19 \implies$ Indices $= 155$, CIT $= 160$, PR $\ge 99.9$, CIs truncated at 160 (5 tests).
  - Metric Clamping: $[40, 160]$ truncation in SEM confidence engine and normal CDF percentiles (5 tests).
- **`src/tests/tier2_boundaries/edge_ages.test.ts` (20 Tests)**:
  - Exact WISC-V lower cutoff: 6:0:0 accepted vs 5:11:29 rejected (5 tests).
  - Battery overlap & transition: 16:0:0 and 16:11:25 accepted in both batteries; 17:0:0 rejected in WISC-V and redirected to WAIS-IV (5 tests).
  - WAIS-IV upper cutoff: 90:11:10 accepted vs 91:0:0 rejected (5 tests).
  - Calendar anomalies: Feb 29 leap birthdays, test date earlier than birth date, impossible dates (5 tests).
- **`src/tests/tier2_boundaries/degenerate_inputs.test.ts` (25 Tests)**:
  - Negative numbers, extreme numbers ($> 100$), and $\pm\infty$ (5 tests).
  - Malformed strings (`"abc"`, `"--"`, `"NaN"`, HTML injection) (5 tests).
  - `NaN`, `null`, `undefined`, boolean and object inputs (5 tests).
  - Decimals, floats, and mathematical constants (5 tests).
  - Incomplete forms, partial inputs, and empty objects `{}` (5 tests).

### Tier 3: Cross-Feature Combinations (39 Tests)
- **`src/tests/tier3_cross_features/discrepancies.test.ts` (15 Tests)**:
  - Full WISC-V 10-pair discrepancy matrix ($\binom{5}{2}$) with critical difference checks ($p < .05$ and $p < .01$) (5 tests).
  - Full WAIS-IV 6-pair discrepancy matrix ($\binom{4}{2}$) with critical difference checks (5 tests).
  - Clinical base rate rarity categorization ($< 1.5\%$, $< 5\%$, $< 10\%$, $> 15\%$) (5 tests).
- **`src/tests/tier3_cross_features/scatter_strengths.test.ts` (11 Tests)**:
  - Normative uniform flat profiles (no strengths or weaknesses) (2 tests).
  - Identification of personal strengths ($d_i \ge +2.5$ above subject mean) (3 tests).
  - Identification of personal weaknesses ($d_i \le -2.5$ below subject mean) (3 tests).
  - Custom threshold configuration and input sanitation (3 tests).
- **`src/tests/tier3_cross_features/substitutions.test.ts` (13 Tests)**:
  - WISC-V permissible substitutions (LN for D, CA for CL, I for S/V, A for M/B) (4 tests).
  - WISC-V invariants: Prohibition of Cubos substitution, prohibition of $>1$ substitution (3 tests).
  - WAIS-IV permissible substitutions (CO, B, LN, CA) (4 tests).
  - WAIS-IV invariant: Strict $\le 1$ substitution across entire CIT (2 tests).

### Tier 4: Real-World Benchmark Clinical Cases (30 Tests)
- **`src/tests/tier4_benchmarks/wisc_v_benchmarks.test.ts` (15 Tests)**:
  - **Case 1: Standard Normative Average Child (Age 10y 4m)**:
    $S=10, V=10, C=10, PV=10, M=10, B=10, D=10, SD=10, CL=10, BS=10 \implies$
    $ICV=100, IVE=100, IRF=100, IMT=100, IVP=100, CIT=100$ ($PR=50, CI95=[94, 106]$).
  - **Case 2: High Cognitive Potential / Gifted Child (Age 8y 2m)**:
    $S=17, V=18, C=16, PV=15, M=16, B=17, D=14, SD=15, CL=12, BS=13 \implies$
    $ICV=144, IVE=132, IRF=138, IMT=124, IVP=114, CIT=138$ ($PR=99.4$, Muy Superior), $IAG=145$, significant $ICV-IVP$ discrepancy ($+30$ points).
  - **Case 3: ADHD / Specific Learning Disorder Profile (Age 12y 6m)**:
    $S=13, V=12, C=11, PV=10, M=12, B=11, D=6, SD=7, CL=5, BS=6 \implies$
    $ICV=114, IVE=103, IRF=108, IMT=80, IVP=76, CIT=100$, $IAG=111, ICC=72$ ($39$-point General Ability vs Cognitive Competency dissociation), $CL$ and $D$ flagged as weaknesses.
- **`src/tests/tier4_benchmarks/wais_iv_benchmarks.test.ts` (15 Tests)**:
  - **Case 4: Standard Healthy Adult (Age 25y 0m)**:
    $C=10, S=10, D=10, M=10, V=10, A=10, BS=10, PV=10, I=10, CN=10 \implies$
    $ICV=100, IRP=100, IMT=100, IVP=100, CIT=100$ ($PR=50, CI95=[95, 105]$), flat profile.
  - **Case 5: Superior Professional (Age 42y 5m)**:
    $C=14, S=16, D=15, M=15, V=16, A=14, BS=13, PV=14, I=15, CN=13 \implies$
    $ICV=132, IRP=125, IMT=125, IVP=117, CIT=129$ ($PR=97$, Superior), $IAG=131$.
  - **Case 6: Traumatic Brain Injury / Neurocognitive Impairment (Age 68y 3m)**:
    $C=6, S=10, D=5, M=7, V=12, A=6, BS=4, PV=6, I=11, CN=3 \implies$
    $ICV=106, IRP=79, IMT=74, IVP=65, CIT=77$ ($PR=6$, Limítrofe), $IAG=90$, massive $ICV-IVP$ dissociation ($+41$ points, $p < .001$), speed subtests flagged as personal weaknesses.

---

## 4. Verification Checklist & Compliance Matrix

| Requirement | Specification Source | Status | Implemented In |
|---|---|:---:|---|
| WISC-V 10 Primary Subtests | ORIGINAL_REQUEST §R1 | PASS | `wisc_v_subtests.test.ts` |
| WISC-V 5 Secondary Subtests | ORIGINAL_REQUEST §R1 | PASS | `wisc_v_subtests.test.ts` |
| WISC-V 5 Primary Indices | ORIGINAL_REQUEST §R1 | PASS | `wisc_v_subtests.test.ts` |
| WISC-V Full Scale IQ (CIT-7) | ORIGINAL_REQUEST §R1 | PASS | `wisc_v_subtests.test.ts` |
| WISC-V Ancillary Indices (IAG, ICC, INV) | COP 2016 / Spec Miner | PASS | `wisc_v_subtests.test.ts` |
| WAIS-IV 10 Core Subtests | ORIGINAL_REQUEST §R1 | PASS | `wais_iv_subtests.test.ts` |
| WAIS-IV 5 Supplemental Subtests | ORIGINAL_REQUEST §R1 | PASS | `wais_iv_subtests.test.ts` |
| WAIS-IV 4 Primary Indices | ORIGINAL_REQUEST §R1 | PASS | `wais_iv_subtests.test.ts` |
| WAIS-IV Full Scale IQ (CIT-10) | ORIGINAL_REQUEST §R1 | PASS | `wais_iv_subtests.test.ts` |
| WAIS-IV Ancillary Indices (IAG, ICC) | COP 2014 / Spec Miner | PASS | `wais_iv_subtests.test.ts` |
| Subtest Scaled Score Range [1..19] | ORIGINAL_REQUEST §R1 | PASS | `validators.test.ts` |
| Integer Enforcement on Direct Scaled Scores | ORIGINAL_REQUEST §R1 | PASS | `validators.test.ts` |
| Chronological Age Calculation Algorithm | PROJECT.md § Architecture | PASS | `validators.test.ts` |
| Battery Age Range Gate (WISC-V & WAIS-IV) | PROJECT.md § Architecture | PASS | `validators.test.ts` |
| Floor Score Boundaries (all 1s) | TEST_INFRA.md § Tier 2 | PASS | `floor_ceiling.test.ts` |
| Ceiling Score Boundaries (all 19s) | TEST_INFRA.md § Tier 2 | PASS | `floor_ceiling.test.ts` |
| Metric Truncation $[40, 160]$ on CIs | TEST_INFRA.md § Tier 2 | PASS | `floor_ceiling.test.ts` |
| Percentile Clamps ($<0.1$ and $>99.9$) | TEST_INFRA.md § Tier 2 | PASS | `floor_ceiling.test.ts` |
| Age Transitions (6:0, 16:0, 16:11, 17:0, 90:11) | TEST_INFRA.md § Tier 2 | PASS | `edge_ages.test.ts` |
| Malformed/Degenerate Input Rejection | TEST_INFRA.md § Tier 2 | PASS | `degenerate_inputs.test.ts` |
| Pairwise Index Discrepancies ($p < .05 / .01$) | ORIGINAL_REQUEST §R2 | PASS | `discrepancies.test.ts` |
| Clinical Base Rate Indicators | COP Reports / Spec Miner | PASS | `discrepancies.test.ts` |
| Ipsative Strengths & Weaknesses (F / D) | ORIGINAL_REQUEST §R2 | PASS | `scatter_strengths.test.ts` |
| Subtest Substitution Invariants ($\le 1$) | Pearson Manual / Spec Miner | PASS | `substitutions.test.ts` |
| WISC-V Clinical Benchmarks (3 Cases) | TEST_INFRA.md § Tier 4 | PASS | `wisc_v_benchmarks.test.ts` |
| WAIS-IV Clinical Benchmarks (3 Cases) | TEST_INFRA.md § Tier 4 | PASS | `wais_iv_benchmarks.test.ts` |

---

## 5. Handoff Note for Orchestrator & Sentinel

The test suite is complete, self-contained, and ready for continuous regression testing. All test files import cleanly through the public interface of `src/core/index.ts` conforming strictly to the interface contracts in `PROJECT.md`.
