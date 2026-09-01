import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // When running `npm run dev` alongside `wrangler pages dev`,
      // API calls are proxied to the Functions runtime on :8788.
      "/api": "http://127.0.0.1:8788",
    },
  },
  build: {
    outDir: "dist",
  },
});
