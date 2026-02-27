import {defineConfig} from 'tsup';

export default defineConfig([
  {
    entry: {'core/index': 'src/core/index.ts'},
    outDir: 'docs',
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    treeshake: true,
    clean: true,
  },
  {
    entry: {'react/index': 'src/react/index.ts'},
    outDir: 'docs',
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    treeshake: true,
    external: ['react', 'react-dom'],
  },
]);
