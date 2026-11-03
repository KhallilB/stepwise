import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: [
      "apps/*/app/**/*.test.ts",
      "packages/**/*.test.ts",
      "apps/desktop/src/**/*.test.ts",
      "apps/desktop/scripts/**/*.test.ts",
      "scripts/review-existing-lab.test.ts",
    ],
    css: true,
  },
});
