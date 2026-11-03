import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

const source = (path: string) => fileURLToPath(new URL(path, import.meta.url));
export default defineConfig({
  html: { cspNonce: "__TAURI_SCRIPT_NONCE__" },
  publicDir: "public",
  resolve: {
    alias: {
      "~/react-lab": source("../interview-lab/app/react-lab"),
      "~/problems": source("../stepwise/app/problems"),
      "~/walkthrough": source("../stepwise/app/walkthrough"),
      "~/views": source("../stepwise/app/views"),
      "~/trace": source("../stepwise/app/trace"),
    },
  },
  server: { port: 5175, strictPort: true, watch: { ignored: ["**/src-tauri/**"] } },
  build: { target: "es2022" },
});
