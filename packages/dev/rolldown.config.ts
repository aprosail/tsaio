import { join } from "node:path"
import { defineConfig } from "rolldown"
import { dts } from "rolldown-plugin-dts"
// import { parseTsconfigAliases } from "./src/alias"

const root = import.meta.dirname

export default defineConfig({
  // resolve: { alias: parseTsconfigAliases() },
  plugins: [dts({ sourcemap: true })],
  resolve: { alias: { "@": join(root, "src") } },
  external(id) {
    if (id.startsWith("node:")) return true
    return false
  },
  input: "src/index.ts",
  output: { dir: "out", format: "esm", sourcemap: true, minify: true },
})
