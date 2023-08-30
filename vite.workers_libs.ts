import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve:{
    alias:{
      '@src': path.resolve(__dirname, './src'),
      '@store': path.resolve(__dirname, './src/store'),
      '@localdb': path.resolve(__dirname, './src/localdb'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@worker': path.resolve(__dirname, './src/worker'),
      '@modal': path.resolve(__dirname, './src/components/modal'),
      '@elements': path.resolve(__dirname, './src/components/elements'),
      '@pages': path.resolve(__dirname, './src/components/pages'),
    },
  },
  publicDir: false,
  build:{
    emptyOutDir: true,
    outDir: 'build',
    target: 'esnext',
    // minify: false,
  
    rollupOptions:{
      preserveEntrySignatures: 'exports-only',
      external: ['/lib/utils.js'],
      input:{
        'service-worker': path.resolve(__dirname, './src/service-worker.ts'),
        'scenario-worker': path.resolve(__dirname, './src/components/elements/simulator/scenario-worker.ts'),
        'worker-utils': path.resolve(__dirname, './src/components/elements/simulator/worker-utils.ts'),
        'utils': path.resolve(__dirname, './src/lib/utils.ts'),
      },
      output: {
        entryFileNames: (chunk) => {
          let prefix = '';
          if(chunk.facadeModuleId?.includes('src/components/elements/simulator/')){
            prefix = 'simulator/';
          }
          if(chunk.facadeModuleId?.includes('src/lib/')){
            prefix = 'lib/';
          }
          return `${prefix}${chunk.name}.js`;
        },
      },
    },
  },
});
