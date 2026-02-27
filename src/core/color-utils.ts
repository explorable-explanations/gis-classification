import {color} from 'd3-color';
import type {HexColor} from './types';

export function colorToHex(c: string): HexColor {
  const parsed = color(c);
  if (!parsed) return c;
  return parsed.formatHex();
}

export function hexToRgb(hex: string): [number, number, number] {
  const parsed = color(hex);
  if (!parsed) return [0, 0, 0];
  const rgb = parsed.rgb();
  return [rgb.r, rgb.g, rgb.b];
}
