/**
 * Pruebas Unitarias Exhaustivas para el Módulo HTP (Casa-Árbol-Persona)
 * Valida:
 * 1. Naturaleza 100% cualitativa (sin puntajes numéricos artificiales).
 * 2. Determinismo del motor de síntesis narrativa.
 * 3. Cobertura de perfiles benchmark (Equilibrado, Inhibido, Expansivo).
 * 4. Generación de los 5 párrafos clínicos periciales estructurados.
 * 5. Integración sinérgica de notas clínicas de campo.
 * 6. Detección de constelaciones psicodinámicas y recomendaciones.
 */

import { describe, it, expect } from 'vitest';
import {
  generateHtpFullReport,
  generateFormalSummary,
  generateHouseNarrative,
  generateTreeNarrative,
  generatePersonNarrative,
  generateIntegratedConclusion,
  HTP_BENCHMARK_PROFILES,
  INITIAL_HTP_RECORD,
  HtpAssessmentRecord,
} from '../../core';

describe('HTP Qualitative Narrative Engine', () => {
  describe('1. Principio Deontológico: Ausencia Estricta de Puntajes Numéricos', () => {
    it('no genera puntajes numéricos artificiales ni escalas cuantitativas en los benchmark profiles', () => {
      const presets: ('balanced' | 'inhibited' | 'expansive')[] = ['balanced', 'inhibited', 'expansive'];

      for (const preset of presets) {
        const record = HTP_BENCHMARK_PROFILES[preset];
        const report = generateHtpFullReport(record);

        // Verificar que no existen patrones de puntuación artificial como "/10", "/20", "Puntos:", "Puntaje:", "Score:"
        expect(report.fullNarrativeText).not.toMatch(/\/\s*\d+/);
        expect(report.fullNarrativeText).not.toMatch(/\b(puntaje|puntuaci[oó]n|score|puntos)\s*:\s*\d+/i);
        expect(report.fullNarrativeText).not.toMatch(/\b\d+\s*\/\s*\d+\b/);
        expect(report.summaryFormal).not.toMatch(/\b\d+\b/);
        expect(report.houseAnalysis).not.toMatch(/\b\d+\b/);
        expect(report.treeAnalysis).not.toMatch(/\b\d+\b/);
        expect(report.personAnalysis).not.toMatch(/\b\d+\b/);
        expect(report.integratedConclusion).not.toMatch(/\b\d+\b/);
      }
    });

    it('todas las propiedades del informe son cadenas de texto ricas y no numéricas', () => {
      const report = generateHtpFullReport(INITIAL_HTP_RECORD);
      expect(typeof report.summaryFormal).toBe('string');
      expect(typeof report.houseAnalysis).toBe('string');
      expect(typeof report.treeAnalysis).toBe('string');
      expect(typeof report.personAnalysis).toBe('string');
      expect(typeof report.integratedConclusion).toBe('string');
      expect(typeof report.fullNarrativeText).toBe('string');
    });
  });

  describe('2. Determinismo e Invarianza Funcional', () => {
    it('produce exactamente la misma síntesis narrativa para entradas idénticas', () => {
      const record1 = JSON.parse(JSON.stringify(HTP_BENCHMARK_PROFILES.inhibited));
      const record2 = JSON.parse(JSON.stringify(HTP_BENCHMARK_PROFILES.inhibited));

      const report1 = generateHtpFullReport(record1);
      const report2 = generateHtpFullReport(record2);

      expect(report1.summaryFormal).toBe(report2.summaryFormal);
      expect(report1.houseAnalysis).toBe(report2.houseAnalysis);
      expect(report1.treeAnalysis).toBe(report2.treeAnalysis);
      expect(report1.personAnalysis).toBe(report2.personAnalysis);
      expect(report1.integratedConclusion).toBe(report2.integratedConclusion);
      expect(report1.fullNarrativeText).toBe(report2.fullNarrativeText);
    });
  });

  describe('3. Perfil Benchmark 1: Adaptativo / Equilibrado (balanced)', () => {
    it('genera una síntesis formal y de contenido consistente con equilibrio y recursos preservados', () => {
      const record = HTP_BENCHMARK_PROFILES.balanced;
      const report = generateHtpFullReport(record);

      // Párrafo formal: tamaño normal, centrado, trazo normal, líneas curvas
      expect(report.summaryFormal).toContain('tamaño gráfico adecuado y proporcionado');
      expect(report.summaryFormal).toContain('localización centrada');
      expect(report.summaryFormal).toContain('firmeza media y homogénea');
      expect(report.summaryFormal).toContain('líneas curvas');

      // Casa: techo normal, paredes firmes, puerta normal, humo suave
      expect(report.houseAnalysis).toContain('techo proporcionado');
      expect(report.houseAnalysis).toContain('paredes sólidas y bien delimitadas');
      expect(report.houseAnalysis).toContain('calidez afectiva');
      expect(report.houseAnalysis).toContain(record.house.observations);

      // Árbol: suelo firme, tronco robusto, ramas armoniosas, copa lobulada
      expect(report.treeAnalysis).toContain('línea de suelo indica un adecuado contacto con la realidad');
      expect(report.treeAnalysis).toContain('tronco robusto y equilibrado');
      expect(report.treeAnalysis).toContain('ramas armoniosas');
      expect(report.treeAnalysis).toContain('copa lobulada');

      // Persona: proporcionada, sonriente serena, brazos abiertos, piernas firmes
      expect(report.personAnalysis).toContain('conformación cefálica proporcionada');
      expect(report.personAnalysis).toContain('expresión facial serena');
      expect(report.personAnalysis).toContain('brazos abiertos hacia afuera');
      expect(report.personAnalysis).toContain('estabilidad motriz y seguridad');

      // Conclusión integrada: recursos de afrontamiento preservados
      expect(report.integratedConclusion).toContain('funcionamiento armónico y adaptativo');
      expect(report.integratedConclusion).toContain('No se aprecian descompensaciones estructurales');
      expect(report.integratedConclusion).toContain(record.generalClinicalNotes);
    });
  });

  describe('4. Perfil Benchmark 2: Inhibido / Ansioso-Inseguro (inhibited)', () => {
    it('identifica constelación de micrografía, introversión, fragilidad yoica y retraimiento vincular', () => {
      const record = HTP_BENCHMARK_PROFILES.inhibited;
      const report = generateHtpFullReport(record);

      // Párrafo formal: micrografía, inferior, izquierdo, trazo débil, borraduras
      expect(report.summaryFormal).toContain('marcada micrografía');
      expect(report.summaryFormal).toContain('zona inferior');
      expect(report.summaryFormal).toContain('margen izquierdo');
      expect(report.summaryFormal).toContain('tenue y vacilante');
      expect(report.summaryFormal).toContain('conducta reiterada de borradura');

      // Casa: techo sobredimensionado (fantasía), paredes débiles, puerta pequeña, sin humo
      expect(report.houseAnalysis).toContain('techo notablemente sobredimensionado');
      expect(report.houseAnalysis).toContain('paredes débiles o discontinuas');
      expect(report.houseAnalysis).toContain('inaccesibilidad de la puerta');
      expect(report.houseAnalysis).toContain('enfriamiento afectivo');

      // Árbol: suelo ausente/flotante, raíces expuestas, tronco frágil, ramas caídas, nudo
      expect(report.treeAnalysis).toContain('desarraigo, labilidad e inseguridad existencial');
      expect(report.treeAnalysis).toContain('raíces expuestas');
      expect(report.treeAnalysis).toContain('tronco frágil o delgado');
      expect(report.treeAnalysis).toContain('ramas caídas');
      expect(report.treeAnalysis).toContain('nudos o huecos');

      // Persona: cabeza pequeña, mirada angustiada, ojos vacíos, boca tensa, manos ocultas
      expect(report.personAnalysis).toContain('cabeza pequeña');
      expect(report.personAnalysis).toContain('mirada extraviada o angustiada');
      expect(report.personAnalysis).toContain('labios tensos en línea recta');
      expect(report.personAnalysis).toContain('ocultación de los miembros superiores');

      // Conclusión integrada: constelación de inhibición y rigidez/ansiedad
      expect(report.integratedConclusion).toContain('predominantemente inhibido');
      expect(report.integratedConclusion).toContain('flexibilizar las defensas perfeccionistas');
      expect(report.integratedConclusion).toContain(record.generalClinicalNotes);
    });
  });

  describe('5. Perfil Benchmark 3: Expansivo / Reactivo-Impulsivo (expansive)', () => {
    it('detecta constelación de macrografía, presión pesada, agresividad latente y defensas rígidas', () => {
      const record = HTP_BENCHMARK_PROFILES.expansive;
      const report = generateHtpFullReport(record);

      // Párrafo formal: macrografía, superior, derecho, trazo pesado, líneas rectas
      expect(report.summaryFormal).toContain('macrografía gráfica');
      expect(report.summaryFormal).toContain('sector superior');
      expect(report.summaryFormal).toContain('margen derecho');
      expect(report.summaryFormal).toContain('presión del trazo es intensa');
      expect(report.summaryFormal).toContain('trazados rectilíneos rígidos');

      // Casa: techo aplanado, puerta cerrada/rejas, ventanas con rejas, humo turbulento, cercas
      expect(report.houseAnalysis).toContain('aplanamiento del techo');
      expect(report.houseAnalysis).toContain('cerrojo o la inaccesibilidad de la puerta');
      expect(report.houseAnalysis).toContain('rejas');
      expect(report.houseAnalysis).toContain('humo denso y turbulento');
      expect(report.houseAnalysis).toContain('cercas perimetrales');

      // Árbol: colina elevada, raíces en garra, tronco robusto, ramas puntiagudas
      expect(report.treeAnalysis).toContain('colina solitaria');
      expect(report.treeAnalysis).toContain('raíces en garra');
      expect(report.treeAnalysis).toContain('ramas afiladas, puntiagudas o espinosas');

      // Persona: macrocefálica, expresión hostil, ojos hipervigilantes, boca con dientes, puños cerrados
      expect(report.personAnalysis).toContain('macrocefalia gráfica');
      expect(report.personAnalysis).toContain('expresión adusta o tensa');
      expect(report.personAnalysis).toContain('hipervigilancia suspicaz');
      expect(report.personAnalysis).toContain('piezas dentarias expuestas');
      expect(report.personAnalysis).toContain('puños cerrados');
      expect(report.personAnalysis).toContain('piernas ampliamente separadas');
      expect(report.personAnalysis).toContain('accesorios de poder');

      // Conclusión integrada: reactividad asertivo-agresiva
      expect(report.integratedConclusion).toContain('reactiva');
      expect(report.integratedConclusion).toContain('autorregulación emocional');
    });
  });

  describe('6. Integración de Notas Clínicas de Campo y Manejo de Texto Vacío', () => {
    it('integra armoniosamente observaciones de campo entre comillas formales cuando están presentes', () => {
      const customRecord: HtpAssessmentRecord = {
        ...INITIAL_HTP_RECORD,
        formal: {
          ...INITIAL_HTP_RECORD.formal,
        },
        house: {
          ...INITIAL_HTP_RECORD.house,
          observations: 'El paciente tardó 3 minutos antes de iniciar el trazado de la puerta.',
        },
        tree: {
          ...INITIAL_HTP_RECORD.tree,
          observations: 'Dibuja con notable minuciosidad cada una de las hojas.',
        },
        person: {
          ...INITIAL_HTP_RECORD.person,
          observations: 'Menciona que la figura representa a un profesor estricto.',
        },
        generalClinicalNotes: 'Cooperativo durante toda la aplicación con discurso pausado.',
      };

      const report = generateHtpFullReport(customRecord);

      expect(report.houseAnalysis).toContain('Observación clínica directa: "El paciente tardó 3 minutos antes de iniciar el trazado de la puerta."');
      expect(report.treeAnalysis).toContain('Observación clínica pericial: "Dibuja con notable minuciosidad cada una de las hojas."');
      expect(report.personAnalysis).toContain('Observación clínica pericial: "Menciona que la figura representa a un profesor estricto."');
      expect(report.integratedConclusion).toContain('En concordancia con las observaciones clínicas durante la administración: "Cooperativo durante toda la aplicación con discurso pausado."');
    });

    it('no genera comillas vacías ni fragmentos sueltos cuando las notas son cadenas vacías o espacios', () => {
      const emptyNotesRecord: HtpAssessmentRecord = {
        ...INITIAL_HTP_RECORD,
        house: { ...INITIAL_HTP_RECORD.house, observations: '   ' },
        tree: { ...INITIAL_HTP_RECORD.tree, observations: '' },
        person: { ...INITIAL_HTP_RECORD.person, observations: '   ' },
        generalClinicalNotes: '   ',
      };

      const report = generateHtpFullReport(emptyNotesRecord);

      expect(report.houseAnalysis).not.toContain('Observación clínica directa');
      expect(report.houseAnalysis).not.toContain('""');
      expect(report.treeAnalysis).not.toContain('Observación clínica pericial');
      expect(report.personAnalysis).not.toContain('Observación clínica pericial');
      expect(report.integratedConclusion).not.toContain('En concordancia con las observaciones clínicas');
    });
  });

  describe('7. Indicadores Críticos y Anomalías Estructurales', () => {
    it('detecta y reporta correctamente transparencias, omisiones y borraduras excesivas en la sección formal', () => {
      const summary = generateFormalSummary({
        size: 'normal',
        verticalPlacement: 'center',
        horizontalPlacement: 'center',
        strokePressure: 'normal',
        lineQuality: 'curved',
        shading: 'excessive',
        symmetry: 'asymmetric',
        hasExcessiveErasures: true,
        hasTransparencies: true,
        hasOmissions: true,
      });

      expect(summary).toContain('sombreado intenso');
      expect(summary).toContain('asimetrías notorias');
      expect(summary).toContain('conducta reiterada de borradura');
      expect(summary).toContain('transparencias estructurales');
      expect(summary).toContain('omisiones de partes estructurales');
    });

    it('detecta constelación mixta de vulnerabilidad del Yo y reactividad agresiva', () => {
      const mixedRecord: HtpAssessmentRecord = {
        ...INITIAL_HTP_RECORD,
        formal: {
          ...INITIAL_HTP_RECORD.formal,
          hasTransparencies: true,
          strokePressure: 'heavy',
        },
        house: {
          ...INITIAL_HTP_RECORD.house,
          walls: 'weak_broken',
          chimneySmoke: 'dense_turbulent',
        },
        tree: {
          ...INITIAL_HTP_RECORD.tree,
          trunk: 'broken_scarred',
          branches: 'spiky_hostile',
        },
        person: {
          ...INITIAL_HTP_RECORD.person,
          hands: 'clenched_fists',
        },
      };

      const conclusion = generateIntegratedConclusion(mixedRecord);
      expect(conclusion).toContain('vulnerabilidad yoica basal');
      expect(conclusion).toContain('mecanismos compensatorios de reactividad tensional');
      expect(conclusion).toContain('contención afectiva, la elaboración de vivencias traumáticas');
    });
  });

  describe('8. Formato Estructurado del Reporte Completo', () => {
    it('ensambla fullNarrativeText con las 5 secciones numeradas y encabezado forense', () => {
      const report = generateHtpFullReport(INITIAL_HTP_RECORD);

      expect(report.fullNarrativeText).toContain('INFORME DE EVALUACIÓN CUALITATIVA PROYECTIVA HTP (CASA-ÁRBOL-PERSONA)');
      expect(report.fullNarrativeText).toContain('1. Resumen de Indicadores Expresivos Generales:');
      expect(report.fullNarrativeText).toContain('2. Dinámica Familiar y Área Afectiva (Casa):');
      expect(report.fullNarrativeText).toContain('3. Estructura del Yo y Estabilidad Emocional Profunda (Árbol):');
      expect(report.fullNarrativeText).toContain('4. Imagen Corporal y Relaciones Interpersonales (Persona):');
      expect(report.fullNarrativeText).toContain('5. Conclusión Cualitativa Integrada:');
    });
  });

  describe('9. Interfaz de Usuario React e Interactividad (HtpModuleContainer)', () => {
    it('renderiza HtpModuleContainer con pestañas, selector de presets y preview reactivo', async () => {
      const React = await import('react');
      const { render, cleanup, screen } = await import('@testing-library/react');
      cleanup();
      const { HtpModuleContainer } = await import('../../ui/components/htp');

      render(React.createElement(HtpModuleContainer));

      // Verificar encabezado y badge deontológico
      expect(screen.getByText('Guía Clínica Cualitativa HTP (Casa-Árbol-Persona)')).toBeDefined();
      expect(screen.getByText('Sin puntuaciones numéricas artificiales')).toBeDefined();

      // Verificar pestañas disponibles
      expect(screen.getByRole('tab', { name: /Pautas Expresivas/i })).toBeDefined();
      expect(screen.getByRole('tab', { name: /Casa/i })).toBeDefined();
      expect(screen.getByRole('tab', { name: /Árbol/i })).toBeDefined();
      expect(screen.getByRole('tab', { name: /Persona/i })).toBeDefined();
      expect(screen.getByRole('tab', { name: /Síntesis/i })).toBeDefined();

      // Verificar que el preview muestra los 5 párrafos
      expect(screen.getByText('Previsualización Narrativa Pericial')).toBeDefined();
      expect(screen.getByText('Resumen de Indicadores Expresivos Generales')).toBeDefined();
      expect(screen.getByText('Dinámica Familiar y Área Afectiva (Casa)')).toBeDefined();
      expect(screen.getByText('Estructura del Yo y Estabilidad Emocional Profunda (Árbol)')).toBeDefined();
      expect(screen.getByText('Imagen Corporal y Relaciones Interpersonales (Persona)')).toBeDefined();
      expect(screen.getByText('Conclusión Cualitativa Integrada y Recomendaciones')).toBeDefined();
    });

    it('permite alternar entre pestañas y navegar a la sección Casa, Árbol y Persona', async () => {
      const React = await import('react');
      const { render, cleanup, screen, fireEvent } = await import('@testing-library/react');
      cleanup();
      const { HtpModuleContainer } = await import('../../ui/components/htp');

      render(React.createElement(HtpModuleContainer));

      // Navegar a Casa
      const houseTab = screen.getByRole('tab', { name: /Casa/i });
      fireEvent.click(houseTab);
      expect(screen.getByText('Techo (Roof)')).toBeDefined();
      expect(screen.getByText('Paredes (Walls)')).toBeDefined();

      // Navegar a Árbol
      const treeTab = screen.getByRole('tab', { name: /Árbol/i });
      fireEvent.click(treeTab);
      expect(screen.getByText('Línea de Suelo (Ground Line)')).toBeDefined();
      expect(screen.getByText('Tronco (Trunk)')).toBeDefined();

      // Navegar a Persona
      const personTab = screen.getByRole('tab', { name: /Persona/i });
      fireEvent.click(personTab);
      expect(screen.getByText('Conformación Cefálica (Head)')).toBeDefined();
      expect(screen.getByText('Brazos (Arms)')).toBeDefined();

      // Navegar a Síntesis
      const synthTab = screen.getByRole('tab', { name: /Síntesis/i });
      fireEvent.click(synthTab);
      expect(screen.getByText('Datos Periciales de la Evaluación HTP')).toBeDefined();
      expect(screen.getByText('Observaciones de Actitud y Conducta Durante la Administración')).toBeDefined();
    });

    it('carga el perfil Inhibido / Ansioso al presionar el preset correspondiente y actualiza la narrativa', async () => {
      const React = await import('react');
      const { render, cleanup, screen, fireEvent } = await import('@testing-library/react');
      cleanup();
      const { HtpModuleContainer } = await import('../../ui/components/htp');

      render(React.createElement(HtpModuleContainer));

      // Click en preset Inhibido / Ansioso
      const inhibitedBtn = screen.getByRole('button', { name: /Inhibido \/ Ansioso/i });
      fireEvent.click(inhibitedBtn);

      // El preview debe actualizarse inmediatamente con términos del perfil inhibido
      expect(screen.getAllByText(/marcada micrografía/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/desarraigo, labilidad e inseguridad existencial/i).length).toBeGreaterThan(0);
    });

    it('carga el perfil Expansivo / Impulsivo al presionar el preset correspondiente', async () => {
      const React = await import('react');
      const { render, cleanup, screen, fireEvent } = await import('@testing-library/react');
      cleanup();
      const { HtpModuleContainer } = await import('../../ui/components/htp');

      render(React.createElement(HtpModuleContainer));

      // Click en preset Expansivo / Impulsivo
      const expansiveBtn = screen.getByRole('button', { name: /Expansivo \/ Impulsivo/i });
      fireEvent.click(expansiveBtn);

      // El preview debe actualizarse con términos del perfil expansivo
      expect(screen.getAllByText(/macrografía gráfica/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/piezas dentarias expuestas/i).length).toBeGreaterThan(0);
    });

    it('restablece las opciones a los valores iniciales al presionar Restablecer', async () => {
      const React = await import('react');
      const { render, cleanup, screen, fireEvent } = await import('@testing-library/react');
      cleanup();
      const { HtpModuleContainer } = await import('../../ui/components/htp');

      render(React.createElement(HtpModuleContainer));

      // Cargar expansivo primero
      const expansiveBtn = screen.getByRole('button', { name: /Expansivo \/ Impulsivo/i });
      fireEvent.click(expansiveBtn);
      expect(screen.getAllByText(/macrografía gráfica/i).length).toBeGreaterThan(0);

      // Restablecer
      const resetBtn = screen.getByRole('button', { name: /Restablecer/i });
      fireEvent.click(resetBtn);

      // Vuelve al tamaño normal
      expect(screen.getAllByText(/tamaño gráfico adecuado y proporcionado/i).length).toBeGreaterThan(0);
    });
  });
});
