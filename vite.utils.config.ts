import { defineConfig } from 'vite';
import { libBuildConfig } from './vite._shared';

export default defineConfig(libBuildConfig(
  'src/lib/utils.js',
  'lib'
));
