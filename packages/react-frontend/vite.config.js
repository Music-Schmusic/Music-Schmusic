import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'node-fetch': path.resolve(__dirname, 'empty.js'), // we'll create this file
      'fetch-blob/from.js': path.resolve(__dirname, 'empty.js'),
      'node:fs': false,
      fs: false,
      'node:path': false,
      path: false,
    },
  },
  optimizeDeps: {
    exclude: ['node-fetch', 'fetch-blob/from.js'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: true,
    deps: {
      inline: [
        '@testing-library/jest-dom',
        '@testing-library/react',
        '@testing-library/user-event',
      ],
    },
  },
});
