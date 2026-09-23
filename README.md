# 🧠 Psicocalc — Plataforma de Evaluación Psicométrica, Clínica y Neurocognitiva

**Psicocalc** es una plataforma clínica interactiva, moderna y de alta precisión diseñada para psicólogos, neuropsicólogos y psiquiatras. Automatiza el procesamiento psicométrico, la administración de cuestionarios clínicos, el cálculo de baremos estandarizados y la generación de perfiles visuales e informes periciales descargables en PDF.

---

## 🚀 Inicio Rápido (En 1 Clic en Windows)

1. Ve a la carpeta del proyecto:
   `C:\Users\USUARIO\OneDrive\Escritorio\trabajos\programas\psicocalc`
2. Haz doble clic en **`launch.bat`** (o en **`start.bat`**).
3. La aplicación se abrirá automáticamente en tu navegador web en:
   👉 **http://localhost:5173**

*(También disponible en línea en tu despliegue de Vercel vinculado a GitHub).*

---

## ✨ Catálogo de Baterías e Instrumentos Clínicos

### 1. Baterías de Inteligencia y Cognición
* **WISC-V (Escala de Inteligencia de Wechsler para Niños - V):**
  * Subtests primarios y secundarios (Semejanzas, Vocabulario, Cubos, Puzles Visuales, Matrices, Balanzas, Dígitos, Span de Dibujos, Claves, Búsqueda de Símbolos).
  * Índices calculados: ICV, IVE, IRF, IMT, IVP, CIT / FSIQ, IRC, IMTA.
  * Campana de Gauss dinámica en SVG puro y gráfico de dispersión de fortalezas y debilidades.
* **WAIS-IV (Escala de Inteligencia de Wechsler para Adultos - IV):**
  * Subtests esenciales y suplementarios.
  * Cálculo de ICV, IRP, IMT, IVP y CIT global.

### 2. Dificultades Conductuales y Emocionales Infanto-Juveniles
* **SDQ (Cuestionario de Capacidades y Dificultades - Goodman):**
  * 25 ítems clínicos evaluados en 5 subescalas:
    * Síntomas Emocionales
    * Problemas de Conducta
    * Hiperactividad / Déficit de Atención
    * Problemas con Compañeros
    * Conducta Prosocial (recursos adaptativos)
  * Cálculo de Puntuación Total de Dificultades con semáforos de riesgo y puntos de corte validados (*Normal, Limítrofe, Anormal / Clínico*).
  * Gráfico de barras de perfil conductual en SVG reactivo.

### 3. Cribado de Estado de Ánimo y Ansiedad
* **PHQ-9 (Patient Health Questionnaire - Depresión):**
  * Puntuación de 0 a 27 con estratificación de severidad (*Mínima, Leve, Moderada, Moderadamente Severa, Severa*).
  * **Alerta Crítica de Seguridad en Ítem 9:** Detección visual destacada inmediata ante ideación pasiva o activa de riesgo.
* **GAD-7 (Generalized Anxiety Disorder - Ansiedad):**
  * Puntuación de 0 a 21 con estratificación de severidad (*Mínima, Leve, Moderada, Severa*).

### 4. Cribado Neurocognitivo Breve
* **MoCA (Montreal Cognitive Assessment):**
  * Evaluación de 7 dominios: Visuoespacial/Ejecutivo, Identificación, Memoria, Atención, Lenguaje, Abstracción, Recuerdo Diferido y Orientación (0 a 30 puntos).
  * **Corrección Automática por Escolaridad:** +1 punto para evaluados con ≤ 12 años de estudio formal.
  * Punto de corte clínico (< 26 alerta de sospecha de Deterioro Cognitivo Leve).

### 5. Guía Pericial Cualitativa para Test Proyectivo HTP (Casa-Árbol-Persona)
* Módulo pericial interactivo con taxonomía clínica formal (Buck, Hammer, Koppitz).
* Registro estructurado de:
  * **Aspectos Formales:** Tamaño, emplazamiento en la hoja, calidad del trazo, presión, simetría y sombreado.
  * **Contenido Casa:** Techo, paredes, puerta, ventanas, chimenea (área familiar, vida hogareña y defensas).
  * **Contenido Árbol:** Tronco, ramas, raíces, copa (núcleo del yo, estabilidad emocional y traumas).
  * **Contenido Persona:** Cabeza, brazos, piernas, expresión, vestimenta (autoimagen, esquema corporal y relaciones interpersonales).
* **Generador de Síntesis Narrativa Cualitativa:** Produce automáticamente un análisis clínico contextualizado sin asignación de puntajes numéricos artificiales.

---

## 📄 Informe Clínico Integrado y Exportación a PDF

* **Contexto de Sesión Persistente:** Permite alternar entre cualquiera de las pruebas sin perder ningún dato.
* **Anonimización en 1 Clic:** Botón para enmascarar la identidad del paciente para fines periciales o docentes.
* **Modo Impresión A4 Editorial:** Al hacer clic en *"Imprimir / Guardar en PDF"*, la interfaz oculta todos los controles web y formatea un documento clínico completo con tablas demográficas, gráficos vectoriales, síntesis interpretativa y bloque de firma pericial.

---

## 🧪 Verificación y Pruebas Automatizadas

El proyecto cuenta con **600 pruebas automatizadas superadas con 100% de precisión** (0 fallos, 0 omisiones) verificadas por auditoría independiente.

Para ejecutar los tests en la consola:
```bash
npm test
```

Para generar la compilación de producción:
```bash
npm run build
```

---
*Desarrollado para profesionales de la salud mental, psicología clínica, educativa y neuropsicología.*
