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
3. Use `@/` prefix for src directory imports.
4. Do not add file extensions like `.js`, `.ts`, `.tsx` to import paths.
5. Use named imports for Node.js built-in modules with `node:` prefix.
6. Avoid circular dependencies.

```typescript
// Good - using alias, no extension, named imports
import { utils } from "@/utils"
import { format } from "@/utils/format"
import { logger } from "@tsaio/dev"
import { readFileSync } from "node:fs"
import { join } from "node:path"

// Bad - relative paths, extensions, or default imports
import { utils } from "./utils.ts"
import { format } from "../utils/format.js"
import fs from "node:fs"
import fs from "fs"
```

Cross-package imports should use published package names, not relative paths. Use exact package names as defined in package.json and avoid importing from package internals.

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
