import React, {useState, useCallback, useRef, useEffect} from 'react';
import type {BreakLegendEntry} from '../../core/types';

export type BreaksLegendProps = {
  legend: BreakLegendEntry[];
  isEditing?: boolean;
  onEdit?: () => void;
  onEditValue?: (index: number, value: number) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
};

const SwatchStyle: React.CSSProperties = {
  width: '16px',
  height: '16px',
  borderRadius: '2px',
  marginRight: '8px',
  flexShrink: 0,
};

const RowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '3px 0',
  fontSize: 'var(--sb-font-size-sm, 11px)',
  color: 'var(--sb-text-primary, #a0a7b4)',
};

const ThresholdInput: React.FC<{
  value: number | null;
  placeholder?: string;
  disabled?: boolean;
  onChange: (val: number) => void;
}> = ({value, placeholder, disabled, onChange}) => {
  const [localValue, setLocalValue] = useState(
    value !== null && Number.isFinite(value) ? String(value) : ''
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value !== null && Number.isFinite(value) ? String(value) : '');
  }, [value]);

  const applyValue = useCallback(() => {
    const parsed = parseFloat(localValue);
    if (!isNaN(parsed) && Number.isFinite(parsed)) {
      onChange(parsed);
    }
  }, [localValue, onChange]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        applyValue();
        inputRef.current?.blur();
      }
    },
    [applyValue]
  );

  if (disabled) {
    return (
      <span
        style={{
          display: 'inline-block',
          width: '60px',
          textAlign: 'right',
          color: 'var(--sb-text-secondary, #6a7485)',
          fontSize: 'var(--sb-font-size-sm, 11px)',
        }}
      >
        {placeholder || ''}
      </span>
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={applyValue}
      onKeyDown={onKeyDown}
      style={{
        width: '60px',
        background: 'var(--sb-bg-secondary, #3a4552)',
        color: 'var(--sb-text-primary, #a0a7b4)',
        border: '1px solid var(--sb-border, #4a5668)',
        borderRadius: '3px',
        padding: '2px 4px',
        fontSize: 'var(--sb-font-size-sm, 11px)',
        textAlign: 'right',
        outline: 'none',
      }}
    />
  );
};

export const BreaksLegend: React.FC<BreaksLegendProps> = ({
  legend,
  isEditing,
  onEdit,
  onEditValue,
  onConfirm,
  onCancel,
}) => {
  if (!legend || legend.length === 0) return null;

  if (!isEditing) {
    return (
      <div style={{padding: '8px 12px 0 12px'}}>
        {onEdit && (
          <button
            onClick={onEdit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              color: 'var(--sb-accent, #5b8ef4)',
              cursor: 'pointer',
              fontSize: 'var(--sb-font-size-sm, 11px)',
              padding: '2px 0',
              marginBottom: '4px',
            }}
          >
            Edit
          </button>
        )}
        {legend.map((item, index) => (
          <div key={index} style={RowStyle}>
            <div style={{...SwatchStyle, backgroundColor: item.color}} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{padding: '8px 12px 0 12px'}}>
      {legend.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === legend.length - 1;
        return (
          <div key={index} style={{...RowStyle, gap: '4px'}}>
            <div style={{...SwatchStyle, backgroundColor: item.color}} />
            <ThresholdInput
              value={item.range[0]}
              placeholder={isFirst ? 'Less' : undefined}
              disabled={isFirst}
              onChange={(val) => onEditValue?.(index, val)}
            />
            <span style={{color: 'var(--sb-text-secondary, #6a7485)', padding: '0 2px'}}>
              &mdash;
            </span>
            <ThresholdInput
              value={item.range[1]}
              placeholder={isLast ? 'More' : undefined}
              disabled={isLast}
              onChange={(val) => onEditValue?.(index, val)}
            />
          </div>
        );
      })}

      <div
        style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end',
          padding: '8px 0 4px',
          borderTop: '1px solid var(--sb-border, #3a4552)',
          marginTop: '6px',
        }}
      >
        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--sb-text-secondary, #6a7485)',
            cursor: 'pointer',
            fontSize: 'var(--sb-font-size-sm, 11px)',
            padding: '4px 8px',
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{
            background: 'var(--sb-accent, #5b8ef4)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 'var(--sb-font-size-sm, 11px)',
            padding: '4px 12px',
            borderRadius: '3px',
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};
