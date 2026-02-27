import {format as d3Format} from 'd3-format';

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  const abs = Math.abs(n);
  if (abs === 0) return '0';
  if (abs < 1) return d3Format('.4~f')(n);
  if (abs < 1000) return d3Format('.4~r')(n);
  if (abs < 10000) return d3Format(',.2~f')(n);
  return d3Format('.4~s')(n);
}
