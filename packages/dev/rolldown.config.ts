import { join } from "node:path"
import { defineConfig } from "rolldown"
import { dts } from "rolldown-plugin-dts"

export default defineConfig({
  // Cannot apply aliases when loading config, so cannot use for itself.
  resolve: { alias: { "@": join(import.meta.dirname, "src") } },
  plugins: [dts({ sourcemap: true })],
  external: [/^node:/, "fs"],
  input: "src/index.ts",
  output: { dir: "out", sourcemap: true, minify: true },
})
