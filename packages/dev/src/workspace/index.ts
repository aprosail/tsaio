import { buildPackagesParallel } from "@/workspace/build"
import { detectWorkspaceConfig, parseWorkspaceConfig } from "@/workspace/config"
import { getWorkspacePackages } from "@/workspace/packages"
import { topologicalSort } from "@/workspace/sort"

export type { PackageInfo, WorkspaceConfig } from "@/workspace/types"

/**
 * Builds all packages in a pnpm workspace that have a build script.
 * Packages are built in topological order based on dependencies and in parallel.
 *
 * @param root - The root directory where the pnpm workspace is located.
 * @throws {Error} If workspace configuration (package.json and pnpm-workspace.yaml) is not found.
 * @returns {Promise<void>} A promise that resolves when all packages are built.
 */
export async function buildWorkspace(root: string): Promise<void> {
  if (!detectWorkspaceConfig(root)) {
    throw new Error(`Workspace configuration not found at ${root}`)
  }

  const config = parseWorkspaceConfig(root)
  const allPackages = getWorkspacePackages(root, config)
  const packagesWithBuild = allPackages.filter((pkg) => pkg.hasBuildScript)
  if (packagesWithBuild.length === 0) {
    console.log("No packages with build script found")
    return
  }

  const sortedPackages = topologicalSort(packagesWithBuild)
  await buildPackagesParallel(sortedPackages)
}
