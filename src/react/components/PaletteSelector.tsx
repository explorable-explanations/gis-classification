import React, {useMemo, useCallback} from 'react';
import {range} from 'd3-array';
import type {PaletteType, PaletteConfig, PaletteEntry} from '../../core/types';
import {ALL_PALETTES, getPalettesByType} from '../../core/palettes';
import {PaletteStrip} from './PaletteStrip';
import {Dropdown} from './shared/Dropdown';
import {Switch} from './shared/Switch';

const TYPE_OPTIONS = ['all', 'sequential', 'diverging', 'qualitative'] as const;
const STEP_OPTIONS = range(3, 10);

export type PaletteSelectorProps = {
  selectedPalette: string;
  config: PaletteConfig;
  onSelectPalette: (name: string) => void;
  onConfigChange: (config: Partial<PaletteConfig>) => void;
};

export const PaletteSelector: React.FC<PaletteSelectorProps> = ({
  selectedPalette,
  config,
  onSelectPalette,
  onConfigChange,
}) => {
  const {type, steps, reversed} = config;

  const filteredPalettes = useMemo(() => {
    return getPalettesByType(type).filter((p) => p.maxClasses >= steps);
  }, [type, steps]);

  const configRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    fontSize: 'var(--sb-font-size-sm, 11px)',
    color: 'var(--sb-text-primary, #a0a7b4)',
  };

  return (
    <div style={{fontFamily: 'var(--sb-font-family)', color: 'var(--sb-text-primary, #a0a7b4)'}}>
      <div style={{padding: '12px 12px 0 12px'}}>
        <div style={configRowStyle}>
          <span>Type</span>
          <div style={{width: '40%'}}>
            <Dropdown
              options={[...TYPE_OPTIONS]}
              value={type}
              onChange={(val) => onConfigChange({type: val as PaletteType | 'all'})}
              getLabel={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
              getValue={(v) => v}
            />
          </div>
        </div>

        <div style={configRowStyle}>
          <span>Steps</span>
          <div style={{width: '40%'}}>
            <Dropdown
              options={STEP_OPTIONS}
              value={steps}
              onChange={(val) => onConfigChange({steps: val})}
              getLabel={(v) => String(v)}
              getValue={(v) => String(v)}
            />
          </div>
        </div>

        <div style={configRowStyle}>
          <span>Reversed</span>
          <div style={{width: '40%'}}>
            <Switch checked={reversed} onChange={(val) => onConfigChange({reversed: val})} />
          </div>
        </div>
      </div>

      <div style={{maxHeight: '200px', overflowY: 'auto', padding: '0 8px 8px 8px'}}>
        {filteredPalettes.map((palette) => {
          const paletteColors = reversed
            ? [...palette.colors(steps)].reverse()
            : palette.colors(steps);
          const isSelected = palette.name === selectedPalette;
          return (
            <div
              key={palette.name}
              style={{padding: '4px 0', cursor: 'pointer'}}
              title={palette.name}
            >
              <PaletteStrip
                colors={paletteColors}
                height={12}
                isSelected={isSelected}
                onClick={() => onSelectPalette(palette.name)}
              />
            </div>
          );
        })}
        {filteredPalettes.length === 0 && (
          <div
            style={{
              padding: '12px',
              textAlign: 'center',
              fontSize: '11px',
              color: 'var(--sb-text-secondary)',
            }}
          >
            No matching palettes found
          </div>
        )}
      </div>
    </div>
  );
};
