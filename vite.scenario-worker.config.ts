import { defineConfig } from 'vite';
import { libBuildConfig } from './vite._shared';

export default defineConfig(libBuildConfig(
  'src/components/elements/simulator/scenario-worker.ts',
  'simulator'
));
