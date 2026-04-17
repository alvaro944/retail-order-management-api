# Checklists And Templates

This file turns the project methodology into reusable operating material for future projects.

## 1. Session Start Checklist

Use this at the beginning of a serious coding session:

- Read `README.md`.
- Read the project workflow or internal playbook.
- Read the AI/session rules file if the project has one.
- Check current branch.
- Check current git status.
- Confirm whether the workspace is clean or intentionally dirty.
- Identify the smallest meaningful next scope.
- Decide whether a new branch or worktree is needed.
- Inspect the exact files that govern the area you are about to change.

## 2. Task Kickoff Template

Use this to frame the next task:

```text
Task:
<short description>

Goal:
<what should exist or behave differently after this task>

Phase:
<current phase or subphase>

In scope:
- ...
- ...

Out of scope:
- ...
- ...

Files to inspect first:
- ...
- ...

Verification:
- automated:
- manual:
```

## 3. Branch Naming Template

Recommended format:

```text
codex/<scope>-<short-description>
```

Examples:

```text
codex/phase-1-products
codex/phase-5-order-lifecycle
codex/auth-hardening
codex/frontend-polish
```

## 4. Worktree Decision Checklist

Use a worktree when:

- `main` already has local changes
- you want strict isolation
- a task is large enough to deserve a dedicated workspace
- multiple efforts are active in parallel
- you want safer merge or close-out behavior

## 5. Before Commit Checklist

- Scope is still aligned with the task.
- No unrelated files were modified accidentally.
- Naming and architecture still match project conventions.
- Documentation impact has been considered.
- Automated verification has been run fresh.
- Manual verification has been run if behavior changed.
- The commit message matches the real change.

## 6. Before Merge Checklist

- Feature branch is pushed.
- The change has a clear close-out state.
- Local verification passed.
- Manual flow was checked when relevant.
- Docs are updated if setup, behavior, or process changed.
- Merge strategy is intentional.
- Local `main` or base branch is clean.

## 7. AI-Assisted Session Checklist

- Provide repository context early.
- Make the AI inspect before editing.
- Keep one meaningful scope per task.
- Require verification before completion claims.
- Prevent destructive git operations by default.
- Preserve user changes unless explicitly asked otherwise.
- Ask for a summary of what changed and what was verified.

## 8. Backend Feature Checklist

Use this for each new backend behavior:

- endpoint contract defined
- service behavior defined
- error semantics defined
- integration with existing modules checked
- automated tests added or updated
- manual API flow tested
- Swagger/OpenAPI impact checked if relevant
- documentation updated

## 9. Frontend Feature Checklist

Use this for each frontend improvement:

- backend contract already exists or is clearly defined
- loading, success, empty, and error states considered
- copy is realistic and useful
- the UI does not invent unsupported behavior
- responsive behavior is acceptable
- visual changes match the existing language of the app
- automated frontend checks pass
- manual UI pass is done

## 10. Portfolio Readiness Checklist

- README explains the project clearly
- the repo structure looks coherent
- the main branch represents a clean, strong state
- deployment instructions are documented
- demo credentials or seeded data are available when appropriate
- screenshots or live demo show the core flows clearly
- there is an honest explanation of what the project does
- future ideas are preserved in a backlog instead of being stuffed into the current version

## 11. Suggested Completion Template

Use a final summary like this:

```text
What changed:
- ...
- ...

What was verified:
- ...
- ...

Notes:
- ...
```

This keeps close-out honest and easy to scan.

## 12. Next Project Starter Template

For the next serious project, create these early:

- `README.md`
- `AGENTS.md` or equivalent project rules file
- `docs/development-workflow.md`
- one architecture rules document
- one future-improvements or backlog file

That small investment gives the project much stronger long-term shape.
