import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'demo',
  base: '/gis-classification/',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
});
