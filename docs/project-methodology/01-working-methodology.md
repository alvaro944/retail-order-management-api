# Working Methodology

## 1. Core Idea

The main methodology of this project was to treat it as a sequence of controlled deliveries rather than as a single long build.

That choice changed everything:

- work was broken into phases
- each phase had a clear responsibility
- branches reflected scope
- architecture was protected from rushed decisions
- testing and documentation were treated as part of completion
- the project kept moving forward without becoming chaotic

This was not just “building an API”. It was practicing a professional way of building software.

## 2. The Main Working Loop

The project followed a repeated loop:

1. Understand the current state of the project.
2. Define the smallest meaningful next phase.
3. Create or use a dedicated branch for that phase.
4. Implement only that scope.
5. Validate automatically.
6. Validate manually.
7. Update documentation when behavior or workflow changed.
8. Push the feature branch first.
9. Promote to `main` only once the phase was genuinely closed.

That loop is simple, but it prevents many common solo-project failures:

- building too much at once
- mixing unrelated changes
- forgetting how the project evolved
- ending up with a repo that works but tells no engineering story

## 3. Phase-First Execution

The project was intentionally split into named phases rather than vague “iterations”.

That provided:

- a roadmap
- a natural branching strategy
- a way to decide what belongs now vs later
- a way to keep momentum visible
- a narrative for the repository history

Examples of the phase mindset:

- first bootstrap the project
- then add products
- then customers
- then inventory
- then orders
- then order cancellation
- then OpenAPI
- then security
- then Docker
- then CI
- then testing hardening
- then frontend and portfolio polish

This avoided the trap of starting with advanced ideas too early, such as:

- complex user management
- unnecessary architecture layers
- premature microservices
- overdesigned frontend
- speculative features

## 4. Scope Control

One of the strongest parts of the methodology was scope discipline.

The rule was not “do as little as possible”.

The rule was:

- do the current phase well
- do not drag future phases into the present one
- if a concern belongs later, name it and postpone it consciously

This matters because solo projects often fail by accumulation:

- one more feature
- one more refactor
- one more UI system
- one more auth mode
- one more deployment variant

The project stayed coherent because scope was deliberately constrained.

## 5. Branching Strategy

The repository used a branch-per-task or branch-per-phase model.

Typical pattern:

- `codex/phase-0-bootstrap`
- `codex/phase-1-products`
- `codex/phase-4-orders`
- `codex/phase-7b-security-jwt-protection`
- `codex/phase-11-stitch`

Why this worked:

- branch names documented intent
- each branch had a clear review boundary
- changes were easier to reason about
- the git history told the story of the project
- merging back to `main` became a genuine close-out step

The branch naming was not cosmetic. It was part of the methodology.

## 6. Worktrees As Isolation

Git worktrees were used to isolate work without disturbing the main workspace.

This is a big methodological step up from casual branch switching because it allows:

- keeping `main` stable
- having separate task workspaces
- reducing accidental interference
- maintaining local context for multiple efforts
- protecting ongoing work from unrelated changes

This is especially useful in AI-assisted development, where the agent can work in a scoped environment and the human can keep another workspace open without collisions.

## 7. Definition Of Done

A phase was not considered done when the code existed.

A phase was done only when all of this was true:

- the intended behavior was implemented
- automated verification passed
- relevant manual checks were done
- documentation was aligned
- the branch was in a clean state
- the scope matched the phase

This is a much stronger definition of done than:

- “it compiles”
- “the happy path works”
- “I think it’s finished”

It creates trust in the result.

## 8. Manual Verification As Real Work

Manual testing was treated as part of engineering, not as optional polish.

This is one of the most important lessons of the project.

Automated tests gave confidence in repeatable behavior.
Manual checks verified:

- actual request/response flow
- auth behavior
- Swagger availability
- negative cases
- deployment-like conditions
- portfolio presentation quality

In other words:

- tests proved correctness
- manual checks proved reality

Both were needed.

## 9. Documentation As Operational Memory

Documentation was updated not just to explain the software, but to preserve working agreements.

Different files had different responsibilities:

- `README.md`
  Public project understanding, setup, roadmap, deployment, and high-level behavior.

- `AGENTS.md`
  Project rules for future coding sessions, including conventions, business rules, and recommended inspection order.

- `docs/development-workflow.md`
  Explicit workflow agreement: branches, validation, manual testing, and repo discipline.

- `docs/future-improvements.md`
  Backlog preservation without reopening scope now.

This is important because methodology becomes fragile when it only lives in memory.

## 10. Portfolio Mindset Without Faking Product Maturity

The project was treated as a portfolio project, but not as a fake startup product.

That led to a healthier presentation strategy:

- real API behavior
- realistic business rules
- seeded demo data
- polished UI
- deployment awareness
- calm, credible framing

Not:

- inflated product branding
- invented roles or features
- overclaiming production maturity
- decorative complexity

This is an important methodological lesson: portfolio quality is not exaggeration. It is clarity, consistency, and evidence.

## 11. What Made The Workflow Strong

The strongest parts of the working methodology were:

- small, phase-bound scope
- branch-per-task discipline
- worktree isolation
- explicit verification
- documentation updates during the project
- consistent architecture rules
- careful use of AI with constraints rather than blind delegation
- honest close-out and merge discipline

## 12. What To Reuse In Future Projects

If this methodology is reused elsewhere, keep these parts by default:

- define phases before implementing too much
- create one branch per meaningful scope
- use worktrees when the project grows
- treat manual verification as required
- keep architecture rules written down
- keep an AI instruction file or project playbook
- make documentation part of the phase close-out
- publish only after the project is genuinely coherent, not just “done enough”
