// Re-export core
export * from '../core/index';

// Hooks
export {useClassifier} from './hooks/useClassifier';
export type {UseClassifierOptions, UseClassifierResult} from './hooks/useClassifier';
export {usePaletteUI} from './hooks/usePaletteUI';
export type {UsePaletteUIOptions} from './hooks/usePaletteUI';

// Components
export {ClassifierPanel} from './components/ClassifierPanel';
export type {ClassifierPanelProps} from './components/ClassifierPanel';
export {MethodSelector} from './components/MethodSelector';
export type {MethodSelectorProps} from './components/MethodSelector';
export {PaletteSelector} from './components/PaletteSelector';
export type {PaletteSelectorProps} from './components/PaletteSelector';
export {BreaksLegend} from './components/BreaksLegend';
export type {BreaksLegendProps} from './components/BreaksLegend';
export {HistogramChart} from './components/HistogramChart';
export type {HistogramChartProps} from './components/HistogramChart';
export {PaletteStrip} from './components/PaletteStrip';
export type {PaletteStripProps} from './components/PaletteStrip';
export {Dropdown} from './components/shared/Dropdown';
export {Switch} from './components/shared/Switch';
