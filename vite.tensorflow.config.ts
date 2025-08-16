import { defineConfig } from 'vite';
import path from 'path';
import { sharedAliases } from './vite.shared';

export default defineConfig({
  build: {
    outDir: 'build/lib',
    copyPublicDir: false,
    emptyOutDir: false,
    minify: 'terser',
    terserOptions: {
      format: {
        comments: false,
      },
      compress: {
        drop_console: false,
      },
    },
    rollupOptions: {
      input: path.resolve(__dirname, 'src/lib/tensorflow.ts'),
      external: [],
      output: {
        entryFileNames: 'tensorflow.js',
        format: 'es',
        inlineDynamicImports: true,
      },
    },
  },
  resolve: {
    alias: sharedAliases,
  },
});
