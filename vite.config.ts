import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

const basePlugins = [
  react(),
  dts({
    include: ['src/lib/**/*', 'src/index.ts'],
    insertTypesEntry: true,
  }),
];

export default defineConfig(({ mode }) => {
  if (mode === 'installer') {
    return {
      base: './',
      plugins: [react()],
      build: {
        outDir: 'dist/installer',
        emptyOutDir: true,
        rollupOptions: {
          input: {
            index: resolve(__dirname, 'index.installer.html'),
          },
        },
      },
    };
  }

  return {
    plugins: basePlugins,
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'SmoothGui',
        formats: ['es'],
        fileName: 'smoothgui',
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react-router-dom'],
      },
      cssCodeSplit: false,
    },
  };
});
