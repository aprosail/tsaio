import type { PackageInfo } from "./types.js"

/**
 * Performs topological sort on packages based on dependencies.
 *
 * @param packages - Array of packages to sort.
 */
export function topologicalSort(packages: PackageInfo[]) {
  const visited = new Set<string>()
  const result: PackageInfo[] = []

  function visit(pkg: PackageInfo) {
    if (visited.has(pkg.name)) return

    visited.add(pkg.name)

    // Build dependent packages first.
    for (const depName of pkg.dependencies) {
      const depPackage = packages.find((p) => p.name === depName)
      if (depPackage && !visited.has(depName)) {
        visit(depPackage)
      }
    }

    result.push(pkg)
  }

  for (const pkg of packages) {
    if (!visited.has(pkg.name)) {
      visit(pkg)
    }
  }

  return result
}
