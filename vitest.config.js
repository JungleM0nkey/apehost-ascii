import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js',
        'dist/',
        '.wrangler/'
      ],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    },
    include: ['tests/**/*.test.js'],
    exclude: ['node_modules', 'dist', '.wrangler'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './public/js'),
      '@generators': path.resolve(__dirname, './public/js/generators'),
      '@utils': path.resolve(__dirname, './public/js/utils'),
      '@config': path.resolve(__dirname, './public/js/config.js'),
    }
  }
});
