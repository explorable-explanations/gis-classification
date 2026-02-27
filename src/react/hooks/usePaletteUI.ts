import {useState, useCallback} from 'react';
import type {PaletteConfig, PaletteType} from '../../core/types';

export type UsePaletteUIOptions = {
  initialConfig?: Partial<PaletteConfig>;
};

export function usePaletteUI(options: UsePaletteUIOptions = {}) {
  const [config, setConfigState] = useState<PaletteConfig>({
    type: 'all',
    steps: 5,
    reversed: false,
    ...options.initialConfig,
  });

  const setConfig = useCallback((partial: Partial<PaletteConfig>) => {
    setConfigState((prev) => ({...prev, ...partial}));
  }, []);

  return {
    config,
    setConfig,
  };
}
