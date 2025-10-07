import { buildWorkspace } from "@/workspace/index"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Create mock functions using vi.hoisted to avoid hoisting issues.
const mockExistsSync = vi.hoisted(() => vi.fn())
const mockReadFileSync = vi.hoisted(() => vi.fn())
const mockJoin = vi.hoisted(() =>
  vi.fn((...args: string[]) => args.join("/").replace(/\/+/g, "/")),
)
const mockExec = vi.hoisted(() => vi.fn())

// Mock modules.
vi.mock("node:fs", () => ({
  existsSync: mockExistsSync,
  readFileSync: mockReadFileSync,
}))

vi.mock("node:path", () => ({
  join: mockJoin,
}))

vi.mock("node:child_process", () => ({
  exec: mockExec,
}))

vi.mock("node:util", () => ({
  promisify: vi.fn((fn) => fn),
}))

describe("buildWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should build workspace successfully", async () => {
    // Mock workspace config detection.
    mockExistsSync.mockImplementation((path: string) => {
      if (typeof path === "string" && path === "/workspace/package.json")
        return true
      if (typeof path === "string" && path === "/workspace/pnpm-workspace.yaml")
        return true
      if (typeof path === "string" && path.includes("package.json")) return true
      return false
    })

    // Mock pnpm-workspace.yaml content.
    mockReadFileSync.mockImplementation((path: string) => {
      if (
        typeof path === "string" &&
        path === "/workspace/pnpm-workspace.yaml"
      ) {
        return "packages:\n" + "  - packages/css\n" + "  - packages/utils\n"
      }
      if (typeof path === "string" && path.includes("package.json")) {
        return JSON.stringify({
          name: path.includes("css") ? "@tsaio/css" : "@tsaio/utils",
          scripts: { build: "rolldown --config rolldown.config.ts" },
          dependencies: {},
        })
      }
      return ""
    })

    // Mock successful build execution.
    mockExec.mockImplementation(
      (command: string, options: any, callback: any) => {
        if (typeof callback === "function") {
          callback(null, { stdout: "Build successful", stderr: "" })
        }
        return {} as any
      },
    )

    mockJoin.mockImplementation((...args: string[]) =>
      args.join("/").replace(/\/+/g, "/"),
    )

    await expect(buildWorkspace("/workspace")).resolves.toBeUndefined()

    // Should have called build for packages with build script.
    expect(mockExec).toHaveBeenCalled()
  })

  it("should throw error when workspace config not found", async () => {
    mockExistsSync.mockReturnValue(false)
    mockJoin.mockImplementation((...args: string[]) =>
      args.join("/").replace(/\/+/g, "/"),
    )

    await expect(buildWorkspace("/workspace")).rejects.toThrow(
      "Workspace configuration not found at /workspace",
    )
  })

  it("should handle no packages with build script", async () => {
    mockExistsSync.mockImplementation((path: string) => {
      if (typeof path === "string" && path === "/workspace/package.json")
        return true
      if (typeof path === "string" && path === "/workspace/pnpm-workspace.yaml")
        return true
      if (typeof path === "string" && path.includes("package.json")) return true
      return false
    })

    mockReadFileSync.mockImplementation((path: string) => {
      if (
        typeof path === "string" &&
        path === "/workspace/pnpm-workspace.yaml"
      ) {
        return "packages:\n" + "  - packages/*\n"
      }
      if (typeof path === "string" && path.includes("package.json")) {
        return JSON.stringify({
          name: path.includes("css") ? "@tsaio/css" : "@tsaio/utils",
          scripts: { test: "vitest run" }, // No build script
          dependencies: {},
        })
      }
      return ""
    })

    mockJoin.mockImplementation((...args: string[]) =>
      args.join("/").replace(/\/+/g, "/"),
    )

    await expect(buildWorkspace("/workspace")).resolves.toBeUndefined()

    // Should not call build since no packages have build script.
    expect(mockExec).not.toHaveBeenCalled()
  })
})
