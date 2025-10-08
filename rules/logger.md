# Logger Rules

## Logger Usage Strategy

### Core Principles

1. **Minimal Terminal Output**: Avoid unnecessary console output in production code
2. **Structured Logging**: Use appropriate logging tools for different contexts
3. **Error-First Diagnostics**: Provide clear error messages instead of verbose logging

### Logger Implementation

#### @tsaio/dev Package

1. **Use Built-in Logger**: Directly use the logger provided by `@tsaio/dev`
2. **Import Pattern**: `import { logger } from "@tsaio/dev"`
3. **Available Methods**:
   - `logger.debug(...args)` - Debug messages (blue, level 0)
   - `logger.info(...args)` - Info messages (green, level 1)
   - `logger.warn(...args)` - Warning messages (yellow, level 2)
   - `logger.error(...args)` - Error messages (red, level 3)
   - `logger.success(...args)` - Success messages (green, level 1)
4. **Level Control**: Use `logger.setLevel(LogLevel)` to control verbosity

#### Examples Directory

1. **Use Pino**: Use pino for structured logging in examples
2. **Installation**: Add pino as dependency when needed
3. **Configuration**: Configure pino for appropriate log levels
4. **Structured Output**: Leverage pino's JSON formatting for better log analysis

### Usage Guidelines

#### When to Use Logger

1. **Development Tools**: Use in build tools, CLI utilities, and development scripts
2. **Build Process**: Log build progress and status information
3. **Configuration Loading**: Log configuration issues and warnings
4. **Error Context**: Provide additional context for error conditions

#### When to Avoid Logger

1. **Library Code**: Avoid logging in library implementations
2. **Production Runtime**: Minimize logging in production code paths
3. **Performance Critical**: Avoid logging in performance-sensitive code
4. **User-Facing APIs**: Use clear error messages instead of logs

### Error Handling Strategy

1. **Throw Clear Errors**: Use descriptive error messages with context
2. **Avoid Silent Failures**: Always handle errors appropriately
3. **Structured Error Objects**: Use Error subclasses for different error types
4. **Error Recovery**: Log only when recovery or debugging is needed

### Best Practices

1. **Consistent Level Usage**:
   - `debug`: Detailed debugging information
   - `info`: General operational information
   - `warn`: Warning conditions that don't prevent operation
   - `error`: Error conditions that affect operation

2. **Avoid Console Statements**:
   - Never use `console.log` in production code
   - Use `console` only in development scripts if needed
   - Remove debug console statements before committing

3. **Performance Considerations**:
   - Use conditional logging to avoid unnecessary string formatting
   - Consider log level impact on performance
   - Use structured logging for better analysis

4. **Testing**:
   - Mock logger in unit tests
   - Test error conditions without relying on logs
   - Verify log output in integration tests when necessary
