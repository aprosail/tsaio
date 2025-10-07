import { buildPackage, buildPackagesParallel } from "@/workspace/build"
import type { PackageInfo } from "@/workspace/types"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock exec function using vi.hoisted.
const mockExec = vi.hoisted(() => vi.fn())

// Mock modules.
vi.mock("node:child_process", () => ({
  exec: mockExec,
}))

vi.mock("node:util", () => ({
  promisify: vi.fn(() => mockExec),
}))

describe("buildPackage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should build package successfully", async () => {
    mockExec.mockResolvedValue({ stdout: "Build successful", stderr: "" })

    const packageInfo: PackageInfo = {
      name: "@tsaio/css",
      path: "/workspace/packages/css",
      hasBuildScript: true,
      dependencies: [],
      status: "pending",
    }

    await buildPackage(packageInfo)

    // Check that exec was called with the correct arguments.
    expect(mockExec).toHaveBeenCalled()
    expect(mockExec.mock.calls[0][0]).toBe("pnpm run build")
    expect(mockExec.mock.calls[0][1]).toEqual({
      cwd: "/workspace/packages/css",
    })
    expect(packageInfo.status).toBe("built")
  })

  it("should throw error when build fails", async () => {
    mockExec.mockRejectedValue(new Error("Build failed"))

    const packageInfo: PackageInfo = {
      name: "@tsaio/css",
      path: "/workspace/packages/css",
      hasBuildScript: true,
      dependencies: [],
      status: "pending",
    }

    await expect(buildPackage(packageInfo)).rejects.toThrow(
      "Failed to build package @tsaio/css: Error: Build failed",
    )

    // Should remain building on failure.
    expect(packageInfo.status).toBe("building")
  })
})

describe("buildPackagesParallel", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should build packages in parallel", async () => {
    const buildCalls: string[] = []

    mockExec.mockImplementation((_command: string, options: any) => {
      buildCalls.push(options.cwd)
      return Promise.resolve({ stdout: "Build successful", stderr: "" })
    })

    const packages: PackageInfo[] = [
      {
        name: "@tsaio/css",
        path: "/workspace/packages/css",
        hasBuildScript: true,
        dependencies: [],
        status: "pending",
      },
      {
        name: "@tsaio/utils",
        path: "/workspace/packages/utils",
        hasBuildScript: true,
        dependencies: [],
        status: "pending",
      },
    ]

    await buildPackagesParallel(packages)

    expect(buildCalls).toContain("/workspace/packages/css")
    expect(buildCalls).toContain("/workspace/packages/utils")
    expect(packages.every((pkg) => pkg.status === "built")).toBe(true)
  })

  it("should only build packages with build script", async () => {
    const buildCalls: string[] = []

    mockExec.mockImplementation((_command: string, options: any) => {
      buildCalls.push(options.cwd)
      return Promise.resolve({ stdout: "Build successful", stderr: "" })
    })

    const packages: PackageInfo[] = [
      {
        name: "@tsaio/css",
        path: "/workspace/packages/css",
        hasBuildScript: true,
        dependencies: [],
        status: "pending",
      },
      {
        name: "@tsaio/no-build",
        path: "/workspace/packages/no-build",
        hasBuildScript: false,
        dependencies: [],
        status: "pending",
      },
    ]

    await buildPackagesParallel(packages)

    expect(buildCalls).toContain("/workspace/packages/css")
    expect(buildCalls).not.toContain("/workspace/packages/no-build")
    expect(packages[0].status).toBe("built")
    expect(packages[1].status).toBe("pending") // Should remain pending.
  })
})
