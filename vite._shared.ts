import path from 'path';
import { UserConfig } from 'vite';

// Shared alias configuration for all Vite configs
export const SHARED_ALIASES = {
  '@src': path.resolve(__dirname, './src'),
  '@store': path.resolve(__dirname, './src/store'),
  '@localdb': path.resolve(__dirname, './src/localdb'),
  '@utils': path.resolve(__dirname, './src/utils'),
  '@worker': path.resolve(__dirname, './src/worker'),
  '@modal': path.resolve(__dirname, './src/components/modal'),
  '@elements': path.resolve(__dirname, './src/components/elements'),
  '@pages': path.resolve(__dirname, './src/components/pages'),
  '@lib': path.resolve(__dirname, './src/lib'),
  '/lib/utils.js': path.resolve(__dirname, './src/lib/utils.ts'),
};

export const EXTERNAL = [
  '/lib/utils.js',
  '/simulator/worker-utils.js',
  '/simulator/scenario-worker.js',
  'service-worker.js',
];

// Helper function to resolve path from any config file location
export const resolveAlias = (basePath: string = __dirname) => {
  return Object.fromEntries(
    Object.entries(SHARED_ALIASES).map(([key, value]) => [
      key,
      value.replace(__dirname, basePath)
    ])
  );
};



export const libBuildConfig = (filePath, outDir = ''): UserConfig => {
  return {
     define: {
      global: 'globalThis',
    },
    build: {
      outDir: `build/${outDir}`,
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
        input: path.resolve(__dirname, filePath),
        external: EXTERNAL,
        preserveEntrySignatures: 'exports-only',
        output: {
          entryFileNames: '[name].js',
          format: 'es',
          inlineDynamicImports: true,
        },
      },
    },
    resolve: {
      alias: SHARED_ALIASES,
    },
  }
}
