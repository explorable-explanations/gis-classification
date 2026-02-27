import React, {useState, useRef, useEffect} from 'react';

type DropdownProps<T> = {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  getLabel?: (option: T) => string;
  getValue?: (option: T) => string;
  disabled?: boolean;
  placeholder?: string;
};

export function Dropdown<T>({
  options,
  value,
  onChange,
  getLabel = (o: T) => String(o),
  getValue = (o: T) => String(o),
  disabled,
  placeholder,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{position: 'relative', width: '100%', minWidth: '80px'}}>
      <button
        type="button"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '4px 8px',
          border: '1px solid var(--sb-border, #3a4552)',
          borderRadius: 'var(--sb-radius, 4px)',
          backgroundColor: 'var(--sb-input-bg, #29323c)',
          color: 'var(--sb-text-primary, #a0a7b4)',
          fontSize: 'var(--sb-font-size-sm, 11px)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span>{value ? getLabel(value) : placeholder || 'Select...'}</span>
        <span style={{marginLeft: '4px'}}>&#9662;</span>
      </button>
      {isOpen && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 100,
            maxHeight: '200px',
            overflowY: 'auto',
            backgroundColor: 'var(--sb-dropdown-bg, #3a4552)',
            border: '1px solid var(--sb-border, #3a4552)',
            borderRadius: 'var(--sb-radius, 4px)',
            boxShadow: 'var(--sb-dropdown-shadow, 0 4px 12px rgba(0,0,0,0.3))',
            margin: '2px 0 0 0',
            padding: 0,
            listStyle: 'none',
          }}
        >
          {options.map((option) => (
            <li
              key={getValue(option)}
              style={{
                padding: '6px 8px',
                cursor: 'pointer',
                fontSize: 'var(--sb-font-size-sm, 11px)',
                color: 'var(--sb-text-primary, #a0a7b4)',
                backgroundColor:
                  getValue(option) === getValue(value) ? 'var(--sb-bg-hover, #4a5668)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'var(--sb-bg-hover, #4a5668)';
              }}
              onMouseLeave={(e) => {
                if (getValue(option) !== getValue(value)) {
                  (e.target as HTMLElement).style.backgroundColor = 'transparent';
                }
              }}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {getLabel(option)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
