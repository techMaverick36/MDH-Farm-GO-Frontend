import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// This repo is standalone (separated from the API monorepo), so @mdh/shared is
// VENDORED: the built dist of the monorepo's packages/shared is copied into
// vendor/mdh-shared. When the API's shared package changes, run
// `npm run sync-shared` (needs the API monorepo checked out next to this repo)
// to refresh the copy.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@mdh/shared": fileURLToPath(
        new URL("./vendor/mdh-shared/index.js", import.meta.url),
      ),
    },
  },
  server: {
    port: 5173,
  },
});
