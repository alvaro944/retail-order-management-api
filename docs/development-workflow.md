# Development Workflow

This project should evolve in a controlled and professional way. The goal is not only to build features, but also to show a clean engineering process in the repository history.

## Core Rules

- Work in small, incremental changes.
- Use a separate branch for each task, feature, or phase.
- Prefer one clear responsibility per branch.
- Make small commits with meaningful messages.
- Validate every change with automated checks.
- Manually test every user-facing or API behavior before considering the task complete.
- Do not push unfinished work to the main branch.

## Branching Convention

Recommended branch format:

```text
codex/<scope>-<short-description>
```

Examples:

```text
codex/phase-0-bootstrap
codex/product-module
codex/order-create-flow
```

## Validation Checklist

Before committing:

- Ensure the code compiles.
- Run `mvn clean verify`.
- Review changed files for unnecessary edits.

Before merging:

- Test the main scenario manually.
- Verify the expected request and response flow if an endpoint was added or changed.
- Confirm README or technical docs are updated when needed.

## Manual Testing Guidance

Manual testing should be visible in the workflow, especially for portfolio-quality changes.

Examples:

- Start the app locally with the appropriate profile.
- Call the endpoint with Postman, curl, or Swagger when available.
- Verify status code, response body, and basic error behavior.
- Capture any relevant notes for the commit, PR, or documentation.

## Initial Commit Strategy

For early phases, prefer sequences like:

1. Project bootstrap
2. Configuration and profiles
3. Documentation
4. Module scaffolding

This keeps the history easy to read and useful in interviews.
