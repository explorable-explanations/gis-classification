import {bin as d3Bin, extent, mean} from 'd3-array';
import type {Bin} from './types';

export function computeHistogram(values: number[], numBins = 30): Bin[] {
  const clean = values.filter(d => d != null && !isNaN(d));
  if (clean.length === 0) return [];

  const bins = d3Bin().thresholds(numBins)(clean);

  return bins.map(b => ({
    x0: b.x0 ?? 0,
    x1: b.x1 ?? 0,
    count: b.length,
  }));
}

export function getHistogramDomain(values: number[]): {min: number; max: number; mean: number} {
  const clean = values.filter(d => d != null && !isNaN(d));
  const [min, max] = extent(clean) as [number, number];
  const avg = mean(clean) ?? 0;
  return {min: min ?? 0, max: max ?? 0, mean: avg};
}
