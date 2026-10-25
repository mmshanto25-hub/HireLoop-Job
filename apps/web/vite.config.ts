import { fileURLToPath, URL } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// In development, /api requests are proxied to the API so cookies stay same-origin.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env["API_URL"] ?? "http://localhost:4000";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: false,
        },
      },
    },
    preview: {
      port: 4173,
      proxy: {
        "/api": { target: apiTarget, changeOrigin: false },
      },
    },
    build: {
      target: "es2022",
      sourcemap: true,
      chunkSizeWarningLimit: 600,
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/tests/setup.ts"],
      css: false,
    },
  };
});
