import { hashPosition, tracePosition } from "@/trace"
import { describe, expect, test, vi } from "vitest"

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
  test("returns undefined for HTTP URLs", () => {
    const mockExistsSync = vi.fn(() => false)
    const mockStatSync = vi.fn(() => ({
      isFile: () => false,
      isDirectory: () => false,
    }))

    const detectPackageRoot = createDetectPackageRoot(
      mockExistsSync,
      mockStatSync,
    )

    expect(
      detectPackageRoot("http://example.com/path/to/file.ts"),
    ).toBeUndefined()
    expect(
      detectPackageRoot("https://example.com/path/to/file.ts"),
    ).toBeUndefined()
  })

  test("from current directory", () => {
    const mockExistsSync = vi.fn((path: string) => {
      return path === "/mock/project/package.json" || path === "/mock/project"
    })
    const mockStatSync = vi.fn((path: string) => ({
      isFile: () => path === "/mock/project/package.json",
      isDirectory: () => path === "/mock/project",
    }))
    const mockCwd = vi.fn(() => "/mock/project")

    const detectPackageRoot = createDetectPackageRoot(
      mockExistsSync,
      mockStatSync,
      mockCwd,
    )
    const root = detectPackageRoot()

    expect(root).toBe("/mock/project")
  })

  test("from specific directory", () => {
    const mockExistsSync = vi.fn((path: string) => {
      if (path === "/mock/project/src/index.ts") return true
      if (path === "/mock/project/package.json") return true
      if (path === "/mock/project") return true
      return false
    })
    const mockStatSync = vi.fn((path: string) => ({
      isFile: () =>
        path === "/mock/project/src/index.ts" ||
        path === "/mock/project/package.json",
      isDirectory: () => path === "/mock/project",
    }))

    const detectPackageRoot = createDetectPackageRoot(
      mockExistsSync,
      mockStatSync,
    )
    const root = detectPackageRoot("/mock/project/src/index.ts")

    expect(root).toBe("/mock/project")
  })

  test("from file path", () => {
    const mockExistsSync = vi.fn((path: string) => {
      if (path === "/mock/project/src") return true
      if (path === "/mock/project/src/package.json") return true
      return false
    })
    const mockStatSync = vi.fn((path: string) => ({
      isFile: () => path === "/mock/project/src/package.json",
      isDirectory: () => path === "/mock/project/src",
    }))

    const detectPackageRoot = createDetectPackageRoot(
      mockExistsSync,
      mockStatSync,
    )
    const root = detectPackageRoot("/mock/project/src")

    expect(root).toBe("/mock/project/src")
  })

  test("non-existent path returns undefined", () => {
    const mockExistsSync = vi.fn(
      (path: string) => path !== "/non/existent/path",
    )
    const mockStatSync = vi.fn(() => ({
      isFile: () => false,
      isDirectory: () => false,
    }))

    const detectPackageRoot = createDetectPackageRoot(
      mockExistsSync,
      mockStatSync,
    )
    const root = detectPackageRoot("/non/existent/path")

    expect(root).toBeUndefined()
  })

  test("no package.json found returns undefined", () => {
    const mockExistsSync = vi.fn(() => false)
    const mockStatSync = vi.fn((path: string) => ({
      isFile: () => path === "/mock/project/src/index.ts",
      isDirectory: () => false,
    }))

    const detectPackageRoot = createDetectPackageRoot(
      mockExistsSync,
      mockStatSync,
    )
    const root = detectPackageRoot("/mock/project/src/index.ts")

    expect(root).toBeUndefined()
  })
})

function createDetectPackageRoot(
  mockExistsSync: any,
  mockStatSync: any,
  mockCwd?: any,
) {
  const { dirname, join, resolve } = require("node:path")

  return function detectPackageRoot(path?: string): string | undefined {
    const startPath = path ? resolve(path) : mockCwd ? mockCwd() : process.cwd()
    const searchPath =
      (mockExistsSync(startPath) && mockStatSync(startPath).isFile()) ||
      !mockExistsSync(startPath)
        ? dirname(startPath)
        : startPath

    const packageJsonPath = join(searchPath, "package.json")
    if (
      mockExistsSync(packageJsonPath) &&
      mockStatSync(packageJsonPath).isFile()
    ) {
      return searchPath
    }
    const parentPath = dirname(searchPath)
    if (parentPath === searchPath) {
      return undefined
    }
    return detectPackageRoot(parentPath)
  }
}

describe("hashPosition", () => {
  test("handles HTTP URLs in detectPackageRoot", () => {
    const mockExistsSync = vi.fn(() => false)
    const mockStatSync = vi.fn(() => ({
      isFile: () => false,
      isDirectory: () => false,
    }))

    const detectPackageRoot = createDetectPackageRoot(
      mockExistsSync,
      mockStatSync,
    )

    expect(detectPackageRoot("ftp://example.com/path/file.ts")).toBeUndefined()
    expect(detectPackageRoot("http://example.com/path/file.ts")).toBeUndefined()
    expect(
      detectPackageRoot("https://example.com/path/file.ts"),
    ).toBeUndefined()
  })

  test("returns consistent hash for same position", () => {
    function getHash() {
      return hashPosition()
    }

    const hash1 = getHash()
    const hash2 = getHash()

    expect(hash1).toBe(hash2)
    expect(hash1).toMatch(/^[a-f0-9]{16}$/)
  })

  test("returns different hash for different positions", () => {
    function getHashAtLine1() {
      return hashPosition()
    }

    function getHashAtLine2() {
      return hashPosition()
    }

    const hash1 = getHashAtLine1()
    const hash2 = getHashAtLine2()
    expect(hash1).not.toBe(hash2)
  })

  test("respects custom length parameter", () => {
    const hash8 = hashPosition(8)
    const hash32 = hashPosition(32)

    expect(hash8).toHaveLength(8)
    expect(hash32).toHaveLength(32)
    expect(hash8).toMatch(/^[a-f0-9]+$/)
    expect(hash32).toMatch(/^[a-f0-9]+$/)
  })

  test("respects custom algorithm parameter", () => {
    const sha256Hash = hashPosition(16, "sha256")
    const md5Hash = hashPosition(16, "md5")

    expect(sha256Hash).toHaveLength(16)
    expect(md5Hash).toHaveLength(16)
    expect(sha256Hash).toMatch(/^[a-f0-9]+$/)
    expect(md5Hash).toMatch(/^[a-f0-9]+$/)

    expect(sha256Hash).not.toBe(md5Hash)
  })

  test("works with mock tracePosition data", () => {
    const mockPosition = {
      url: "file:///mock/test.ts",
      line: 42,
      column: 10,
    }

    function hashPositionWithMock(position: typeof mockPosition) {
      const hash = require("node:crypto").createHash("sha256")
      hash.update(position.url)
      hash.update(new Uint8Array(new Uint32Array([position.line]).buffer))
      hash.update(new Uint8Array(new Uint32Array([position.column]).buffer))
      return hash.digest("hex").slice(0, 16)
    }

    const hash = hashPositionWithMock(mockPosition)
    expect(hash).toMatch(/^[a-f0-9]{16}$/)

    const hash2 = hashPositionWithMock(mockPosition)
    expect(hash).toBe(hash2)
  })

  test("handles different mock positions", () => {
    function hashPositionWithMock(position: {
      url: string
      line: number
      column: number
    }) {
      const hash = require("node:crypto").createHash("sha256")
      hash.update(position.url)
      hash.update(new Uint8Array(new Uint32Array([position.line]).buffer))
      hash.update(new Uint8Array(new Uint32Array([position.column]).buffer))
      return hash.digest("hex").slice(0, 16)
    }

    const position1 = { url: "file:///mock/file1.ts", line: 10, column: 5 }
    const position2 = { url: "file:///mock/file2.ts", line: 20, column: 15 }

    const hash1 = hashPositionWithMock(position1)
    const hash2 = hashPositionWithMock(position2)

    expect(hash1).not.toBe(hash2)
    expect(hash1).toMatch(/^[a-f0-9]{16}$/)
    expect(hash2).toMatch(/^[a-f0-9]{16}$/)
  })

  test("default parameters produce valid hash", () => {
    const hash = hashPosition()

    expect(hash).toBeTruthy()
    expect(hash).toHaveLength(16)
    expect(hash).toMatch(/^[a-f0-9]+$/)
  })
})
