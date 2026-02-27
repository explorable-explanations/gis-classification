import * as d3sc from 'd3-scale-chromatic';
import {range} from 'd3-array';
import {colorToHex} from './color-utils';
import {SEQUENTIAL_SCHEMES, DIVERGING_SCHEMES, QUALITATIVE_SCHEMES} from './constants';
import type {PaletteEntry, PaletteType, HexColor} from './types';

function buildPaletteEntry(name: string, type: PaletteType): PaletteEntry {
  const scheme = (d3sc as any)[`scheme${name}`];
  const interpolator = (d3sc as any)[`interpolate${name}`];

  let maxClasses: number;
  if (type === 'qualitative' && Array.isArray(scheme)) {
    maxClasses = scheme.length;
  } else if (Array.isArray(scheme)) {
    maxClasses = scheme.length - 1;
  } else {
    maxClasses = 12;
  }

  return {
    name,
    type,
    maxClasses,
    colors: (n: number): HexColor[] => {
      const clamped = Math.max(1, Math.min(n, maxClasses));
      if (type === 'qualitative' && Array.isArray(scheme)) {
        return scheme.slice(0, clamped).map(colorToHex);
      }
      if (Array.isArray(scheme) && scheme[clamped]) {
        return [...scheme[clamped]].map(colorToHex);
      }
      if (interpolator) {
        if (clamped === 1) return [colorToHex(interpolator(0.5))];
        return range(clamped).map(i => colorToHex(interpolator(i / (clamped - 1))));
      }
      return [];
    },
  };
}

export const ALL_PALETTES: PaletteEntry[] = [
  ...SEQUENTIAL_SCHEMES.map(n => buildPaletteEntry(n, 'sequential')),
  ...DIVERGING_SCHEMES.map(n => buildPaletteEntry(n, 'diverging')),
  ...QUALITATIVE_SCHEMES.map(n => buildPaletteEntry(n, 'qualitative')),
];

export function getPaletteByName(name: string): PaletteEntry | undefined {
  return ALL_PALETTES.find(p => p.name === name);
}

export function getPalettesByType(type: PaletteType | 'all'): PaletteEntry[] {
  if (type === 'all') return ALL_PALETTES;
  return ALL_PALETTES.filter(p => p.type === type);
}
