# TypeScript Rules

## Module System

1. Use ESM, not CommonJS.
2. Use `.ts` extension.
3. `"type": "module"` in package.json.

## Type System

1. Enable strict mode.
2. Avoid `any`, use `unknown`.
3. Prefer `interface` over `type`.

## Import/Export

1. Use named exports.
2. Use import aliases from tsconfig.
3. Avoid circular dependencies.

## Code Style

1. 2-space indentation.
2. No semicolons.
3. Single quotes.
4. Arrow functions.
5. Prefer `const` over `let`.

## Functions

1. Keep functions small.
2. Max 3 parameters.
3. Return early.
4. Use default parameters.

## Comments

1. JSDoc for public APIs.
2. Explain purpose, not implementation.
3. Remove commented code.

## Best Practices

1. Use `readonly` for immutability.
2. Avoid side effects.
3. Use async/await.
