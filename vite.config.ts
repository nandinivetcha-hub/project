import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  // Vercel handles the base path automatically
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Points to your new root structure
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Standard Vercel output directory
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
  }
});
