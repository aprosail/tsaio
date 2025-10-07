import { parseTsconfigAliases } from "@tsaio/dev"
import { defineConfig } from "rolldown"
import { dts } from "rolldown-plugin-dts"

const common = defineConfig({
  resolve: { alias: parseTsconfigAliases() },
  plugins: [dts({ sourcemap: true })],
  external: [/^node:/],
  output: { dir: "out", sourcemap: true, minify: true },
})

export default defineConfig([
  { ...common, input: "src/index.ts" },
  { ...common, input: "src/transform.ts" },
])
