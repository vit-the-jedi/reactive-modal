"use strict";

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    minify: false,
    outDir: "./dist",
    rollupOptions: {
      output: {
        assetFileNames: "[ext]/[name][extname]",
        entryFileNames: "js/client.js",
      },
    },
  },
});
