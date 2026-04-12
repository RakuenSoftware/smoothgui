import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/lib/**/*', 'src/index.ts'],
      insertTypesEntry: true,
    }),
  ],
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
});
