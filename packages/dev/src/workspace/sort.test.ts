import { topologicalSort } from "@/workspace/sort"
import type { PackageInfo } from "@/workspace/types"
import { describe, expect, it } from "vitest"

describe("topologicalSort", () => {
  it("should sort packages in dependency order", () => {
    const packages: PackageInfo[] = [
      {
        name: "@tsaio/css",
        path: "/workspace/packages/css",
        hasBuildScript: true,
        dependencies: ["@tsaio/hash"],
        status: "pending",
      },
      {
        name: "@tsaio/hash",
        path: "/workspace/packages/hash",
        hasBuildScript: true,
        dependencies: ["@tsaio/utils"],
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

    const result = topologicalSort(packages)

    // utils should be first (no dependencies).
    expect(result[0].name).toBe("@tsaio/utils")
    // hash should be second (depends on utils).
    expect(result[1].name).toBe("@tsaio/hash")
    // css should be last (depends on hash).
    expect(result[2].name).toBe("@tsaio/css")
  })

  it("should handle packages without dependencies", () => {
    const packages: PackageInfo[] = [
      {
        name: "@tsaio/utils",
        path: "/workspace/packages/utils",
        hasBuildScript: true,
        dependencies: [],
        status: "pending",
      },
      {
        name: "@tsaio/css",
        path: "/workspace/packages/css",
        hasBuildScript: true,
        dependencies: [],
        status: "pending",
      },
    ]

    const result = topologicalSort(packages)
    expect(result.length).toBe(2)
    expect(result.map((p) => p.name)).toContain("@tsaio/utils")
    expect(result.map((p) => p.name)).toContain("@tsaio/css")
  })

  it("should handle circular dependencies gracefully", () => {
    const packages: PackageInfo[] = [
      {
        name: "@tsaio/a",
        path: "/workspace/packages/a",
        hasBuildScript: true,
        dependencies: ["@tsaio/b"],
        status: "pending",
      },
      {
        name: "@tsaio/b",
        path: "/workspace/packages/b",
        hasBuildScript: true,
        dependencies: ["@tsaio/a"],
        status: "pending",
      },
    ]

    const result = topologicalSort(packages)
    // Should still return both packages (order may vary).
    expect(result.length).toBe(2)
    expect(result.map((p) => p.name)).toContain("@tsaio/a")
    expect(result.map((p) => p.name)).toContain("@tsaio/b")
  })
})
