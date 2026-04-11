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
- Update Markdown documentation when business rules, API behavior, or workflow expectations change.

## Read Order For Future Chats

When a future coding session starts, the minimum context pass should be:

1. `README.md`
2. `AGENTS.md`
3. `docs/development-workflow.md`
4. relevant module service and integration test files

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

Preferred close-out behavior:

- push the feature branch first
- keep the feature branch after promoting the same commit to `main` unless explicitly asked to delete it
- avoid working directly on `main`

## Validation Checklist

Before committing:

- Ensure the code compiles.
- Run `mvn clean verify`.
- Review changed files for unnecessary edits.

Before merging:

- Test the main scenario manually.
- Verify the expected request and response flow if an endpoint was added or changed.
- Confirm README or technical docs are updated when needed.
- If a branch is promoted to `main`, keep the feature branch unless cleanup was explicitly requested.

## Manual Testing Guidance

Manual testing should be visible in the workflow, especially for portfolio-quality changes.

Examples:

- Start the app locally with the appropriate profile.
- For manual HTTP checks with the `test` profile, use Maven with the test classpath enabled:
  `mvn "-Dspring-boot.run.profiles=test" "-Dspring-boot.run.useTestClasspath=true" spring-boot:run`
- Use the packaged jar with the `dev` profile rather than the `test` profile.
- Call the endpoint with Postman, curl, or Swagger when available.
- On Windows PowerShell, prefer `Invoke-WebRequest` or call `curl.exe` explicitly. Plain `curl` is usually an alias to `Invoke-WebRequest`, so Unix-style flags such as `-X`, `-H`, and `-d` can fail unexpectedly.
- Verify status code, response body, and basic error behavior.
- When Swagger is available, confirm both the UI and the OpenAPI JSON document load from the expected URLs.
- Capture any relevant notes for the commit, PR, or documentation.

For Phase 1, the minimum manual flow is:

- check `GET /api/v1/health`
- create a product
- list products
- fetch one product by id
- update that product
- delete it logically
- confirm a later `GET` returns `404`
- verify one invalid payload returns `400`
- verify one duplicate SKU returns `409`

For Phase 2, the minimum manual flow is:

- check `GET /api/v1/health`
- create a customer
- list customers
- fetch one customer by id
- update that customer
- delete it logically
- confirm a later `GET` returns `404`
- verify one duplicate email returns `409`
- verify one invalid payload returns `400`

For Phase 3, the minimum manual flow is:

- check `GET /api/v1/health`
- create a product
- create inventory for that product
- list inventories
- fetch inventory by id
- fetch inventory by product id
- update minimum stock
- increase stock
- verify a decrease below zero returns `409`
- verify deleting a product with inventory returns `409`

For Phase 4, the minimum manual flow is:

- check `GET /api/v1/health`
- create a customer
- create a product
- create inventory for that product
- create an order
- fetch that order by id
- list orders
- verify inventory was reduced
- verify insufficient stock returns `409`
- verify a missing product returns `404`
- verify duplicated products in one order return `400`

For Phase 5, the minimum manual flow is:

- check `GET /api/v1/health`
- create a customer
- create a product
- create inventory for that product
- create an order
- verify inventory was reduced
- cancel that order
- fetch the order by id and confirm status `CANCELLED`
- verify inventory returned to its original value
- verify cancelling the same order again returns `409`
- verify cancelling a missing order returns `404`

For Phase 6, the minimum manual flow is:

- start the app with the `test` profile
- open `http://localhost:8080/api/v1/swagger-ui/index.html`
- open `http://localhost:8080/api/v1/v3/api-docs`
- confirm the Swagger UI shows `product`, `customer`, `inventory`, and `order`
- confirm `POST /orders/{id}/cancel` is documented
- confirm the OpenAPI JSON exposes the same modules and documentation endpoints without changing business routes

For Phase 7A, the minimum manual flow is:

- start the app with the `test` profile
- open `http://localhost:8080/api/v1/swagger-ui/index.html`
- open `http://localhost:8080/api/v1/v3/api-docs`
- call `POST /api/v1/auth/login` and store the bearer token
- call `GET /api/v1/auth/me` with `Authorization: Bearer <token>`
- verify `GET /api/v1/auth/me` without a token returns `401`
- verify `GET /api/v1/auth/me` with an invalid token returns `401`
- verify `GET /api/v1/health` still returns `200` without authentication
- verify at least one existing business endpoint such as `GET /api/v1/products` remains public in Phase 7A

For Phase 7B, the minimum manual flow is:

- start the app with the `test` profile
- open `http://localhost:8080/api/v1/swagger-ui/index.html`
- open `http://localhost:8080/api/v1/v3/api-docs`
- call `POST /api/v1/auth/login` and store the bearer token
- call `GET /api/v1/auth/me` with `Authorization: Bearer <token>`
- verify `GET /api/v1/products` without a token returns `401`
- verify `GET /api/v1/products` with `Authorization: Bearer <token>` returns `200`
- verify `GET /api/v1/auth/me` with an invalid token returns `401`
- verify `GET /api/v1/health` still returns `200` without authentication
- use Swagger UI `Authorize` with the same bearer token and verify at least one business operation succeeds

PowerShell note:

- A `404`, `409`, or `400` response from `Invoke-WebRequest` is surfaced as an exception. Treat that as expected when you are deliberately testing error scenarios, and inspect the response details instead of assuming the API failed to execute.

Helpful PowerShell pattern for negative checks:

```powershell
try {
  Invoke-WebRequest -Uri "http://localhost:8080/api/v1/orders" -Method POST -ContentType "application/json" -Body $body
} catch {
  $_.ErrorDetails.Message
}
```

## Initial Commit Strategy

For early phases, prefer sequences like:

1. Project bootstrap
2. Configuration and profiles
3. Documentation
4. Module scaffolding

This keeps the history easy to read and useful in interviews.

## Documentation Expectations

When a phase changes the effective behavior of the system, update at least:

- `README.md` for public project understanding
- `AGENTS.md` for future AI-assisted sessions
- `docs/development-workflow.md` when the working agreement changes
