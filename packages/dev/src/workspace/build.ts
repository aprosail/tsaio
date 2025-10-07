import { exec } from "node:child_process"
import { promisify } from "node:util"
import type { PackageInfo } from "./types.js"

const execAsync = promisify(exec)

/**
 * Builds a single package.
 *
 * @param packageInfo - The package information to build.
 * @returns {Promise<void>} A promise that resolves when the package is built.
 * @throws {Error} If the build process fails.
 */
export async function buildPackage(packageInfo: PackageInfo) {
  packageInfo.status = "building"

  try {
    await execAsync("pnpm run build", { cwd: packageInfo.path })
    packageInfo.status = "built"
  } catch (error) {
    throw new Error(`Failed to build package ${packageInfo.name}: ${error}`)
  }
}

/**
 * Builds packages in parallel.
 *
 * @param packages - Array of packages to build.
 * @returns {Promise<void>} A promise that resolves when all packages are built.
 */
export async function buildPackagesParallel(packages: PackageInfo[]) {
  const buildPromises = packages
    .filter((pkg) => pkg.hasBuildScript)
    .map((pkg) => buildPackage(pkg))

  await Promise.all(buildPromises)
}
