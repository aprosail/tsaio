import { logger } from "@/logger.js"
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
 */
export async function buildWorkspace(root: string) {
  if (!detectWorkspaceConfig(root)) {
    throw new Error(`Workspace configuration not found at ${root}`)
  }

  const config = parseWorkspaceConfig(root)
  const allPackages = getWorkspacePackages(root, config)
  const packagesWithBuild = allPackages.filter((pkg) => pkg.hasBuildScript)

  if (packagesWithBuild.length === 0) {
    logger.warn("No packages with build script found")
    return
  }

  logger.info(`Found ${packagesWithBuild.length} packages to build`)
  logger.info("Building workspace packages...")

  const sortedPackages = topologicalSort(packagesWithBuild)
  await buildPackagesParallel(sortedPackages)

  logger.info("All packages built successfully!")
}
