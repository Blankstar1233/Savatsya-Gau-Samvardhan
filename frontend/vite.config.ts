import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist", // Output directory for production build
    emptyOutDir: true, // Clean output directory before build
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
});
