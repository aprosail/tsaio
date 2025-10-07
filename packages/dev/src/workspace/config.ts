import type { WorkspaceConfig } from "@/workspace/types.js"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

/**
 * Detects whether workspace configuration exists.
 *
 * @param root - The root directory of the workspace.
 */
export function detectWorkspaceConfig(root: string) {
  const packageJsonPath = join(root, "package.json")
  const workspaceYamlPath = join(root, "pnpm-workspace.yaml")
  return existsSync(packageJsonPath) && existsSync(workspaceYamlPath)
}

/**
 * Parses pnpm-workspace.yaml configuration.
 *
 * @param root - The root directory of the workspace.
 * @throws {Error} If pnpm-workspace.yaml is not found.
 */
export function parseWorkspaceConfig(root: string): WorkspaceConfig {
  const workspaceYamlPath = join(root, "pnpm-workspace.yaml")

  if (!existsSync(workspaceYamlPath)) {
    throw new Error(`pnpm-workspace.yaml not found at ${workspaceYamlPath}`)
  }

  const content = readFileSync(workspaceYamlPath, "utf-8")
  const packages: string[] = []

  // Simple YAML parsing, only extracts packages field.
  const lines = content.split("\n")
  let inPackagesSection = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed === "packages:") {
      inPackagesSection = true
      continue
    }

    if (inPackagesSection) {
      if (trimmed.startsWith("-")) {
        const packagePath = trimmed.slice(1).trim().replace(/['"]/g, "")
        packages.push(packagePath)
      } else if (trimmed && !trimmed.startsWith("#")) {
        // Encounter non-comment non-list item, end packages section.
        break
      }
    }
  }

  return { packages }
}
