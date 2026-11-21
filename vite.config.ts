import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 15_000,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: [
        'src/domain/**/*.ts',
        'src/services/**/*.ts',
        'src/hooks/**/*.ts',
        'src/components/**/*.tsx',
        'src/App.tsx',
      ],
      exclude: ['src/domain/fixtures.ts'],
      reporter: ['text', 'html'],
    },
  },
});
