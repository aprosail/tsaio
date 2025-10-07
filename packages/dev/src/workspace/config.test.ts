import { detectWorkspaceConfig, parseWorkspaceConfig } from "@/workspace/config"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Create mock functions using vi.hoisted to avoid hoisting issues.
const mockExistsSync = vi.hoisted(() => vi.fn())
const mockReadFileSync = vi.hoisted(() => vi.fn())
const mockJoin = vi.hoisted(() =>
  vi.fn((...args: string[]) => args.join("/").replace(/\/+/g, "/")),
)

// Mock modules.
vi.mock("node:fs", () => ({
  existsSync: mockExistsSync,
  readFileSync: mockReadFileSync,
}))

vi.mock("node:path", () => ({
  join: mockJoin,
}))

describe("detectWorkspaceConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return true when both package.json and pnpm-workspace.yaml exist", () => {
    mockExistsSync.mockImplementation((path: string) => {
      if (path === "/workspace/package.json") return true
      if (path === "/workspace/pnpm-workspace.yaml") return true
      return false
    })

    mockJoin.mockImplementation((...args: string[]) =>
      args.join("/").replace(/\/+/g, "/"),
    )

    const result = detectWorkspaceConfig("/workspace")
    expect(result).toBe(true)
  })

  it("should return false when package.json does not exist", () => {
    mockExistsSync.mockImplementation((path: string) => {
      if (path === "/workspace/package.json") return false
      if (path === "/workspace/pnpm-workspace.yaml") return true
      return false
    })

    mockJoin.mockImplementation((...args: string[]) =>
      args.join("/").replace(/\/+/g, "/"),
    )

    const result = detectWorkspaceConfig("/workspace")
    expect(result).toBe(false)
  })

  it("should return false when pnpm-workspace.yaml does not exist", () => {
    mockExistsSync.mockImplementation((path: string) => {
      if (path === "/workspace/package.json") return true
      if (path === "/workspace/pnpm-workspace.yaml") return false
      return false
    })

    mockJoin.mockImplementation((...args: string[]) =>
      args.join("/").replace(/\/+/g, "/"),
    )

    const result = detectWorkspaceConfig("/workspace")
    expect(result).toBe(false)
  })
})

describe("parseWorkspaceConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should parse valid pnpm-workspace.yaml", () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(
      "packages:\n" + "  - packages/*\n" + "  - examples/*\n" + "  - tsaio\n",
    )
    mockJoin.mockImplementation((...args: string[]) =>
      args.join("/").replace(/\/+/g, "/"),
    )

    const result = parseWorkspaceConfig("/workspace")
    expect(result).toEqual({
      packages: ["packages/*", "examples/*", "tsaio"],
    })
  })

  it("should handle quoted package paths", () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(
      "packages:\n" +
        '  - "packages/*"\n' +
        "  - 'examples/*'\n" +
        "  - tsaio\n",
    )
    mockJoin.mockImplementation((...args: string[]) =>
      args.join("/").replace(/\/+/g, "/"),
    )

    const result = parseWorkspaceConfig("/workspace")
    expect(result).toEqual({
      packages: ["packages/*", "examples/*", "tsaio"],
    })
  })

  it("should throw error when pnpm-workspace.yaml not found", () => {
    mockExistsSync.mockReturnValue(false)
    mockJoin.mockImplementation((...args: string[]) =>
      args.join("/").replace(/\/+/g, "/"),
    )

    expect(() => parseWorkspaceConfig("/workspace")).toThrow(
      "pnpm-workspace.yaml not found at /workspace/pnpm-workspace.yaml",
    )
  })
})
