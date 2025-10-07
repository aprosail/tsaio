/**
 * Package information interface.
 */
export interface PackageInfo {
  /** Package name from package.json */
  name: string

  /** Absolute path to the package directory */
  path: string

  /** Whether the package has a build script */
  hasBuildScript: boolean

  /** List of workspace dependencies (only "@tsaio" packages) */
  dependencies: string[]

  /** Current build status of the package */
  status: "pending" | "building" | "built"
}

/**
 * Workspace configuration interface.
 */
export interface WorkspaceConfig {
  packages: string[]
}
