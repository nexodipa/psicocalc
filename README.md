# Psicocalc: demostración técnica de captura y cálculo psicométrico

> **Estado: demostración técnica. No está validada para uso clínico ni pericial. No la uses con personas reales.**

Psicocalc es un prototipo de interfaz que muestra cómo se puede capturar puntuaciones de cuestionarios y pruebas psicológicas, calcular puntuaciones derivadas, dibujar perfiles gráficos y componer un informe en formato A4. Es un ejemplo de trabajo de interfaz y de lógica de cálculo, no un instrumento de evaluación.

---

## Qué no es

- No es software clínico validado ni cuenta con aval de un colegio profesional, un editor de pruebas o una autoridad sanitaria.
- No usa las tablas oficiales de baremación de ninguna prueba comercial. Las conversiones de sumas de puntuaciones a índices usan una fórmula genérica definida en `src/core/tables/normUtils.ts` (suma convertida a puntuación z y reescalada a media 100, desviación 15). Son valores ilustrativos que no coinciden con los del manual oficial.
- No emite diagnósticos, informes periciales ni certificaciones. El informe que genera lleva marcado que es un documento de demostración.
- Las pruebas automatizadas no equivalen a una validación clínica ni a una auditoría independiente (ver más abajo).

## Instrumentos incluidos y su estado

| Instrumento | Qué hace el prototipo | Aviso |
| --- | --- | --- |
| WISC-V y WAIS-IV | Captura de subpruebas, índices, curva y perfil de fortalezas y debilidades | Pruebas comerciales con derechos reservados. Las conversiones de suma a índice son una fórmula genérica e ilustrativa (media 100, desviación 15) y no reproducen ni aproximan las tablas oficiales. No usar con evaluados reales |
| SDQ | Cinco subescalas y total de dificultades con categorías de riesgo | Los puntos de corte proceden de la literatura publicada y no están verificados aquí contra su fuente. Comprobar las condiciones de uso del instrumento |
| PHQ-9 y GAD-7 | Puntuación total y bandas de severidad; aviso visual ante el ítem 9 del PHQ-9 | Son herramientas de cribado, no de diagnóstico. El aviso del ítem 9 es una ayuda visual, no un protocolo clínico |
| MoCA | Siete dominios, ajuste por escolaridad y punto de corte | El uso clínico del MoCA exige cumplir las condiciones de registro y licencia de sus autores. Verificarlas antes de cualquier uso real |
| HTP (Casa-Árbol-Persona) | Guía cualitativa de registro y borrador narrativo | La validez de las técnicas proyectivas es discutida. El texto generado no es un diagnóstico |

El catálogo incluye además otros instrumentos de la lista de pruebas (entre ellos inventarios de personalidad y escalas de conducta adaptativa, varios de ellos comerciales). Su lógica de puntuación es solo demostrativa, no está verificada contra los manuales y no debe usarse para evaluar a nadie. Los nombres de pruebas y editoriales se citan como referencia; este proyecto no tiene relación con ellos ni cuenta con su aprobación.

Antes de cualquier uso clínico, comercial o con datos reales, hay que verificar con cada editor o autor las condiciones de licencia de cada instrumento.

## Informe y exportación

- Los datos de la sesión se mantienen mientras se cambia de prueba, solo en el navegador.
- Un botón enmascara el nombre del evaluado con sus iniciales. Es una ayuda de presentación y no sustituye una política de protección de datos.
- El modo de impresión A4 compone un documento de ejemplo con tablas, gráficos y texto generado. Está rotulado como documento de demostración, sin validez clínica ni pericial, y el bloque de firma es un espacio de ejemplo.

## Pruebas automatizadas

El proyecto incluye pruebas automatizadas (Vitest) que comprueban que el código calcula lo que se programó: límites, redondeos, reglas de sustitución y coherencia interna. No comprueban que los resultados coincidan con los baremos oficiales y no son una auditoría independiente.

```bash
npm install
npm test
```

Compilación de producción:

```bash
npm run build
```

## Ejecución local

En Windows, ejecutar `launch.bat` o `start.bat` desde la carpeta del proyecto abre la aplicación en `http://localhost:5173`. En cualquier sistema también sirve `npm install` seguido de `npm run dev`.

---

Proyecto de portafolio de Nexo Digital Partners. Úsalo solo con datos ficticios.
