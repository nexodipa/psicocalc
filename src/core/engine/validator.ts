import { BatteryType } from '../types/psychometrics';

export interface ScaledScoreValidation {
  isValid: boolean;
  errorMessage?: string;
}

export interface AgeValidationResult {
  isValid: boolean;
  years: number;
  months: number;
  days: number;
  errorMessage?: string;
  isOverlappingAge?: boolean; // 16:0 to 16:11 overlap between WISC-V and WAIS-IV
}

/**
 * Validates a single subtest scaled score.
 * Must be an integer between 1 and 19.
 */
export function validateScaledScore(score: unknown): ScaledScoreValidation {
  // 1. Required presence check
  if (score === null || score === undefined || score === '') {
    return { isValid: false, errorMessage: 'La puntuación escalar es requerida.' };
  }

  // 2. Strict primitive type gating before coercion
  if (typeof score === 'boolean') {
    return { isValid: false, errorMessage: 'La puntuación debe ser un número entero.' };
  }
  if (typeof score === 'symbol') {
    return { isValid: false, errorMessage: 'La puntuación debe ser un número entero.' };
  }
  if (typeof score === 'object') {
    return { isValid: false, errorMessage: 'La puntuación debe ser un número entero.' };
  }
  if (typeof score !== 'number' && typeof score !== 'string') {
    return { isValid: false, errorMessage: 'La puntuación debe ser un número.' };
  }

  // 3. Strict string format inspection
  if (typeof score === 'string') {
    const trimmed = score.trim();
    if (trimmed === '') {
      return { isValid: false, errorMessage: 'La puntuación escalar es requerida.' };
    }
    // Reject non-numeric strings, injection payloads, placeholders
    if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return { isValid: false, errorMessage: 'La puntuación debe ser un número válido.' };
    }
  }

  // 4. Safe conversion to number
  const num = Number(score);

  if (isNaN(num) || !isFinite(num)) {
    return { isValid: false, errorMessage: 'La puntuación no es un número válido.' };
  }

  // 5. Integer check
  if (!Number.isInteger(num)) {
    return { isValid: false, errorMessage: 'La puntuación escalar debe ser un número entero.' };
  }

  // 6. Range bounds [1..19]
  if (num < 1) {
    return { isValid: false, errorMessage: 'La puntuación escalar mínima permitida es 1.' };
  }
  if (num > 19) {
    return { isValid: false, errorMessage: 'La puntuación escalar no puede ser superior a 19.' };
  }

  return { isValid: true };
}

/**
 * Helper to get number of days in a specific month and year.
 */
function getDaysInMonth(year: number, month: number): number {
  // month is 1-based (1 = Jan, 12 = Dec)
  return new Date(year, month, 0).getDate();
}

/**
 * Parses an ISO date string (YYYY-MM-DD) into year, month, day.
 */
function parseDateParts(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.trim().split('-');
  if (parts.length !== 3) return null;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  if (month < 1 || month > 12) return null;
  const maxDays = getDaysInMonth(year, month);
  if (day < 1 || day > maxDays) return null;

  return { year, month, day };
}

/**
 * Computes exact chronological age in years, months, and days using
 * standard psychometric borrowing method.
 */
export function calculateChronologicalAge(
  birthDate: string,
  testDate: string
): { years: number; months: number; days: number; isValid: boolean; errorMessage?: string } {
  const b = parseDateParts(birthDate);
  const t = parseDateParts(testDate);

  if (!b) {
    return { years: 0, months: 0, days: 0, isValid: false, errorMessage: 'Fecha de nacimiento inválida (formato esperado: YYYY-MM-DD).' };
  }
  if (!t) {
    return { years: 0, months: 0, days: 0, isValid: false, errorMessage: 'Fecha de evaluación inválida (formato esperado: YYYY-MM-DD).' };
  }

  let dDiff = t.day - b.day;
  let mDiff = t.month - b.month;
  let yDiff = t.year - b.year;

  if (dDiff < 0) {
    // Borrow days from previous month
    let prevMonth = t.month - 1;
    let prevYear = t.year;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    dDiff += daysInPrevMonth;
    mDiff -= 1;
  }

  if (mDiff < 0) {
    mDiff += 12;
    yDiff -= 1;
  }

  if (yDiff < 0) {
    return {
      years: 0,
      months: 0,
      days: 0,
      isValid: false,
      errorMessage: 'La fecha de evaluación no puede ser anterior a la fecha de nacimiento.',
    };
  }

  return {
    years: yDiff,
    months: mDiff,
    days: dDiff,
    isValid: true,
  };
}

/**
 * Validates chronological age against chosen psychometric battery standards.
 * - WISC-V: 6:0 to 16:11 (inclusive, strictly < 17:0:0)
 * - WAIS-IV: 16:0 to 90:11 (inclusive, strictly < 91:0:0)
 */
export function validateAgeAndBattery(
  birthDate: string,
  testDate: string,
  battery: BatteryType
): AgeValidationResult {
  const age = calculateChronologicalAge(birthDate, testDate);

  if (!age.isValid) {
    return {
      isValid: false,
      years: age.years,
      months: age.months,
      days: age.days,
      errorMessage: age.errorMessage,
    };
  }

  const { years, months, days } = age;
  const isOverlap = years === 16;

  if (battery === 'WISC-V') {
    if (years < 6) {
      return {
        isValid: false,
        years,
        months,
        days,
        errorMessage: 'El evaluado tiene menos de 6 años (5:11 o menor). Para esta edad corresponde la batería WPPSI-IV.',
      };
    }
    if (years >= 17) {
      return {
        isValid: false,
        years,
        months,
        days,
        errorMessage: 'La edad del evaluado (≥ 17 años) supera el rango cubierto por WISC-V (6:0 a 16:11). Corresponde aplicar WAIS-IV.',
      };
    }
    return {
      isValid: true,
      years,
      months,
      days,
      isOverlappingAge: isOverlap,
    };
  }

  if (battery === 'WAIS-IV') {
    if (years < 16) {
      return {
        isValid: false,
        years,
        months,
        days,
        errorMessage: 'El evaluado tiene menos de 16 años. Para esta edad corresponde aplicar la batería WISC-V (6:0 a 16:11).',
      };
    }
    if (years > 90 || (years === 90 && months > 11)) {
      return {
        isValid: false,
        years,
        months,
        days,
        errorMessage: 'La edad supera la muestra de tipificación estándar de WAIS-IV (90 años y 11 meses).',
      };
    }
    return {
      isValid: true,
      years,
      months,
      days,
      isOverlappingAge: isOverlap,
    };
  }

  return {
    isValid: false,
    years,
    months,
    days,
    errorMessage: 'Batería psicométrica no reconocida.',
  };
}
