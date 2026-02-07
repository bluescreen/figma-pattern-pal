import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'es2015',
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/code.ts'),
      formats: ['iife'],
      name: 'PatternPal',
      fileName: () => 'code.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    emptyOutDir: true,
  },
});
