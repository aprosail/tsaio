import type { PackageInfo, WorkspaceConfig } from "@/workspace/types"
import { glob } from "glob"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

/**
 * Gets all packages in the workspace.
 *
 * @param root - The root directory of the workspace.
 * @param config - The workspace configuration.
 */
export async function getWorkspacePackages(
  root: string,
  config: WorkspaceConfig,
) {
  const packages: PackageInfo[] = []

  for (const packagePattern of config.packages) {
    // Use glob library for proper pattern matching
    const pattern = join(root, packagePattern, "package.json")
    const matches = await glob(pattern, { ignore: "node_modules/**" })

    for (const packageJsonPath of matches) {
      const packagePath = join(packageJsonPath, "..")
      const packageInfo = getPackageInfo(packagePath)
      if (packageInfo) packages.push(packageInfo)
    }
  }

  return packages
}

/**
 * Gets information for a single package.
 *
 * @param packagePath - The path to the package directory.
 * @returns {PackageInfo | null} Package information or null if package.json is not found or invalid.
 */
export function getPackageInfo(packagePath: string): PackageInfo | null {
  const packageJsonPath = join(packagePath, "package.json")

  if (!existsSync(packageJsonPath)) {
    return null
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"))
    const dependencies = [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.devDependencies || {}),
    ].filter((dep) => dep.startsWith("@tsaio/"))

    return {
      name: packageJson.name,
      path: packagePath,
      hasBuildScript: !!(packageJson.scripts && packageJson.scripts.build),
      dependencies,
      status: "pending",
    }
  } catch {
    return null
  }
}
