import { defineConfig } from "vitest/config";

// Separate from vite.config.ts: the Workers and React Router plugins are not needed for unit tests.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: { include: ["app/**/*.test.ts"] },
});
