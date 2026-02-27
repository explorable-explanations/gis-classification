// --- Color primitives ---
export type HexColor = string;

// --- Classification ---
export type ClassificationMethod =
  | 'quantile'
  | 'q6'
  | 'equal'
  | 'jenks'
  | 'msd'
  | 'geometric'
  | 'headtail'
  | 'pretty'
  | 'arithmetic'
  | 'nestedmeans'
  | 'custom';

export type ClassificationOptions = {
  method: ClassificationMethod;
  nb: number;
  precision?: number;
  k?: number;
  middle?: boolean;
};

export type ClassificationResult = {
  breaks: number[];
  innerBreaks: number[];
  nClasses: number;
};

// --- Palettes ---
export type PaletteType = 'sequential' | 'diverging' | 'qualitative';

export type PaletteEntry = {
  name: string;
  type: PaletteType;
  maxClasses: number;
  colors: (n: number) => HexColor[];
};

// --- Colorize result ---
export type ColorizeResult = {
  getColor: (value: number | string) => HexColor;
  breaks: number[];
  colors: HexColor[];
  missing: [string, HexColor] | null;
};

// --- Legend entry ---
export type BreakLegendEntry = {
  color: HexColor;
  label: string;
  range: [number | null, number | null];
};

// --- UI state ---
export type PaletteConfig = {
  type: PaletteType | 'all';
  steps: number;
  reversed: boolean;
};

// --- Histogram ---
export type Bin = {
  x0: number;
  x1: number;
  count: number;
};
