import { QualitativeCategory } from '../types/psychometrics';

export interface QualitativeBand {
  min: number;
  max: number;
  category: QualitativeCategory;
  descriptionModern: string;
  percentileRange: string;
}

export const QUALITATIVE_BANDS: QualitativeBand[] = [
  {
    min: 130,
    max: 160,
    category: 'Muy Superior',
    descriptionModern: 'Extremadamente Alto',
    percentileRange: '≥ 98',
  },
  {
    min: 120,
    max: 129,
    category: 'Superior',
    descriptionModern: 'Muy Alto',
    percentileRange: '91 – 97',
  },
  {
    min: 110,
    max: 119,
    category: 'Promedio Alto',
    descriptionModern: 'Medio-Alto',
    percentileRange: '75 – 90',
  },
  {
    min: 90,
    max: 109,
    category: 'Promedio',
    descriptionModern: 'Medio',
    percentileRange: '25 – 73',
  },
  {
    min: 80,
    max: 89,
    category: 'Promedio Bajo',
    descriptionModern: 'Medio-Bajo',
    percentileRange: '9 – 23',
  },
  {
    min: 70,
    max: 79,
    category: 'Limítrofe',
    descriptionModern: 'Muy Bajo',
    percentileRange: '2 – 8',
  },
  {
    min: 40,
    max: 69,
    category: 'Extremadamente Bajo',
    descriptionModern: 'Extremadamente Bajo',
    percentileRange: '≤ 2',
  },
];

/**
 * Returns the Wechsler qualitative classification for a composite score [40..160].
 */
export function getQualitativeCategory(compositeScore: number): QualitativeCategory {
  if (compositeScore >= 130) {
    return 'Muy Superior';
  }
  if (compositeScore >= 120) {
    return 'Superior';
  }
  if (compositeScore >= 110) {
    return 'Promedio Alto';
  }
  if (compositeScore >= 90) {
    return 'Promedio';
  }
  if (compositeScore >= 80) {
    return 'Promedio Bajo';
  }
  if (compositeScore >= 70) {
    return 'Limítrofe';
  }
  return 'Extremadamente Bajo';
}
