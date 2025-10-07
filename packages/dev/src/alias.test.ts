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
    const tsconfig = {
      compilerOptions: {
        target: "ES2020", // Missing paths.
        paths: {
          "": {}, // Empty paths.
          "@bad/*": "./src/*", // Non-array value.
          "@empty/*": [], // Empty array.
          "@components/*": ["./components/*"], // Normal case with /*.
          "@utils/*": ["./utils"], // Mixed case.
          "@lib": ["./lib/*"], // No /* in key.
          "@multi/*": ["./src/*", "./lib/*", "./other/*"], // Multiple paths.
          "@complex/*": ["./src/components/*"], // Nested path.
        },
      },
    }

    const result = parseTsconfigAliases(tsconfig, "/project")
    expect(result).toEqual({
      "@components": "/project/components",
      "@utils": "/project/utils",
      "@lib": "/project/lib",
      "@multi": "/project/src", // First path only.
      "@complex": "/project/src/components",
    })
  })
})

describe("parseTsconfigAliases absolute paths", () => {
  it("should always return absolute paths", () => {
    const tsconfig = {
      compilerOptions: {
        paths: {
          "@/*": ["./src/*"],
          "@/deep/*": ["./src/deep/*"],
          "@/relative/*": ["../src/*"], // Relative path going up.
          "@/absolute/*": ["/absolute/path/*"], // Already absolute path.
        },
      },
    }

    const result = parseTsconfigAliases(tsconfig, "/project")

    // Verify all returned paths are absolute.
    for (const path of Object.values(result)) {
      expect(path).toMatch(/^\//) // Should start with / (Unix absolute path).
    }

    expect(result).toEqual({
      "@": "/project/src",
      "@/deep": "/project/src/deep",
      "@/relative": "/project/../src", // Resolve handles relative paths.
      "@/absolute": "/absolute/path", // Absolute path remains unchanged.
    })
  })

  it("should handle Windows-style paths correctly", () => {
    const tsconfig = { compilerOptions: { paths: { "@/*": ["./src/*"] } } }

    // Simulate Windows environment.
    const originalPlatform = process.platform
    Object.defineProperty(process, "platform", { value: "win32" })

    const result = parseTsconfigAliases(tsconfig, "C:\\project")

    // Restore original platform.
    Object.defineProperty(process, "platform", { value: originalPlatform })

    // On Windows, absolute paths should start with drive letter.
    if (process.platform === "win32") {
      // oxlint-disable-next-line no-conditional-expect
      expect(result["@"]).toMatch(/^[A-Z]:\\/)
    }
  })
})
