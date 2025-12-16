import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    testTimeout: 10000,
    setupFiles: ['./src/test/setup.ts'],
    env: {
      BASE_URL: 'http://localhost:3000',
    },
  },
});
