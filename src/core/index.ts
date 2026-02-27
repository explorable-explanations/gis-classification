// Types
export type {
  HexColor,
  ClassificationMethod,
  ClassificationOptions,
  ClassificationResult,
  PaletteType,
  PaletteEntry,
  ColorizeResult,
  BreakLegendEntry,
  PaletteConfig,
  Bin,
} from './types';

// Constants
export {
  CLASSIFICATION_METHODS,
  SEQUENTIAL_SCHEMES,
  DIVERGING_SCHEMES,
  QUALITATIVE_SCHEMES,
  DEFAULT_METHOD,
  DEFAULT_NB_CLASSES,
  DEFAULT_PALETTE,
  DEFAULT_MISSING_COLOR,
  DEFAULT_MISSING_TEXT,
} from './constants';

// Classification
export {classify, METHODS} from './classification';

// Palettes
export {ALL_PALETTES, getPaletteByName, getPalettesByType} from './palettes';

// Colorize
export {colorizeChoropleth, breaksToLegend} from './colorize';

// Histogram
export {computeHistogram, getHistogramDomain} from './histogram';

// Color utilities
export {colorToHex, hexToRgb} from './color-utils';

// Format
export {formatNumber} from './format';
