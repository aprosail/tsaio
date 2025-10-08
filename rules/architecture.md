# Architecture Rules

## Project Structure

1. Monorepo with pnpm workspace.
2. Small, focused packages.
3. Clear package boundaries.
4. Avoid circular dependencies.

## Package Design

1. Single responsibility per package.
2. Semantic versioning.
3. Export only public APIs.
4. Minimal dependencies.

## Code Organization

1. Use barrel exports (index.ts).
2. Group related functionality.
3. Clear file naming.
4. Separate concerns.

## Build System

1. TypeScript for type safety.
2. Rolldown for bundling.
3. Generate type definitions.
4. Tree shaking for optimal bundles.

## Development Workflow

1. Use git for version control.
2. Run tests before commits.
3. Use automated CI/CD.
4. Document changes in CHANGELOG.
