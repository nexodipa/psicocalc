import React, { useMemo, useCallback } from 'react';
import { useClinicalSession } from '../../context/ClinicalSessionContext';
import {
  calculateMmpi3,
  calculatePai,
  calculateSena,
  calculateCbcl,
  calculateByi2,
  calculateExtendedLikert,
  ExtendedLikertBatteryId,
} from '../../../core';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  ShieldAlert,
  Activity,
} from 'lucide-react';

export type LikertBatteryId =
  | 'mmpi_3'
  | 'pai'
  | 'sena'
  | 'cbcl'
  | 'byi_2'
  | ExtendedLikertBatteryId;

interface LikertMatrixInputCardProps {
  batteryId: LikertBatteryId;
}

interface ScaleDef {
  id: string;
  name: string;
  category: string;
  isOmission?: boolean;
  isProtective?: boolean;
}

export const LikertMatrixInputCard: React.FC<LikertMatrixInputCardProps> = ({ batteryId }) => {
  const { testData, setBatteryData } = useClinicalSession();

  const data = testData[batteryId] || {};

  // --------------------------------------------------------------------------
  // Battery Configurations & Scale Definitions (All 15 Likert / T-Score Suites)
  // --------------------------------------------------------------------------
  const config = useMemo((): {
    title: string;
    subtitle: string;
    publisherTag: string;
    scales: ScaleDef[];
    hasInvalidPreset?: boolean;
  } => {
    switch (batteryId) {
      case 'mmpi_3':
        return {
          title: 'MMPI-3 — Inventario Multifásico de Personalidad de Minnesota - 3',
          subtitle: 'Entrada estandarizada de puntuaciones T (M=50, DE=10) y escalas de validez',
          publisherTag: 'University of Minnesota Press / TEA Ediciones',
          hasInvalidPreset: true,
          scales: [
            { id: 'CNS', name: 'Omitidos (CNS)', category: 'Validez', isOmission: true },
            { id: 'CRIN', name: 'Inconsistencia Combinada (CRIN)', category: 'Validez' },
            { id: 'VRIN', name: 'Inconsistencia Variable (VRIN)', category: 'Validez' },
            { id: 'TRIN', name: 'Inconsistencia Verdadera (TRIN)', category: 'Validez' },
            { id: 'F', name: 'Infrecuencia (F)', category: 'Validez' },
            { id: 'Fp', name: 'Infrecuencia Psicopatología (Fp)', category: 'Validez' },
            { id: 'L', name: 'Virtudes Poco Comunes (L)', category: 'Validez' },
            { id: 'K', name: 'Ajuste / Defensividad (K)', category: 'Validez' },
            { id: 'EID', name: 'Disfunción Emocional (EID)', category: 'Orden Superior' },
            { id: 'THD', name: 'Disfunción del Pensamiento (THD)', category: 'Orden Superior' },
            { id: 'BXD', name: 'Disfunción Conductual (BXD)', category: 'Orden Superior' },
            { id: 'RCd', name: 'Desmoralización (RCd)', category: 'Clínicas Reestructuradas' },
            { id: 'RC1', name: 'Quejas Somáticas (RC1)', category: 'Clínicas Reestructuradas' },
            { id: 'RC2', name: 'Escasas Emociones Positivas (RC2)', category: 'Clínicas Reestructuradas' },
            { id: 'RC4', name: 'Conducta Antisocial (RC4)', category: 'Clínicas Reestructuradas' },
            { id: 'RC6', name: 'Ideas de Persecución (RC6)', category: 'Clínicas Reestructuradas' },
            { id: 'RC7', name: 'Emociones Negativas (RC7)', category: 'Clínicas Reestructuradas' },
            { id: 'RC8', name: 'Experiencias Anómalas (RC8)', category: 'Clínicas Reestructuradas' },
            { id: 'RC9', name: 'Activación Hipomaníaca (RC9)', category: 'Clínicas Reestructuradas' },
            { id: 'SUI', name: 'Ideación Suicida (SUI)', category: 'Ítems Críticos / Específicas' },
          ],
        };

      case 'mmpi_rf':
        return {
          title: 'MMPI-2-RF — Inventario Multifásico de Personalidad de Minnesota-2 Reestructurado',
          subtitle: '338 ítems (V/F) con Escalas Clínicas Reestructuradas (RC) y Problemas Específicos (SP)',
          publisherTag: 'Ben-Porath & Tellegen · TEA Ediciones',
          hasInvalidPreset: true,
          scales: [
            { id: 'VRIN_r', name: 'Inconsistencia Variable (VRIN-r)', category: 'Validez' },
            { id: 'TRIN_r', name: 'Inconsistencia Verdadera (TRIN-r)', category: 'Validez' },
            { id: 'F_r', name: 'Infrecuencia (F-r)', category: 'Validez' },
            { id: 'Fp_r', name: 'Infrecuencia Psicopatológica (Fp-r)', category: 'Validez' },
            { id: 'L_r', name: 'Virtudes Inusuales (L-r)', category: 'Validez' },
            { id: 'K_r', name: 'Validez de Ajuste (K-r)', category: 'Validez' },
            { id: 'EID', name: 'Alteración Emocional / Internalizada (EID)', category: 'Orden Superior' },
            { id: 'THD', name: 'Alteración del Pensamiento (THD)', category: 'Orden Superior' },
            { id: 'BXD', name: 'Alteración Conductual / Externalizada (BXD)', category: 'Orden Superior' },
            { id: 'RCd', name: 'Desmoralización (RCd)', category: 'Clínicas Reestructuradas' },
            { id: 'RC1', name: 'Quejas Somáticas (RC1)', category: 'Clínicas Reestructuradas' },
            { id: 'RC2', name: 'Escasez de Emociones Positivas (RC2)', category: 'Clínicas Reestructuradas' },
            { id: 'RC3', name: 'Cinismo (RC3)', category: 'Clínicas Reestructuradas' },
            { id: 'RC4', name: 'Conducta Antisocial (RC4)', category: 'Clínicas Reestructuradas' },
            { id: 'RC6', name: 'Ideas de Persecución (RC6)', category: 'Clínicas Reestructuradas' },
            { id: 'RC7', name: 'Emociones Negativas Disfuncionales (RC7)', category: 'Clínicas Reestructuradas' },
            { id: 'RC8', name: 'Experiencias Aberrantes (RC8)', category: 'Clínicas Reestructuradas' },
            { id: 'RC9', name: 'Activación Hipomaníaca (RC9)', category: 'Clínicas Reestructuradas' },
            { id: 'SUI', name: 'Ideación Suicida / Muerte (SUI)', category: 'Problemas Específicos' },
          ],
        };

      case 'mmpi_a_rf':
        return {
          title: 'MMPI-A-RF — Inventario Multifásico de Personalidad de Minnesota para Adolescentes Reestructurado',
          subtitle: 'Evaluación psicopatológica en adolescentes de 14 a 18 años (241 ítems)',
          publisherTag: 'Archer et al. · Pearson / TEA Ediciones',
          hasInvalidPreset: true,
          scales: [
            { id: 'VRIN_r', name: 'Inconsistencia Variable (VRIN-r)', category: 'Validez' },
            { id: 'TRIN_r', name: 'Inconsistencia Verdadera (TRIN-r)', category: 'Validez' },
            { id: 'F_r', name: 'Infrecuencia Adolescente (F-r)', category: 'Validez' },
            { id: 'L_r', name: 'Virtudes Inusuales (L-r)', category: 'Validez' },
            { id: 'K_r', name: 'Defensividad (K-r)', category: 'Validez' },
            { id: 'EID', name: 'Disfunción Emocional / Internalizante (EID)', category: 'Orden Superior' },
            { id: 'THD', name: 'Disfunción del Pensamiento (THD)', category: 'Orden Superior' },
            { id: 'BXD', name: 'Disfunción Conductual / Externalizante (BXD)', category: 'Orden Superior' },
            { id: 'RCd', name: 'Desmoralización (RCd)', category: 'Clínicas Reestructuradas' },
            { id: 'RC1', name: 'Quejas Somáticas (RC1)', category: 'Clínicas Reestructuradas' },
            { id: 'RC2', name: 'Bajas Emociones Positivas (RC2)', category: 'Clínicas Reestructuradas' },
            { id: 'RC4', name: 'Conducta Antisocial y Escolar (RC4)', category: 'Clínicas Reestructuradas' },
            { id: 'RC6', name: 'Ideas Persecutorias (RC6)', category: 'Clínicas Reestructuradas' },
            { id: 'RC7', name: 'Emociones Negativas (RC7)', category: 'Clínicas Reestructuradas' },
            { id: 'RC8', name: 'Experiencias Anómalas (RC8)', category: 'Clínicas Reestructuradas' },
            { id: 'RC9', name: 'Activación Hipomaníaca (RC9)', category: 'Clínicas Reestructuradas' },
            { id: 'SUI', name: 'Ideación Suicida / Autolesión (SUI)', category: 'Problemas Específicos' },
          ],
        };

      case 'pai':
        return {
          title: 'PAI — Inventario de Evaluación de la Personalidad',
          subtitle: 'Puntuaciones T en 22 escalas clínicas, de validez y tratamiento (M=50, DE=10)',
          publisherTag: 'Leslie C. Morey · PAR / TEA Ediciones',
          hasInvalidPreset: true,
          scales: [
            { id: 'ICN', name: 'Inconsistencia (ICN)', category: 'Validez' },
            { id: 'INF', name: 'Infrecuencia (INF)', category: 'Validez' },
            { id: 'NIM', name: 'Impresión Negativa (NIM)', category: 'Validez' },
            { id: 'PIM', name: 'Impresión Positiva (PIM)', category: 'Validez' },
            { id: 'SOM', name: 'Quejas Somáticas (SOM)', category: 'Clínicas' },
            { id: 'ANX', name: 'Ansiedad (ANX)', category: 'Clínicas' },
            { id: 'ARD', name: 'Trastornos Relacionados con Ansiedad (ARD)', category: 'Clínicas' },
            { id: 'DEP', name: 'Depresión (DEP)', category: 'Clínicas' },
            { id: 'MAN', name: 'Manía (MAN)', category: 'Clínicas' },
            { id: 'PAR', name: 'Paranoia (PAR)', category: 'Clínicas' },
            { id: 'SCZ', name: 'Esquizofrenia (SCZ)', category: 'Clínicas' },
            { id: 'BOR', name: 'Rasgos Límite (BOR)', category: 'Clínicas' },
            { id: 'ANT', name: 'Rasgos Antisociales (ANT)', category: 'Clínicas' },
            { id: 'ALC', name: 'Problemas con Alcohol (ALC)', category: 'Clínicas' },
            { id: 'DRG', name: 'Problemas con Drogas (DRG)', category: 'Clínicas' },
            { id: 'AGG', name: 'Agresión (AGG)', category: 'Tratamiento' },
            { id: 'SUI', name: 'Ideaciones Suicidas (SUI)', category: 'Tratamiento' },
            { id: 'STR', name: 'Estrés (STR)', category: 'Tratamiento' },
            { id: 'NON', name: 'Falta de Apoyo Social (NON)', category: 'Tratamiento' },
            { id: 'RXR', name: 'Rechazo al Tratamiento (RXR)', category: 'Tratamiento' },
            { id: 'DOM', name: 'Dominancia (DOM)', category: 'Interpersonal' },
            { id: 'WRM', name: 'Afabilidad (WRM)', category: 'Interpersonal' },
          ],
        };

      case 'bfq':
        return {
          title: 'BFQ — Cuestionario Big Five de Personalidad',
          subtitle: 'Evaluación de los 5 Grandes Factores, 10 Subdimensiones y Escala de Distorsión (M=50, DE=10)',
          publisherTag: 'Caprara, Barbaranelli & Borgogni · TEA Ediciones',
          hasInvalidPreset: true,
          scales: [
            { id: 'E', name: 'Energía / Extraversión (E)', category: 'Cinco Grandes Factores' },
            { id: 'A', name: 'Afabilidad / Amigabilidad (A)', category: 'Cinco Grandes Factores' },
            { id: 'T', name: 'Tesón / Responsabilidad (T)', category: 'Cinco Grandes Factores' },
            { id: 'EE', name: 'Estabilidad Emocional (EE)', category: 'Cinco Grandes Factores' },
            { id: 'AM', name: 'Apertura Mental (AM)', category: 'Cinco Grandes Factores' },
            { id: 'Di', name: 'Dinamismo (Di)', category: 'Subdimensiones' },
            { id: 'Do', name: 'Dominancia (Do)', category: 'Subdimensiones' },
            { id: 'Cp', name: 'Cooperación (Cp)', category: 'Subdimensiones' },
            { id: 'Co', name: 'Cordialidad (Co)', category: 'Subdimensiones' },
            { id: 'Es', name: 'Escrupulosidad (Es)', category: 'Subdimensiones' },
            { id: 'Pe', name: 'Perseverancia (Pe)', category: 'Subdimensiones' },
            { id: 'Ce', name: 'Control de las Emociones (Ce)', category: 'Subdimensiones' },
            { id: 'Ci', name: 'Control de los Impulsos (Ci)', category: 'Subdimensiones' },
            { id: 'Ac', name: 'Apertura a la Cultura (Ac)', category: 'Subdimensiones' },
            { id: 'Ae', name: 'Apertura a la Experiencia (Ae)', category: 'Subdimensiones' },
            { id: 'D', name: 'Distorsión / Deseabilidad Social (D)', category: 'Validez' },
          ],
        };

      case 'staxi_2':
        return {
          title: 'STAXI-2 — Inventario de Expresión de Ira Estado-Rasgo - 2',
          subtitle: 'Evaluación multifacética de Ira Estado, Ira Rasgo, Expresión, Control e Índice IEI (M=50, DE=10)',
          publisherTag: 'C. D. Spielberger · PAR / TEA Ediciones',
          scales: [
            { id: 'S_Ang', name: 'Estado de Ira Total (E)', category: 'Ira Estado' },
            { id: 'S_Ang_F', name: 'Sentimiento de Ira (E-S)', category: 'Ira Estado' },
            { id: 'S_Ang_V', name: 'Expresión Verbal de Ira (E-V)', category: 'Ira Estado' },
            { id: 'S_Ang_P', name: 'Expresión Física de Ira (E-F)', category: 'Ira Estado' },
            { id: 'T_Ang', name: 'Rasgo de Ira Total (R)', category: 'Ira Rasgo' },
            { id: 'T_Ang_T', name: 'Temperamento de Ira (R-T)', category: 'Ira Rasgo' },
            { id: 'T_Ang_R', name: 'Reacción de Ira (R-R)', category: 'Ira Rasgo' },
            { id: 'AX_O', name: 'Expresión Externa de Ira (EE)', category: 'Expresión y Control' },
            { id: 'AX_I', name: 'Expresión Interna de Ira (EI)', category: 'Expresión y Control' },
            { id: 'AC_O', name: 'Control Externo de Ira (CE)', category: 'Expresión y Control', isProtective: true },
            { id: 'AC_I', name: 'Control Interno de Ira (CI)', category: 'Expresión y Control', isProtective: true },
            { id: 'IEI', name: 'Índice de Expresión de la Ira (IEI)', category: 'Índice Global' },
          ],
        };

      case 'lsb_50':
        return {
          title: 'LSB-50 — Listado de Síntomas Breve (50 ítems)',
          subtitle: 'Cribado psicopatológico dimensional, Sueño e Índice Global de Severidad (IRPsi)',
          publisherTag: 'Abuín & Rivera · TEA Ediciones',
          hasInvalidPreset: true,
          scales: [
            { id: 'Min', name: 'Minimización (Min)', category: 'Validez' },
            { id: 'Mag', name: 'Magnificación (Mag)', category: 'Validez' },
            { id: 'PR', name: 'Psicorreactividad (PR)', category: 'Dimensiones Clínicas' },
            { id: 'HS', name: 'Hipersensibilidad (HS)', category: 'Dimensiones Clínicas' },
            { id: 'OB', name: 'Obsesión-Compulsión (OB)', category: 'Dimensiones Clínicas' },
            { id: 'AN', name: 'Ansiedad (AN)', category: 'Dimensiones Clínicas' },
            { id: 'HO', name: 'Hostilidad (HO)', category: 'Dimensiones Clínicas' },
            { id: 'SM', name: 'Somatización (SM)', category: 'Dimensiones Clínicas' },
            { id: 'DE', name: 'Depresión (DE)', category: 'Dimensiones Clínicas' },
            { id: 'SU', name: 'Alteraciones del Sueño (SU)', category: 'Dimensiones Clínicas' },
            { id: 'IRPsi', name: 'Índice Global de Riesgo Psicopatológico (IRPsi)', category: 'Índices Globales' },
          ],
        };

      case 'brief_a':
        return {
          title: 'BRIEF-A — Evaluación Conductual de la Función Ejecutiva - Versión Adultos',
          subtitle: '9 escalas clínicas ejecutivas e índices BRI, MI y GEC (M=50, DE=10; T ≥ 65 alteración)',
          publisherTag: 'Roth, Isquith & Gioia · PAR',
          hasInvalidPreset: true,
          scales: [
            { id: 'NEG', name: 'Negatividad (NEG)', category: 'Validez' },
            { id: 'INF', name: 'Infrecuencia (INF)', category: 'Validez' },
            { id: 'INC', name: 'Inconsistencia (INC)', category: 'Validez' },
            { id: 'Inhibit', name: 'Inhibición', category: 'Regulación Conductual (BRI)' },
            { id: 'Shift', name: 'Flexibilidad (Shift)', category: 'Regulación Conductual (BRI)' },
            { id: 'EmotionalControl', name: 'Control Emocional', category: 'Regulación Conductual (BRI)' },
            { id: 'SelfMonitor', name: 'Automonitoreo', category: 'Regulación Conductual (BRI)' },
            { id: 'Initiate', name: 'Iniciativa', category: 'Metacognición (MI)' },
            { id: 'WorkingMemory', name: 'Memoria de Trabajo', category: 'Metacognición (MI)' },
            { id: 'PlanOrganize', name: 'Planificación y Organización', category: 'Metacognición (MI)' },
            { id: 'TaskMonitor', name: 'Monitoreo de la Tarea', category: 'Metacognición (MI)' },
            { id: 'OrgMaterials', name: 'Organización de Materiales', category: 'Metacognición (MI)' },
            { id: 'BRI', name: 'Índice de Regulación Conductual (BRI)', category: 'Índices Compuestos' },
            { id: 'MI', name: 'Índice de Metacognición (MI)', category: 'Índices Compuestos' },
            { id: 'GEC', name: 'Compuesto Ejecutivo Global (GEC)', category: 'Índices Compuestos' },
          ],
        };

      case 'cecad':
        return {
          title: 'CECAD — Cuestionario Educativo-Clínico: Ansiedad y Depresión',
          subtitle: 'Evaluación de trastornos internalizantes en niños y adolescentes de 7 a 18 años (M=50, DE=10)',
          publisherTag: 'Lozano, García-Cueto & Lozano · TEA Ediciones',
          scales: [
            { id: 'DEP', name: 'Depresión (DEP)', category: 'Escalas Principales' },
            { id: 'ANS', name: 'Ansiedad (ANS)', category: 'Escalas Principales' },
            { id: 'INU', name: 'Inutilidad (INU)', category: 'Dimensiones Clínicas' },
            { id: 'IRR', name: 'Irritabilidad (IRR)', category: 'Dimensiones Clínicas' },
            { id: 'PEN', name: 'Problemas de Pensamiento (PEN)', category: 'Dimensiones Clínicas' },
            { id: 'PSI', name: 'Síntomas Psicofisiológicos (PSI)', category: 'Dimensiones Clínicas' },
          ],
        };

      case 'iac':
        return {
          title: 'IAC — Inventario de Adaptación de Conducta',
          subtitle: 'Evaluación del grado de adaptación del adolescente en 4 esferas vitales (Puntuación alta = mejor adaptación)',
          publisherTag: 'Victoria de la Cruz & Agustín Cordero · TEA Ediciones',
          scales: [
            { id: 'PER', name: 'Adaptación Personal (PER)', category: 'Esferas de Adaptación', isProtective: true },
            { id: 'FAM', name: 'Adaptación Familiar (FAM)', category: 'Esferas de Adaptación', isProtective: true },
            { id: 'ESC', name: 'Adaptación Escolar (ESC)', category: 'Esferas de Adaptación', isProtective: true },
            { id: 'SOC', name: 'Adaptación Social (SOC)', category: 'Esferas de Adaptación', isProtective: true },
            { id: 'GLO', name: 'Índice Global de Adaptación (GLO)', category: 'Índice Compuesto', isProtective: true },
          ],
        };

      case 'iccp':
        return {
          title: 'ICCP — Instrumento de Conducta y Competencia Prosocial',
          subtitle: 'Evaluación de competencia socioemocional, empatía, asertividad y conducta prosocial escolar',
          publisherTag: 'Baremos Escolares Tipificados (M=50, DE=10)',
          scales: [
            { id: 'EMP', name: 'Empatía y Sensibilidad Social (EMP)', category: 'Competencias Prosociales', isProtective: true },
            { id: 'RES', name: 'Respeto y Cumplimiento Normativo (RES)', category: 'Competencias Prosociales', isProtective: true },
            { id: 'SOC', name: 'Iniciativa y Cooperación Social (SOC)', category: 'Competencias Prosociales', isProtective: true },
            { id: 'ASE', name: 'Asertividad y Resolución de Conflictos (ASE)', category: 'Competencias Prosociales', isProtective: true },
            { id: 'PRO', name: 'Índice Global de Competencia Prosocial (PRO)', category: 'Índice Global', isProtective: true },
          ],
        };

      case 'ipp_r':
        return {
          title: 'IPP-R — Inventario de Intereses y Preferencias Profesionales - Revisado',
          subtitle: 'Orientación vocacional en 15 campos profesionales: discrepancia entre Interés por Actividad (AC) y Profesión (PR)',
          publisherTag: 'M.ª Victoria de la Cruz · TEA Ediciones',
          scales: [
            { id: 'CIE_EXP', name: 'Científico-Experimental (AC/PR)', category: 'Ciencias y Tecnología' },
            { id: 'CIE_TEC', name: 'Científico-Técnico e Ingeniería', category: 'Ciencias y Tecnología' },
            { id: 'CIE_SAN', name: 'Científico-Sanitario y Salud', category: 'Ciencias y Tecnología' },
            { id: 'TEO_HUM', name: 'Teórico-Humanista y Letras', category: 'Humanidades y Sociales' },
            { id: 'JUR_SOC', name: 'Jurídico-Social y Político', category: 'Humanidades y Sociales' },
            { id: 'COM_INF', name: 'Comunicación e Información', category: 'Humanidades y Sociales' },
            { id: 'PSI_PED', name: 'Psicopedagógico y Educación', category: 'Humanidades y Sociales' },
            { id: 'EMP_ADM', name: 'Empresarial, Comercial y Finanzas', category: 'Gestión y Servicios' },
            { id: 'INF_SIS', name: 'Informática y Sistemas Digitales', category: 'Gestión y Servicios' },
            { id: 'ART_PLA', name: 'Artístico-Plástico y Diseño', category: 'Artes y Expresión' },
            { id: 'ART_MUS', name: 'Artístico-Musical y Escénico', category: 'Artes y Expresión' },
            { id: 'DEP_FIS', name: 'Actividad Físico-Deportiva', category: 'Operativo y Naturaleza' },
          ],
        };

      case 'sena':
        return {
          title: 'SENA — Sistema de Evaluación de Niños y Adolescentes',
          subtitle: 'Puntuaciones T en problemas emocionales, conductuales y recursos protectores',
          publisherTag: 'Fernández-Pinto, Santamaría et al. · TEA Ediciones',
          scales: [
            { id: 'depresion', name: 'Depresión', category: 'Problemas Emocionales' },
            { id: 'ansiedad', name: 'Ansiedad', category: 'Problemas Emocionales' },
            { id: 'somatizacion', name: 'Somatización', category: 'Problemas Emocionales' },
            { id: 'aislamiento', name: 'Aislamiento', category: 'Problemas Emocionales' },
            { id: 'problemas_conducta', name: 'Problemas de Conducta', category: 'Problemas Conductuales' },
            { id: 'hiperactividad', name: 'Hiperactividad / Impulsividad', category: 'Problemas Conductuales' },
            { id: 'rigidez', name: 'Rigidez / Inflexibilidad', category: 'Problemas Contextuales' },
            { id: 'autoestima', name: 'Autoestima (Recurso Protector)', category: 'Recursos Personales', isProtective: true },
            { id: 'integracion_social', name: 'Integración Social (Recurso Protector)', category: 'Recursos Personales', isProtective: true },
            { id: 'inc', name: 'Inconsistencia (INC)', category: 'Control de Respuesta' },
            { id: 'neg', name: 'Impresión Negativa (NEG)', category: 'Control de Respuesta' },
            { id: 'pos', name: 'Impresión Positiva (POS)', category: 'Control de Respuesta' },
          ],
        };

      case 'cbcl':
        return {
          title: 'CBCL — Child Behavior Checklist (ASEBA - Achenbach)',
          subtitle: 'Puntuaciones T en escalas de banda ancha, síndromes y orientadas al DSM',
          publisherTag: 'T. M. Achenbach · ASEBA',
          scales: [
            { id: 'internalizing', name: 'Problemas Internalizantes', category: 'Banda Ancha (Corte 60/64)' },
            { id: 'externalizing', name: 'Problemas Externalizantes', category: 'Banda Ancha (Corte 60/64)' },
            { id: 'total_problems', name: 'Total de Problemas', category: 'Banda Ancha (Corte 60/64)' },
            { id: 'anxious_depressed', name: 'Ansiedad / Depresión', category: 'Síndromes Empíricos (Corte 65/70)' },
            { id: 'withdrawn_depressed', name: 'Aislamiento / Depresión', category: 'Síndromes Empíricos (Corte 65/70)' },
            { id: 'somatic_complaints', name: 'Quejas Somáticas', category: 'Síndromes Empíricos (Corte 65/70)' },
            { id: 'social_problems', name: 'Problemas Sociales', category: 'Síndromes Empíricos (Corte 65/70)' },
            { id: 'thought_problems', name: 'Problemas de Pensamiento', category: 'Síndromes Empíricos (Corte 65/70)' },
            { id: 'attention', name: 'Problemas de Atención', category: 'Síndromes Empíricos (Corte 65/70)' },
            { id: 'rule_breaking', name: 'Conducta de Ruptura de Reglas', category: 'Síndromes Empíricos (Corte 65/70)' },
            { id: 'aggressive', name: 'Conducta Agresiva', category: 'Síndromes Empíricos (Corte 65/70)' },
            { id: 'dsm_depressive', name: 'DSM: Problemas Depresivos', category: 'Orientadas al DSM (Corte 65/70)' },
            { id: 'dsm_anxiety', name: 'DSM: Problemas de Ansiedad', category: 'Orientadas al DSM (Corte 65/70)' },
          ],
        };

      case 'byi_2':
        return {
          title: 'BYI-2 — Inventarios de Beck para Jóvenes - 2ª Edición',
          subtitle: '5 inventarios autoinformados para niños y adolescentes de 7 a 18 años',
          publisherTag: 'Beck, Beck, Jolly & Steer · Pearson Clinical',
          scales: [
            { id: 'BDI_Y', name: 'Inventario de Depresión (BDI-Y)', category: 'Inventarios Clínicos' },
            { id: 'BAI_Y', name: 'Inventario de Ansiedad (BAI-Y)', category: 'Inventarios Clínicos' },
            { id: 'BANI_Y', name: 'Inventario de Ira (BANI-Y)', category: 'Inventarios Clínicos' },
            { id: 'BDBI_Y', name: 'Conducta Disruptiva (BDBI-Y)', category: 'Inventarios Clínicos' },
            { id: 'BSCI_Y', name: 'Autoconcepto (BSCI-Y)', category: 'Autoconcepto (Invertido)', isProtective: true },
          ],
        };
    }
  }, [batteryId]);

  // Current values
  const currentScores: Record<string, number> = useMemo(() => {
    return data.tScores || {};
  }, [data.tScores]);

  // Answers count
  const answeredCount = Object.keys(currentScores).length;
  const totalCount = config.scales.length;
  const progressPercent = Math.min(100, Math.round((answeredCount / totalCount) * 100));

  // --------------------------------------------------------------------------
  // Calculation & Clinical Results
  // --------------------------------------------------------------------------
  const result = useMemo(() => {
    if (answeredCount === 0) return null;

    try {
      if (batteryId === 'mmpi_3') return calculateMmpi3(data);
      if (batteryId === 'pai') return calculatePai(data);
      if (batteryId === 'sena') return calculateSena(data);
      if (batteryId === 'cbcl') return calculateCbcl(data);
      if (batteryId === 'byi_2') return calculateByi2(data);
      return calculateExtendedLikert(batteryId as ExtendedLikertBatteryId, data);
    } catch {
      return null;
    }
  }, [batteryId, data, answeredCount]);

  // Type-safe extractors from result union
  const validity = useMemo(() => {
    if (!result) return null;
    if ('validity' in result && result.validity) {
      return result.validity as {
        isValidProtocol: boolean;
        invalidationReason?: string;
        invalidationReasons?: string[];
      };
    }
    return null;
  }, [result]);

  const suicideOrCriticalAlert = useMemo(() => {
    if (!result) return null;
    if ('suicideRiskAlert' in result && (result.suicideRiskAlert as any)?.triggered) {
      return { triggered: true, message: (result.suicideRiskAlert as any).message };
    }
    if ('criticalAlerts' in result && (result.criticalAlerts as any)?.hasRedFlag) {
      return {
        triggered: true,
        message: (result.criticalAlerts as any).bannerMessage || 'Alerta crítica identificada.',
      };
    }
    return null;
  }, [result]);

  const summaryMetrics = useMemo(() => {
    if (!result) return null;

    let elevationsCount = 0;
    if ('primaryElevations' in result && Array.isArray((result as any).primaryElevations)) {
      elevationsCount = (result as any).primaryElevations.length;
    } else if ('elevations' in result && Array.isArray((result as any).elevations)) {
      elevationsCount = (result as any).elevations.length;
    } else if ('clinicalElevations' in result && Array.isArray((result as any).clinicalElevations)) {
      elevationsCount = (result as any).clinicalElevations.length;
    }

    let classification = 'Completado';
    if ('clinicalClassification' in result && typeof (result as any).clinicalClassification === 'string') {
      classification = (result as any).clinicalClassification;
    } else if ('summary' in result && typeof (result as any).summary === 'string') {
      classification = (result as any).summary;
    }

    return {
      elevationsCount,
      classification,
    };
  }, [result]);

  // Update a single score
  const handleScoreChange = useCallback(
    (scaleId: string, val: number) => {
      setBatteryData(batteryId, (prev: any = {}) => {
        const nextTScores = { ...(prev.tScores || {}), [scaleId]: val };
        return {
          ...prev,
          tScores: nextTScores,
        };
      });
    },
    [batteryId, setBatteryData]
  );

  // Clear all scores
  const handleClear = useCallback(() => {
    setBatteryData(batteryId, { tScores: {}, omittedCount: 0 });
  }, [batteryId, setBatteryData]);

  // Load Presets
  const handleLoadSample = useCallback(
    (preset: 'typical' | 'clinical' | 'invalid') => {
      let nextState: any = { tScores: {} };

      if (batteryId === 'mmpi_3') {
        if (preset === 'typical') {
          nextState = {
            omittedCount: 0,
            tScores: {
              CRIN: 50, VRIN: 50, TRIN: 50, F: 52, Fp: 48, L: 50, K: 52,
              EID: 50, THD: 48, BXD: 50, RCd: 48, RC1: 50, RC2: 50, RC4: 52,
              RC6: 48, RC7: 50, RC8: 48, RC9: 50, SUI: 45,
            },
          };
        } else if (preset === 'clinical') {
          nextState = {
            omittedCount: 1,
            tScores: {
              CRIN: 52, VRIN: 50, TRIN: 54, F: 62, Fp: 51, L: 48, K: 45,
              EID: 78, THD: 48, BXD: 52, RCd: 76, RC2: 74, SUI: 72,
            },
          };
        } else {
          nextState = {
            omittedCount: 2,
            tScores: { VRIN: 85, CRIN: 82, EID: 88, RCd: 85 },
          };
        }
      } else if (batteryId === 'pai') {
        if (preset === 'typical') {
          nextState = {
            omittedCount: 0,
            tScores: {
              ICN: 50, INF: 48, NIM: 50, PIM: 50, SOM: 50, ANX: 52,
              ARD: 50, DEP: 48, MAN: 50, PAR: 50, SCZ: 48, BOR: 50,
              ANT: 50, ALC: 48, DRG: 46, AGG: 50, SUI: 45, STR: 50,
              NON: 50, RXR: 50, DOM: 50, WRM: 50,
            },
          };
        } else if (preset === 'clinical') {
          nextState = {
            omittedCount: 2,
            tScores: {
              ICN: 55, INF: 52, NIM: 68, PIM: 42, SOM: 58, ANX: 74,
              ARD: 65, DEP: 82, MAN: 48, PAR: 60, SCZ: 56, BOR: 78,
              ANT: 52, ALC: 50, DRG: 46, SUI: 84, AGG: 62, STR: 70,
            },
          };
        } else {
          nextState = {
            tScores: { ICN: 60, INF: 58, NIM: 96, PIM: 32, DEP: 95 },
          };
        }
      } else if (batteryId === 'sena') {
        if (preset === 'typical') {
          nextState = {
            tScores: {
              depresion: 50, ansiedad: 48, somatizacion: 50, aislamiento: 48,
              problemas_conducta: 50, hiperactividad: 52, rigidez: 48,
              autoestima: 54, integracion_social: 52, inc: 48, neg: 50, pos: 50,
            },
            criticalItems: { suicidalIdeation: false },
          };
        } else {
          nextState = {
            tScores: {
              depresion: 76, ansiedad: 72, somatizacion: 64, problemas_conducta: 48,
              hiperactividad: 50, aislamiento: 74, rigidez: 62,
              autoestima: 28, integracion_social: 34, inc: 48, neg: 62, pos: 40,
            },
            criticalItems: { suicidalIdeation: true },
          };
        }
      } else if (batteryId === 'cbcl') {
        if (preset === 'typical') {
          nextState = {
            tScores: {
              internalizing: 50, externalizing: 48, total_problems: 49,
              anxious_depressed: 50, withdrawn_depressed: 48, somatic_complaints: 50,
              social_problems: 50, thought_problems: 48, attention: 52,
              rule_breaking: 48, aggressive: 50, dsm_depressive: 50, dsm_anxiety: 48,
            },
          };
        } else {
          nextState = {
            tScores: {
              internalizing: 72, externalizing: 62, total_problems: 68,
              anxious_depressed: 74, withdrawn_depressed: 66, somatic_complaints: 58,
              social_problems: 60, thought_problems: 52, attention: 61,
              rule_breaking: 56, aggressive: 68, dsm_depressive: 75, dsm_anxiety: 70,
            },
          };
        }
      } else if (batteryId === 'byi_2') {
        if (preset === 'typical') {
          nextState = {
            tScores: {
              BDI_Y: 48, BAI_Y: 50, BANI_Y: 48, BDBI_Y: 46, BSCI_Y: 54,
            },
            suicidalItemResponse: 0,
          };
        } else {
          nextState = {
            tScores: {
              BDI_Y: 72, BAI_Y: 64, BANI_Y: 52, BDBI_Y: 48, BSCI_Y: 36,
            },
            suicidalItemResponse: 2,
          };
        }
      } else {
        // Generic smart presets for all 10 extended Likert batteries
        const tMap: Record<string, number> = {};
        config.scales.forEach((sc, idx) => {
          if (preset === 'typical') {
            tMap[sc.id] = sc.isProtective ? 54 : 48 + (idx % 5);
          } else if (preset === 'clinical') {
            if (sc.category === 'Validez') {
              tMap[sc.id] = 54;
            } else if (sc.isProtective) {
              tMap[sc.id] = 32;
            } else {
              tMap[sc.id] = idx % 2 === 0 ? 74 : 66;
            }
          } else {
            // Invalid protocol preset
            tMap[sc.id] = sc.category === 'Validez' ? 88 : 72;
          }
        });
        nextState = {
          omittedCount: preset === 'invalid' ? 18 : 0,
          tScores: tMap,
          criticalItems: { suicidalIdeation: preset === 'clinical' && ['mmpi_rf', 'mmpi_a_rf', 'cecad'].includes(batteryId) },
        };
      }

      setBatteryData(batteryId, nextState);
    },
    [batteryId, config.scales, setBatteryData]
  );

  // --------------------------------------------------------------------------
  // SVG Vector Clinical Psychogram Data
  // --------------------------------------------------------------------------
  const chartPoints = useMemo(() => {
    const plotScales = config.scales.filter((s) => !s.isOmission);
    const width = 760;
    const height = 220;
    const padL = 44;
    const padR = 24;
    const padT = 20;
    const padB = 42;
    const innerW = width - padL - padR;
    const innerH = height - padT - padB;

    const yForT = (t: number) => {
      const clamped = Math.max(20, Math.min(100, t));
      return padT + innerH - ((clamped - 20) / 80) * innerH;
    };

    const pts = plotScales.map((sc, i) => {
      const val = typeof currentScores[sc.id] === 'number' ? currentScores[sc.id] : 50;
      const x =
        plotScales.length > 1
          ? padL + (i / (plotScales.length - 1)) * innerW
          : padL + innerW / 2;
      const y = yForT(val);
      return { id: sc.id, label: sc.id, name: sc.name, val, x, y, hasValue: currentScores[sc.id] !== undefined };
    });

    return { width, height, padL, padR, padT, padB, innerW, innerH, yForT, pts };
  }, [config.scales, currentScores]);

  return (
    <div className="space-y-6" data-testid={`likert-form-${batteryId}`}>
      {/* 1. Header with Publisher Tag, Presets & Progress */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                {config.publisherTag}
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500">
                Puntuación T (M=50, DE=10)
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {config.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{config.subtitle}</p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleLoadSample('typical')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Muestra Típica</span>
            </button>

            <button
              type="button"
              onClick={() => handleLoadSample('clinical')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-all shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Muestra Clínica</span>
            </button>

            {config.hasInvalidPreset && (
              <button
                type="button"
                onClick={() => handleLoadSample('invalid')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 transition-all shadow-xs"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Protocolo Inválido</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
              title="Borrar todas las respuestas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Counter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Progreso de cumplimentación psicométrica</span>
            <span className="font-mono tabular-nums">
              {answeredCount} / {totalCount} escalas ingresadas ({progressPercent}%)
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Critical Alerts & Protocol Invalidation Banners */}
      {validity && !validity.isValidProtocol && (
        <div
          data-testid="protocol-invalid-banner"
          className="bg-red-50 border-l-4 border-red-600 p-4 rounded-xl text-red-900 flex items-start gap-3 shadow-xs"
        >
          <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-black">
              PROTOCOLO PROTOCOLARMENTE INVÁLIDO — PERFIL NO INTERPRETABLE
            </h4>
            <p className="text-xs text-red-800 mt-1">
              {validity.invalidationReason ||
                validity.invalidationReasons?.join('; ') ||
                'Se detectó una tasa excesiva de omisiones o inconsistencia extrema que anula la validez del protocolo.'}
            </p>
          </div>
        </div>
      )}

      {/* Suicide Alert Banner */}
      {suicideOrCriticalAlert?.triggered && (
        <div
          data-testid="critical-suicide-banner"
          className="bg-red-600 text-white p-4 rounded-xl flex items-start gap-3 shadow-md animate-pulse"
        >
          <AlertOctagon className="w-6 h-6 text-white shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-black tracking-wide">
              ALERTA DE SEGURIDAD CLÍNICA PRIORITARIA (RIESGO SUICIDA / ÍTEM CRÍTICO)
            </h4>
            <p className="text-xs text-red-100 mt-1 font-medium">
              {suicideOrCriticalAlert.message ||
                'Se ha identificado respuesta afirmativa en reactivos críticos de ideación suicida o autolesión.'}
            </p>
          </div>
        </div>
      )}

      {/* 2.5 Live Vector SVG Psychogram (Q-global / TEA Corrige Style) */}
      {answeredCount > 0 && (
        <div
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs"
          data-testid="likert-svg-psychogram"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Psicograma Vectorial de Puntuaciones T (Perfil Normativo en Vivo)
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-100 border border-emerald-300 inline-block" />
                Banda Normativa (T 40–60)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-amber-500 inline-block" />
                Riesgo (T=65)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-red-600 inline-block" />
                Clínico (T=70)
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartPoints.width} ${chartPoints.height}`}
              className="w-full h-auto min-w-[540px]"
              role="img"
              aria-label={`Psicograma de puntuaciones T para ${config.title}`}
            >
              {/* Shaded Normative Band T=40..60 */}
              <rect
                x={chartPoints.padL}
                y={chartPoints.yForT(60)}
                width={chartPoints.innerW}
                height={chartPoints.yForT(40) - chartPoints.yForT(60)}
                fill="#ecfdf5"
                opacity="0.7"
              />

              {/* Horizontal Grid Lines */}
              {[30, 40, 50, 60, 65, 70, 80, 90].map((tVal) => {
                const y = chartPoints.yForT(tVal);
                const isClinical = tVal === 70;
                const isWarning = tVal === 65;
                const isMean = tVal === 50;
                return (
                  <g key={tVal}>
                    <line
                      x1={chartPoints.padL}
                      y1={y}
                      x2={chartPoints.width - chartPoints.padR}
                      y2={y}
                      stroke={
                        isClinical
                          ? '#dc2626'
                          : isWarning
                          ? '#f59e0b'
                          : isMean
                          ? '#64748b'
                          : '#e2e8f0'
                      }
                      strokeWidth={isClinical || isWarning || isMean ? 1.5 : 1}
                      strokeDasharray={isClinical || isWarning ? '5,4' : undefined}
                    />
                    <text
                      x={chartPoints.padL - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[9px] fill-slate-500 font-mono font-bold"
                    >
                      T{tVal}
                    </text>
                  </g>
                );
              })}

              {/* Connecting Profile Line */}
              {chartPoints.pts.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="2.25"
                  points={chartPoints.pts.map((p) => `${p.x},${p.y}`).join(' ')}
                />
              )}

              {/* Data Nodes & Scale Labels */}
              {chartPoints.pts.map((p) => {
                const isHigh = p.val >= 70;
                const isMod = p.val >= 65 && p.val < 70;
                return (
                  <g key={p.id}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHigh ? 5.5 : 4.5}
                      fill={isHigh ? '#dc2626' : isMod ? '#f59e0b' : '#1d4ed8'}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      x={p.x}
                      y={p.y - 8}
                      textAnchor="middle"
                      className="text-[9px] font-mono font-bold fill-slate-800"
                    >
                      {p.val}
                    </text>
                    <text
                      x={p.x}
                      y={chartPoints.height - 14}
                      textAnchor="middle"
                      className="text-[9px] font-bold fill-slate-600"
                    >
                      {p.label.slice(0, 7)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* 3. Responsive Likert / Scale Matrix Input Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Matriz de Escalas Psicométricas
            </span>
            <span className="text-[11px] text-slate-500">
              Formato esperado: Puntuación T entera entre 0 y 120 (Media normativa = 50, DE = 10)
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Ingresa la puntuación T directa o usa los selectores rápidos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/60 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                <th className="py-2.5 px-4">Escala</th>
                <th className="py-2.5 px-4">Categoría</th>
                <th className="py-2.5 px-4 text-center">Puntuación T (0–120)</th>
                <th className="py-2.5 px-4 text-center">Selectores Rápidos</th>
                <th className="py-2.5 px-4">Clasificación Clínica</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {config.scales.map((scale) => {
                const val = currentScores[scale.id] ?? '';
                const isOutOfRange =
                  typeof val === 'number' && (val < 0 || val > 120);

                // Determine classification level
                let qual = 'Normal';
                let qualColor = 'text-slate-600 bg-slate-100';

                if (scale.id === 'CNS' && typeof val === 'number') {
                  qual = val >= 15 ? 'Inválido (>= 15)' : 'Aceptable';
                  qualColor =
                    val >= 15
                      ? 'text-red-700 bg-red-100'
                      : 'text-emerald-700 bg-emerald-100';
                } else if (typeof val === 'number') {
                  if (scale.isProtective || scale.category === 'Recursos Personales') {
                    if (val <= 30) {
                      qual = 'Clínico / Déficit Severo';
                      qualColor = 'text-red-700 bg-red-100 font-bold';
                    } else if (val <= 39) {
                      qual = 'En Riesgo / Bajo';
                      qualColor = 'text-amber-700 bg-amber-100 font-bold';
                    } else if (val >= 60) {
                      qual = 'Fortaleza / Muy Alto';
                      qualColor = 'text-emerald-800 bg-emerald-100 font-bold';
                    } else {
                      qual = 'Normal / Adecuado';
                      qualColor = 'text-emerald-700 bg-emerald-50';
                    }
                  } else if (val >= 80) {
                    qual = 'Marcada / Severa';
                    qualColor = 'text-red-700 bg-red-100 font-black';
                  } else if (val >= 70) {
                    qual = 'Clínicamente Significativa';
                    qualColor = 'text-red-700 bg-red-100 font-bold';
                  } else if (val >= 65) {
                    qual = 'Límite / En Riesgo';
                    qualColor = 'text-amber-700 bg-amber-100 font-bold';
                  } else if (
                    val >= 60 &&
                    batteryId === 'cbcl' &&
                    scale.category.includes('Banda Ancha')
                  ) {
                    qual = 'Limítrofe';
                    qualColor = 'text-amber-700 bg-amber-100 font-bold';
                  } else {
                    qual = 'Normal / No significativa';
                    qualColor = 'text-slate-600 bg-slate-50';
                  }
                }

                return (
                  <tr
                    key={scale.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {scale.name}
                    </td>

                    <td className="py-2.5 px-4 text-slate-500">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100">
                        {scale.category}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="120"
                        aria-label={`Puntuación para ${scale.name}`}
                        aria-invalid={isOutOfRange}
                        value={val}
                        onChange={(e) => {
                          const n = parseInt(e.target.value, 10);
                          handleScoreChange(scale.id, isNaN(n) ? 0 : n);
                        }}
                        className="psych-score-input w-16 py-1 px-2 text-center font-mono tabular-nums font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        placeholder="50"
                      />
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        {[45, 50, 65, 75, 85].map((presetVal) => (
                          <button
                            key={presetVal}
                            type="button"
                            onClick={() => handleScoreChange(scale.id, presetVal)}
                            className={`px-1.5 py-0.5 text-[10px] font-mono tabular-nums font-bold rounded transition-all ${
                              val === presetVal
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            T={presetVal}
                          </button>
                        ))}
                      </div>
                    </td>

                    <td className="py-2.5 px-4">
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full ${qualColor}`}
                      >
                        {qual}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Real-time Results Summary Card */}
      {result && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Resumen Interpretativo Psicométrico
            </h4>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-900/50 text-blue-200 border border-blue-700">
              Cálculo Reactivo en Tiempo Real
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
              <span className="text-slate-400 block mb-1">Validez del Protocolo:</span>
              <span
                className={`font-bold text-sm flex items-center gap-1.5 ${
                  !validity || validity.isValidProtocol ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {!validity || validity.isValidProtocol ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Protocolo VÁLIDO</span>
                  </>
                ) : (
                  <>
                    <AlertOctagon className="w-4 h-4" />
                    <span>Protocolo INVÁLIDO</span>
                  </>
                )}
              </span>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
              <span className="text-slate-400 block mb-1">Elevaciones Clínicas:</span>
              <span className="font-mono tabular-nums font-bold text-white text-sm">
                {summaryMetrics?.elevationsCount ?? 0} escalas significativas
              </span>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
              <span className="text-slate-400 block mb-1">Clasificación Global:</span>
              <span className="font-bold text-slate-100 text-sm">
                {summaryMetrics?.classification || 'Completado'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
