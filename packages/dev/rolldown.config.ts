import { defineConfig } from "rolldown"

export default defineConfig({
  input: "src/index.ts",
  output: { dir: "out", format: "esm" },
})
