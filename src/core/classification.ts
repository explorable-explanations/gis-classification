import type {ClassificationOptions, ClassificationResult} from './types';
import type {ClassificationMethod} from './types';
import {breaks as statBreaks} from 'statsbreaks';

export function classify(
  data: number[],
  options: ClassificationOptions
): ClassificationResult {
  const cleanData = data
    .filter((d): d is number => d !== undefined && d !== null && !isNaN(+d) && d !== ('' as any));

  if (cleanData.length === 0) {
    return {breaks: [], innerBreaks: [], nClasses: 0};
  }

  // 'custom' is not a statsbreaks method; breaks are managed externally
  if (options.method === 'custom') {
    return {breaks: [], innerBreaks: [], nClasses: 0};
  }

  // nestedmeans requires nb to be a power of 2
  let nb = options.nb;
  if (options.method === 'nestedmeans' && nb !== undefined) {
    const log2 = Math.log2(nb);
    nb = Math.pow(2, Math.round(log2));
    if (nb < 2) nb = 2;
  }

  const allBreaks = statBreaks(cleanData, {
    method: options.method,
    nb,
    precision: options.precision,
    k: options.k,
    middle: options.middle,
    minmax: true,
  });

  const innerBreaks = allBreaks.slice(1, -1);

  return {
    breaks: allBreaks,
    innerBreaks,
    nClasses: allBreaks.length - 1,
  };
}

export const METHODS: ClassificationMethod[] = [
  'quantile', 'q6', 'equal', 'jenks', 'msd',
  'geometric', 'headtail', 'pretty', 'arithmetic', 'nestedmeans',
  'custom',
];
