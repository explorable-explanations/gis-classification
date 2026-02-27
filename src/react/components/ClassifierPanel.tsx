import React, {useCallback, useEffect} from 'react';
import type {ClassificationMethod, BreakLegendEntry, HexColor, PaletteConfig} from '../../core/types';
import {useClassifier} from '../hooks/useClassifier';
import {usePaletteUI} from '../hooks/usePaletteUI';
import {MethodSelector} from './MethodSelector';
import {PaletteSelector} from './PaletteSelector';
import {BreaksLegend} from './BreaksLegend';

export type ClassifierPanelProps = {
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

export const ClassifierPanel: React.FC<ClassifierPanelProps> = ({
  data,
  initialMethod = 'quantile',
  initialNClasses = 5,
  initialPalette = 'Blues',
  theme = 'dark',
  onChange,
  className,
  style,
}) => {
  const {
    breaks,
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
  } = useClassifier({
    data,
    method: initialMethod,
    nClasses: initialNClasses,
    palette: initialPalette,
  });

  const {config, setConfig} = usePaletteUI({
    initialConfig: {steps: initialNClasses},
  });

  useEffect(() => {
    onChange?.({method, nClasses, breaks, colors, legend});
  }, [method, nClasses, breaks, colors, legend, onChange]);

  const handleConfigChange = useCallback(
    (partial: Partial<PaletteConfig>) => {
      setConfig(partial);
      if (partial.steps !== undefined) setNClasses(partial.steps);
      if (partial.reversed !== undefined) setReversed(partial.reversed);
    },
    [setConfig, setNClasses, setReversed]
  );

  const handleSelectPalette = useCallback(
    (name: string) => {
      setPalette(name);
    },
    [setPalette]
  );

  const sectionStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderBottom: '1px solid var(--sb-border, #3a4552)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 'var(--sb-font-size-sm, 11px)',
    color: 'var(--sb-text-secondary, #6a7485)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
  };

  return (
    <div
      className={className}
      data-theme={theme}
      style={{
        backgroundColor: 'var(--sb-bg-primary, #29323c)',
        borderRadius: 'var(--sb-radius, 4px)',
        border: '1px solid var(--sb-border, #3a4552)',
        overflow: 'hidden',
        fontFamily: 'var(--sb-font-family)',
        ...style,
      }}
    >
      <div style={sectionStyle}>
        <div style={labelStyle}>Classification</div>
        <MethodSelector
          method={method}
          bins={histogram}
          breaks={breaks}
          legend={legend}
          colors={colors}
          histogramDomain={histogramDomain}
          onSelectMethod={setMethod}
        />
      </div>

      <div style={sectionStyle}>
        <div style={labelStyle}>Color Palette</div>
        <PaletteSelector
          selectedPalette={paletteName}
          config={config}
          onSelectPalette={handleSelectPalette}
          onConfigChange={handleConfigChange}
        />
      </div>

      {legend.length > 0 && (
        <div style={{padding: '8px 0'}}>
          <div style={{...labelStyle, padding: '0 12px'}}>Legend</div>
          <BreaksLegend
            legend={legend}
            isEditing={isEditingCustomBreaks}
            onEdit={method === 'custom' ? startEditCustomBreaks : undefined}
            onEditValue={method === 'custom' ? editBreakValue : undefined}
            onConfirm={method === 'custom' ? confirmCustomBreaks : undefined}
            onCancel={method === 'custom' ? cancelCustomBreaks : undefined}
          />
        </div>
      )}
    </div>
  );
};
