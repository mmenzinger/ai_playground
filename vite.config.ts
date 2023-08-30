import { defineConfig, normalizePath } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
// import { VitePWA } from 'vite-plugin-pwa'
import path from 'path';
import { globSync } from 'glob';


const __SCENARIO_DIRECTORY_JSON__ = JSON.stringify(globSync('src/scenario/**/*', {nodir: true}).map(normalizePath));


// https://vitejs.dev/config/
export default defineConfig({
  define:{
    '__SCENARIO_DIRECTORY_JSON__': __SCENARIO_DIRECTORY_JSON__,
  },
  plugins: [
    react(),
    viteStaticCopy({
      // structured: true, // sadly doesnt work at the moment, therefore manual rename
      targets: [
        {
          src: normalizePath(path.resolve(__dirname, './build/**/*')),
          dest: './',
          // remove rename if structured works correctly, used only to keep folder structure
          rename: (name, extension, path) =>{
            const folders = path.match(/\/build\/(.*\/)/);
            let prefix = '';
            if(folders){
              prefix += folders[1];
            }
            if(extension){
              extension = '.' + extension;
            }
            return `${prefix}${name}${extension}`;
          }
        },
        {
          src: normalizePath(path.resolve(__dirname, './src/scenario/**/*')),
          dest: './scenario/',
          // remove rename if structured works correctly, used only to keep folder structure
          rename: (name, extension, path) =>{
            const folders = path.match(/\/scenario\/(.*\/)/);
            let prefix = '';
            if(folders){
              prefix += folders[1];
            }
            if(extension){
              extension = '.' + extension;
            }
            return `${prefix}${name}${extension}`;
          }
        },
        {
          src: normalizePath(path.resolve(__dirname, './src/components/elements/simulator/default.html')),
          dest: './simulator/',
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
  build:{
    rollupOptions:{
      input:{
        index: path.resolve(__dirname, './index.html'),
      },
    },
  },
});
