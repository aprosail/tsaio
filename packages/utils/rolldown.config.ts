import { parseTsconfigAliases } from "@tsaio/dev"
import { defineConfig } from "rolldown"
import { dts } from "rolldown-plugin-dts"

export default defineConfig({
  resolve: { alias: parseTsconfigAliases() },
  plugins: [dts({ sourcemap: true })],
  external: [/^node:/],
  input: "src/index.ts",
  output: { dir: "out", sourcemap: true, minify: true },
})
