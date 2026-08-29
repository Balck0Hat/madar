import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// SINGLE_FILE=1 inlines JS/CSS into index.html (used for the hosted preview).
export default defineConfig({
  plugins: [react(), ...(process.env.SINGLE_FILE ? [viteSingleFile()] : [])],
  server: {
    // في التطوير: الواجهة على 5173 والـ API على خادم Express (3105)
    proxy: { "/api": { target: process.env.API_URL || "http://127.0.0.1:3105", changeOrigin: false } },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
  },
});
