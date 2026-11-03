import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "e2e",
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  use: { baseURL: "http://localhost:5185", trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "bun run build && bunx vite preview --host localhost --port 5185 --strictPort",
    url: "http://localhost:5185",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
