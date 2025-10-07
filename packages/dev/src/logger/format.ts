/**
 * Log level enum.
 */
export enum LogLevel {
  debug = 0,
  info = 1,
  warn = 2,
  error = 3,
}

/**
 * ANSI color codes for terminal output.
 * Only use colors if stdout is a TTY.
 */
const supportsColor = process.stdout.isTTY

/**
 * Color constants for terminal output.
 */
export const Color = {
  // Reset codes
  reset: supportsColor ? "\x1b[39m" : "",
  resetAll: supportsColor ? "\x1b[0m" : "",
  dim: supportsColor ? "\x1b[2m" : "",
  resetDim: supportsColor ? "\x1b[22m" : "",

  // Basic colors
  gray: supportsColor ? "\x1b[90m" : "",
  red: supportsColor ? "\x1b[31m" : "",
  green: supportsColor ? "\x1b[32m" : "",
  yellow: supportsColor ? "\x1b[33m" : "",
  blue: supportsColor ? "\x1b[34m" : "",
  magenta: supportsColor ? "\x1b[35m" : "",
  cyan: supportsColor ? "\x1b[36m" : "",
  white: supportsColor ? "\x1b[37m" : "",

  // Bright colors
  brightRed: supportsColor ? "\x1b[91m" : "",
  brightGreen: supportsColor ? "\x1b[92m" : "",
  brightYellow: supportsColor ? "\x1b[93m" : "",
  brightBlue: supportsColor ? "\x1b[94m" : "",
  brightMagenta: supportsColor ? "\x1b[95m" : "",
  brightCyan: supportsColor ? "\x1b[96m" : "",
  brightWhite: supportsColor ? "\x1b[97m" : "",

  // Background colors
  bgRed: supportsColor ? "\x1b[41m" : "",
  bgGreen: supportsColor ? "\x1b[42m" : "",
  bgYellow: supportsColor ? "\x1b[43m" : "",
  bgBlue: supportsColor ? "\x1b[44m" : "",
  bgMagenta: supportsColor ? "\x1b[45m" : "",
  bgCyan: supportsColor ? "\x1b[46m" : "",
  bgWhite: supportsColor ? "\x1b[47m" : "",
} as const

/**
 * Predefined color schemes for log levels.
 */
export const LogColors = {
  debug: Color.blue,
  info: Color.green,
  warn: Color.yellow,
  error: Color.red,
  success: Color.green,
} as const

/**
 * Color constants for formatting (backward compatibility).
 */
const color = {
  reset: Color.reset,
  resetAll: Color.resetAll,
  dim: Color.dim,
  resetDim: Color.resetDim,
  gray: Color.gray,
  red: Color.red,
  green: Color.green,
  yellow: Color.yellow,
  blue: Color.blue,
}

/**
 * Format a log message with timestamp and colored level tag.
 * @param level - The log level string.
 * @param colorCode - The ANSI color code.
 * @param args - The message arguments.
 * @returns Formatted log message.
 */
export function formatMessage(
  level: string,
  colorCode: string,
  ...args: any[]
): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  const w = now.getDay() // 0 = Sunday, 6 = Saturday
  const h = String(now.getHours()).padStart(2, "0")
  const min = String(now.getMinutes()).padStart(2, "0")
  const sec = String(now.getSeconds()).padStart(2, "0")
  const ms = String(now.getMilliseconds()).padStart(3, "0")

  const timestamp = `${y}.${m}.${d}(${w}) ${h}:${min}:${sec}.${ms}`
  const levelTag =
    `${color.dim}[${color.resetDim}` +
    `${colorCode}${level}${color.reset}` +
    `${color.dim}]${color.resetDim}`

  const message = args
    .map((arg) =>
      typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg),
    )
    .join(" ")

  return `${color.gray}${timestamp}${color.reset} ${levelTag} ${message}\n`
}
