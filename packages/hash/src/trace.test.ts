import { existsSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, test } from "vitest"
import { detectPackageRoot, tracePosition } from "./trace"

describe("tracePosition", () => {
  describe("basic functionality", () => {
    test("default depth", () => {
      const pos = tracePosition()

      expect(pos).toHaveProperty("url")
      expect(pos).toHaveProperty("line")
      expect(pos).toHaveProperty("column")
      expect(typeof pos.url).toBe("string")
      expect(typeof pos.line).toBe("number")
      expect(typeof pos.column).toBe("number")
      expect(pos.line).toBeGreaterThan(0)
      expect(pos.column).toBeGreaterThan(0)
    })

    test("depth 0", () => {
      const pos = tracePosition(0)

      expect(pos).toHaveProperty("url")
      expect(pos).toHaveProperty("line")
      expect(pos).toHaveProperty("column")
      expect(pos.line).toBeGreaterThan(0)
    })

    test("depth 1", () => {
      function caller() {
        return tracePosition(1)
      }

      const pos = caller()

      expect(pos).toHaveProperty("url")
      expect(pos).toHaveProperty("line")
      expect(pos).toHaveProperty("column")
    })
  })

  describe("error handling", () => {
    test("out of bounds depth", () => {
      expect(() => tracePosition(100)).toThrow("stack depth(100) out of bounds")
    })
  })

  describe("stack trace formats", () => {
    test("parses various stack trace formats", () => {
      const pos = tracePosition(0)

      expect(pos).toHaveProperty("url")
      expect(pos).toHaveProperty("line")
      expect(pos).toHaveProperty("column")
      expect(typeof pos.url).toBe("string")
      expect(typeof pos.line).toBe("number")
      expect(typeof pos.column).toBe("number")
    })
  })
})

describe("detectPackageRoot", () => {
  describe("successful detection", () => {
    test("from current directory", () => {
      const root = detectPackageRoot()
      expect(root).toBeDefined()
      expect(typeof root).toBe("string")

      // Should find a package.json in the detected root
      const packageJsonPath = join(root!, "package.json")
      expect(existsSync(packageJsonPath)).toBe(true)
    })

    test("from specific directory", () => {
      const root = detectPackageRoot(__dirname)
      expect(root).toBeDefined()
      expect(typeof root).toBe("string")

      // Should find a package.json in the detected root
      const packageJsonPath = join(root!, "package.json")
      expect(existsSync(packageJsonPath)).toBe(true)
    })

    test("from file path", () => {
      const root = detectPackageRoot(__filename)
      expect(root).toBeDefined()
      expect(typeof root).toBe("string")

      // Should find a package.json in the detected root
      const packageJsonPath = join(root!, "package.json")
      expect(existsSync(packageJsonPath)).toBe(true)
    })
  })

  describe("error cases", () => {
    test("non-existent path returns undefined", () => {
      const root = detectPackageRoot("/non/existent/path")
      expect(root).toBeUndefined()
    })
  })
})
