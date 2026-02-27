import React from 'react';
import type {HexColor} from '../../core/types';

export type PaletteStripProps = {
  colors: HexColor[];
  height?: number;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
};

export const PaletteStrip: React.FC<PaletteStripProps> = ({
  colors,
  height = 10,
  isSelected = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        height: `${height}px`,
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: '2px',
        overflow: 'hidden',
        outline: isSelected ? '2px solid var(--sb-accent, #5b8ef4)' : 'none',
        outlineOffset: '1px',
      }}
    >
      {colors.map((color, i) => (
        <div key={`${color}-${i}`} style={{flex: 1, backgroundColor: color}} />
      ))}
    </div>
  );
};
