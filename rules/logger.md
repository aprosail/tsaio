# Logger Rules

## Logger Usage Strategy

### Core Principles

1. **Minimal Terminal Output**: Avoid unnecessary console output in production code.
2. **Structured Logging**: Use appropriate logging tools for different contexts.
3. **Error-First Diagnostics**: Provide clear error messages instead of verbose logging.

### Logger Implementation

#### @tsaio/dev Package

1. **Use Built-in Logger**: Directly use the logger provided by `@tsaio/dev`.
2. **Import Pattern**: `import { logger } from "@tsaio/dev"`.
3. **Available Methods**:
   - `logger.debug(...args)` - Debug messages (blue, level 0)
   - `logger.info(...args)` - Info messages (green, level 1)
   - `logger.warn(...args)` - Warning messages (yellow, level 2)
   - `logger.error(...args)` - Error messages (red, level 3)
   - `logger.success(...args)` - Success messages (green, level 1)
4. **Level Control**: Use `logger.setLevel(LogLevel)` to control verbosity.

#### Examples Directory

1. **Use Pino**: Use pino for structured logging in examples.
2. **Installation**: Add pino as dependency when needed.
3. **Configuration**: Configure pino for appropriate log levels.
4. **Structured Output**: Leverage pino's JSON formatting for better log analysis.

### Usage Guidelines

1. **Use Logger For**: Development tools, build processes, configuration loading, error context.
2. **Avoid Logger For**: Library code, production runtime, performance-critical code, user-facing APIs.

### Error Handling

1. **Error Strategy**: Throw clear errors, avoid silent failures, use structured error objects.
2. **Recovery**: Log only when recovery or debugging is needed.

### Best Practices

1. **Level Usage**: Use debug for details, info for operations, warn for issues, error for failures.
2. **Console Avoidance**: Never use console.log in production, remove debug statements.
3. **Performance**: Use conditional logging, consider level impact, prefer structured logging.
4. **Testing**: Mock logger in tests, verify output when necessary.
