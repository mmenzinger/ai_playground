import { defineConfig } from 'vite';
import path from 'path';
import { sharedAliases } from './vite.shared';

export default defineConfig({
  define: {
    global: 'globalThis',
  },
  build: {
    outDir: 'build/lib',
        copyPublicDir: false,
        emptyOutDir: false,
        rollupOptions: {
          input: path.resolve(__dirname, 'src/lib/prolog.js'),
          external: [],
          output: {
            entryFileNames: 'prolog.js',
            format: 'es',
            inlineDynamicImports: true,
          },
        },
  },
  resolve: {
    alias: sharedAliases,
  },
});
