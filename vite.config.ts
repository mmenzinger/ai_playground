import { defineConfig, normalizePath } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
// import { VitePWA } from 'vite-plugin-pwa'
import path from 'path';
import fs from 'fs';
import { globSync } from 'glob';
import { sharedAliases } from './vite.shared';

const __SCENARIO_DIRECTORY_LIST__ = JSON.stringify(globSync('src/scenario/**/*', {nodir: true}).map(normalizePath).sort());

// serve custom files during development
const DEV_FILES = {
  '/simulator/scenario-worker.js': '/src/components/elements/simulator/scenario-worker.ts',
  '/simulator/worker-utils.js': '/src/components/elements/simulator/worker-utils.ts',
  '/lib/utils.js': '/src/lib/utils.ts',
};

// https://vitejs.dev/config/
export default defineConfig({
  define:{
    '__SCENARIO_DIRECTORY_LIST__': __SCENARIO_DIRECTORY_LIST__,
  },
  plugins: [
    react(),
    // Custom plugin to serve utils files during development
    {
      name: 'serve-utils',
      configureServer(server) {
        // Serve custom transformed files
        for (const [path, resolvedPath] of Object.entries(DEV_FILES)) {
          server.middlewares.use(path, async (req, res, next) => {
            try {
              const transformed = await server.transformRequest(resolvedPath);
              res.setHeader('Content-Type', 'application/javascript');
              res.end(transformed?.code || '');
            } catch (error) {
              next(error);
            }
          });
        }
        
        // Serve Monaco Editor files from node_modules
        server.middlewares.use('/node_modules/monaco-editor', async (req, res, next) => {
          try {
            const filePath = path.resolve(__dirname, `./node_modules/monaco-editor${req.url}`);
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              const content = fs.readFileSync(filePath);
              
              // Set proper content type
              if (req.url?.endsWith('.js')) {
                res.setHeader('Content-Type', 'application/javascript');
              } else if (req.url?.endsWith('.css')) {
                res.setHeader('Content-Type', 'text/css');
              }
              res.end(content);
            } else {
              next();
            }
          } catch (error) {
            next(error);
          }
        });
      }
    },
    viteStaticCopy({
      targets: [
        {
          src: [
            normalizePath(path.resolve(__dirname, './build/lib')),
            normalizePath(path.resolve(__dirname, './build/service-worker.js')),
            normalizePath(path.resolve(__dirname, './src/scenario')),
          ],
          dest: './',
        },
        {
          src: normalizePath(path.resolve(__dirname, './src/components/elements/simulator/default.html')),
          dest: './simulator/',
        },
        {
          src: normalizePath(path.resolve(__dirname, './node_modules/monaco-editor/min/vs')),
          dest: './node_modules/monaco-editor/min/',
        },
      ],
    }),
    // VitePWA({
    //   mode: 'development',
    //   base: '/',

    //   strategies: 'injectManifest',
    //   srcDir: 'src',
    //   filename: 'service-worker.ts',
    //   devOptions: {
    //     enabled: true,
    //     type: 'module',
    //   },
    // }),
  ],
  resolve:{
    alias: sharedAliases,
  },
  build:{
    rollupOptions:{
      preserveEntrySignatures: 'exports-only',
      external: ['/lib/utils.js', '/simulator/worker-utils.js'],
      input:{
        index: path.resolve(__dirname, './index.html'),
        'scenario-worker': path.resolve(__dirname, './src/components/elements/simulator/scenario-worker.ts'),
        'worker-utils': path.resolve(__dirname, './src/components/elements/simulator/worker-utils.ts'),
        'utils': path.resolve(__dirname, './src/lib/utils.ts'),
      },
      output: {
        entryFileNames: (chunk) => {
          // Handle utils files with specific paths
          if(chunk.facadeModuleId?.includes('src/components/elements/simulator/')){
            return `simulator/${chunk.name}.js`;
          }
          if(chunk.facadeModuleId?.includes('src/lib/')){
            return `lib/${chunk.name}.js`;
          }
          // Default for main app files
          return `assets/[name]-[hash].js`;
        },
      },
    },
  },
});
