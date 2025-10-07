import { logger } from "@/logger.js"
import { exec } from "node:child_process"
import { promisify } from "node:util"
import type { PackageInfo } from "./types.js"

const execAsync = promisify(exec)

/**
 * Builds a single package.
 *
 * @param packageInfo - The package information to build.
 * @throws {Error} If the build process fails.
 */
export async function buildPackage(packageInfo: PackageInfo) {
  packageInfo.status = "building"
  logger.info(`Building package: ${packageInfo.name}`)

  try {
    await execAsync("pnpm run build", { cwd: packageInfo.path })
    packageInfo.status = "built"
    logger.info(`Package built: ${packageInfo.name}`)
  } catch (error) {
    logger.error(`Failed to build package: ${packageInfo.name}`)
    throw new Error(`Failed to build package ${packageInfo.name}: ${error}`)
  }
}

/**
 * Builds packages in parallel.
 *
 * @param packages - Array of packages to build.
 */
export async function buildPackagesParallel(packages: PackageInfo[]) {
  const buildPromises = packages
    .filter((pkg) => pkg.hasBuildScript)
    .map((pkg) => buildPackage(pkg))

  await Promise.all(buildPromises)
}
