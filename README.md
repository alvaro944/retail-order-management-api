# Retail Order Management API

Backend API for managing products, customers, inventory, and orders in a retail environment. The project is designed as a clean modular monolith with a phased roadmap, making it suitable both for learning and as a strong backend portfolio piece.

## Current Status

Phase 3 is implemented:

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
- Validation, `404` handling, and `409` handling for duplicate SKU
- Integration tests for the `product`, `customer`, and `inventory` modules

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
6. Phase 5: global exception handling
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
- Keep commits focused and small enough to explain clearly.
- Run automated validation before closing a task, at minimum `mvn clean verify`.
- Perform manual testing when the change affects application behavior or HTTP flows.
- Do not merge a branch until both automated checks and manual verification are done.
- Prefer documenting important decisions in Markdown as the project evolves.

## Immediate Next Step

Phase 4 should implement the `order` module following the same approach used in the previous phases:

- domain-based package structure
- DTO-driven REST API
- validation and clean error handling
- automated validation with `mvn clean verify`
- visible manual API verification before closing the phase
