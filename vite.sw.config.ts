import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { sharedAliases } from './vite.shared';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve:{
    alias: sharedAliases,
  },
  publicDir: false,
  build:{
    outDir: 'build',
    emptyOutDir: false,
    copyPublicDir: false,
    minify: false,
  
    rollupOptions:{
      input:{
        'service-worker': path.resolve(__dirname, './src/service-worker.ts'),
      },
      output: {
        format: 'iife',
        entryFileNames: (chunk) => {
          return `${chunk.name}.js`;
        },
      },
    },
  },
});
