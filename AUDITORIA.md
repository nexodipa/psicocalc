# Auditoría de instrumentos (27 de octubre de 2026)

Revisión hecha sobre el código de `src/core` y el registro `TestRegistry.ts`. Es una auditoría técnica interna, no una validación clínica ni una revisión legal.

## Alcance de la revisión

- **Línea por línea:** PHQ-9, GAD-7, SDQ (ítems, subescalas, ítems invertidos y puntos de corte), MoCA (ajuste por escolaridad y bandas), y la estructura de cálculo de WISC-V y WAIS-IV (ya reemplazada por una fórmula genérica).
- **Por muestreo:** el calculador de MMPI-3, PAI y MCMI-IV (`personalityCalculators.ts` y `personalityNorms.ts`).
- **Solo por metadatos del registro:** el resto de instrumentos. No se han revisado sus tablas ni su lógica de puntuación una por una.

## Resultados

| Instrumento | Resultado | Observaciones |
| --- | --- | --- |
| PHQ-9 | Coherente con la puntuación publicada | Bandas 0-4, 5-9, 10-14, 15-19, 20-27 y algoritmo de episodio depresivo mayor (ítem 1 o 2 en 2 o más, y al menos 5 ítems sintomáticos, contando el ítem 9 desde 1) correctos. El texto de aviso del ítem 9 usa la palabra "pericial", que debe sustituirse por una redacción de cribado |
| GAD-7 | Coherente con la puntuación publicada | Bandas 0-4, 5-9, 10-14, 15-21 y punto de corte de 10 correctos |
| SDQ | Estructura y puntos de corte coherentes con las bandas de tres categorías publicadas por Goodman (padres, autoinforme, docentes), a confirmar contra sdqinfo.org | Subescalas e ítems invertidos (7, 11, 14, 21, 25) correctos. Los textos de los ítems en español no parecen ser la traducción oficial, y el SDQ exige usar las versiones oficiales sin modificar |
| MoCA | Regla de ajuste (+1 punto con 12 años de estudio o menos) y corte de 26 coherentes | Instrumento con licencia y formación obligatoria de uso. No debe distribuirse como herramienta pública |
| WISC-V, WAIS-IV | Sin datos comerciales tras el cambio de hoy | Usan una fórmula genérica ilustrativa. Los resultados no son comparables con los de la prueba real |
| MMPI-3, PAI, MCMI-IV (y por extensión MMPI-2-RF, MMPI-A-RF, MACI-IV) | No fiable | Convierten puntuaciones brutas a T con una media y una desviación por escala (`mean`, `sd`) cuyo origen no está documentado y que no corresponden al método real de estas pruebas (T uniformes y tablas propias). Además fijan umbrales de alerta, como "riesgo crítico inminente" con SUI de 80 o más, que no proceden de ningún manual |
| Resto de pruebas comerciales (Raven 2, TONI-4, IPP-R, D2-R, BRIEF-A, CUMANES, NEURO-KID, LOLE, BFQ, STAXI-2, LSB-50, ABAS-3, Vineland-3, DP-3, SENA, CBCL, BYI-2, CECAD, IAC, ICCP, NEUROPSI Breve, MMSE) | Sin revisar en detalle | Pertenecen a editoriales con derechos reservados (TEA, Pearson, PAR, WPS, Hogrefe, ASEBA, Manual Moderno). El MMSE tiene además derechos de PAR |
| HTP | Sin revisar | Técnica proyectiva con validez discutida; el borrador narrativo no es un diagnóstico |

## Conclusiones

1. Solo tres instrumentos de la lista son razonables para una demostración pública: PHQ-9, GAD-7 y SDQ (este último, usando el texto oficial).
2. Los instrumentos de personalidad producen puntuaciones T y alertas de riesgo que parecen oficiales y no lo son. Es el mayor riesgo del repositorio y no deben mostrarse en una demo pública.
3. El historial de git conserva las tablas anteriores de WISC-V y WAIS-IV. Solo un repositorio privado o una reescritura del historial eliminan ese rastro.

## Acciones recomendadas

- Separar los instrumentos comerciales del paquete público, o ocultarlos tras una bandera de compilación desactivada por defecto.
- Sustituir en el SDQ los textos de los ítems por los oficiales de sdqinfo.org, o retirar los textos y dejar solo la captura de puntuaciones por ítem.
- Cambiar "pericial" por lenguaje de cribado en el aviso del PHQ-9.
- No añadir más instrumentos hasta resolver lo anterior.
