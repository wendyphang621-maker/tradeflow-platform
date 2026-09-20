import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  root: "github-pages",
  base: "/tradeflow-platform/",
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname) } },
  build: {
    outDir: path.resolve(__dirname, "docs"),
    emptyOutDir: true,
  },
});
