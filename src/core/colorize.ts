import {scaleThreshold, scaleOrdinal} from 'd3-scale';
import {classify} from './classification';
import {getPaletteByName} from './palettes';
import {formatNumber} from './format';
import {DEFAULT_METHOD, DEFAULT_NB_CLASSES, DEFAULT_PALETTE, DEFAULT_MISSING_COLOR, DEFAULT_MISSING_TEXT} from './constants';
import type {ClassificationMethod, ColorizeResult, BreakLegendEntry, HexColor} from './types';

export function colorizeChoropleth(
  values: number[],
  options: {
    method?: ClassificationMethod;
    nClasses?: number;
    palette?: string;
    colors?: HexColor[];
    breaks?: number[];
    precision?: number;
    k?: number;
    middle?: boolean;
    reversed?: boolean;
    missingColor?: HexColor;
    missingText?: string;
  } = {}
): ColorizeResult {
  const method = options.method ?? DEFAULT_METHOD;
  const nClasses = options.nClasses ?? DEFAULT_NB_CLASSES;
  const missingColor = options.missingColor ?? DEFAULT_MISSING_COLOR;
  const missingText = options.missingText ?? DEFAULT_MISSING_TEXT;

  let allBreaks: number[];
  if (options.breaks) {
    allBreaks = [...options.breaks].sort((a, b) => a - b);
  } else {
    const result = classify(values, {
      method,
      nb: nClasses,
      precision: options.precision,
      k: options.k,
      middle: options.middle,
    });
    allBreaks = result.breaks;
  }

  let colors: HexColor[];
  if (options.colors) {
    colors = options.colors;
  } else {
    const paletteName = options.palette ?? DEFAULT_PALETTE;
    const entry = getPaletteByName(paletteName);
    colors = entry ? entry.colors(allBreaks.length - 1) : [];
  }

  if (options.reversed) {
    colors = [...colors].reverse();
  }

  const innerBreaks = allBreaks.slice(1, -1);

  const scale = scaleThreshold<number, string>()
    .domain(innerBreaks)
    .range(colors)
    .unknown(missingColor);

  const hasMissing = values.some(v => v == null || v === ('' as any) || isNaN(+v));
  const missing: [string, HexColor] | null = hasMissing ? [missingText, missingColor] : null;

  return {
    getColor: (value) => {
      if (value === '' || value == null || isNaN(+(value as number))) {
        return missingColor;
      }
      return scale(+(value as number));
    },
    breaks: allBreaks,
    colors,
    missing,
  };
}

export function breaksToLegend(breaks: number[], colors: HexColor[]): BreakLegendEntry[] {
  if (breaks.length < 2 || colors.length === 0) return [];

  return colors.map((color, i) => {
    const lower = i === 0 ? null : breaks[i];
    const upper = i === colors.length - 1 ? null : breaks[i + 1];
    let label: string;
    if (lower === null) {
      label = `< ${formatNumber(breaks[1])}`;
    } else if (upper === null) {
      label = `${formatNumber(breaks[i])} +`;
    } else {
      label = `${formatNumber(lower)} - ${formatNumber(upper)}`;
    }
    return {color, label, range: [lower, upper]};
  });
}
