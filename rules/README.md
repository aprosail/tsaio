# Rules Directory

## Purpose

This directory contains coding standards and best practices for the tsaio project. These rules guide AI code generation tools to produce elegant, consistent code.

## Location

All rules are located in the project's `rules` directory at the root level. When users mention updating rules, they refer to modifying the markdown files in this directory.

## How It Works

1. Rules are written as markdown files in the `rules` directory.
2. Files are copied to AI tool config directories.
3. For folder-based tools: copy all files.
4. For file-based tools: concatenate content with `---` separators.

## File Organization

- Each file focuses on specific aspect
- Use clear, concise English
- Keep content brief to save tokens
- Update when adding new tools or practices

## Maintenance

- Add new rule files for new tools in the `rules` directory
- Update existing files in the `rules` directory when practices change
- Keep all files in sync
- Test rule application

## Updating Rules

When users request rule updates:

1. Locate the relevant markdown file in the `rules` directory.
2. Modify the content according to the user's requirements.
3. Ensure consistency across all rule files.
4. Run `pnpm format` and `pnpm review` to validate changes.

## Rule Conflict Resolution

When user requests conflict with existing rules:

1. Inform the user that the request conflicts with current rules.
2. Provide options to either:
   - Modify the rules to accommodate the request
   - Get explicit confirmation to proceed despite rule conflicts
3. Only proceed with rule-violating changes after user confirmation.
4. Update relevant rule files if user chooses to modify rules.
