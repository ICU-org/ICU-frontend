import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // должен совпадать с paths в tsconfig.app.json
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    // 5174, а не 5173: на 5173 работает фронтенд ContentHub
    port: 5174,
    strictPort: true, // не уходить на соседний порт — иначе он не попадёт в CORS бэкенда
  },
});
