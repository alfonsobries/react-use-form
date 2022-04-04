/// <reference types="vitest" />
/// <reference types="vite/client" />

import typescript from '@rollup/plugin-typescript';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    minify: false,
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      name: '@alfonsobries/react-use-form',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'axios'],
      output: {
        globals: {
          axios: 'axios',
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
      plugins: [
        typescript({
          exclude: ['node_modules'],
        }),
      ],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
