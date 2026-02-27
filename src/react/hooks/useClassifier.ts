import {useMemo, useState, useCallback} from 'react';
import type {
  ClassificationMethod,
  BreakLegendEntry,
  HexColor,
  Bin,
  PaletteConfig,
} from '../../core/types';
import {DEFAULT_METHOD, DEFAULT_NB_CLASSES, DEFAULT_PALETTE} from '../../core/constants';
import {classify} from '../../core/classification';
import {getPaletteByName} from '../../core/palettes';
import {breaksToLegend} from '../../core/colorize';
import {computeHistogram, getHistogramDomain} from '../../core/histogram';

export type UseClassifierOptions = {
  data: number[];
  method?: ClassificationMethod;
  nClasses?: number;
  palette?: string;
  reversed?: boolean;
  precision?: number;
};

export type UseClassifierResult = {
  breaks: number[];
  colors: HexColor[];
  legend: BreakLegendEntry[];
  histogram: Bin[];
  histogramDomain: {min: number; max: number; mean: number};
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

export function useClassifier(options: UseClassifierOptions): UseClassifierResult {
  const {data, precision} = options;

  const [method, setMethodInternal] = useState<ClassificationMethod>(options.method ?? DEFAULT_METHOD);
  const [nClasses, setNClasses] = useState(options.nClasses ?? DEFAULT_NB_CLASSES);
  const [paletteName, setPalette] = useState(options.palette ?? DEFAULT_PALETTE);
  const [reversed, setReversed] = useState(options.reversed ?? false);
  const [isEditingCustomBreaks, setIsEditingCustomBreaks] = useState(false);
  const [customBreaks, setCustomBreaks] = useState<number[] | null>(null);
  // Store the last non-custom method so we can use its breaks as the starting point for custom
  const [lastAutoMethod, setLastAutoMethod] = useState<ClassificationMethod>(
    (options.method ?? DEFAULT_METHOD) === 'custom' ? DEFAULT_METHOD : (options.method ?? DEFAULT_METHOD)
  );

  // Compute breaks from automatic methods (used as base when switching to custom)
  const autoBreaks = useMemo(() => {
    if (!data || data.length === 0) return [];
    const m = method === 'custom' ? lastAutoMethod : method;
    try {
      return classify(data, {method: m, nb: nClasses, precision}).breaks;
    } catch {
      return [];
    }
  }, [data, method, lastAutoMethod, nClasses, precision]);

  const classResult = useMemo(() => {
    if (!data || data.length === 0) return {breaks: [], innerBreaks: [], nClasses: 0};
    if (method === 'custom' && customBreaks) {
      return {
        breaks: customBreaks,
        innerBreaks: customBreaks.slice(1, -1),
        nClasses: customBreaks.length - 1,
      };
    }
    if (customBreaks) {
      return {
        breaks: customBreaks,
        innerBreaks: customBreaks.slice(1, -1),
        nClasses: customBreaks.length - 1,
      };
    }
    try {
      return classify(data, {method: method === 'custom' ? lastAutoMethod : method, nb: nClasses, precision});
    } catch {
      return {breaks: [], innerBreaks: [], nClasses: 0};
    }
  }, [data, method, lastAutoMethod, nClasses, precision, customBreaks]);

  const colors = useMemo(() => {
    if (classResult.nClasses === 0) return [];
    const entry = getPaletteByName(paletteName);
    const c = entry ? entry.colors(classResult.nClasses) : [];
    return reversed ? [...c].reverse() : c;
  }, [paletteName, classResult.nClasses, reversed]);

  const legend = useMemo(() => {
    return breaksToLegend(classResult.breaks, colors);
  }, [classResult.breaks, colors]);

  const histogram = useMemo(() => {
    if (!data || data.length === 0) return [];
    return computeHistogram(data, 30);
  }, [data]);

  const histogramDomain = useMemo(() => {
    if (!data || data.length === 0) return {min: 0, max: 0, mean: 0};
    return getHistogramDomain(data);
  }, [data]);

  const setMethod = useCallback(
    (newMethod: ClassificationMethod) => {
      if (newMethod === 'custom') {
        // Switching to custom: use current breaks as starting point for editing
        const baseBreaks = classResult.breaks.length > 0 ? [...classResult.breaks] : autoBreaks.length > 0 ? [...autoBreaks] : null;
        setCustomBreaks(baseBreaks);
        setIsEditingCustomBreaks(true);
      } else {
        // Switching away from custom: clear custom state
        setLastAutoMethod(newMethod);
        setCustomBreaks(null);
        setIsEditingCustomBreaks(false);
      }
      setMethodInternal(newMethod);
    },
    [classResult.breaks, autoBreaks]
  );

  const startEditCustomBreaks = useCallback(() => {
    setCustomBreaks(classResult.breaks.length > 0 ? [...classResult.breaks] : null);
    setIsEditingCustomBreaks(true);
  }, [classResult.breaks]);

  const editBreakValue = useCallback(
    (index: number, value: number) => {
      if (!customBreaks) return;
      const newBreaks = [...customBreaks];
      if (index >= 0 && index < newBreaks.length) {
        newBreaks[index] = value;
      }
      newBreaks.sort((a, b) => a - b);
      setCustomBreaks(newBreaks);
    },
    [customBreaks]
  );

  const confirmCustomBreaks = useCallback(() => {
    setIsEditingCustomBreaks(false);
  }, []);

  const cancelCustomBreaks = useCallback(() => {
    if (method === 'custom') {
      // Cancel in custom mode: revert to auto breaks but stay in custom method
      const baseBreaks = autoBreaks.length > 0 ? [...autoBreaks] : null;
      setCustomBreaks(baseBreaks);
      setIsEditingCustomBreaks(false);
    } else {
      setIsEditingCustomBreaks(false);
      setCustomBreaks(null);
    }
  }, [method, autoBreaks]);

  return {
    breaks: classResult.breaks,
    colors,
    legend,
    histogram,
    histogramDomain,
    method,
    nClasses,
    paletteName,
    reversed,
    setMethod,
    setNClasses,
    setPalette,
    setReversed,
    isEditingCustomBreaks,
    startEditCustomBreaks,
    editBreakValue,
    confirmCustomBreaks,
    cancelCustomBreaks,
  };
}
