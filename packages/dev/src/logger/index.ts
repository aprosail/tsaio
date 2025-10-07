import { Logger } from "@/logger/logger"
export { LogLevel } from "@/logger/format"
export { Logger } from "@/logger/logger"

/**
 * Default logger instance with colored output support.
 *
 * Available methods:
 * - `logger.debug(...args)` - Debug messages (blue, level 0)
 * - `logger.info(...args)` - Info messages (green, level 1)
 * - `logger.warn(...args)` - Warning messages (yellow, level 2)
 * - `logger.error(...args)` - Error messages (red, level 3)
 * - `logger.success(...args)` - Success messages (green, level 1)
 *
 * Use `logger.setLevel(LogLevel)` to control output verbosity.
 */
export const logger = new Logger()
