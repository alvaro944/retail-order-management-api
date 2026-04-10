# AGENTS.md

Operational guidance for future coding sessions in this repository.

## Read First

Before making changes, inspect these files in this order:

1. `README.md`
2. `docs/development-workflow.md`
3. `pom.xml`
4. `src/main/resources/application.yml`
5. `src/main/resources/application-test.yml`

If the task touches orders, also read:

- `src/main/java/com/alvaro/retail/order/service/OrderServiceImpl.java`
- `src/test/java/com/alvaro/retail/order/OrderControllerIntegrationTest.java`

## Current Project Status

Phase 5 is complete.

Implemented modules:

- `product`
- `customer`
- `inventory`
- `order`

Next planned phase:

- add OpenAPI and Swagger documentation without changing the established business flow unless explicitly requested

## Architecture Rules

- Keep the backend as a clean modular monolith.
- Use package root `com.alvaro.retail`.
- Each domain should follow the same package layout:
  - `controller`
  - `dto`
  - `entity`
  - `repository`
  - `service`
- Keep controllers thin and delegate all business logic to services.
- Prefer `JpaRepository` derived queries instead of custom `@Query` definitions unless there is a clear reason.
- Use `Long` identifiers for entities.
- Use JPA auditing with `createdAt` and `updatedAt`.
- Keep timestamps in UTC and serialize JSON dates in ISO-8601 format.
- Prefer plural `snake_case` table names.

## Established Business Rules

### Product

- Products use logical deletion through `active = false`.
- Reads only expose active products.
- SKU must be unique.
- A product with inventory cannot be deleted.

### Customer

- Customers use logical deletion through `active = false`.
- Reads only expose active customers.
- Email must be unique.

### Inventory

- There is a single inventory record per product.
- Inventory can only be created for active products.
- Decrease operations cannot drive stock below zero.
- Inventory responses are available both by inventory id and by product id.

### Order

- Orders support creation, query, and cancellation in the current phase.
- Order statuses are `CREATED` and `CANCELLED`.
- Only orders in `CREATED` can transition to `CANCELLED`.
- Each order item stores snapshot product data:
  - `productName`
  - `productSku`
  - `unitPrice`
- Order creation validates:
  - active customer
  - active products
  - non-empty item list
  - positive quantities
  - no duplicated product lines
  - inventory existence
  - sufficient stock
- Missing inventory for an otherwise valid product is treated as `409`, not `404`.
- Inventory is reduced inside the same transaction that creates the order.
- Cancelling an order restores inventory inside the same transaction.
- Cancelling an already cancelled order returns `409`.
- If any order line fails, nothing should be persisted.
- Order listing is sorted by `createdAt DESC, id DESC`.

## HTTP And Error Semantics

- Base path is `/api/v1`.
- Error responses use Spring `ProblemDetail`.
- `400`:
  - Bean Validation failures
  - request-shape or business rule violations represented as invalid request
- `404`:
  - inactive or missing customer
  - inactive or missing product
  - missing order
  - missing inventory during cancellation recovery
- `409`:
  - duplicate resource conflicts
  - stock conflicts
  - inventory business conflicts
  - repeated order cancellation

## Testing And Verification

Automated verification:

```bash
mvn clean verify
```

Useful focused test commands:

```bash
mvn test -Dtest=ProductControllerIntegrationTest
mvn test -Dtest=CustomerControllerIntegrationTest
mvn test -Dtest=InventoryControllerIntegrationTest
mvn test -Dtest=OrderControllerIntegrationTest
```

Manual API verification:

```bash
mvn "-Dspring-boot.run.profiles=test" "-Dspring-boot.run.useTestClasspath=true" spring-boot:run
```

Windows PowerShell notes:

- Prefer `Invoke-RestMethod` or `Invoke-WebRequest`.
- `Invoke-WebRequest` throws on `400`, `404`, and `409`; that is expected for negative scenarios.
- When validating an expected error, inspect `$_.ErrorDetails.Message` in the catch context to read the API payload.

## Git And Workspace Rules

- Use one branch per task or phase.
- Prefer worktrees for feature work so the main workspace can keep unrelated local changes.
- Do not overwrite or revert unrelated local user changes.
- Push the feature branch first.
- If the work is promoted to `main`, keep the feature branch unless the user explicitly asks to delete it.
- Update documentation when behavior, rules, or workflow expectations change.

## Recommended Codex Skill Flow

For future Codex sessions, these are the most useful skills for this repository:

- `retail-order-management-api-workflow`
  - default skill for any work in this repo
- `using-git-worktrees`
  - use before feature implementation to isolate the task
- `test-driven-development`
  - use for new behavior and bug fixes
- `systematic-debugging`
  - use before changing code in response to a failure
- `verification-before-completion`
  - use before claiming work is done
- `finishing-a-development-branch`
  - use when the user wants to merge, push, open a PR, or clean up the branch

## Good First Inspection Points By Task

- Product behavior: `product/service/ProductServiceImpl.java`
- Customer behavior: `customer/service/CustomerServiceImpl.java`
- Inventory behavior: `inventory/service/InventoryServiceImpl.java`
- Order behavior: `order/service/OrderServiceImpl.java`
- Error contract: `common/exception/GlobalExceptionHandler.java`
- Real API expectations: integration tests under `src/test/java/com/alvaro/retail`
