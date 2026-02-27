import React from 'react';

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
};

export const Switch: React.FC<SwitchProps> = ({checked, onChange, label, disabled}) => {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontSize: 'var(--sb-font-size-md, 12px)',
        color: 'var(--sb-text-primary, #a0a7b4)',
      }}
    >
      {label && <span>{label}</span>}
      <span
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) onChange(!checked);
        }}
        style={{
          position: 'relative',
          display: 'inline-block',
          width: '32px',
          height: '18px',
          borderRadius: '9px',
          backgroundColor: checked
            ? 'var(--sb-switch-on, #5b8ef4)'
            : 'var(--sb-switch-off, #6a7485)',
          transition: 'background-color 0.2s',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '2px',
            left: checked ? '16px' : '2px',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: '#fff',
            transition: 'left 0.2s',
          }}
        />
      </span>
    </label>
  );
};
