import path from 'path';

// Shared alias configuration for all Vite configs
export const sharedAliases = {
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

// Helper function to resolve path from any config file location
export const resolveAlias = (basePath: string = __dirname) => {
  return Object.fromEntries(
    Object.entries(sharedAliases).map(([key, value]) => [
      key,
      value.replace(__dirname, basePath)
    ])
  );
};
