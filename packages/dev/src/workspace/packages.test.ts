import { getPackageInfo, getWorkspacePackages } from "@/workspace/packages"
import type { WorkspaceConfig } from "@/workspace/types"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Create mock functions using vi.hoisted to avoid hoisting issues.
const mockExistsSync = vi.hoisted(() => vi.fn())
const mockReadFileSync = vi.hoisted(() => vi.fn())
const mockJoin = vi.hoisted(() =>
  vi.fn((...args: string[]) => args.join("/").replace(/\/+/g, "/")),
)
const mockGlob = vi.hoisted(() => vi.fn())

// Mock modules.
vi.mock("node:fs", () => ({
  existsSync: mockExistsSync,
  readFileSync: mockReadFileSync,
}))

vi.mock("node:path", () => ({
  join: mockJoin,
}))

vi.mock("glob", () => ({
  glob: mockGlob,
}))

describe("getPackageInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return package info when package.json exists", () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(
      JSON.stringify({
        name: "@tsaio/css",
        scripts: {
          build: "rolldown --config rolldown.config.ts",
        },
        dependencies: {
          "@tsaio/hash": "workspace:*",
        },
        devDependencies: {
          "@tsaio/dev": "workspace:*",
        },
      }),
    )
    mockJoin.mockImplementation((...args: string[]) =>
      args.join("/").replace(/\/+/g, "/"),
    )

    const result = getPackageInfo("/workspace/packages/css")
    expect(result).toEqual({
      name: "@tsaio/css",
      path: "/workspace/packages/css",
      hasBuildScript: true,
      dependencies: ["@tsaio/hash", "@tsaio/dev"],
      status: "pending",
    })
  })

  it("should return null when package.json does not exist", () => {
    mockExistsSync.mockReturnValue(false)
    mockJoin.mockImplementation((...args: string[]) =>
      args.join("/").replace(/\/+/g, "/"),
    )

    const result = getPackageInfo("/workspace/packages/nonexistent")
    expect(result).toBeNull()
  })

  it("should return null when package.json is invalid JSON", () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue("invalid json")
    mockJoin.mockImplementation((...args: string[]) =>
      args.join("/").replace(/\/+/g, "/"),
    )

    const result = getPackageInfo("/workspace/packages/invalid")
    expect(result).toBeNull()
  })

  it("should handle package without build script", () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(
      JSON.stringify({
        name: "@tsaio/no-build",
        scripts: {
          test: "vitest run",
        },
      }),
    )
    mockJoin.mockImplementation((...args: string[]) =>
      args.join("/").replace(/\/+/g, "/"),
    )

    const result = getPackageInfo("/workspace/packages/no-build")
    expect(result).toEqual({
      name: "@tsaio/no-build",
      path: "/workspace/packages/no-build",
      hasBuildScript: false,
      dependencies: [],
      status: "pending",
    })
  })
})

describe("getWorkspacePackages", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should get packages from workspace config", async () => {
    // Mock glob to return package.json paths
    mockGlob.mockResolvedValue([
      "/workspace/packages/css/package.json",
      "/workspace/packages/utils/package.json",
      "/workspace/packages/hash/package.json",
    ])

    // Mock that package.json exists for specific paths.
    mockExistsSync.mockImplementation((path: string) => {
      if (typeof path === "string" && path.includes("package.json")) return true
      return false
    })

    // Mock package.json content for different packages.
    mockReadFileSync.mockImplementation((path: string) => {
      if (typeof path === "string" && path.includes("css")) {
        return JSON.stringify({
          name: "@tsaio/css",
          scripts: { build: "rolldown --config rolldown.config.ts" },
          dependencies: { "@tsaio/hash": "workspace:*" },
        })
      }
      if (typeof path === "string" && path.includes("utils")) {
        return JSON.stringify({
          name: "@tsaio/utils",
          scripts: { build: "rolldown --config rolldown.config.ts" },
        })
      }
      if (typeof path === "string" && path.includes("hash")) {
        return JSON.stringify({
          name: "@tsaio/hash",
          scripts: { build: "rolldown --config rolldown.config.ts" },
          dependencies: { "@tsaio/utils": "workspace:*" },
        })
      }
      return JSON.stringify({ name: "unknown" })
    })

    mockJoin.mockImplementation((...args: string[]) =>
      args.join("/").replace(/\/+/g, "/"),
    )

    const config: WorkspaceConfig = {
      packages: ["packages/css", "packages/utils", "packages/hash"],
    }

    const result = await getWorkspacePackages("/workspace", config)

    // Should find packages with package.json.
    expect(result.length).toBeGreaterThan(0)
    expect(result.some((pkg) => pkg.name === "@tsaio/css")).toBe(true)
  })
})
