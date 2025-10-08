# Testing Rules

## Test Structure

1. Use Vitest.
2. `.test.ts` files next to source.
3. One assertion per test.
4. Test success and failure cases.

## Test Organization

1. Use `describe` for grouping.
2. Mock external dependencies.
3. Test public APIs only.
4. Use `vi` mock tools for filesystem.

## Test Quality

1. Test behavior, not implementation.
2. Use meaningful test data.
3. Keep tests fast and isolated.
4. Mock filesystem when needed.

## Best Practices

1. Test edge cases.
2. Use snapshot testing for complex outputs.
3. Test error handling.
4. Run tests before committing.
