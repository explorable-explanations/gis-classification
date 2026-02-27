import type {ClassificationMethod} from './types';

export const CLASSIFICATION_METHODS: Record<ClassificationMethod, string> = {
  quantile: '等量分類 (Quantile)',
  equal: '等間隔分類 (Equal Interval)',
  jenks: '自然分類 (Jenks)',
  msd: '標準偏差 (Mean-Std Dev)',
  geometric: '幾何学的分類 (Geometric)',
  headtail: 'ヘッドテール分類 (Head/Tail)',
  pretty: 'きりのよい分類 (Pretty)',
  arithmetic: '等差分類 (Arithmetic)',
  nestedmeans: '入れ子平均 (Nested Means)',
  q6: 'Q6分類 (Q6)',
  custom: 'カスタム (Custom)',
};

export const SEQUENTIAL_SCHEMES = [
  'Blues', 'Greens', 'Greys', 'Oranges', 'Purples', 'Reds',
  'BuGn', 'BuPu', 'GnBu', 'OrRd', 'PuBu', 'PuBuGn',
  'PuRd', 'RdPu', 'YlGn', 'YlGnBu', 'YlOrBr', 'YlOrRd',
];

export const DIVERGING_SCHEMES = [
  'BrBG', 'PiYG', 'PRGn', 'PuOr', 'RdBu', 'RdGy',
  'RdYlBu', 'RdYlGn', 'Spectral',
];

export const QUALITATIVE_SCHEMES = [
  'Accent', 'Dark2', 'Paired', 'Pastel1', 'Pastel2',
  'Set1', 'Set2', 'Set3', 'Tableau10',
];

export const DEFAULT_METHOD: ClassificationMethod = 'quantile';
export const DEFAULT_NB_CLASSES = 5;
export const DEFAULT_PALETTE = 'Blues';
export const DEFAULT_MISSING_COLOR = '#f5f5f5';
export const DEFAULT_MISSING_TEXT = 'No data';
