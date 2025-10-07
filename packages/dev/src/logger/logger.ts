import { formatMessage, LogColors, LogLevel } from "@/logger/format"
import { stdout } from "node:process"

/**
 * Simple logger class with colored output using ANSI codes.
 */
export class Logger {
  private level: LogLevel

  /**
   * Create a new logger instance.
   * @param level - The initial log level.
   */
  constructor(level: LogLevel = LogLevel.info) {
    this.level = level
  }

  /**
   * Set the log level.
   * @param level - The log level to set.
   */
  setLevel(level: LogLevel) {
    this.level = level
  }

  /**
   * Log debug message.
   * @param args - The message arguments.
   */
  debug(...args: any[]) {
    if (this.level <= LogLevel.debug) {
      stdout.write(formatMessage(">", LogColors.debug, ...args))
    }
  }

  /**
   * Log info message.
   * @param args - The message arguments.
   */
  info(...args: any[]) {
    if (this.level <= LogLevel.info) {
      stdout.write(formatMessage("i", LogColors.info, ...args))
    }
  }

  /**
   * Log warning message.
   * @param args - The message arguments.
   */
  warn(...args: any[]) {
    if (this.level <= LogLevel.warn) {
      stdout.write(formatMessage("!", LogColors.warn, ...args))
    }
  }

  /**
   * Log error message.
   * @param args - The message arguments.
   */
  error(...args: any[]) {
    if (this.level <= LogLevel.error) {
      stdout.write(formatMessage("x", LogColors.error, ...args))
    }
  }

  /**
   * Log success message.
   * @param args - The message arguments.
   */
  success(...args: any[]) {
    if (this.level <= LogLevel.info) {
      stdout.write(formatMessage("v", LogColors.success, ...args))
    }
  }
}
