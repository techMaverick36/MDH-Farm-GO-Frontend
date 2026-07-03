import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// @mdh/shared ships TypeScript source whose internal imports use `.js`
// specifiers (NodeNext style). Vite/esbuild won't rewrite those to `.ts`, so we
// point the alias at the built `dist` output instead. The package is rebuilt
// before dev/build (see the package.json pre-scripts).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@mdh/shared": fileURLToPath(
        new URL("../../packages/shared/dist/index.js", import.meta.url),
      ),
    },
  },
  server: {
    port: 5173,
  },
});
