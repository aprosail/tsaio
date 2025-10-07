import { describe, expect, it, vi } from "vitest"
import { parseTsconfigAliases } from "./alias.js"

vi.mock("node:fs", () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}))

vi.mock("node:path", () => ({
  resolve: vi.fn((...args) => args.join("/").replace(/\/+/g, "/")),
  join: vi.fn((...args) => args.join("/").replace(/\/+/g, "/")),
}))

describe("parseTsconfigAliases", () => {
  it("should return empty object when tsconfig not found", async () => {
    const { existsSync } = vi.mocked(await import("node:fs"))
    existsSync.mockReturnValue(false)

    const result = parseTsconfigAliases()
    expect(result).toEqual({})
  })

  it("should parse aliases from tsconfig object", () => {
    const tsconfig = {
      compilerOptions: {
        paths: {
          "@/*": ["./src/*"],
          "@components/*": ["./components/*", "./other/components/*"],
          "@utils": ["./utils"],
        },
      },
    }

    const result = parseTsconfigAliases(tsconfig, "/project")
    expect(result).toEqual({
      "@": "/project/src",
      "@components": "/project/components",
      "@utils": "/project/utils",
    })
  })

  it("should parse aliases from tsconfig file path", async () => {
    const { existsSync, readFileSync } = vi.mocked(await import("node:fs"))
    const { resolve } = vi.mocked(await import("node:path"))

    existsSync.mockReturnValue(true)
    readFileSync.mockReturnValue(
      JSON.stringify({
        compilerOptions: {
          paths: {
            "@/*": ["./src/*"],
            "@app/*": ["./app/*"],
          },
        },
      }),
    )
    resolve.mockImplementation((...args) => args.join("/").replace(/\/+/g, "/"))

    const result = parseTsconfigAliases("/project/tsconfig.json", "/project")
    expect(result).toEqual({
      "@": "/project/src",
      "@app": "/project/app",
    })
  })

  it("should auto detect tsconfig.json", async () => {
    const { existsSync, readFileSync } = vi.mocked(await import("node:fs"))
    const { join } = vi.mocked(await import("node:path"))

    existsSync.mockImplementation((path) => path === "/project/tsconfig.json")
    readFileSync.mockReturnValue(
      JSON.stringify({
        compilerOptions: {
          paths: {
            "@/*": ["./src/*"],
          },
        },
      }),
    )
    join.mockImplementation((...args) => args.join("/").replace(/\/+/g, "/"))

    const result = parseTsconfigAliases(undefined, "/project")
    expect(result).toEqual({
      "@": "/project/src",
    })
  })

  it("should throw error for invalid JSON", async () => {
    const { existsSync, readFileSync } = vi.mocked(await import("node:fs"))

    existsSync.mockReturnValue(true)
    readFileSync.mockReturnValue("invalid json")

    expect(() => parseTsconfigAliases(undefined, "/project")).toThrow(
      SyntaxError,
    )
  })

  it("should handle edge cases and path normalization", () => {
    // 合并多个边界情况测试
    const tsconfig = {
      compilerOptions: {
        target: "ES2020", // missing paths
        paths: {
          "": {}, // empty paths
          "@bad/*": "./src/*", // non-array value
          "@empty/*": [], // empty array
          "@components/*": ["./components/*"], // normal case with /*
          "@utils/*": ["./utils"], // mixed case
          "@lib": ["./lib/*"], // no /* in key
          "@multi/*": ["./src/*", "./lib/*", "./other/*"], // multiple paths
          "@complex/*": ["./src/components/*"], // nested path
        },
      },
    }

    const result = parseTsconfigAliases(tsconfig, "/project")
    expect(result).toEqual({
      "@components": "/project/components",
      "@utils": "/project/utils",
      "@lib": "/project/lib",
      "@multi": "/project/src", // first path only
      "@complex": "/project/src/components",
    })
  })
})
