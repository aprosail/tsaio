/// <reference types="vitest/config" />

import react from "@vitejs/plugin-react"
import { join } from "node:path"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

const root = import.meta.dirname

export default defineConfig({
  plugins: [
    react({ babel: { plugins: [["babel-plugin-react-compiler"]] } }),
    tsconfigPaths(),
  ],
  build: {
    emptyOutDir: true,
    outDir: join(root, "out"),
  },
  test: { include: ["src/**/*.test.ts"] },
})
