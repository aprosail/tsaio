import { prepareRules } from "@/rules"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Mock file system functions using vi.hoisted
const mockExistsSync = vi.hoisted(() => vi.fn())
const mockReaddirSync = vi.hoisted(() => vi.fn())
const mockReadFileSync = vi.hoisted(() => vi.fn())
const mockMkdirSync = vi.hoisted(() => vi.fn())
const mockWriteFileSync = vi.hoisted(() => vi.fn())

vi.mock("node:fs", () => ({
  existsSync: mockExistsSync,
  readdirSync: mockReaddirSync,
  readFileSync: mockReadFileSync,
  mkdirSync: mockMkdirSync,
  writeFileSync: mockWriteFileSync,
}))

// Mock path.join to return predictable paths
const mockJoin = vi.hoisted(() => vi.fn((...args) => args.join("/")))
vi.mock("node:path", () => ({
  join: mockJoin,
}))

describe("prepareRules", () => {
  let cwdSpy: any

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mockJoin to return predictable paths
    mockJoin.mockImplementation((...args) => args.join("/"))

    // Mock process.cwd using spyOn
    cwdSpy = vi.spyOn(process, "cwd").mockReturnValue("/workspace")
  })

  afterEach(() => {
    cwdSpy.mockRestore()
  })

  it("should handle missing rules directory", () => {
    mockExistsSync.mockReturnValue(false)

    prepareRules()

    expect(mockExistsSync).toHaveBeenCalledWith("/workspace/rules")
    expect(mockReaddirSync).not.toHaveBeenCalled()
  })

  it("should handle empty rules directory", () => {
    mockExistsSync.mockReturnValue(true)
    mockReaddirSync.mockReturnValue([])

    prepareRules()

    expect(mockReaddirSync).toHaveBeenCalledWith("/workspace/rules")
    expect(mockMkdirSync).not.toHaveBeenCalled()
  })

  it("should prepare rules for all tools", () => {
    const mockRuleFiles = ["about.md", "architecture.md", "testing.md"]
    const mockFileContents = {
      "about.md": "# About\nAbout content",
      "architecture.md": "# Architecture\nArchitecture content",
      "testing.md": "# Testing\nTesting content",
    }

    mockExistsSync.mockReturnValue(true)
    mockReaddirSync.mockReturnValue(mockRuleFiles)
    mockReadFileSync.mockImplementation((path: string) => {
      const filename = path.split("/").pop()
      return mockFileContents[filename as keyof typeof mockFileContents]
    })

    prepareRules()

    // Should create RooCode directory
    expect(mockMkdirSync).toHaveBeenCalledWith("/workspace/.roo/rules", {
      recursive: true,
    })

    // Should copy files to RooCode directory
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      "/workspace/.roo/rules/about.md",
      "# About\nAbout content",
      "utf-8",
    )
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      "/workspace/.roo/rules/architecture.md",
      "# Architecture\nArchitecture content",
      "utf-8",
    )
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      "/workspace/.roo/rules/testing.md",
      "# Testing\nTesting content",
      "utf-8",
    )

    // Should create ClaudeCode file with concatenated content
    const expectedClaudeContent =
      "# About\nAbout content\n\n---\n\n# Architecture\nArchitecture content\n\n---\n\n# Testing\nTesting content"
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      "/workspace/CLAUDE.md",
      expectedClaudeContent,
      "utf-8",
    )

    // Should create QwenCode file with concatenated content
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      "/workspace/QWEN.md",
      expectedClaudeContent,
      "utf-8",
    )
  })

  it("should work with custom root directory", () => {
    const mockRuleFiles = ["about.md"]
    const mockFileContents = {
      "about.md": "# About\nAbout content",
    }

    mockExistsSync.mockReturnValue(true)
    mockReaddirSync.mockReturnValue(mockRuleFiles)
    mockReadFileSync.mockImplementation((path: string) => {
      const filename = path.split("/").pop()
      return mockFileContents[filename as keyof typeof mockFileContents]
    })

    prepareRules("/custom/workspace")

    expect(mockExistsSync).toHaveBeenCalledWith("/custom/workspace/rules")
    expect(mockMkdirSync).toHaveBeenCalledWith("/custom/workspace/.roo/rules", {
      recursive: true,
    })
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      "/custom/workspace/CLAUDE.md",
      expect.any(String),
      "utf-8",
    )
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      "/custom/workspace/QWEN.md",
      expect.any(String),
      "utf-8",
    )
  })

  it("should filter only markdown files", () => {
    const mockFiles = [
      "about.md",
      "architecture.md",
      "README.txt",
      "config.json",
    ]
    const mockFileContents = {
      "about.md": "# About\nAbout content",
      "architecture.md": "# Architecture\nArchitecture content",
    }

    mockExistsSync.mockReturnValue(true)
    mockReaddirSync.mockReturnValue(mockFiles)
    mockReadFileSync.mockImplementation((path: string) => {
      const filename = path.split("/").pop()
      return mockFileContents[filename as keyof typeof mockFileContents] || ""
    })

    prepareRules()

    // Should only process .md files
    expect(mockWriteFileSync).toHaveBeenCalledTimes(4) // 2 for RooCode + 1 for Claude + 1 for Qwen
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      "/workspace/.roo/rules/about.md",
      "# About\nAbout content",
      "utf-8",
    )
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      "/workspace/.roo/rules/architecture.md",
      "# Architecture\nArchitecture content",
      "utf-8",
    )
    expect(mockWriteFileSync).not.toHaveBeenCalledWith(
      "/workspace/.roo/rules/README.txt",
      expect.any(String),
      "utf-8",
    )
    expect(mockWriteFileSync).not.toHaveBeenCalledWith(
      "/workspace/.roo/rules/config.json",
      expect.any(String),
      "utf-8",
    )
  })

  it("should sort rule files alphabetically", () => {
    const mockRuleFiles = ["z-last.md", "a-first.md", "m-middle.md"]
    const mockFileContents = {
      "a-first.md": "# First",
      "m-middle.md": "# Middle",
      "z-last.md": "# Last",
    }

    mockExistsSync.mockReturnValue(true)
    mockReaddirSync.mockReturnValue(mockRuleFiles)
    mockReadFileSync.mockImplementation((path: string) => {
      const filename = path.split("/").pop()
      return mockFileContents[filename as keyof typeof mockFileContents]
    })

    prepareRules()

    // Should process files in sorted order: a-first.md, m-middle.md, z-last.md
    const claudeCall = mockWriteFileSync.mock.calls.find(
      (call) => call[0] === "/workspace/CLAUDE.md",
    )
    expect(claudeCall).toBeDefined()
    const claudeContent = claudeCall![1] as string
    expect(claudeContent).toMatch(
      /^# First\n\n---\n\n# Middle\n\n---\n\n# Last$/,
    )
  })
})
