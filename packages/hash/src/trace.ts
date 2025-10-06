import { existsSync, statSync } from "node:fs"
import { dirname, join, resolve } from "node:path"

export type CodePosition = {
  url: string
  line: number
  column: number
}

/**
 * Traces the code position at the specified call stack depth.
 *
 * @param depth the call stack depth to trace (default: 1).
 * @returns a CodePosition object containing URL, line, and column information.
 * @throws error if unable to parse the stack trace or
 * if the specified depth is out of bounds.
 */
export function tracePosition(depth = 1): CodePosition {
  const stack = new Error().stack
  if (!stack) throw new Error("unable to get mock error stack")

  const lines = stack.split("\n")

  // Skip the first line (Error message) and find the target line.
  // The stack format is typically:
  // Error:
  //     at FunctionName (file:///path/to/file.ts:line:column)
  //     at ...
  const targetLineIndex = depth + 1 // +1 to skip the error message line.
  if (targetLineIndex >= lines.length) {
    throw new Error(`stack depth(${depth}) out of bounds(${lines.length - 2})`)
  }

  const line = lines[targetLineIndex].trim()

  // Parse the stack trace line to extract URL, line, and column.
  // Common formats:
  // - "at FunctionName (file:///path/to/file.ts:line:column)"
  // - "at file:///path/to/file.ts:line:column"
  const match =
    line.match(/at\s+(?:.*\s+)?\((.*):(\d+):(\d+)\)/) ||
    line.match(/at\s+(.*):(\d+):(\d+)/)

  if (!match) throw new Error(`unable to parse stack trace line: ${line}`)
  const [_, url, lineStr, columnStr] = match
  return {
    url,
    line: parseInt(lineStr, 10),
    column: parseInt(columnStr, 10),
  }
}

/**
 * Detects the root directory of a package by looking for package.json.
 *
 * 1. The path may not exist, but it will also detect any existing parent dirs.
 * 2. The path may be a file or a dir, when file, just detect from its dir.
 * 3. Once path not provided, just detect from cwd.
 * 4. When completely not inside a package, just return undefined.
 *
 * @param path file or directory path, default to cwd.
 * @returns directory path where package.json locates, undefined if not found.
 */
export function detectPackageRoot(path?: string): string | undefined {
  const startPath = path ? resolve(path) : process.cwd()
  const searchPath =
    (existsSync(startPath) && statSync(startPath).isFile()) ||
    !existsSync(startPath)
      ? dirname(startPath)
      : startPath

  const packageJsonPath = join(searchPath, "package.json")
  if (existsSync(packageJsonPath) && statSync(packageJsonPath).isFile()) {
    return searchPath
  }
  const parentPath = dirname(searchPath)
  return parentPath !== searchPath ? detectPackageRoot(parentPath) : undefined
}
