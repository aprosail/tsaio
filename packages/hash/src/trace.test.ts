import { detectPackageRoot, tracePosition } from "@/trace"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, test } from "vitest"

describe("tracePosition", () => {
  test("returns valid position with default depth", () => {
    const pos = tracePosition()
    expect(pos.url).toMatch(/^(file:\/\/\/|file:\/\/|\/)/)
    expect(Number.isInteger(pos.line)).toBe(true)
    expect(Number.isInteger(pos.column)).toBe(true)
  })

  test("returns different positions for different depths", () => {
    function level1() {
      return tracePosition(1)
    }
    function level2() {
      return level1()
    }

    const pos0 = tracePosition(0)
    const pos1 = level1()
    const pos2 = level2()

    // All should be valid positions
    expect(pos0.url).toMatch(/(trace\.ts|trace\.test\.ts)/)
    expect(pos1.url).toMatch(/(trace\.ts|trace\.test\.ts)/)
    expect(pos2.url).toMatch(/(trace\.ts|trace\.test\.ts)/)
  })

  test("parses stack traces with mock data", () => {
    const originalError = global.Error
    const mockStack = `Error:
    at tracePosition (file:///path/to/trace.ts:18:10)
    at Object.<anonymous> (file:///path/to/trace.test.ts:50:20)
    at Module._compile (node:internal/modules/cjs/loader:1256:14)`

    global.Error = class MockError extends Error {
      constructor() {
        super()
        this.stack = mockStack
      }
    } as any

    const pos = tracePosition(1)
    global.Error = originalError

    expect(pos.url).toBe("file:///path/to/trace.test.ts")
    expect(pos.line).toBe(50)
    expect(pos.column).toBe(20)
  })

  test("handles various stack trace formats", () => {
    const originalError = global.Error

    // Test format without function name
    const mockStack = `Error:
    at file:///path/to/file.ts:10:15
    at Module._compile (node:internal/modules/cjs/loader:1256:14)`

    global.Error = class MockError extends Error {
      constructor() {
        super()
        this.stack = mockStack
      }
    } as any

    const pos = tracePosition(0)
    global.Error = originalError

    expect(pos.url).toBe("file:///path/to/file.ts")
    expect(pos.line).toBe(10)
    expect(pos.column).toBe(15)
  })

  test("validates regex patterns for stack parsing", () => {
    const regex1 = /at\s+(?:.*\s+)?\((.*):(\d+):(\d+)\)/
    const regex2 = /at\s+(.*):(\d+):(\d+)/

    // Test common formats
    const format1 = "at FunctionName (file:///path/to/file.ts:10:20)"
    const match1 = format1.match(regex1)
    expect(match1![1]).toBe("file:///path/to/file.ts")
    expect(match1![2]).toBe("10")
    expect(match1![3]).toBe("20")

    const format2 = "at file:///path/to/file.ts:15:25"
    const match2 = format2.match(regex2)
    expect(match2![1]).toBe("file:///path/to/file.ts")
    expect(match2![2]).toBe("15")
    expect(match2![3]).toBe("25")
  })

  test("throws error for invalid depths", () => {
    expect(() => tracePosition(100)).toThrow("stack depth(100) out of bounds")
    expect(() => tracePosition(-1)).toThrow(/unable to parse stack trace line/)
    expect(() => tracePosition(9999)).toThrow(
      /stack depth\(9999\) out of bounds/,
    )
  })

  test("returns consistent position for same depth", () => {
    const pos1 = tracePosition(0)
    const pos2 = tracePosition(0)
    expect(pos1.line).toBe(pos2.line)
    expect(pos1.column).toBe(pos2.column)
    expect(pos1.url).toBe(pos2.url)
  })
})

describe("detectPackageRoot", () => {
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

  test("non-existent path returns undefined", () => {
    const root = detectPackageRoot("/non/existent/path")
    expect(root).toBeUndefined()
  })
})
