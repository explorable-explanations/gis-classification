import React from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

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

type UseClassifierOptions = {
    data: number[];
    method?: ClassificationMethod;
    nClasses?: number;
    palette?: string;
    reversed?: boolean;
    precision?: number;
};
type UseClassifierResult = {
    breaks: number[];
    colors: HexColor[];
    legend: BreakLegendEntry[];
    histogram: Bin[];
    histogramDomain: {
        min: number;
        max: number;
        mean: number;
    };
    method: ClassificationMethod;
    nClasses: number;
    paletteName: string;
    reversed: boolean;
    setMethod: (method: ClassificationMethod) => void;
    setNClasses: (n: number) => void;
    setPalette: (name: string) => void;
    setReversed: (reversed: boolean) => void;
    isEditingCustomBreaks: boolean;
    startEditCustomBreaks: () => void;
    editBreakValue: (index: number, value: number) => void;
    confirmCustomBreaks: () => void;
    cancelCustomBreaks: () => void;
};
declare function useClassifier(options: UseClassifierOptions): UseClassifierResult;

type UsePaletteUIOptions = {
    initialConfig?: Partial<PaletteConfig>;
};
declare function usePaletteUI(options?: UsePaletteUIOptions): {
    config: PaletteConfig;
    setConfig: (partial: Partial<PaletteConfig>) => void;
};

type ClassifierPanelProps = {
    data: number[];
    initialMethod?: ClassificationMethod;
    initialNClasses?: number;
    initialPalette?: string;
    theme?: 'light' | 'dark';
    onChange?: (result: {
        method: ClassificationMethod;
        nClasses: number;
        breaks: number[];
        colors: HexColor[];
        legend: BreakLegendEntry[];
    }) => void;
    className?: string;
    style?: React.CSSProperties;
};
declare const ClassifierPanel: React.FC<ClassifierPanelProps>;

type MethodSelectorProps = {
    method: ClassificationMethod;
    bins?: Bin[];
    breaks?: number[];
    legend?: BreakLegendEntry[];
    colors?: HexColor[];
    histogramDomain?: {
        min: number;
        max: number;
        mean?: number;
    };
    onSelectMethod: (method: ClassificationMethod) => void;
    disabled?: boolean;
};
declare const MethodSelector: React.FC<MethodSelectorProps>;

type PaletteSelectorProps = {
    selectedPalette: string;
    config: PaletteConfig;
    onSelectPalette: (name: string) => void;
    onConfigChange: (config: Partial<PaletteConfig>) => void;
};
declare const PaletteSelector: React.FC<PaletteSelectorProps>;

type BreaksLegendProps = {
    legend: BreakLegendEntry[];
    isEditing?: boolean;
    onEdit?: () => void;
    onEditValue?: (index: number, value: number) => void;
    onConfirm?: () => void;
    onCancel?: () => void;
};
declare const BreaksLegend: React.FC<BreaksLegendProps>;

type HistogramChartProps = {
    bins: Bin[];
    legend?: BreakLegendEntry[];
    colors?: HexColor[];
    breaks?: number[];
    width?: number;
    height?: number;
    domain?: {
        min: number;
        max: number;
        mean?: number;
    };
};
declare const HistogramChart: React.FC<HistogramChartProps>;

type PaletteStripProps = {
    colors: HexColor[];
    height?: number;
    isSelected?: boolean;
    onClick?: (e: React.MouseEvent) => void;
};
declare const PaletteStrip: React.FC<PaletteStripProps>;

type DropdownProps<T> = {
    options: T[];
    value: T;
    onChange: (value: T) => void;
    getLabel?: (option: T) => string;
    getValue?: (option: T) => string;
    disabled?: boolean;
    placeholder?: string;
};
declare function Dropdown<T>({ options, value, onChange, getLabel, getValue, disabled, placeholder, }: DropdownProps<T>): react_jsx_runtime.JSX.Element;

type SwitchProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
};
declare const Switch: React.FC<SwitchProps>;

export { ALL_PALETTES, type Bin, type BreakLegendEntry, BreaksLegend, type BreaksLegendProps, CLASSIFICATION_METHODS, type ClassificationMethod, type ClassificationOptions, type ClassificationResult, ClassifierPanel, type ClassifierPanelProps, type ColorizeResult, DEFAULT_METHOD, DEFAULT_MISSING_COLOR, DEFAULT_MISSING_TEXT, DEFAULT_NB_CLASSES, DEFAULT_PALETTE, DIVERGING_SCHEMES, Dropdown, type HexColor, HistogramChart, type HistogramChartProps, METHODS, MethodSelector, type MethodSelectorProps, type PaletteConfig, type PaletteEntry, PaletteSelector, type PaletteSelectorProps, PaletteStrip, type PaletteStripProps, type PaletteType, QUALITATIVE_SCHEMES, SEQUENTIAL_SCHEMES, Switch, type UseClassifierOptions, type UseClassifierResult, type UsePaletteUIOptions, breaksToLegend, classify, colorToHex, colorizeChoropleth, computeHistogram, formatNumber, getHistogramDomain, getPaletteByName, getPalettesByType, hexToRgb, useClassifier, usePaletteUI };
