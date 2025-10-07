import { removePrefix, removeSuffix } from "@/utils.js"
import { existsSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"

/**
 * Parse path mapping to aliases.
 *
 * Converts TypeScript path mapping configuration to a simple alias-to-path mapping.
 * Handles removal of /* suffixes from both keys and values, and resolves relative
 * paths to absolute paths based on the working directory.
 *
 * @param paths - The paths object from tsconfig compilerOptions
 * @param workingDir - The working directory for resolving relative paths
 * @returns Record of alias to absolute path mappings
 */
function parsePathsToAliases(
  paths: any,
  workingDir: string,
): Record<string, string> {
  if (!paths || typeof paths !== "object") return {}

  const aliases: Record<string, string> = {}
  for (const [key, value] of Object.entries(paths)) {
    if (!Array.isArray(value) || value.length === 0) continue
    aliases[removeSuffix(key, "/*")] = resolve(
      workingDir,
      removePrefix(removeSuffix(value[0], "/*"), "./"),
    )
  }
  return aliases
}

/**
 * Load tsconfig from file path, object, or auto detect.
 *
 * Supports three modes of loading TypeScript configuration:
 * 1. File path: Reads and parses a tsconfig.json file from the given path
 * 2. Object: Uses the provided configuration object directly
 * 3. Auto detect: Looks for tsconfig.json in the working directory
 *
 * @param tsconfig - tsconfig filepath or object, undefined means auto detect
 * @param workingDir - current working directory for file operations
 * @returns Parsed tsconfig object, or null if file not found or invalid
 */
function loadTsconfig(
  tsconfig: string | object | undefined,
  workingDir: string,
): any {
  if (typeof tsconfig === "string") {
    // If file path is provided, read the file.
    const tsconfigPath = resolve(workingDir, tsconfig)
    if (!existsSync(tsconfigPath)) return null
    const content = readFileSync(tsconfigPath, "utf-8")
    return JSON.parse(content)
  } else if (typeof tsconfig === "object" && tsconfig !== null) {
    // If object is provided, use it directly.
    return tsconfig
  }

  // Auto detect tsconfig.json.
  const tsconfigPath = join(workingDir, "tsconfig.json")
  if (!existsSync(tsconfigPath)) return null
  const content = readFileSync(tsconfigPath, "utf-8")
  return JSON.parse(content)
}

/**
 * Parse tsconfig aliases from filepath, object or auto detect.
 *
 * When tsconfig not provided, it will try to find tsconfig.json
 * in current working directory. And it won't try to find in
 * any further parent directories. Once not found, it will return
 * an empty record object.
 *
 * @param tsconfig tsconfig filepath or object, undefined means auto detect.
 * @param cwd current working directory, undefined means process.cwd().
 * @returns map of aliases, to use in bundlers such as rollup.
 */
export function parseTsconfigAliases(
  tsconfig?: string | object,
  cwd?: string,
): Record<string, string> {
  const workingDir = cwd || process.cwd()
  const tsconfigObj = loadTsconfig(tsconfig, workingDir)

  if (!tsconfigObj) return {}

  const paths = tsconfigObj.compilerOptions?.paths
  return parsePathsToAliases(paths, workingDir)
}
