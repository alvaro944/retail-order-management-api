# Retail Order Management API

Backend API for managing products, customers, inventory, and orders in a retail environment. The project is designed as a clean modular monolith with a phased roadmap, making it suitable both for learning and as a strong backend portfolio piece.

## Current Status

Phase 5 is implemented:

- Spring Boot 3 + Java 21 + Maven bootstrap
- Modular package structure by domain
- PostgreSQL configuration for local development
- `dev` and `test` profiles
- UTC and ISO-8601 date/time defaults
- Technical health endpoint at `/api/v1/health`
- Product catalog module with create, read, update, and logical delete
- Customer management module with create, read, update, and logical delete
- Inventory module with one current-stock record per active product
- Manual stock adjustments with increase and decrease operations
- Minimum stock management and product deletion protection when inventory exists
- Order module with transactional order creation, cancellation, and query endpoints
- Historical order-item snapshots with product name, SKU, and unit price
- Stock validation and inventory discount during order creation
- Order lifecycle handling with inventory restoration during cancellation
- Validation, `404` handling, and `409` handling for duplicate SKU
- Integration tests for the `product`, `customer`, `inventory`, and `order` modules

## Tech Stack

- Java 21
- Spring Boot 3
- Spring Web
- Spring Data JPA
- Bean Validation
- PostgreSQL
- Maven
- Lombok
- H2 for test profile

## Project Structure

```text
src/main/java/com/alvaro/retail
├── common
│   ├── config
│   ├── controller
│   ├── exception
│   └── util
├── customer
├── inventory
├── order
├── product
│   ├── controller
│   ├── dto
│   ├── entity
│   ├── repository
│   └── service
└── RetailOrderManagementApiApplication.java
```

## Module Rules Snapshot

### Product

- Active products are visible through reads; deleted products are soft-deleted.
- SKU must remain unique.
- Products with inventory cannot be logically deleted.

### Customer

- Active customers are visible through reads; deleted customers are soft-deleted.
- Email must remain unique.

### Inventory

- There is exactly one inventory record per product.
- Inventory can only exist for active products.
- Manual decreases cannot reduce stock below zero.

### Order

- Orders support creation, cancellation, and query in the current phase.
- Orders start in `CREATED` and can transition once to `CANCELLED`.
- `OrderItem` stores snapshot product data so historical orders are not affected by later product edits.
- Order creation requires an active customer, active products, existing inventory, and enough stock.
- Repeated products in separate lines are rejected with `400`.
- Missing inventory or insufficient stock returns `409`.
- Inventory is reduced transactionally during order creation.
- Cancelling an order restores inventory transactionally for every order item.
- Cancelling an already cancelled order returns `409`.
- Orders are listed from newest to oldest.

## API Surface

Current module endpoints:

- `GET /health`
- `POST /products`
- `GET /products`
- `GET /products/{id}`
- `PUT /products/{id}`
- `DELETE /products/{id}`
- `POST /customers`
- `GET /customers`
- `GET /customers/{id}`
- `PUT /customers/{id}`
- `DELETE /customers/{id}`
- `POST /inventories`
- `GET /inventories`
- `GET /inventories/{id}`
- `GET /products/{productId}/inventory`
- `PUT /inventories/{id}`
- `PATCH /inventories/{id}/adjust`
- `POST /orders`
- `POST /orders/{id}/cancel`
- `GET /orders`
- `GET /orders/{id}`

## Agent And Maintainer Guide

For future coding chats, see `AGENTS.md`. It documents:

- architecture and domain conventions
- established business rules per module
- current error semantics
- verification and manual testing expectations
- recommended Codex skill flow for this repository

## Getting Started

### Prerequisites

- JDK 21
- Maven 3.9+
- PostgreSQL 15+ for the `dev` profile

### Environment Variables

The `dev` profile uses PostgreSQL and reads its connection details from environment variables:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=retail_order_management
DB_USERNAME=postgres
DB_PASSWORD=postgres
SERVER_PORT=8080
```

### Run the Application

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

For manual API checks without PostgreSQL, run the application with the `test` profile and include the test classpath so the in-memory H2 driver is available:

```bash
mvn "-Dspring-boot.run.profiles=test" "-Dspring-boot.run.useTestClasspath=true" spring-boot:run
```

If you run the packaged jar, use the `dev` profile. The `test` profile is intended for automated tests and local manual checks through Maven.

On Windows PowerShell, `curl` is usually an alias for `Invoke-WebRequest`, not the Unix `curl` CLI. That means flags such as `-X`, `-H`, and `-d` will not behave the same way unless you call `curl.exe` explicitly. For PowerShell-first smoke tests, prefer `Invoke-WebRequest` with `-Method`, `-ContentType`, and `-Body`.

Base URL:

```text
http://localhost:8080/api/v1
```

Technical health endpoint:

```text
GET /api/v1/health
```

### Run the Tests

```bash
mvn clean verify
```

The test profile uses an isolated in-memory H2 database so the build can be validated without a local PostgreSQL instance.

Useful focused test commands:

```bash
mvn test -Dtest=ProductControllerIntegrationTest
mvn test -Dtest=CustomerControllerIntegrationTest
mvn test -Dtest=InventoryControllerIntegrationTest
mvn test -Dtest=OrderControllerIntegrationTest
```

### Manual API Smoke Test

Phase 1 and Phase 2 manual validation can be done with the following sequence after the app is running.

Product flow:

```bash
curl -X POST http://localhost:8080/api/v1/products \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Mouse\",\"description\":\"Compact mouse\",\"price\":29.99,\"sku\":\"MOU-100\"}"

curl http://localhost:8080/api/v1/products
curl http://localhost:8080/api/v1/products/1

curl -X PUT http://localhost:8080/api/v1/products/1 \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Mouse Pro\",\"description\":\"Updated\",\"price\":39.99,\"sku\":\"MOU-101\"}"

curl -X DELETE http://localhost:8080/api/v1/products/1
```

Customer flow in PowerShell:

```powershell
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/health"

Invoke-WebRequest `
  -Uri "http://localhost:8080/api/v1/customers" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"firstName":"Ana","lastName":"Garcia","email":"ana@example.com","phone":"+34 600 000 001"}'

Invoke-WebRequest -Uri "http://localhost:8080/api/v1/customers"
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/customers/1"

Invoke-WebRequest `
  -Uri "http://localhost:8080/api/v1/customers/1" `
  -Method PUT `
  -ContentType "application/json" `
  -Body '{"firstName":"Ana Updated","lastName":"Garcia","email":"ana.updated@example.com"}'

Invoke-WebRequest `
  -Uri "http://localhost:8080/api/v1/customers/1" `
  -Method DELETE
```

Expected error checks for the customer flow:

```powershell
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/customers/1"

Invoke-WebRequest `
  -Uri "http://localhost:8080/api/v1/customers" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"firstName":"Otro","lastName":"User","email":"ana.updated@example.com"}'

Invoke-WebRequest `
  -Uri "http://localhost:8080/api/v1/customers" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"firstName":"","email":"not-valid"}'
```

In PowerShell, the last three commands are expected to raise an exception because the API returns `404`, `409`, and `400` respectively. That is still a successful manual validation of the endpoint behavior.

Inventory flow in PowerShell:

```powershell
Invoke-WebRequest `
  -Uri "http://localhost:8080/api/v1/products" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"Monitor","description":"27 inch monitor","price":199.99,"sku":"MON-200"}'

Invoke-WebRequest `
  -Uri "http://localhost:8080/api/v1/inventories" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"productId":1,"quantityAvailable":15,"minimumStock":3}'

Invoke-WebRequest -Uri "http://localhost:8080/api/v1/inventories"
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/inventories/1"
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/products/1/inventory"

Invoke-WebRequest `
  -Uri "http://localhost:8080/api/v1/inventories/1" `
  -Method PUT `
  -ContentType "application/json" `
  -Body '{"minimumStock":5}'

Invoke-WebRequest `
  -Uri "http://localhost:8080/api/v1/inventories/1/adjust" `
  -Method PATCH `
  -ContentType "application/json" `
  -Body '{"type":"INCREASE","quantity":4}'

Invoke-WebRequest `
  -Uri "http://localhost:8080/api/v1/inventories/1/adjust" `
  -Method PATCH `
  -ContentType "application/json" `
  -Body '{"type":"DECREASE","quantity":30}'

Invoke-WebRequest `
  -Uri "http://localhost:8080/api/v1/products/1" `
  -Method DELETE
```

In PowerShell, the last two commands are expected to raise an exception because the API returns `409` for a negative-stock adjustment attempt and for deleting a product that still has inventory. That is still a successful manual validation of the endpoint behavior.

Order flow in PowerShell:

```powershell
Invoke-WebRequest `
  -Uri "http://localhost:8080/api/v1/customers" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"firstName":"Ana","lastName":"Garcia","email":"ana.orders@example.com"}'

Invoke-WebRequest `
  -Uri "http://localhost:8080/api/v1/products" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"Wireless Mouse","description":"Compact mouse","price":29.99,"sku":"WM-100"}'

Invoke-WebRequest `
  -Uri "http://localhost:8080/api/v1/inventories" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"productId":1,"quantityAvailable":10,"minimumStock":2}'

Invoke-WebRequest `
  -Uri "http://localhost:8080/api/v1/orders" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"customerId":1,"items":[{"productId":1,"quantity":3}]}'

Invoke-WebRequest -Uri "http://localhost:8080/api/v1/orders"
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/orders/1"
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/products/1/inventory"

Invoke-WebRequest `
  -Uri "http://localhost:8080/api/v1/orders/1/cancel" `
  -Method POST `
  -ContentType "application/json"

Invoke-WebRequest -Uri "http://localhost:8080/api/v1/orders/1"
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/products/1/inventory"

Invoke-WebRequest `
  -Uri "http://localhost:8080/api/v1/orders/1/cancel" `
  -Method POST `
  -ContentType "application/json"

Invoke-WebRequest `
  -Uri "http://localhost:8080/api/v1/orders/999/cancel" `
  -Method POST `
  -ContentType "application/json"
```

In PowerShell, the last two commands are expected to raise an exception because the API returns `409` for cancelling an already cancelled order and `404` for cancelling an order that does not exist. That is still a successful manual validation of the endpoint behavior.

## Error Semantics

The API currently follows these rules:

- `400` for request validation failures and invalid business-rule input
- `404` for missing or inactive resources
- `409` for duplicate resources and stock-related business conflicts

Error payloads are returned as RFC 9457 `ProblemDetail` responses with a `path` property.

## Configuration Notes

- Development profile uses `ddl-auto=update` to keep local iteration simple.
- This is a temporary Phase 0 choice and will be replaced by Flyway-based migrations in a later phase.
- Backend timestamps are standardized to UTC.
- JSON date serialization is configured to use ISO-8601 rather than numeric timestamps.
- Future entities should use `Long` identifiers and audit fields such as `createdAt` and `updatedAt`.
- Future table naming should follow `snake_case` with plural table names.

## Roadmap

### MVP

1. Phase 0: project bootstrap
2. Phase 1: product catalog
3. Phase 2: customers
4. Phase 3: inventory
5. Phase 4: orders
6. Phase 5: order lifecycle cancellation
7. Phase 6: OpenAPI and Swagger

### Portfolio Version

8. Spring Security + JWT
9. Unit and integration testing
10. Docker
11. GitHub Actions CI

### Advanced Evolution

12. Domain events
13. Stronger hexagonal boundaries
14. Microservice extraction if justified

## Suggested Commit Plan

1. `chore: initialize Spring Boot project structure`
2. `chore: configure application profiles and PostgreSQL settings`
3. `docs: add initial README with roadmap and setup instructions`
4. `chore: add base module package structure`

## Working Rules

- Work in small increments, one feature or subtask at a time.
- Create a dedicated branch for each task or phase before making changes.
- Prefer a dedicated worktree for feature work when the main workspace has unrelated local changes.
- Keep commits focused and small enough to explain clearly.
- Run automated validation before closing a task, at minimum `mvn clean verify`.
- Perform manual testing when the change affects application behavior or HTTP flows.
- Do not merge a branch until both automated checks and manual verification are done.
- Prefer documenting important decisions in Markdown as the project evolves.
- Push the feature branch first and keep it even after updating `main` unless there is an explicit request to delete it.

## Immediate Next Step

Phase 6 should add OpenAPI and Swagger documentation after the order lifecycle module:

- domain-based package structure
- DTO-driven REST API
- validation and clean error handling
- automated validation with `mvn clean verify`
- visible manual API verification before closing the phase
