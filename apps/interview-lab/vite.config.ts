import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import { reactLabPlaywright } from "./dev/react-lab-playwright.ts";

export default defineConfig({
  plugins: [reactLabPlaywright(), cloudflare({ viteEnvironment: { name: "ssr" } }), reactRouter()],
  resolve: { tsconfigPaths: true },
  // Nested checkouts must not reload this app.
  server: { watch: { ignored: ["**/.claude/worktrees/**"] } },
});
