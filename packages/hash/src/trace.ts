import { removePrefix } from "@tsaio/utils"
import { createHash } from "node:crypto"
import { existsSync, statSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"

export type CodePosition = {
  url: string
  line: number
  column: number
}

/**
 * Traces the code position at the specified call stack depth.
 * The default depth will trace where this function is called.
 *
 * @param depth the call stack depth to trace (default: 2).
 * @returns a CodePosition object containing URL, line, and column information.
 * @throws error if unable to parse the stack trace or
 * if the specified depth is out of bounds.
 */
export function tracePosition(depth = 2): CodePosition {
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
 * 1. If the path is a URL (starts with http:// or https://), returns undefined.
 * 2. The path may not exist, but it will also detect any existing parent dirs.
 * 3. The path may be a file or a dir, when file, just detect from its dir.
 * 4. Once path not provided, just detect from cwd.
 * 5. When completely not inside a package, just return undefined.
 *
 * @param path file or directory path, default to cwd.
 * @returns directory path where package.json locates, undefined if not found.
 */
export function detectPackageRoot(path?: string): string | undefined {
  if (path && (path.startsWith("http://") || path.startsWith("https://"))) {
    return undefined
  }

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

/**
 * Hash code (hex) of where this function is called.
 * The hash value is hashed from traced {@link CodePosition} object data.
 * If the URL is a file path within a package, uses relative path to package root.
 *
 * @param length the length of the hash code (default: 16).
 * @param algorithm the hashing algorithm to use (default: "sha256").
 * @returns a hex string of the hash code.
 */
export function hashPosition(length = 16, algorithm = "sha256"): string {
  const position = tracePosition()
  const hash = createHash(algorithm)

  let urlToHash = position.url
  const packageRoot = detectPackageRoot(position.url)
  if (packageRoot && position.url.startsWith("file://")) {
    const filePath = removePrefix(position.url, "file://")
    const relativePath = relative(packageRoot, filePath)
    urlToHash = relativePath
  }

  hash.update(urlToHash)
  hash.update(new Uint8Array(new Uint32Array([position.line]).buffer))
  hash.update(new Uint8Array(new Uint32Array([position.column]).buffer))

  return hash.digest("hex").slice(0, length)
}
