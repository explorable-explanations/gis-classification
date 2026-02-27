import React, {useMemo, useCallback} from 'react';
import type {ClassificationMethod, Bin, BreakLegendEntry, HexColor} from '../../core/types';
import {CLASSIFICATION_METHODS} from '../../core/constants';
import {Dropdown} from './shared/Dropdown';
import {HistogramChart} from './HistogramChart';

type MethodOption = {
  label: string;
  value: ClassificationMethod;
};

const METHOD_OPTIONS: MethodOption[] = Object.entries(CLASSIFICATION_METHODS).map(
  ([value, label]) => ({label, value: value as ClassificationMethod})
);

export type MethodSelectorProps = {
  method: ClassificationMethod;
  bins?: Bin[];
  breaks?: number[];
  legend?: BreakLegendEntry[];
  colors?: HexColor[];
  histogramDomain?: {min: number; max: number; mean?: number};
  onSelectMethod: (method: ClassificationMethod) => void;
  disabled?: boolean;
};

export const MethodSelector: React.FC<MethodSelectorProps> = ({
  method,
  bins,
  breaks,
  legend,
  colors,
  histogramDomain,
  onSelectMethod,
  disabled,
}) => {
  const selectedOption = useMemo(
    () => METHOD_OPTIONS.find((o) => o.value === method) || METHOD_OPTIONS[0],
    [method]
  );

  const handleSelect = useCallback(
    (option: MethodOption) => {
      onSelectMethod(option.value);
    },
    [onSelectMethod]
  );

  return (
    <div style={{fontFamily: 'var(--sb-font-family)'}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          fontSize: 'var(--sb-font-size-sm, 11px)',
          color: 'var(--sb-text-primary, #a0a7b4)',
        }}
      >
        <span>Method</span>
        <div style={{width: '80%'}}>
          <Dropdown
            options={METHOD_OPTIONS}
            value={selectedOption}
            onChange={handleSelect}
            getLabel={(o) => o.label}
            getValue={(o) => o.value}
            disabled={disabled}
          />
        </div>
      </div>

      {bins && bins.length > 0 && (
        <HistogramChart
          bins={bins}
          legend={legend}
          colors={colors}
          breaks={breaks}
          domain={histogramDomain}
        />
      )}
    </div>
  );
};
