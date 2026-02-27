type HexColor = string;
type ClassificationMethod = 'quantile' | 'q6' | 'equal' | 'jenks' | 'msd' | 'geometric' | 'headtail' | 'pretty' | 'arithmetic' | 'nestedmeans' | 'custom';
type ClassificationOptions = {
    method: ClassificationMethod;
    nb: number;
    precision?: number;
    k?: number;
    middle?: boolean;
};
type ClassificationResult = {
    breaks: number[];
    innerBreaks: number[];
    nClasses: number;
};
type PaletteType = 'sequential' | 'diverging' | 'qualitative';
type PaletteEntry = {
    name: string;
    type: PaletteType;
    maxClasses: number;
    colors: (n: number) => HexColor[];
};
type ColorizeResult = {
    getColor: (value: number | string) => HexColor;
    breaks: number[];
    colors: HexColor[];
    missing: [string, HexColor] | null;
};
type BreakLegendEntry = {
    color: HexColor;
    label: string;
    range: [number | null, number | null];
};
type PaletteConfig = {
    type: PaletteType | 'all';
    steps: number;
    reversed: boolean;
};
type Bin = {
    x0: number;
    x1: number;
    count: number;
};

declare const CLASSIFICATION_METHODS: Record<ClassificationMethod, string>;
declare const SEQUENTIAL_SCHEMES: string[];
declare const DIVERGING_SCHEMES: string[];
declare const QUALITATIVE_SCHEMES: string[];
declare const DEFAULT_METHOD: ClassificationMethod;
declare const DEFAULT_NB_CLASSES = 5;
declare const DEFAULT_PALETTE = "Blues";
declare const DEFAULT_MISSING_COLOR = "#f5f5f5";
declare const DEFAULT_MISSING_TEXT = "No data";

declare function classify(data: number[], options: ClassificationOptions): ClassificationResult;
declare const METHODS: ClassificationMethod[];

declare const ALL_PALETTES: PaletteEntry[];
declare function getPaletteByName(name: string): PaletteEntry | undefined;
declare function getPalettesByType(type: PaletteType | 'all'): PaletteEntry[];

declare function colorizeChoropleth(values: number[], options?: {
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
}): ColorizeResult;
declare function breaksToLegend(breaks: number[], colors: HexColor[]): BreakLegendEntry[];

declare function computeHistogram(values: number[], numBins?: number): Bin[];
declare function getHistogramDomain(values: number[]): {
    min: number;
    max: number;
    mean: number;
};

declare function colorToHex(c: string): HexColor;
declare function hexToRgb(hex: string): [number, number, number];

declare function formatNumber(n: number): string;

export { ALL_PALETTES, type Bin, type BreakLegendEntry, CLASSIFICATION_METHODS, type ClassificationMethod, type ClassificationOptions, type ClassificationResult, type ColorizeResult, DEFAULT_METHOD, DEFAULT_MISSING_COLOR, DEFAULT_MISSING_TEXT, DEFAULT_NB_CLASSES, DEFAULT_PALETTE, DIVERGING_SCHEMES, type HexColor, METHODS, type PaletteConfig, type PaletteEntry, type PaletteType, QUALITATIVE_SCHEMES, SEQUENTIAL_SCHEMES, breaksToLegend, classify, colorToHex, colorizeChoropleth, computeHistogram, formatNumber, getHistogramDomain, getPaletteByName, getPalettesByType, hexToRgb };
