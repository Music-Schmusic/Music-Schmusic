import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'node-fetch': path.resolve(__dirname, 'empty.js'),
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
