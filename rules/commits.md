# Git Commit Rules

## When to Commit

1. After completing a logical unit of work.
2. When code passes all tests and checks.
3. After running `pnpm format` and `pnpm review`.
4. For small, focused changes.
5. Before switching to different tasks.

## Conventional Commits

1. Use conventional commit format.
2. Format: `<type>[optional scope]: <description>`.
3. Use present tense ("add feature" not "added feature").
4. Use imperative mood ("move cursor to..." not "moves cursor to...").

## Commit Types

1. `feat`: New feature.
2. `fix`: Bug fix.
3. `docs`: Documentation changes.
4. `style`: Code style changes (formatting, missing semicolons, etc).
5. `refactor`: Code refactoring.
6. `test`: Adding or modifying tests.
7. `chore`: Maintenance tasks.

## Commit Method

1. Use command line for commits.
2. Command: `git commit -m "type: description"`.
3. Use body for detailed explanation if needed.
4. Reference issues and pull requests.

## Best Practices

1. Commit often, small changes.
2. One logical change per commit.
3. Test before committing.
4. Review changes before commit.
